import { FriendUser, ChatMessage, ChatChannel, SharedAppEmbed, AppCatalogItem, UserProfile } from '../types';

const FRIENDS_STORAGE_KEY = 'civer_social_friends_v1';
const CHAT_STORAGE_KEY = 'civer_social_messages_v1';

export const DEFAULT_FRIENDS: FriendUser[] = [
  {
    id: 'usr-linus',
    civerId: 'linus.foss@civer.id',
    name: 'Linus Torvaldsen',
    email: 'linus.foss@kernel.org',
    avatarLetter: 'L',
    avatarBg: 'bg-emerald-600',
    roleBadge: 'Kernel & AOSP Contributor',
    status: 'ONLINE',
    customStatusMessage: 'Compilando kernel 6.13 con soporte Shizuku IPC',
    mutualAppsCount: 28,
    publicSharedApps: ['store-fdroid', 'app-termux', 'app-bitwarden', 'app-keepassdx'],
    isFriend: true
  },
  {
    id: 'usr-elena',
    civerId: 'elena.rostova@civer.id',
    name: 'Elena Rostova',
    email: 'elena.sec@exodus-privacy.org',
    avatarLetter: 'E',
    avatarBg: 'bg-purple-600',
    roleBadge: 'Auditora Exodus Privacy',
    status: 'ONLINE',
    customStatusMessage: 'Analizando rastreadores en APKs de última generación',
    mutualAppsCount: 42,
    publicSharedApps: ['app-signal', 'app-organicmaps', 'app-newpipe', 'app-k9mail'],
    isFriend: true
  },
  {
    id: 'usr-alexandre',
    civerId: 'alex.dupont@civer.id',
    name: 'Alexandre Dupont',
    email: 'alex.ci@fdroid.org',
    avatarLetter: 'A',
    avatarBg: 'bg-blue-600',
    roleBadge: 'Maintainer F-Droid Build Server',
    status: 'AWAY',
    customStatusMessage: 'Firmando builds reproducibles con esquema v4',
    mutualAppsCount: 19,
    publicSharedApps: ['store-fdroid', 'app-newpipe', 'app-vlc'],
    isFriend: true
  },
  {
    id: 'usr-sofia',
    civerId: 'sofia.lin@civer.id',
    name: 'Sofia Lin',
    email: 'sofia.dev@rust-lang.org',
    avatarLetter: 'S',
    avatarBg: 'bg-amber-600',
    roleBadge: 'Rust & WebAssembly Core',
    status: 'ONLINE',
    customStatusMessage: 'Creando plugins WASM para filtrado de telemetría',
    mutualAppsCount: 35,
    publicSharedApps: ['app-obsidian', 'app-bitwarden', 'app-signal'],
    isFriend: true
  },
  {
    id: 'usr-carlos',
    civerId: 'carlos.mendoza@civer.id',
    name: 'Carlos Mendoza',
    email: 'cmendoza@lineageos.org',
    avatarLetter: 'C',
    avatarBg: 'bg-rose-600',
    roleBadge: 'AOSP & MicroG Hacker',
    status: 'OFFLINE',
    customStatusMessage: 'Probando MicroG Services Core en Pixel 9',
    mutualAppsCount: 14,
    publicSharedApps: ['store-aurora', 'app-organicmaps'],
    isFriend: true
  }
];

export const DEFAULT_CHANNELS: ChatChannel[] = [
  {
    id: 'chan-general',
    name: 'general-comunidad',
    description: 'Espacio global para debatir sobre software libre, privacidad y alternativas',
    icon: 'MessageSquare',
    unreadCount: 0,
    topic: '¡Bienvenidos a la red soberana Civer FOSS! Comparte tus descubrimientos.',
    membersCount: 1420
  },
  {
    id: 'chan-recomendaciones',
    name: 'recomendaciones-apps',
    description: 'Recomienda aplicaciones, clientes ligeros y trucos de configuración',
    icon: 'Sparkles',
    unreadCount: 2,
    topic: 'Recomendaciones verificadas sin rastreadores con enlaces directos',
    membersCount: 890
  },
  {
    id: 'chan-seguridad',
    name: 'seguridad-auditorias',
    description: 'Análisis de firmas APK, reportes Exodus Privacy y vulnerabilidades',
    icon: 'ShieldCheck',
    unreadCount: 0,
    topic: 'Auditoría continua de repositorios F-Droid, Accrescent y GitHub CI',
    membersCount: 650
  },
  {
    id: 'chan-colaboracion',
    name: 'desarrollo-colaborativo',
    description: 'Equipos de desarrollo en tiempo real, testing conjunto y repositorios Git',
    icon: 'Code2',
    unreadCount: 1,
    topic: 'Salas activas de codificación en vivo y control de versiones',
    membersCount: 520
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    channelId: 'chan-general',
    senderId: 'usr-linus',
    senderName: 'Linus Torvaldsen',
    senderAvatar: 'L',
    senderRole: 'Kernel Contributor',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    content: '¡Acabo de probar el nuevo motor de instalación Shizuku en la última versión de Civer Matrix! La instalación en segundo plano sin prompts es impecable.',
    reactions: [
      { emoji: '🚀', count: 8, userReacted: true },
      { emoji: '🔥', count: 5 }
    ]
  },
  {
    id: 'msg-2',
    channelId: 'chan-recomendaciones',
    senderId: 'usr-elena',
    senderName: 'Elena Rostova',
    senderAvatar: 'E',
    senderRole: 'Auditora Exodus',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    content: 'Les recomiendo encarecidamente esta aplicación si buscan privacidad absoluta en navegación multimedia y streaming sin anuncios:',
    sharedApp: {
      appId: 'app-newpipe',
      appName: 'NewPipe',
      packageName: 'org.schabi.newpipe',
      iconSymbol: 'Play',
      iconBg: 'bg-red-600',
      version: 'v0.27.4',
      rating: 4.8,
      apkSizeMb: 11.2,
      recommendationNote: '0 rastreadores comprobados por Exodus Privacy. Permite reproducción en segundo plano y descarga local de audio Opus.'
    },
    reactions: [
      { emoji: '❤️', count: 12, userReacted: true },
      { emoji: '🛡️', count: 9 }
    ]
  },
  {
    id: 'msg-3',
    channelId: 'chan-colaboracion',
    senderId: 'usr-sofia',
    senderName: 'Sofia Lin',
    senderAvatar: 'S',
    senderRole: 'Rust Hacker',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    content: 'Estamos editando en tiempo real el módulo de reproducción de audio LibreFlow. Miren la función de decodificación que agregamos:',
    codeSnippet: {
      language: 'typescript',
      title: 'libreflow-audio-engine.ts',
      code: `export async function initLowLatencyDspContext(sampleRate = 48000) {\n  const audioCtx = new AudioContext({ sampleRate, latencyHint: 'interactive' });\n  const wasmModule = await WebAssembly.instantiateStreaming(fetch('/wasm/dsp.wasm'));\n  return { audioCtx, dsp: wasmModule.instance.exports };\n}`
    },
    reactions: [
      { emoji: '⚡', count: 7 }
    ]
  },
  {
    id: 'msg-dm-1',
    recipientUserId: 'usr-linus',
    senderId: 'usr-linus',
    senderName: 'Linus Torvaldsen',
    senderAvatar: 'L',
    senderRole: 'Kernel Contributor',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    content: 'Hola amigo! ¿Viste la sincronización multidispositivo que lanzaron? Sincroniza en milisegundos entre mi ThinkPad y el Pixel.',
    reactions: []
  }
];

class SocialNetworkService {
  private chatChannel: BroadcastChannel | null = null;
  private friends: FriendUser[] = [];
  private messages: ChatMessage[] = [];
  private channels: ChatChannel[] = DEFAULT_CHANNELS;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.chatChannel = new BroadcastChannel('civer_social_chat_channel');
        this.chatChannel.onmessage = (event) => {
          if (event.data?.type === 'NEW_CHAT_MESSAGE') {
            this.messages.push(event.data.payload);
            this.notify();
          } else if (event.data?.type === 'FRIENDS_UPDATE') {
            this.friends = event.data.payload;
            this.notify();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in iframe', e);
      }
    }
  }

  private loadFromStorage(): void {
    try {
      const savedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY);
      const savedMsgs = localStorage.getItem(CHAT_STORAGE_KEY);
      this.friends = savedFriends ? JSON.parse(savedFriends) : DEFAULT_FRIENDS;
      this.messages = savedMsgs ? JSON.parse(savedMsgs) : INITIAL_MESSAGES;
    } catch {
      this.friends = DEFAULT_FRIENDS;
      this.messages = INITIAL_MESSAGES;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(this.friends));
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(this.messages));
    } catch (e) {
      console.warn('Could not save social data', e);
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getFriends(): FriendUser[] {
    return [...this.friends];
  }

  public getChannels(): ChatChannel[] {
    return [...this.channels];
  }

  public getMessagesForChannel(channelId: string): ChatMessage[] {
    return this.messages.filter((m) => m.channelId === channelId);
  }

  public getDirectMessages(otherUserId: string, currentUserId: string): ChatMessage[] {
    return this.messages.filter(
      (m) =>
        (m.senderId === otherUserId && m.recipientUserId === currentUserId) ||
        (m.senderId === currentUserId && m.recipientUserId === otherUserId) ||
        // Fallback for demo when current user is chatting
        (m.recipientUserId === otherUserId) ||
        (m.senderId === otherUserId && !m.channelId)
    );
  }

  public sendMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const fullMessage: ChatMessage = {
      ...msg,
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString()
    };

    this.messages.push(fullMessage);
    this.saveToStorage();

    if (this.chatChannel) {
      this.chatChannel.postMessage({
        type: 'NEW_CHAT_MESSAGE',
        payload: fullMessage
      });
    }

    this.notify();
    return fullMessage;
  }

  /**
   * Share an application directly to a channel or friend
   */
  public shareAppToChat(
    app: AppCatalogItem,
    target: { channelId?: string; friendId?: string },
    userProfile: UserProfile,
    customNote?: string
  ): ChatMessage {
    const sharedEmbed: SharedAppEmbed = {
      appId: app.id,
      appName: app.name,
      packageName: app.packageName,
      iconSymbol: app.iconSymbol,
      iconBg: app.iconBg,
      version: app.version,
      rating: app.rating,
      apkSizeMb: app.apkSizeMb,
      recommendationNote: customNote || `¡Te recomiendo ${app.name}! Es 100% código abierto con licencia ${app.license}.`
    };

    return this.sendMessage({
      channelId: target.channelId,
      recipientUserId: target.friendId,
      senderId: 'current-user',
      senderName: userProfile.name || 'Tú',
      senderAvatar: userProfile.avatarLetter || 'T',
      senderRole: 'Usuario Verificado',
      content: customNote ? `Recomendación: ${customNote}` : `Compartió la aplicación ${app.name} (${app.version})`,
      sharedApp: sharedEmbed,
      reactions: []
    });
  }

  public addFriend(newFriendData: { name: string; civerId: string; email: string; roleBadge?: string }): FriendUser {
    const friend: FriendUser = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      civerId: newFriendData.civerId,
      name: newFriendData.name,
      email: newFriendData.email,
      avatarLetter: newFriendData.name.charAt(0).toUpperCase() || 'F',
      avatarBg: 'bg-indigo-600',
      roleBadge: newFriendData.roleBadge || 'Miembro de la Comunidad FOSS',
      status: 'ONLINE',
      customStatusMessage: 'Recién añadido a contactos',
      mutualAppsCount: 6,
      publicSharedApps: ['store-fdroid', 'app-newpipe'],
      isFriend: true
    };

    this.friends.unshift(friend);
    this.saveToStorage();

    if (this.chatChannel) {
      this.chatChannel.postMessage({
        type: 'FRIENDS_UPDATE',
        payload: this.friends
      });
    }

    this.notify();
    return friend;
  }

  public toggleReaction(messageId: string, emoji: string): void {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) return;

    const existing = msg.reactions.find((r) => r.emoji === emoji);
    if (existing) {
      if (existing.userReacted) {
        existing.count = Math.max(0, existing.count - 1);
        existing.userReacted = false;
      } else {
        existing.count += 1;
        existing.userReacted = true;
      }
    } else {
      msg.reactions.push({
        emoji,
        count: 1,
        userReacted: true
      });
    }

    this.saveToStorage();
    this.notify();
  }
}

export const socialNetworkService = new SocialNetworkService();
