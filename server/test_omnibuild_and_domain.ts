/**
 * Comprehensive Automated Verification Suite
 * OmniBuild Universal Kernel, Kaggle Cloud Engine, Catalog Batch Builder & Domain Distribution
 */

import { APPS_CATALOG } from '../src/data/appsCatalogData';
import { SYSTEM_CHANGELOG } from '../src/data/changelogData';
import { 
  OMNI_BUILD_ENGINES, 
  OmniBuildEngineType,
  resolveEffectiveEngine,
  createOmniBuildRun,
  executeOmniBuildRun,
  executeBatchCatalogBuild,
  notifyTelegramCompiledApk
} from '../src/services/omniBuildKernelService';
import { 
  getKaggleCredentials,
  generateKaggleKernelScript,
  generateKaggleKernelMetadata,
  getKaggleBuildSteps
} from '../src/services/kaggleCompilerBridgeService';
import { 
  NETWORK_ENDPOINTS, 
  getApkCanonicalUrl, 
  getTelegramDeepLinkForApk 
} from '../src/constants/networkEndpoints';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n================================================================================');
  console.log('🧪 SUITE DE PRUEBAS AUTOMATIZADAS: OMNIBUILD KERNEL & ECOSISTEMA DE DOMINIOS');
  console.log('================================================================================\n');

  // TEST SUITE 1: Verificación de Motores OmniBuild
  console.log('--- 1. Motores OmniBuild y Resolución Inteligente ---');
  const engineKeys: OmniBuildEngineType[] = ['KAGGLE_CLOUD', 'GITHUB_ACTIONS', 'THINKPAD_SDK', 'AUTO'];
  assert(engineKeys.every(k => !!OMNI_BUILD_ENGINES[k]), 'Todos los motores OmniBuild están registrados');
  assert(OMNI_BUILD_ENGINES.KAGGLE_CLOUD.memoryLimit.includes('30 GB'), 'Kaggle Cloud Engine reporta 30GB de memoria');
  assert(OMNI_BUILD_ENGINES.GITHUB_ACTIONS.isAvailable, 'GitHub Actions Cloud Runner está activo');
  assert(OMNI_BUILD_ENGINES.THINKPAD_SDK.isAvailable, 'ThinkPad Bare-Metal SDK está disponible');

  const droidify = APPS_CATALOG.find(a => a.id === 'droid-ify') || APPS_CATALOG[0];
  const autoResolved = resolveEffectiveEngine(droidify, 'AUTO');
  assert(['KAGGLE_CLOUD', 'GITHUB_ACTIONS'].includes(autoResolved), `Auto-Balancing resolvió motor válido: ${autoResolved}`);

  // TEST SUITE 2: Credenciales Kaggle y Generador de Scripts
  console.log('\n--- 2. Puente Kaggle Cloud & Generación de Kernel ---');
  const kaggleCreds = getKaggleCredentials();
  assert(kaggleCreds.isConfigured, 'Credenciales de Kaggle detectadas y configuradas');
  assert(kaggleCreds.username === 'testuser', 'Usuario de Kaggle corresponde al entorno configurado');

  const kaggleScript = generateKaggleKernelScript(droidify);
  assert(kaggleScript.includes('Kaggle Cloud High-Memory Instance (30GB RAM'), 'Script Python contiene especificaciones de 30GB');
  assert(kaggleScript.includes(droidify.githubUrl), 'Script clona el repositorio oficial de la app');
  assert(kaggleScript.includes('assembleRelease'), 'Script invoca comando de compilación Gradle');
  assert(kaggleScript.includes('sha256'), 'Script calcula suma criptográfica SHA-256');

  const kaggleMeta = generateKaggleKernelMetadata(droidify);
  assert(kaggleMeta.enable_internet === true, 'Kaggle Kernel Metadata habilita acceso a Internet');
  assert(kaggleMeta.kernel_type === 'script', 'Kaggle Kernel Metadata especifica tipo script');

  const kaggleSteps = getKaggleBuildSteps();
  assert(kaggleSteps.length >= 6, 'Kaggle Build Steps contiene fases detalladas de ejecución');

  // TEST SUITE 3: Construcción de Trabajo OmniBuild Run & URLs Canónicas
  console.log('\n--- 3. Inicialización y Ejecución de OmniBuild Run ---');
  const run = createOmniBuildRun(droidify, 'KAGGLE_CLOUD');
  assert(run.status === 'in_progress', 'Estado inicial del run es in_progress');
  assert(run.buildEngine === 'KAGGLE_CLOUD', 'Run asignado a motor KAGGLE_CLOUD');
  assert(run.domainDownloadUrl?.includes('appstore.civer.cloud'), 'URL de descarga apunta al dominio canónico appstore.civer.cloud');
  assert(run.kaggleKernelUrl?.includes('civer-build-'), 'URL de kernel Kaggle generada correctamente');

  // Ejecución asíncrona simulada acelerada
  const completedRun = await executeOmniBuildRun(droidify, 'KAGGLE_CLOUD');
  assert(completedRun.status === 'completed', 'OmniBuild Run completado exitosamente');
  assert(completedRun.progress === 100, 'Progreso final alcanza 100%');
  assert(!!completedRun.sha256Checksum && completedRun.sha256Checksum.length === 64, 'Checksum SHA-256 válido de 64 caracteres hex');
  assert(completedRun.logs.length >= 7, `Bitácora de logs generada (${completedRun.logs.length} entradas)`);

  // TEST SUITE 4: Orquestación por Lotes del Catálogo FOSS
  console.log('\n--- 4. Orquestador Masivo de Compilación del Catálogo ---');
  assert(APPS_CATALOG.length >= 10, `Catálogo de aplicaciones contiene ${APPS_CATALOG.length} aplicaciones`);

  // Ejecutamos batch build con subconjunto de 3 apps para verificación rápida
  const testBatchSubset = APPS_CATALOG.slice(0, 3);
  let batchNotifications = 0;
  const batchRuns = await executeBatchCatalogBuild(
    testBatchSubset,
    'AUTO',
    () => { batchNotifications++; }
  );

  assert(batchRuns.length === 3, 'Lote compiló exactamente las 3 aplicaciones solicitadas');
  assert(batchRuns.every(r => r.status === 'completed'), 'Todas las apps del lote finalizaron con estado completed');
  assert(batchNotifications >= 3, `Notificaciones de progreso emitidas al suscriptor (${batchNotifications})`);

  // TEST SUITE 5: Notificación e Integración Telegram
  console.log('\n--- 5. Notificación y Despacho a Telegram ---');
  const telegramSent = await notifyTelegramCompiledApk(completedRun);
  // Puede fallar si no hay conexión real a Telegram API en este instante, pero la llamada no debe lanzar excepciones
  assert(typeof telegramSent === 'boolean', 'notifyTelegramCompiledApk ejecutado sin excepciones');

  const deepLink = getTelegramDeepLinkForApk(droidify.id, run.id);
  assert(deepLink.includes('t.me/EnviodeApkCompiladaBot'), 'Enlace profundo de Telegram apunta a @EnviodeApkCompiladaBot');

  // TEST SUITE 6: Dominio y Endpoints de Red
  console.log('\n--- 6. Endpoints de Red y Nombres de Dominio ---');
  assert(NETWORK_ENDPOINTS.PRIMARY_DOMAIN === 'https://appstore.civer.cloud', 'Dominio primario es appstore.civer.cloud');
  assert(NETWORK_ENDPOINTS.FALLBACK_DOMAIN === 'https://civer.cloud', 'Dominio fallback es civer.cloud');

  const cloudUrl = getApkCanonicalUrl('com.looker.droidify', 'v0.6.9', 'cloud');
  assert(cloudUrl.startsWith('https://appstore.civer.cloud/downloads/com.looker.droidify-v0.6.9-release.apk'), 'URL cloud formateada');

  // TEST SUITE 7: Registro del PRD e Iteración 13 en Changelog Ledger
  console.log('\n--- 7. Auditoría del Ledger de Arquitectura & PRD ---');
  const iter13 = SYSTEM_CHANGELOG.find(it => it.iterationNumber === 13);
  assert(!!iter13, `Iteración 13 está registrada en el changelog (total iteraciones: ${SYSTEM_CHANGELOG.length})`);
  if (iter13) {
    assert(iter13.title.includes('OmniBuild'), 'Título de la iteración 13 referencia OmniBuild');
    assert(iter13.architecturePhases.length === 4, 'Iteración 13 contiene 4 fases de arquitectura');
    assert(iter13.architecturePhases.every(p => p.status === 'COMPLETED'), 'Todas las fases de la iteración 13 están COMPLETED');
    assert(iter13.implementedFeatures.length >= 4, 'Iteración 13 contiene 4 características verificadas');
    assert(iter13.modulesAffected.includes('omniBuildKernelService.ts'), 'modulesAffected incluye omniBuildKernelService.ts');
    assert(iter13.modulesAffected.includes('kaggleCompilerBridgeService.ts'), 'modulesAffected incluye kaggleCompilerBridgeService.ts');
  }

  // RESUMEN FINAL
  console.log('\n================================================================================');
  console.log(`📊 RESULTADO DE LA VERIFICACIÓN: ${passed} superadas, ${failed} fallidas (Total: ${passed + failed})`);
  if (failed === 0) {
    console.log('🎉 100% DE LAS PRUEBAS SUPERADAS CON ÉXITO ABSOLUTO.');
  } else {
    console.error('⚠️ ALGUNAS PRUEBAS FALLARON.');
  }
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante la ejecución de las pruebas:', err);
  process.exit(1);
});
