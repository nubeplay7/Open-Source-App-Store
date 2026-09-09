# Documento de Diseño de Sistema (SDD)
## Civer App Store - The Open-Source Android Ecosystem & Cross-Device Matrix

---

| Metadato | Valor |
| :--- | :--- |
| **Documento** | SDD-CIVER-STORE-v2.6 |
| **Versión** | 2.6.0-PROD |
| **Estado** | Aprobado / Implementado |
| **Última Actualización** | 2026-09-09 |
| **Clasificación** | Arquitectura de Software FOSS |
| **Autores** | Civer System Architecture Group |

---

## 1. Visión General de la Arquitectura

**Civer App Store** está estructurado como un sistema distribuido tolerante a fallos compuesto por un **cliente universal reactivo (React 18 + TypeScript + Vite)**, un **contenedor nativo Android (TWA / WebAPK)**, un **bus de sincronización de flota en tiempo real** y una **capa de persistencia local híbrida (IndexedDB + LocalStorage)**.

```
+----------------------------------------------------------------------------------------------------+
|                                      CAPA DE PRESENTACIÓN (UI)                                     |
|                                                                                                    |
|  +---------------------+  +---------------------+  +----------------------+  +------------------+  |
|  | Civer Store Catalog |  | Play Store View     |  | Matrix Pro Table     |  | Android Ecosystem|  |
|  | (Grid, Search, Tags)|  | (Google Play Layout)|  | (D3, Multi-Sort)    |  | (Fleet & Push)   |  |
|  +---------------------+  +---------------------+  +----------------------+  +------------------+  |
+----------------------------------------------------------------------------------------------------+
                                                  |
+----------------------------------------------------------------------------------------------------+
|                                    CAPA DE SERVICIOS Y LÓGICA CORE                                 |
|                                                                                                    |
|  +--------------------------------+  +---------------------------------+  +---------------------+  |
|  | deviceFleetSyncService         |  | apkHashVerificationService      |  | mcpToolsService    |  |
|  | (Fleet state, Remote Dispatch) |  | (SHA-256, Digest, Scheme v2/v3) |  | (MCP Agent Tools)   |  |
|  +--------------------------------+  +---------------------------------+  +---------------------+  |
|  +--------------------------------+  +---------------------------------+  +---------------------+  |
|  | ciBuildQueueService            |  | repoHeuristicsService           |  | devWorkspaceService |  |
|  | (GitHub Actions Runner, Retry) |  | (Health Score 0-100%, Ast/Regex)|  | (Obsidian/Jira/Slk) |  |
|  +--------------------------------+  +---------------------------------+  +---------------------+  |
+----------------------------------------------------------------------------------------------------+
                                                  |
+----------------------------------------------------------------------------------------------------+
|                                CAPA DE PERSISTENCIA Y SINCRONIZACIÓN                               |
|                                                                                                    |
|  +---------------------------------------+  +---------------------------------------------------+  |
|  | IndexedDB (civer_fault_telemetry_db)  |  | LocalStorage                                      |  |
|  | - Incidentes forenses de red/seguridad |  | - civer_persistent_ci_queue_v1 (cola de builds)   |  |
|  | - Registros de auditoría de paquetes  |  | - civer_connected_devices_v1 (flota de hardware)  |  |
|  | - Métricas de rendimiento local       |  | - civer_active_profile (sesión de usuario)        |  |
|  +---------------------------------------+  +---------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
                                                  |
+----------------------------------------------------------------------------------------------------+
|                                  PUENTES CON HARDWARE Y PLATAFORMA                                 |
|                                                                                                    |
|  +---------------------------------------+  +---------------------------------------------------+  |
|  | WebAPK / Trusted Web Activity (TWA)   |  | Shizuku PackageInstaller API                      |  |
|  | - Service Worker atomic cache (sw.js) |  | - AIDL Binder IPC (moe.shizuku.privileged.api)    |  |
|  | - Digital Asset Links verification    |  | - Instalación desatendida sin root                |  |
|  +---------------------------------------+  +---------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Diagramas de Secuencia e Interacción de Componentes

### 2.1 Flujo de Instalación Remota en Flota de Dispositivos (Estilo Google Play)

El siguiente flujo describe el despacho de una instalación desde la versión web hacia un teléfono móvil enlazado:

```
[Navegador / Dashboard Web]      [Civer Sync Gateway]        [Dispositivo Android Destino]    [Shizuku Daemon / OS]
            |                             |                                 |                          |
            |-- 1. triggerRemoteInstall ->|                                 |                          |
            |   (targetDeviceId, appData) |                                 |                          |
            |                             |-- 2. Dispatch push notification |                          |
            |                             |   (WebSocket / FCM payload) --->|                          |
            |                             |                                 |-- 3. Valida credenciales |
            |                             |                                 |      de cuenta (SSO)     |
            |                             |                                 |                          |
            |                             |                                 |-- 4. Descarga binario    |
            |                             |                                 |      APK desde mirror    |
            |                             |                                 |                          |
            |                             |                                 |-- 5. Calcula digest      |
            |                             |                                 |      SHA-256 local       |
            |                             |                                 |                          |
            |                             |                                 |-- 6. SHA-256 coincide? ->|
            |                             |                                 |      [SÍ - Match 100%]   |
            |                             |                                 |                          |
            |                             |                                 |-- 7. Abre sesión IPC --->|
            |                             |                                 |      PackageInstaller    |-- 8. Escribe APK en
            |                             |                                 |                          |     /data/app/
            |                             |                                 |                          |     sin requerir root
            |                             |                                 |<-- 9. Install SUCCESS <--|
            |                             |<-- 10. Ack status: INSTALLED ---|                          |
            |<-- 11. Actualiza UI en vivo |                                 |                          |
            |    y emite notificación     |                                 |                          |
```

### 2.2 Sincronización 1:1 OTA (Over-The-Air) mediante Service Worker

Para garantizar que la aplicación nativa en el dispositivo Android sea idéntica a la plataforma web:

1. **Ciclo de Actualización**:
   - El archivo `sw.js` intercepta cada petición de navegación mediante una estrategia `Stale-While-Revalidate` para recursos estáticos y `Network-First` para el índice y manifiesto.
2. **Detección de Nuevos Commits**:
   - Cuando se despliega una nueva versión en el servidor, el Service Worker detecta un cambio en el hash del bundle principal (`index-[hash].js`).
3. **Instalación en Background**:
   - Los nuevos activos se descargan en una caché paralela (`civer-store-cache-v[N+1]`).
4. **Activación y Recarga Silenciosa**:
   - Tras el siguiente ciclo de inactividad o interacción, el Service Worker activa los nuevos assets eliminando la caché obsoleta (`skipWaiting()`), manteniendo al usuario en la versión más reciente sin requerir la reinstalación de ningún archivo APK.

---

## 3. Integración con Shizuku PackageInstaller API

Para lograr instalaciones silenciosas desatendidas (idénticas a las que realiza Google Play Store con permisos privilegiados del sistema):

### 3.1 Arquitectura de Enlace AIDL
Shizuku provee un demonio que corre con permisos de `adb` (UID 2000) o `root` (UID 0), exponiendo una interfaz Binder que permite a aplicaciones no privilegiadas invocar métodos del sistema Android.

```kotlin
// Interfaz de comunicación Shizuku para PackageInstaller
import moe.shizuku.api.Shizuku
import android.content.pm.PackageInstaller

fun installPackageSilently(apkStream: InputStream, packageName: string): Boolean {
    // 1. Validar autorización de Shizuku
    if (Shizuku.checkSelfPermission() != PackageManager.PERMISSION_GRANTED) {
        throw SecurityException("Permiso de Shizuku no otorgado")
    }

    // 2. Obtener PackageInstaller a través del Binder remoto
    val packageInstaller = Shizuku.getPackageInstaller()
    val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL)
    val sessionId = packageInstaller.createSession(params)
    val session = packageInstaller.openSession(sessionId)

    // 3. Escribir stream del archivo APK validado
    val out = session.openWrite(packageName, 0, -1)
    apkStream.copyTo(out)
    session.fsync(out)
    out.close()

    // 4. Comprometer la sesión de instalación
    val statusReceiver = createInstallCommitIntentSender()
    session.commit(statusReceiver)
    session.close()
    return true
}
```

---

## 4. Modelos de Datos y Estructura de Tipos

Todos los contratos de datos del sistema están definidos estrictamente en `src/types.ts`:

### 4.1 Entidad de Aplicación del Catálogo (`AppCatalogItem`)
```typescript
export interface AppCatalogItem {
  id: string;
  name: string;
  packageName: string;
  version: string;
  apkSizeMb: number;
  category: 'STORES' | 'UTILITIES' | 'PRIVACY' | 'SYSTEM' | 'DEVELOPMENT';
  tagline: string;
  description: string;
  rating: number;
  reviewCount: string;
  downloads: string;
  minAndroid: string;
  targetSdk: number;
  license: string;
  githubUrl: string;
  githubStars: string;
  trackersCount: number;           // Reportado por Exodus Privacy
  permissions: string[];           // Permisos requeridos
  defaultBranch?: string;
  gradleTask?: string;
  sha256?: string;                 // Digest criptográfico verificado
}
```

### 4.2 Dispositivo Conectado (`ConnectedDevice`)
```typescript
export interface ConnectedDevice {
  id: string;
  name: string;
  model: string;
  deviceType: 'PHONE' | 'TABLET' | 'TV' | 'DESKTOP';
  osVersion: string;
  batteryPercent: number;
  isOnline: boolean;
  lastSyncTimestamp: number;
  isCurrentDevice: boolean;
  installedAppIds: string[];
}
```

### 4.3 Elemento de Cola de Compilación Persistente (`PersistentCiQueueItem`)
```typescript
export interface PersistentCiQueueItem {
  id: string;
  appId: string;
  appName: string;
  packageName: string;
  branch: string;
  gradleTask: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'QUEUED' | 'BUILDING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
  retryCount: number;
  maxRetries: number;
  queuedTimestamp: number;
  startedTimestamp?: number;
  finishedTimestamp?: number;
  outputArtifactUrl?: string;
  apkSizeMb?: number;
  logs: string[];
  errorReason?: string;
}
```

---

## 5. Arquitectura de Seguridad Criptográfica

1. **Digital Asset Links (`.well-known/assetlinks.json`)**:
   Garantiza la vinculación criptográfica entre el origen HTTPS (`https://civer-store.org`) y el contenedor de la aplicación nativa en Android.
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "org.civer.store",
       "sha256_cert_fingerprints": [
         "4A:81:6F:1C:4E:97:61:E8:9F:81:60:10:0F:91:92:94:E8:03:D1:5B:24:47:9E:0B:F5:71:99:1D:9F:0F:9C:2A"
       ]
     }
   }]
   ```

2. **Verificación de APK Signature Scheme v2 y v3**:
   El sistema no acepta binarios que utilicen únicamente el esquema legacy JAR signing (v1), ya que es vulnerable a manipulación de metadatos ZIP. La validación exige bloques de firma criptográfica incrustados en el binario APK.

3. **Content Security Policy (CSP)**:
   Se imponen cabeceras estrictas que bloquean la ejecución de scripts externos no autorizados y previenen cualquier conexión hacia servidores telemáticos de analítica comercial.

---

## 6. Persistencia y Almacenamiento Local Híbrido

| Almacén | Nombre de Clave / DB | Propósito Técnico |
| :--- | :--- | :--- |
| **IndexedDB** | `civer_fault_telemetry_db` | Almacenamiento de alta capacidad para logs forenses, trazas de errores de red y eventos de auditoría de paquetes. |
| **LocalStorage** | `civer_persistent_ci_queue_v1` | Estado íntegro serializado en JSON de las tareas de compilación continua y sus reintentos. |
| **LocalStorage** | `civer_connected_devices_v1` | Inventario en tiempo real de los dispositivos emparejados a la cuenta. |
| **LocalStorage** | `civer_active_profile` | Perfil del usuario, credenciales de sesión simulada y configuración estética. |

---

## 7. Estrategia de Pruebas y Tolerancia a Fallos

1. **Pruebas de Conectividad Intermitente**:
   El hook `useResponsiveLayout` y el detector de red supervisan continuamente los eventos `online` / `offline` de la ventana del navegador. Si se pierde la conectividad, las acciones remotas quedan encoladas localmente y se ejecutan automáticamente al restaurar la conexión.
2. **Backoff Exponencial en Tareas de Red**:
   Las peticiones a repositorios y descargas de binarios implementan una estrategia de reintentos con retraso progresivo: `delay = Math.min(1000 * Math.pow(2, attempt), 30000)`.
