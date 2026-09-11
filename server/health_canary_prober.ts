/**
 * CIVER APP STORE — CONTINUOUS SYSTEM HEALTH CANARY PROBER
 * 
 * Sonda sintética activa que verifica empíricamente los 6 pilares operativos
 * del ecosistema Civer App Store en tiempo real, sin simulaciones ni mocks.
 */

import { APPS_CATALOG } from '../src/data/appsCatalogData';
import { fetchGitHubApi, DEFAULT_REPO_OWNER, DEFAULT_REPO_NAME } from '../src/services/githubCiService';

export interface CanaryProbeResult {
  pilar: string;
  nombre: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  latencyMs: number;
  detalle: string;
  timestamp: string;
}

export async function runFullCanaryProbes(): Promise<CanaryProbeResult[]> {
  const results: CanaryProbeResult[] = [];
  const now = new Date().toISOString();

  // 1. Sonda de Borde Cloudflare Edge (Web Principal)
  const tStartWeb = Date.now();
  try {
    const res = await fetch('https://appstore.civer.cloud/', { method: 'GET', headers: { 'User-Agent': 'Civer-Canary-Sentinel/1.0' } });
    const text = await res.text();
    const isOk = res.status === 200 && text.includes('Civer App Store');
    results.push({
      pilar: 'PILAR-1',
      nombre: 'Borde Global Cloudflare Edge',
      status: isOk ? 'HEALTHY' : 'DEGRADED',
      latencyMs: Date.now() - tStartWeb,
      detalle: `HTTP ${res.status} • Content-Length: ${text.length} bytes • Título verificado: ${isOk}`,
      timestamp: now
    });
  } catch (err: any) {
    results.push({
      pilar: 'PILAR-1',
      nombre: 'Borde Global Cloudflare Edge',
      status: 'FAILED',
      latencyMs: Date.now() - tStartWeb,
      detalle: `Error de red: ${err.message}`,
      timestamp: now
    });
  }

  // 2. Sonda de Motor OTA (Manifiesto JSON)
  const tStartOta = Date.now();
  try {
    const res = await fetch('https://appstore.civer.cloud/api/v1/ota/manifest.json');
    if (res.status === 200) {
      const data = await res.json();
      const hasRelease = data.releases && data.releases['civer-app-store'];
      const sha = hasRelease ? data.releases['civer-app-store'].sha256Checksum : '';
      results.push({
        pilar: 'PILAR-2',
        nombre: 'Motor Inalámbrico de Actualizaciones OTA',
        status: hasRelease && sha ? 'HEALTHY' : 'DEGRADED',
        latencyMs: Date.now() - tStartOta,
        detalle: `Versión: ${hasRelease?.versionName || 'N/A'} • SHA-256: ${sha?.substring(0, 16)}...`,
        timestamp: now
      });
    } else {
      results.push({
        pilar: 'PILAR-2',
        nombre: 'Motor Inalámbrico de Actualizaciones OTA',
        status: 'DEGRADED',
        latencyMs: Date.now() - tStartOta,
        detalle: `HTTP ${res.status}`,
        timestamp: now
      });
    }
  } catch (err: any) {
    results.push({
      pilar: 'PILAR-2',
      nombre: 'Motor Inalámbrico de Actualizaciones OTA',
      status: 'FAILED',
      latencyMs: Date.now() - tStartOta,
      detalle: `Error al consultar manifiesto: ${err.message}`,
      timestamp: now
    });
  }

  // 3. Sonda de Descarga de Binario APK Oficial
  const tStartApk = Date.now();
  try {
    const res = await fetch('https://appstore.civer.cloud/downloads/com.civer.appstore-v1.0.4-release.apk', { method: 'HEAD' });
    const cLen = Number(res.headers.get('content-length') || 0);
    const isOk = res.status === 200 && cLen > 20000000;
    results.push({
      pilar: 'PILAR-3',
      nombre: 'Bóveda de Binarios APK (Esquema v2+v3+v4)',
      status: isOk ? 'HEALTHY' : 'DEGRADED',
      latencyMs: Date.now() - tStartApk,
      detalle: `HTTP ${res.status} • Tamaño: ${(cLen / 1048576).toFixed(2)} MB (${cLen} bytes)`,
      timestamp: now
    });
  } catch (err: any) {
    results.push({
      pilar: 'PILAR-3',
      nombre: 'Bóveda de Binarios APK (Esquema v2+v3+v4)',
      status: 'FAILED',
      latencyMs: Date.now() - tStartApk,
      detalle: `Error HEAD APK: ${err.message}`,
      timestamp: now
    });
  }

  // 4. Sonda de Compilador Cloud GitHub Actions
  const tStartGh = Date.now();
  try {
    const res = await fetchGitHubApi(`https://api.github.com/repos/${DEFAULT_REPO_OWNER}/${DEFAULT_REPO_NAME}/actions/workflows/build-apk.yml`);
    const isOk = res.status === 200;
    const data = isOk ? await res.json() : null;
    results.push({
      pilar: 'PILAR-4',
      nombre: 'Compilador Cloud GitHub Actions Runner',
      status: isOk ? 'HEALTHY' : 'DEGRADED',
      latencyMs: Date.now() - tStartGh,
      detalle: isOk ? `Workflow build-apk.yml activo (${data?.name || 'Build Release APK'}) • Estado: ${data?.state || 'active'}` : `HTTP ${res.status}`,
      timestamp: now
    });
  } catch (err: any) {
    results.push({
      pilar: 'PILAR-4',
      nombre: 'Compilador Cloud GitHub Actions Runner',
      status: 'FAILED',
      latencyMs: Date.now() - tStartGh,
      detalle: `Error API GitHub: ${err.message}`,
      timestamp: now
    });
  }

  // 5. Sonda de Integridad de Catálogo y Tríada de IA
  const tStartCat = Date.now();
  const omniRouteApp = APPS_CATALOG.find(a => a.id === 'omniroute');
  const dshApp = APPS_CATALOG.find(a => a.id === 'deepseek-harness');
  const openClawApp = APPS_CATALOG.find(a => a.id === 'openclaw');
  const allPresent = !!(omniRouteApp && dshApp && openClawApp);
  results.push({
    pilar: 'PILAR-5',
    nombre: 'Integridad del Catálogo FOSS & Tríada IA',
    status: allPresent ? 'HEALTHY' : 'DEGRADED',
    latencyMs: Date.now() - tStartCat,
    detalle: `Total apps: ${APPS_CATALOG.length} • Tríada IA activa: OmniRoute (${omniRouteApp ? 'OK' : 'FAIL'}), DeepSeek (${dshApp ? 'OK' : 'FAIL'}), OpenClaw (${openClawApp ? 'OK' : 'FAIL'})`,
    timestamp: now
  });

  // 6. Sonda del Bot de Notificación y Entrega de Telegram
  const tStartTg = Date.now();
  const botToken = '8757193329:AAHOJtoR4E37xvl2_RP80STqutAqtbATqY4';
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    const isOk = data.ok === true;
    results.push({
      pilar: 'PILAR-6',
      nombre: 'Canal de Notificación & Despacho Telegram',
      status: isOk ? 'HEALTHY' : 'DEGRADED',
      latencyMs: Date.now() - tStartTg,
      detalle: isOk ? `Bot activo: @${data.result.username}` : `Error Telegram: ${JSON.stringify(data)}`,
      timestamp: now
    });
  } catch (err: any) {
    results.push({
      pilar: 'PILAR-6',
      nombre: 'Canal de Notificación & Despacho Telegram',
      status: 'FAILED',
      latencyMs: Date.now() - tStartTg,
      detalle: `Error conexión Telegram: ${err.message}`,
      timestamp: now
    });
  }

  return results;
}

// Ejecución autónoma si se corre como script
if (process.argv[1]?.includes('health_canary_prober')) {
  console.log('======================================================================');
  console.log('🔍 INICIANDO SONDA CANARIO DE SALUD CIVER APP STORE (TIEMPO REAL)');
  console.log('======================================================================\n');
  runFullCanaryProbes().then(results => {
    results.forEach(r => {
      const icon = r.status === 'HEALTHY' ? '✅' : r.status === 'DEGRADED' ? '⚠️' : '❌';
      console.log(`${icon} [${r.pilar}] ${r.nombre} (${r.latencyMs}ms)`);
      console.log(`    Estado: ${r.status} | ${r.detalle}`);
    });
    console.log('\n======================================================================');
    const allHealthy = results.every(r => r.status === 'HEALTHY');
    console.log(allHealthy ? '🎉 TODOS LOS PILARES SE ENCUENTRAN 100% OPERATIVOS' : '⚠️ ATENCIÓN: ALGUNOS PILARES REQUIEREN AUTO-SANACIÓN');
    console.log('======================================================================\n');
  }).catch(err => {
    console.error('Error fatal al ejecutar sonda canario:', err);
  });
}
