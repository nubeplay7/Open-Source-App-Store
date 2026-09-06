import { SystemProposal } from '../types';

export const INITIAL_PROPOSALS: SystemProposal[] = [
  {
    id: 'prop-001',
    title: 'Sincronización en segundo plano con F-Droid Index V2 y notificaciones de actualización',
    description: 'Implementar un motor de polling ligero basado en Web Workers / IndexedDB para descargar y parsear el index-v2.json de repositorios F-Droid oficiales y de terceros, notificando al usuario de nuevas versiones disponibles.',
    submittedBy: 'Oscar Manuel',
    userEmail: 'civer.team.cloud@gmail.com',
    category: 'REPOSITORIES_SYNC',
    priorityVotes: 48,
    userHasVoted: false,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-30',
    tags: ['F-Droid V2', 'Web Workers', 'Notificaciones', 'IndexedDB'],
    aiAnalysis: {
      technicalFeasibilityScore: 94,
      architecturalImpact: 'Medio. Requiere un módulo de almacenamiento local con IndexedDB para evitar saturar la memoria RAM y un parser de streaming para archivos JSON de más de 30MB.',
      recommendedPhase: 'Fase 1 de Iteración 4',
      estimatedComplexity: 'MEDIA',
      agentNotes: 'Implementado con éxito mediante RepoIndexSyncModal con descarga de entry.json y verificación de huella.',
      requiredComponents: ['IndexSyncWorker', 'RepositoryStore', 'UpdateNotifierBanner', 'RepoIndexSyncModal']
    }
  },
  {
    id: 'prop-002',
    title: 'Integración de WebUSB / WebADB para instalación directa física en dispositivos Android',
    description: 'Permitir que el usuario conecte su teléfono mediante cable USB al navegador y utilice la API WebUSB con adb.js para enviar e instalar los APKs compilados directamente sin necesidad de descargar el archivo manualmente.',
    submittedBy: 'DevFoss_Community',
    userEmail: 'community@fossmatrix.dev',
    category: 'SECURITY_SHIZUKU',
    priorityVotes: 62,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-30',
    tags: ['WebUSB', 'WebADB', 'Instalación Directa', 'Hardware'],
    aiAnalysis: {
      technicalFeasibilityScore: 98,
      architecturalImpact: 'Alto. Añade un subsistema de comunicación por streaming USB con protocolo ADB en el cliente, permitiendo silent install sin intermediarios.',
      recommendedPhase: 'Iteración 10 (Completada)',
      estimatedComplexity: 'ALTA',
      agentNotes: 'Completado e integrado en WebAdbPhysicalInstallerModal y como 5to método en NativeSilentInstallerModal.',
      requiredComponents: ['WebAdbManager', 'UsbDevicePairingModal', 'AdbStreamInstaller', 'WebAdbPhysicalInstallerModal']
    }
  },
  {
    id: 'prop-003',
    title: 'Simulador y Escáner de Rastreadores Exodus Privacy integrado en la ficha de cada App',
    description: 'Incorporar una pestaña interactiva dentro del detalle de cada aplicación que desglose todas las firmas de trackers de telemetría (Google Analytics, Facebook, Adjust, AppsFlyer, etc.) y analice permisos peligrosos de Android.',
    submittedBy: 'PrivacyAdvocate_99',
    userEmail: 'audit@privacyguard.io',
    category: 'PLAY_STORE_PARITY',
    priorityVotes: 35,
    userHasVoted: false,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-30',
    tags: ['Exodus Privacy', 'Auditoría', 'Seguridad', 'Permisos'],
    aiAnalysis: {
      technicalFeasibilityScore: 98,
      architecturalImpact: 'Bajo. Se alimenta del dataset de permisos y firmas de telemetría pre-calculado en appsCatalogData.ts.',
      recommendedPhase: 'Iteración 3 (Completada)',
      estimatedComplexity: 'BAJA',
      agentNotes: 'Implementado con éxito en el modal de detalle de aplicación y en el flujo del instalador APK.',
      requiredComponents: ['ExodusTrackerBadge', 'PermissionSecurityAuditGrid']
    }
  },
  {
    id: 'prop-004',
    title: 'Compilación Multi-Arquitectura (arm64-v8a, armeabi-v7a, x86_64) con matriz de runners en GitHub CI',
    description: 'Actualizar el generador de workflows YAML para permitir compilar matrices de arquitectura separadas (`split-per-abi`) o APKs universales con optimización de tamaño mediante ProGuard/R8.',
    submittedBy: 'AndroidArchitect',
    userEmail: 'devops@ci-foss.org',
    category: 'CLOUD_CI_COMPILER',
    priorityVotes: 41,
    userHasVoted: false,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-30',
    tags: ['Multi-ABI', 'Gradle Matrix', 'R8 ProGuard', 'Optimización'],
    aiAnalysis: {
      technicalFeasibilityScore: 97,
      architecturalImpact: 'Medio. Modifica el generador de plantillas YAML de GitHub Actions y el visor de artefactos generados.',
      recommendedPhase: 'Iteración 10 (Completada)',
      estimatedComplexity: 'MEDIA',
      agentNotes: 'Implementado con selector de ABI (arm64-v8a, armeabi-v7a, x86_64, universal) y generador de Gradle splits en GitHubCompilerModal.',
      requiredComponents: ['YamlMatrixBuilder', 'AbiSelectorDropdown', 'ArtifactSplitViewer', 'GitHubCompilerModal']
    }
  },
  {
    id: 'prop-005',
    title: 'Modo Offline Completo con Service Worker PWA (Progressive Web App)',
    description: 'Configurar manifiesto de aplicación web progresiva y caché de service worker para que todo el catálogo, matriz y guías funcionen sin conexión a internet.',
    submittedBy: 'NómadaDigital_Mx',
    userEmail: 'offline@nomada.tech',
    category: 'UI_UX_RESPONSIVE',
    priorityVotes: 29,
    userHasVoted: false,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-30',
    tags: ['PWA', 'Offline First', 'Service Worker', 'Cache API'],
    aiAnalysis: {
      technicalFeasibilityScore: 98,
      architecturalImpact: 'Bajo. Configuración de Workbox o Service Worker en Vite y manifest.webmanifest.',
      recommendedPhase: 'Iteración 10 (Completada)',
      estimatedComplexity: 'BAJA',
      agentNotes: 'Implementado con OfflinePwaDiagnosticsModal, monitor de cuota de Storage API y pre-caché completo para supervivencia offline.',
      requiredComponents: ['PwaInstallPrompt', 'ServiceWorkerRegistration', 'OfflineBanner', 'OfflinePwaDiagnosticsModal']
    }
  },
  {
    id: 'prop-006',
    title: 'Gamificación de Play Points y Canje de Insignias de Desarrollador FOSS',
    description: 'Sistema interactivo donde el usuario gane Puntos Play simulados por compilar apps, instalar paquetes de código abierto y redactar reseñas útiles, permitiendo canjear temas visuales exclusivos.',
    submittedBy: 'Oscar Manuel',
    userEmail: 'civer.team.cloud@gmail.com',
    category: 'PLAY_STORE_PARITY',
    priorityVotes: 54,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-30',
    tags: ['Play Points', 'Gamificación', 'Recompensas', 'Temas'],
    aiAnalysis: {
      technicalFeasibilityScore: 95,
      architecturalImpact: 'Bajo. Manejado por el motor de estado del perfil de usuario (`UserProfile`).',
      recommendedPhase: 'Iteración 3 / Iteración 4',
      estimatedComplexity: 'BAJA',
      agentNotes: 'Excelente para aumentar el compromiso del usuario y educar sobre la importancia de apoyar a los mantenedores FOSS.',
      requiredComponents: ['PlayPointsTierCard', 'PerksRedeemModal', 'AchievementBadgeGrid']
    }
  },
  {
    id: 'prop-007',
    title: 'Motor de Perfiles de Diseño, Paletas Cromáticas y Estilos no Destructivos',
    description: 'Permitir seleccionar entre 8 paletas temáticas (Titanio, Escarcha, OLED #000, Cyber Violet, Cupertino Glass, Ámbar Terminal, Bosque Jade, Midnight) y ajustar densidad y curvatura de bordes sin alterar la estructura del sistema.',
    submittedBy: 'Oscar Manuel',
    userEmail: 'civer.team.cloud@gmail.com',
    category: 'UI_UX_RESPONSIVE',
    priorityVotes: 89,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-31',
    tags: ['Perfiles de Diseño', 'Paletas de Color', 'OLED Matrix', 'Cupertino Glass', 'Densidad UI'],
    aiAnalysis: {
      technicalFeasibilityScore: 99,
      architecturalImpact: 'Medio. Implementa un sistema de diseño desacoplado donde los tokens visuales se inyectan dinámicamente mediante el estado reactivo de React.',
      recommendedPhase: 'Iteración 6',
      estimatedComplexity: 'BAJA',
      agentNotes: 'Crucial para cumplir la directiva del usuario de permitir personalización absoluta sin destruir ni sobrescribir ninguna vista previa.',
      requiredComponents: ['ThemeAndDesignProfileModal', 'themeProfilesData', 'DesignSystemSettings']
    }
  },
  {
    id: 'prop-008',
    title: 'Matriz de Perfiles de Funcionalidades y Control Granular de Feature Flags',
    description: 'Sistema para conmutar entre perfiles de uso (DevOps, Purista FOSS, Casual, Seguridad, Ahorro Batería) y habilitar/deshabilitar de forma independiente cualquiera de los 16 módulos de la plataforma sin que choquen.',
    submittedBy: 'Oscar Manuel',
    userEmail: 'civer.team.cloud@gmail.com',
    category: 'COMMUNITY_EXTENSIONS',
    priorityVotes: 95,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-31',
    tags: ['Feature Flags', 'Perfiles Funcionales', 'Modularidad', 'Desacoplamiento'],
    aiAnalysis: {
      technicalFeasibilityScore: 98,
      architecturalImpact: 'Alto. Proporciona control declarativo sobre la visibilidad y ejecución de cada componente del sistema mediante un objeto de configuración inmutable.',
      recommendedPhase: 'Iteración 6',
      estimatedComplexity: 'MEDIA',
      agentNotes: 'Garantiza que el usuario pueda tener una tienda simple o una estación de trabajo completa para hackers con solo presionar un botón.',
      requiredComponents: ['FunctionalityProfilesModal', 'functionalityProfilesData', 'FeatureFlagsConfig']
    }
  },
  {
    id: 'prop-009',
    title: 'Compartición de APKs P2P por Wi-Fi Direct y WebRTC DataChannels (Nearby FOSS)',
    description: 'Protocolo de transmisión local peer-to-peer sin conexión a internet para compartir archivos APK firmados entre dos dispositivos Android en la misma red local o mediante hotspot.',
    submittedBy: 'MeshNetwork_Lab',
    userEmail: 'mesh@p2pfoss.net',
    category: 'COMMUNITY_EXTENSIONS',
    priorityVotes: 73,
    userHasVoted: false,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-31',
    tags: ['P2P', 'Wi-Fi Direct', 'WebRTC', 'Offline Mesh', 'Nearby Share'],
    aiAnalysis: {
      technicalFeasibilityScore: 94,
      architecturalImpact: 'Alto. Requiere señalización WebRTC local mediante mDNS o escaneo de código QR bidireccional.',
      recommendedPhase: 'Iteración 7 (Completada)',
      estimatedComplexity: 'ALTA',
      agentNotes: 'Implementado completamente con NearbyTransferModal y emparejamiento QR visual.',
      requiredComponents: ['NearbyTransferModal', 'WebRtcP2pEngine', 'QrPairingScanner']
    }
  },
  {
    id: 'prop-010',
    title: 'Descompilador WebAssembly DEX/Smali y Visor de AndroidManifest.xml binario en vivo',
    description: 'Integrar un visor de bytecode para inspeccionar clases decompiladas, strings, URLs embebidas y certificados X.509 de cualquier APK sin instalar herramientas externas.',
    submittedBy: 'ReverseEngineer_Pro',
    userEmail: 're@secfoss.org',
    category: 'SECURITY_SHIZUKU',
    priorityVotes: 67,
    userHasVoted: false,
    status: 'IMPLEMENTED',
    createdAt: '2026-08-31',
    tags: ['WASM Decompiler', 'Smali Bytecode', 'AndroidManifest Inspector', 'Auditoría Profunda'],
    aiAnalysis: {
      technicalFeasibilityScore: 92,
      architecturalImpact: 'Medio-Alto. Emplea un binario WebAssembly de Baksmali para desensamblar el archivo classes.dex en tiempo real en el cliente.',
      recommendedPhase: 'Iteración 7 (Completada)',
      estimatedComplexity: 'ALTA',
      agentNotes: 'Completamente operativo a través de DexDecompilerModal con análisis de strings y árbol de clases.',
      requiredComponents: ['DexDecompilerModal', 'SmaliCodeViewer', 'BinaryXmlDecoder']
    }
  },
  {
    id: 'prop-011',
    title: 'Motor de Instalación Silenciosa 1-Click de Fábrica con Privileged System App y Shizuku',
    description: 'Instalación de paquetes APK en segundo plano sin diálogos de orígenes desconocidos ni confirmaciones repetitivas de usuario mediante canales de privilegio de sistema operativo.',
    submittedBy: 'Oscar Manuel',
    userEmail: 'civer.team.cloud@gmail.com',
    category: 'SECURITY_SHIZUKU',
    priorityVotes: 98,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-09-02',
    tags: ['Silent Installer', 'Privileged App', 'Shizuku', 'Device Owner', 'Android 12+ API'],
    aiAnalysis: {
      technicalFeasibilityScore: 99,
      architecturalImpact: 'Crítico. Proporciona paridad completa con Google Play Store eliminando cualquier fricción en instalaciones y actualizaciones.',
      recommendedPhase: 'Iteración 9',
      estimatedComplexity: 'ALTA',
      agentNotes: 'Completamente integrado y funcional con terminal interactiva y diagnóstico de permisos.',
      requiredComponents: ['NativeSilentInstallerModal', 'Navbar', 'AppDetailModal']
    }
  },
  {
    id: 'prop-012',
    title: 'Suite de 60 Innovaciones de Clase Mundial en 12 Pilares Arquitectónicos',
    description: 'Atestación Cosign/Rekor, builds reproducibles NixOS, Nostr WoT reviews, P2P IPFS/BitTorrent, True OLED Black, IA local On-Device Wasm, Tor SOCKS5, Forense DEX y MicroG proxy.',
    submittedBy: 'DevFoss_Core_Team',
    userEmail: 'core@fossmatrix.dev',
    category: 'PLAY_STORE_PARITY',
    priorityVotes: 114,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-09-02',
    tags: ['Cosign', 'Rekor', 'NixOS', 'Nostr', 'IPFS', 'Tor', 'On-Device AI', 'Arweave', 'MicroG'],
    aiAnalysis: {
      technicalFeasibilityScore: 97,
      architecturalImpact: 'Transformacional. Establece el estándar de software libre más avanzado del mundo.',
      recommendedPhase: 'Iteración 9',
      estimatedComplexity: 'CRÍTICA_ESTRUCTURAL',
      agentNotes: 'Suite completa con 60 módulos operativos, simulaciones criptográficas y consola de ejecución en vivo.',
      requiredComponents: ['WorldClassInnovationsHubModal', 'CommandPalette', 'ThemeProfiles']
    }
  },
  {
    id: 'prop-013',
    title: 'Firma de APKs con Llaves Físicas FIDO2 / YubiKey Hardware Security Module (HSM)',
    description: 'Integrar la API WebAuthn / CTAP2 para permitir que mantenedores firmen manifiestos de release y hashes de APKs tocando una llave física de hardware YubiKey / Nitrokey sin exponer la clave privada al host.',
    submittedBy: 'Oscar Manuel',
    userEmail: 'civer.team.cloud@gmail.com',
    category: 'SECURITY_SHIZUKU',
    priorityVotes: 142,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-09-02',
    tags: ['YubiKey', 'FIDO2', 'WebAuthn', 'HSM', 'Firma Hardware'],
    aiAnalysis: {
      technicalFeasibilityScore: 95,
      architecturalImpact: 'Crítico en seguridad. Implementado en WebAuthnHsmSignerModal con selección de hardware YubiKey/Nitrokey/Titan, algoritmos ES256/EdDSA/PS256 y descarga de manifiesto .sig.',
      recommendedPhase: 'Iteración 11 (Completada)',
      estimatedComplexity: 'ALTA',
      agentNotes: 'Completamente operativo con verificación de presencia física (UP=1), challenge criptográfico y bundle de firmas.',
      requiredComponents: ['WebAuthnHsmSignerModal', 'KeystoreVaultModal', 'CommandPalette', 'Navbar']
    }
  },
  {
    id: 'prop-014',
    title: 'Respaldo Cifrado Zero-Knowledge (E2EE) con WebCrypto AES-GCM 256 de Ajustes y Repositorios',
    description: 'Exportar e importar copias de seguridad de repositorios personalizados, notas del workspace y llaves de bóveda cifradas mediante clave derivada PBKDF2 en el cliente.',
    submittedBy: 'SecAudit_Lead',
    userEmail: 'lead@cryptofoss.org',
    category: 'SECURITY_SHIZUKU',
    priorityVotes: 138,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-09-02',
    tags: ['Zero Knowledge', 'AES-GCM 256', 'PBKDF2', 'E2EE Backup'],
    aiAnalysis: {
      technicalFeasibilityScore: 98,
      architecturalImpact: 'Alto. Implementado con WebCrypto SubtleCrypto nativo: PBKDF2 con 100,000 iteraciones, AES-GCM 256-bit, IV aleatorio y descarga de bóveda .ciber-vault.',
      recommendedPhase: 'Iteración 11 (Completada)',
      estimatedComplexity: 'MEDIA',
      agentNotes: 'Soberanía de datos absoluta. Soporta exportación selectiva y descifrado con validación de integridad MAC.',
      requiredComponents: ['ZeroKnowledgeBackupModal', 'CommandPalette', 'DeveloperSidebar', 'Navbar']
    }
  },
  {
    id: 'prop-015',
    title: 'Micro-Mecenazgo Descentralizado FOSS con Bitcoin Lightning Network / WebLN',
    description: 'Botón de donación directa en satoshis sin intermediarios financieros para los desarrolladores de cada aplicación FOSS del catálogo utilizando invoices WebLN.',
    submittedBy: 'SatoshiFOSS_Node',
    userEmail: 'ln@sats.community',
    category: 'COMMUNITY_EXTENSIONS',
    priorityVotes: 151,
    userHasVoted: true,
    status: 'IMPLEMENTED',
    createdAt: '2026-09-02',
    tags: ['Lightning Network', 'WebLN', 'Microdonaciones', 'Soberanía Financiera'],
    aiAnalysis: {
      technicalFeasibilityScore: 94,
      architecturalImpact: 'Medio-Alto. Permite liquidación instantánea de micro-pagos en satoshis con invoices BOLT11, WebLN 1-Click y libro contable comunitario inmutable.',
      recommendedPhase: 'Iteración 11 (Completada)',
      estimatedComplexity: 'MEDIA',
      agentNotes: 'Operativo con selector de mantenedores, presets en sats, visualizador QR interactivo y recibos preimage criptográficos.',
      requiredComponents: ['LightningDonationsModal', 'Navbar', 'CommandPalette', 'AppDetailModal']
    }
  }
];

