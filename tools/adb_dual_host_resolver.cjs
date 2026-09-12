/**
 * tools/adb_dual_host_resolver.cjs
 * Módulo de Resolución Adaptativa Dual-Host para Samsung Galaxy A06 (SM-A065M)
 *
 * Prioridad de Detección:
 * 1. Conexión USB Directa en Laptop ASUS (C:/tools/platform-tools/adb.exe) -> Ultra baja latencia.
 * 2. Conexión Remota en Laptop ThinkPad T480s vía SSH (Usuario@100.96.218.12) -> Redundancia de Malla.
 * 3. Auto-Reparación y reinicio del servidor ADB ante estados offline o cuelgues.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const LOCAL_ADB_PATH = 'C:/tools/platform-tools/adb.exe';
const THINKPAD_HOST = 'Usuario@100.96.218.12';
const SSH_KEY = 'C:/Users/asus/.ssh/id_rsa_antigravity';
const TARGET_SERIAL = 'R8YY500R7ZB';

function checkLocalAdb() {
  if (!fs.existsSync(LOCAL_ADB_PATH)) {
    return { available: false, online: false };
  }
  try {
    const res = spawnSync(LOCAL_ADB_PATH, ['devices'], { encoding: 'utf8', timeout: 12000 });
    if (res.status === 0 && res.stdout) {
      const matchRegex = new RegExp(TARGET_SERIAL + '\\s+device');
      if (matchRegex.test(res.stdout)) {
        return { available: true, online: true, host: 'ASUS_LOCAL', serial: TARGET_SERIAL };
      }
    }
  } catch (_) {}
  return { available: true, online: false };
}

function checkThinkpadAdb() {
  try {
    const res = spawnSync('ssh', [
      '-i', SSH_KEY,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ConnectTimeout=5',
      '-o', 'BatchMode=yes',
      THINKPAD_HOST,
      'adb devices'
    ], { encoding: 'utf8', timeout: 12000 });

    if (res.status === 0 && res.stdout) {
      const matchRegex = new RegExp(TARGET_SERIAL + '\\s+device');
      if (matchRegex.test(res.stdout)) {
        return { available: true, online: true, host: 'THINKPAD_SSH', serial: TARGET_SERIAL };
      }
    }
  } catch (_) {}
  return { available: false, online: false };
}

function resolveActiveAdb() {
  // 1. Prioridad: ASUS Local
  const local = checkLocalAdb();
  if (local.online) {
    return {
      host: 'ASUS_LOCAL',
      mode: 'LOCAL_USB',
      serial: TARGET_SERIAL,
      adbExec: LOCAL_ADB_PATH
    };
  }

  // 2. Fallback: ThinkPad T480s SSH
  const remote = checkThinkpadAdb();
  if (remote.online) {
    return {
      host: 'THINKPAD_SSH',
      mode: 'REMOTE_SSH',
      serial: TARGET_SERIAL,
      thinkpadHost: THINKPAD_HOST,
      sshKey: SSH_KEY
    };
  }

  // 3. Si ninguno responde online, intentar restart en local primero
  try {
    spawnSync(LOCAL_ADB_PATH, ['kill-server'], { timeout: 3000 });
    spawnSync(LOCAL_ADB_PATH, ['start-server'], { timeout: 5000 });
    const retryLocal = checkLocalAdb();
    if (retryLocal.online) {
      return {
        host: 'ASUS_LOCAL',
        mode: 'LOCAL_USB',
        serial: TARGET_SERIAL,
        adbExec: LOCAL_ADB_PATH
      };
    }
  } catch (_) {}

  return {
    host: 'NONE',
    mode: 'OFFLINE',
    serial: TARGET_SERIAL
  };
}

function executeAdbCommand(targetConfig, adbArgs, timeoutMs = 20000) {
  if (targetConfig.mode === 'LOCAL_USB') {
    const fullArgs = ['-s', targetConfig.serial, ...adbArgs];
    const res = spawnSync(targetConfig.adbExec, fullArgs, { encoding: 'utf8', timeout: timeoutMs });
    return {
      status: res.status,
      stdout: res.stdout || '',
      stderr: res.stderr || '',
      ok: res.status === 0
    };
  } else if (targetConfig.mode === 'REMOTE_SSH') {
    const adbCmd = `adb -s ${targetConfig.serial} ${adbArgs.map(a => '"' + a.replace(/"/g, '\\"') + '"').join(' ')}`;
    const res = spawnSync('ssh', [
      '-i', targetConfig.sshKey,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ConnectTimeout=10',
      targetConfig.thinkpadHost,
      adbCmd
    ], { encoding: 'utf8', timeout: timeoutMs + 5000 });
    return {
      status: res.status,
      stdout: res.stdout || '',
      stderr: res.stderr || '',
      ok: res.status === 0
    };
  }

  return { status: 1, stdout: '', stderr: 'Dispositivo offline en ASUS y ThinkPad', ok: false };
}

function installApkToDevice(targetConfig, localApkPath, timeoutMs = 120000) {
  if (targetConfig.mode === 'LOCAL_USB') {
    const res = spawnSync(targetConfig.adbExec, [
      '-s', targetConfig.serial,
      'install', '-r',
      localApkPath
    ], { encoding: 'utf8', timeout: timeoutMs });
    return {
      status: res.status,
      stdout: res.stdout || '',
      stderr: res.stderr || '',
      ok: res.status === 0 && (res.stdout.includes('Success') || !res.stderr)
    };
  } else if (targetConfig.mode === 'REMOTE_SSH') {
    const remoteApk = `C:/Users/Usuario/Desktop/civer_temp_${path.basename(localApkPath)}`;
    const scpRes = spawnSync('scp', [
      '-i', targetConfig.sshKey,
      '-o', 'StrictHostKeyChecking=no',
      localApkPath,
      `${targetConfig.thinkpadHost}:${remoteApk}`
    ], { encoding: 'utf8', timeout: 60000 });

    if (scpRes.status !== 0) {
      return { status: scpRes.status, stdout: '', stderr: scpRes.stderr || 'Fallo SCP', ok: false };
    }

    const installRes = spawnSync('ssh', [
      '-i', targetConfig.sshKey,
      '-o', 'StrictHostKeyChecking=no',
      targetConfig.thinkpadHost,
      `adb -s ${targetConfig.serial} install -r "${remoteApk}"`
    ], { encoding: 'utf8', timeout: timeoutMs });

    return {
      status: installRes.status,
      stdout: installRes.stdout || '',
      ok: installRes.status === 0 && (installRes.stdout.includes('Success') || !installRes.stderr)
    };
  }

  return { status: 1, stdout: '', stderr: 'Dispositivo no alcanzable', ok: false };
}

function pullFile(targetConfig, remoteDevicePath, localDestPath, timeoutMs = 30000) {
  if (targetConfig.mode === 'LOCAL_USB') {
    const res = spawnSync(targetConfig.adbExec, [
      '-s', targetConfig.serial,
      'pull', remoteDevicePath, localDestPath
    ], { encoding: 'utf8', timeout: timeoutMs });
    return {
      status: res.status,
      stdout: res.stdout || '',
      stderr: res.stderr || '',
      ok: res.status === 0 && fs.existsSync(localDestPath)
    };
  } else if (targetConfig.mode === 'REMOTE_SSH') {
    const remoteTemp = `C:/Users/Usuario/Desktop/civer_temp_${Date.now()}_${path.basename(remoteDevicePath)}`;
    const pullRemote = spawnSync('ssh', [
      '-i', targetConfig.sshKey,
      '-o', 'StrictHostKeyChecking=no',
      targetConfig.thinkpadHost,
      `adb -s ${targetConfig.serial} pull "${remoteDevicePath}" "${remoteTemp}"`
    ], { encoding: 'utf8', timeout: timeoutMs });

    if (pullRemote.status !== 0) {
      return { status: pullRemote.status, stdout: '', stderr: pullRemote.stderr, ok: false };
    }

    const scpRes = spawnSync('scp', [
      '-i', targetConfig.sshKey,
      '-o', 'StrictHostKeyChecking=no',
      `${targetConfig.thinkpadHost}:${remoteTemp}`,
      localDestPath
    ], { encoding: 'utf8', timeout: timeoutMs });

    spawnSync('ssh', [
      '-i', targetConfig.sshKey,
      '-o', 'StrictHostKeyChecking=no',
      targetConfig.thinkpadHost,
      `del "${remoteTemp}"`
    ], { timeout: 5000 });

    return {
      status: scpRes.status,
      stdout: scpRes.stdout || '',
      stderr: scpRes.stderr || '',
      ok: scpRes.status === 0 && fs.existsSync(localDestPath)
    };
  }
  return { status: 1, stdout: '', stderr: 'Dispositivo offline', ok: false };
}

function captureScreenshot(targetConfig, localDestPath, timeoutMs = 30000) {
  const remoteCap = '/sdcard/civer_auto_cap.png';
  const capRes = executeAdbCommand(targetConfig, ['shell', 'screencap', '-p', remoteCap], 15000);
  if (!capRes.ok) {
    return { ok: false, error: 'SCREENCAP_FAILED', details: capRes.stderr || capRes.stdout };
  }

  const pullRes = pullFile(targetConfig, remoteCap, localDestPath, timeoutMs);
  executeAdbCommand(targetConfig, ['shell', 'rm', remoteCap], 5000);

  return {
    ok: pullRes.ok,
    localDestPath,
    error: pullRes.ok ? null : pullRes.stderr
  };
}

module.exports = {
  LOCAL_ADB_PATH,
  THINKPAD_HOST,
  TARGET_SERIAL,
  checkLocalAdb,
  checkThinkpadAdb,
  resolveActiveAdb,
  executeAdbCommand,
  installApkToDevice,
  pullFile,
  captureScreenshot
};
