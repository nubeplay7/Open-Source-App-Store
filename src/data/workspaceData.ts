import { NotebookDocument, JiraDevTask, SlackDevChannel, SlackDevMessage } from '../types';

export const INITIAL_NOTEBOOK_DOCS: NotebookDocument[] = [
  {
    id: 'note-1',
    title: 'Visión Estratégica 2026-2027: Civer App Store Ecosystem',
    folder: 'Roadmap 2026',
    tags: ['#vision', '#ecosystem', '#android15', '#zero-trackers'],
    lastModified: 'Hace 10 minutos',
    author: 'Oscar Manuel (Lead Architect)',
    isPinned: true,
    linkedModules: ['Multi-Engine UI Shell', 'Package Installation Sub-system'],
    linkedTasks: ['CIBER-101', 'CIBER-104'],
    content: `# Visión Estratégica Civer App Store 2026-2027

## 1. Filosofía Central
Civer App Store es el ecosistema definitivo de distribución de software libre para Android. Combinamos la fluidez visual de las tiendas modernas con la **soberanía tecnológica absoluta**:
- **0% Rastreadores de Telemetría Comercial**
- **100% Criptografía y Verificación de Firmas**
- **Compilador Cloud Nativo con GitHub Actions**
- **Instalador Rootless asistido por Shizuku / Privileged Extension**

## 2. Pilares de Desarrollo
1. **Index V2 Zero-Spike Streaming**: Eliminación total del parsing XML pesado. Ingesta delta en streaming JSON.
2. **Delta Updates (Bsdiff/Zstd)**: Actualizaciones diferenciales para reducir el uso de datos en un 85-95%.
3. **Workspace de Planeación Viva**: Sincronización continua entre ideas (Notebook), tareas de ejecución (Jira), debates técnicos (Slack) y el Registro de Cambios (Changelog Ledger).

> "Cada línea de código implementada se somete a verificación bit-a-bit y se documenta en el Ledger inmutable."
`
  },
  {
    id: 'note-2',
    title: 'ADR-004: Adopción del Formato Index V2 en Streaming',
    folder: 'ADR (Decisiones)',
    tags: ['#adr', '#index-v2', '#performance', '#json-stream'],
    lastModified: 'Hace 45 minutos',
    author: 'Ciber Core Team',
    isPinned: true,
    linkedModules: ['App Catalog & Metadata Engine'],
    linkedTasks: ['CIBER-102'],
    content: `# ADR-004: Ingesta de Metadatos con Index V2 Streaming

## Estado: APROBADO / EN PRODUCCIÓN (v3.1)

### Contexto
El formato histórico \`index.xml\` de F-Droid supera habitualmente los 28MB descomprimidos en memoria heap, causando caídas por OOM en dispositivos con recursos moderados.

### Decisión
Adoptar el estándar **F-Droid Index V2** (\`entry.json\` + fragmentos JSON cacheados):
- Descarga inicial de cabecera de solo 2.4 KB.
- Stream incremental con chunks de 64KB procesados por Web Workers en background.
- Consumo de RAM en Idle restringido a **< 12 MB**.

### Consecuencias Positivas
- Ahorro de ancho de banda: **-92%**
- Tiempo de refresco: reducido de 14.8s a **1.2s**
- Verificación criptográfica con clave pública Ed25519 integrada.
`
  },
  {
    id: 'note-3',
    title: 'Especificación del Motor de Instalación Rootless (Shizuku API)',
    folder: 'Arquitectura',
    tags: ['#shizuku', '#adb-wireless', '#security', '#package-installer'],
    lastModified: 'Ayer',
    author: 'Security Lead',
    isPinned: false,
    linkedModules: ['Security & Permissions', 'Package Installation Sub-system'],
    linkedTasks: ['CIBER-101'],
    content: `# Especificación: Shizuku IPC Daemon Bridge

## Arquitectura de Permisos
1. El cliente Civer App Store se conecta al socket de Shizuku vía Binder IPC (\`moe.shizuku.server\`).
2. Se solicita el permiso \`moe.shizuku.manager.permission.API_V23\`.
3. Al recibir la autorización del usuario:
   - Se invoca \`IPackageInstaller.createSession(SessionParams)\`.
   - Se escribe el stream APK directamente al file descriptor.
   - Se confirma la sesión vía \`PackageInstaller.Session.commit()\`.

### Seguridad
- Ningún binario se ejecuta con privilegios root inseguros sin confirmar el hash SHA-256.
- Aislamiento completo de procesos en espacio de usuario.
`
  },
  {
    id: 'note-4',
    title: 'Guía de Auditoría de Rastreadores (Exodus Privacy Integration)',
    folder: 'Seguridad & FOSS',
    tags: ['#exodus', '#audit', '#privacy', '#trackers'],
    lastModified: 'Hace 2 días',
    author: 'Security Auditor',
    isPinned: false,
    linkedModules: ['Matrix Analytics & RAM Benchmarks'],
    linkedTasks: ['CIBER-106'],
    content: `# Auditoría Exodus Privacy para Civer App Store

## Reglas de Admisión de APKs
1. **0 Rastreadores Publicitarios**: Se prohíbe Google AdMob, Unity Ads, Facebook Audience Network.
2. **0 Rastreadores de Perfilado**: Prohibido Firebase Analytics con identificadores de dispositivo persistentes sin consentimiento previo.
3. **Firmas Verificadas**: Todo paquete debe coincidir con el repositorio de código abierto en GitHub/GitLab.
`
  },
  {
    id: 'note-5',
    title: 'ADR-007: Arquitectura de Perfiles de Diseño y Feature Flags No Destructivos',
    folder: 'ADR (Decisiones)',
    tags: ['#adr', '#design-system', '#feature-flags', '#zero-regression'],
    lastModified: 'Hace unos momentos',
    author: 'Oscar Manuel (Lead Architect)',
    isPinned: true,
    linkedModules: ['Theme & Design Profiles Engine', 'Functionality Feature Flags Matrix'],
    linkedTasks: ['CIBER-108', 'CIBER-109'],
    content: `# ADR-007: Sistema de Perfiles de Diseño y Matriz de Flags No Destructiva

## Estado: APROBADO / EN PRODUCCIÓN (Iteración 6)

### Principio Fundamental
**"Cero Sobrescritura y Coexistencia Total"**: Ninguna funcionalidad, vista o paleta de color puede reemplazar de manera destructiva o permanente a otra. En su lugar, el sistema expone:
1. **8 Paletas Cromáticas Intercambiables**: Titanio Oscuro, Escarcha Luminosa, OLED Ciber-Matrix (#000), Cyber Violet (HyperOS), Cupertino Glass (iOS), Terminal Retro Ámbar, Bosque Solarized Jade y Azul Medianoche.
2. **Perfiles de Densidad y Curvatura**: Compacto, Equilibrado y Espacioso, con radios Sharp (4px), Modern (16px), Rounded Pill (24px) y Cupertino Glass (20px).
3. **5 Presets de Funcionalidad**: Full Power Dev, Purista FOSS, Tienda Casual, Auditor de Seguridad y Ahorro Ultra de Batería.
4. **Matriz de 16 Feature Flags**: Activación y desactivación granular de cada subsistema en tiempo de ejecución.

### Beneficios Técnicos
- Cero regresiones entre versiones.
- Adaptabilidad ergonómica para cualquier tipo de dispositivo (teléfono, tablet, monitor de escritorio o terminal OLED).
`
  },
  {
    id: 'note-6',
    title: 'Especificación Criptográfica de la Bóveda de Llaves (APK Signature Scheme v1-v4)',
    folder: 'Seguridad & FOSS',
    tags: ['#keystore', '#apksigner', '#scheme-v4', '#cryptography'],
    lastModified: 'Hace 1 hora',
    author: 'Security Auditor',
    isPinned: false,
    linkedModules: ['Keystore Cryptographic Vault', 'Cloud CI GitHub Compiler'],
    linkedTasks: ['CIBER-108'],
    content: `# Especificación: Bóveda de Llaves Keystore & APK Signature Schemes

## Esquemas de Firma Soportados
1. **v1 (JAR Signature)**: Compatibilidad heredada con Android 4.0+.
2. **v2 (APK Signing Block)**: Protección contra alteraciones en el archivo ZIP entero (Android 7.0+).
3. **v3 (Key Rotation Proof)**: Soporta rotación segura de claves sin romper la compatibilidad de actualizaciones (Android 9.0+).
4. **v4 (Streaming Tree-Hash Signature)**: Habilita instalación incremental en streaming para APKs pesados sin esperar la descarga completa (Android 11+).

## Algoritmos Criptográficos
- **RSA 4096-bit** con SHA-256 / SHA-512
- **ECDSA P-256 / P-384** con curva elíptica de alto rendimiento
- **Ed25519** para repositorios descentralizados
`
  }
];


export const INITIAL_JIRA_TASKS: JiraDevTask[] = [
  {
    id: 'task-1',
    key: 'CIBER-101',
    title: 'Motor de Instalación Silenciosa Rootless con Shizuku API',
    description: 'Implementar el puente Binder IPC y flujo de autorización inalámbrica ADB para instalar APKs sin prompts repetitivos en Android 14/15.',
    type: 'FEATURE',
    status: 'DONE',
    priority: 'CRITICAL',
    assignee: 'Oscar Manuel',
    assigneeAvatar: 'bg-emerald-600',
    storyPoints: 8,
    sprint: 'Sprint 3 (Core Engines)',
    tags: ['#shizuku', '#installer', '#android15'],
    linkedChangelogVersion: 'v2.0',
    createdAt: '2026-08-28',
    completedAt: '2026-08-30'
  },
  {
    id: 'task-2',
    key: 'CIBER-102',
    title: 'Worker de Streaming para Ingesta de Repositorios F-Droid Index V2',
    description: 'Reemplazar el parser XML síncrono por worker asíncrono que ingiere entry.json y bloques delta con validación Ed25519.',
    type: 'ARCHITECTURE',
    status: 'DONE',
    priority: 'HIGH',
    assignee: 'Core Dev',
    assigneeAvatar: 'bg-cyan-600',
    storyPoints: 5,
    sprint: 'Sprint 3 (Core Engines)',
    tags: ['#index-v2', '#streaming', '#performance'],
    linkedChangelogVersion: 'v3.1',
    createdAt: '2026-08-29',
    completedAt: '2026-08-31'
  },
  {
    id: 'task-3',
    key: 'CIBER-103',
    title: 'Compresión Binaria Diferencial Delta Updates (Bsdiff + Zstd)',
    description: 'Módulo de generación y aplicación de parches binarios bit-a-bit para ahorrar hasta 90% en descargas de actualización de apps instaladas.',
    type: 'OPTIMIZATION',
    status: 'DONE',
    priority: 'HIGH',
    assignee: 'Oscar Manuel',
    assigneeAvatar: 'bg-emerald-600',
    storyPoints: 8,
    sprint: 'Sprint 3 (Core Engines)',
    tags: ['#delta-patch', '#bsdiff', '#data-saver'],
    linkedChangelogVersion: 'v3.1',
    createdAt: '2026-08-30',
    completedAt: '2026-08-31'
  },
  {
    id: 'task-4',
    key: 'CIBER-104',
    title: 'Ciber Workspace: Sistema Todo-en-Uno Obsidian + Jira + Slack',
    description: 'Plataforma unificada para desarrolladores con edición de notas en Markdown, tablero Kanban ágil, canales de debate técnico e integración bidireccional con el Changelog.',
    type: 'FEATURE',
    status: 'DONE',
    priority: 'CRITICAL',
    assignee: 'Oscar Manuel',
    assigneeAvatar: 'bg-purple-600',
    storyPoints: 13,
    sprint: 'Sprint 4 (Dev Collaboration Hub)',
    tags: ['#workspace', '#obsidian', '#jira', '#slack', '#changelog'],
    linkedChangelogVersion: 'v4.0',
    createdAt: '2026-08-31',
    completedAt: '2026-08-31'
  },
  {
    id: 'task-5',
    key: 'CIBER-105',
    title: 'Soporte para Plugins Comunitarios FOSS vía WebAssembly (WASM)',
    description: 'Permitir que la comunidad agregue evaluadores de código, desensambladores DEX y calculadoras de hash como extensiones de Civer App Store.',
    type: 'ARCHITECTURE',
    status: 'DONE',
    priority: 'MEDIUM',
    assignee: 'Core Dev',
    assigneeAvatar: 'bg-blue-600',
    storyPoints: 5,
    sprint: 'Sprint 4 (Dev Collaboration Hub)',
    tags: ['#wasm', '#plugins', '#extensibility'],
    linkedChangelogVersion: 'v10.0',
    createdAt: '2026-08-31',
    completedAt: '2026-09-02'
  },
  {
    id: 'task-6',
    key: 'CIBER-106',
    title: 'Detección en tiempo real de Anti-Features y auditoría estricta',
    description: 'Panel de advertencia para aplicaciones que dependan de servicios no libres o que promuevan software privativo en su código fuente.',
    type: 'SECURITY',
    status: 'DONE',
    priority: 'HIGH',
    assignee: 'Security Auditor',
    assigneeAvatar: 'bg-rose-600',
    storyPoints: 3,
    sprint: 'Sprint 4 (Dev Collaboration Hub)',
    tags: ['#anti-features', '#exodus', '#audit'],
    linkedChangelogVersion: 'v10.0',
    createdAt: '2026-08-31',
    completedAt: '2026-09-02'
  },
  {
    id: 'task-8',
    key: 'CIBER-108',
    title: 'Motor de Perfiles de Diseño y 8 Paletas de Color Intercambiables',
    description: 'Implementar selector de temas sin sobrescrituras (Titanio, Escarcha, OLED, Cyber Violet, Cupertino Glass, Terminal Ámbar, Bosque Jade, Midnight) con densidad de UI y radio de borde.',
    type: 'FEATURE',
    status: 'DONE',
    priority: 'CRITICAL',
    assignee: 'Oscar Manuel',
    assigneeAvatar: 'bg-emerald-600',
    storyPoints: 8,
    sprint: 'Sprint 5 (Profiles & Feature Flags)',
    tags: ['#design-profiles', '#color-palettes', '#oled', '#cupertino', '#theming'],
    linkedChangelogVersion: 'v6.0',
    createdAt: '2026-08-31',
    completedAt: '2026-08-31'
  },
  {
    id: 'task-9',
    key: 'CIBER-109',
    title: 'Matriz de Perfiles de Funcionalidades y 16 Feature Flags en Tiempo Real',
    description: 'Crear gestor de presets de funcionalidad (DevOps, Purista FOSS, Casual, Seguridad, Ahorro) y conmutación granular sin romper estado.',
    type: 'ARCHITECTURE',
    status: 'DONE',
    priority: 'CRITICAL',
    assignee: 'Core Dev',
    assigneeAvatar: 'bg-purple-600',
    storyPoints: 8,
    sprint: 'Sprint 5 (Profiles & Feature Flags)',
    tags: ['#feature-flags', '#functionality-profiles', '#modular-system'],
    linkedChangelogVersion: 'v6.0',
    createdAt: '2026-08-31',
    completedAt: '2026-08-31'
  },
  {
    id: 'task-7',
    key: 'CIBER-107',
    title: 'Sincronización P2P Local mediante Wi-Fi Direct / Nearby FOSS',
    description: 'Compartir APKs compilados y catálogos directamente entre dispositivos locales sin conexión a internet ni servidores centrales.',
    type: 'FEATURE',
    status: 'DONE',
    priority: 'MEDIUM',
    assignee: 'Open Contributor',
    assigneeAvatar: 'bg-amber-600',
    storyPoints: 8,
    sprint: 'Sprint 5 (Profiles & Feature Flags)',
    tags: ['#p2p', '#offline', '#wifi-direct', '#nearby'],
    linkedChangelogVersion: 'v7.0',
    createdAt: '2026-08-31',
    completedAt: '2026-09-01'
  },
  {
    id: 'task-10',
    key: 'CIBER-110',
    title: 'Firma Criptográfica con Llaves Físicas FIDO2 / YubiKey HSM',
    description: 'Integrar WebAuthn / CTAP2 para firmar certificados y checksums de release con tokens de hardware físico USB/NFC.',
    type: 'SECURITY',
    status: 'DONE',
    priority: 'HIGH',
    assignee: 'Security Auditor',
    assigneeAvatar: 'bg-rose-600',
    storyPoints: 8,
    sprint: 'Sprint 6 (Hardware Security & Cloud Sync)',
    tags: ['#yubikey', '#fido2', '#hsm', '#crypto'],
    linkedChangelogVersion: 'v11.0',
    createdAt: '2026-09-02',
    completedAt: '2026-09-02'
  },
  {
    id: 'task-11',
    key: 'CIBER-111',
    title: 'Respaldo Cifrado Zero-Knowledge E2EE con WebCrypto AES-GCM 256',
    description: 'Cifrado de extremo a extremo de ajustes y credenciales de usuario antes de su exportación o sincronización.',
    type: 'ARCHITECTURE',
    status: 'DONE',
    priority: 'MEDIUM',
    assignee: 'Oscar Manuel',
    assigneeAvatar: 'bg-purple-600',
    storyPoints: 5,
    sprint: 'Sprint 6 (Hardware Security & Cloud Sync)',
    tags: ['#zero-knowledge', '#aes-gcm', '#crypto', '#backup'],
    linkedChangelogVersion: 'v11.0',
    createdAt: '2026-09-02',
    completedAt: '2026-09-02'
  },
  {
    id: 'task-12',
    key: 'CIBER-112',
    title: 'Micro-Mecenazgo Descentralizado FOSS mediante Bitcoin Lightning Network / WebLN',
    description: 'Financiamiento directo y sin comisiones para desarrolladores de software libre mediante invoices BOLT11 y WebLN 1-Click.',
    type: 'FEATURE',
    status: 'DONE',
    priority: 'HIGH',
    assignee: 'Oscar Manuel',
    assigneeAvatar: 'bg-amber-600',
    storyPoints: 5,
    sprint: 'Sprint 6 (Hardware Security & Cloud Sync)',
    tags: ['#lightning', '#webln', '#microdonaciones', '#bolt11'],
    linkedChangelogVersion: 'v11.0',
    createdAt: '2026-09-02',
    completedAt: '2026-09-02'
  }
];

export const INITIAL_SLACK_CHANNELS: SlackDevChannel[] = [
  {
    id: 'chan-general',
    name: 'general',
    topic: 'Anuncios oficiales y estado general del ecosistema Civer App Store',
    description: 'Canal principal para coordinar lanzamientos, hitos y noticias del equipo.',
    unreadCount: 0,
    memberCount: 18
  },
  {
    id: 'chan-architecture',
    name: 'dev-architecture',
    topic: 'Debate técnico sobre ART VM, Shizuku IPC, Delta Patches e Index V2',
    description: 'Discusión de decisiones de bajo nivel, optimización de memoria y protocolos.',
    unreadCount: 2,
    memberCount: 12
  },
  {
    id: 'chan-ciber-store',
    name: 'civer-store-engine',
    topic: 'Diseño visual de Civer App Store, catálogo de apps, reviews y experiencia de usuario',
    description: 'Coordinación de UI/UX, animaciones fluidas, tema Material You e i18n.',
    unreadCount: 0,
    memberCount: 15
  },
  {
    id: 'chan-ci-compiler',
    name: 'ci-compiler-bot',
    topic: 'Alertas en tiempo real de GitHub Actions, pipelines de compilación y APKs listos',
    description: 'Logs automáticos de builds, firmas sha256 y descargas de binarios.',
    unreadCount: 1,
    memberCount: 9
  },
  {
    id: 'chan-proposals',
    name: 'proposals-and-vision',
    topic: 'Análisis de propuestas comunitarias, votación y roadmap 2026-2027',
    description: 'Espacio para formular ideas y someterlas al análisis técnico del agente IA.',
    unreadCount: 0,
    memberCount: 24
  }
];

export const INITIAL_SLACK_MESSAGES: SlackDevMessage[] = [
  {
    id: 'msg-1',
    channelId: 'chan-general',
    senderName: 'Oscar Manuel',
    senderEmail: 'civer.team.cloud@gmail.com',
    senderAvatar: 'O',
    senderRole: 'Lead Architect',
    content: '¡Bienvenidos a **Civer Dev Workspace**! Hemos integrado el espacio de trabajo para que todo lo que planifiquemos en notas y tareas se sincronice automáticamente con el Registro de Cambios.',
    timestamp: 'Hoy a las 09:15',
    reactions: [
      { emoji: '🚀', count: 7, userReacted: true },
      { emoji: '🔥', count: 5, userReacted: true },
      { emoji: '⚡', count: 4 }
    ],
    threadRepliesCount: 3
  },
  {
    id: 'msg-2',
    channelId: 'chan-general',
    senderName: 'AI Copilot',
    senderEmail: 'agent@civerapp.store',
    senderAvatar: '🤖',
    senderRole: 'AI Copilot',
    content: 'Informe del sistema: La migración de nombres a **Civer App Store** ha sido verificada en todos los puntos de entrada. Todos los módulos (Compilador CI, Shizuku, Index V2, Delta Updates) están operando con métricas nominales.',
    timestamp: 'Hoy a las 09:18',
    reactions: [
      { emoji: '✅', count: 6, userReacted: true }
    ],
    threadRepliesCount: 0,
    isBot: true
  },
  {
    id: 'msg-3',
    channelId: 'chan-architecture',
    senderName: 'Oscar Manuel',
    senderEmail: 'civer.team.cloud@gmail.com',
    senderAvatar: 'O',
    senderRole: 'Lead Architect',
    content: 'Hemos logrado una reducción del 91% en la transferencia de datos con el módulo **Bsdiff + Zstd**. Miren la tabla de compresión para NewPipe v0.27.0:',
    timestamp: 'Hoy a las 10:04',
    codeSnippet: {
      language: 'bash',
      code: `$ bsdiff newpipe-v0.26.1.apk newpipe-v0.27.0.apk delta.patch
$ zstd -19 -T0 delta.patch -o delta.patch.zst
[STATS] Original: 48.5MB -> Delta Patch: 4.2MB (Ahorro: 91.3%)
[VERIFIED] Signature Scheme v3 checksum matched!`
    },
    reactions: [
      { emoji: '🎉', count: 8, userReacted: true },
      { emoji: '💡', count: 3 }
    ],
    threadRepliesCount: 5
  },
  {
    id: 'msg-4',
    channelId: 'chan-architecture',
    senderName: 'Core Dev',
    senderEmail: 'core.dev@ciber.store',
    senderAvatar: 'C',
    senderRole: 'Core Dev',
    content: 'Excelente resultado. El worker de streaming en JavaScript/WASM ya puede reconstruir el APK final en menos de 450ms directamente en el dispositivo.',
    timestamp: 'Hoy a las 10:12',
    reactions: [
      { emoji: '👏', count: 4 }
    ],
    threadRepliesCount: 0
  },
  {
    id: 'msg-5',
    channelId: 'chan-ci-compiler',
    senderName: 'CI/CD Bot',
    senderEmail: 'github-actions@ciber.store',
    senderAvatar: '⚙️',
    senderRole: 'CI/CD Bot',
    content: '✅ **Build #2026-0831-01 Exitoso**: `app-ciber-store-release.apk` compilado en 1m 42s vía runner `ubuntu-24.04` con Java 21 y Android SDK 35.',
    timestamp: 'Hoy a las 10:30',
    codeSnippet: {
      language: 'yaml',
      code: `run_id: 856150986593
sha256: 7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
size: 14.8 MB
status: COMPLETED`
    },
    reactions: [
      { emoji: '📦', count: 5 }
    ],
    threadRepliesCount: 0,
    isBot: true
  }
];
