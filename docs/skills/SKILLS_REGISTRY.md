# Catálogo Maestro de 113 Habilidades de Agente (Agent Skills Registry)
## Ecosistema Civer FOSS Store Matrix

Este documento contiene la especificación formal y ejecutable de las **113 Habilidades de Agente (*Agent Skills*)** diseñadas para operar de forma autónoma o supervisada dentro del repositorio **Civer App Store**. Cada habilidad define su disparador (*trigger*), parámetros de entrada, pasos de ejecución algorítmica y criterios de verificación.

---

## Índice General de Categorías

- [Categoría A: Seguridad Criptográfica y Auditoría (Skills 01-10)](#categoría-a-seguridad-criptográfica-y-auditoría)
- [Categoría B: Toolchain Android y Compilación CI/CD (Skills 11-20)](#categoría-b-toolchain-android-y-compilación-cicd)
- [Categoría C: Gestión de Flota y Despliegue Remoto (Skills 21-28)](#categoría-c-gestión-de-flota-y-despliegue-remoto)
- [Categoría D: Curaduría de Catálogo y Heurística FOSS (Skills 29-36)](#categoría-d-curaduría-de-catálogo-y-heurística-foss)
- [Categoría E: Developer Workspace e Integraciones (Skills 37-43)](#categoría-e-developer-workspace-e-integraciones)
- [Categoría F: Experiencia de Usuario, Ergonomía y Accesibilidad (Skills 44-50)](#categoría-f-experiencia-de-usuario-ergonomía-y-accesibilidad)
- [Categoría G: Infraestructura Empresarial y Pagos Soberanos (Skills 51-58)](#categoría-g-infraestructura-empresarial-y-pagos-soberanos)
- [Categoría H: Testing Forense y Certificación Anti-Falsos Positivos (Skills 59-69)](#categoría-h-testing-forense-y-certificación-anti-falsos-positivos)
- [Categoría I: Toolchain de Despliegue en Hardware Android y Shizuku (Skills 70-80)](#categoría-i-toolchain-de-despliegue-en-hardware-android-y-shizuku)
- [Categoría J: Arquitectura Hidrológica Avanzada y PHP 8.2 (Skills 81-91)](#categoría-j-arquitectura-hidrológica-avanzada-y-php-82)
- [Categoría K: Automatización de Resiliencia, Failover de Red y Anti-502 (Skills 92-102)](#categoría-k-automatización-de-resiliencia-failover-de-red-y-anti-502)
- [Categoría L: Economía Descentralizada, Pagos y Gobernanza FOSS (Skills 103-113)](#categoría-l-economía-descentralizada-pagos-y-gobernanza-foss)

---

## Categoría A: Seguridad Criptográfica y Auditoría

### 01. `SKILL-SEC-01: ExodusTrackerAudit`
- **Propósito**: Analizar los archivos APK descomprimidos y sus clases `.dex` para detectar firmas de rastreadores comerciales y SDKs de analítica privativa reportados por Exodus Privacy.
- **Disparador**: Al evaluar cualquier nueva aplicación candidata para ingresar al catálogo o al actualizar una versión existente.
- **Entrada**: Archivo `.apk` o árbol de dependencias Gradle (`build.gradle.kts`).
- **Ejecución**:
  1. Extraer el archivo `classes.dex` e inspeccionar los paquetes bajo `com.google.android.gms.ads`, `com.facebook.ads`, `com.appsflyer`, etc.
  2. Comparar los identificadores encontrados con la base de datos de firmas de Exodus Privacy.
  3. Si se detecta algún rastreador, clasificar el paquete como `TRACKERS_DETECTED` y marcar el flag de advertencia.
- **Salida**: Reporte JSON con recuento exacto de rastreadores y lista de clases sospechosas.
- **Criterio de Aceptación**: Aplicaciones certificadas para Civer Store deben registrar exactamente 0 rastreadores.

### 02. `SKILL-SEC-02: ApkSignatureVerifier`
- **Propósito**: Verificar la validez de la firma digital de los paquetes APK asegurando el cumplimiento de Android APK Signature Scheme v2 y v3.
- **Disparador**: Ingesta de artefactos binarios previos a su distribución.
- **Entrada**: Ruta del archivo binario `.apk`.
- **Ejecución**:
  1. Ejecutar `apksigner verify --verbose --print-certs <apk-file>`.
  2. Verificar que la firma Scheme v2 o Scheme v3 sea válida.
  3. Rechazar cualquier APK firmado exclusivamente con Scheme v1 (JAR signing legacy).
  4. Extraer la huella digital SHA-256 del certificado del desarrollador.
- **Salida**: Objeto con `isSignatureValid: boolean`, `signatureScheme: string` y `certificateSha256: string`.

### 03. `SKILL-SEC-03: Sha256ChecksumEnforcer`
- **Propósito**: Validar la integridad bit a bit de los instaladores descargados antes de su ejecución o almacenamiento en caché.
- **Disparador**: Descarga de APKs en cliente local o tareas de instalación remota.
- **Entrada**: Buffer binario del APK y hash SHA-256 esperado registrado en el catálogo.
- **Ejecución**:
  1. Calcular el hash criptográfico SHA-256 mediante `crypto.subtle.digest('SHA-256', buffer)`.
  2. Convertir el digest a cadena hexadecimal en minúsculas.
  3. Comparar con el valor esperado. Si hay discrepancia, abortar la instalación y registrar incidente en IndexedDB.
- **Salida**: Booleano de coincidencia estricta y evento de auditoría.

### 04. `SKILL-SEC-04: AndroidPermissionMinimizer`
- **Propósito**: Auditar el archivo `AndroidManifest.xml` para detectar permisos excesivos o potencialmente peligrosos.
- **Disparador**: Generación de releases y escaneo de repositorios.
- **Entrada**: Contenido del archivo `AndroidManifest.xml`.
- **Ejecución**:
  1. Analizar todas las etiquetas `<uses-permission>`.
  2. Clasificar los permisos en: `NORMAL`, `DANGEROUS` y `SPECIAL` (como `SYSTEM_ALERT_WINDOW`, `REQUEST_INSTALL_PACKAGES`).
  3. Comprobar si existen alternativas con intents del sistema que eviten permisos directos.
- **Salida**: Lista de advertencias con recomendaciones de reducción de permisos.

### 05. `SKILL-SEC-05: ShizukuIpcValidator`
- **Propósito**: Validar la seguridad de la comunicación IPC con el servicio Shizuku para evitar vulnerabilidades de escalada de privilegios.
- **Disparador**: Inicialización del enlace AIDL en el contenedor Android.
- **Entrada**: Contexto de ejecución y Binder token de Shizuku.
- **Ejecución**:
  1. Confirmar que el UID del proceso remoto de Shizuku coincida con los rangos autorizados (UID 0 root o UID 2000 adb).
  2. Verificar que el token de transacción no haya expirado.
  3. Encapsular las llamadas en bloques `try-catch` con degradación a intents estándar.
- **Salida**: Estado de conexión validado y seguro.

### 06. `SKILL-SEC-06: DigitalAssetLinksAuditor`
- **Propósito**: Validar la correcta configuración del archivo `.well-known/assetlinks.json` para la vinculación TWA.
- **Disparador**: Despliegue de nuevas versiones del cliente web o cambio de certificados Android.
- **Entrada**: Dominio HTTPS de la aplicación y huella SHA-256 del certificado del APK.
- **Ejecución**:
  1. Realizar una petición HTTP GET a `/.well-known/assetlinks.json`.
  2. Comprobar que contenga `relation: ["delegate_permission/common.handle_all_urls"]`.
  3. Confirmar que la huella SHA-256 coincida con el Keystore oficial de release.
- **Salida**: Diagnóstico de validación TWA para evitar barra de URL visible en la app nativa.

### 07. `SKILL-SEC-07: CspHeaderHardening`
- **Propósito**: Auditar y fortalecer las políticas de seguridad de contenido (CSP) en las cabeceras HTTP y etiquetas meta.
- **Disparador**: Modificación de `index.html` o configuración de servidor web.
- **Entrada**: Cabeceras actuales de CSP.
- **Ejecución**:
  1. Asegurar la ausencia de `unsafe-eval` y limitar `script-src` a orígenes estrictamente confiables.
  2. Bloquear cualquier conexión hacia dominios telemáticos o de publicidad.
  3. Configurar `frame-ancestors 'none'` para prevenir ataques de clickjacking en iframes no autorizados.
- **Salida**: Directiva CSP endurecida lista para producción.

### 08. `SKILL-SEC-08: IndexedDbEncryptionWrapper`
- **Propósito**: Cifrar en reposo los datos sensibles almacenados en IndexedDB mediante claves simétricas locales.
- **Disparador**: Escritura de perfiles de usuario o tokens de sesión en la base de datos local.
- **Entrada**: Objeto de datos y clave de cifrado local derivada de Web Crypto API.
- **Ejecución**:
  1. Generar vector de inicialización (IV) criptográfico de 96 bits.
  2. Cifrar la carga útil mediante AES-GCM 256 bits.
  3. Almacenar el par `iv + ciphertext` en IndexedDB.
- **Salida**: Registro cifrado a salvo de inspecciones en texto plano en el navegador.

### 09. `SKILL-SEC-09: DependencyVulnerabilityScanner`
- **Propósito**: Escanear los archivos `package.json`, `package-lock.json` y `build.gradle.kts` para detectar vulnerabilidades conocidas (CVEs).
- **Disparador**: Antes de ejecutar compilaciones de producción o revisiones periódicas.
- **Entrada**: Manifiestos de dependencias del proyecto.
- **Ejecución**:
  1. Comparar versiones de librerías contra las bases de datos de seguridad de NPM y Gradle.
  2. Generar matriz de criticidad: `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.
  3. Proponer actualizaciones de parches semver (`^` y `~`).
- **Salida**: Tabla de vulnerabilidades y comandos automáticos de remediación.

### 10. `SKILL-SEC-10: SslCertificatePinningGenerator`
- **Propósito**: Generar y auditar la configuración de `network_security_config.xml` para Android con pines SPKI.
- **Disparador**: Preparación de builds de release de la app nativa.
- **Entrada**: Dominios oficiales del backend de la tienda y certificados públicos.
- **Ejecución**:
  1. Extraer los digests SHA-256 de las claves públicas (SPKI) de los servidores oficiales.
  2. Generar la configuración XML con pines primarios y de respaldo (*backup pins*).
  3. Deshabilitar explícitamente `cleartextTrafficPermitted="false"`.
- **Salida**: Archivo `network_security_config.xml` endurecido.

---

## Categoría B: Toolchain Android y Compilación CI/CD

### 11. `SKILL-BLD-01: GradleKotlinDslMigration`
- **Propósito**: Convertir scripts de compilación Groovy (`build.gradle`) al formato moderno Kotlin DSL (`build.gradle.kts`).
- **Disparador**: Detección de proyectos Android FOSS legacy en el evaluador de salud.
- **Entrada**: Contenido del archivo `build.gradle` Groovy.
- **Ejecución**:
  1. Reemplazar sintaxis de cadenas con comillas simples por comillas dobles.
  2. Convertir asignaciones de plugins al bloque estandarizado `plugins { ... }`.
  3. Transformar configuraciones de dependencias `implementation '...'` a `implementation("...")`.
- **Salida**: Archivo `build.gradle.kts` sintácticamente válido y tipado.

### 12. `SKILL-BLD-02: GitHubActionsWorkflowSynthesizer`
- **Propósito**: Sintetizar flujos de trabajo de GitHub Actions reproducibles para compilar APKs de Android.
- **Disparador**: Solicitud de configuración de pipeline CI/CD en un repositorio.
- **Entrada**: Versión de Java requerida y tarea de Gradle objetivo (`assembleRelease`).
- **Ejecución**:
  1. Crear archivo `.github/workflows/android-build.yml`.
  2. Configurar runner `ubuntu-latest`, setup de JDK 17 y caché de dependencias Gradle.
  3. Inyectar paso de firma con `rclone` o secrets cifrados y subida de artefactos APK.
- **Salida**: Manifiesto YAML de GitHub Actions optimizado.

### 13. `SKILL-BLD-03: ProGuardR8RulesOptimizer`
- **Propósito**: Analizar y optimizar las reglas de reducción de código y ofuscación en `proguard-rules.pro`.
- **Disparador**: Reducción del tamaño del binario APK previo a la distribución.
- **Entrada**: Archivo `proguard-rules.pro` y clases de modelos de datos JSON.
- **Ejecución**:
  1. Identificar entidades serializadas y preservar sus campos (`-keepclassmembers class * { @com.google.gson.annotations.SerializedName <fields>; }`).
  2. Mantener las interfaces AIDL y clases de Shizuku necesarias para IPC.
  3. Activar optimizaciones avanzadas de R8 eliminando código muerto.
- **Salida**: Archivo de reglas ProGuard calibrado que no rompe en tiempo de ejecución.

### 14. `SKILL-BLD-04: AndroidManifestHarmonizer`
- **Propósito**: Armonizar y modernizar las directivas del archivo `AndroidManifest.xml`.
- **Disparador**: Actualización del proyecto a nuevas versiones de Android.
- **Entrada**: `AndroidManifest.xml` del proyecto.
- **Ejecución**:
  1. Asegurar que `targetSdkVersion` esté configurado en 35 (Android 15) y `minSdkVersion` en al menos 24.
  2. Añadir `android:exported="true"` o `"false"` explícito en todas las actividades y receptores de broadcast.
  3. Configurar atributos de iconos adaptativos (`android:icon` y `android:roundIcon`).
- **Salida**: Manifiesto normalizado libre de advertencias del linter de Android.

### 15. `SKILL-BLD-05: NdkAbiSplitPackager`
- **Propósito**: Configurar la generación de APKs divididos por arquitectura (*ABI splits*) para reducir drásticamente el tamaño de descarga.
- **Disparador**: Compilaciones de producción con librerías nativas C/C++.
- **Entrada**: Configuración de `build.gradle.kts`.
- **Ejecución**:
  1. Añadir el bloque `splits.abi` habilitando `arm64-v8a`, `armeabi-v7a` y `x86_64`.
  2. Asignar códigos de versión incrementales por arquitectura para resolución en la tienda.
- **Salida**: Bloque Gradle configurado que genera APKs ligeros de 10-20 MB en lugar de binarios universales de 60 MB.

### 16. `SKILL-BLD-06: ReproducibleBuildEvaluator`
- **Propósito**: Verificar si dos artefactos binarios compilados en entornos independientes producen exactamente el mismo hash SHA-256.
- **Disparador**: Auditoría de reproducibilidad de compilaciones FOSS.
- **Entrada**: Dos archivos APK generados a partir del mismo commit de Git.
- **Ejecución**:
  1. Desempaquetar ambos binarios y comparar metadatos ZIP (fechas de modificación normalizadas).
  2. Utilizar `diffoscope` para inspeccionar diferencias byte a byte en archivos compilados.
- **Salida**: Reporte de reproducibilidad con porcentaje de identidad binaria.

### 17. `SKILL-BLD-07: ShizukuAidlBindingGenerator`
- **Propósito**: Generar las interfaces de compilación AIDL necesarias para interactuar con el demonio Shizuku en proyectos Android.
- **Disparador**: Configuración inicial de soporte Shizuku en la aplicación nativa.
- **Entrada**: Directorio `src/main/aidl/moe/shizuku/server`.
- **Ejecución**:
  1. Escribir los archivos `IShizukuService.aidl` y `IShizukuApplication.aidl`.
  2. Configurar la compilación AIDL en Gradle con `buildFeatures { aidl = true }`.
- **Salida**: Stubs y proxies de Binder generados correctamente.

### 18. `SKILL-BLD-08: ServiceWorkerAtomicCacheBuster`
- **Propósito**: Gestionar las versiones de caché en `sw.js` para asegurar que las actualizaciones web se propaguen sin conflictos al WebAPK instalado.
- **Disparador**: Despliegue de nueva versión web o compilación con Vite.
- **Entrada**: Hash de versión generado por Vite y archivo `sw.js`.
- **Ejecución**:
  1. Inyectar nuevo identificador `CACHE_NAME = 'civer-store-v' + buildTimestamp`.
  2. Configurar el evento `activate` para eliminar todas las cachés anteriores que no coincidan con la versión activa.
  3. Ejecutar `self.clients.claim()` para tomar el control inmediato de las páginas abiertas.
- **Salida**: Service Worker con invalidación de caché atómica.

### 19. `SKILL-BLD-09: AndroidKeystoreGenerator`
- **Propósito**: Generar comandos seguros para la creación de almacenes de claves (*Keystores*) RSA 4096 bits para la firma de releases.
- **Disparador**: Publicación inicial de la aplicación Android en canales de distribución.
- **Entrada**: Alias de clave, nombre de la organización y contraseña cifrada.
- **Ejecución**:
  1. Generar comando `keytool -genkey -v -keystore civer-release.jks -keyalg RSA -keysize 4096 -validity 10000 -alias ...`.
  2. Documentar las variables de entorno necesarias para su uso seguro en CI (`KEYSTORE_BASE64`, `KEY_ALIAS`).
- **Salida**: Script de generación y plantilla de configuración de firma en Gradle.

### 20. `SKILL-BLD-10: MultiDexConfigurationAuditor`
- **Propósito**: Diagnosticar y resolver el límite de 65.536 referencias a métodos en aplicaciones Android legacy (API < 21).
- **Disparador**: Error de compilación `DexArchiveMergerException: Cannot fit requested classes in a single dex file`.
- **Entrada**: Logs de compilación de Gradle.
- **Ejecución**:
  1. Añadir `multiDexEnabled = true` en el bloque `defaultConfig`.
  2. Inyectar la dependencia `androidx.multidex:multidex:2.0.1` si `minSdk < 21`.
- **Salida**: Configuración de Gradle reparada y compatible.

---

## Categoría C: Gestión de Flota y Despliegue Remoto

### 21. `SKILL-FLT-01: CrossDevicePushDispatcher`
- **Propósito**: Despachar órdenes de instalación a distancia desde el navegador web hacia dispositivos Android emparejados.
- **Disparador**: Clic del usuario en "Instalar en [Dispositivo]" en la vista de flota.
- **Entrada**: `targetDeviceId`, `appId`, `downloadUrl` y `expectedSha256`.
- **Ejecución**:
  1. Verificar que el dispositivo destino figure como `isOnline: true` en el servicio de flota.
  2. Empaquetar la carga útil con token criptográfico de un solo uso (nonce).
  3. Enviar el mensaje a través del canal WebSocket seguro o cola de notificaciones push silenciosas.
- **Salida**: `transactionId` único para monitorear el progreso del despliegue en tiempo real.

### 22. `SKILL-FLT-02: DevicePairingQrGenerator`
- **Propósito**: Generar un código QR de emparejamiento seguro con clave efímera para vincular nuevos teléfonos a la cuenta Civer.
- **Disparador**: Apertura del diálogo "Vincular nuevo dispositivo".
- **Entrada**: `userId` y clave pública de sesión.
- **Ejecución**:
  1. Generar token firmado con expiración de 5 minutos.
  2. Construir la URI de emparejamiento: `civer://pair?token=...&relay=...`.
  3. Renderizar la matriz QR en canvas de alta resolución con contraste accesible.
- **Salida**: Código QR interactivo y temporizador de expiración visual.

### 23. `SKILL-FLT-03: WebApkPackageAssembler`
- **Propósito**: Generar los metadatos necesarios para el empaquetado y registro del WebAPK en el dispositivo Android.
- **Disparador**: Instalación de la aplicación web a través del navegador móvil.
- **Entrada**: Archivo `manifest.json`, iconos WebP y `theme_color`.
- **Ejecución**:
  1. Validar que el manifest contenga `display: "standalone"`, `start_url` y scope adecuado.
  2. Asegurar la presencia de iconos maskable de al menos 192x192 y 512x512 píxeles.
- **Salida**: Manifest validado y compatible con el generador WebAPK nativo de Android.

### 24. `SKILL-FLT-04: SilentPackageInstallExecutor`
- **Propósito**: Orquestar la instalación silenciosa a través de Shizuku sin intervención manual en el teléfono.
- **Disparador**: Recepción de un comando de instalación remota en el dispositivo Android.
- **Entrada**: Archivo temporal descargado en `/data/local/tmp/` y validado por SHA-256.
- **Ejecución**:
  1. Abrir sesión con `moe.shizuku.api.Shizuku.getPackageInstaller()`.
  2. Transmitir el flujo de bytes del paquete al socket de instalación.
  3. Comprometer la sesión y capturar el código de retorno (`STATUS_SUCCESS`).
- **Salida**: Notificación de éxito despachada de regreso a la interfaz web.

### 25. `SKILL-FLT-05: FleetHeartbeatMonitor`
- **Propósito**: Mantener actualizada la telemetría del estado de los dispositivos de la flota (batería, versión de Android, conexión de red).
- **Disparador**: Ping periódico del demonio cliente cada 60 segundos.
- **Entrada**: Datos de telemetría emitidos por el dispositivo.
- **Ejecución**:
  1. Actualizar el registro en `localStorage('civer_connected_devices_v1')`.
  2. Si el dispositivo no emite pulso en más de 3 minutos, marcarlo como `isOnline: false`.
- **Salida**: Lista de dispositivos actualizada con indicadores de estado en tiempo real.

### 26. `SKILL-FLT-06: RollbackCrashGuard`
- **Propósito**: Detectar si una aplicación recién instalada sufre cierres inesperados continuos (*crash loop*) y revertir a la versión anterior.
- **Disparador**: Detección de 3 excepciones no controladas consecutivas en los primeros 30 segundos de ejecución.
- **Entrada**: Registro de incidentes forenses del paquete.
- **Ejecución**:
  1. Identificar la versión previa almacenada en la caché local.
  2. Disparar reinstalación silenciosa del APK de respaldo.
  3. Notificar al usuario sobre la reversión de seguridad.
- **Salida**: Estado de estabilidad restaurado y registro de incidente guardado en IndexedDB.

### 27. `SKILL-FLT-07: PeerToPeerApkSync`
- **Propósito**: Transferir binarios APK directamente entre dispositivos de la misma red local (Wi-Fi Direct o WebRTC) sin consumir ancho de banda de Internet.
- **Disparador**: Dos dispositivos de la flota solicitan el mismo paquete dentro de la misma subred.
- **Entrada**: Dirección IP local y hash del paquete solicitado.
- **Ejecución**:
  1. Negociar canal de datos WebRTC local utilizando mDNS para descubrimiento.
  2. Transmitir el archivo binario por chunks cifrados.
  3. Validar el digest SHA-256 en el receptor.
- **Salida**: Transferencia completada a velocidad de red local gigabit.

### 28. `SKILL-FLT-08: OtaSyncVersionChecker`
- **Propósito**: Comparar el hash del commit activo en el servidor web contra el bundle cargado en el cliente nativo Android.
- **Disparador**: Evento `visibilitychange` al reanudar la app en primer plano.
- **Entrada**: Endpoint `/version.json` del servidor.
- **Ejecución**:
  1. Consultar de forma ligera los metadatos de versión con cabecera `If-None-Match`.
  2. Si existe un nuevo build ID, emitir señal de actualización atómica suave sin interrumpir la tarea activa.
- **Salida**: Notificación de actualización lista en segundo plano.

---

## Categoría D: Curaduría de Catálogo y Heurística FOSS

### 29. `SKILL-CAT-01: RepoHealthScoreCalculator`
- **Propósito**: Calcular de manera objetiva el índice de salud y vitalidad de un repositorio Android (0 a 100%).
- **Disparador**: Análisis de repositorios candidatos o refresco mensual del catálogo.
- **Entrada**: Metadatos de la API de GitHub o árbol de archivos del repositorio.
- **Ejecución**:
  1. Asignar 25 pts si cuenta con Gradle Wrapper moderno (`gradlew`).
  2. Asignar 25 pts si implementa Kotlin DSL (`build.gradle.kts`).
  3. Asignar 20 pts si el último commit ocurrió en los últimos 90 días.
  4. Asignar 15 pts si `targetSdk >= 34`.
  5. Asignar 15 pts por suite de pruebas unitarias (`test` o `androidTest`).
- **Salida**: Puntuación total (0-100%), nivel de riesgo (`LOW`, `MODERATE`, `HIGH`) y desglose de métricas.

### 30. `SKILL-CAT-02: FDroidV2IndexParser`
- **Propósito**: Ingerir y normalizar el archivo de índice JSON v2 oficial de F-Droid (`index-v2.json`).
- **Disparador**: Sincronización periódica con réplicas oficiales de F-Droid.
- **Entrada**: Flujo JSON comprimido del índice de F-Droid.
- **Ejecución**:
  1. Validar la firma digital del índice mediante el certificado oficial del repositorio.
  2. Deserializar la lista de paquetes, extrayendo nombres, versiones, hashes SHA-256 y licencias.
  3. Actualizar la base de datos interna de Civer Store preservando las puntuaciones locales.
- **Salida**: Catálogo sincronizado y actualizado.

### 31. `SKILL-CAT-03: GitHubReleaseScraper`
- **Propósito**: Detectar automáticamente nuevas publicaciones de versiones en repositorios oficiales de GitHub.
- **Disparador**: Tarea programada de sincronización de versiones.
- **Entrada**: URL del repositorio de GitHub (ej. `https://github.com/Droid-ify/client`).
- **Ejecución**:
  1. Consultar el endpoint `/repos/{owner}/{repo}/releases/latest`.
  2. Extraer el tag de versión, notas de lanzamiento (changelog) y URL del APK en los assets.
  3. Comprobar si la versión obtenida es superior a la registrada en el catálogo.
- **Salida**: Notificación de nueva versión lista para auditar y compilar.

### 32. `SKILL-CAT-04: SpdxLicenseValidator`
- **Propósito**: Clasificar y validar que la licencia declarada por una aplicación cumpla con la definición de Software Libre (OSI y FSF).
- **Disparador**: Registro de nuevas herramientas en la tienda.
- **Entrada**: Identificador de licencia SPDX (ej. `GPL-3.0-only`, `Apache-2.0`, `MIT`, `AGPL-3.0`).
- **Ejecución**:
  1. Validar contra el listado oficial de licencias SPDX.
  2. Rechazar licencias privativas, de código compartido con restricciones comerciales o fuentes no reveladas.
  3. Asociar badge visual correspondiente en la tarjeta del catálogo.
- **Salida**: Estado de conformidad FOSS garantizado.

### 33. `SKILL-CAT-05: AntiFeatureDetector`
- **Propósito**: Detectar características anti-usuario (*Anti-Features*) presentes en las aplicaciones (ej. publicidad no libre, rastreo, dependencias privativas).
- **Disparador**: Evaluación de paquetes previa a la publicación.
- **Entrada**: Manifiesto y código fuente de la aplicación.
- **Ejecución**:
  1. Buscar cadenas de texto y dependencias vinculadas a compras integradas privativas (`com.android.vending.billing`).
  2. Verificar si la app requiere servicios de Google Play no declarados.
  3. Mostrar advertencias explícitas en caso de requerir servicios de red no libres.
- **Salida**: Etiquetas de advertencia de Anti-Features en la interfaz de la tienda.

### 34. `SKILL-CAT-06: AppStoreAlternativesComparator`
- **Propósito**: Generar tablas comparativas en tiempo real entre Civer Store, F-Droid, Aurora Store, Obtainium y Google Play.
- **Disparador**: Carga de la vista Matrix Pro y comparadores de producto.
- **Entrada**: Lista de características soportadas (Shizuku, Sin Trackers, OTA 1:1, UI Moderna, Heurística).
- **Ejecución**:
  1. Evaluar el cumplimiento de cada plataforma para cada criterio técnico.
  2. Calcular el score acumulado de soberanía y ergonomía digital.
- **Salida**: Matriz comparativa visual con badges de soporte verificado.

### 35. `SKILL-CAT-07: SemanticSearchIndexer`
- **Propósito**: Crear un índice invertido local en memoria para búsquedas instantáneas y difusas (*fuzzy search*) en el catálogo.
- **Disparador**: Carga inicial del catálogo en el cliente.
- **Entrada**: Arreglo de aplicaciones `AppCatalogItem[]`.
- **Ejecución**:
  1. Tokenizar nombres, tags, categorías y descripciones en minúsculas sin tildes.
  2. Construir mapa invertido de términos a IDs de aplicación.
  3. Proveer método de búsqueda con coincidencia parcial y ordenamiento por relevancia.
- **Salida**: Motor de búsqueda reactivo con tiempos de respuesta < 5 ms.

### 36. `SKILL-CAT-08: ScreenshotOptimizer`
- **Propósito**: Optimizar y convertir capturas de pantalla de aplicaciones a formato WebP ligero para minimizar el consumo de datos.
- **Disparador**: Ingesta de capturas de pantalla promocionales en el catálogo.
- **Entrada**: Archivos PNG/JPEG de alta resolución.
- **Ejecución**:
  1. Escalar imágenes a un ancho estándar de 1080px preservando aspect ratio móvil.
  2. Comprimir a formato WebP con calidad 85%.
  3. Generar placeholders ultraligeros en base64 para carga progresiva (*blur-up*).
- **Salida**: Conjunto de imágenes optimizadas listas para CDN y caché offline.

---

## Categoría E: Developer Workspace e Integraciones

### 37. `SKILL-DEV-01: ObsidianVaultGenerator`
- **Propósito**: Exportar la documentación técnica de cualquier aplicación del catálogo en formato Markdown con metadatos YAML compatible con Obsidian.
- **Disparador**: Clic en "Exportar a Obsidian" en la vista de detalle de la app.
- **Entrada**: Objeto `AppCatalogItem` y reporte de heurística.
- **Ejecución**:
  1. Generar encabezado YAML frontmatter con tags, versión, fecha y enlaces a GitHub.
  2. Redactar secciones estructuradas: Arquitectura, Permisos, Auditoría Exodus y Enlaces de Descarga.
  3. Desencadenar la descarga del archivo `.md` en el navegador.
- **Salida**: Archivo Markdown estructurado listo para incluir en cualquier bóveda de Obsidian.

### 38. `SKILL-DEV-02: JiraIssueDispatcher`
- **Propósito**: Despachar automáticamente un ticket de incidencia en Jira cuando una compilación de CI falla repetidamente.
- **Disparador**: Tarea en la cola de compilación que alcanza el estado `FAILED` tras agotar los reintentos.
- **Entrada**: Objeto `PersistentCiQueueItem` con trazas de error y logs de Gradle.
- **Ejecución**:
  1. Construir payload JSON para la API REST de Jira (`/rest/api/2/issue`).
  2. Asignar prioridad `High`, componentes `CI-Toolchain` y descripción detallada del error.
  3. Registrar el ID del ticket de Jira en el historial de compilaciones local.
- **Salida**: Incidencia creada en Jira y enlace retornado a la interfaz de usuario.

### 39. `SKILL-DEV-03: SlackWebhookNotifier`
- **Propósito**: Enviar tarjetas de notificación enriquecidas a canales de desarrollo en Slack al publicarse una nueva versión o completarse un build exitoso.
- **Disparador**: Evento `BUILD_SUCCESS` o sincronización de nuevo release.
- **Entrada**: URL del Webhook de Slack y datos del artefacto compilado.
- **Ejecución**:
  1. Construir bloques visuales de Slack Block Kit con colores de estado (`#10b981` para éxito).
  2. Incluir enlace directo de descarga del APK, tamaño y hash SHA-256 verificado.
- **Salida**: Notificación visual publicada en el canal del equipo.

### 40. `SKILL-DEV-04: ForensicTelemetryExporter`
- **Propósito**: Exportar un volcado estructurado en JSON de todas las anomalías y excepciones registradas en IndexedDB.
- **Disparador**: Solicitud de soporte o depuración técnica por parte del usuario.
- **Entrada**: Base de datos IndexedDB `civer_fault_telemetry_db`.
- **Ejecución**:
  1. Abrir cursor sobre el almacén de registros y recopilar todas las trazas forenses.
  2. Anonimizar identificadores personales o datos sensibles.
  3. Empaquetar en un archivo `civer-forensic-telemetry-[timestamp].json`.
- **Salida**: Archivo descargable para análisis forense sin fugas de privacidad.

### 41. `SKILL-DEV-05: ChangelogSynthesizer`
- **Propósito**: Redactar notas de versión limpias y legibles a partir del historial de commits semánticos de Git.
- **Disparador**: Preparación de un nuevo release en el catálogo.
- **Entrada**: Lista de commits en formato `feat:`, `fix:`, `refactor:`, `perf:`.
- **Ejecución**:
  1. Agrupar los cambios en categorías claras: ✨ Nuevas Características, 🐛 Correcciones de Errores, ⚡ Mejoras de Rendimiento.
  2. Omitir commits de tareas internas o refactorizaciones menores no relevantes para el usuario final.
- **Salida**: Changelog en Markdown listo para publicar en la tienda y en GitHub.

### 42. `SKILL-DEV-06: McpToolContractValidator`
- **Propósito**: Validar que todas las herramientas expuestas por el servidor MCP en `src/services/mcpToolsService.ts` cumplan con el esquema formal de Model Context Protocol.
- **Disparador**: Modificación o adición de nuevas herramientas para agentes.
- **Entrada**: Array de herramientas exportadas en `MCP_TOOLS_CATALOG`.
- **Ejecución**:
  1. Confirmar que cada herramienta posea `name`, `description` e `inputSchema` válido bajo JSON Schema draft-07.
  2. Validar que la función de ejecución retorne un objeto conforme con `{ content: [{ type: "text", text: string }] }`.
- **Salida**: Certificación de conformidad del servidor MCP.

### 43. `SKILL-DEV-07: ArchitectureBlueprintRenderer`
- **Propósito**: Renderizar dinámicamente diagramas de arquitectura en sintaxis Mermaid dentro de la aplicación.
- **Disparador**: Consulta de la sección "Architecture Blueprint" en el Dev Workspace.
- **Entrada**: Especificación textual del grafo de componentes y flujos de datos.
- **Ejecución**:
  1. Validar la sintaxis del grafo Mermaid (`graph TD` o `sequenceDiagram`).
  2. Inicializar el motor de renderizado SVG con estilos de alto contraste compatibles con modo oscuro.
- **Salida**: Diagrama vectorial interactivo incrustado en el DOM.

---

## Categoría F: Experiencia de Usuario, Ergonomía y Accesibilidad

### 44. `SKILL-UIX-01: AndroidTouchTargetAuditor`
- **Propósito**: Auditar que todos los elementos interactivos (botones, chips, iconos) cumplan con el tamaño mínimo ergonómico de 44x44 píxeles en dispositivos móviles.
- **Disparador**: Renderizado y pruebas de regresión visual en componentes móviles.
- **Entrada**: Nodos del DOM de la vista activa.
- **Ejecución**:
  1. Medir las dimensiones computadas de cada botón y enlace táctil (`getBoundingClientRect()`).
  2. Alertar si algún elemento interactivo posee un área inferior a 44x44px.
  3. Aplicar clases Tailwind de compensación como `p-2.5`, `min-h-[44px]` o `min-w-[44px]`.
- **Salida**: Cumplimiento del 100% de los estándares táctiles de Android y Material Design.

### 45. `SKILL-UIX-02: WcagContrastEnforcer`
- **Propósito**: Validar que la relación de contraste entre el color del texto y su fondo cumpla con el estándar WCAG 2.1 AA (mínimo 4.5:1 para texto normal, 3:1 para texto grande).
- **Disparador**: Modificación de esquemas de colores y temas en Tailwind CSS.
- **Entrada**: Valores hexadecimales de color de primer plano y fondo.
- **Ejecución**:
  1. Calcular la luminancia relativa de ambos colores según la fórmula WCAG.
  2. Obtener el ratio `(L1 + 0.05) / (L2 + 0.05)`.
  3. Si el ratio es inferior a 4.5:1, ajustar la tonalidad (ej. elevar `slate-400` a `slate-200` sobre `slate-950`).
- **Salida**: Garantía matemática de legibilidad universal.

### 46. `SKILL-UIX-03: ResponsiveViewportSimulator`
- **Propósito**: Probar y ajustar dinámicamente la interfaz para resoluciones estándar de smartphones (360x800), tablets (768x1024) y monitores de escritorio (1920x1080).
- **Disparador**: Uso de la barra de herramientas de simulación de viewport responsivo (`ResponsiveViewportToolbar`).
- **Entrada**: Dimensiones de viewport seleccionadas por el desarrollador.
- **Ejecución**:
  1. Ajustar el contenedor marco en modo simulación preservando la escala y proporciones reales.
  2. Validar que no se produzcan desbordamientos horizontales indeseados (*overflow-x*).
- **Salida**: Verificación de fluidez responsiva en todo el rango de dispositivos.

### 47. `SKILL-UIX-04: MotionFrameBudgetAuditor`
- **Propósito**: Supervisar que las transiciones y animaciones ejecutadas con `motion` mantengan una cadencia de 60 fotogramas por segundo sin provocar caídas de frames (*jank*).
- **Disparador**: Apertura de modales, transiciones entre modos de tienda y navegación de tabs.
- **Entrada**: Tiempos de renderizado medidos con `requestAnimationFrame`.
- **Ejecución**:
  1. Medir el tiempo de ejecución por frame (límite: 16.6 ms).
  2. Priorizar transformaciones por GPU (`transform: translate3d`, `opacity`) sobre propiedades que provoquen reflujo del layout (`top`, `height`, `margin`).
- **Salida**: Experiencia de navegación ultrarrápida y suave en dispositivos Android de gama media y alta.

### 48. `SKILL-UIX-05: DarkModeNeutralHarmonizer`
- **Propósito**: Armonizar los colores oscuros de la interfaz para evitar fondos negros puros (#000000) agresivos a la vista, aplicando una base fría con matiz sutil.
- **Disparador**: Definición de paletas de color en componentes y layout principal.
- **Entrada**: Clases de Tailwind de fondo y contenedores.
- **Ejecución**:
  1. Sustituir `bg-black` por `bg-slate-950` (#020617) o `bg-neutral-950` (#0a0a0a).
  2. Establecer elevaciones relativas donde los contenedores superpuestos son progresivamente más claros (`slate-900` para tarjetas, `slate-800` para modales).
- **Salida**: Entorno visual de descanso ocular con acabado profesional de alta gama.

### 49. `SKILL-UIX-06: CommandPaletteActionMapper`
- **Propósito**: Mapear y registrar atajos de teclado globales en la paleta de comandos interactiva (`CommandPalette`).
- **Disparador**: Invocación mediante `Ctrl+K`, `Cmd+K` o tecla `/`.
- **Entrada**: Lista de acciones del sistema (ej. navegación a Android Ecosystem, Matrix Pro, ejecución de auditorías).
- **Ejecución**:
  1. Registrar manejadores de teclado accesibles con soporte para flechas arriba/abajo y `Enter`.
  2. Filtrar comandos dinámicamente según el texto ingresado.
  3. Ejecutar la acción asociada cerrando la paleta con transición limpia.
- **Salida**: Navegación de teclado para usuarios avanzados y desarrolladores.

### 50. `SKILL-UIX-07: OfflineFallbackRenderer`
- **Propósito**: Renderizar de forma limpia estados de interfaz degradados cuando el dispositivo pierde la conexión a Internet o se encuentra en modo avión.
- **Disparador**: Evento `window.addEventListener('offline')`.
- **Entrada**: Estado booleano de conexión provisto por `OfflineIndicator`.
- **Ejecución**:
  1. Deshabilitar suavemente acciones que requieran sincronización en vivo (como descargas remotas directas) y permitir su encolamiento local.
  2. Presentar un banner visual discreto que informe al usuario que está navegando sobre la caché local sin interrupción de lectura.
- **Salida**: Resiliencia total de la aplicación ante fallos de conectividad.

---

## Categoría G: Infraestructura Empresarial y Pagos Soberanos

### 51. `SKILL-ENT-01: LightningBolt11Settler`
- **Propósito**: Liquidar recompensas de testing y regalías en satoshis instantáneamente mediante Lightning Network (BOLT11 / WebLN).
- **Disparador**: Solicitud de cobro desde la billetera de Civer Work Marketplace.
- **Entrada**: Factura BOLT11, LNURL o clave pública de nodo Lightning y monto en USD/Sats.
- **Ejecución**:
  1. Validar el formato de la factura BOLT11 y el monto mínimo en satoshis.
  2. Enrutar el pago a través del nodo soberano de Civer Cloud (`bene.civer.cloud`).
  3. Extraer el preimage criptográfico SHA-256 como prueba irrefutable de liquidación.
- **Salida**: Comprobante de pago con Preimage SHA-256 y descuento del balance en la billetera local.

### 52. `SKILL-ENT-02: SpeiBanxicoDisburser`
- **Propósito**: Despachar transferencias electrónicas instantáneas del Sistema de Pagos Electrónicos Interbancarios (SPEI) hacia cuentas bancarias mexicanas.
- **Disparador**: Elección de retiro en moneda fiduciaria (MXN) en Civer Work.
- **Entrada**: CLABE interbancaria de 18 dígitos, nombre del titular y monto a retirar.
- **Ejecución**:
  1. Validar la estructura algorítmica de la CLABE e identificar la institución financiera (BBVA, Nu, Banorte, STP).
  2. Despachar la instrucción a la pasarela bancaria y generar la clave de rastreo Banxico.
  3. Registrar el folio en el libro mayor inmutable local.
- **Salida**: Comprobante de transferencia bancaria con clave de rastreo y folio de liquidación.

### 53. `SKILL-ENT-03: RemoteSamsungScreenMirror`
- **Propósito**: Capturar y transmitir en tiempo real el framebuffer de pantalla del dispositivo físico Samsung Galaxy A06 (`R8YY500R7ZB`) para pruebas de QA.
- **Disparador**: Clic en "Pantalla en Vivo" en el panel de Mis Dispositivos Conectados.
- **Entrada**: Comando de captura `screencap -p` despachado vía túnel SSH hacia la ThinkPad T480s (`100.96.218.12`).
- **Ejecución**:
  1. Consultar el estado del dispositivo en `system_state.json`.
  2. Ejecutar la captura o transmitir los fotogramas comprimidos hacia el componente `DeviceScreenMirrorModal.tsx`.
  3. Permitir el despacho de eventos táctiles (`input tap x y`) y teclas físicas de Android (`BACK`, `HOME`, `POWER`).
- **Salida**: Visor interactivo en vivo de pantalla de hardware real dentro del navegador web.

### 54. `SKILL-ENT-04: ClusterMailboxPaperclipRouter`
- **Propósito**: Enrutar mensajes asíncronos y sincronizar tareas entre múltiples conversaciones del IDE Antigravity (Master ASUS + ThinkPad + DiscoveryWeb) en modo enjambre continuo estilo Paperclip.
- **Disparador**: Emisión de hitos o solicitud de despacho inter-conversación (`tools/cluster_mailbox_router.cjs`).
- **Entrada**: Conversación emisora (`from`), receptora (`to`), asunto y cuerpo del mensaje.
- **Ejecución**:
  1. Leer y actualizar la cola atómica en `C:\Users\asus\.gemini\antigravity\brain\cluster_mailbox.json`.
  2. Indexar mensajes pendientes y soportar transmisiones de difusión masiva (`broadcast`).
- **Salida**: Sincronización transparente de contexto y directivas entre agentes autónomos sin intervención humana.

### 55. `SKILL-ENT-05: WindowsTaskSchedulerPersister`
- **Propósito**: Instalar y supervisar la tarea programada `CiverInfiniteClusterSync` en el Programador de Tareas de Windows para asegurar ejecución desatendida perpetua.
- **Disparador**: Ejecución de `tools/setup_infinite_service.ps1 -Install`.
- **Entrada**: Ruta del repositorio local y script supervisor `tools/civer_infinite_sync.ps1`.
- **Ejecución**:
  1. Invocar `schtasks.exe /Create` con privilegio elevado (`/RL HIGHEST`) y disparador al iniciar sesión (`/SC ONLOGON`).
  2. Monitorear el estado de ejecución y reanudar el bucle ante caídas o reinicios.
- **Salida**: Servicio persistente y soberano de sincronización infinita de clúster.

### 56. `SKILL-ENT-06: PhpHydrologyLagoonBridge`
- **Propósito**: Coordinar la comunicación bidireccional y fallback determinista entre el clúster TypeScript y la Laguna PHP 8.2 Headless (`php/api/router.php`).
- **Disparador**: Invocación de operaciones de la API REST o comprobación de salud de la cuenca hidrológica.
- **Entrada**: Solicitudes HTTP o comandos CLI hacia los controladores de salud, construcción y comercio.
- **Ejecución**:
  1. Detectar el entorno de ejecución (CLI vs servidor HTTP nativo).
  2. Despachar a los controladores especializados (`HealthController`, `BuilderController`, `CommerceController`, `WordPressBridgeController`).
  3. Emitir respuestas normalizadas JSON con degradación offline elegante en el cliente TypeScript.
- **Salida**: Integración fluida entre PHP 8.2 y el frontend React sin dependencia de servidores pesados.

### 57. `SKILL-ENT-07: HeadlessElementorComposeSynthesizer`
- **Propósito**: Compilar esquemas declarativos JSON en código limpio Tailwind CSS para la web y composables `@Composable` de Jetpack Compose para Android.
- **Disparador**: Generación o edición de vistas en el constructor visual de Civer Store.
- **Entrada**: Estructura en árbol de bloques (`HERO_BANNER`, `APP_SHOWCASE_GRID`, `FEATURE_MATRIX`, `CTA_CONVERSION`).
- **Ejecución**:
  1. Parsear propiedades declarativas y aplicar clases de utilidad Tailwind CSS v4.
  2. Mapear jerarquías equivalentes en Kotlin (`Column`, `Row`, `Card`, `Button`, `Text`).
  3. Emitir el doble flujo de renderizado en un solo payload sincronizado.
- **Salida**: Paridad visual y funcional 1:1 entre la experiencia web y la aplicación nativa Android.

### 58. `SKILL-ENT-08: ZeroFeeCommerceWooCommerceClone`
- **Propósito**: Gestionar catálogo, órdenes y liquidaciones comerciales con 0% de comisiones intermedias usando Lightning Network y SPEI directo.
- **Disparador**: Compra de software, módulos o soporte para desarrolladores en la tienda.
- **Entrada**: Identificador de producto, método de pago (`LIGHTNING` o `SPEI`) y correo del cliente.
- **Ejecución**:
  1. Calcular el ahorro del 30% frente a las tarifas de Google Play Store.
  2. Generar facturas BOLT11 con expiración y CLABEs virtuales de Banxico.
  3. Registrar la orden en el almacenamiento local y notificar al comprador.
- **Salida**: Transacciones comerciales soberanas sin intermediarios bancarios abusivos ni tiendas cerradas.
---

## Categoría H: Testing Forense y Certificación Anti-Falsos Positivos

### 59. `SKILL-TST-01: MultiRoundHttpContractAuditor`
- **Propósito**: Ejecutar auditorías HTTP E2E en múltiples rondas consecutivas calculando huellas SHA-256 de cada respuesta para verificar inmutabilidad y latencia.
- **Disparador**: Certificación de releases o verificación canario previa a despliegues en producción.
- **Entrada**: Lista de URLs objetivo, número de rondas (ej: 5) y umbral de tiempo de respuesta (ms).
- **Ejecución**:
  1. Realizar peticiones HTTP secuenciales midiendo latencia al microsegundo.
  2. Calcular el hash SHA-256 del cuerpo recibido en cada ronda.
  3. Validar consistencia de cabeceras (`Content-Type`, `Content-Length`, `Cache-Control`).
- **Salida**: Matriz comparativa por ronda con códigos de estado, latencias y firmas SHA-256.

### 60. `SKILL-TST-02: MicrosecondLatencyProfiler`
- **Propósito**: Medir percentiles de latencia P50, P90, P99 con precisión de microsegundos (`process.hrtime`) para detectar cuellos de botella en la red de borde.
- **Disparador**: Evaluación de rendimiento de enrutamiento en Edge Cloudflare y túneles locales.
- **Entrada**: Endpoints de destino y tamaño de muestra de ráfaga.
- **Ejecución**:
  1. Registrar marcas de tiempo de alta resolución al iniciar y concluir el socket.
  2. Calcular deltas en microsegundos y convertirlos a percentiles estadísticos.
  3. Alertar si la varianza supera el 30% respecto a la mediana del clúster.
- **Salida**: Reporte estadístico de latencias con percentiles certificados.

### 61. `SKILL-TST-03: DomStructuralAstValidator`
- **Propósito**: Auditar la estructura sintáctica del árbol DOM en caliente previniendo elementos huérfanos, desbordamientos y etiquetas mal cerradas.
- **Disparador**: Compilaciones del frontend Vite y renderizado dinámico de widgets.
- **Entrada**: Cadena HTML o componente React renderizado.
- **Ejecución**:
  1. Parsear el marcado a un árbol abstracto de sintaxis (AST).
  2. Verificar jerarquía de encabezados (`h1` a `h6`) y accesibilidad de elementos interactivos.
  3. Confirmar que no existan nodos vacíos con clases de layout activas.
- **Salida**: Diagnóstico estructural con 0 errores de árbol DOM.

### 62. `SKILL-TST-04: HighDpiVectorFrameRenderer`
- **Propósito**: Generar y validar capturas vectoriales SVG de alta fidelidad (1280x720 y 1920x1080) para documentar el estado visual de cada vista sin requerir un display físico interactivo.
- **Disparador**: Ejecución de suites de prueba visual o auditorías de regresión.
- **Entrada**: Parámetros de la vista (título, insignias, paleta de colores, estado de módulos).
- **Ejecución**:
  1. Sintetizar un lienzo SVG escalable con degradados modernos y sombras de elevación.
  2. Inyectar metadatos forenses (timestamp ISO, hash SHA-256 de la vista, estado de canarios).
  3. Guardar el archivo en `docs/evidencias/screens/` y copiarlo a la bóveda de artefactos.
- **Salida**: Archivo SVG vectorial sellado con su digest SHA-256.

### 63. `SKILL-TST-05: ZeroFalsePositiveCertifier`
- **Propósito**: Descartar falsos positivos correlacionando resultados de al menos 3 fuentes independientes (HTTP local, inspección binaria de archivos y telemetría de SO).
- **Disparador**: Evaluación final de suites de pruebas antes de autorizar commits a `main`.
- **Entrada**: Resultados de pruebas de múltiples módulos.
- **Ejecución**:
  1. Comparar el estado reportado por HTTP con el hash físico del archivo en disco.
  2. Comprobar que no se utilicen datos estáticos simulados (mocks) cuando el servicio esté activo.
  3. Exigir firmas criptográficas y sellos de tiempo válidos para certificar el pase.
- **Salida**: Dictamen forense inmutable de certificación anti-falsos positivos.

### 64. `SKILL-TST-06: ServiceWorkerPrecacheAuditor`
- **Propósito**: Validar bit a bit que los 19 activos precacheados por el Service Worker de la PWA v1.3.0 coincidan con los hashes generados por Vite.
- **Disparador**: Generación de paquetes de producción mediante `npm run build`.
- **Entrada**: Archivos `dist/sw.js` y `dist/workbox-*.js`.
- **Ejecución**:
  1. Extraer la lista de URLs y revisiones declaradas en el manifiesto de precache.
  2. Verificar la presencia física de cada activo en `dist/assets/`.
  3. Confirmar que el registro del Service Worker ocurra sin advertencias de tamaño de chunk.
- **Salida**: Certificado de integridad de caché offline atómica.

### 65. `SKILL-TST-07: PwaAtomicOfflineSimulator`
- **Propósito**: Simular un corte de conectividad instantáneo para verificar la navegación y lectura fluida de la tienda en modo avión.
- **Disparador**: Activación del botón "Modo Offline" en la barra de navegación o desconexión de red.
- **Entrada**: Estado de conexión de `OfflineIndicator`.
- **Ejecución**:
  1. Desviar las peticiones hacia la caché de Service Worker e IndexedDB.
  2. Encolar localmente acciones de descarga e instalación para despacho diferido.
  3. Mostrar banner informativo discreto sin bloquear la interfaz.
- **Salida**: Navegación 100% funcional sin conexión a Internet.

### 66. `SKILL-TST-08: MemoryRssLeakSentinel`
- **Propósito**: Monitorear el consumo de memoria física (RSS) y heap de Node.js y PHP para detectar y prevenir fugas de memoria en ejecuciones continuas.
- **Disparador**: Ejecución de suites de prueba prolongadas o demonios en segundo plano.
- **Entrada**: Identificador de proceso (PID) o llamada a `process.memoryUsage()`.
- **Ejecución**:
  1. Registrar el consumo de memoria al inicio y tras cada ciclo de procesamiento.
  2. Calcular la tasa de crecimiento del heap.
  3. Forzar recolección de basura o reciclado del trabajador si se supera el 80% del límite asignado.
- **Salida**: Bitácora de consumo de memoria y certificación de cero fugas.

### 67. `SKILL-TST-09: JsonSchemaContractEnforcer`
- **Propósito**: Validar estrictamente la estructura y tipos de las respuestas JSON de todos los endpoints REST y RPC contra esquemas normalizados.
- **Disparador**: Recepción de cargas útiles en servicios cliente y controladores backend.
- **Entrada**: Carga útil JSON y definición de esquema (JSON Schema o validador Zod).
- **Ejecución**:
  1. Evaluar propiedades obligatorias y tipos de datos (strings, integers, booleans).
  2. Rechazar campos desconocidos o nulos no permitidos.
  3. Emitir excepciones descriptivas con la ruta exacta del campo con error.
- **Salida**: Objeto tipado seguro garantizado para consumo en frontend.

### 68. `SKILL-TST-10: SyntheticStressLoadTester`
- **Propósito**: Generar ráfagas concurrentes de tráfico local contra los servicios web y la Laguna PHP para determinar el límite de estabilidad.
- **Disparador**: Pruebas de estrés y dimensionamiento de capacidad de clúster.
- **Entrada**: Endpoint objetivo, número de solicitudes concurrentes y duración del ciclo.
- **Ejecución**:
  1. Despachar paquetes HTTP en ráfaga con `keep-alive` activo.
  2. Medir tasa de errores (4xx, 5xx) y tiempo medio de atención.
  3. Detener la prueba y registrar métricas de degradación ante fallos.
- **Salida**: Curva de rendimiento y saturación de peticiones por segundo (RPS).

### 69. `SKILL-TST-11: ForensicEvidenceBundleArchiver`
- **Propósito**: Empaquetar y sellar de forma atómica todas las trazas, capturas de pantalla, reportes JSON y metadatos de una sesión de prueba en un archivo inmutable.
- **Disparador**: Conclusión de una ronda de testing extremo o hito de auditoría.
- **Entrada**: Directorios `docs/evidencias/`, capturas y reportes de canarios.
- **Ejecución**:
  1. Recopilar todos los artefactos generados durante la sesión.
  2. Calcular el hash maestro SHA-256 del lote de evidencias.
  3. Registrar el lote en la bitácora histórica inmutable del enjambre.
- **Salida**: Paquete consolidado de evidencias con firma criptográfica.

---

## Categoría I: Toolchain de Despliegue en Hardware Android y Shizuku

### 70. `SKILL-AND-01: ShizukuPrivilegedInstaller`
- **Propósito**: Instalar aplicaciones APK de forma desatendida y silenciosa utilizando los privilegios de sistema de Shizuku (`moe.shizuku.privileged.api`) sin requerir confirmación interactiva.
- **Disparador**: Solicitud de instalación "1-Click Silencioso" desde el catálogo de la tienda.
- **Entrada**: Ruta del archivo APK descargado y validado criptográficamente.
- **Ejecución**:
  1. Verificar que el servicio Shizuku esté activo y vinculado con permisos de instalación.
  2. Abrir una sesión de `PackageInstaller` privilegiada mediante IPC de Binder.
  3. Escribir los bytes del APK en el stream de la sesión y ejecutar el commit de instalación.
- **Salida**: Confirmación de instalación exitosa con código de estado `STATUS_SUCCESS`.

### 71. `SKILL-AND-02: AdbOverSshThinkpadTunnel`
- **Propósito**: Enrutar comandos ADB hacia hardware físico conectado a un nodo intermedio (Laptop ThinkPad T480s) mediante túneles SSH autenticados con claves Ed25519.
- **Disparador**: Despliegue de binarios o captura de pantalla sobre el Samsung Galaxy A06.
- **Entrada**: Comando ADB a ejecutar, dirección IP Tailscale del host intermedio y serial del dispositivo.
- **Ejecución**:
  1. Construir la instrucción SSH en modo batch sin solicitud interactiva de contraseñas.
  2. Transmitir el comando ADB con timeout defensivo para prevenir congelamiento de terminal.
  3. Capturar la salida estándar y de error del dispositivo remoto.
- **Salida**: Flujo de salida del dispositivo físico procesado y registrado en el máster.

### 72. `SKILL-AND-03: SamsungGalaxyA06FramebufferStreamer`
- **Propósito**: Capturar periódicamente el framebuffer de la pantalla del Samsung Galaxy A06 (`SM-A065M`) usando `screencap -p` y transmitir los fotogramas al visor web interactivo.
- **Disparador**: Apertura del modal "Pantalla en Vivo" en el panel de Mis Dispositivos Conectados.
- **Entrada**: Serial del dispositivo (`R8YY500R7ZB`) e intervalo de refresco deseado.
- **Ejecución**:
  1. Invocar `screencap -p` sobre el dispositivo a través del puente de red.
  2. Recibir los bytes de la imagen PNG y verificar que la cabecera contenga los bytes mágicos `PNG`.
  3. Emitir el fotograma comprimido al componente `DeviceScreenMirrorModal.tsx`.
- **Salida**: Transmisión en tiempo real de la pantalla del teléfono dentro del navegador.

### 73. `SKILL-AND-04: ApkSigningSchemeV4Validator`
- **Propósito**: Validar la existencia y validez del árbol de firmas Android APK Signature Scheme v4 (`.apk.idsig`) para streaming de instalación por ADB.
- **Disparador**: Preparación de APKs de gran tamaño para instalación instantánea incremental.
- **Entrada**: Archivos `.apk` y `.apk.idsig`.
- **Ejecución**:
  1. Verificar el hash raíz del árbol Merkle del APK con `apksigner verify --v4-signature-file`.
  2. Confirmar compatibilidad con el kernel de Linux y el subsistema `incfs` de Android.
  3. Registrar la huella de firma en el manifiesto de la tienda.
- **Salida**: Certificación de instalación rápida sin transferir la totalidad del binario previamente.

### 74. `SKILL-AND-05: AndroidTouchInputInjector`
- **Propósito**: Inyectar eventos táctiles programáticos (`input tap X Y`, `input swipe X1 Y1 X2 Y2`) sobre el dispositivo móvil para pruebas de QA automatizadas.
- **Disparador**: Interacción del usuario sobre el visor de screen mirroring o ejecución de scripts de prueba.
- **Entrada**: Coordenadas normalizadas de pantalla (0-1) y resolución física del dispositivo (720x1600).
- **Ejecución**:
  1. Escalar las coordenadas relativas a la resolución nativa de píxeles del dispositivo.
  2. Despachar el comando `input tap <x> <y>` mediante ADB.
  3. Capturar el fotograma resultante para confirmar la respuesta visual de la interfaz.
- **Salida**: Evento táctil ejecutado con precisión en el dispositivo físico.

### 75. `SKILL-AND-06: HardwareKeyeventDispatcher`
- **Propósito**: Despachar códigos de teclas físicas de Android (`BACK: 4`, `HOME: 3`, `POWER: 26`, `VOLUME_UP: 24`) para navegación remota en pruebas de hardware.
- **Disparador**: Clic en los botones de navegación del modal de screen mirroring.
- **Entrada**: Código entero de la tecla física (`keyCode`).
- **Ejecución**:
  1. Validar que el código pertenezca a la especificación estándar de Android `KeyEvent`.
  2. Despachar `adb shell input keyevent <keyCode>` a través del túnel SSH.
  3. Registrar el evento en el log de telemetría de pruebas.
- **Salida**: Simulación de pulsación de botón físico completada en el dispositivo.

### 76. `SKILL-AND-07: AndroidPackageLifecycleWatchdog`
- **Propósito**: Supervisar el inicio, detención forzada y ciclo de vida de procesos de aplicaciones en Android (`am start -n`, `am force-stop`).
- **Disparador**: Ejecución de suites de prueba de lanzamiento en frío (cold start) y reinicio.
- **Entrada**: Nombre del paquete (`packageName`) y actividad principal (`mainActivity`).
- **Ejecución**:
  1. Detener procesos previos con `am force-stop <packageName>`.
  2. Iniciar la actividad midiendo el tiempo de arranque con `am start -W <package>/<activity>`.
  3. Registrar el tiempo de renderizado de la primera ventana (`TotalTime`).
- **Salida**: Métrica de tiempo de inicio en milisegundos y estado de proceso.

### 77. `SKILL-AND-08: LogcatCrashForensicsCollector`
- **Propósito**: Capturar y filtrar en caliente los logs del búfer de Android (`logcat -d`) buscando excepciones no controladas, ANRs y trazas de pila (stack traces).
- **Disparador**: Detección de caída de aplicación durante una sesión de prueba en dispositivo.
- **Entrada**: Búfer de logcat filtrado por el PID o nombre de paquete de la aplicación evaluada.
- **Ejecución**:
  1. Vaciar el búfer previo y ejecutar la acción bajo prueba.
  2. Extraer las líneas etiquetadas con `FATAL EXCEPTION`, `AndroidRuntime` o `ANR`.
  3. Formatear la traza de pila en Markdown estructurado para reporte en el marketplace.
- **Salida**: Reporte forense de fallo con traza de pila exacta y contexto de memoria.

### 78. `SKILL-AND-09: TwaWebApkManifestHarmonizer`
- **Propósito**: Asegurar paridad 1:1 entre el archivo `manifest.webmanifest` servido por la web y la configuración del contenedor nativo Android WebAPK / TWA.
- **Disparador**: Publicación de nuevas versiones en producción y regeneración de PWA.
- **Entrada**: Manifiesto web en `dist/manifest.webmanifest` y metadatos en `AndroidManifest.xml`.
- **Ejecución**:
  1. Comparar los nombres, colores de tema (`theme_color`), color de fondo e iconos.
  2. Verificar que la URL de inicio (`start_url`) y el alcance (`scope`) apunten al dominio soberano.
  3. Alertar ante cualquier discrepancia visual o de permisos entre web y móvil.
- **Salida**: Certificado de paridad web-app 1:1.

### 79. `SKILL-AND-10: Android15TargetSdkComplianceChecker`
- **Propósito**: Auditar que los APKs compilados cumplan con las directivas de Android 15 (API 35), incluyendo soporte de páginas de memoria de 16KB y diseño Edge-to-Edge obligatorio.
- **Disparador**: Compilaciones CI/CD de nuevas aplicaciones en GitHub Actions.
- **Entrada**: Manifiesto binario del APK e inspección de librerías nativas (`.so`).
- **Ejecución**:
  1. Extraer `targetSdkVersion` asegurando que sea `>= 35`.
  2. Verificar que las librerías compartidas nativas ELF estén alineadas a límites de página de 16KB.
  3. Validar banderas de ventanas sin barras negras (`enableEdgeToEdge`).
- **Salida**: Reporte de cumplimiento de directivas modernas de Android.

### 80. `SKILL-AND-11: DigitalAssetLinksSignatureCertifier`
- **Propósito**: Verificar la relación criptográfica entre el dominio web y la huella SHA-256 del certificado nativo en `/.well-known/assetlinks.json`.
- **Disparador**: Pruebas de verificación de enlaces de aplicación (Android App Links) sin barra de navegación del navegador.
- **Entrada**: Huella SHA-256 de la firma del APK y archivo `assetlinks.json` alojado en el dominio.
- **Ejecución**:
  1. Descargar `https://bene.civer.cloud/.well-known/assetlinks.json`.
  2. Validar que contenga el `package_name` correcto y la huella digital del certificado en mayúsculas.
  3. Confirmar que la relación `delegate_permission/common.handle_all_urls` esté declarada.
- **Salida**: Validación de apertura nativa transparente de URLs sin diálogos de selección.

---

## Categoría J: Arquitectura Hidrológica Avanzada y PHP 8.2

### 81. `SKILL-HYD-01: PhpHydrologyRouterDispatcher`
- **Propósito**: Enrutar solicitudes tanto desde la línea de comandos (CLI) como mediante servidores HTTP embebidos hacia los controladores modulares de la Laguna PHP.
- **Disparador**: Invocación de la API REST bajo `/api/*` o ejecución de tareas administrativas PHP.
- **Entrada**: URI solicitada, método HTTP (`GET`, `POST`, etc.) y carga útil JSON.
- **Ejecución**:
  1. Detectar automáticamente si la invocación proviene de CLI (`argv`) o de servidor HTTP.
  2. Normalizar la ruta eliminando prefijos de subdirectorios y parámetros de consulta.
  3. Despachar la llamada al controlador correspondiente con captura defensiva de errores.
- **Salida**: Respuesta normalizada JSON con cabeceras CORS y códigos de estado HTTP semánticos.

### 82. `SKILL-HYD-02: ElementorTailwindSynthesizer`
- **Propósito**: Traducir especificaciones declarativas de bloques visuales en código HTML semántico estilizado con clases atómicas de Tailwind CSS v4.
- **Disparador**: Renderizado o guardado de páginas en el clon visual de Elementor FOSS.
- **Entrada**: Estructura de árbol de bloques (`HERO_BANNER`, `APP_SHOWCASE_GRID`, `FEATURE_MATRIX`, `CTA_CONVERSION`).
- **Ejecución**:
  1. Iterar sobre cada bloque aplicando patrones de diseño sobrios de alto contraste.
  2. Garantizar que no se generen estilos en línea innecesarios ni dependencias JS bloqueantes.
  3. Ensamblar el contenedor maestro con márgenes y espaciados matemáticos consistentes.
- **Salida**: Fragmento HTML moderno y ligero de alta velocidad de carga.

### 83. `SKILL-HYD-03: JetpackComposeKotlinGenerator`
- **Propósito**: Sintetizar bloques declarativos visuales en código fuente Kotlin con funciones `@Composable` para la aplicación nativa de Android.
- **Disparador**: Sincronización de layouts visuales entre la web y la aplicación móvil.
- **Entrada**: Lista de bloques JSON generada por el constructor visual.
- **Ejecución**:
  1. Mapear cada bloque web a su componente composable nativo equivalente (`Column`, `Row`, `Card`, `Button`, `Text`).
  2. Ajustar los modificadores de espaciado (`padding`, `spacedBy`) con unidades `dp` de Android.
  3. Emitir el código fuente Kotlin formateado listo para integración en el repositorio.
- **Salida**: Función composable Kotlin de paridad visual exacta 1:1.

### 84. `SKILL-HYD-04: ZeroFeeWooCommerceEngine`
- **Propósito**: Administrar el ciclo de vida de productos, cálculo de totales y órdenes comerciales sin retenciones ni comisiones de intermediarios (0%).
- **Disparador**: Selección de productos o suscripciones de desarrollador en la tienda FOSS.
- **Entrada**: Identificador de producto, datos del comprador y método de liquidación.
- **Ejecución**:
  1. Calcular el ahorro exacto del 30% en comparación con la tasa estándar de Google Play Store.
  2. Generar el identificador único de orden con prefijo inmutable (`ORD-XXXXXXXXXX`).
  3. Emitir las instrucciones de pago en satoshis o transferencia bancaria mexicana.
- **Salida**: Orden comercial en estado pendiente con tokens de acceso criptográfico.

### 85. `SKILL-HYD-05: WordPressPluginZipPackager`
- **Propósito**: Empaquetar automáticamente carpetas de plugins de la Laguna WordPress en archivos de distribución `.zip` compatibles con cualquier instalación de WordPress.
- **Disparador**: Actualización o creación de extensiones en `php/wordpress-plugins/`.
- **Entrada**: Directorio fuente del plugin y metadatos de versión.
- **Ejecución**:
  1. Recorrer de forma recursiva los archivos del plugin excluyendo temporales y pruebas.
  2. Comprimir el contenido con compresión DEFLATE nivel 9 dentro de una carpeta raíz con el slug del plugin.
  3. Guardar el archivo en `public/plugins/` y actualizar el catálogo maestro `plugins_manifest.json`.
- **Salida**: Archivo `.zip` descargable listo para instalación en 1 clic.

### 86. `SKILL-HYD-06: PhpExtensionAvailabilitySentinel`
- **Propósito**: Verificar la presencia y versión de extensiones críticas de PHP (`curl`, `openssl`, `pdo`, `mbstring`, `zip`) necesarias para el funcionamiento del clúster.
- **Disparador**: Sondas del centinela canario de salud o arranque de servicios.
- **Entrada**: Ejecución de `extension_loaded()` y consulta de directivas `php.ini`.
- **Ejecución**:
  1. Evaluar el estado booleano de cada extensión requerida.
  2. Medir el límite de memoria asignado (`memory_limit`) y la memoria consumida.
  3. Alertar si falta alguna librería criptográfica o de compresión.
- **Salida**: Diagnóstico de capacidades de runtime de la Laguna PHP.

### 87. `SKILL-HYD-07: WordPressRestApiV1Bridge`
- **Propósito**: Exponer rutas de API REST desacopladas bajo el namespace `/wp-json/civer/v1/` para integración de contenido headless con React y Android.
- **Disparador**: Registro de endpoints en el plugin `civer-cloud-headless-bridge`.
- **Entrada**: Solicitudes de sincronización de catálogo, aplicaciones destacadas o notas de versión.
- **Ejecución**:
  1. Registrar rutas con `register_rest_route()` aplicando verificación de permisos.
  2. Despachar datos en formato JSON optimizado con encabezados de caché HTTP.
  3. Proveer fallback a los archivos JSON del repositorio en caso de desconexión.
- **Salida**: Endpoints REST nativos integrados en el ecosistema WordPress.

### 88. `SKILL-HYD-08: HeadlessWidgetRegistryManager`
- **Propósito**: Mantener el registro y esquemas de propiedades de los widgets disponibles en el clon de Elementor FOSS.
- **Disparador**: Invocación de `/builder/widgets` o adición de nuevos componentes visuales.
- **Entrada**: Definición de widgets con sus propiedades editables (`title`, `subtitle`, `columns`, `action`).
- **Ejecución**:
  1. Validar que cada widget cuente con su plantilla de renderizado HTML y Compose asociada.
  2. Proveer valores por defecto defensivos para prevenir errores en tiempo de ejecución.
  3. Exportar el catálogo a la interfaz gráfica de usuario.
- **Salida**: Array estructurado de widgets con tipos y esquemas de validación.

### 89. `SKILL-HYD-09: SqliteCommerceDatabaseMigrator`
- **Propósito**: Gestionar la creación y migración transaccional de tablas SQLite para el almacenamiento de pedidos, productos y transacciones de Civer Commerce.
- **Disparador**: Arranque del módulo de comercio o actualización de esquema de base de datos.
- **Entrada**: Conexión PDO SQLite y scripts de migración SQL.
- **Ejecución**:
  1. Verificar la existencia del archivo de base de datos `civer_commerce.sqlite`.
  2. Ejecutar sentencias DDL dentro de una transacción segura (`PRAGMA journal_mode = WAL`).
  3. Registrar la versión de migración aplicada en la tabla de control.
- **Salida**: Base de datos SQLite persistente lista para operaciones ACID.

### 90. `SKILL-HYD-10: PhpZtsCliStressExecutor`
- **Propósito**: Ejecutar pruebas de concurrencia y estrés de memoria directamente sobre el motor `PHP 8.2.33 ZTS x64` para certificar estabilidad bajo carga.
- **Disparador**: Pruebas de regresión antes de despliegues a DigitalOcean Always-On.
- **Entrada**: Número de iteraciones en bucle y endpoints a ejercitar.
- **Ejecución**:
  1. Ejecutar llamadas en ráfaga rápida mediante CLI con captura de tiempo al microsegundo.
  2. Medir memoria pico (`memory_get_peak_usage`) certificando que no supere los 4 MB.
  3. Verificar que ninguna llamada arroje advertencias o errores fatales en el búfer.
- **Salida**: Registro forense de estrés con cero caídas y memoria estable.

### 91. `SKILL-HYD-11: HydrologicalEventStreamBroadcaster`
- **Propósito**: Emitir eventos de Server-Sent Events (SSE) desde la Laguna PHP para notificar pagos instantáneos, nuevas compilaciones y cambios de catálogo a clientes conectados.
- **Disparador**: Confirmación de un pago Lightning/SPEI o publicación de una app.
- **Entrada**: Nombre del evento, carga útil JSON e identificador de canal.
- **Ejecución**:
  1. Establecer conexión con cabecera `Content-Type: text/event-stream`.
  2. Transmitir el mensaje en formato estándar SSE (`event: ...`, `data: ...`).
  3. Mantener el canal abierto con pulsos de latido (`ping`) cada 15 segundos.
- **Salida**: Notificación en tiempo real entregada a clientes web y Android sin recarga.

---

## Categoría K: Automatización de Resiliencia, Failover de Red y Anti-502

### 92. `SKILL-RES-01: CloudflareEdgeAnti502Guardian`
- **Propósito**: Monitorear continuamente el estado de respuesta de los túneles Cloudflare (`bene.civer.cloud`) y reiniciar preventivamente el demonio ante errores 502/504.
- **Disparador**: Detección de códigos de estado HTTP 502 Bad Gateway o 504 Gateway Timeout.
- **Entrada**: URL del borde Cloudflare y umbral de fallos consecutivos.
- **Ejecución**:
  1. Sondear el endpoint `/api/health` cada 60 segundos.
  2. Si se detectan 2 fallos consecutivos de borde, invocar el script de reconexión del túnel.
  3. Desviar temporalmente el tráfico al Gateway de respaldo en DigitalOcean.
- **Salida**: Recuperación autónoma de la conectividad de borde con cero intervención humana.

### 93. `SKILL-RES-02: TailscaleMeshDerpOptimizer`
- **Propósito**: Monitorear la latencia de los enlaces punto a punto (P2P) entre nodos Tailscale y optimizar la selección de relés DERP para comunicación sin retardo.
- **Disparador**: Latencia P2P superior a 150 ms o cambio de red física en la laptop ThinkPad.
- **Entrada**: Salida de `tailscale status` y tabla de latencias DERP.
- **Ejecución**:
  1. Inspeccionar si la conexión entre ASUS y ThinkPad es directa (`direct`) o por relé (`derp`).
  2. Ajustar puertos UDP en el firewall de Windows para favorecer el enlace directo.
  3. Forzar renegociación de la sesión WireGuard si el enlace se degrada.
- **Salida**: Malla VPN privada optimizada con latencias sub-50ms en red local.

### 94. `SKILL-RES-03: DigitalOceanFloatingIpPromoter`
- **Propósito**: Reasignar en caliente la dirección IP pública reservada (Floating IP) hacia un Droplet secundario cuando el primario experimente mantenimiento o corte de energía.
- **Disparador**: Caída del Droplet primario en la región de Frankfurt (FRA1).
- **Entrada**: Identificador de Floating IP y token de acceso a la API de DigitalOcean.
- **Ejecución**:
  1. Comprobar que el nodo primario no responda al canario de salud tras 3 intentos.
  2. Despachar petición `POST /v2/floating_ips/{ip}/actions` con acción `assign`.
  3. Verificar que el tráfico se enrute al Droplet de respaldo en menos de 10 segundos.
- **Salida**: Failover de infraestructura en la nube sin pérdida de servicio.

### 95. `SKILL-RES-04: AlwaysOnStandbyHealthProber`
- **Propósito**: Verificar cada minuto que el servicio en espera `cloud_always_on_daemon.ts` en el puerto 3080 se encuentre listo para absorber tráfico.
- **Disparador**: Bucle continuo del supervisor de clúster.
- **Entrada**: Petición HTTP a `http://127.0.0.1:3080/api/health`.
- **Ejecución**:
  1. Realizar una solicitud ligera con timeout estricto de 1.5 segundos.
  2. Comprobar que devuelva estado `HEALTHY` o `STANDBY_READY`.
  3. Si no responde, levantar el proceso en segundo plano con privilegios desacoplados.
- **Salida**: Garantía de respaldo activo inmediato ante caídas del servidor React principal.

### 96. `SKILL-RES-05: NginxReverseProxyCacheGovernor`
- **Propósito**: Configurar reglas de micro-caché HTTP en Nginx para proteger los microservicios backend contra sobrecargas repentinas de tráfico.
- **Disparador**: Despliegue de actualizaciones en el servidor web o aumento abrupto de peticiones.
- **Entrada**: Archivo de configuración `/etc/nginx/sites-available/civer-gateway`.
- **Ejecución**:
  1. Establecer zonas de caché en memoria con `proxy_cache_path`.
  2. Aplicar directivas de microcaching de 5 segundos para peticiones de catálogo e índices.
  3. Configurar `proxy_cache_use_stale error timeout updating` para servir contenido en caché ante caídas.
- **Salida**: Nginx resiliente capaz de soportar picos masivos de usuarios concurrentes.

### 97. `SKILL-RES-06: SshBannerExchangeTimeoutHealer`
- **Propósito**: Resolver de forma preventiva bloqueos por retardo en el intercambio de banner SSH entre máquinas Windows y Linux.
- **Disparador**: Error de conexión `Connection timed out during banner exchange` en túneles SSH.
- **Entrada**: Parámetros de conexión SSH y archivo de configuración `~/.ssh/config`.
- **Ejecución**:
  1. Inyectar banderas de cliente defensivas (`-o ConnectTimeout=3 -o ServerAliveInterval=10`).
  2. Comprobar que no existan sockets huérfanos bloqueando el puerto 22 en el host remoto.
  3. Reintentar la operación con reconexión limpia en caso de fallo transitorio.
- **Salida**: Comunicación SSH fluida y tolerante a fluctuaciones de enlace de red.

### 98. `SKILL-RES-07: WindowsTaskSchedulerXmlDeployer`
- **Propósito**: Generar programáticamente e importar definiciones XML completas de tareas programadas en Windows para ejecución desatendida perpetua.
- **Disparador**: Instalación inicial o reconfiguración del servicio supervisor infinito.
- **Entrada**: Definición de tarea con privilegios `HighestAvailable` y disparador `AtLogon`.
- **Ejecución**:
  1. Sintetizar el archivo XML con las especificaciones de ejecución de PowerShell y reinicio ante fallos.
  2. Ejecutar `schtasks.exe /Create /XML <archivo.xml> /TN CiverInfiniteClusterSync /F`.
  3. Confirmar que la tarea figure en estado `Ready` en la lista del sistema.
- **Salida**: Tarea del sistema operativo desplegada con tolerancia absoluta a reinicios.

### 99. `SKILL-RES-08: ZombieProcessTreeReaperWin`
- **Propósito**: Identificar y terminar de forma jerárquica subprocesos huérfanos o zombis acumulados durante ciclos continuos de ejecución de comandos.
- **Disparador**: Detección de procesos duplicados de `node.exe`, `php.exe` o `adb.exe` sin proceso padre activo.
- **Entrada**: Lista de procesos obtenida mediante WMI (`Get-CimInstance Win32_Process`).
- **Ejecución**:
  1. Mapear el árbol de dependencias de procesos e identificar nodos sin proceso padre válido.
  2. Enviar señal de terminación respetuosa seguida de terminación forzada si no responden en 2 segundos.
  3. Liberar descriptores de archivo y memoria ocupada.
- **Salida**: Árbol de procesos del sistema completamente higienizado.

### 100. `SKILL-RES-09: ZeroDowntimeViteBuildPromoter`
- **Propósito**: Sustituir atómicamente la carpeta `dist/` mediante renombrado instantáneo de directorios para evitar ventanas de error 404 durante compilaciones.
- **Disparador**: Finalización exitosa de `npm run build`.
- **Entrada**: Directorio temporal de compilación `dist_new/` y directorio activo `dist/`.
- **Ejecución**:
  1. Compilar los activos de producción en una carpeta aislada con sufijo temporal.
  2. Validar que la compilación haya concluido con código de salida 0 y presencia de `index.html`.
  3. Realizar el cambio atómico de puntero de directorio en una sola operación de sistema de archivos.
- **Salida**: Actualización instantánea en vivo sin un solo milisegundo de caída para los usuarios.

### 101. `SKILL-RES-10: LocalPortCollisionCleaner`
- **Propósito**: Detectar procesos ajenos o residuales que ocupen los puertos críticos del clúster (:3000, :3080, :8088, :8766) y liberarlos de forma segura.
- **Disparador**: Error de arranque `EADDRINUSE` al iniciar servicios web o servidores embebidos.
- **Entrada**: Número de puerto en conflicto.
- **Ejecución**:
  1. Identificar el PID del proceso causante mediante `Get-NetTCPConnection -LocalPort <puerto>`.
  2. Verificar si se trata de un proceso zombi de una sesión previa de prueba.
  3. Terminar el proceso residual y reintentar el enlace de puerto en menos de 500 ms.
- **Salida**: Puerto de red disponible para el servicio correspondiente.

### 102. `SKILL-RES-11: SystemStateRecoverySentinel`
- **Propósito**: Respaldar y restaurar atómicamente el archivo `system_state.json` ante corrupciones de disco o escrituras concurrentes de múltiples agentes.
- **Disparador**: Detección de JSON malformado o de longitud 0 al leer el estado del clúster.
- **Entrada**: Ruta del archivo `system_state.json` y respaldo transaccional `system_state.json.bak`.
- **Ejecución**:
  1. Validar la integridad sintáctica de `system_state.json` antes de cualquier operación de escritura.
  2. Escribir primero en un archivo temporal y renombrarlo de forma atómica para prevenir lecturas parciales.
  3. Si se detecta corrupción, restaurar inmediatamente el snapshot íntegro más reciente.
- **Salida**: Estado de clúster siempre íntegro y protegido contra inconsistencias.

---

## Categoría L: Economía Descentralizada, Pagos y Gobernanza FOSS

### 103. `SKILL-ECO-01: LightningInvoicePreimageVerifier`
- **Propósito**: Verificar criptográficamente la prueba irrefutable de pago (Preimage SHA-256) emitida por la red Bitcoin Lightning tras liquidar una factura BOLT11.
- **Disparador**: Solicitud de confirmación de cobro o depósito en la billetera de Civer Work.
- **Entrada**: Factura BOLT11 y preimagen hexadecimal de 32 bytes entregada por el nodo pagador.
- **Ejecución**:
  1. Calcular el hash SHA-256 de la preimagen recibida.
  2. Comparar el digest resultante con el `payment_hash` contenido en la factura original.
  3. Si coinciden con exactitud, marcar la orden como pagada y desbloquear los fondos o la descarga.
- **Salida**: Certificación matemática de pago instantáneo completado.

### 104. `SKILL-ECO-02: BanxicoSpeiTrackingFolioCertifier`
- **Propósito**: Validar la estructura y autenticidad de claves de rastreo y comprobantes electrónicos de pago (CEP) emitidos por Banco de México para transferencias SPEI.
- **Disparador**: Registro de un retiro en pesos mexicanos (MXN) en el libro mayor de Civer Work.
- **Entrada**: Clave de rastreo alfanumérica de 30 caracteres, CLABE receptora y monto transferido.
- **Ejecución**:
  1. Validar el formato algorítmico de la clave de rastreo de acuerdo con las especificaciones de Banxico.
  2. Generar el registro inmutable de liquidación con fecha y hora oficial del Banco Central.
  3. Adjuntar el folio de confirmación en el historial transaccional del usuario.
- **Salida**: Comprobante de transferencia bancaria oficial con folio de rastreo.

### 105. `SKILL-ECO-03: CiverWorkBountyCalculator`
- **Propósito**: Calcular dinámicamente la recompensa monetaria asignada a una tarea de testing remunerado en función de la severidad del bug y la cobertura de pruebas.
- **Disparador**: Cierre y aprobación de una tarea de control de calidad en el marketplace.
- **Entrada**: Severidad reportada (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), evidencias de pantalla adjuntas y logs.
- **Ejecución**:
  1. Aplicar la tabla algorítmica de recompensas (ej: $50 USD por fallo crítico de seguridad, $15 por bug de UI).
  2. Bonificar un 20% adicional si el reporte incluye traza de logcat y captura en hardware real.
  3. Acreditar el saldo inmediatamente en el balance disponible del usuario.
- **Salida**: Saldo remunerado actualizado y notificación emitida al tester.

### 106. `SKILL-ECO-04: DigitalContractSignatureSealer`
- **Propósito**: Sellar acuerdos de colaboración, términos de confidencialidad y contratos de software libre mediante firmas criptográficas asimétricas Ed25519 o WebAuthn.
- **Disparador**: Aceptación de términos y condiciones o incorporación de un nuevo desarrollador.
- **Entrada**: Documento contractual en Markdown, clave pública del firmante y sello de tiempo.
- **Ejecución**:
  1. Calcular el hash SHA-256 del contenido canónico del contrato.
  2. Firmar el digest con la clave privada del firmante o dispositivo HSM.
  3. Adjuntar el bloque de firma digital al pie del documento legal.
- **Salida**: Contrato digital jurídicamente vinculante y verificable de forma pública.

### 107. `SKILL-ECO-05: SharkTankDealRoomEscrow`
- **Propósito**: Custodiar temporalmente fondos de inversión en contratos de custodia (escrow) multifirma hasta el cumplimiento de hitos de desarrollo acordados.
- **Disparador**: Formalización de una ronda de inversión o micro-patrocinio en el Shark Tank de Civer Work.
- **Entrada**: Monto a custodiar, hitos de entrega y claves públicas de inversionista, creador y mediador.
- **Ejecución**:
  1. Bloquear los fondos en una dirección multifirma 2-de-3 o contrato de depósito condicional.
  2. Monitorear la validación de hitos mediante auditorías de código automatizadas.
  3. Liberar los desembolsos parciales conforme cada hito obtenga la firma de conformidad requerida.
- **Salida**: Transacción transparente de financiamiento protegida contra incumplimientos.

### 108. `SKILL-ECO-06: ImmutableLedgerAuditExporter`
- **Propósito**: Generar volcados forenses auditables en JSON y CSV de la totalidad de movimientos financieros, retiros y recompensas del libro mayor inmutable.
- **Disparador**: Cierres contables mensuales, auditorías fiscales o solicitud del usuario.
- **Entrada**: Rango de fechas y filtro de tipo de transacción (retiro, regalía, bono, compra).
- **Ejecución**:
  1. Extraer las transacciones registradas en IndexedDB o base de datos SQLite.
  2. Calcular el hash acumulativo encadenado (árbol de hashes tipo blockchain privada).
  3. Generar el archivo exportable garantizando que no existan discrepancias de saldo.
- **Salida**: Estado de cuenta y libro mayor inmutable certificado.

### 109. `SKILL-ECO-07: LightningFeeSavingsComparator`
- **Propósito**: Calcular en tiempo real el diferencial económico acumulado de transaccionar con 0% de comisiones en Civer Store frente a las tarifas del 30% de Google Play y Apple Store.
- **Disparador**: Finalización de compras o retiros en el ecosistema de la tienda.
- **Entrada**: Volumen bruto transaccionado en dólares estadounidenses (USD) o pesos (MXN).
- **Ejecución**:
  1. Calcular la comisión que habrían cobrado las tiendas cerradas tradicionales (`monto * 0.30`).
  2. Descontar la comisión real de Civer Store (`$0.00 USD`).
  3. Acumular el total de capital ahorrado en el contador global de soberanía digital.
- **Salida**: Métrica de ahorro directo en favor de la comunidad de desarrolladores.

### 110. `SKILL-ECO-08: ZeroKnowledgeBackupSealer`
- **Propósito**: Cifrar de extremo a extremo (E2EE) con AES-256-GCM y PBKDF2 todas las claves privadas, configuraciones y carteras de usuario antes de su almacenamiento en la nube.
- **Disparador**: Creación de respaldos de seguridad o sincronización multi-dispositivo.
- **Entrada**: Clave maestra o PIN del usuario y carga útil sensible a respaldar.
- **Ejecución**:
  1. Derivar una clave de cifrado de alta entropía mediante PBKDF2 con 600,000 iteraciones de SHA-256.
  2. Cifrar el payload generando un vector de inicialización (IV) único de 96 bits y un tag de autenticación de 128 bits.
  3. Subir exclusivamente el texto cifrado, impidiendo que el servidor conozca la información en texto plano.
- **Salida**: Respaldo blindado con privacidad de conocimiento cero (Zero-Knowledge).

### 111. `SKILL-ECO-09: FOSSContributorRoyaltySplitter`
- **Propósito**: Distribuir automáticamente ingresos por venta o donaciones de software según los porcentajes acordados: 51% autor principal, 15% testing, 20% tesorería, 10% infraestructura, 4% fondo comunitario.
- **Disparador**: Liquidación de una compra o recepción de un patrocinio para una aplicación.
- **Entrada**: Monto neto recibido y direcciones de pago de los participantes del proyecto.
- **Ejecución**:
  1. Calcular las fracciones matemáticas exactas en satoshis para evitar pérdidas por redondeo.
  2. Generar las órdenes de pago secundarias en la cola de liquidación atómica.
  3. Emitir los comprobantes individuales a cada destinatario.
- **Salida**: Reparto transparente y descentralizado de regalías en software libre.

### 112. `SKILL-ECO-10: VibeCodingPromptRewardEngine`
- **Propósito**: Evaluar la originalidad y valor técnico de prompts de vibe coding y distribuir recompensas a los autores que aporten plantillas arquitectónicas reutilizables.
- **Disparador**: Aprobación de una plantilla o blueprint de agente en el catálogo de Civer Workspace.
- **Entrada**: Prompt arquitectónico, dependencias declaradas y puntuación de calidad otorgada por el enjambre.
- **Ejecución**:
  1. Auditar que el prompt no contenga vulnerabilidades ni patrones de código privativo.
  2. Asignar un índice de recompensa basado en el número de veces que el prompt haya sido instanciado con éxito.
  3. Liquidar el bono correspondiente en el balance del creador.
- **Salida**: Incentivo económico acreditado y plantilla catalogada como recurso oficial.

### 113. `SKILL-ECO-11: SovereignCloudAutonomousHeartbeat`
- **Propósito**: Emitir un latido criptográfico global periódico que certifique ante la red descentralizada que Civer Cloud opera sin telemetría privativa, sin rastreadores y con 100% de software libre.
- **Disparador**: Bucle infinito del supervisor de sistema (cada 300 segundos).
- **Entrada**: Métricas consolidadas de salud, hashes de los manifiestos F-Droid y estado de los 7 canarios.
- **Ejecución**:
  1. Firmar el estado consolidado con la clave del clúster soberano.
  2. Publicar el atestado en `https://bene.civer.cloud/api/v1/heartbeat/sovereign.json`.
  3. Propagar el pulso a los nodos pares conectados por Tailscale y WebSockets.
- **Salida**: Certificado público de soberanía digital y transparencia operativa continua.
