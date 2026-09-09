/**
 * Test Suite: Verificación de Cloud Mobile Testing, Capturas de Pantalla y Despacho
 */
import { 
  agentCloudMobileTestingService, 
  generateSyntheticMobileScreen 
} from '../src/services/agentCloudMobileTestingService';
import { telegramBotService, DEFAULT_BOT_USERNAME } from '../src/services/telegramBotService';
import * as fs from 'fs';
import * as path from 'path';

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 SUITE DE TEST: CLOUD MOBILE TESTING, SCREENCAP & TELEGRAM');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Verificar existencia del Workflow de GitHub Actions
  console.log('--- 1. Verificando Workflow de GitHub Actions ---');
  const workflowPath = path.resolve(process.cwd(), '.github/workflows/cloud-mobile-testing.yml');
  assert(fs.existsSync(workflowPath), 'El archivo .github/workflows/cloud-mobile-testing.yml existe');
  
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  assert(workflowContent.includes('reactivecircus/android-emulator-runner@v2'), 'Workflow incluye android-emulator-runner@v2');
  assert(workflowContent.includes('screencap -p'), 'Workflow incluye comandos adb exec-out screencap');
  assert(workflowContent.includes('sendPhoto'), 'Workflow incluye despacho multipart de fotos a Telegram');
  assert(workflowContent.includes('uiautomator dump'), 'Workflow incluye volcado de interfaz con UI Automator');

  // 2. Probar Generación de Capturas de Pantalla Móviles
  console.log('\n--- 2. Generando Capturas de Pantalla en Alta Fidelidad ---');
  const testApp = {
    id: 'omnicomm-hub',
    name: 'OmniComm Hub',
    packageName: 'com.civer.omnicomm',
    tagline: 'Comunicaciones Tácticas C4ISR'
  };

  const screenLaunch = generateSyntheticMobileScreen(testApp, 'LAUNCH', 'PORTRAIT', 35);
  assert(screenLaunch.dataUrl.startsWith('data:image/svg+xml'), 'Captura LAUNCH generó SVG Data URL válido');
  assert(screenLaunch.width === 420 && screenLaunch.height === 880, 'Dimensiones Portrait correctas (420x880)');
  assert(screenLaunch.contrastScore >= 95, 'Score de contraste cumple estándares de accesibilidad');

  const screenLandscape = generateSyntheticMobileScreen(testApp, 'LANDSCAPE', 'LANDSCAPE', 34);
  assert(screenLandscape.width === 840 && screenLandscape.height === 420, 'Dimensiones Landscape correctas (840x420)');
  assert(screenLandscape.orientation === 'LANDSCAPE', 'Orientación detectada como LANDSCAPE');

  const screenChaos = generateSyntheticMobileScreen(testApp, 'CHAOS', 'PORTRAIT', 34);
  assert(screenChaos.stage === 'CHAOS', 'Captura de Monkey Chaos Test creada con éxito');
  assert(screenChaos.anrDetected === false, 'Sin bloqueos ANR reportados');

  // 3. Probar Servicio de Orquestación Cloud (Simulación en Streaming)
  console.log('\n--- 3. Probando Ejecución de Sesión en agentCloudMobileTestingService ---');
  const session = await agentCloudMobileTestingService.startCloudTestRun(
    {
      id: testApp.id,
      name: testApp.name,
      packageName: testApp.packageName,
      tagline: testApp.tagline,
      stackType: 'ANDROID_NATIVE'
    },
    {
      testType: 'SMOKE',
      apiLevel: 34
    }
  );

  assert(session.id.startsWith('cloud-test-omnicomm-hub'), 'ID de sesión generado con formato correcto');
  assert(session.appName === 'OmniComm Hub', 'Nombre de app asignado correctamente');
  assert(session.apiLevel === 34, 'API level 34 configurado');

  // Esperar a que concluya el pipeline reactivo (simulación ~4.5s)
  console.log('Esperando ejecución de fases en emulador cloud...');
  await new Promise(r => setTimeout(r, 5500));

  const completedSession = agentCloudMobileTestingService.getSessionById(session.id);
  assert(!!completedSession, 'Sesión encontrada en el registro de memoria');
  assert(completedSession?.status === 'COMPLETED', `Estado final es COMPLETED (actual: ${completedSession?.status})`);
  assert((completedSession?.capturedScreens.length || 0) >= 4, `Al menos 4 capturas de pantalla generadas (actual: ${completedSession?.capturedScreens.length})`);
  assert((completedSession?.verdict?.healthScore || 0) >= 95, `Health Score del agente >= 95 (actual: ${completedSession?.verdict?.healthScore})`);
  assert(completedSession?.verdict?.crashesCount === 0, 'Cero crashes detectados');

  // 4. Verificación de Conectividad con Telegram Bot
  console.log('\n--- 4. Verificando Servicio de Telegram Bot ---');
  const botVerification = await telegramBotService.verifyBotToken();
  assert(botVerification.valid === true, 'Token del bot de Telegram verificado como válido');
  assert(botVerification.username === DEFAULT_BOT_USERNAME, `Nombre de usuario del bot es @${botVerification.username}`);
  console.log(`🤖 Bot Activo: @${botVerification.username} (${botVerification.firstName})`);

  console.log('\n================================================================');
  console.log(`🎉 RESULTADO: ${passedTests}/${totalTests} pruebas aprobadas (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================');
}

runTestSuite().catch(err => {
  console.error('Error fatal durante la prueba:', err);
  process.exit(1);
});
