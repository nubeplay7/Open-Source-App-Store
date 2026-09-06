import { ModuleDocumentation } from '../types';

export const MODULE_DOCUMENTATIONS: ModuleDocumentation[] = [
  {
    id: 'mod-01-ui-shell',
    name: 'Multi-Engine UI Shell (Play Store, App Store & Matrix Pro)',
    layer: 'FRONTEND_UI',
    shortDescription: 'Capa de presentación responsiva con tres modos de renderizado sincronizados mediante estado global reactivo.',
    detailedArchitecture: `
La capa UI Shell implementa un patrón de arquitectura desacoplada donde el usuario puede alternar dinámicamente entre tres motores de renderizado sin perder el contexto de navegación ni el estado de instalación:
1. **Google Play Store Mode**: Renderizado basado en Google Material 3 Expressive, con barra de búsqueda flotante tipo pill, insignias de eventos, categorización contextual, carruseles horizontales con snap de scroll y pestañas modulares (Para ti, Éxitos, Juegos, Apps, Compilador CI, Dev Hub).
2. **Apple App Store Mode**: Renderizado basado en diseño Cupertino con tipografía San Francisco Display de alto contraste, tarjetas editoriales expansibles "Hoy", tags en mayúsculas espaciadas y llamadas a la acción "OBTENER".
3. **Matrix Pro Mode**: Interfaz analítica densa con tabla de matriz multi-criterio, benchmarks visuales de consumo de memoria RAM (Idle vs Indexación), comparador cara a cara de 3 tiendas y asistente de decisión (Quiz).
    `,
    inputOutputFlows: [
      'Entrada: Eventos de usuario (búsqueda, selección de categoría, cambio de modo, click en app).',
      'Estado Interno: uiMode ("play_store" | "app_store" | "matrix_pro"), activeTab, searchQuery, selectedCategory.',
      'Salida: Disparo de modales globales (Detalle de App, Compilador CI, Instalador Shizuku, Publicador Dev, Drawer de Cuenta).'
    ],
    securityAndPermissions: 'No almacena secretos en cliente. Ejecuta validaciones de entrada en la barra de búsqueda para prevenir inyección de caracteres maliciosos.',
    telemetryAndPerformance: 'Usa renderizado memoizado con useMemo para filtros de búsqueda masivos sobre el catálogo y animaciones con Motion.',
    futureEnhancements: [
      'Transiciones de layout animadas fluidas entre el modo Play Store y App Store.',
      'Soporte para temas dinámicos Material You basados en la paleta de colores del fondo de pantalla.'
    ],
    keyComponents: ['PlayStoreView.tsx', 'AppStoreView.tsx', 'Navbar.tsx', 'MatrixTableView.tsx'],
    codeLocation: '/src/components/PlayStoreView.tsx, /src/components/AppStoreView.tsx, /src/components/Navbar.tsx'
  },
  {
    id: 'mod-02-cloud-ci',
    name: 'GitHub Actions Cloud CI Compiler Engine',
    layer: 'CLOUD_CI_PIPELINE',
    shortDescription: 'Motor de orquestación y simulación de flujos de integración continua (CI) para compilar APKs nativos desde GitHub.',
    detailedArchitecture: `
El motor de compilación en la nube permite generar binarios APK directamente desde el código fuente de repositorios públicos o privados en GitHub:
1. **Pipeline de 8 fases estandarizadas**:
   - Fase 1: Checkout de código fuente (\`actions/checkout@v4\`).
   - Fase 2: Configuración de entorno OpenJDK 17 (\`actions/setup-java@v4\`).
   - Fase 3: Cache inteligente de dependencias Gradle y wrapper (\`gradle/actions/setup-gradle@v3\`).
   - Fase 4: Compilación de bytecode Android (\`./gradlew assembleRelease\`).
   - Fase 5: Minificación y ofuscación de código con R8 / ProGuard.
   - Fase 6: Alineación de binarios APK con \`zipalign -p 4\`.
   - Fase 7: Firma criptográfica Android APK Signature Scheme v2/v3 con \`apksigner\`.
   - Fase 8: Generación de suma de verificación SHA-256 y carga del artefacto (.apk).
2. **Terminal ANSI interactiva**: Emisión de logs en tiempo real con marcas temporales, colorización semántica y cálculo de porcentaje de progreso.
3. **Generador de Workflows YAML**: Creación automática de archivos \`.github/workflows/android-ci.yml\` listos para copiar o enviar mediante la API REST de GitHub usando Personal Access Tokens (PAT).
    `,
    inputOutputFlows: [
      'Entrada: Objeto AppCatalogItem (repoUrl, defaultBranch, gradleTask) o Personal Access Token (PAT).',
      'Procesamiento: Dispatcher simulado o llamada REST a /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches.',
      'Salida: Nuevo registro en buildHistory con estado "completed", log entries detallados, enlace de descarga de APK y hash SHA-256.'
    ],
    securityAndPermissions: 'El Personal Access Token de GitHub se almacena exclusivamente en memoria del navegador o localStorage encriptado en el cliente y nunca se envía a servidores de terceros.',
    telemetryAndPerformance: 'Mide tiempo de ejecución por fase (checkout, gradle, signing) y tamaño final de los binarios APK generados.',
    futureEnhancements: [
      'Soporte para compilación de Android App Bundles (.aab) y extracción con bundletool.',
      'Matriz de pruebas unitarias automatizadas con Robolectric previo a la firma del APK.'
    ],
    keyComponents: ['GitHubCompilerModal.tsx', 'buildHistoryData.ts'],
    codeLocation: '/src/components/GitHubCompilerModal.tsx, /src/data/buildHistoryData.ts'
  },
  {
    id: 'mod-03-shizuku-installer',
    name: 'Shizuku ADB & PackageInstaller Subsystem',
    layer: 'SECURITY_INSTALLER',
    shortDescription: 'Módulo de despliegue y validación criptográfica de paquetes APK con soporte para instalación silenciosa vía Shizuku Binder RPC.',
    detailedArchitecture: `
Proporciona una interfaz unificada para la instalación segura de paquetes Android (.apk) en el dispositivo:
1. **Modo Shizuku (ADB sin root)**:
   - Conecta con el proceso \`moe.shizuku.privileged.api\` ejecutándose en el sistema operativo Android.
   - Invoca el servicio nativo de \`PackageInstaller\` con privilegios \`android.permission.INSTALL_PACKAGES\` (UID 2000 / Shell).
   - Realiza la instalación de forma desatendida y silenciosa, sin prompts manuales repetitivos para el usuario.
2. **Modo PackageInstaller Estándar**:
   - Genera el Intent \`android.intent.action.VIEW\` con tipo MIME \`application/vnd.android.package-archive\` y flags \`FLAG_GRANT_READ_URI_PERMISSION\`.
3. **Auditoría de Seguridad Previa a la Instalación**:
   - Validación del esquema de firma criptográfica (APK Signature Scheme v2/v3).
   - Análisis de compatibilidad de arquitectura (\`arm64-v8a\`, \`armeabi-v7a\`, \`x86_64\`).
   - Inspección estática de permisos peligrosos solicitados (cámara, ubicación, almacenamiento, SMS).
   - Verificación de firmas de rastreadores conocidos según la base de datos de Exodus Privacy.
    `,
    inputOutputFlows: [
      'Entrada: AppCatalogItem con metadatos de APK (tamaño, versión, packageName, permissions, sha256).',
      'Procesamiento: Simulación/Ejecución del pipeline de verificación de seguridad -> Handshake Shizuku -> Commit de sesión.',
      'Salida: Notificación de instalación exitosa, actualización de installedAppIds en UserProfile y disponibilidad de botón "ABRIR".'
    ],
    securityAndPermissions: 'Verifica que el usuario haya habilitado orígenes desconocidos o que el daemon de Shizuku tenga permisos de depuración inalámbrica ADB activos.',
    telemetryAndPerformance: 'Verificación en tiempo real del estado del servicio Shizuku y velocidad de transferencia de paquetes (KB/s).',
    futureEnhancements: [
      'Soporte para instalación de Split APKs (.apks, .xapk, .apkm) ensamblando sesiones multi-paquete.',
      'Integración con la API WebADB mediante protocolo USB directo.'
    ],
    keyComponents: ['ApkInstallerModal.tsx'],
    codeLocation: '/src/components/ApkInstallerModal.tsx'
  },
  {
    id: 'mod-04-catalog-metadata',
    name: 'App Catalog & FOSS Store Database Engine',
    layer: 'DATA_STORE',
    shortDescription: 'Base de conocimiento estructurada que contiene las especificaciones técnicas de 10 tiendas y 18 aplicaciones FOSS.',
    detailedArchitecture: `
Almacena y gestiona el catálogo unificado de aplicaciones de código abierto y clientes de tiendas alternativas:
1. **Dataset de Tiendas FOSS (stores.ts)**:
   - 10 tiendas FOSS documentadas con más de 30 parámetros técnicos cada una (licencias GPLv3/MIT/Apache, soporte de repositorios, puntuación de seguridad, análisis de telemetría, stack de UI como Jetpack Compose/XML, dependencias de red como OkHttp/Ktor y consumo de memoria RAM).
2. **Dataset de Aplicaciones del Catálogo (appsCatalogData.ts)**:
   - 18 aplicaciones categorizadas con metadatos completos: nombre de paquete, versión, tamaño de descarga en MB, capturas de pantalla, permisos de Android requeridos, tareas de compilación Gradle y URLs de repositorio.
3. **Mecanismo de Búsqueda y Filtrado**:
   - Búsqueda multi-campo en tiempo real (nombre, descripción, tecnologías, tags) con tolerancia a mayúsculas/minúsculas y filtrado por categoría.
    `,
    inputOutputFlows: [
      'Entrada: Consultas de búsqueda, filtros de categoría y nuevos envíos de desarrolladores.',
      'Procesamiento: Indexación en memoria, ordenación por popularidad, rating de seguridad o estrellas de GitHub.',
      'Salida: Colecciones filtradas y tipadas listas para renderizar en cualquier vista del sistema.'
    ],
    securityAndPermissions: 'Todos los enlaces a repositorios y sitios web oficiales están validados para prevenir redirecciones a dominios sospechosos.',
    telemetryAndPerformance: 'Consultas ultra-rápidas en memoria (<1ms) con soporte para expansión a almacenamiento indexado.',
    futureEnhancements: [
      'Sincronización remota con repositorios oficiales de F-Droid e IzzyOnDroid mediante fetch de index-v2.json.',
      'Caché de imágenes y capturas de pantalla en local storage / IndexedDB.'
    ],
    keyComponents: ['appsCatalogData.ts', 'stores.ts', 'AppDetailModal.tsx'],
    codeLocation: '/src/data/appsCatalogData.ts, /src/data/stores.ts'
  },
  {
    id: 'mod-05-developer-portal',
    name: 'Developer Portal & Ingestion Pipeline',
    layer: 'CLOUD_CI_PIPELINE',
    shortDescription: 'Plataforma para que desarrolladores independientes registren, validen y compilen sus aplicaciones FOSS.',
    detailedArchitecture: `
Permite a los creadores de software libre incorporar sus proyectos al catálogo del Hub:
1. **Formulario de Registro Validado**:
   - Validación de sintaxis de nombres de paquete Android (\`com.dominio.app\`).
   - Selección de licencias FOSS estándar (GPLv3, MIT, Apache 2.0, AGPL, BSD, MPL).
   - Configuración de repositorio GitHub, rama principal (\`main\` o \`master\`) y comando Gradle (\`assembleRelease\`).
2. **Auto-Generación de Metadatos**:
   - Asignación de gradientes de icono, etiquetas de insignia y categorías temáticas.
3. **Integración Instantánea con CI**:
   - Disparo directo del compilador Cloud para generar el primer binario APK firmado inmediatamente tras el registro.
    `,
    inputOutputFlows: [
      'Entrada: DeveloperAppSubmission con datos del proyecto.',
      'Procesamiento: Transformación del submission a AppCatalogItem con IDs únicos y propiedades por defecto.',
      'Salida: Inserción en la colección catalog y apertura automática del compilador CI.'
    ],
    securityAndPermissions: 'Valida que el repositorio pertenezca a fuentes legítimas de código abierto y no contenga esquemas de URL maliciosos.',
    telemetryAndPerformance: 'Formulario responsivo con validación asíncrona de campos.',
    futureEnhancements: [
      'Parser automático de AndroidManifest.xml y build.gradle.kts desde la API de GitHub.',
      'Generación automática de capturas de pantalla mediante emulador headless en la nube.'
    ],
    keyComponents: ['DeveloperPublishModal.tsx'],
    codeLocation: '/src/components/DeveloperPublishModal.tsx'
  },
  {
    id: 'mod-06-account-telemetry',
    name: 'Account Profile & Device Telemetry Engine',
    layer: 'TELEMETRY_ENGINE',
    shortDescription: 'Gestor del perfil de usuario (Google Play / GitHub), saldo de Puntos Play y diagnóstico de hardware del dispositivo.',
    detailedArchitecture: `
Centraliza la información de usuario y la telemetría del entorno Android simulado:
1. **Perfil de Usuario (UserProfile)**:
   - Identidad sincronizada (\`civer.team.cloud@gmail.com\`, Oscar Manuel).
   - Nivel de Puntos Play (Bronce con 0 puntos iniciales) y lista de apps instaladas.
   - Credenciales GitHub (Personal Access Token y usuario para Actions).
2. **Diagnóstico de Hardware y Sistema (DeviceTelemetry)**:
   - Modelo: Xiaomi 14 Ultra (HyperOS) con Android 15 (API 35).
   - Métricas de Almacenamiento: 44.2 GB ocupados de 128 GB totales con barra de progreso porcentual.
   - Memoria RAM: 4.8 GB en uso de 12 GB totales.
   - Sensores de Seguridad: Estado activo de Play Protect, servicio Shizuku y permisos de instalación de orígenes desconocidos.
    `,
    inputOutputFlows: [
      'Entrada: Modificaciones de perfil (cambio de token GitHub, canje de puntos, conmutación de ajustes).',
      'Procesamiento: Actualización del estado inmutable en App.tsx.',
      'Salida: Sincronización visual en el Drawer de Ajustes y en el badge de usuario de la barra de navegación.'
    ],
    securityAndPermissions: 'Los tokens de acceso personal de GitHub no se transmiten externamente y se guardan únicamente en el estado local del cliente.',
    telemetryAndPerformance: 'Monitoreo reactivo de recursos de almacenamiento y memoria RAM simulada.',
    futureEnhancements: [
      'Herramienta de limpieza de archivos residuales y APKs antiguos descargados para liberar almacenamiento.',
      'Gráfico histórico del uso de memoria RAM por aplicación instalada.'
    ],
    keyComponents: ['AccountSettingsDrawer.tsx'],
    codeLocation: '/src/components/AccountSettingsDrawer.tsx'
  },
  {
    id: 'mod-07-foss-matrix-benchmarks',
    name: 'FOSS Matrix & Performance Benchmarking Subsystem',
    layer: 'FRONTEND_UI',
    shortDescription: 'Módulo analítico que evalúa métricas de RAM, tiempos de sincronización y protocolos de seguridad de las tiendas FOSS.',
    detailedArchitecture: `
Módulo especializado en la comparación técnica exhaustiva de clientes de repositorios y tiendas FOSS:
1. **Visualizador de Matriz**:
   - Columnas configurables: Estado de actividad, puntuación de facilidad, puntuación de seguridad, licencias, métodos de instalación (Root, Shizuku, SessionInstaller) y stack tecnológico (Kotlin, Compose, Room, OkHttp).
2. **Gráficos de Rendimiento de Memoria RAM**:
   - Gráfico comparativo de barras para RAM en reposo (Idle) y durante sincronización de repositorios grandes.
   - Puntuación de eficiencia de batería calculada con ponderaciones de consumo de CPU en segundo plano.
3. **Motor de Cuestionario (Quiz Recommender)**:
   - Árbol de decisiones de 4 preguntas que clasifica al usuario en perfiles (Seguridad Máxima, Sustituto Play Store, Gestor Universal de GitHub, Minimalista) y recomienda la tienda idónea con porcentaje de afinidad.
    `,
    inputOutputFlows: [
      'Entrada: Parámetros de filtrado, tiendas seleccionadas para comparar y respuestas al test de recomendación.',
      'Procesamiento: Algoritmo de afinidad por distancia Euclidiana ponderada sobre características de tiendas.',
      'Salida: Renderizado de gráficos, tablas y tarjetas de recomendación personalizadas.'
    ],
    securityAndPermissions: 'Totalmente cliente, sin cookies ni rastreadores.',
    telemetryAndPerformance: 'Cálculo de puntuaciones optimizado con ejecución en tiempo constante O(1).',
    futureEnhancements: [
      'Exportación de benchmarks a formato CSV, PDF y JSON además de Markdown.',
      'Comparativa de consumo energético mediante registros Batterystats de Android.'
    ],
    keyComponents: ['MatrixTableView.tsx', 'PerformanceBenchmarkView.tsx', 'ComparisonView.tsx', 'RecommenderQuizView.tsx'],
    codeLocation: '/src/components/MatrixTableView.tsx, /src/components/PerformanceBenchmarkView.tsx'
  },
  {
    id: 'mod-08-changelog-proposals',
    name: 'System Architecture Ledger & Community Proposals Hub',
    layer: 'DATA_STORE',
    shortDescription: 'Motor de gobernanza iterativa, registro de cambios histórico con planos del sistema y centro de propuestas comunitarias analizadas por IA.',
    detailedArchitecture: `
El módulo de gobernanza y trazabilidad proporciona transparencia total sobre la evolución del sistema:
1. **Registro de Cambios del Sistema (Changelog Ledger)**:
   - Registra cada solicitud del usuario desde la Iteración 1 hasta la actual y futuras.
   - Desglosa para cada ciclo: Solicitud recibida, Resumen ejecutivo, Fases arquitectónicas ejecutadas, Funcionalidades implementadas y verificadas funcionando, y Roadmap pendiente clasificado por prioridad técnica.
   - Proporciona opciones de búsqueda por palabra clave, filtrado por iteración y exportación de la bitácora en Markdown.
2. **Hub de Sugerencia de Mejoras y Propuestas Comunitarias**:
   - Permite a usuarios, desarrolladores y agentes de IA someter nuevas propuestas de funcionalidad.
   - Integra un sistema de votación de prioridad en tiempo real.
   - Proporciona análisis técnico automático generado por agentes IA con puntuación de factibilidad (1-100), impacto arquitectónico, complejidad estimada y componentes requeridos.
3. **Visor Interactivo de Planos y Documentación Modular**:
   - Visualización estructurada de las especificaciones, flujos de entrada/salida, seguridad y contratos de los 8 módulos del sistema.
    `,
    inputOutputFlows: [
      'Entrada: Nuevas propuestas creadas por usuarios o agentes, votos de prioridad y consultas del historial de cambios.',
      'Procesamiento: Cálculo de votos, evaluación de viabilidad de propuestas y filtrado cronológico de iteraciones.',
      'Salida: Visualización interactiva en modales, exportación de reportes de gobernanza y sincronización de estado de propuestas.'
    ],
    securityAndPermissions: 'Validación de longitud y contenido en las propuestas enviadas para asegurar alta calidad técnica.',
    telemetryAndPerformance: 'Almacenamiento reactivo en estado local con soporte de sincronización duradera.',
    futureEnhancements: [
      'Persistencia de propuestas y votos en base de datos Firestore.',
      'Generación automática de especificaciones RFC (Request For Comments) a partir de propuestas aprobadas.'
    ],
    keyComponents: ['ChangelogLedgerModal.tsx', 'ProposalsHubModal.tsx', 'ArchitectureDocsModal.tsx', 'changelogData.ts', 'proposalsData.ts', 'moduleDocsData.ts'],
    codeLocation: '/src/components/ChangelogLedgerModal.tsx, /src/components/ProposalsHubModal.tsx, /src/components/ArchitectureDocsModal.tsx'
  },
  {
    id: 'mod-09-keystore-vault-builds-hub',
    name: 'Keystore Cryptographic Vault & Builds Hub Subsystem',
    layer: 'SECURITY_INSTALLER',
    shortDescription: 'Bóveda de certificados de firma APK (RSA 4096 / ECDSA P-256) con esquemas v1 a v4 y panel unificado de gestión de compilaciones y artefactos.',
    detailedArchitecture: `
Proporciona seguridad criptográfica e inspección de binarios en el ecosistema Civer App Store:
1. **Bóveda de Llaves Criptográficas (KeystoreVaultModal)**:
   - Soporte para algoritmos RSA 4096-bit, ECDSA P-256 y Ed25519.
   - Compatibilidad completa con APK Signature Scheme v1, v2, v3 (rotación) y v4 (streaming tree-hash).
   - Generación y verificación de huellas dactilares SHA-256 y SHA-1 para cada clave pública.
   - Vinculación por ID de aplicación y selección de clave global predeterminada.
2. **Hub de Compilaciones (BuildsHubView)**:
   - Panel de control de builds con métricas de tasa de éxito, duración promedio de workflows y acceso directo a descargas de APKs.
   - Galería de evidencias con capturas, logs detallados paso a paso y verificación de sumas SHA-256.
3. **Clonado Local de Código Fuente**:
   - Almacenamiento de árboles Git en /storage/emulated/0/CiberDev/src/ con inspección de ramas y comprobación de diferencias con upstream.
    `,
    inputOutputFlows: [
      'Entrada: Creación o importación de certificados Keystore, solicitudes de compilación y clonado de repos.',
      'Procesamiento: Inyección de credenciales de firma en workflows de GitHub Actions y verificación SHA-256 de artefactos producidos.',
      'Salida: Binarios APK firmados listos para instalación directa vía Shizuku o descarga manual.'
    ],
    securityAndPermissions: 'Las claves privadas nunca abandonan el entorno seguro del cliente o los secretos cifrados de GitHub Actions.',
    telemetryAndPerformance: 'Cálculo instantáneo de hashes criptográficos mediante Web Crypto API.',
    futureEnhancements: [
      'Integración con hardware security modules (HSM) y YubiKey FIDO2.',
      'Firma remota mediante Sigstore y Cosign para atestaciones de compilación reproducible.'
    ],
    keyComponents: ['KeystoreVaultModal.tsx', 'BuildsHubView.tsx', 'BuildEvidenceGallery.tsx', 'keystoresData.ts', 'clonedReposData.ts'],
    codeLocation: '/src/components/KeystoreVaultModal.tsx, /src/components/BuildsHubView.tsx'
  },
  {
    id: 'mod-10-theme-design-profiles-feature-flags',
    name: 'Theme & Design Profiles Engine with Non-Destructive Feature Flags Matrix',
    layer: 'FRONTEND_UI',
    shortDescription: 'Motor dinámico de personalización estética con 8 paletas cromáticas intercambiables y matriz de 16 flags de características sin sobrescrituras.',
    detailedArchitecture: `
Implementa el paradigma de coexistencia no destructiva y gobernanza visual y funcional total:
1. **8 Paletas Temáticas Intercambiables**:
   - Titanio Oscuro (Pizarra / Esmeralda)
   - Escarcha Luminosa (Tema Claro Satinado / Azul Zafiro)
   - OLED Ciber-Matrix (Negro Puro #000000 0-nit / Neón Verde)
   - Cyber Violet & HyperOS (Púrpura Profundo / Fucsia Neón)
   - Cupertino Glass (Vidrio Translúcido iOS / Azul San Francisco)
   - Terminal Retro Ámbar (Fósforo Ámbar / Bronce Hacker)
   - Bosque Solarized & Jade (Verde Pino / Jade de Bajo Brillo)
   - Azul Medianoche (Océano Profundo / Cian Glacial)
2. **Perfiles de Ergonomía Visual**:
   - Densidad: Compacta (alta densidad de datos), Equilibrada (estándar), Espaciosa (grandes targets táctiles).
   - Curvatura: Sharp (4px), Equilibrado (16px), Rounded Pill (24px), Cupertino Glass (20px con blur).
3. **Perfiles Funcionales (Presets) y 16 Feature Flags**:
   - Presets: Full Power Dev, Purista FOSS, Tienda Casual, Auditor de Ciberseguridad, Ultra Ahorro de Batería.
   - Matriz de Flags: Control individual sobre Compilador Cloud, Bóveda Keystore, Shizuku, Auditoría Exodus, Repositorios Descentralizados, Telemetría, Delta Updates, Workspace Colaborativo, etc.
    `,
    inputOutputFlows: [
      'Entrada: Selección de paleta de color, ajuste de densidad/curvatura, conmutación de preset funcional o toggle individual de flags.',
      'Procesamiento: Inyección reactiva de tokens de diseño y actualización de la configuración FeatureFlagsConfig en el estado global.',
      'Salida: Transformación visual instantánea de toda la aplicación y ajuste dinámico de la disponibilidad de módulos sin recargas de página.'
    ],
    securityAndPermissions: 'Totalmente reactivo en memoria con persistencia en localStorage del cliente.',
    telemetryAndPerformance: 'Conmutación en 0ms gracias a clases utilitarias de Tailwind y renderizado condicional optimizado.',
    futureEnhancements: [
      'Soporte para temas creados por el usuario con selector de color hexadecimal libre (Color Picker).',
      'Exportación e importación de perfiles completos de configuración en formato JSON.'
    ],
    keyComponents: ['ThemeAndDesignProfileModal.tsx', 'FunctionalityProfilesModal.tsx', 'themeProfilesData.ts', 'functionalityProfilesData.ts'],
    codeLocation: '/src/components/ThemeAndDesignProfileModal.tsx, /src/components/FunctionalityProfilesModal.tsx'
  },
  {
    id: 'mod-11-silent-installer',
    name: 'Native 1-Click Silent Privileged Installer Engine',
    layer: 'SECURITY_INSTALLER',
    shortDescription: 'Motor de instalación silenciosa desatendida de fábrica mediante Privileged System App, Shizuku IPC, Device Owner y Android 12+ API.',
    detailedArchitecture: `
El motor de instalación silenciosa proporciona una experiencia de 1-Click real sin confirmaciones manuales de usuario ni activaciones de orígenes desconocidos:
1. **Privileged System App (/system/priv-app)**: Aprovecha permisos de firma de plataforma (INSTALL_PACKAGES, DELETE_PACKAGES) otorgados a nivel de ROM AOSP/OEM.
2. **Shizuku / Sui Binder IPC**: Comunicación directa con IPackageInstaller con privilegios ADB/Root sin requerir root persistente.
3. **Device Owner & MDM DPC**: Control total de aprovisionamiento de flotas empresariales y políticas de instalación no atendida.
4. **Android 12+ Unattended Session API**: Uso de PackageInstaller.SessionParams.setRequireUserAction(USER_ACTION_NOT_REQUIRED) para repositorios de confianza.
    `,
    inputOutputFlows: [
      'Entrada: Objeto AppCatalogItem, canal de privilegio seleccionado (PrivApp, Shizuku, Device Owner, Android 12+).',
      'Procesamiento: Dispatcher de streaming de APK, apertura de PackageInstaller.Session y commit desatendido.',
      'Salida: Aplicación instalada en background, actualización del perfil de usuario y notificación tipo Toast.'
    ],
    securityAndPermissions: 'Valida checksums SHA-256 de los paquetes antes del streaming y restringe la instalación desatendida a orígenes criptográficamente verificados.',
    telemetryAndPerformance: 'Tiempo medio de instalación en frío: 1.2 segundos sin interrupciones visuales.',
    futureEnhancements: [
      'Emparejamiento directo por WebUSB/WebADB mediante cable físico desde navegadores basados en Chromium.'
    ],
    keyComponents: ['NativeSilentInstallerModal.tsx', 'Navbar.tsx', 'AppDetailModal.tsx'],
    codeLocation: '/src/components/NativeSilentInstallerModal.tsx'
  },
  {
    id: 'mod-12-innovations-suite-60',
    name: 'Suite de 60 Innovaciones de Clase Mundial (12 Pilares)',
    layer: 'SECURITY_INSTALLER',
    shortDescription: 'Hub interactivo con 60 estándares de élite: Cosign, NixOS hermético, Nostr WoT, P2P IPFS, True OLED, IA Local Wasm, Tor y Forense DEX.',
    detailedArchitecture: `
Estructura modular en 12 pilares especializados con 5 módulos de alta ingeniería cada uno (total 60):
- **Pilar I (Criptografía)**: Atestación Cosign/Rekor, SBOM CycloneDX, Sinkhole DNS, Keystore Vault v1-v4 y Sandboxing multi-usuario.
- **Pilar II (Redes P2P)**: IPFS Swarm, Wi-Fi Direct Nearby Share, Rotación de 14 espejos, BitTorrent y Sync local.
- **Pilar III (UI & OLED)**: True OLED Black #000000 0-nits, tipografía fluida clamp(), 144Hz zero-jank y Bento adaptativo.
- **Pilar IV (CI/CD & Smali)**: Compilación hermética NixOS Flakes, inyección de parches Smali Revanced, decompiler Wasm y delta diffs.
- **Pilar V (Rollback & SAF)**: Actualizaciones delta Bsdiff (-85% datos), Rollback A/B y Scoped Storage SAF.
- **Pilar VI (Gobernanza)**: Reseñas descentralizadas Nostr NIP-01/05, micro-propinas WebLN Lightning, Bounties y Bus Factor.
- **Pilar VII (IA On-Device)**: Resumidor neuronal Wasm con Llama.cpp en cliente, anti-phishing, AST analyzer de permisos y detector de memory leaks.
- **Pilar VIII (Tor & Privacidad)**: Tor SOCKS5 proxy, espejos ocultos .onion y .i2p, DoH rotatorio y fingerprint randomizer.
- **Pilar IX (Forense DEX)**: Visualizador de grafo de flujo (CFG), detector R8, escáner de criptografía y decodificador AXML.
- **Pilar X (MicroG & Virtualización)**: Inyector de MicroG GmsCore proxy, wakelock jail y permisos efímeros de 1 uso.
- **Pilar XI (Web3 & Permaweb)**: Archivo perpetuo en Arweave (+200 años), dominios ENS .eth y Handshake .hns, y prueba on-chain.
- **Pilar XII (Hardware & Batería)**: Medidor de miliamperios-hora (mAh), sensor térmico SoC, compatibilidad con plegables y modo 2G/3G.
    `,
    inputOutputFlows: [
      'Entrada: Selección de pilar, app de contexto y ejecución de simulaciones o herramientas interactivas.',
      'Procesamiento: Ejecución en tiempo real con terminal criptográfica de pasos secuenciales.',
      'Salida: Certificación, logs forenses, parches aplicados, firmas Nostr y temas activados en vivo.'
    ],
    securityAndPermissions: 'Cada módulo opera de forma no destructiva con validaciones estandarizadas.',
    telemetryAndPerformance: 'Cero impacto en rendimiento base con carga bajo demanda.',
    futureEnhancements: [
      'Integración con hardware wallets USB (Ledger / Trezor) para firma de releases.'
    ],
    keyComponents: ['WorldClassInnovationsHubModal.tsx', 'CommandPalette.tsx', 'Navbar.tsx'],
    codeLocation: '/src/components/WorldClassInnovationsHubModal.tsx'
  }
];

export const MODULE_DOCS = MODULE_DOCUMENTATIONS;


