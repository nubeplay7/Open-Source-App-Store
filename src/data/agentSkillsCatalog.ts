export interface AgentSkillItem {
  id: string;
  title: string;
  category: 'SECURITY' | 'BUILD_TOOLCHAIN' | 'FLEET_REMOTE' | 'CATALOG_HEURISTICS' | 'DEV_WORKSPACE' | 'UX_ACCESSIBILITY';
  categoryLabel: string;
  description: string;
  trigger: string;
  inputs: string[];
  outputs: string[];
  acceptanceCriteria: string;
  iconName: string;
}

export const AGENT_SKILLS_CATALOG: AgentSkillItem[] = [
  // ==========================================
  // Categoría A: Seguridad Criptográfica (10)
  // ==========================================
  {
    id: 'SKILL-SEC-01',
    title: 'ExodusTrackerAudit',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Analiza archivos APK descomprimidos y clases DEX para detectar firmas de rastreadores comerciales y SDKs de analítica privativa.',
    trigger: 'Evaluación de apps candidatas para ingreso al catálogo o actualización de releases.',
    inputs: ['Archivo .apk binario', 'Árbol de dependencias build.gradle.kts'],
    outputs: ['Reporte JSON de trackers detectados', 'Lista de clases sospechosas', 'Puntuación de privacidad'],
    acceptanceCriteria: 'Exactamente 0 rastreadores para certificación FOSS oficial.',
    iconName: 'ShieldAlert'
  },
  {
    id: 'SKILL-SEC-02',
    title: 'ApkSignatureVerifier',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Verifica la validez de la firma digital de paquetes APK asegurando Android APK Signature Scheme v2 y v3.',
    trigger: 'Ingesta de artefactos binarios previos a su distribución.',
    inputs: ['Ruta del archivo binario .apk'],
    outputs: ['isSignatureValid: boolean', 'signatureScheme: string', 'certificateSha256: string'],
    acceptanceCriteria: 'Firma Scheme v2 o v3 válida; rechazo de Scheme v1 exclusivo.',
    iconName: 'Key'
  },
  {
    id: 'SKILL-SEC-03',
    title: 'Sha256ChecksumEnforcer',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Valida la integridad bit a bit de instaladores descargados antes de su ejecución o almacenamiento en caché local.',
    trigger: 'Descarga de APKs en cliente local o tareas de instalación remota.',
    inputs: ['Buffer binario del APK', 'Hash SHA-256 esperado del manifiesto'],
    outputs: ['Booleano de coincidencia estricta', 'Evento de auditoría en IndexedDB'],
    acceptanceCriteria: 'Coincidencia hash 100% idéntica antes de autorizar PackageInstaller.',
    iconName: 'CheckCircle2'
  },
  {
    id: 'SKILL-SEC-04',
    title: 'AndroidPermissionMinimizer',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Audita el archivo AndroidManifest.xml para detectar permisos excesivos, peligrosos o redundantes.',
    trigger: 'Generación de releases y escaneo heurístico de repositorios.',
    inputs: ['Contenido de AndroidManifest.xml'],
    outputs: ['Clasificación de permisos (Normal/Dangerous/Special)', 'Recomendaciones de reducción'],
    acceptanceCriteria: 'Sin permisos peligrosos sin justificación funcional explícita.',
    iconName: 'Lock'
  },
  {
    id: 'SKILL-SEC-05',
    title: 'ShizukuIpcValidator',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Valida la seguridad de la comunicación IPC con el servicio Shizuku para evitar escaladas de privilegios.',
    trigger: 'Inicialización del enlace AIDL en el contenedor Android.',
    inputs: ['Contexto de ejecución Android', 'Binder token de Shizuku'],
    outputs: ['Estado de conexión validado', 'Degradación segura a intents'],
    acceptanceCriteria: 'UID verificado (UID 0 o UID 2000) antes de llamadas a PackageInstaller.',
    iconName: 'Terminal'
  },
  {
    id: 'SKILL-SEC-06',
    title: 'DigitalAssetLinksAuditor',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Comprueba la relación 1:1 entre el dominio web y la huella SHA-256 del certificado APK en .well-known/assetlinks.json.',
    trigger: 'Despliegue de nuevas versiones del cliente web o regeneración de Keystores.',
    inputs: ['Dominio HTTPS de la tienda', 'Huella SHA-256 del certificado de release'],
    outputs: ['Diagnóstico de validación TWA', 'Estado de verificación de URL bar'],
    acceptanceCriteria: 'HTTP 200 con JSON válido y huella coincidente en assetlinks.',
    iconName: 'Globe'
  },
  {
    id: 'SKILL-SEC-07',
    title: 'CspHeaderHardening',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Audita y fortalece las políticas de seguridad de contenido (CSP) bloqueando inyecciones y telemetría no autorizada.',
    trigger: 'Modificación de index.html o configuración de servidor web.',
    inputs: ['Cabeceras HTTP de respuesta o directivas <meta>'],
    outputs: ['Directiva CSP endurecida', 'Bloqueo estricto de scripts externos'],
    acceptanceCriteria: 'Sin unsafe-eval y con frame-ancestors restrictivo.',
    iconName: 'Shield'
  },
  {
    id: 'SKILL-SEC-08',
    title: 'IndexedDbEncryptionWrapper',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Cifra en reposo los datos sensibles almacenados en IndexedDB mediante claves simétricas locales AES-GCM 256.',
    trigger: 'Escritura de credenciales o trazas forenses de usuario en IndexedDB.',
    inputs: ['Carga útil serializada', 'Clave de cifrado derivada de Web Crypto API'],
    outputs: ['Par iv + ciphertext seguro en IndexedDB'],
    acceptanceCriteria: 'Imposibilidad de leer perfiles en texto plano en localStorage/IndexedDB.',
    iconName: 'FileKey'
  },
  {
    id: 'SKILL-SEC-09',
    title: 'DependencyVulnerabilityScanner',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Escanea dependencias Gradle y NPM para detectar CVEs conocidos y proponer parches seguros.',
    trigger: 'Pre-build de producción y revisiones periódicas.',
    inputs: ['package.json', 'package-lock.json', 'build.gradle.kts'],
    outputs: ['Matriz de criticidad CVE', 'Comandos de remediación semver'],
    acceptanceCriteria: 'Cero vulnerabilidades de nivel CRITICAL en producción.',
    iconName: 'AlertTriangle'
  },
  {
    id: 'SKILL-SEC-10',
    title: 'SslCertificatePinningGenerator',
    category: 'SECURITY',
    categoryLabel: 'Seguridad & Criptografía',
    description: 'Genera la configuración network_security_config.xml con pines criptográficos SPKI para la app Android.',
    trigger: 'Compilación de releases de producción de la aplicación nativa.',
    inputs: ['Dominios oficiales del backend de la tienda', 'Certificados públicos X.509'],
    outputs: ['Archivo network_security_config.xml', 'Pines SPKI primarios y backup'],
    acceptanceCriteria: 'cleartextTrafficPermitted="false" forzado en todo el manifiesto.',
    iconName: 'FileLock'
  },

  // ==========================================
  // Categoría B: Toolchain Android y CI/CD (10)
  // ==========================================
  {
    id: 'SKILL-BLD-01',
    title: 'GradleKotlinDslMigration',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Convierte scripts de compilación Groovy (build.gradle) al formato tipado moderno Kotlin DSL (build.gradle.kts).',
    trigger: 'Detección de proyectos Android FOSS legacy en el evaluador de salud.',
    inputs: ['build.gradle Groovy'],
    outputs: ['build.gradle.kts tipado y validado'],
    acceptanceCriteria: 'Compilación limpia con ./gradlew tasks sin errores de sintaxis.',
    iconName: 'Code'
  },
  {
    id: 'SKILL-BLD-02',
    title: 'GitHubActionsWorkflowSynthesizer',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Sintetiza flujos de trabajo de GitHub Actions reproducibles para compilar APKs con JDK 17 y Gradle Wrapper.',
    trigger: 'Configuración o reparación del pipeline CI/CD del repositorio.',
    inputs: ['Versión de Java', 'Tarea Gradle destino (assembleRelease)'],
    outputs: ['.github/workflows/android-build.yml'],
    acceptanceCriteria: 'Pipeline ejecutable de extremo a extremo con subida de artefactos.',
    iconName: 'GitBranch'
  },
  {
    id: 'SKILL-BLD-03',
    title: 'ProGuardR8RulesOptimizer',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Optimiza reglas en proguard-rules.pro para minificar el código sin romper interfaces de reflexión ni AIDL.',
    trigger: 'Optimización de tamaño de binario APK previo al release.',
    inputs: ['proguard-rules.pro', 'Clases de datos y AIDL'],
    outputs: ['Reglas R8 optimizadas y compactas'],
    acceptanceCriteria: 'Reducción de tamaño > 25% sin ClassNotFoundException en runtime.',
    iconName: 'Sliders'
  },
  {
    id: 'SKILL-BLD-04',
    title: 'AndroidManifestHarmonizer',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Normaliza directivas del manifiesto fijando targetSdk 35, minSdk 24 y banderas explícitas android:exported.',
    trigger: 'Actualización a nuevas versiones de la plataforma Android.',
    inputs: ['AndroidManifest.xml'],
    outputs: ['Manifiesto normalizado libre de advertencias'],
    acceptanceCriteria: 'Cumplimiento estricto con directivas de seguridad de Android 15.',
    iconName: 'FileCode'
  },
  {
    id: 'SKILL-BLD-05',
    title: 'NdkAbiSplitPackager',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Configura splits por arquitectura (arm64-v8a, x86_64) en Gradle para generar APKs ligeros.',
    trigger: 'Compilación de paquetes con librerías nativas C/C++.',
    inputs: ['build.gradle.kts'],
    outputs: ['Configuración splits.abi con códigos de versión incrementales'],
    acceptanceCriteria: 'Reducción de tamaño del APK de 60 MB universal a ~18 MB por ABI.',
    iconName: 'Package'
  },
  {
    id: 'SKILL-BLD-06',
    title: 'ReproducibleBuildEvaluator',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Compara bit a bit artefactos generados en diferentes entornos para validar reproducibilidad FOSS.',
    trigger: 'Auditoría de reproducibilidad de compilaciones.',
    inputs: ['Dos binarios APK del mismo commit de Git'],
    outputs: ['Reporte diffoscope', 'Porcentaje de identidad binaria'],
    acceptanceCriteria: 'Identidad criptográfica SHA-256 exacta entre runners independientes.',
    iconName: 'Layers'
  },
  {
    id: 'SKILL-BLD-07',
    title: 'ShizukuAidlBindingGenerator',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Compila interfaces AIDL y genera proxies Binder para la comunicación con el demonio Shizuku.',
    trigger: 'Habilitación de Shizuku PackageInstaller API.',
    inputs: ['IShizukuService.aidl', 'IShizukuApplication.aidl'],
    outputs: ['Clases Java/Kotlin generadas en build/generated/aidl'],
    acceptanceCriteria: 'Invocación exitosa de métodos sin excepciones de parceling.',
    iconName: 'Cpu'
  },
  {
    id: 'SKILL-BLD-08',
    title: 'ServiceWorkerAtomicCacheBuster',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Invalida atómicamente cachés de versiones antiguas en sw.js asegurando actualización OTA silenciosa del WebAPK.',
    trigger: 'Compilación de producción y nuevo deploy web.',
    inputs: ['Hash de commit de Vite', 'sw.js'],
    outputs: ['Service Worker actualizado con purga atómica de cachés'],
    acceptanceCriteria: 'Nueva versión activa en el móvil sin requerir reinstalar APK.',
    iconName: 'RefreshCw'
  },
  {
    id: 'SKILL-BLD-09',
    title: 'AndroidKeystoreGenerator',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Genera almacenes de claves RSA 4096 bits para la firma de releases seguros con variables para CI.',
    trigger: 'Publicación de nuevos canales de distribución.',
    inputs: ['Alias de clave', 'Contraseñas cifradas'],
    outputs: ['Comando keytool seguro', 'Plantilla signingConfigs en Gradle'],
    acceptanceCriteria: 'Keystore válido con vigencia de al menos 10.000 días.',
    iconName: 'KeyRound'
  },
  {
    id: 'SKILL-BLD-10',
    title: 'MultiDexConfigurationAuditor',
    category: 'BUILD_TOOLCHAIN',
    categoryLabel: 'Toolchain Android & CI/CD',
    description: 'Resuelve el límite de 65.536 referencias a métodos en proyectos Android legacy con multidex.',
    trigger: 'Error DexArchiveMergerException en logs de compilación.',
    inputs: ['Logs de Gradle'],
    outputs: ['Configuración multiDexEnabled = true'],
    acceptanceCriteria: 'Ensamblado exitoso sin fallos de compilación DEX.',
    iconName: 'FileArchive'
  },

  // ==========================================
  // Categoría C: Gestión de Flota y Despliegue Remoto (8)
  // ==========================================
  {
    id: 'SKILL-FLT-01',
    title: 'CrossDevicePushDispatcher',
    category: 'FLEET_REMOTE',
    categoryLabel: 'Flota & Despliegue Remoto',
    description: 'Despacha órdenes de instalación a distancia desde el navegador web hacia teléfonos Android de la flota.',
    trigger: 'Clic en "Instalar en [Dispositivo]" en la vista de flota.',
    inputs: ['targetDeviceId', 'appId', 'downloadUrl', 'expectedSha256'],
    outputs: ['transactionId de despliegue', 'Streaming de progreso en vivo'],
    acceptanceCriteria: 'Recepción del comando en el dispositivo en < 2 segundos.',
    iconName: 'Send'
  },
  {
    id: 'SKILL-FLT-02',
    title: 'DevicePairingQrGenerator',
    category: 'FLEET_REMOTE',
    categoryLabel: 'Flota & Despliegue Remoto',
    description: 'Genera un código QR con clave efímera para emparejar nuevos dispositivos móviles a la cuenta Civer.',
    trigger: 'Apertura del diálogo "Vincular nuevo dispositivo".',
    inputs: ['userId', 'Clave de sesión pública'],
    outputs: ['URI civer://pair?...', 'Canvas QR interactivo de alto contraste'],
    acceptanceCriteria: 'Token de un solo uso con expiración a los 5 minutos.',
    iconName: 'QrCode'
  },
  {
    id: 'SKILL-FLT-03',
    title: 'WebApkPackageAssembler',
    category: 'FLEET_REMOTE',
    categoryLabel: 'Flota & Despliegue Remoto',
    description: 'Genera y valida metadatos del manifest PWA para compatibilidad nativa WebAPK en Android.',
    trigger: 'Instalación web en navegador móvil.',
    inputs: ['manifest.json', 'Iconos maskable', 'theme_color'],
    outputs: ['Manifiesto PWA validado y WebAPK ready'],
    acceptanceCriteria: 'Instalación nativa a pantalla completa sin URL bar.',
    iconName: 'Smartphone'
  },
  {
    id: 'SKILL-FLT-04',
    title: 'SilentPackageInstallExecutor',
    category: 'FLEET_REMOTE',
    categoryLabel: 'Flota & Despliegue Remoto',
    description: 'Orquesta la instalación desatendida mediante Shizuku PackageInstaller API sin prompts del sistema.',
    trigger: 'Recepción de orden de instalación remota en el dispositivo.',
    inputs: ['Ruta de APK temporal descargado y verificado por hash'],
    outputs: ['Código de retorno STATUS_SUCCESS', 'Notificación a dashboard'],
    acceptanceCriteria: 'Instalación completada y paquete visible en el launcher.',
    iconName: 'CheckSquare'
  },
  {
    id: 'SKILL-FLT-05',
    title: 'FleetHeartbeatMonitor',
    category: 'FLEET_REMOTE',
    categoryLabel: 'Flota & Despliegue Remoto',
    description: 'Supervisa el estado de batería, versión de Android y conectividad de cada dispositivo vinculado.',
    trigger: 'Pulso periódico cada 60 segundos.',
    inputs: ['Telemetría del agente móvil'],
    outputs: ['Actualización en civer_connected_devices_v1'],
    acceptanceCriteria: 'Detección de desconexión en < 3 minutos de inactividad.',
    iconName: 'Activity'
  },
  {
    id: 'SKILL-FLT-06',
    title: 'RollbackCrashGuard',
    category: 'FLEET_REMOTE',
    categoryLabel: 'Flota & Despliegue Remoto',
    description: 'Detecta crash loops tempranos en apps recién instaladas y revierte automáticamente a la versión anterior.',
    trigger: '3 excepciones fatales en menos de 30 segundos tras la instalación.',
    inputs: ['Trazas forenses de error'],
    outputs: ['Reinstalación del APK de respaldo', 'Alerta de rollback'],
    acceptanceCriteria: 'Restauración automática de la estabilidad del sistema.',
    iconName: 'History'
  },
  {
    id: 'SKILL-FLT-07',
    title: 'PeerToPeerApkSync',
    category: 'FLEET_REMOTE',
    categoryLabel: 'Flota & Despliegue Remoto',
    description: 'Transfiere instaladores APK directamente entre dispositivos en la misma red Wi-Fi por WebRTC.',
    trigger: 'Descarga de una misma app por múltiples dispositivos de la flota.',
    inputs: ['IP local de pares', 'Hash del archivo binario'],
    outputs: ['Transferencia P2P cifrada a velocidad local'],
    acceptanceCriteria: 'Ahorro de ancho de banda externo y verificación SHA-256 local.',
    iconName: 'Wifi'
  },
  {
    id: 'SKILL-FLT-08',
    title: 'OtaSyncVersionChecker',
    category: 'FLEET_REMOTE',
    categoryLabel: 'Flota & Despliegue Remoto',
    description: 'Comprueba el hash de commit activo en producción para actualizar el WebAPK al volver a primer plano.',
    trigger: 'Evento visibilitychange en la app móvil.',
    inputs: ['Endpoint /version.json'],
    outputs: ['Señal de recarga silenciosa en segundo plano'],
    acceptanceCriteria: 'Cero desfase de versión entre navegador y app móvil.',
    iconName: 'GitCommit'
  },

  // ==========================================
  // Categoría D: Curaduría de Catálogo y Heurística (8)
  // ==========================================
  {
    id: 'SKILL-CAT-01',
    title: 'RepoHealthScoreCalculator',
    category: 'CATALOG_HEURISTICS',
    categoryLabel: 'Catálogo & Heurística FOSS',
    description: 'Evalúa la salud objetiva (0-100%) de repositorios Android considerando Gradle, Kotlin DSL, commits y targetSdk.',
    trigger: 'Análisis de repositorios en el catálogo o búsqueda de nuevos proyectos.',
    inputs: ['Metadatos de Git', 'Árbol de directorios'],
    outputs: ['Health Score (0-100%)', 'Desglose granular de métricas'],
    acceptanceCriteria: 'Cálculo determinista en menos de 1.5 segundos.',
    iconName: 'HeartPulse'
  },
  {
    id: 'SKILL-CAT-02',
    title: 'FDroidV2IndexParser',
    category: 'CATALOG_HEURISTICS',
    categoryLabel: 'Catálogo & Heurística FOSS',
    description: 'Ingiere y normaliza el índice oficial JSON v2 de F-Droid con validación de firmas criptográficas.',
    trigger: 'Sincronización diferencial con espejos oficiales de F-Droid.',
    inputs: ['index-v2.json'],
    outputs: ['Catálogo de aplicaciones normalizado'],
    acceptanceCriteria: 'Firma de índice verificada contra clave oficial del repo.',
    iconName: 'Database'
  },
  {
    id: 'SKILL-CAT-03',
    title: 'GitHubReleaseScraper',
    category: 'CATALOG_HEURISTICS',
    categoryLabel: 'Catálogo & Heurística FOSS',
    description: 'Detecta nuevos releases, tags de versión y archivos APK en repositorios oficiales de GitHub.',
    trigger: 'Monitoreo de actualizaciones periódicas del catálogo.',
    inputs: ['URL de repositorio GitHub'],
    outputs: ['Nueva versión detectada', 'URL de APKs en assets', 'Changelog'],
    acceptanceCriteria: 'Extracción sin romper los límites de rate limit de la API.',
    iconName: 'Github'
  },
  {
    id: 'SKILL-CAT-04',
    title: 'SpdxLicenseValidator',
    category: 'CATALOG_HEURISTICS',
    categoryLabel: 'Catálogo & Heurística FOSS',
    description: 'Clasifica y valida que las licencias declaradas cumplan con la definición oficial de Software Libre.',
    trigger: 'Registro de nuevas aplicaciones en la base de datos.',
    inputs: ['Identificador SPDX (GPL-3.0, Apache-2.0, MIT, etc.)'],
    outputs: ['Estado de conformidad FOSS', 'Badge visual de licencia'],
    acceptanceCriteria: 'Rechazo automático de licencias no libres o privativas.',
    iconName: 'Scale'
  },
  {
    id: 'SKILL-CAT-05',
    title: 'AntiFeatureDetector',
    category: 'CATALOG_HEURISTICS',
    categoryLabel: 'Catálogo & Heurística FOSS',
    description: 'Detecta características anti-usuario (publicidad no libre, microtransacciones privativas o dependencias opacas).',
    trigger: 'Auditoría previa a la publicación en catálogo.',
    inputs: ['Código fuente y manifiesto de la aplicación'],
    outputs: ['Lista de Anti-Features con advertencias visuales'],
    acceptanceCriteria: 'Transparencia absoluta para el usuario en la ficha de la tienda.',
    iconName: 'AlertOctagon'
  },
  {
    id: 'SKILL-CAT-06',
    title: 'AppStoreAlternativesComparator',
    category: 'CATALOG_HEURISTICS',
    categoryLabel: 'Catálogo & Heurística FOSS',
    description: 'Calcula matrices comparativas funcionales entre Civer, F-Droid, Aurora Store, Obtainium y Google Play.',
    trigger: 'Carga de la vista Matrix Pro y comparadores.',
    inputs: ['Matriz de soporte técnico por tienda'],
    outputs: ['Puntuación de ergonomía y soberanía digital'],
    acceptanceCriteria: 'Generación de tabla comparativa con ordenamiento en vivo.',
    iconName: 'Columns'
  },
  {
    id: 'SKILL-CAT-07',
    title: 'SemanticSearchIndexer',
    category: 'CATALOG_HEURISTICS',
    categoryLabel: 'Catálogo & Heurística FOSS',
    description: 'Indexa en memoria descripciones, nombres y etiquetas para búsqueda difusa (fuzzy) instantánea.',
    trigger: 'Carga del catálogo en el cliente.',
    inputs: ['Array de AppCatalogItem'],
    outputs: ['Índice invertido reactivo'],
    acceptanceCriteria: 'Búsquedas completadas en menos de 5 ms.',
    iconName: 'Search'
  },
  {
    id: 'SKILL-CAT-08',
    title: 'ScreenshotOptimizer',
    category: 'CATALOG_HEURISTICS',
    categoryLabel: 'Catálogo & Heurística FOSS',
    description: 'Convierte y comprime capturas de pantalla a WebP de 1080px de ancho con placeholders en base64.',
    trigger: 'Ingesta de imágenes para la ficha técnica.',
    inputs: ['Archivos de imagen PNG/JPEG'],
    outputs: ['Imágenes WebP optimizadas con carga progresiva'],
    acceptanceCriteria: 'Reducción de peso de imagen > 70% sin artefactos visuales.',
    iconName: 'Image'
  },

  // ==========================================
  // Categoría E: Developer Workspace e Integraciones (7)
  // ==========================================
  {
    id: 'SKILL-DEV-01',
    title: 'ObsidianVaultGenerator',
    category: 'DEV_WORKSPACE',
    categoryLabel: 'Dev Workspace & Integraciones',
    description: 'Exporta documentación de aplicaciones en Markdown con frontmatter YAML compatible con Obsidian Vaults.',
    trigger: 'Clic en "Exportar a Obsidian" en la ficha técnica.',
    inputs: ['AppCatalogItem', 'Reporte de heurística'],
    outputs: ['Archivo .md descargable formateado'],
    acceptanceCriteria: 'Frontmatter válido y enlaces internos estructurados.',
    iconName: 'FileText'
  },
  {
    id: 'SKILL-DEV-02',
    title: 'JiraIssueDispatcher',
    category: 'DEV_WORKSPACE',
    categoryLabel: 'Dev Workspace & Integraciones',
    description: 'Abre automáticamente un ticket de incidencia en Jira si una compilación en CI falla reiteradamente.',
    trigger: 'Estado FAILED en la cola de compilación persistente.',
    inputs: ['PersistentCiQueueItem', 'Logs de Gradle'],
    outputs: ['Incidencia creada en Jira con enlace directo'],
    acceptanceCriteria: 'Payload JSON conforme a la API REST v2 de Jira.',
    iconName: 'Bug'
  },
  {
    id: 'SKILL-DEV-03',
    title: 'SlackWebhookNotifier',
    category: 'DEV_WORKSPACE',
    categoryLabel: 'Dev Workspace & Integraciones',
    description: 'Envía tarjetas Block Kit con enlaces y hashes de releases a canales de desarrollo en Slack.',
    trigger: 'Finalización exitosa de build o nuevo release.',
    inputs: ['Webhook URL', 'Datos del APK compilado'],
    outputs: ['Mensaje visual enriquecido en Slack'],
    acceptanceCriteria: 'Entrega en < 1 segundo con color verde y hash SHA-256.',
    iconName: 'MessageSquare'
  },
  {
    id: 'SKILL-DEV-04',
    title: 'ForensicTelemetryExporter',
    category: 'DEV_WORKSPACE',
    categoryLabel: 'Dev Workspace & Integraciones',
    description: 'Exporta un volcado JSON anonimizado de incidentes y trazas de red almacenados en IndexedDB.',
    trigger: 'Solicitud de diagnóstico o soporte técnico.',
    inputs: ['Base de datos civer_fault_telemetry_db'],
    outputs: ['Archivo civer-forensic-telemetry.json'],
    acceptanceCriteria: 'Datos 100% locales sin información personal identificable.',
    iconName: 'DownloadCloud'
  },
  {
    id: 'SKILL-DEV-05',
    title: 'ChangelogSynthesizer',
    category: 'DEV_WORKSPACE',
    categoryLabel: 'Dev Workspace & Integraciones',
    description: 'Redacta notas de versión clasificadas a partir de commits semánticos de Git.',
    trigger: 'Preparación de un nuevo release.',
    inputs: ['Historial de commits semánticos'],
    outputs: ['Changelog Markdown estructurado'],
    acceptanceCriteria: 'Agrupación clara en Features, Fixes y Performance.',
    iconName: 'ListOrdered'
  },
  {
    id: 'SKILL-DEV-06',
    title: 'McpToolContractValidator',
    category: 'DEV_WORKSPACE',
    categoryLabel: 'Dev Workspace & Integraciones',
    description: 'Valida esquemas JSON-RPC de las herramientas MCP expuestas en mcpToolsService.ts.',
    trigger: 'Modificación de herramientas para agentes autónomos.',
    inputs: ['MCP_TOOLS_CATALOG'],
    outputs: ['Certificación de conformidad JSON Schema draft-07'],
    acceptanceCriteria: '0 errores de validación en contratos de herramientas.',
    iconName: 'CheckSquare'
  },
  {
    id: 'SKILL-DEV-07',
    title: 'ArchitectureBlueprintRenderer',
    category: 'DEV_WORKSPACE',
    categoryLabel: 'Dev Workspace & Integraciones',
    description: 'Genera diagramas de componentes y topología de red en Mermaid/SVG en tiempo real.',
    trigger: 'Apertura de la vista Architecture Blueprint.',
    inputs: ['Grafo de nodos y conexiones de la arquitectura'],
    outputs: ['Render SVG interactivo de alta resolución'],
    acceptanceCriteria: 'Visualización clara compatible con modo oscuro.',
    iconName: 'Share2'
  },

  // ==========================================
  // Categoría F: Experiencia de Usuario y Accesibilidad (7)
  // ==========================================
  {
    id: 'SKILL-UIX-01',
    title: 'AndroidTouchTargetAuditor',
    category: 'UX_ACCESSIBILITY',
    categoryLabel: 'UX & Accesibilidad Android',
    description: 'Garantiza que todos los botones y controles táctiles tengan un área mínima de 44x44 píxeles.',
    trigger: 'Pruebas de interfaz en dispositivos móviles y tablets.',
    inputs: ['Elementos interactivos del DOM'],
    outputs: ['Auditoría de dimensiones táctiles y padding compensatorio'],
    acceptanceCriteria: '100% de elementos con dimensiones >= 44x44px.',
    iconName: 'Hand'
  },
  {
    id: 'SKILL-UIX-02',
    title: 'WcagContrastEnforcer',
    category: 'UX_ACCESSIBILITY',
    categoryLabel: 'UX & Accesibilidad Android',
    description: 'Valida matemáticamente que el contraste entre texto y fondo sea de al menos 4.5:1 (WCAG AA).',
    trigger: 'Ajuste de paletas de color en Tailwind CSS.',
    inputs: ['Colores hexadecimales de foreground y background'],
    outputs: ['Ratio de contraste computado y correcciones tonales'],
    acceptanceCriteria: 'Legibilidad universal sin texto gris sobre fondos apagados.',
    iconName: 'Eye'
  },
  {
    id: 'SKILL-UIX-03',
    title: 'ResponsiveViewportSimulator',
    category: 'UX_ACCESSIBILITY',
    categoryLabel: 'UX & Accesibilidad Android',
    description: 'Ajusta el contenedor del marco para simular pantallas de móvil (360px), tablet (768px) y desktop.',
    trigger: 'Uso de ResponsiveViewportToolbar.',
    inputs: ['Preset de resolución'],
    outputs: ['Marco de simulación con scroll independiente'],
    acceptanceCriteria: 'Sin desbordamientos horizontales en ninguna resolución.',
    iconName: 'Maximize2'
  },
  {
    id: 'SKILL-UIX-04',
    title: 'MotionFrameBudgetAuditor',
    category: 'UX_ACCESSIBILITY',
    categoryLabel: 'UX & Accesibilidad Android',
    description: 'Supervisa que las animaciones con motion mantengan 60 FPS estables sin provocar caídas de frames.',
    trigger: 'Transición entre vistas y apertura de modales.',
    inputs: ['Tiempos de renderizado por frame'],
    outputs: ['Optimización de propiedades de GPU (transform, opacity)'],
    acceptanceCriteria: 'Tiempo por frame < 16.6 ms de manera sostenida.',
    iconName: 'Zap'
  },
  {
    id: 'SKILL-UIX-05',
    title: 'DarkModeNeutralHarmonizer',
    category: 'UX_ACCESSIBILITY',
    categoryLabel: 'UX & Accesibilidad Android',
    description: 'Aplica fondos neutros oscuros slate-950 con elevaciones progresivas evitando el negro puro agresivo.',
    trigger: 'Definición de estilos y temas oscuros.',
    inputs: ['Tokens de color de la interfaz'],
    outputs: ['Jerarquía de elevaciones visualmente confortable'],
    acceptanceCriteria: 'Diferencia de brillo entre tarjetas y fondo <= 12%.',
    iconName: 'Moon'
  },
  {
    id: 'SKILL-UIX-06',
    title: 'CommandPaletteActionMapper',
    category: 'UX_ACCESSIBILITY',
    categoryLabel: 'UX & Accesibilidad Android',
    description: 'Mapea y gestiona atajos de teclado globales (Ctrl+K, A, D, B) en la paleta de comandos.',
    trigger: 'Invocación mediante teclado en cualquier pantalla.',
    inputs: ['Atajos de teclado configurados'],
    outputs: ['Filtrado reactivo y ejecución instantánea'],
    acceptanceCriteria: 'Navegación completa por teclado con flechas y Enter.',
    iconName: 'Compass'
  },
  {
    id: 'SKILL-UIX-07',
    title: 'OfflineFallbackRenderer',
    category: 'UX_ACCESSIBILITY',
    categoryLabel: 'UX & Accesibilidad Android',
    description: 'Provee una degradación visual elegante con encolado local cuando se pierde la conexión de red.',
    trigger: 'Evento offline del navegador.',
    inputs: ['Estado de red emitido por OfflineIndicator'],
    outputs: ['Banner discreto de modo offline y cola de sincronización'],
    acceptanceCriteria: 'Acceso ininterrumpido a todas las funciones locales cacheadas.',
    iconName: 'WifiOff'
  }
];
