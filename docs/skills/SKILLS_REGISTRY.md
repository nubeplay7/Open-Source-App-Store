# Catálogo Maestro de 50 Habilidades de Agente (Agent Skills Registry)
## Ecosistema Civer FOSS Store Matrix

Este documento contiene la especificación formal y ejecutable de las **50 Habilidades de Agente (*Agent Skills*)** diseñadas para operar de forma autónoma o supervisada dentro del repositorio **Civer App Store**. Cada habilidad define su disparador (*trigger*), parámetros de entrada, pasos de ejecución algorítmica y criterios de verificación.

---

## Índice General de Categorías

- [Categoría A: Seguridad Criptográfica y Auditoría (Skills 01-10)](#categoría-a-seguridad-criptográfica-y-auditoría)
- [Categoría B: Toolchain Android y Compilación CI/CD (Skills 11-20)](#categoría-b-toolchain-android-y-compilación-cicd)
- [Categoría C: Gestión de Flota y Despliegue Remoto (Skills 21-28)](#categoría-c-gestión-de-flota-y-despliegue-remoto)
- [Categoría D: Curaduría de Catálogo y Heurística FOSS (Skills 29-36)](#categoría-d-curaduría-de-catálogo-y-heurística-foss)
- [Categoría E: Developer Workspace e Integraciones (Skills 37-43)](#categoría-e-developer-workspace-e-integraciones)
- [Categoría F: Experiencia de Usuario, Ergonomía y Accesibilidad (Skills 44-50)](#categoría-f-experiencia-de-usuario-ergonomía-y-accesibilidad)
- [Categoría G: Infraestructura Empresarial y Pagos Soberanos (Skills 51-55)](#categoría-g-infraestructura-empresarial-y-pagos-soberanos)

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
