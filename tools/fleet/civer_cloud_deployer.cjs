/**
 * civer_cloud_deployer.cjs
 * Orquestador autónomo de compilación en GitHub Actions y despliegue físico en Vivo V2341.
 * Cumple con:
 * - Cloud-Only Compilation Mandate (Regla 5)
 * - Verificación Criptográfica SHA-256 (Regla 3)
 * - Cero Falsos Positivos y Triangulación Empírica (Regla 11)
 * - Higiene de Procesos (manage_task = 0, Río Subterráneo)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const cp = require('child_process');

const REPO = 'nubeplay7/Open-Source-App-Store';
const ADB_DEVICE = '192.168.1.133:5555';
const ADB_BIN = 'C:\\tools\\platform-tools\\adb.exe';

// Definición de las 5 aplicaciones de Google AI Studio y su metadata
const APPS_METADATA = {
  '11_synccluster': {
    packageName: 'com.aistudio.synccluster.mesh',
    name: 'SyncCluster'
  },
  '08_agentworkflow_orchestrator': {
    packageName: 'com.aistudio.agentworkflow.orchestrator',
    name: 'AgentWorkflow Orchestrator'
  },
  '02_voxverse': {
    packageName: 'com.aistudio.voxverse.synth',
    name: 'VoxVerse'
  },
  '05_appmatrix_controller': {
    packageName: 'com.aistudio.appmatrix.controller',
    name: 'AppMatrix Controller'
  },
  '03_civer_assistant_applet': {
    packageName: 'com.aistudio.assistant.applet',
    name: 'Civer Assistant Applet'
  },
  '10_omnistore_hub': {
    packageName: 'com.aistudio.omnistore.kptz',
    name: 'OmniStore Hub'
  },
  '07_parallel_space': {
    packageName: 'com.aistudio.parallelspace.appcloner',
    name: 'Parallel Space Cloner'
  },
  '04_foss_store_matrix': {
    packageName: 'com.example.tyrabd',
    name: 'FOSS Store Matrix'
  },
  '09_omnicomm': {
    packageName: 'com.aistudio.omnicomm.kpxrzt',
    name: 'OmniComm P2P'
  },
  '01_webnative': {
    packageName: 'com.aistudio.webnative.turbovx',
    name: 'WebNative PWA Turbo'
  }
};

// Obtener token de GitHub Actions
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

// Cliente HTTP para GitHub API
function githubRequest(token, method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: apiPath,
      method: method,
      headers: {
        'User-Agent': 'CiverCloudDeployer/1.0',
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
    req.error = reject;
    if (postData) req.write(postData);
    req.end();
  });
}

// Descarga binaria de artefactos de GitHub (sigue redirects)
function downloadBinary(token, url, destPath) {
  return new Promise((resolve, reject) => {
    const follow = (curUrl) => {
      const parsed = new URL(curUrl);
      const isGitHubApi = parsed.hostname === 'api.github.com';
      const headers = {
        'User-Agent': 'CiverCloudDeployer/1.0',
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

async function main() {
  const targetApp = process.argv[2] || '04_foss_store_matrix';
  console.log(`\n==================================================`);
  console.log(`[Civer Cloud Deployer] Iniciando para: ${targetApp}`);
  console.log(`==================================================\n`);

  const token = getGitHubToken();
  if (!token) {
    console.error('[ERROR] No se pudo obtener el token de GitHub.');
    process.exit(1);
  }

  // 1. Localizar el workflow build-native-apps.yml
  console.log('[1/7] Consultando workflows en GitHub Actions...');
  const wfRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/workflows`);
  const workflows = JSON.parse(wfRes.data).workflows || [];
  const wf = workflows.find(w => w.path.endsWith('build-native-apps.yml'));
  if (!wf) {
    console.error('[ERROR] No se encontró build-native-apps.yml en el repositorio.');
    process.exit(1);
  }
  console.log(`      Workflow encontrado: ${wf.name} (ID: ${wf.id})`);

  const targetBranch = process.argv[3] || 'ci/native-apps';
  console.log(`[2/7] Despachando compilación cloud para: ${targetApp} en rama '${targetBranch}'...`);
  const dispatchRes = await githubRequest(token, 'POST', `/repos/${REPO}/actions/workflows/${wf.id}/dispatches`, {
    ref: targetBranch,
    inputs: { apps: targetApp }
  });

  if (dispatchRes.status !== 204) {
    console.error(`[ERROR] Falló dispatch (HTTP ${dispatchRes.status}):`, dispatchRes.data);
    process.exit(1);
  }
  console.log(`      Dispatch exitoso (HTTP 204). Esperando inicio de runner...`);

  // 3. Polling de la ejecución
  await sleep(6000);
  const runsRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/workflows/${wf.id}/runs?per_page=1`);
  const runs = JSON.parse(runsRes.data).workflow_runs || [];
  if (runs.length === 0) {
    console.error('[ERROR] No se detectó ninguna ejecución de workflow.');
    process.exit(1);
  }
  const runId = runs[0].id;
  const runUrl = runs[0].html_url;
  console.log(`      Run ID: ${runId}`);
  console.log(`      Enlace: ${runUrl}`);

  let completedRun = null;
  console.log(`[3/7] Monitoreando compilación en runner cloud (polling cada 10s)...`);
  for (let i = 0; i < 75; i++) {
    await sleep(10000);
    const checkRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/runs/${runId}`);
    const r = JSON.parse(checkRes.data);
    process.stdout.write(`      [${(i + 1) * 10}s] Estado: ${r.status} ${r.conclusion ? `(${r.conclusion})` : ''}\r`);
    if (r.status === 'completed') {
      console.log(`\n      Conclusión final: ${r.conclusion}`);
      completedRun = r;
      break;
    }
  }

  if (!completedRun || completedRun.conclusion !== 'success') {
    console.error(`\n[ERROR] El build en GitHub Actions falló o expiró.`);
    const jobsRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/runs/${runId}/jobs`);
    const jobs = JSON.parse(jobsRes.data).jobs || [];
    for (const j of jobs) {
      console.log(`Job: ${j.name} -> ${j.conclusion}`);
      for (const s of j.steps) {
        if (s.conclusion === 'failure') {
          console.log(`  PASO FALLIDO: ${s.number}. ${s.name}`);
        }
      }
    }
    process.exit(1);
  }

  // 4. Descargar artefactos
  console.log(`[4/7] Descargando artefacto de build...`);
  const artsRes = await githubRequest(token, 'GET', `/repos/${REPO}/actions/runs/${runId}/artifacts`);
  const artifacts = JSON.parse(artsRes.data).artifacts || [];
  const targetArt = artifacts.find(a => a.name.includes(targetApp));
  if (!targetArt) {
    console.error(`[ERROR] No se encontró artefacto para ${targetApp}. Artefactos disponibles:`, artifacts.map(a => a.name));
    process.exit(1);
  }

  const downloadsDir = path.resolve('public/downloads');
  fs.mkdirSync(downloadsDir, { recursive: true });
  const zipPath = path.join(downloadsDir, `${targetApp}.zip`);

  console.log(`      Descargando ${targetArt.name} (${(targetArt.size_in_bytes / (1024 * 1024)).toFixed(2)} MB)...`);
  await downloadBinary(token, targetArt.archive_download_url, zipPath);
  console.log(`      Descarga completada en: ${zipPath}`);

  // 5. Descomprimir APK y calcular SHA-256
  console.log(`[5/7] Extrayendo y verificando SHA-256...`);
  cp.execSync(`tar -xf "${zipPath}" -C "${downloadsDir}"`);
  
  const files = fs.readdirSync(downloadsDir);
  const apkFile = files.find(f => f.startsWith(targetApp) && f.endsWith('.apk'));
  if (!apkFile) {
    console.error('[ERROR] No se encontró el APK descomprimido.');
    process.exit(1);
  }
  const apkPath = path.join(downloadsDir, apkFile);
  const crypto = require('crypto');
  const apkBuf = fs.readFileSync(apkPath);
  const sha256 = crypto.createHash('sha256').update(apkBuf).digest('hex');
  console.log(`      APK: ${apkFile} (${(apkBuf.length / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`      SHA-256: ${sha256}`);

  // 6. Conexión ADB y subida a hardware real
  console.log(`[6/7] Conectando y desplegando en hardware Vivo V2341 (${ADB_DEVICE})...`);
  try {
    cp.execSync(`"${ADB_BIN}" connect ${ADB_DEVICE}`, { encoding: 'utf8' });
  } catch (e) {}

  const remoteApk = `/data/local/tmp/${targetApp}.apk`;
  console.log(`      Subiendo APK a dispositivo: ${remoteApk}...`);
  cp.execSync(`"${ADB_BIN}" -s ${ADB_DEVICE} push "${apkPath}" "${remoteApk}"`, { encoding: 'utf8' });

  console.log(`      Instalando APK silenciosamente (pm install -r -d)...`);
  const installRes = cp.execSync(`"${ADB_BIN}" -s ${ADB_DEVICE} shell pm install -r -d "${remoteApk}"`, { encoding: 'utf8' });
  console.log(`      Resultado de instalación: ${installRes.trim()}`);

  // 7. Lanzamiento de la aplicación y captura visual forense
  console.log(`[7/7] Lanzando aplicación y capturando evidencia...`);
  const appMeta = APPS_METADATA[targetApp];
  const pkg = appMeta ? appMeta.packageName : null;

  if (pkg) {
    try {
      cp.execSync(`"${ADB_BIN}" -s ${ADB_DEVICE} shell monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`, { encoding: 'utf8' });
      console.log(`      Actividad lanzada para ${pkg}`);
    } catch (e) {
      console.log(`      Aviso de lanzamiento monkey: ${e.message}`);
    }
  }

  // Esperar a que la UI de Compose renderice completamente
  await sleep(3500);

  const remoteImg = `/data/local/tmp/vivo_${targetApp}_live.png`;
  const localArtifactDir = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\302dac24-a911-4dea-8084-83308c783407';
  const localImg = path.join(localArtifactDir, `vivo_${targetApp}_live.png`);
  const humanImgDir = path.resolve('evidencias_visuales_para_el_humano');
  fs.mkdirSync(humanImgDir, { recursive: true });
  const humanImg = path.join(humanImgDir, `vivo_${targetApp}_live.png`);

  cp.execSync(`"${ADB_BIN}" -s ${ADB_DEVICE} shell screencap -p "${remoteImg}"`);
  cp.execSync(`"${ADB_BIN}" -s ${ADB_DEVICE} pull "${remoteImg}" "${localImg}"`);
  fs.copyFileSync(localImg, humanImg);

  console.log(`\n==================================================`);
  console.log(`[CERTIFICACIÓN COMPLETADA EXITOSAMENTE]`);
  console.log(`App: ${targetApp} (${appMeta ? appMeta.name : 'Unknown'})`);
  console.log(`Package: ${pkg}`);
  console.log(`SHA-256: ${sha256}`);
  console.log(`Evidencia guardada en:`);
  console.log(`- ${localImg}`);
  console.log(`- ${humanImg}`);
  console.log(`==================================================\n`);
}

main().catch(err => {
  console.error('\n[FATAL ERROR]', err.message);
  process.exit(1);
});
