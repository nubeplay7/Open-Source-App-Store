import {
  PaidTestingMission,
  SharkTankProject,
  InternalWorkContract,
  ContributorWallet,
  CiverRoyaltyDistribution
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
