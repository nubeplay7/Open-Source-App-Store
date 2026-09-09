/**
 * tools/check_samsung_live.cjs
 * Verificación en tiempo real del Samsung Galaxy A06
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const THINKPAD_HOST = 'Usuario@100.96.218.12';
const DEVICE_SERIAL = 'R8YY500R7ZB';
const EVIDENCIAS_DIR = path.resolve(__dirname, '..', 'evidencias');
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\254b0209-02cf-4731-ac62-aff5147af710';

function runSsh(cmd, timeoutMs = 45000) {
  const fullCommand = `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${THINKPAD_HOST} "${cmd}"`;
  return execSync(fullCommand, { encoding: 'utf-8', timeout: timeoutMs });
}

function scpFromRemote(remotePath, localPath) {
  const scpCmd = `scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${THINKPAD_HOST}:${remotePath}" "${localPath}"`;
  return execSync(scpCmd, { encoding: 'utf-8', timeout: 45000 });
}

async function run() {
  console.log('--- 1. CONSULTANDO PAQUETES INSTALADOS ---');
  const packagesRaw = runSsh(`adb -s ${DEVICE_SERIAL} shell pm list packages`);
  const relevant = packagesRaw
    .split('\n')
    .map(s => s.trim().replace(/^package:/, ''))
    .filter(p => /civer|turbovx|appstore|spotube|droidify|termux|controldroid|brave|chrome/i.test(p));
  console.log('Paquetes encontrados:', relevant);

  console.log('--- 2. CONSULTANDO ESTADO DE PANTALLA Y BATERÍA ---');
  const battery = runSsh(`adb -s ${DEVICE_SERIAL} shell dumpsys battery`);
  const batteryLevel = (battery.match(/level:\s*(\d+)/i) || [])[1] || 'N/A';
  const batteryStatus = (battery.match(/status:\s*(\d+)/i) || [])[1] || 'N/A';
  console.log(`Batería: Nivel ${batteryLevel}%, Estado ${batteryStatus}`);

  console.log('--- 3. LANZANDO CIVER APP STORE EN PANTALLA ---');
  // Abrir la URL oficial de la appstore
  runSsh(`adb -s ${DEVICE_SERIAL} shell am start -a android.intent.action.VIEW -d https://appstore.civer.cloud/`);
  
  console.log('Esperando 3 segundos para estabilización visual...');
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000);

  console.log('--- 4. CAPTURANDO PANTALLA FÍSICA EN VIVO ---');
  runSsh(`adb -s ${DEVICE_SERIAL} shell screencap -p /sdcard/samsung_live_screen.png`);
  runSsh(`adb -s ${DEVICE_SERIAL} pull /sdcard/samsung_live_screen.png C:\\Users\\Usuario\\samsung_live_screen.png`);

  const localPath = path.join(EVIDENCIAS_DIR, 'samsung_live_screen.png');
  scpFromRemote('C:\\Users\\Usuario\\samsung_live_screen.png', localPath);
  console.log('✅ Screencap guardado en local:', localPath);

  const artifactPath = path.join(ARTIFACT_DIR, 'samsung_live_screen.png');
  fs.copyFileSync(localPath, artifactPath);
  console.log('✅ Screencap copiado a artefactos:', artifactPath);

  console.log('--- 5. FOCO ACTUAL DE VENTANA ---');
  const windowDump = runSsh(`adb -s ${DEVICE_SERIAL} shell dumpsys window`);
  const focusLines = windowDump.split('\n').filter(l => l.includes('mCurrentFocus') || l.includes('mFocusedApp'));
  console.log('Foco actual:\n' + focusLines.join('\n'));

  console.log('--- COMPLETADO EXITOSAMENTE ---');
}

run().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
