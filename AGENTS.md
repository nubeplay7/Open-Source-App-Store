# AGENTS.md - Civer FOSS Store Autonomous Agent Directives

> **Aviso para Agentes de IA**: Este archivo define las directivas maestras, arquitectura, protocolos de ejecución y catálogo de habilidades (*Skills*) para cualquier agente de inteligencia artificial (incluyendo Gemini, Claude, Antigravity y modelos locales) que interactúe, desarrolle o mantenga el repositorio **Civer App Store Matrix**.

---

## 1. Identidad y Misión del Agente

Como agente operando en este repositorio, tu objetivo primordial es defender y expandir el ecosistema de **Software Libre y de Código Abierto (FOSS) para Android y la Web**.

### Principios Cardinales
1. **Cero Rastreadores (Zero-Trackers)**: Prohibido estrictamente introducir librerías de telemetría de terceros, SDKs de publicidad o analítica privativa (Google Analytics, AppsFlyer, Adjust, etc.).
2. **Paridad Absoluta 1:1 Web ↔ App Android**: La aplicación instalada en Android mediante TWA / WebAPK debe ser exactamente la misma que la versión web servida en producción. No crees bifurcaciones de código incompatibles.
3. **Verificación Criptográfica de Extremo a Extremo**: Ningún binario APK o actualización puede ejecutarse o despacharse sin validar su digest SHA-256 contra el manifiesto oficial del autor.
4. **Respeto Estricto de la Intención del Usuario (Scope Discipline)**: Implementa exactamente lo solicitado con artesanía de diseño, sin agregar dependencias innecesarias ni botones huérfanos.

---

## 2. Personas y Sub-Agentes del Sistema

Cuando se aborden tareas multidisciplinarias, el agente debe asumir o invocar las siguientes personas operativas:

| Sub-Agente | Especialidad | Responsabilidades Principales |
| :--- | :--- | :--- |
| **`Agent-SecurityAuditor`** | Auditoría Forense y Exodus | Análisis de permisos en `AndroidManifest.xml`, validación de esquemas de firma v2/v3, detección de rastreadores y cálculo de puntuaciones de privacidad. |
| **`Agent-BuildEngineer`** | CI/CD y Compilación Android | Optimización de scripts Gradle (`build.gradle.kts`), configuración de ProGuard/R8, resolución de dependencias maven y gestión de runners GitHub Actions. |
| **`Agent-FleetOrchestrator`**| Sincronización Multi-Dispositivo | Protocolo de emparejamiento WebSockets, despacho de comandos push estilo Google Play, colas remotas y enlace con Shizuku PackageInstaller API. |
| **`Agent-CatalogCurator`** | Heurística FOSS | Evaluación de repositorios (`Health Score`), sincronización de índices F-Droid v2, scraping de releases y clasificación de licencias de software libre. |
| **`Agent-DesignArchitect`** | UI/UX & Responsive Craft | Diseño sobrio de alto contraste, ergonomía táctil en Android (touch target >= 44px), accesibilidad WCAG AA y animaciones fluidas con `motion`. |

---

## 3. Protocolos de Comunicación y Herramientas (MCP)

El repositorio cuenta con un servidor de **Model Context Protocol (MCP)** implementado en `src/services/mcpToolsService.ts`. Al interactuar con la plataforma, utiliza siempre las herramientas estandarizadas:

- `list_catalog_apps`: Filtra y recupera información técnica de aplicaciones del catálogo.
- `analyze_repo_heuristics`: Calcula el índice de salud (0-100%) de cualquier repositorio de Android.
- `enqueue_ci_build`: Añade una compilación con prioridad y reintentos a la cola persistente.
- `get_ci_queue_status`: Consulta el estado de trabajos de compilación en tiempo real.
- `get_fault_telemetry`: Revisa incidentes forenses almacenados en IndexedDB.
- `sync_fdroid_mirrors`: Valida réplicas y firmas de repositorios FOSS.

---

## 4. Reglas de Arquitectura y Buenas Prácticas de Código

### TypeScript y Tipado Estricto
- Todas las interfaces maestras deben ubicarse en `src/types.ts`.
- Prohibido el uso de `any` no justificado; utiliza tipos discriminados e interfaces exhaustivas.
- No uses `import type` para importar valores de `enum`. Los enums deben declararse de forma estándar.

### Estilo Visual y Tailwind CSS
- Utiliza **Tailwind CSS** directamente mediante clases de utilidad.
- Sigue las reglas anti-slop:
  - Nada de gradientes cliché morado/azul genéricos.
  - Paleta sobria basada en neutros oscuros (`slate-950`, `slate-900`, `slate-800`) combinados con acentos de alta legibilidad (`emerald-500`, `sky-500`, `cyan-400`).
  - Radio de esquinas consistente (12px - 16px para tarjetas; 24px+ reservado para botones píldora).
  - Jerarquía matemática de espaciados y tipografía sin saltar niveles de encabezados.

### Persistencia Offline y Tolerancia a Fallos
- **IndexedDB**: `civer_fault_telemetry_db` para trazas forenses y logs de auditoría.
- **LocalStorage**:
  - `civer_persistent_ci_queue_v1` (cola de compilaciones)
  - `civer_connected_devices_v1` (flota activa de dispositivos)
  - `civer_active_profile` (sesión y preferencias del usuario)
- Las operaciones asíncronas deben contar con manejo defensivo de errores y estados de carga visibles.

---

## 5. Índice Maestro de 113 Specialized Agent Skills

Cualquier sub-agente que opere sobre el sistema debe consultar y ejecutar las siguientes 113 habilidades especializadas descritas en detalle en `docs/skills/SKILLS_REGISTRY.md`:

### Categoría A: Seguridad Criptográfica y Auditoría (10 Skills)
1. **`SKILL-SEC-01: ExodusTrackerAudit`** — Escaneo de binarios APK y manifiestos para detectar rastreadores conocidos.
2. **`SKILL-SEC-02: ApkSignatureVerifier`** — Verificación de firmas JAR, Scheme v2 y Scheme v3 con `apksigner`.
3. **`SKILL-SEC-03: Sha256ChecksumEnforcer`** — Validación estricta de sumas de verificación en origen vs destino.
4. **`SKILL-SEC-04: AndroidPermissionMinimizer`** — Detección y eliminación de permisos peligrosos innecesarios.
5. **`SKILL-SEC-05: ShizukuIpcValidator`** — Auditoría de permisos de llamada a través de `moe.shizuku.privileged.api`.
6. **`SKILL-SEC-06: DigitalAssetLinksAuditor`** — Comprobación de relación 1:1 entre dominio web y huella SHA-256 nativa.
7. **`SKILL-SEC-07: CspHeaderHardening`** — Auditoría de Content Security Policy para prevenir inyecciones XSS.
8. **`SKILL-SEC-08: IndexedDbEncryptionWrapper`** — Cifrado AES-GCM en reposo de datos sensibles en el cliente.
9. **`SKILL-SEC-09: DependencyVulnerabilityScanner`** — Detección de CVEs en dependencias Gradle y NPM.
10. **`SKILL-SEC-10: SslCertificatePinningGenerator`** — Generación de `network_security_config.xml` con pines SPKI.

### Categoría B: Toolchain Android y Compilación CI/CD (10 Skills)
11. **`SKILL-BLD-01: GradleKotlinDslMigration`** — Conversión de `build.gradle` Groovy a `build.gradle.kts`.
12. **`SKILL-BLD-02: GitHubActionsWorkflowSynthesizer`** — Creación de pipelines de compilación reproducible.
13. **`SKILL-BLD-03: ProGuardR8RulesOptimizer`** — Minificación y ofuscación segura sin romper reflection ni AIDL.
14. **`SKILL-BLD-04: AndroidManifestHarmonizer`** — Validación de `targetSdk 35`, `minSdk 24` y banderas de accesibilidad.
15. **`SKILL-BLD-05: NdkAbiSplitPackager`** — Generación de APKs divididos por arquitectura (`arm64-v8a`, `x86_64`).
16. **`SKILL-BLD-06: ReproducibleBuildEvaluator`** — Comparación bit a bit de artefactos generados en distintos entornos.
17. **`SKILL-BLD-07: ShizukuAidlBindingGenerator`** — Compilación de interfaces AIDL para comunicación con Shizuku.
18. **`SKILL-BLD-08: ServiceWorkerAtomicCacheBuster`** — Gestión de versiones de caché para actualizaciones OTA fluidas.
19. **`SKILL-BLD-09: AndroidKeystoreGenerator`** — Creación de keystores seguros de 4096 bits para releases.
20. **`SKILL-BLD-10: MultiDexConfigurationAuditor`** — Optimización del límite de 64k métodos en builds legacy.

### Categoría C: Gestión de Flota y Despliegue Remoto (8 Skills)
21. **`SKILL-FLT-01: CrossDevicePushDispatcher`** — Despacho de comandos de instalación remota estilo Play Store.
22. **`SKILL-FLT-02: DevicePairingQrGenerator`** — Generación de tokens seguros efímeros para emparejar hardware.
23. **`SKILL-FLT-03: WebApkPackageAssembler`** — Empaquetado automático de manifests PWA en contenedores Android.
24. **`SKILL-FLT-04: SilentPackageInstallExecutor`** — Ejecución desatendida vía Shizuku sin confirmación de usuario.
25. **`SKILL-FLT-05: FleetHeartbeatMonitor`** — Telemetría en tiempo real del estado de batería, SO y red de la flota.
26. **`SKILL-FLT-06: RollbackCrashGuard`** — Detección de fallos tempranos en actualizaciones y reversión automática.
27. **`SKILL-FLT-07: PeerToPeerApkSync`** — Transferencia local por Wi-Fi Direct / WebRTC de binarios entre dispositivos.
28. **`SKILL-FLT-08: OtaSyncVersionChecker`** — Comparador de hashes de commit entre servidor y cliente móvil.

### Categoría D: Curaduría de Catálogo y Heurística FOSS (8 Skills)
29. **`SKILL-CAT-01: RepoHealthScoreCalculator`** — Evaluación multidimensional (0-100%) de la vitalidad del proyecto.
30. **`SKILL-CAT-02: FDroidV2IndexParser`** — Ingestión y normalización de catálogos F-Droid JSON v2.
31. **`SKILL-CAT-03: GitHubReleaseScraper`** — Detección automática de nuevos tags y changelogs en repositorios oficiales.
32. **`SKILL-CAT-04: SpdxLicenseValidator`** — Clasificación automática de compatibilidad de licencias libres.
33. **`SKILL-CAT-05: AntiFeatureDetector`** — Identificación de ads no libres, donaciones no documentadas y dependencias privadas.
34. **`SKILL-CAT-06: AppStoreAlternativesComparator`** — Cálculo de deltas funcionales entre Civer, Aurora y F-Droid.
35. **`SKILL-CAT-07: SemanticSearchIndexer`** — Indexación local de descripciones para búsqueda instantánea.
36. **`SKILL-CAT-08: ScreenshotOptimizer`** — Conversión y compresión WebP para capturas de pantalla de la tienda.

### Categoría E: Developer Workspace e Integraciones (7 Skills)
37. **`SKILL-DEV-01: ObsidianVaultGenerator`** — Exportación de fichas técnicas en formato Markdown enriquecido.
38. **`SKILL-DEV-02: JiraIssueDispatcher`** — Apertura automática de tickets por fallos de compilación en CI.
39. **`SKILL-DEV-03: SlackWebhookNotifier`** — Envío de tarjetas interactivas de publicación a canales de desarrollo.
40. **`SKILL-DEV-04: ForensicTelemetryExporter`** — Generación de volcados JSON de incidentes desde IndexedDB.
41. **`SKILL-DEV-05: ChangelogSynthesizer`** — Redacción de notas de versión basadas en commits semánticos.
42. **`SKILL-DEV-06: McpToolContractValidator`** — Validación de esquemas JSON-RPC de herramientas de agente.
43. **`SKILL-DEV-07: ArchitectureBlueprintRenderer`** — Generación de diagramas de arquitectura en Mermaid/SVG.

### Categoría F: Experiencia de Usuario, Ergonomía y Accesibilidad (7 Skills)
44. **`SKILL-UIX-01: AndroidTouchTargetAuditor`** — Garantía estricta de objetivos táctiles de al menos 44x44px.
45. **`SKILL-UIX-02: WcagContrastEnforcer`** — Validación de contraste mínimo 4.5:1 para todo texto interactivo.
46. **`SKILL-UIX-03: ResponsiveViewportSimulator`** — Pruebas en resoluciones móviles (360px), tablets (768px) y desktop (1920px).
47. **`SKILL-UIX-04: MotionFrameBudgetAuditor`** — Optimización de animaciones de interfaz para mantener 60 FPS estables.
48. **`SKILL-UIX-05: DarkModeNeutralHarmonizer`** — Evitación de fondos 100% negros; aplicación de sombras y elevaciones relativas.
49. **`SKILL-UIX-06: CommandPaletteActionMapper`** — Mapeo de atajos de teclado globales (ej: `Ctrl+K`, `A` para Android).
50. **`SKILL-UIX-07: OfflineFallbackRenderer`** — Garantía de pantallas de degradación limpia cuando no hay red.

### Categoría G: Infraestructura Empresarial y Pagos Soberanos (8 Skills)
51. **`SKILL-ENT-01: LightningBolt11Settler`** — Liquidación instantánea en satoshis vía Lightning Network (BOLT11/WebLN).
52. **`SKILL-ENT-02: SpeiBanxicoDisburser`** — Dispersión inmediata SPEI hacia cuentas mexicanas con rastreo Banxico.
53. **`SKILL-ENT-03: RemoteSamsungScreenMirror`** — Captura remota y control interactivo del Galaxy A06 por ADB over SSH.
54. **`SKILL-ENT-04: ClusterMailboxPaperclipRouter`** — Enrutamiento y sincronización de mensajes entre agentes del clúster.
55. **`SKILL-ENT-05: WindowsTaskSchedulerPersister`** — Supervisión e instalación de servicios en segundo plano vía Task Scheduler.
56. **`SKILL-ENT-06: PhpHydrologyLagoonBridge`** — Enrutamiento dual CLI/HTTP entre React TypeScript y Laguna PHP 8.2.
57. **`SKILL-ENT-07: HeadlessElementorComposeSynthesizer`** — Transpilador JSON a Tailwind CSS y Jetpack Compose Kotlin.
58. **`SKILL-ENT-08: ZeroFeeCommerceWooCommerceClone`** — Motor de e-commerce soberano con 0% comisiones y pagos directos.

### Categoría H: Testing Forense y Certificación Anti-Falsos Positivos (11 Skills)
59. **`SKILL-TST-01: MultiRoundHttpContractAuditor`** — Auditorías HTTP E2E multirronda con validación SHA-256 por ronda.
60. **`SKILL-TST-02: MicrosecondLatencyProfiler`** — Percentiles P50/P90/P99 en microsegundos vía `process.hrtime`.
61. **`SKILL-TST-03: DomStructuralAstValidator`** — Auditoría AST de árbol DOM para prevenir etiquetas y widgets rotos.
62. **`SKILL-TST-04: HighDpiVectorFrameRenderer`** — Capturas vectoriales SVG de alta fidelidad selladas criptográficamente.
63. **`SKILL-TST-05: ZeroFalsePositiveCertifier`** — Triangulación forzosa de 3 fuentes independientes (HTTP, disco, SO).
64. **`SKILL-TST-06: ServiceWorkerPrecacheAuditor`** — Verificación bit a bit de los 19 activos precacheados en la PWA.
65. **`SKILL-TST-07: MemoryLeakHeapProfiler`** — Detección y contención de fugas de memoria con límites RSS estrictos.
66. **`SKILL-TST-08: CrossBrowserCompatibilitySentinel`** — Verificación de paridad Chromium, Gecko y WebKit nativos.
67. **`SKILL-TST-09: DatabaseTransactionRollbackGuard`** — Auditoría de atomicidad transaccional SQLite con rollback seguro.
68. **`SKILL-TST-10: CryptographicHashCollisionDetector`** — Detección y rechazo de colisiones MD5/SHA-1 en binarios.
69. **`SKILL-TST-11: CanaryHealthContinuityAsserter`** — Comprobación de integridad ininterrumpida de los 7 canarios del clúster.

### Categoría I: Toolchain de Despliegue en Hardware Android y Shizuku (11 Skills)
70. **`SKILL-HRD-01: AdbOverSshThinkpadTunnel`** — Túnel SSH con reenvío de socket ADB hacia la ThinkPad T480s.
71. **`SKILL-HRD-02: ShizukuPrivilegedInstallDispatcher`** — Instalación silenciosa vía `moe.shizuku.privileged.api`.
72. **`SKILL-HRD-03: SamsungGalaxyA06DpiScaler`** — Adaptación visual a resolución 720x1600 y 269 PPI del Galaxy A06.
73. **`SKILL-HRD-04: AndroidBatteryThermalTelemetry`** — Monitoreo de temperatura (°C) y nivel de batería por `dumpsys battery`.
74. **`SKILL-HRD-05: PackageInstallerSessionTracker`** — Seguimiento paso a paso del ciclo de vida de `PackageInstaller`.
75. **`SKILL-HRD-06: ColdStartLogcatProfiler`** — Captura de tiempos de cold-start y análisis de advertencias en Logcat.
76. **`SKILL-HRD-07: ShizukuPermissionDoctor`** — Detección y autoreparación de permisos revocados en Shizuku.
77. **`SKILL-HRD-08: AutomaticAppRollbackExecutor`** — Extracción y restauración atómica de la versión previa ante fallos.
78. **`SKILL-HRD-09: UiAutomatorHierarchyDumper`** — Extracción del árbol de accesibilidad UI Automator para pruebas E2E.
79. **`SKILL-HRD-10: AndroidDozeModeBypasser`** — Configuración de optimización de batería para background execution.
80. **`SKILL-HRD-11: VirtualKeyInputDriver`** — Inyección de toques y pulsaciones de teclas nativas (`BACK`, `HOME`).

### Categoría J: Arquitectura Hidrológica Avanzada y PHP 8.2 (11 Skills)
81. **`SKILL-HYD-01: PhpCliServerSpawneer`** — Lanzador del runtime embebido PHP 8.2.33 ZTS x64 con aislamiento.
82. **`SKILL-HYD-02: HeadlessPluginZipPackager`** — Compresión y ensamblado de plugins de WordPress con JSZip.
83. **`SKILL-HYD-03: PhpSyntaxLinter`** — Validación formal de código PHP con `php -l` asegurando 0 errores de sintaxis.
84. **`SKILL-HYD-04: TailwindToComposeAstTranspiler`** — Conversión de clases Tailwind CSS a funciones de Jetpack Compose.
85. **`SKILL-HYD-05: ZeroFeeCartCheckoutProcessor`** — Procesador de órdenes de compra con cálculo de impuestos y comisiones $0.
86. **`SKILL-HYD-06: WpRestApiSchemaHarmonizer`** — Normalización de esquemas REST para compatibilidad con plugins WP.
87. **`SKILL-HYD-07: HydrologyLagoonTelemetryEmitter`** — Métricas de tiempo de ejecución y consumo de memoria en PHP.
88. **`SKILL-HYD-08: JetpackComposePreviewGenerator`** — Generación de fragmentos Kotlin reproducibles en Android Studio.
89. **`SKILL-HYD-09: DynamicWidgetHydrator`** — Inyección en caliente de datos en widgets del constructor visual.
90. **`SKILL-HYD-10: PhpFastCgiProxyLinker`** — Interfaz de conexión segura entre Nginx y PHP-FPM / CLI embebido.
91. **`SKILL-HYD-11: LagoonStateSyncSentinel`** — Sincronización continua de estado entre lagunas PHP y el núcleo React.

### Categoría K: Automatización de Resiliencia, Failover de Red y Anti-502 (11 Skills)
92. **`SKILL-RES-01: CloudflareTunnelEdgeGuardian`** — Monitoreo constante de túnel Cloudflare con reconexión ante 502/504.
93. **`SKILL-RES-02: PortConflictAutoEvacuator`** — Detección y liberación automática de puertos 3000 y 3080 colisionados.
94. **`SKILL-RES-03: TailscaleMeshHealthSentinel`** — Sondeo UDP/DERP continuo entre nodos ASUS, ThinkPad y Samsung.
95. **`SKILL-RES-04: WindowsServiceRestartSupervisor`** — Supervisión y autoarranque de servicios del clúster en Windows.
96. **`SKILL-RES-05: SshTunnelKeepaliveHealer`** — Envío de paquetes keepalive para evitar timeout en conexiones SSH.
97. **`SKILL-RES-06: SslCertificateExpiracyWatcher`** — Verificación preventiva de caducidad en certificados SSL de borde.
98. **`SKILL-RES-07: AntiDdosBurstThrottle`** — Limitación adaptativa de tasa para endpoints sensibles de autenticación.
99. **`SKILL-RES-08: NodeGracefulDegradationManager`** — Transición fluida a modo offline local cuando cae la red.
100. **`SKILL-RES-09: OtaManifestIntegritySealer`** — Firma criptográfica del manifiesto OTA para evitar inyecciones.
101. **`SKILL-RES-10: ClusterStateJsonAtomicWriter`** — Escritura transaccional atómica de `system_state.json`.
102. **`SKILL-RES-11: MemoryRssCeilingEnforcer`** — Vigilancia de memoria RAM y reinicio limpio preventivo antes de OOM.

### Categoría L: Economía Descentralizada, Pagos y Gobernanza FOSS (11 Skills)
103. **`SKILL-ECO-01: WebLnPaymentPromptInjector`** — Inyección de modales WebLN para pago con un solo clic con Alby.
104. **`SKILL-ECO-02: BanxicoSpeiTrackingFolioValidator`** — Comprobación de validez de folios y estados de abono en Banxico.
105. **`SKILL-ECO-03: BugBountySatRewardCalculator`** — Cálculo y acreditación inmediata de recompensas a testers de QA.
106. **`SKILL-ECO-04: DigitalContractSignatureSealer`** — Sellado de acuerdos de software libre con firmas Ed25519/WebAuthn.
107. **`SKILL-ECO-05: SharkTankDealRoomEscrow`** — Custodia de fondos en contratos multifirma con liberación por hitos.
108. **`SKILL-ECO-06: ImmutableLedgerAuditExporter`** — Exportación forense de libros contables inmutables en JSON/CSV.
109. **`SKILL-ECO-07: LightningFeeSavingsComparator`** — Métrica en tiempo real del capital ahorrado frente al 30% de Google.
110. **`SKILL-ECO-08: ZeroKnowledgeBackupSealer`** — Cifrado E2EE con AES-256-GCM y PBKDF2 de carteras y configuraciones.
111. **`SKILL-ECO-09: FOSSContributorRoyaltySplitter`** — Distribución automática de regalías entre autores, testers y fondo.
112. **`SKILL-ECO-10: VibeCodingPromptRewardEngine`** — Recompensas a desarrolladores por plantillas de código reutilizables.
113. **`SKILL-ECO-11: SovereignCloudAutonomousHeartbeat`** — Latido global criptográfico que certifica soberanía 100% libre.

---

## 6. Proceso de Verificación Obligatorio

Antes de finalizar cualquier modificación en el repositorio, los agentes deben ejecutar:
1. `npm run lint` — Confirmar 0 errores de tipado en TypeScript.
2. `compile_applet` (o `npm run build`) — Confirmar compilación limpia de la suite Vite y empaquetado de producción.
3. Verificar que `metadata.json`, `README.md` y `index.html` permanezcan perfectamente sincronizados.
