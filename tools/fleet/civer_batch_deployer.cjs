/**
 * civer_batch_deployer.cjs
 * Orquestador concurrente de compilación por lotes en GitHub Actions y despliegue físico por ADB.
 * 
 * Capacidades:
 * 1. Despacho paralelo de N aplicaciones a GitHub Actions.
 * 2. Polling unificado no bloqueante de todos los jobs concurrentes.
 * 3. Descarga simultánea de artefactos ZIP y extracción de binarios APK.
 * 4. Certificación criptográfica SHA-256 independiente por cada APK.
 * 5. Despliegue secuencial seguro por ADB en Vivo V2341 (pm install -r -d).
 * 6. Lanzamiento del Intent nativo de cada app y captura live de framebuffer (screencap).
 * 7. Reporte consolidado y persistencia forense.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const cp = require('child_process');
const crypto = require('crypto');

const REPO = 'nubeplay7/Open-Source-App-Store';
const ADB_DEVICE = '192.168.1.133:5555';
const ADB_BIN = 'C:\\tools\\platform-tools\\adb.exe';

function getGitHubToken() {
  try {
    const rootRepo = 'c:/Users/asus/OneDrive - Universidad Veracruzana/Escritorio/Open Source App Store - Civer App Store';
    const remoteUrl = cp.execSync('git remote get-url origin', { cwd: rootRepo, encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/https:\/\/([^@]+)@github\.com/);
    if (match && match[1]) return match[1];
  } catch (e) {}
  
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  return null;
}

function githubRequest(token, method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: apiPath,
      method: method,
      headers: {
        'User-Agent': 'CiverBatchDeployer/1.0',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        ...(postData ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function downloadBinary(token, url, destPath) {
  return new Promise((resolve, reject) => {
    const follow = (curUrl) => {
      const parsed = new URL(curUrl);
      const isGitHubApi = parsed.hostname === 'api.github.com';
      const headers = {
        'User-Agent': 'CiverBatchDeployer/1.0',
        ...(isGitHubApi ? { 'Authorization': `Bearer ${token}` } : {})
      };

      https.get(curUrl, { headers }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} al descargar ${curUrl}`));
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(destPath);
        });
      }).on('error', reject);
    };
    follow(url);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runBatch(appIds, targetBranch = 'ci/native-apps') {
  console.log(`\n===============================================================`);
  console.log(`[Civer Batch Deployer] Iniciando orquestación para ${appIds.length} apps:`);
  console.log(`  Apps: ${appIds.join(', ')}`);
  console.log(`  Rama: ${targetBranch}`);
  console.log(`===============================================================\n`);

  const token = getGitHubToken();
  if (!token) {
    throw new Error('No se pudo obtener el token de GitHub.');
  }

  // 1. Obtener ID del workflow
  console.log('[1/6] Localizando workflow build-native-apps.yml...');
  const wfRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/workflows`);
  const workflows = JSON.parse(wfRes.data).workflows || [];
  const wf = workflows.find(w => w.path.endsWith('build-native-apps.yml'));
  if (!wf) {
    throw new Error('No se encontró build-native-apps.yml en el repositorio.');
  }
  console.log(`      Workflow ID: ${wf.id} (${wf.name})`);

  // 2. Despacho secuenciado con offset para runId limpio
  console.log(`\n[2/6] Despachando compilaciones cloud en GitHub Actions...`);
  const appRuns = [];

  for (const appId of appIds) {
    console.log(`  -> Despachando workflow para: ${appId}...`);
    const beforeRunsRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/workflows/${wf.id}/runs?per_page=5`);
    const beforeRuns = JSON.parse(beforeRunsRes.data).workflow_runs || [];
    const beforeRunIds = new Set(beforeRuns.map(r => r.id));

    const dispatchRes = await githubRequest(token, 'POST', `/repos/${REPO}/actions/workflows/${wf.id}/dispatches`, {
      ref: targetBranch,
      inputs: { apps: appId }
    });

    if (dispatchRes.status !== 204) {
      console.error(`     [ERROR] Falló dispatch para ${appId} (HTTP ${dispatchRes.status}):`, dispatchRes.data);
      continue;
    }

    // Esperar a que el run aparezca
    let matchedRun = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      await sleep(3000);
      const afterRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/workflows/${wf.id}/runs?per_page=5`);
      const afterRuns = JSON.parse(afterRes.data).workflow_runs || [];
      const newRun = afterRuns.find(r => !beforeRunIds.has(r.id));
      if (newRun) {
        matchedRun = newRun;
        break;
      }
    }

    if (!matchedRun) {
      console.warn(`     [AVISO] No se identificó inmediatamente el nuevo run para ${appId}. Se usará el último run.`);
      const latestRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/workflows/${wf.id}/runs?per_page=1`);
      matchedRun = JSON.parse(latestRes.data).workflow_runs[0];
    }

    console.log(`     Asignado: ${appId} -> Run ID: ${matchedRun.id} (${matchedRun.html_url})`);
    appRuns.push({ appId, runId: matchedRun.id, url: matchedRun.html_url, status: 'queued', conclusion: null });
  }

  // 3. Monitoreo concurrente de todos los runs
  console.log(`\n[3/6] Monitoreando compilaciones concurrentes en runners cloud...`);
  const startTime = Date.now();
  let allCompleted = false;

  while (!allCompleted) {
    await sleep(10000);
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    let pendingCount = 0;

    for (const item of appRuns) {
      if (item.status !== 'completed') {
        const checkRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/runs/${item.runId}`);
        const r = JSON.parse(checkRes.data);
        item.status = r.status;
        item.conclusion = r.conclusion;
        if (r.status !== 'completed') pendingCount++;
      }
    }

    const statusLine = appRuns.map(i => `${i.appId}: ${i.status}${i.conclusion ? `(${i.conclusion})` : ''}`).join(' | ');
    process.stdout.write(`  [${elapsedSec}s] Pendientes: ${pendingCount}/${appRuns.length} -> [ ${statusLine} ]\r`);

    if (pendingCount === 0) {
      allCompleted = true;
      console.log(`\n  Todos los runs han concluido tras ${elapsedSec}s.`);
    }

    if (elapsedSec > 900) { // 15 minutos timeout
      console.warn(`\n  [TIMEOUT] Se superó el límite de espera de 15 minutos.`);
      break;
    }
  }

  // 4. Descarga de artefactos y cálculo criptográfico SHA-256
  console.log(`\n[4/6] Descargando artefactos y calculando sumas SHA-256...`);
  const downloadsDir = path.resolve('public/downloads');
  fs.mkdirSync(downloadsDir, { recursive: true });

  const results = [];

  for (const item of appRuns) {
    if (item.conclusion !== 'success') {
      console.error(`  [FALLO] ${item.appId} concluyó con: ${item.conclusion}`);
      results.push({ appId: item.appId, status: 'BUILD_FAILED', conclusion: item.conclusion, runId: item.runId });
      continue;
    }

    console.log(`  Procesando artefacto para: ${item.appId}...`);
    const artsRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/runs/${item.runId}/artifacts`);
    const artifacts = JSON.parse(artsRes.data).artifacts || [];
    const targetArt = artifacts.find(a => a.name.includes(item.appId));

    if (!targetArt) {
      console.error(`    [ERROR] No se encontró artefacto para ${item.appId}.`);
      results.push({ appId: item.appId, status: 'ARTIFACT_MISSING', runId: item.runId });
      continue;
    }

    const zipPath = path.join(downloadsDir, `${item.appId}.zip`);
    await downloadBinary(token, targetArt.archive_download_url, zipPath);
    cp.execSync(`tar -xf "${zipPath}" -C "${downloadsDir}"`);

    const files = fs.readdirSync(downloadsDir);
    const apkFile = files.find(f => f.startsWith(item.appId) && f.endsWith('.apk'));
    if (!apkFile) {
      console.error(`    [ERROR] No se encontró el APK descomprimido para ${item.appId}.`);
      results.push({ appId: item.appId, status: 'APK_NOT_FOUND', runId: item.runId });
      continue;
    }

    const apkPath = path.join(downloadsDir, apkFile);
    const apkBuf = fs.readFileSync(apkPath);
    const sha256 = crypto.createHash('sha256').update(apkBuf).digest('hex');
    const sizeMb = (apkBuf.length / (1024 * 1024)).toFixed(2);

    console.log(`    [OK] APK: ${apkFile} (${sizeMb} MB) | SHA-256: ${sha256}`);
    results.push({
      appId: item.appId,
      status: 'COMPILED_VERIFIED',
      runId: item.runId,
      runUrl: item.url,
      apkFile,
      apkPath,
      sizeMb,
      sha256
    });
  }

  // 5. Despliegue en serie en Vivo V2341 (ADB)
  console.log(`\n[5/6] Desplegando en hardware físico Vivo V2341 (${ADB_DEVICE})...`);
  try {
    cp.execSync(`${ADB_BIN} connect ${ADB_DEVICE}`, { encoding: 'utf8' });
  } catch (e) {}

  const PACKAGE_MAP = {
    '02_voxverse': 'com.aistudio.voxverse.synth',
    '08_agentworkflow_orchestrator': 'com.aistudio.agentworkflow.orchestrator',
    '11_synccluster': 'com.aistudio.synccluster.mesh'
  };

  for (const res of results) {
    if (res.status !== 'COMPILED_VERIFIED') continue;

    console.log(`  -> Instalando ${res.appId} (${res.apkFile})...`);
    try {
      const installOut = cp.execSync(`${ADB_BIN} -s ${ADB_DEVICE} install -r -d "${res.apkPath}"`, { encoding: 'utf8' });
      console.log(`     Resultado ADB: ${installOut.trim()}`);
      res.adbInstalled = installOut.includes('Success');

      const pkg = PACKAGE_MAP[res.appId] || `com.aistudio.${res.appId.replace(/^[0-9]+_/, '')}`;
      res.packageName = pkg;

      // Lanzar
      console.log(`     Iniciando Intent: ${pkg}/com.example.MainActivity...`);
      try {
        cp.execSync(`${ADB_BIN} -s ${ADB_DEVICE} shell am start -n ${pkg}/com.example.MainActivity`, { encoding: 'utf8' });
      } catch (e) {
        cp.execSync(`${ADB_BIN} -s ${ADB_DEVICE} shell monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`, { encoding: 'utf8' });
      }

      await sleep(4000);

      // Captura de pantalla forense del framebuffer
      const screenFile = `vivo_${res.appId}_live.png`;
      const screenPathLocal = path.resolve(screenFile);
      cp.execSync(`${ADB_BIN} -s ${ADB_DEVICE} exec-out screencap -p > "${screenPathLocal}"`, { shell: 'powershell.exe' });
      const stats = fs.statSync(screenPathLocal);
      console.log(`     Evidencia visual capturada: ${screenFile} (${stats.size} bytes)`);
      res.screenshot = screenFile;
      res.screenshotBytes = stats.size;
    } catch (adbErr) {
      console.error(`     [ERROR ADB]: ${adbErr.message}`);
      res.adbInstalled = false;
      res.adbError = adbErr.message;
    }
  }

  // 6. Resumen y certificación final
  console.log(`\n===============================================================`);
  console.log(`[6/6] CERTIFICACIÓN FINAL DEL LOTE`);
  console.log(`===============================================================`);
  console.table(results.map(r => ({
    App: r.appId,
    Estado: r.status,
    'Run ID': r.runId,
    'Tamaño (MB)': r.sizeMb,
    'SHA-256': r.sha256 ? r.sha256.substring(0, 16) + '...' : 'N/A',
    'ADB Install': r.adbInstalled ? 'ÉXITO' : 'FALLO',
    Screenshot: r.screenshot || 'N/A'
  })));

  return results;
}

if (require.main === module) {
  const apps = process.argv.slice(2);
  const branch = process.env.TARGET_BRANCH || 'ci/native-apps';
  const targetApps = apps.length > 0 ? apps : ['02_voxverse', '08_agentworkflow_orchestrator', '11_synccluster'];
  runBatch(targetApps, branch)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[FATAL]', err);
      process.exit(1);
    });
}

module.exports = { runBatch };
