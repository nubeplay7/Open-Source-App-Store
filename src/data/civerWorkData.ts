import {
  PaidTestingMission,
  SharkTankProject,
  InternalWorkContract,
  ContributorWallet,
  CiverRoyaltyDistribution,
  CiverDepartment,
  WorkConvocation,
  CommunityChannel,
  OmniRouterAccountPool,
  OmniRouterStatus
} from '../types';

export const DEFAULT_ROYALTY_DISTRIBUTION: CiverRoyaltyDistribution = {
  civerCloudEnterprisePct: 51, // 51% Civer Cloud Enterprise (Dueña de la plataforma, IA, servidores e IP maestra)
  authorIdeaPct: 15,           // 15% Autor Intelectual de la idea original
  developerVibeCoderPct: 20,   // 20% Vibe Coder / Desarrollador que la construye con IA
  leadMaintainerPct: 10,       // 10% Mantenedor activo del proyecto
  qaTestersPoolPct: 4          // 4% Pool distribuido entre testers y auditores de fallos
};

export const INITIAL_TESTING_MISSIONS: PaidTestingMission[] = [
  {
    id: 'mission-qa-01',
    appId: 'spotube',
    appName: 'Spotube Mobile v3.8.2',
    appPackage: 'oss.krtirtho.spotube',
    title: 'Auditoría de Reproducción Continua y Conectividad Bluetooth en Android 14',
    description: 'Instala Spotube desde Civer Store en un dispositivo físico o emulador. Reproduce 5 canciones seguidas, desconecta y reconecta auriculares Bluetooth, y reporta el comportamiento y consumo de memoria RAM.',
    rewardUsd: 18.50,
    rewardSats: 35000,
    targetAndroidVersion: 'Android 11 - 15 (Target SDK 35)',
    requiredDeviceType: 'PHYSICAL_PHONE',
    status: 'OPEN',
    submissionsCount: 7,
    maxTesters: 15,
    checklist: [
      'Descargar e instalar APK firmado desde Civer Store',
      'Comprobar 0 cierres inesperados al rotar la pantalla',
      'Medir consumo de RAM en segundo plano (<150 MB)',
      'Adjuntar captura de pantalla del logcat o interfaz'
    ],
    bugSeverityMultiplier: 1.5
  },
  {
    id: 'mission-qa-02',
    appId: 'omniroute',
    appName: 'OmniRoute AI Gateway v0.3.0',
    appPackage: 'com.omniroute.gateway',
    title: 'Verificación de Fallback de Cuotas Gratuitas y Compresión RTK',
    description: 'Prueba la conmutación automática de proveedores de IA cuando un endpoint devuelve error 429. Comprueba la latencia p99 y reporta la estabilidad del socket.',
    rewardUsd: 28.00,
    rewardSats: 52000,
    targetAndroidVersion: 'Android 10+ / Linux / Web',
    requiredDeviceType: 'ANY',
    status: 'OPEN',
    submissionsCount: 4,
    maxTesters: 10,
    checklist: [
      'Enviar ráfaga de 10 prompts concurrentes',
      'Confirmar auto-rerouting sin desconexión del cliente',
      'Verificar compresión de tokens en memoria',
      'Exportar bitácora JSON de incidentes'
    ],
    bugSeverityMultiplier: 2.0
  },
  {
    id: 'mission-qa-03',
    appId: 'openclaw',
    appName: 'OpenClaw Agentic Suite 2.0',
    appPackage: 'ai.openclaw.agent',
    title: 'Testeo de Automatización por Voz y Bóveda Cifrada Local',
    description: 'Ejecuta 3 comandos por voz en OpenClaw, verifica que la base de datos SQLite cifre las credenciales y comprueba la sincronización de tareas de fondo.',
    rewardUsd: 35.00,
    rewardSats: 65000,
    targetAndroidVersion: 'Android 12+ (One UI / HyperOS / Pixel)',
    requiredDeviceType: 'PHYSICAL_PHONE',
    status: 'OPEN',
    submissionsCount: 9,
    maxTesters: 12,
    checklist: [
      'Configurar PIN de bóveda y verificar PBKDF2',
      'Dictar comando para compilar APK en la nube',
      'Verificar que el bot de Telegram reciba la notificación',
      'Reportar cualquier lag o desincronización de audio'
    ],
    bugSeverityMultiplier: 2.5
  },
  {
    id: 'mission-qa-04',
    appId: 'droid-ify',
    appName: 'Droid-ify Material You v0.6.9',
    appPackage: 'com.looker.droidify',
    title: 'Stress-Test de Sincronización de Repositorios F-Droid v2',
    description: 'Añade 5 repositorios personalizados y sincroniza 10,000 aplicaciones simultáneamente. Evalúa el drenaje de batería y confirma que el índice no se corrompa.',
    rewardUsd: 15.00,
    rewardSats: 28000,
    targetAndroidVersion: 'Android 9+',
    requiredDeviceType: 'ANY',
    status: 'IN_REVIEW',
    submissionsCount: 12,
    maxTesters: 12,
    checklist: [
      'Añadir espejo oficial de Cloudflare IPFS',
      'Activar modo descarga solo por Wi-Fi',
      'Verificar firma APK Scheme v2 con apksigner'
    ],
    bugSeverityMultiplier: 1.2
  }
];

export const INITIAL_SHARK_TANK_PROJECTS: SharkTankProject[] = [
  {
    id: 'shark-proj-01',
    title: 'SovereignPay: Billetera Móvil Lightning P2P Offline',
    tagline: 'Pagos instantáneos en satoshis mediante BLE y NFC sin conexión a internet para comercios locales.',
    category: 'Fintech & Cripto',
    fundingGoalUsd: 15000,
    fundedAmountUsd: 11250,
    equityOfferedPct: 18,
    proposedSalaryUsd: 1200,
    investorName: 'Grupo Vértice Capital & Red Ángel FOSS',
    investorType: 'VENTURE_CAPITAL',
    status: 'LOOKING_FOR_DEV',
    requiredRoles: ['VIBE_CODER', 'QA_TESTER', 'LEAD_MAINTAINER'],
    vibeCodingPromptIdea: 'Crea una app en Kotlin/Compose que maneje canales Lightning BOLT11 y transmita transacciones firmadas por Bluetooth Low Energy usando la infraestructura Civer Cloud.',
    termsSigned: true,
    dealRoomMessagesCount: 24,
    isPrivateCustomerProject: false
  },
  {
    id: 'shark-proj-02',
    title: 'HealthVault FOSS: Expedientes Médicos Descentralizados',
    tagline: 'Historial clínico privado cifrado de extremo a extremo para clínicas y doctores independientes.',
    category: 'Salud & Privacidad',
    fundingGoalUsd: 8500,
    fundedAmountUsd: 8500,
    equityOfferedPct: 15,
    proposedSalaryUsd: 950,
    investorName: 'Dr. Alejandro Morales / Red Hospitalaria Sur',
    investorType: 'ENTERPRISE',
    status: 'FUNDED_IN_DEV',
    requiredRoles: ['VIBE_CODER', 'QA_TESTER'],
    vibeCodingPromptIdea: 'Diseña una aplicación con almacenamiento SQLCipher local, exportación PDF compatible con normativas médicas y sincronización P2P con Syncthing.',
    contractHash: 'c7f902ba138e681289cfeb3958193850123ef',
    termsSigned: true,
    dealRoomMessagesCount: 48,
    isPrivateCustomerProject: true
  },
  {
    id: 'shark-proj-03',
    title: 'AgroSensor AI: Diagnóstico de Plagas en Campo sin Red',
    tagline: 'Visión artificial en el smartphone para agricultores que detecta enfermedades en hojas de maíz y cítricos.',
    category: 'AgriTech & IA',
    fundingGoalUsd: 22000,
    fundedAmountUsd: 6500,
    equityOfferedPct: 22,
    proposedSalaryUsd: 1500,
    investorName: 'Fondo AgroTech Bajío',
    investorType: 'ANGEL',
    status: 'NEGOTIATION_ROOM',
    requiredRoles: ['IDEA_AUTHOR', 'VIBE_CODER', 'QA_TESTER', 'LEAD_MAINTAINER'],
    vibeCodingPromptIdea: 'Desarrolla un modelo cuantizado TFLite / ONNX integrado en una app Flutter con cámara acelerada y recomendaciones de tratamiento orgánico.',
    termsSigned: false,
    dealRoomMessagesCount: 16,
    isPrivateCustomerProject: false
  },
  {
    id: 'shark-proj-04',
    title: 'LogistiCiver: Ruteo y Despacho para Flotas de Reparto',
    tagline: 'Sistema de navegación y comprobante digital de entrega para empresas de logística sin comisiones de terceros.',
    category: 'Logística & B2B',
    fundingGoalUsd: 18000,
    fundedAmountUsd: 18000,
    equityOfferedPct: 12,
    proposedSalaryUsd: 1400,
    investorName: 'Transportes Rápidos Nacionales S.A.',
    investorType: 'ENTERPRISE',
    status: 'FUNDED_IN_DEV',
    requiredRoles: ['VIBE_CODER', 'QA_TESTER'],
    vibeCodingPromptIdea: 'Crea una app nativa Android con rastreo GPS optimizado para bajo consumo de batería, firma táctil en pantalla y modo fuera de línea.',
    contractHash: '49bfa810239cf6182390ba0394781903847',
    termsSigned: true,
    dealRoomMessagesCount: 62,
    isPrivateCustomerProject: true
  }
];

export const INITIAL_WORKER_WALLET: ContributorWallet = {
  balanceUsd: 142.50,
  balanceSats: 275000,
  pendingReviewUsd: 46.50,
  totalEarnedLifetimeUsd: 1280.00,
  completedMissionsCount: 18,
  activeContractsCount: 3,
  payoutMethod: 'LIGHTNING_NETWORK'
};

export const SAMPLE_MASTER_AGREEMENT: InternalWorkContract = {
  contractId: 'CIVER-CONTRACT-2026-9382',
  projectId: 'shark-proj-01',
  projectTitle: 'SovereignPay: Billetera Móvil Lightning P2P Offline',
  workerName: 'Oscar Manuel (Colaborador Asociado)',
  workerRole: 'VIBE_CODER',
  effectiveDate: '2026-09-11',
  ipOwnershipClause: 'La totalidad del código fuente, patentes, marcas, binarios y artefactos generados mediante la infraestructura, modelos de IA y herramientas de Civer Cloud son de exclusiva propiedad patrimonial de Civer Cloud Enterprise. El colaborador conserva el derecho moral y la titularidad económica irrevocable de las regalías pactadas.',
  royaltyPercentage: 20.0,
  fixedSalaryUsd: 1200.0,
  digitalSignatureHash: 'sha256-8a39df71024bc6810294e09f7a93b0192847c01289efb0193858',
  status: 'ACTIVE',
  arbitrationJurisdiction: 'Civer Cloud Sovereign Digital Court & FOSS International Standards'
};

// -------------------------------------------------------------
// ORGANIGRAMA DEPARTAMENTAL AGÉNTICO (12 DEPARTAMENTOS 24/7)
// -------------------------------------------------------------

export const INITIAL_DEPARTMENTS: CiverDepartment[] = [
  {
    id: 'dept-sec',
    code: 'SEC-01',
    name: 'Seguridad y Auditoría Forense',
    leaderAgent: 'Agent-SecurityAuditor',
    skillsAssigned: ['SKILL-SEC-01: ExodusTrackerAudit', 'SKILL-SEC-02: ApkSignatureVerifier', 'SKILL-SEC-03: Sha256ChecksumEnforcer'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 142,
    activeJobsCount: 3,
    mission: 'Auditoría permanente de APKs, 0 rastreadores y firmas criptográficas Scheme v2/v3/v4.',
    computeAllocated: 'Kaggle GPU Cluster (T4) + Local Sandbox'
  },
  {
    id: 'dept-bld',
    code: 'BLD-02',
    name: 'Compilación e Infraestructura CI/CD',
    leaderAgent: 'Agent-BuildEngineer',
    skillsAssigned: ['SKILL-BLD-01: GradleKotlinDslMigration', 'SKILL-BLD-02: GitHubActionsWorkflowSynthesizer', 'SKILL-BLD-06: ReproducibleBuildEvaluator'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 89,
    activeJobsCount: 2,
    mission: 'Orquestación de compilaciones cloud en GitHub Actions y reproducibilidad bit a bit.',
    computeAllocated: 'GitHub Actions Runners (16 GB RAM) + Droplet Gateway'
  },
  {
    id: 'dept-flt',
    code: 'FLT-03',
    name: 'Gestión de Flota y Dispositivos',
    leaderAgent: 'Agent-FleetOrchestrator',
    skillsAssigned: ['SKILL-FLT-01: CrossDevicePushDispatcher', 'SKILL-FLT-04: SilentPackageInstallExecutor', 'SKILL-FLT-05: FleetHeartbeatMonitor'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 310,
    activeJobsCount: 5,
    mission: 'Instalación silenciosa con Shizuku, WebSockets y control remoto web-to-phone.',
    computeAllocated: 'Tailscale Mesh WireGuard + ThinkPad ADB Bridge'
  },
  {
    id: 'dept-cat',
    code: 'CAT-04',
    name: 'Curaduría de Catálogo y Heurística FOSS',
    leaderAgent: 'Agent-CatalogCurator',
    skillsAssigned: ['SKILL-CAT-01: RepoHealthScoreCalculator', 'SKILL-CAT-02: FDroidV2IndexParser', 'SKILL-CAT-03: GitHubReleaseScraper'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 65,
    activeJobsCount: 1,
    mission: 'Heurística continua de repositorios de software libre y sincronización de índices.',
    computeAllocated: 'Cloudflare Edge Workers + Droplet Cron'
  },
  {
    id: 'dept-uix',
    code: 'UIX-05',
    name: 'Diseño y Experiencia de Usuario',
    leaderAgent: 'Agent-DesignArchitect',
    skillsAssigned: ['SKILL-UIX-01: AndroidTouchTargetAuditor', 'SKILL-UIX-02: WcagContrastEnforcer', 'SKILL-UIX-05: DarkModeNeutralHarmonizer'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 44,
    activeJobsCount: 1,
    mission: 'Ergonomía táctil 44dp, paridad visual Play Store y fluidez a 60 FPS.',
    computeAllocated: 'Vite PWA Compiler + Local Node'
  },
  {
    id: 'dept-leg',
    code: 'LEG-06',
    name: 'Legal y Contratos Digitales',
    leaderAgent: 'Agent-LegalCounsel',
    skillsAssigned: ['CIVER-LEGAL-SAS-COMPLIANCE', 'CIVER-CONTRACT-SHA256-SEALER'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 28,
    activeJobsCount: 0,
    mission: 'Generación de contratos mercantiles vinculantes, cesión de IP y cumplimiento SAT/IMPI.',
    computeAllocated: 'DeepSeek R1 Reasoner + Civer Digital Court'
  },
  {
    id: 'dept-cfo',
    code: 'CFO-07',
    name: 'Finanzas y Tesorería Soberana',
    leaderAgent: 'Agent-TreasuryCFO',
    skillsAssigned: ['LIGHTNING-BOLT11-DISPATCHER', 'ROYALTIES-51-49-LEDGER'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 198,
    activeJobsCount: 2,
    mission: 'Liquidación de regalías por Lightning Network (satoshis) y transferencias bancarias SPEI.',
    computeAllocated: 'WebLN Node + Safe Multi-Sig'
  },
  {
    id: 'dept-hr',
    code: 'HRO-08',
    name: 'Recursos Humanos y Comunidad',
    leaderAgent: 'Agent-PeopleOps',
    skillsAssigned: ['CONVOCATIONS-DISPATCHER', 'REPUTATION-BADGE-ISSUER'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 73,
    activeJobsCount: 4,
    mission: 'Publicación de convocatorias de 2h/día, onboarding de Vibe Coders y reputación.',
    computeAllocated: 'Telegram Bot API + Forum Database'
  },
  {
    id: 'dept-mkt',
    code: 'MKT-09',
    name: 'Marketing y Crecimiento FOSS',
    leaderAgent: 'Agent-GrowthHacker',
    skillsAssigned: ['VIRAL-VIBE-TUTORIAL-SYNTHESIZER', 'FOSS-TELEGRAM-PROMOTER'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 36,
    activeJobsCount: 1,
    mission: 'Tutoriales en video, difusión en Reddit/Telegram y captación de talento no-técnico.',
    computeAllocated: 'OmniRouter Content Synthesis'
  },
  {
    id: 'dept-ai',
    code: 'AIR-10',
    name: 'Investigación e IA Infinita (OmniRouter)',
    leaderAgent: 'Agent-AIResearcher',
    skillsAssigned: ['OMNIROUTER-CASCADE-FAILOVER', 'KAGGLE-MULTI-ACCOUNT-ROTATOR'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 1240,
    activeJobsCount: 12,
    mission: 'Pool multi-cuenta autenticado para dotar de IA ilimitada a todos los miembros de Civer.',
    computeAllocated: 'OmniRouter Pool (15 Cuentas Gemini + DeepSeek + Kaggle T4)'
  },
  {
    id: 'dept-cs',
    code: 'CSS-11',
    name: 'Soporte y Éxito de Colaboradores',
    leaderAgent: 'Agent-CustomerSuccess',
    skillsAssigned: ['TICKET-AUTORESOLUTION-BOT', 'MULTILINGUAL-DISPATCHER'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 154,
    activeJobsCount: 2,
    mission: 'Atención 24/7 en Telegram, resolución de dudas técnicas y guía para testers.',
    computeAllocated: 'Groq Ultra-Fast LLaMA 3.3 (500 tok/s)'
  },
  {
    id: 'dept-qa',
    code: 'QAD-12',
    name: 'Control de Calidad y Verificación QA',
    leaderAgent: 'Agent-QADirector',
    skillsAssigned: ['BUG-REPORT-VERIFIER', 'DEVICE-MATRIX-BENCHMARK'],
    status: 'ONLINE_24_7',
    tasksCompleted24h: 92,
    activeJobsCount: 3,
    mission: 'Validación de reportes de testing, cálculo de recompensas y asignación del pool del 4%.',
    computeAllocated: 'Samsung A06 Real Device Bridge + Automated Logcat Analyzer'
  }
];

// -------------------------------------------------------------
// CONVOCATORIAS DE TRABAJO Y PARTICIPACIÓN REMOTA (2H/DÍA)
// -------------------------------------------------------------

export const INITIAL_CONVOCATIONS: WorkConvocation[] = [
  {
    id: 'conv-vibe-01',
    title: 'Convocatoria Abierta: Vibe Coders con IA Infinita (Público General)',
    departmentId: 'dept-hr',
    targetRole: 'VIBE_CODER',
    requiredTimeCommitment: 'Mínimo 2 horas diarias (Horarios flexibles)',
    requirements: [
      'Dispositivo Android o computadora personal',
      'Cuenta de Telegram para coordinación diaria',
      'Sin necesidad de saber programar: disponibilidad para crear prompts e interactuar con la IA',
      'Disponibilidad para sesiones quincenales de alineación en Zoom o Google Meet'
    ],
    benefits: [
      'Acceso 100% gratuito a IA Infinita Agéntica (OmniRouter multi-proveedor)',
      '20% de regalías vitalicias garantizadas por contrato digital en cada app publicada',
      'Compilación en la nube ilimitada (GitHub Actions sin costo local)',
      'Acompañamiento 24/7 por los 12 agentes departamentales de Civer Cloud'
    ],
    communicationChannels: ['Telegram @CiverVibeCoders', 'Deal Rooms Zoom', 'Foro Civer Work'],
    openSpots: 50,
    enrolledCount: 32,
    status: 'OPEN',
    languages: ['Español (Principal)', 'Inglés', 'Portugués']
  },
  {
    id: 'conv-qa-02',
    title: 'Bolsa de Testeo Remunerado Móvil: Auditores Android con Pago Inmediato',
    departmentId: 'dept-qa',
    targetRole: 'QA_TESTER',
    requiredTimeCommitment: '1 a 3 horas por misión (A tu propio ritmo)',
    requirements: [
      'Smartphone físico con Android 10, 11, 12, 13, 14 o 15 (Samsung, Xiaomi, Motorola, Pixel, etc.)',
      'Capacidad para tomar capturas de pantalla y seguir listas de verificación',
      'Billetera Lightning (Wallet of Satoshi, Phoenix, Strike) o cuenta bancaria SPEI para cobros'
    ],
    benefits: [
      'Recompensas de $15 a $35 USD por misión completada + multiplicador por severidad',
      'Participación en el pool del 4% de regalías globales de cada aplicación testeada',
      'Retiros inmediatos en menos de 2 segundos sin retenciones arbitrarias'
    ],
    communicationChannels: ['Telegram @CiverQATesters', 'Canal de Balizas en Vivo'],
    openSpots: 100,
    enrolledCount: 68,
    status: 'OPEN',
    languages: ['Español', 'Inglés']
  },
  {
    id: 'conv-lead-03',
    title: 'Convocatoria Técnica: Mantenedores de Repositorios y Arquitectura FOSS',
    departmentId: 'dept-bld',
    targetRole: 'LEAD_MAINTAINER',
    requiredTimeCommitment: '4 a 8 horas semanales',
    requirements: [
      'Experiencia básica en Git, GitHub Pull Requests y Android Gradle',
      'Compromiso con la filosofía 0 rastreadores y licencias libres (GPL/MIT/Apache)'
    ],
    benefits: [
      '10% de regalías vitalicias en los repositorios asignados',
      'Acceso a terminales de compilación cloud con 16 GB de RAM y clúster Kaggle 30 GB'
    ],
    communicationChannels: ['Telegram @CiverDevCommunity', 'GitHub Discussions'],
    openSpots: 15,
    enrolledCount: 9,
    status: 'OPEN',
    languages: ['Español', 'Inglés']
  }
];

// -------------------------------------------------------------
// ECOSISTEMA DE COMUNICACIÓN COMUNITARIA INTERNACIONAL
// -------------------------------------------------------------

export const INITIAL_COMMUNITY_CHANNELS: CommunityChannel[] = [
  {
    id: 'chan-tg-official',
    platform: 'TELEGRAM',
    name: 'Civer App Store Oficial & Anuncios',
    urlOrHandle: '@CiverAppStoreOficial',
    category: 'ANNOUNCEMENTS',
    activeMembersCount: 1420,
    description: 'Nuevos lanzamientos de apps, actualizaciones de la plataforma y comunicados corporativos.'
  },
  {
    id: 'chan-tg-vibe',
    platform: 'TELEGRAM',
    name: 'Civer Vibe Coders & Creadores con IA',
    urlOrHandle: '@CiverVibeCoders',
    category: 'DEV_VIBE',
    activeMembersCount: 680,
    description: 'Comunidad de personas creando apps con OmniRouter, compartiendo prompts e ideas.'
  },
  {
    id: 'chan-tg-qa',
    platform: 'TELEGRAM',
    name: 'Civer QA Testers Remunerados',
    urlOrHandle: '@CiverQATesters',
    category: 'QA_TESTERS',
    activeMembersCount: 890,
    description: 'Alertas de nuevas misiones de testeo con recompensa en USD y satoshis.'
  },
  {
    id: 'chan-zoom-deal',
    platform: 'ZOOM',
    name: 'Shark Tank Deal Rooms (Videollamadas)',
    urlOrHandle: 'https://civer.cloud/meet/deal-rooms',
    category: 'DEAL_ROOMS',
    activeMembersCount: 45,
    description: 'Sesiones de pitch y negociación de contratos entre inversionistas y creadores.',
    isLiveNow: true
  },
  {
    id: 'chan-meet-weekly',
    platform: 'GOOGLE_MEET',
    name: 'Mesa Redonda Semanal de Colaboradores',
    urlOrHandle: 'https://meet.google.com/civ-work-sync',
    category: 'GENERAL',
    activeMembersCount: 120,
    description: 'Encuentro quincenal abierto para compartir avances, resolver dudas y festejar pagos.'
  }
];

// -------------------------------------------------------------
// OMNIROUTER IA INFINITA — POOL MULTI-CUENTA DE PROVEEDORES
// -------------------------------------------------------------

export const INITIAL_OMNIROUTER_STATUS: OmniRouterStatus = {
  totalAggregatedAccounts: 48,
  totalCombinedCreditUsd: 14500.0,
  totalTokensDispatched24h: 8420000,
  activeCascadeRouting: true,
  pools: [
    {
      id: 'pool-gemini',
      provider: 'GEMINI',
      accountAlias: 'Google Cloud Multi-Account Vault (15 Cuentas Activas)',
      totalAccountsCount: 15,
      aggregatedBalanceUsd: 4500.0,
      remainingTokensQuota: '320M tokens disponibles (225 RPM)',
      status: 'HEALTHY',
      latencyMs: 185,
      supportedModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
      isInfiniteTier: true
    },
    {
      id: 'pool-deepseek',
      provider: 'DEEPSEEK',
      accountAlias: 'DeepSeek Master Dedicated API Pool',
      totalAccountsCount: 6,
      aggregatedBalanceUsd: 3200.0,
      remainingTokensQuota: '580M tokens disponibles',
      status: 'HEALTHY',
      latencyMs: 310,
      supportedModels: ['deepseek-chat (V3)', 'deepseek-reasoner (R1)'],
      isInfiniteTier: true
    },
    {
      id: 'pool-kaggle',
      provider: 'KAGGLE_GPU',
      accountAlias: 'Kaggle GPU Compute Mesh (Cuentas "Descarga Intelectual 3")',
      totalAccountsCount: 12,
      aggregatedBalanceUsd: 2800.0,
      remainingTokensQuota: '360 Horas GPU Dual-T4 semanales',
      status: 'HEALTHY',
      latencyMs: 420,
      supportedModels: ['LLaMA 3.1 8B/70B', 'Qwen 2.5 Coder 32B', 'Whisper Large v3'],
      isInfiniteTier: true
    },
    {
      id: 'pool-groq',
      provider: 'GROQ',
      accountAlias: 'Groq Ultra-Fast LPU Ingestion Pool',
      totalAccountsCount: 8,
      aggregatedBalanceUsd: 2200.0,
      remainingTokensQuota: '900 RPM (500 tokens/segundo)',
      status: 'HEALTHY',
      latencyMs: 65,
      supportedModels: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
      isInfiniteTier: true
    },
    {
      id: 'pool-baseten',
      provider: 'BASETEN',
      accountAlias: 'Baseten Serverless Edge Endpoints',
      totalAccountsCount: 7,
      aggregatedBalanceUsd: 1800.0,
      remainingTokensQuota: 'Auto-scaling sin límite (Scale-to-Zero)',
      status: 'HEALTHY',
      latencyMs: 140,
      supportedModels: ['Mistral Nemo 12B', 'Custom LoRA Adapters'],
      isInfiniteTier: true
    }
  ]
};
