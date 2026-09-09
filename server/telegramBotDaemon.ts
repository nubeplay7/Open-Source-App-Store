/**
 * Telegram Bot Autonomous Daemon (@EnviodeApkCompiladaBot)
 * Token: 8757193329:AAHOJtoR4E37xvl2_RP80STqutAqtbATqY4
 * 
 * Execution: npm run bot
 * 
 * Capabilities:
 * - Interactive onboarding (/start, /menu)
 * - FOSS Catalog browsing (/apps)
 * - Remote GitHub Actions CI build dispatch (/build <appId>)
 * - Automatic compiled .apk binary delivery via Telegram Bot API
 * - OTA update checks (/ota)
 * - Telegram Chat ID lookup (/myid)
 */

import { APPS_CATALOG } from '../src/data/appsCatalogData';
import { 
  DEFAULT_TELEGRAM_BOT_TOKEN, 
  DEFAULT_BOT_USERNAME, 
  telegramBotService 
} from '../src/services/telegramBotService';
import { triggerRealGitHubBuild } from '../src/services/githubCiService';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TELEGRAM_BOT_TOKEN;
const GITHUB_PAT = process.env.GITHUB_PAT || '';

interface ActivePollState {
  offset: number;
  isRunning: boolean;
}

const state: ActivePollState = {
  offset: 0,
  isRunning: true
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📱 Catálogo de Apps FOSS', callback_data: 'cmd_apps' },
        { text: '⚡ Compilar en GitHub', callback_data: 'cmd_build_menu' }
      ],
      [
        { text: '🔄 Actualizaciones OTA', callback_data: 'cmd_ota' },
        { text: '🆔 Mi Telegram Chat ID', callback_data: 'cmd_myid' }
      ],
      [
        { text: '🌐 Repositorio Civer en GitHub', url: 'https://github.com/nubeplay7/Open-Source-App-Store' }
      ]
    ]
  };
}

async function handleCommand(chatId: number, text: string, fromUser: any): Promise<void> {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (lower === '/start' || lower === '/menu') {
    const welcome = `🤖 *¡Bienvenido a Civer App Store Bot!* (@${DEFAULT_BOT_USERNAME})

Soy el asistente autónomo de compilación y distribución de software libre (FOSS) para Android.

🎯 *¿Qué puedo hacer por ti?*
• Listar las aplicaciones libres del ecosistema Civer.
• Compilar APKs reales en la nube mediante **GitHub Actions**.
• Enviarte el archivo *.apk* firmado directamente a este chat para que lo instales en tu teléfono.
• Comprobar actualizaciones OTA (Over-The-Air) de tus apps.

Tu Telegram Chat ID es: \`${chatId}\`

_Selecciona una opción en el menú inferior o escribe /apps para comenzar:_`;

    await telegramBotService.sendMessage({
      chatId,
      token: BOT_TOKEN,
      text: welcome,
      replyMarkup: getMainMenuKeyboard()
    });
    return;
  }

  if (lower === '/apps' || lower === 'apps') {
    const appsText = `📱 *Catálogo de Aplicaciones FOSS — Civer App Store*\n\n` +
      APPS_CATALOG.slice(0, 8).map((app, i) => {
        return `*${i + 1}. ${app.name}* (\`${app.packageName}\`)\n` +
               `   • Versión: \`${app.version}\` | Salud: \`${app.healthScore}%\` | Cat: _${app.category}_\n` +
               `   • Compilar: \`/build ${app.id}\``;
      }).join('\n\n') +
      `\n\n_Para compilar cualquiera de ellas, toca su comando o presiona un botón:_`;

    const buttons = APPS_CATALOG.slice(0, 6).map((app) => ([
      { text: `⚡ Compilar ${app.name}`, callback_data: `build_${app.id}` }
    ]));

    await telegramBotService.sendMessage({
      chatId,
      token: BOT_TOKEN,
      text: appsText,
      replyMarkup: { inline_keyboard: buttons }
    });
    return;
  }

  if (lower.startsWith('/build') || lower.startsWith('build')) {
    const parts = trimmed.split(' ');
    const appId = parts[1] || 'civer-app-store';
    await triggerBuildForApp(chatId, appId);
    return;
  }

  if (lower === '/myid' || lower === 'id') {
    await telegramBotService.sendMessage({
      chatId,
      token: BOT_TOKEN,
      text: `🆔 *Tu Telegram Chat ID:* \`${chatId}\`\n\nPuedes copiar este número e introducirlo en la pestaña de **Cuenta y Configuración** de la plataforma web de Civer App Store para que cada compilación que lances desde el navegador llegue directo a tu móvil. 📲`
    });
    return;
  }

  if (lower === '/ota') {
    const otaText = `🔄 *Canal de Actualizaciones OTA (Over-The-Air)*\n\n` +
      `• *Civer App Store Matrix*: v4.2.0 (Build 42)\n` +
      `• *Firma:* Scheme v2/v3/v4 fs-verity\n` +
      `• *Estado:* Estable\n\n` +
      `Todas las aplicaciones compiladas incorporan el módulo nativo OTA para auto-actualizarse en caliente sin depender de tiendas comerciales.`;

    await telegramBotService.sendMessage({
      chatId,
      token: BOT_TOKEN,
      text: otaText,
      replyMarkup: getMainMenuKeyboard()
    });
    return;
  }

  // Fallback / Help
  await telegramBotService.sendMessage({
    chatId,
    token: BOT_TOKEN,
    text: `❓ Comando no reconocido. Escribe */menu* o */apps* para explorar las aplicaciones disponibles o */build <app>* para compilar.`,
    replyMarkup: getMainMenuKeyboard()
  });
}

async function triggerBuildForApp(chatId: number, appId: string): Promise<void> {
  const target = APPS_CATALOG.find(a => a.id.toLowerCase() === appId.toLowerCase()) || APPS_CATALOG[0];

  await telegramBotService.sendMessage({
    chatId,
    token: BOT_TOKEN,
    text: `⚡ *Iniciando Compilación en la Nube de GitHub Actions...*\n\n📱 *App:* \`${target.name}\` (\`${target.packageName}\`)\n🌿 *Rama:* \`main\`\n☕ *JDK:* 17 Temurin | *Gradle Task:* \`${target.gradleTask || 'assembleRelease'}\`\n👤 *Destinatario:* Chat ID \`${chatId}\`\n\n_El runner de GitHub Actions compilará el código fuente, firmará el APK y te entregará el binario directamente en este chat en breve._ 🚀`
  });

  // Call GitHub Actions workflow_dispatch
  const result = await triggerRealGitHubBuild({
    token: GITHUB_PAT,
    appId: target.id,
    appName: target.name,
    repoUrl: target.githubUrl,
    branch: target.defaultBranch || 'main',
    gradleTask: target.gradleTask || 'assembleRelease',
    telegramChatId: String(chatId),
    telegramBotToken: BOT_TOKEN,
    buildType: 'release'
  });

  if (result.success) {
    await telegramBotService.sendMessage({
      chatId,
      token: BOT_TOKEN,
      text: `✅ *¡Workflow Despachado con Éxito a GitHub Actions!*\n\n🔗 *Seguimiento en vivo:* [GitHub Actions Workflow](${result.workflowUrl})\n\n_Tan pronto el runner finalice la compilación del APK, recibirás el archivo aquí automáticamente._`,
      replyMarkup: {
        inline_keyboard: [
          [{ text: '🔍 Ver Runner en GitHub Actions', url: result.workflowUrl || 'https://github.com/nubeplay7/Open-Source-App-Store/actions' }]
        ]
      }
    });
  } else {
    await telegramBotService.sendMessage({
      chatId,
      token: BOT_TOKEN,
      text: `⚠️ *Aviso de Despacho:* ${result.message}\n\n_Si el runner no tiene permisos directos o está en cola, puedes revisar la consola web de Civer App Store._`
    });
  }
}

async function handleCallbackQuery(query: any): Promise<void> {
  const chatId = query.message?.chat?.id;
  const data = query.data;
  if (!chatId || !data) return;

  if (data === 'cmd_apps') {
    await handleCommand(chatId, '/apps', query.from);
  } else if (data === 'cmd_build_menu') {
    await handleCommand(chatId, '/apps', query.from);
  } else if (data === 'cmd_ota') {
    await handleCommand(chatId, '/ota', query.from);
  } else if (data === 'cmd_myid') {
    await handleCommand(chatId, '/myid', query.from);
  } else if (data.startsWith('build_')) {
    const appId = data.replace('build_', '');
    await triggerBuildForApp(chatId, appId);
  }
}

/**
 * Main long polling loop
 */
async function runBotDaemon(): Promise<void> {
  console.log('================================================================');
  console.log('🤖 INICIANDO DEMONIO AUTÓNOMO DE TELEGRAM (@EnviodeApkCompiladaBot)');
  console.log('================================================================');

  const verification = await telegramBotService.verifyBotToken(BOT_TOKEN);
  if (!verification.valid) {
    console.error('❌ Error de autenticación del bot de Telegram:', verification.error);
    process.exit(1);
  }

  console.log(`✅ Bot conectado exitosamente: @${verification.username} (ID: ${verification.botId})`);
  console.log(`⚡ Modo: Long Polling activo. Escuchando solicitudes...`);
  console.log('================================================================');

  while (state.isRunning) {
    try {
      const updates = await telegramBotService.getUpdates(state.offset, 50, BOT_TOKEN);

      for (const update of updates) {
        state.offset = update.update_id + 1;

        if (update.message && update.message.text) {
          const text = update.message.text;
          const chatId = update.message.chat.id;
          console.log(`[Mensaje Recibido] De: ${chatId} | Texto: "${text}"`);
          await handleCommand(chatId, text, update.message.from);
        } else if (update.callback_query) {
          console.log(`[Botón Clickeado] De: ${update.callback_query.from.id} | Data: "${update.callback_query.data}"`);
          await handleCallbackQuery(update.callback_query);
        }
      }

      await sleep(1000);
    } catch (err: any) {
      console.error('⚠️ Excepción en bucle de polling:', err.message);
      await sleep(3000);
    }
  }
}

// Start daemon if executed directly
runBotDaemon().catch((err) => {
  console.error('Fatal error in Telegram Daemon:', err);
});
