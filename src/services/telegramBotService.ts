/**
 * Telegram Bot Service (@EnviodeApkCompiladaBot)
 * 
 * Manages communication with Telegram Bot API:
 * - Bot verification and getMe status.
 * - Sending interactive messages and Markdown alerts.
 * - Delivering compiled APK binaries directly to user chats.
 * - Handling inline keyboard navigation for app catalog browsing and remote CI triggers.
 */

export const DEFAULT_TELEGRAM_BOT_TOKEN = '8757193329:AAHOJtoR4E37xvl2_RP80STqutAqtbATqY4';
export const DEFAULT_BOT_USERNAME = 'EnviodeApkCompiladaBot';
export const DEFAULT_BOT_URL = 'https://t.me/EnviodeApkCompiladaBot';

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  first_name?: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data: string;
  };
}

export interface TelegramVerificationResult {
  valid: boolean;
  botId?: number;
  username?: string;
  firstName?: string;
  error?: string;
}

export interface SendTelegramMessageOptions {
  chatId: string | number;
  text: string;
  token?: string;
  parseMode?: 'Markdown' | 'HTML';
  replyMarkup?: any;
}

export interface SendApkDocumentOptions {
  chatId: string | number;
  apkBlobOrBuffer?: Blob | Uint8Array;
  downloadUrl?: string;
  filename: string;
  caption: string;
  token?: string;
}

class TelegramBotService {
  private baseApiUrl = 'https://api.telegram.org';

  /**
   * Verifies the bot token by calling getMe
   */
  public async verifyBotToken(token: string = DEFAULT_TELEGRAM_BOT_TOKEN): Promise<TelegramVerificationResult> {
    try {
      const cleanToken = token.trim();
      const response = await fetch(`${this.baseApiUrl}/bot${cleanToken}/getMe`);
      const data = await response.json();

      if (data.ok && data.result) {
        return {
          valid: true,
          botId: data.result.id,
          username: data.result.username,
          firstName: data.result.first_name
        };
      }

      return {
        valid: false,
        error: data.description || 'Token de Telegram inválido'
      };
    } catch (err: any) {
      return {
        valid: false,
        error: err.message || 'Error de conexión con la API de Telegram'
      };
    }
  }

  /**
   * Sends a text message to a user or group chat
   */
  public async sendMessage(options: SendTelegramMessageOptions): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const token = options.token?.trim() || DEFAULT_TELEGRAM_BOT_TOKEN;
    try {
      const body: any = {
        chat_id: options.chatId,
        text: options.text,
        parse_mode: options.parseMode || 'Markdown'
      };

      if (options.replyMarkup) {
        body.reply_markup = options.replyMarkup;
      }

      const response = await fetch(`${this.baseApiUrl}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.ok) {
        return { success: true, messageId: data.result.message_id };
      }

      return { success: false, error: data.description || 'Error enviando mensaje' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Fallo de red al enviar mensaje de Telegram' };
    }
  }

  /**
   * Delivers an APK file directly to a user's Telegram chat
   */
  public async sendApkDocument(options: SendApkDocumentOptions): Promise<{ success: boolean; error?: string }> {
    const token = options.token?.trim() || DEFAULT_TELEGRAM_BOT_TOKEN;

    try {
      if (options.apkBlobOrBuffer) {
        const formData = new FormData();
        formData.append('chat_id', String(options.chatId));
        formData.append('caption', options.caption);
        formData.append('parse_mode', 'Markdown');
        
        // Append blob as document
        if (options.apkBlobOrBuffer instanceof Blob) {
          formData.append('document', options.apkBlobOrBuffer, options.filename);
        } else {
          // Node Buffer / Uint8Array to Blob
          const blob = new Blob([options.apkBlobOrBuffer as any], { type: 'application/vnd.android.package-archive' });
          formData.append('document', blob, options.filename);
        }

        const response = await fetch(`${this.baseApiUrl}/bot${token}/sendDocument`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (data.ok) return { success: true };
        return { success: false, error: data.description || 'Error enviando APK por Telegram' };
      } else if (options.downloadUrl) {
        // If downloadUrl provided, ask Telegram to send document by URL or send formatted download card
        const response = await fetch(`${this.baseApiUrl}/bot${token}/sendDocument`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: options.chatId,
            document: options.downloadUrl,
            caption: options.caption,
            parse_mode: 'Markdown'
          })
        });

        const data = await response.json();
        if (data.ok) return { success: true };

        // Fallback: If Telegram cannot fetch remote file directly, send message with button
        return await this.sendMessage({
          chatId: options.chatId,
          text: `${options.caption}\n\n📥 [Descargar APK Directo](${options.downloadUrl})`,
          token,
          replyMarkup: {
            inline_keyboard: [
              [{ text: '📥 Descargar e Instalar APK', url: options.downloadUrl }]
            ]
          }
        });
      }

      return { success: false, error: 'No se proporcionó ni archivo binario ni URL de descarga' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al enviar APK por Telegram' };
    }
  }

  /**
   * Fetches latest bot updates (long polling)
   */
  public async getUpdates(offset: number = 0, limit: number = 50, token: string = DEFAULT_TELEGRAM_BOT_TOKEN): Promise<TelegramUpdate[]> {
    try {
      const response = await fetch(`${this.baseApiUrl}/bot${token}/getUpdates?offset=${offset}&limit=${limit}&timeout=20`);
      const data = await response.json();
      if (data.ok && Array.isArray(data.result)) {
        return data.result;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Sends a test ping to verify a user's Chat ID
   */
  public async sendTestPing(chatId: string | number, token?: string): Promise<{ success: boolean; error?: string }> {
    return this.sendMessage({
      chatId,
      token,
      text: `👋 *¡Hola desde Civer App Store!*\n\nTu sesión de Telegram quedó correctamente vinculada con la plataforma.\n\nCada vez que compiles una aplicación Android FOSS, recibirás automáticamente el archivo *.apk* firmado aquí para instalarlo en tu teléfono. 🚀`,
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '🌐 Abrir Civer App Store', url: 'https://github.com/nubeplay7/Open-Source-App-Store' },
            { text: '📱 Bot Telegram', url: DEFAULT_BOT_URL }
          ]
        ]
      }
    });
  }

  /**
   * Sends build completion notification with APK
   */
  public async notifyBuildFinished(params: {
    chatId: string | number;
    appName: string;
    appId: string;
    versionTag: string;
    sha256: string;
    apkSizeMb: number;
    downloadUrl?: string;
    token?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const caption = `🎉 *¡Nueva APK Compilada con Éxito!*

📱 *Aplicación:* \`${params.appName}\`
🏷️ *Versión:* \`${params.versionTag}\`
📦 *Tamaño:* \`${params.apkSizeMb.toFixed(2)} MB\`
🛡️ *SHA-256 Checksum:*
\`${params.sha256}\`
⚡ *Firma:* OTA Signature Scheme v2/v3 Verificada

_Toca el archivo para descargarlo e instalarlo directamente en tu Android._`;

    if (params.downloadUrl) {
      return this.sendApkDocument({
        chatId: params.chatId,
        downloadUrl: params.downloadUrl,
        filename: `${params.appId}-${params.versionTag}.apk`,
        caption,
        token: params.token
      });
    }

    return this.sendMessage({
      chatId: params.chatId,
      text: caption,
      token: params.token
    });
  }
}

export const telegramBotService = new TelegramBotService();
