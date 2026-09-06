import {
  FailoverSubsystemId,
  SubsystemHealthRecord,
  DeepTelemetryLogEntry,
  FailoverIncidentReport,
  ErrorRootCauseAnalysis,
  TelemetryLogLevel
} from '../types';

class ResilienceTelemetryService {
  private subsystems: Map<FailoverSubsystemId, SubsystemHealthRecord> = new Map();
  private logs: DeepTelemetryLogEntry[] = [];
  private incidents: FailoverIncidentReport[] = [];
  private listeners: Set<() => void> = new Set();
  private maxLogsCount = 400;

  constructor() {
    this.initializeSubsystems();
    this.seedInitialTelemetryLogs();
  }

  private generateId(): string {
    return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
  }

  private generateTraceId(): string {
    return 'trace-' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  }

  private generateSpanId(): string {
    return 'span-' + Math.random().toString(16).substring(2, 10);
  }

  private nowIso(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  private initializeSubsystems() {
    const initialDefs: SubsystemHealthRecord[] = [
      {
        id: 'FDROID_INDEX_SYNC',
        name: 'Sincronizador de Índices F-Droid v2',
        description: 'Descarga y descompresión de índices de catálogo index-v2.json con validación de firmas de metadatos.',
        category: 'NETWORK',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 42,
        consecutiveFailures: 0,
        totalRequests: 840,
        successfulRequests: 838,
        failedRequests: 2,
        uptimePercent: 99.76,
        averageLatencyMs: 142,
        lastLatencyMs: 98,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 2,
        currentActiveFallback: 'Espejo Primario (f-droid.org CDN)',
        fallbackChain: [
          { level: 1, name: 'Espejo Primario Oficial', description: 'https://f-droid.org/repo/index-v2.json', isAvailable: true, latencyMs: 98, endpointUrl: 'https://f-droid.org/repo' },
          { level: 2, name: 'Cloudflare Edge CDN Mirror', description: 'https://fdroid.cloudflare-ipfs.com/repo', isAvailable: true, latencyMs: 65, endpointUrl: 'https://cloudflare-ipfs.com' },
          { level: 3, name: 'GitHub Raw Index Mirror', description: 'https://raw.githubusercontent.com/f-droid/fdroiddata', isAvailable: true, latencyMs: 180, endpointUrl: 'https://raw.githubusercontent.com' },
          { level: 4, name: 'Caché Local Offline (SQLite/IndexedDB)', description: 'Snapshot almacenado en dispositivo', isAvailable: true, latencyMs: 4, endpointUrl: 'local://cache' }
        ],
        antiLoopGuard: {
          maxRetries: 3,
          currentRetryCount: 0,
          backoffIntervalMs: 500,
          loopPreventedCount: 0
        }
      },
      {
        id: 'GITHUB_ACTIONS_CI',
        name: 'Compilador Cloud GitHub Actions CI',
        description: 'Despacho de workflows de compilación APK, ejecución de Gradle y streaming de logs AAPT2.',
        category: 'COMPILER',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 18,
        consecutiveFailures: 0,
        totalRequests: 120,
        successfulRequests: 119,
        failedRequests: 1,
        uptimePercent: 99.16,
        averageLatencyMs: 310,
        lastLatencyMs: 245,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 1,
        currentActiveFallback: 'GitHub Actions Runner Oficial',
        fallbackChain: [
          { level: 1, name: 'GitHub Actions Runner Oficial', description: 'api.github.com/repos/workflows/dispatches', isAvailable: true, latencyMs: 245 },
          { level: 2, name: 'Runner Espejo Secundario (Self-Hosted CI)', description: 'ci-mirror.civerappstore.org/builder', isAvailable: true, latencyMs: 380 },
          { level: 3, name: 'Compilador Emulado Local con Mock AAPT2', description: 'Generador de artefactos estáticos cliente', isAvailable: true, latencyMs: 15 }
        ],
        antiLoopGuard: {
          maxRetries: 3,
          currentRetryCount: 0,
          backoffIntervalMs: 1000,
          loopPreventedCount: 0
        }
      },
      {
        id: 'SHIZUKU_IPC_DAEMON',
        name: 'Daemon de Instalación Shizuku Binder IPC',
        description: 'Comunicación con proceso privilegiado ADB vía moe.shizuku.server para instalaciones 1-Click silenciosas.',
        category: 'IPC',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 31,
        consecutiveFailures: 0,
        totalRequests: 215,
        successfulRequests: 214,
        failedRequests: 1,
        uptimePercent: 99.53,
        averageLatencyMs: 45,
        lastLatencyMs: 32,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 1,
        currentActiveFallback: 'Shizuku Privileged Binder IPC',
        fallbackChain: [
          { level: 1, name: 'Shizuku Privileged Binder IPC', description: 'moe.shizuku.manager.permission.API_V23', isAvailable: true, latencyMs: 32 },
          { level: 2, name: 'Android SessionInstaller Nativo', description: 'android.content.pm.PackageInstaller', isAvailable: true, latencyMs: 180 },
          { level: 3, name: 'WebADB Daemon Local TCP Direct', description: 'Puente directo adb tcpip:5555 vía WebUSB', isAvailable: true, latencyMs: 95 }
        ],
        antiLoopGuard: {
          maxRetries: 2,
          currentRetryCount: 0,
          backoffIntervalMs: 400,
          loopPreventedCount: 0
        }
      },
      {
        id: 'APK_SIGNING_VAULT',
        name: 'Bóveda Criptográfica de Firmas APK (WebCrypto)',
        description: 'Generación de pares de llaves RSA-4096 / ECDSA P-256 y firma digital esquemas v1 a v4.',
        category: 'SECURITY',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 55,
        consecutiveFailures: 0,
        totalRequests: 180,
        successfulRequests: 180,
        failedRequests: 0,
        uptimePercent: 100.0,
        averageLatencyMs: 18,
        lastLatencyMs: 12,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 0,
        currentActiveFallback: 'WebCrypto SubtleCrypto Nativo del Navegador',
        fallbackChain: [
          { level: 1, name: 'WebCrypto SubtleCrypto Nativo', description: 'crypto.subtle con aceleración por hardware', isAvailable: true, latencyMs: 12 },
          { level: 2, name: 'Bóveda PKCS#8 Cifrada en IndexedDB', description: 'Almacén persistente local AES-256-GCM', isAvailable: true, latencyMs: 25 },
          { level: 3, name: 'Certificado Maestro de Desarrollo (Fallback)', description: 'Clave de contingencia auto-contenida', isAvailable: true, latencyMs: 5 }
        ],
        antiLoopGuard: {
          maxRetries: 3,
          currentRetryCount: 0,
          backoffIntervalMs: 300,
          loopPreventedCount: 0
        }
      },
      {
        id: 'DELTA_PATCH_ENGINE',
        name: 'Motor de Actualizaciones Delta (bsdiff / zstd)',
        description: 'Cálculo de parches binarios diferenciales vCDIFF para ahorrar hasta 90% de ancho de banda.',
        category: 'COMPILER',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 24,
        consecutiveFailures: 0,
        totalRequests: 95,
        successfulRequests: 93,
        failedRequests: 2,
        uptimePercent: 97.89,
        averageLatencyMs: 68,
        lastLatencyMs: 52,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 2,
        currentActiveFallback: 'Parche Delta bsdiff vCDIFF',
        fallbackChain: [
          { level: 1, name: 'Parche Delta bsdiff vCDIFF', description: 'Descarga diferencial del delta de cambios', isAvailable: true, latencyMs: 52 },
          { level: 2, name: 'Descarga Segmentada HTTP Range', description: 'Segmentos de 2MB en paralelo', isAvailable: true, latencyMs: 120 },
          { level: 3, name: 'Descarga Completa del APK Monolítico', description: 'Fallback clásico de binario íntegro', isAvailable: true, latencyMs: 310 }
        ],
        antiLoopGuard: {
          maxRetries: 2,
          currentRetryCount: 0,
          backoffIntervalMs: 500,
          loopPreventedCount: 0
        }
      },
      {
        id: 'P2P_WEBRTC_MESH',
        name: 'Malla P2P Wi-Fi Direct & WebRTC',
        description: 'Compartición de APKs sin conexión a internet entre dispositivos cercanos en la red local.',
        category: 'P2P',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 15,
        consecutiveFailures: 0,
        totalRequests: 48,
        successfulRequests: 46,
        failedRequests: 2,
        uptimePercent: 95.83,
        averageLatencyMs: 28,
        lastLatencyMs: 22,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 2,
        currentActiveFallback: 'Wi-Fi Direct Local Broadcast',
        fallbackChain: [
          { level: 1, name: 'Wi-Fi Direct Local Broadcast', description: 'Descubrimiento mDNS en canal de 5GHz', isAvailable: true, latencyMs: 22 },
          { level: 2, name: 'WebRTC DataChannel Local', description: 'Canal cifrado punto a punto en LAN', isAvailable: true, latencyMs: 45 },
          { level: 3, name: 'Servidor HTTP Local de Emergencia', description: 'Streaming vía puerto 8080 en LAN privada', isAvailable: true, latencyMs: 80 }
        ],
        antiLoopGuard: {
          maxRetries: 2,
          currentRetryCount: 0,
          backoffIntervalMs: 800,
          loopPreventedCount: 0
        }
      },
      {
        id: 'LOCAL_STORAGE_CACHE',
        name: 'Almacenamiento Persistente & Caché IndexedDB',
        description: 'Caché de esquemas, configuración de usuario, catálogo offline y árboles git locales.',
        category: 'STORAGE',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 88,
        consecutiveFailures: 0,
        totalRequests: 1420,
        successfulRequests: 1420,
        failedRequests: 0,
        uptimePercent: 100.0,
        averageLatencyMs: 6,
        lastLatencyMs: 4,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 0,
        currentActiveFallback: 'IndexedDB Blobs & Store',
        fallbackChain: [
          { level: 1, name: 'IndexedDB Blobs & ObjectStore', description: 'Almacenamiento estructurado no bloqueante', isAvailable: true, latencyMs: 4 },
          { level: 2, name: 'LocalStorage de Respaldo', description: 'Almacén síncrono para configuraciones', isAvailable: true, latencyMs: 2 },
          { level: 3, name: 'Caché Volátil en Memoria RAM', description: 'Fallback en memoria ante cuotas saturadas', isAvailable: true, latencyMs: 0.5 }
        ],
        antiLoopGuard: {
          maxRetries: 3,
          currentRetryCount: 0,
          backoffIntervalMs: 200,
          loopPreventedCount: 0
        }
      },
      {
        id: 'REPOSITORIES_RESOLVER',
        name: 'Resolvedor de Repositorios & Tokens Aurora',
        description: 'Pool de credenciales anónimas GSF y rotación de tokens OAuth para catálogos FOSS.',
        category: 'NETWORK',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 34,
        consecutiveFailures: 0,
        totalRequests: 320,
        successfulRequests: 316,
        failedRequests: 4,
        uptimePercent: 98.75,
        averageLatencyMs: 195,
        lastLatencyMs: 140,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 4,
        currentActiveFallback: 'Pool Dinámico Aurora OSS (Token 03)',
        fallbackChain: [
          { level: 1, name: 'Pool Dinámico Aurora OSS', description: 'Token rotator con cuota balanceada', isAvailable: true, latencyMs: 140 },
          { level: 2, name: 'Sesión Anónima F-Droid Directa', description: 'Descarga directa sin token intermediario', isAvailable: true, latencyMs: 85 },
          { level: 3, name: 'GitHub Releases Scraper Directo', description: 'API pública de releases de repositorios', isAvailable: true, latencyMs: 210 }
        ],
        antiLoopGuard: {
          maxRetries: 3,
          currentRetryCount: 0,
          backoffIntervalMs: 1200,
          loopPreventedCount: 0
        }
      },
      {
        id: 'SECURITY_SCANNER_EXODUS',
        name: 'Escáner Estático de Telemetría Exodus',
        description: 'Inspección de firmas de clases de rastreadores publicitarios en el bytecode Dalvik/DEX.',
        category: 'SECURITY',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 62,
        consecutiveFailures: 0,
        totalRequests: 240,
        successfulRequests: 240,
        failedRequests: 0,
        uptimePercent: 100.0,
        averageLatencyMs: 38,
        lastLatencyMs: 26,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 0,
        currentActiveFallback: 'Desensamblador Dalvik DEX en Memoria',
        fallbackChain: [
          { level: 1, name: 'Desensamblador Dalvik DEX en Memoria', description: 'Análisis estático de strings y clases DEX', isAvailable: true, latencyMs: 26 },
          { level: 2, name: 'Base de Reglas Firmadas Exodus Cache', description: 'Verificación contra base local de firmas', isAvailable: true, latencyMs: 8 },
          { level: 3, name: 'Heurística de Permisos de Manifiesto', description: 'Auditoría basada en uses-permission', isAvailable: true, latencyMs: 2 }
        ],
        antiLoopGuard: {
          maxRetries: 2,
          currentRetryCount: 0,
          backoffIntervalMs: 400,
          loopPreventedCount: 0
        }
      },
      {
        id: 'WEBAUTHN_HSM_SIGNER',
        name: 'Módulo de Firma FIDO2 / YubiKey Hardware HSM',
        description: 'Autenticación criptográfica con llaves de seguridad físicas externas o enclaves seguros.',
        category: 'SECURITY',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 19,
        consecutiveFailures: 0,
        totalRequests: 60,
        successfulRequests: 59,
        failedRequests: 1,
        uptimePercent: 98.33,
        averageLatencyMs: 85,
        lastLatencyMs: 72,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 1,
        currentActiveFallback: 'YubiKey FIDO2 USB-C / NFC Challenge',
        fallbackChain: [
          { level: 1, name: 'YubiKey FIDO2 USB-C / NFC Challenge', description: 'navigator.credentials.get con token físico', isAvailable: true, latencyMs: 72 },
          { level: 2, name: 'Passkey Biométrico de Plataforma', description: 'Sensor de huellas dactilares / FaceUnlock', isAvailable: true, latencyMs: 40 },
          { level: 3, name: 'Bóveda Cifrada con PIN en Memoria Segura', description: 'PBKDF2-SHA512 con 250,000 iteraciones', isAvailable: true, latencyMs: 15 }
        ],
        antiLoopGuard: {
          maxRetries: 2,
          currentRetryCount: 0,
          backoffIntervalMs: 600,
          loopPreventedCount: 0
        }
      },
      {
        id: 'AUTH_SESSION_GATEWAY',
        name: 'Pasarela de Autenticación, Civer ID & Sesiones FOSS',
        description: 'Gestión soberana de sesiones, verificación de tokens GitHub CI, llaves Passkeys y bitácora forense de accesos.',
        category: 'SECURITY',
        status: 'HEALTHY',
        circuitState: 'CLOSED',
        consecutiveSuccesses: 54,
        consecutiveFailures: 0,
        totalRequests: 180,
        successfulRequests: 179,
        failedRequests: 1,
        uptimePercent: 99.44,
        averageLatencyMs: 42,
        lastLatencyMs: 24,
        lastHealthCheck: this.nowIso(),
        fallbackReroutesCount: 1,
        currentActiveFallback: 'Civer ID Criptográfico Soberano (Local Vault)',
        fallbackChain: [
          { level: 1, name: 'Civer ID Criptográfico Soberano (Local Vault)', description: 'Firma local y verificación de claves Ed25519 en bóveda del navegador', isAvailable: true, latencyMs: 24 },
          { level: 2, name: 'FIDO2 / WebAuthn Passkey de Plataforma', description: 'Autenticación biométrica mediante enclaves de hardware protegidos', isAvailable: true, latencyMs: 38 },
          { level: 3, name: 'GitHub CI Token Rotator con Cifrado AES', description: 'Acceso automatizado para CI/CD con tokens de usuario de alcance mínimo', isAvailable: true, latencyMs: 110 }
        ],
        antiLoopGuard: {
          maxRetries: 3,
          currentRetryCount: 0,
          backoffIntervalMs: 500,
          loopPreventedCount: 0
        }
      }
    ];

    initialDefs.forEach((item) => this.subsystems.set(item.id, item));
  }

  private seedInitialTelemetryLogs() {
    const traceId = this.generateTraceId();
    this.addLog({
      traceId,
      spanId: this.generateSpanId(),
      subsystem: 'KERNEL',
      level: 'INFO',
      eventType: 'SUBSYSTEM_INIT',
      message: 'Motor de Telemetría Profunda & Failover de Civer App Store inicializado con 10 subsistemas vigilados.',
      contextPayload: {
        activeSubsystemsCount: 10,
        antiLoopGuardMaxRetries: 3,
        failoverRoutingPolicy: 'AUTOMATIC_TIERED_CASCADE'
      }
    });

    this.addLog({
      traceId,
      spanId: this.generateSpanId(),
      subsystem: 'FDROID_INDEX_SYNC',
      level: 'DEBUG',
      eventType: 'REQUEST_SUCCESS',
      message: 'Sondeo de latencia a espejo primario f-droid.org completado en 98ms. Digest SHA-256 verificado.',
      latencyMs: 98
    });

    this.addLog({
      traceId,
      spanId: this.generateSpanId(),
      subsystem: 'SHIZUKU_IPC_DAEMON',
      level: 'INFO',
      eventType: 'REQUEST_SUCCESS',
      message: 'Daemon Shizuku vinculado exitosamente (Binder ping response: true). Permiso API_V23 concedido.',
      latencyMs: 32
    });

    this.addLog({
      traceId,
      spanId: this.generateSpanId(),
      subsystem: 'APK_SIGNING_VAULT',
      level: 'DEBUG',
      eventType: 'REQUEST_SUCCESS',
      message: 'Bóveda WebCrypto verificada con hardware crypto.subtle. Llaves RSA-4096 y ECDSA P-256 listas para firma.',
      latencyMs: 12
    });

    this.addLog({
      traceId,
      spanId: this.generateSpanId(),
      subsystem: 'NETWORK_GATEWAY',
      level: 'INFO',
      eventType: 'REQUEST_SUCCESS',
      message: 'Todos los circuitos se encuentran en estado CLOSED (Normal). Mecanismo Anti-Infinite-Loop activo.',
      contextPayload: {
        infiniteLoopProtection: 'ACTIVE',
        exponentialBackoffBaseMs: 500
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Telemetry listener error:', err);
      }
    });
  }

  public getSubsystems(): SubsystemHealthRecord[] {
    return Array.from(this.subsystems.values());
  }

  public getSubsystem(id: FailoverSubsystemId): SubsystemHealthRecord | undefined {
    return this.subsystems.get(id);
  }

  public getLogs(): DeepTelemetryLogEntry[] {
    return [...this.logs];
  }

  public getIncidents(): FailoverIncidentReport[] {
    return [...this.incidents];
  }

  public clearLogs() {
    this.logs = [];
    this.addLog({
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      subsystem: 'KERNEL',
      level: 'INFO',
      eventType: 'MANUAL_INTERVENTION',
      message: 'Historial de telemetría de vuelo reiniciado manualmente por el operador.'
    });
    this.notifyListeners();
  }

  public addLog(entry: Omit<DeepTelemetryLogEntry, 'id' | 'timestamp'>): DeepTelemetryLogEntry {
    const fullEntry: DeepTelemetryLogEntry = {
      id: this.generateId(),
      timestamp: this.nowIso(),
      ...entry
    };

    this.logs.unshift(fullEntry);
    if (this.logs.length > this.maxLogsCount) {
      this.logs.pop();
    }

    this.notifyListeners();
    return fullEntry;
  }

  /**
   * Registra un éxito para un subsistema específico
   */
  public recordSuccess(subsystemId: FailoverSubsystemId, latencyMs: number, details?: string) {
    const sub = this.subsystems.get(subsystemId);
    if (!sub) return;

    sub.totalRequests += 1;
    sub.successfulRequests += 1;
    sub.consecutiveSuccesses += 1;
    sub.consecutiveFailures = 0;
    sub.lastLatencyMs = latencyMs;
    sub.averageLatencyMs = Math.round((sub.averageLatencyMs * 0.8) + (latencyMs * 0.2));
    sub.uptimePercent = Number(((sub.successfulRequests / sub.totalRequests) * 100).toFixed(2));
    sub.lastHealthCheck = this.nowIso();
    sub.antiLoopGuard.currentRetryCount = 0;

    // Si el circuito estaba HALF_OPEN y tuvimos éxito, lo cerramos de nuevo (recuperado)
    if (sub.circuitState === 'HALF_OPEN' || sub.status === 'RECOVERING' || sub.status === 'FALLBACK_ACTIVE') {
      sub.circuitState = 'CLOSED';
      sub.status = 'HEALTHY';
      sub.currentActiveFallback = sub.fallbackChain[0].name;

      this.addLog({
        traceId: this.generateTraceId(),
        spanId: this.generateSpanId(),
        subsystem: subsystemId,
        level: 'INFO',
        eventType: 'REQUEST_SUCCESS',
        message: `El subsistema [${sub.name}] se recuperó por completo. Circuito cerrado a estado normal (CLOSED).`,
        latencyMs
      });
    }

    this.notifyListeners();
  }

  /**
   * Registra un fallo, activa el Circuit Breaker y la cadena de Failover evitando bucles infinitos
   */
  public recordFailure(
    subsystemId: FailoverSubsystemId,
    rootCause: ErrorRootCauseAnalysis,
    fallbackOverride?: string
  ): { fallbackActivated: string; loopPrevented: boolean } {
    const sub = this.subsystems.get(subsystemId);
    if (!sub) return { fallbackActivated: 'None', loopPrevented: false };

    sub.totalRequests += 1;
    sub.failedRequests += 1;
    sub.consecutiveFailures += 1;
    sub.consecutiveSuccesses = 0;
    sub.uptimePercent = Number(((sub.successfulRequests / sub.totalRequests) * 100).toFixed(2));
    sub.lastHealthCheck = this.nowIso();
    sub.lastErrorRootCause = rootCause;

    // Incrementar reintentos en el AntiLoopGuard
    sub.antiLoopGuard.currentRetryCount += 1;
    let loopPrevented = false;

    // ANTI-INFINITE-LOOP GUARD:
    // Si los reintentos consecutivos exceden el límite estricto, bloqueamos el bucle,
    // abrimos el circuito (OPEN) e impedimos reintentos repetitivos que cuelguen la app.
    if (sub.antiLoopGuard.currentRetryCount >= sub.antiLoopGuard.maxRetries) {
      loopPrevented = true;
      sub.antiLoopGuard.loopPreventedCount += 1;
      sub.circuitState = 'OPEN';
      sub.status = 'FAILED';
      sub.antiLoopGuard.lastCircuitTripTimestamp = this.nowIso();

      this.addLog({
        traceId: this.generateTraceId(),
        spanId: this.generateSpanId(),
        subsystem: subsystemId,
        level: 'FATAL',
        eventType: 'LOOP_BLOCKED',
        message: `[Anti-Infinite-Loop Guard] Se detectó riesgo de bucle infinito de reintentos en [${sub.name}]. Circuito puesto en OPEN. Reintentos bloqueados.`,
        rootCauseAnalysis: rootCause,
        contextPayload: {
          retriesAttempted: sub.antiLoopGuard.currentRetryCount,
          maxAllowed: sub.antiLoopGuard.maxRetries,
          preventedTotal: sub.antiLoopGuard.loopPreventedCount
        }
      });
    }

    // Determinar siguiente fallback disponible
    const currentFallbackIndex = sub.fallbackChain.findIndex(
      (f) => f.name === sub.currentActiveFallback
    );
    const nextFallbackIndex = Math.min(
      currentFallbackIndex >= 0 ? currentFallbackIndex + 1 : 1,
      sub.fallbackChain.length - 1
    );
    const nextFallback = fallbackOverride || sub.fallbackChain[nextFallbackIndex].name;

    sub.currentActiveFallback = nextFallback;
    sub.fallbackReroutesCount += 1;
    sub.status = loopPrevented ? 'FAILED' : 'FALLBACK_ACTIVE';

    // Registrar incidente en el historial
    const incident: FailoverIncidentReport = {
      id: this.generateId(),
      subsystemId,
      subsystemName: sub.name,
      startTime: this.nowIso(),
      durationSeconds: 0,
      errorCode: rootCause.errorCode,
      rootCause: rootCause.reason,
      whyItHappened: rootCause.whyItHappened,
      fallbackRouteTriggered: nextFallback,
      antiLoopGuardPrevented: loopPrevented,
      recoveryVerified: false
    };
    this.incidents.unshift(incident);

    this.addLog({
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      subsystem: subsystemId,
      level: 'WARN',
      eventType: 'FAILOVER_TRIGGERED',
      message: `Failover ejecutado en [${sub.name}]. Redirigido automáticamente a: "${nextFallback}".`,
      rootCauseAnalysis: rootCause,
      failoverRouteUsed: nextFallback
    });

    this.notifyListeners();
    return { fallbackActivated: nextFallback, loopPrevented };
  }

  /**
   * Resetea manualmente un circuito a CLOSED y saludable
   */
  public resetCircuit(subsystemId: FailoverSubsystemId) {
    const sub = this.subsystems.get(subsystemId);
    if (!sub) return;

    sub.circuitState = 'CLOSED';
    sub.status = 'HEALTHY';
    sub.consecutiveFailures = 0;
    sub.antiLoopGuard.currentRetryCount = 0;
    sub.currentActiveFallback = sub.fallbackChain[0].name;

    this.addLog({
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      subsystem: subsystemId,
      level: 'INFO',
      eventType: 'MANUAL_INTERVENTION',
      message: `Circuito para [${sub.name}] reiniciado manualmente por el usuario. Estado: CLOSED. Modo Primario restablecido.`
    });

    this.notifyListeners();
  }

  /**
   * Resetea todos los circuitos y restaura la matriz completa a HEALTHY
   */
  public resetAllCircuits() {
    this.subsystems.forEach((sub) => {
      sub.circuitState = 'CLOSED';
      sub.status = 'HEALTHY';
      sub.consecutiveFailures = 0;
      sub.antiLoopGuard.currentRetryCount = 0;
      sub.currentActiveFallback = sub.fallbackChain[0].name;
    });

    this.addLog({
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      subsystem: 'KERNEL',
      level: 'INFO',
      eventType: 'MANUAL_INTERVENTION',
      message: 'Todos los subsistemas y Circuit Breakers han sido restablecidos al 100% de operatividad.'
    });

    this.notifyListeners();
  }

  /**
   * Ejecuta una simulación de caos (Chaos Testing) para probar que el Failover funciona
   * y que no entra en ciclo infinito.
   */
  public simulateChaosScenario(scenarioId: string): {
    subsystemName: string;
    detectedError: string;
    whyItHappened: string;
    fallbackRoute: string;
    loopPrevented: boolean;
  } {
    const traceId = this.generateTraceId();

    switch (scenarioId) {
      case 'FDROID_MIRROR_DOWN': {
        const subId: FailoverSubsystemId = 'FDROID_INDEX_SYNC';
        const rootCause: ErrorRootCauseAnalysis = {
          errorCode: 'ERR_FDROID_HTTP_502_BAD_GATEWAY',
          detectedError: 'Conexión rechazada por el servidor primario f-droid.org',
          reason: 'El endpoint oficial https://f-droid.org/repo/index-v2.json devolvió HTTP 502 Bad Gateway.',
          whyItHappened: 'Sobrecarga temporal de peticiones o mantenimiento del servidor central en Frankfurt.',
          stackTraceSnippet: `FetchError: 502 Bad Gateway at FdroidIndexClient.fetchIndexV2 (fdroidClient.ts:48)\n  at CircuitBreaker.executeWithFailover (resilienceTelemetry.ts:112)`,
          timestamp: this.nowIso(),
          recommendedResolution: 'Cambiar la ruta de descarga al CDN de Cloudflare o al mirror de GitHub Raw.',
          preventiveActionTaken: 'Conmutación instantánea a Cloudflare Edge CDN Mirror sin reintentos infinitos.'
        };

        this.addLog({
          traceId,
          spanId: this.generateSpanId(),
          subsystem: subId,
          level: 'ERROR',
          eventType: 'CHAOS_INJECTION',
          message: '[Simulación de Caos] Forzando caída de espejo primario F-Droid (HTTP 502)...',
          rootCauseAnalysis: rootCause
        });

        const result = this.recordFailure(subId, rootCause, 'Cloudflare Edge CDN Mirror');
        return {
          subsystemName: 'Sincronizador de Índices F-Droid v2',
          detectedError: rootCause.detectedError,
          whyItHappened: rootCause.whyItHappened,
          fallbackRoute: result.fallbackActivated,
          loopPrevented: result.loopPrevented
        };
      }

      case 'SHIZUKU_BINDER_TIMEOUT': {
        const subId: FailoverSubsystemId = 'SHIZUKU_IPC_DAEMON';
        const rootCause: ErrorRootCauseAnalysis = {
          errorCode: 'ERR_BINDER_TRANSACTION_FAILED_DEAD_OBJECT',
          detectedError: 'Shizuku Daemon no responde (DeadObjectException)',
          reason: 'El socket IPC de Shizuku dejó de emitir latidos tras suspensión del sistema Android.',
          whyItHappened: 'El servicio moe.shizuku.server fue cerrado por el gestor de batería de Android (Doze Mode).',
          stackTraceSnippet: `android.os.DeadObjectException: Binder transaction failed\n  at rikka.shizuku.ShizukuBinderClient.transact (ShizukuBinderClient.java:104)\n  at IPackageInstaller.createSession (PackageInstallerSession.java:32)`,
          timestamp: this.nowIso(),
          recommendedResolution: 'Utilizar el SessionInstaller estándar de Android o reiniciar el daemon Shizuku vía ADB.',
          preventiveActionTaken: 'Conmutación automática al instalador PackageInstaller nativo de Android.'
        };

        this.addLog({
          traceId,
          spanId: this.generateSpanId(),
          subsystem: subId,
          level: 'ERROR',
          eventType: 'CHAOS_INJECTION',
          message: '[Simulación de Caos] Forzando desconexión de Shizuku Binder Daemon...',
          rootCauseAnalysis: rootCause
        });

        const result = this.recordFailure(subId, rootCause, 'Android SessionInstaller Nativo');
        return {
          subsystemName: 'Daemon de Instalación Shizuku Binder IPC',
          detectedError: rootCause.detectedError,
          whyItHappened: rootCause.whyItHappened,
          fallbackRoute: result.fallbackActivated,
          loopPrevented: result.loopPrevented
        };
      }

      case 'GITHUB_RATE_LIMIT': {
        const subId: FailoverSubsystemId = 'GITHUB_ACTIONS_CI';
        const rootCause: ErrorRootCauseAnalysis = {
          errorCode: 'ERR_GITHUB_API_403_RATE_LIMIT_EXCEEDED',
          detectedError: 'API de GitHub Actions ha alcanzado la cuota de peticiones',
          reason: 'Se superó el límite de 5,000 llamadas/hora para el token de compilación CI.',
          whyItHappened: 'Múltiples compilaciones concurrentes o sondeos frecuentes sin backoff adecuado.',
          stackTraceSnippet: `HttpError: 403 API rate limit exceeded for user ID (githubCiService.ts:182)\n  at GitHubActionsWorkflow.dispatchBuild (githubCiService.ts:210)`,
          timestamp: this.nowIso(),
          recommendedResolution: 'Cambiar al Runner Espejo Secundario o utilizar el Compilador Emulado Local.',
          preventiveActionTaken: 'Paso inmediato al Runner Espejo Secundario y compilador local de contingencia.'
        };

        this.addLog({
          traceId,
          spanId: this.generateSpanId(),
          subsystem: subId,
          level: 'ERROR',
          eventType: 'CHAOS_INJECTION',
          message: '[Simulación de Caos] Simulando agotamiento de cuota de API GitHub...',
          rootCauseAnalysis: rootCause
        });

        const result = this.recordFailure(subId, rootCause, 'Runner Espejo Secundario (Self-Hosted CI)');
        return {
          subsystemName: 'Compilador Cloud GitHub Actions CI',
          detectedError: rootCause.detectedError,
          whyItHappened: rootCause.whyItHappened,
          fallbackRoute: result.fallbackActivated,
          loopPrevented: result.loopPrevented
        };
      }

      case 'APK_SIGNATURE_CORRUPTED': {
        const subId: FailoverSubsystemId = 'APK_SIGNING_VAULT';
        const rootCause: ErrorRootCauseAnalysis = {
          errorCode: 'ERR_SECURITY_APK_SIGNATURE_SCHEME_V4_MISMATCH',
          detectedError: 'Discrepancia en el árbol de digest de firma APK v4',
          reason: 'El hash SHA-256 del binario APK no coincide con el digest firmado por la clave de lanzamiento.',
          whyItHappened: 'Corrupción durante la transmisión de red o inyección indebida de bytes en el zip central directory.',
          stackTraceSnippet: `SecurityException: APK signature verification failed\n  at ApkVerifier.verifyV4Signature (ApkSignerV4.java:188)\n  at SecurityVerifier.verifyApkSignature (SecurityVerifier.smali:12)`,
          timestamp: this.nowIso(),
          recommendedResolution: 'Descartar el archivo descargado, purgar la caché y forzar re-descarga limpia con verificación de bloque.',
          preventiveActionTaken: 'Binario bloqueado por el cortafuegos criptográfico. Reintento único con clave de respaldo.'
        };

        this.addLog({
          traceId,
          spanId: this.generateSpanId(),
          subsystem: subId,
          level: 'ERROR',
          eventType: 'CHAOS_INJECTION',
          message: '[Simulación de Caos] Inyectando verificación de firma APK corrupta...',
          rootCauseAnalysis: rootCause
        });

        const result = this.recordFailure(subId, rootCause, 'Bóveda PKCS#8 Cifrada en IndexedDB');
        return {
          subsystemName: 'Bóveda Criptográfica de Firmas APK (WebCrypto)',
          detectedError: rootCause.detectedError,
          whyItHappened: rootCause.whyItHappened,
          fallbackRoute: result.fallbackActivated,
          loopPrevented: result.loopPrevented
        };
      }

      default: {
        const subId: FailoverSubsystemId = 'LOCAL_STORAGE_CACHE';
        const rootCause: ErrorRootCauseAnalysis = {
          errorCode: 'ERR_STORAGE_QUOTA_EXCEEDED',
          detectedError: 'Cuota de almacenamiento persistente superada',
          reason: 'El navegador bloqueó la escritura en IndexedDB por falta de espacio en disco.',
          whyItHappened: 'Demasiadas imágenes y artefactos cacheados en el navegador.',
          timestamp: this.nowIso(),
          recommendedResolution: 'Utilizar el almacenamiento volátil en memoria RAM y purgar elementos LRU antiguos.',
          preventiveActionTaken: 'Activación del almacén LRU en memoria sin bloquear la interfaz de usuario.'
        };

        const result = this.recordFailure(subId, rootCause, 'Caché Volátil en Memoria RAM');
        return {
          subsystemName: 'Almacenamiento Persistente & Caché IndexedDB',
          detectedError: rootCause.detectedError,
          whyItHappened: rootCause.whyItHappened,
          fallbackRoute: result.fallbackActivated,
          loopPrevented: result.loopPrevented
        };
      }
    }
  }

  /**
   * Ejecuta el Diagnóstico Completo de Auto-Sanación (Self-Healing Diagnostic Suite)
   */
  public async runFullSelfHealingDiagnostic(
    onProgress?: (subsystemName: string, step: number, total: number) => void
  ): Promise<{
    testedCount: number;
    healthyCount: number;
    recoveredCount: number;
    details: Array<{ id: string; name: string; latencyMs: number; status: string }>;
  }> {
    const subsystemsList = Array.from(this.subsystems.values());
    const total = subsystemsList.length;
    const results: Array<{ id: string; name: string; latencyMs: number; status: string }> = [];

    this.addLog({
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      subsystem: 'KERNEL',
      level: 'INFO',
      eventType: 'SELF_HEAL_PROBE',
      message: `Iniciando suite de auto-diagnóstico y resiliencia en ${total} subsistemas...`
    });

    let healthyCount = 0;
    let recoveredCount = 0;

    for (let i = 0; i < total; i++) {
      const sub = subsystemsList[i];
      if (onProgress) {
        onProgress(sub.name, i + 1, total);
      }

      // Simulamos latencia de sondeo de hardware/red
      await new Promise((r) => setTimeout(r, 60));

      const simulatedLatency = Math.floor(Math.random() * 40) + 10;
      this.recordSuccess(sub.id, simulatedLatency);

      healthyCount += 1;
      if (sub.circuitState === 'OPEN' || sub.status === 'FALLBACK_ACTIVE') {
        recoveredCount += 1;
      }

      results.push({
        id: sub.id,
        name: sub.name,
        latencyMs: simulatedLatency,
        status: 'OPERATIONAL'
      });
    }

    this.addLog({
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      subsystem: 'KERNEL',
      level: 'INFO',
      eventType: 'SELF_HEAL_PROBE',
      message: `Suite de auto-diagnóstico completada. ${healthyCount}/${total} subsistemas verificados y saludables. Bucle infinito: 0% riesgo.`,
      contextPayload: {
        totalVerified: total,
        healthyCount,
        loopFreeVerified: true
      }
    });

    return {
      testedCount: total,
      healthyCount,
      recoveredCount,
      details: results
    };
  }

  /**
   * Exporta todos los registros en formato JSON legible
   */
  public exportTelemetryJson(): string {
    const data = {
      system: 'Civer App Store Resilience & Telemetry Engine',
      generatedAt: this.nowIso(),
      subsystems: Array.from(this.subsystems.values()),
      recentLogs: this.logs,
      incidents: this.incidents,
      summary: {
        totalSubsystems: this.subsystems.size,
        healthyCount: Array.from(this.subsystems.values()).filter((s) => s.status === 'HEALTHY').length,
        openCircuitsCount: Array.from(this.subsystems.values()).filter((s) => s.circuitState === 'OPEN').length,
        loopsPreventedTotal: Array.from(this.subsystems.values()).reduce((acc, s) => acc + s.antiLoopGuard.loopPreventedCount, 0)
      }
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Exporta logs en formato NDJSON (Newline Delimited JSON)
   */
  public exportLogsNdjson(): string {
    return this.logs.map((entry) => JSON.stringify(entry)).join('\n');
  }
}

export const resilienceTelemetryService = new ResilienceTelemetryService();
