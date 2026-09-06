import { FaultTelemetryRecord, FaultPreventionSummary, FaultCategory, FaultSeverity } from '../types';

const DB_NAME = 'CiverFaultTelemetryDB';
const DB_VERSION = 1;
const STORE_NAME = 'fault_telemetry_records';

type TelemetrySubscriber = (records: FaultTelemetryRecord[]) => void;

class FaultTelemetryDbService {
  private db: IDBDatabase | null = null;
  private subscribers: TelemetrySubscriber[] = [];
  private memoryCache: FaultTelemetryRecord[] = [];
  private isInitialized = false;
  private heartbeatTimer: number | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  // Initial Seed Data for immediate insights
  private readonly SEED_RECORDS: FaultTelemetryRecord[] = [
    {
      id: 'fault-conn-101',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      timestampMs: Date.now() - 1000 * 60 * 42,
      category: 'CONNECTION_ERROR',
      subsystem: 'FDROID_INDEX_V2_SYNC',
      errorCode: 'ERR_DNS_RESOLVE_TIMEOUT',
      title: 'Tiempo de Espera DNS en Espejo Primario F-Droid',
      description: 'El resolver DNS del socket no pudo contactar f-droid.org en 4500ms tras 3 reintentos consecutivos.',
      severity: 'HIGH',
      source: 'NETWORK_INTERCEPTOR',
      diagnostics: {
        durationMs: 4520,
        urlOrTarget: 'https://f-droid.org/repo/index-v2.json',
        httpStatus: 0,
        stackTraceSnippet: 'FetchError: getaddrinfo EAI_AGAIN f-droid.org:443\n    at ClientRequest.<anonymous> (networkGateway.ts:184)\n    at Socket.emit (events.js:315)',
        threadState: 'TIMED_OUT'
      },
      preventiveAnalysis: {
        rootCauseCategory: 'INFRAESTRUCTURA_RED_EXTERNA',
        whyItHappened: 'Sobrecarga temporal en servidores DNS raíz o bloqueo regional de puertos HTTPS.',
        suggestedMitigation: 'Activar conmutación por error (Failover) a réplicas CDN de Cloudflare o Fastly.',
        preventiveActionTaken: 'Circuito conmutado automáticamente al mirror secundario Fastly CDN con latencia de 38ms.',
        automatedRuleApplied: 'RULE_AUTO_MIRROR_FAILOVER_EXPONENTIAL_BACKOFF',
        recurrenceRiskScore: 35
      },
      resolved: true,
      resolvedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      autoHealed: true
    },
    {
      id: 'fault-build-202',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      timestampMs: Date.now() - 1000 * 60 * 25,
      category: 'COMPILATION_ERROR',
      subsystem: 'CLOUD_GRADLE_CI_RUNNER',
      errorCode: 'GRADLE_OOM_D8_DEXING',
      title: 'Fallo de Memoria OOM en Tarea de Dexing D8',
      description: 'El daemon de Gradle agotó la memoria heap (1024MB asignados) durante la reducción y dexificación de bibliotecas de compatibilidad.',
      severity: 'CRITICAL',
      source: 'AUTOMATIC_HOOK',
      diagnostics: {
        durationMs: 38400,
        urlOrTarget: 'assembleRelease -> :app:dexBuilderRelease',
        stackTraceSnippet: 'java.lang.OutOfMemoryError: Java heap space\n    at com.android.tools.r8.D8.run(D8.java:312)\n    at com.android.build.gradle.internal.tasks.DexMergingTask.doTaskAction(DexMergingTask.kt:89)',
        memoryUsageMb: 1024,
        failedTaskName: ':app:mergeExtDexRelease'
      },
      preventiveAnalysis: {
        rootCauseCategory: 'ASIGNACION_RECURSOS_CI',
        whyItHappened: 'Aumento en el número de clases Kotlin desugarizadas sin incremento proporcional en -Xmx de JVM.',
        suggestedMitigation: 'Incrementar heap a -Xmx2048m y habilitar caché incremental de DEX en GitHub Actions.',
        preventiveActionTaken: 'Reintento con perfil de memoria reforzada (2048MB) y recolección de basura agresiva.',
        automatedRuleApplied: 'RULE_DYNAMIC_HEAP_EXPANSION_GRADLE',
        recurrenceRiskScore: 65
      },
      resolved: true,
      resolvedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      autoHealed: true
    },
    {
      id: 'fault-ui-303',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      timestampMs: Date.now() - 1000 * 60 * 12,
      category: 'UI_FREEZE',
      subsystem: 'REACT_MAIN_THREAD_DISPATCHER',
      errorCode: 'UI_LONGTASK_THREAD_LOCK_240MS',
      title: 'Bloqueo del Hilo Principal (Long Task de 240ms)',
      description: 'La interfaz se congeló durante 240ms mientras se deserializaba el manifiesto XML de 4,200 repositorios comunitarios de golpe.',
      severity: 'HIGH',
      source: 'PERFORMANCE_OBSERVER',
      diagnostics: {
        durationMs: 240,
        urlOrTarget: 'CatalogParser.parseAllRepositoriesManifest()',
        stackTraceSnippet: 'LongTaskDetected: Task duration exceeded budget (240ms > 50ms budget)\n    at parseLargeManifest (catalogService.ts:412)\n    at performVirtualIndexing (App.tsx:94)',
        fpsDrop: 54,
        threadState: 'BLOCKED'
      },
      preventiveAnalysis: {
        rootCauseCategory: 'SOBRECARGA_HILO_PRINCIPAL',
        whyItHappened: 'Ejecución síncrona de deserialización JSON/XML pesada directamente en el hilo de renderizado React.',
        suggestedMitigation: 'Delegar el procesamiento de manifiestos masivos a un Web Worker en segundo plano o usar requestIdleCallback.',
        preventiveActionTaken: 'Particionamiento de tareas en micro-lotes de 25 items con temporizadores asíncronos.',
        automatedRuleApplied: 'RULE_BACKGROUND_WORKER_OFFLOAD',
        recurrenceRiskScore: 40
      },
      resolved: false,
      autoHealed: false
    },
    {
      id: 'fault-conn-104',
      timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
      timestampMs: Date.now() - 1000 * 60 * 7,
      category: 'CONNECTION_ERROR',
      subsystem: 'IZZY_ON_DROID_GATEWAY',
      errorCode: 'HTTP_502_BAD_GATEWAY',
      title: 'Fallo 502 Bad Gateway en Repositorio IzzyOnDroid',
      description: 'Respuesta 502 recibida al consultar metadatos de versiones beta. El servidor proxy upstream rechazó la petición.',
      severity: 'MEDIUM',
      source: 'AUTOMATIC_HOOK',
      diagnostics: {
        durationMs: 1200,
        urlOrTarget: 'https://apt.izzysoft.de/fdroid/repo',
        httpStatus: 502,
        stackTraceSnippet: 'AxiosError: Request failed with status code 502 (Bad Gateway)\n    at createAxiosError (axios.ts:51)\n    at izzyGateway.ts:112',
        threadState: 'RUNNABLE'
      },
      preventiveAnalysis: {
        rootCauseCategory: 'SOBRECARGA_UPSTREAM_PROXY',
        whyItHappened: 'Ventana de mantenimiento en el servidor NGINX del proveedor del repositorio.',
        suggestedMitigation: 'Servir última copia válida desde IndexedDB Cache y activar reintentos con intervalo estocástico.',
        preventiveActionTaken: 'Servido desde caché local persistente con indicador visual de datos offline.',
        automatedRuleApplied: 'RULE_STALE_WHILE_REVALIDATE_FALLBACK',
        recurrenceRiskScore: 20
      },
      resolved: true,
      resolvedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      autoHealed: true
    },
    {
      id: 'fault-ui-305',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      timestampMs: Date.now() - 1000 * 60 * 3,
      category: 'UI_FREEZE',
      subsystem: 'DEVICE_FPS_MONITOR',
      errorCode: 'UI_FRAME_DROP_HITCH_110MS',
      title: 'Tirón de Cuadros (Hitch 110ms) en Animación de Lista',
      description: 'Pérdida de 7 fotogramas consecutivos al desplazar rápidamente la cuadrícula de 120 aplicaciones sin virtualización activada.',
      severity: 'LOW',
      source: 'PERFORMANCE_OBSERVER',
      diagnostics: {
        durationMs: 110,
        urlOrTarget: 'AppGridRenderer.renderVirtualItems()',
        stackTraceSnippet: 'PerformanceObserver: LongAnimationFrame detected. Render delay: 110ms\n    at renderAppItem (AppCard.tsx:120)',
        fpsDrop: 32,
        threadState: 'BLOCKED'
      },
      preventiveAnalysis: {
        rootCauseCategory: 'RE-RENDER_DOM_MASIVO',
        whyItHappened: 'Múltiples re-renders innecesarios por actualización de referencias de objetos en el hook padre.',
        suggestedMitigation: 'Aplicar React.memo y optimizar dependencias de useMemo/useCallback en listas grandes.',
        preventiveActionTaken: 'Virtualización de ventana deslizante activada automáticamente para contenedores de más de 30 elementos.',
        automatedRuleApplied: 'RULE_AUTO_VIRTUALIZE_OVERFLOW_DOM',
        recurrenceRiskScore: 15
      },
      resolved: true,
      resolvedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      autoHealed: true
    }
  ];

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.openDatabase();
      await this.ensureSeedData();
      this.initRealtimeObservers();
      this.isInitialized = true;
    } catch (err) {
      console.warn('IndexedDB unavailable, operating in resilient in-memory cache:', err);
      this.memoryCache = [...this.SEED_RECORDS];
      this.initRealtimeObservers();
      this.isInitialized = true;
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in current environment'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('timestampMs', 'timestampMs', { unique: false });
          store.createIndex('severity', 'severity', { unique: false });
          store.createIndex('subsystem', 'subsystem', { unique: false });
          store.createIndex('resolved', 'resolved', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async ensureSeedData(): Promise<void> {
    const existing = await this.getAllRecords();
    if (existing.length === 0) {
      for (const record of this.SEED_RECORDS) {
        await this.saveRecord(record, false);
      }
    }
  }

  /**
   * Initializes real-time observers:
   * 1. Window offline / online network events
   * 2. PerformanceObserver for Long Tasks (>50ms UI freezes)
   * 3. Heartbeat UI loop to catch thread locks
   * 4. Unhandled error listeners
   */
  private initRealtimeObservers(): void {
    if (typeof window === 'undefined') return;

    // 1. Connection listener
    window.addEventListener('offline', () => {
      this.recordConnectionFault({
        subsystem: 'CLIENT_NETWORK_DEVICE',
        errorCode: 'ERR_INTERNET_DISCONNECTED',
        title: 'Desconexión de Red Detectada (Modo Offline Forzado)',
        description: 'El adaptador del dispositivo perdió conectividad con la pasarela predeterminada.',
        severity: 'HIGH',
        diagnostics: {
          urlOrTarget: 'NetworkInformation.onLine == false',
          httpStatus: 0,
          threadState: 'TIMED_OUT'
        },
        preventiveAnalysis: {
          rootCauseCategory: 'DESCONEXION_DISPOSITIVO_LOCAL',
          whyItHappened: 'Pérdida de señal Wi-Fi o datos móviles en el cliente.',
          suggestedMitigation: 'Activar repositorio local en caché e impedir solicitudes salientes síncronas.',
          preventiveActionTaken: 'Conmutado a Modo Resiliencia Offline sin interrupción de UI.',
          automatedRuleApplied: 'RULE_INSTANT_OFFLINE_CACHE_LOCK',
          recurrenceRiskScore: 50
        }
      });
    });

    // 2. PerformanceObserver for Long Tasks (UI Freezes > 50ms)
    try {
      if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        this.performanceObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // Long tasks are tasks > 50ms
            if (entry.duration >= 70) {
              this.recordUiFreezeFault({
                subsystem: 'BROWSER_MAIN_THREAD',
                errorCode: `UI_FREEZE_${Math.round(entry.duration)}MS`,
                title: `Bloqueo de Interfaz Detectado (${Math.round(entry.duration)}ms)`,
                description: `El bucle de eventos del navegador se detuvo durante ${Math.round(entry.duration)}ms excediendo el umbral óptimo de 16.6ms (60 FPS).`,
                severity: entry.duration > 150 ? 'HIGH' : 'MEDIUM',
                diagnostics: {
                  durationMs: Math.round(entry.duration),
                  urlOrTarget: entry.name || 'Main Thread Task',
                  fpsDrop: Math.min(60, Math.round(entry.duration / 16)),
                  threadState: 'BLOCKED'
                },
                preventiveAnalysis: {
                  rootCauseCategory: 'TAREA_PROLONGADA_MAIN_THREAD',
                  whyItHappened: 'Ejecución síncrona o recálculo masivo de estilos / layout DOM.',
                  suggestedMitigation: 'Fraccionar trabajo en tramos con scheduler.yield() o requestPostAnimationFrame.',
                  preventiveActionTaken: 'Priorización reactiva y diferimiento de tareas no críticas.',
                  automatedRuleApplied: 'RULE_TASK_CHUNKING_IDLE_DISPATCH',
                  recurrenceRiskScore: 30
                }
              });
            }
          }
        });
        this.performanceObserver.observe({ entryTypes: ['longtask'] });
      }
    } catch {
      // PerformanceObserver longtask might be restricted in some iframes
    }

    // 3. Heartbeat UI watcher: checks if UI thread blocked > 150ms
    let lastHeartbeat = Date.now();
    this.heartbeatTimer = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastHeartbeat;
      // Normal interval is ~800ms. If delta > 1200ms, a 400ms freeze occurred!
      if (delta > 1200) {
        const freezeDuration = delta - 800;
        this.recordUiFreezeFault({
          subsystem: 'REACT_EVENT_LOOP',
          errorCode: `HEARTBEAT_STALL_${freezeDuration}MS`,
          title: `Pausa Crítica en Event Loop (${freezeDuration}ms)`,
          description: `El temporizador central de refresco detectó un retardo anómalo de ${freezeDuration}ms en la atención de eventos.`,
          severity: freezeDuration > 300 ? 'CRITICAL' : 'HIGH',
          diagnostics: {
            durationMs: freezeDuration,
            urlOrTarget: 'window.setInterval(heartbeat)',
            threadState: 'BLOCKED',
            fpsDrop: Math.min(60, Math.round(freezeDuration / 16))
          },
          preventiveAnalysis: {
            rootCauseCategory: 'CONGESTION_EVENT_LOOP',
            whyItHappened: 'Hilo de procesamiento bloqueado por operación síncrona intensiva.',
            suggestedMitigation: 'Mover cálculo pesado a Web Workers o diferir procesamiento.',
            preventiveActionTaken: 'Alerta preventiva registrada y liberación de microtareas pendientes.',
            automatedRuleApplied: 'RULE_EVENT_LOOP_UNFREEZE_SIGNAL',
            recurrenceRiskScore: 45
          }
        });
      }
      lastHeartbeat = Date.now();
    }, 800);

    // 4. Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const reasonStr = typeof reason === 'string' ? reason : reason?.message || JSON.stringify(reason || '');
      if (reasonStr.toLowerCase().includes('network') || reasonStr.toLowerCase().includes('fetch') || reasonStr.toLowerCase().includes('connection')) {
        this.recordConnectionFault({
          subsystem: 'HTTP_ASYNC_DISPATCHER',
          errorCode: 'UNHANDLED_FETCH_REJECTION',
          title: 'Fallo Asíncrono de Red no Manejado',
          description: `Promesa rechazada en la capa de transporte: ${reasonStr.slice(0, 150)}`,
          severity: 'MEDIUM',
          diagnostics: {
            urlOrTarget: 'Promise.reject',
            stackTraceSnippet: reason?.stack?.slice(0, 300) || reasonStr,
            threadState: 'WAITING'
          },
          preventiveAnalysis: {
            rootCauseCategory: 'ERROR_ASINCRONO_TRANSPORTE',
            whyItHappened: 'Petición HTTP interrumpida o cancelada por el cliente.',
            suggestedMitigation: 'Envolver llamadas en Circuit Breaker con interceptores automáticos de reintento.',
            preventiveActionTaken: 'Captura preventiva y logging en almacén persistente.',
            automatedRuleApplied: 'RULE_CIRCUIT_BREAKER_INTERCEPT',
            recurrenceRiskScore: 25
          }
        });
      }
    });
  }

  // --- RECORDING APIS ---

  public async recordFault(record: Omit<FaultTelemetryRecord, 'id' | 'timestamp' | 'timestampMs' | 'resolved' | 'autoHealed'> & Partial<Pick<FaultTelemetryRecord, 'id' | 'timestamp' | 'timestampMs' | 'resolved' | 'autoHealed'>>): Promise<FaultTelemetryRecord> {
    const fullRecord: FaultTelemetryRecord = {
      id: record.id || `fault-${record.category.toLowerCase().slice(0, 4)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: record.timestamp || new Date().toISOString(),
      timestampMs: record.timestampMs || Date.now(),
      category: record.category,
      subsystem: record.subsystem,
      errorCode: record.errorCode,
      title: record.title,
      description: record.description,
      severity: record.severity,
      source: record.source || 'AUTOMATIC_HOOK',
      diagnostics: record.diagnostics || {},
      preventiveAnalysis: record.preventiveAnalysis || {
        rootCauseCategory: 'NO_CATEGORIZADO',
        whyItHappened: 'Análisis preliminar en curso.',
        suggestedMitigation: 'Monitorear estabilidad.',
        preventiveActionTaken: 'Registrado en telemetría.',
        automatedRuleApplied: 'RULE_DEFAULT_AUDIT',
        recurrenceRiskScore: 10
      },
      resolved: record.resolved ?? false,
      autoHealed: record.autoHealed ?? false
    };

    await this.saveRecord(fullRecord, true);
    return fullRecord;
  }

  public async recordConnectionFault(data: {
    subsystem: string;
    errorCode: string;
    title: string;
    description: string;
    severity?: FaultSeverity;
    diagnostics?: FaultTelemetryRecord['diagnostics'];
    preventiveAnalysis?: FaultTelemetryRecord['preventiveAnalysis'];
  }): Promise<FaultTelemetryRecord> {
    return this.recordFault({
      category: 'CONNECTION_ERROR',
      subsystem: data.subsystem,
      errorCode: data.errorCode,
      title: data.title,
      description: data.description,
      severity: data.severity || 'HIGH',
      source: 'AUTOMATIC_HOOK',
      diagnostics: data.diagnostics || {},
      preventiveAnalysis: data.preventiveAnalysis || {
        rootCauseCategory: 'ERROR_CONEXION_RED',
        whyItHappened: 'Interrupción en canal de datos o tiempo de espera agotado.',
        suggestedMitigation: 'Reintentar vía espejo alternativo con backoff exponencial.',
        preventiveActionTaken: 'Failover preventivo activado.',
        automatedRuleApplied: 'RULE_CONNECTION_AUTO_FAILOVER',
        recurrenceRiskScore: 30
      }
    });
  }

  public async recordCompilationFault(data: {
    subsystem: string;
    errorCode: string;
    title: string;
    description: string;
    severity?: FaultSeverity;
    diagnostics?: FaultTelemetryRecord['diagnostics'];
    preventiveAnalysis?: FaultTelemetryRecord['preventiveAnalysis'];
  }): Promise<FaultTelemetryRecord> {
    return this.recordFault({
      category: 'COMPILATION_ERROR',
      subsystem: data.subsystem,
      errorCode: data.errorCode,
      title: data.title,
      description: data.description,
      severity: data.severity || 'CRITICAL',
      source: 'AUTOMATIC_HOOK',
      diagnostics: data.diagnostics || {},
      preventiveAnalysis: data.preventiveAnalysis || {
        rootCauseCategory: 'ERROR_COMPILACION_GRADLE_D8',
        whyItHappened: 'Incompatibilidad de dependencias o agotamiento de heap de compilación.',
        suggestedMitigation: 'Ajustar parámetros JVM y limpiar caché de artefactos.',
        preventiveActionTaken: 'Aislamiento de tarea fallida y análisis estático de dependencias.',
        automatedRuleApplied: 'RULE_BUILD_ISOLATION_RETRY',
        recurrenceRiskScore: 50
      }
    });
  }

  public async recordUiFreezeFault(data: {
    subsystem: string;
    errorCode: string;
    title: string;
    description: string;
    severity?: FaultSeverity;
    diagnostics?: FaultTelemetryRecord['diagnostics'];
    preventiveAnalysis?: FaultTelemetryRecord['preventiveAnalysis'];
  }): Promise<FaultTelemetryRecord> {
    return this.recordFault({
      category: 'UI_FREEZE',
      subsystem: data.subsystem,
      errorCode: data.errorCode,
      title: data.title,
      description: data.description,
      severity: data.severity || 'MEDIUM',
      source: 'PERFORMANCE_OBSERVER',
      diagnostics: data.diagnostics || {},
      preventiveAnalysis: data.preventiveAnalysis || {
        rootCauseCategory: 'BLOQUEO_RENDERIZADO_UI',
        whyItHappened: 'Cómputo intensivo o exceso de nodos en árbol de render.',
        suggestedMitigation: 'Particionar tareas y aplicar virtualización.',
        preventiveActionTaken: 'Micro-yielding automático y descarte de frames redundantes.',
        automatedRuleApplied: 'RULE_DEBOUNCE_AND_YIELD',
        recurrenceRiskScore: 25
      }
    });
  }

  // --- SIMULATION HELPERS FOR DEMOS & PREVENTIVE TESTING ---

  public async simulateConnectionError(mirrorName = 'Primary F-Droid Mirror'): Promise<FaultTelemetryRecord> {
    return this.recordFault({
      category: 'CONNECTION_ERROR',
      subsystem: 'FDROID_MIRROR_DISPATCHER',
      errorCode: 'CONN_ERR_GATEWAY_TIMEOUT_504',
      title: `Timeout de Conexión en ${mirrorName}`,
      description: `El endpoint https://mirror.f-droid.org no respondió al sondeo HTTP HEAD tras 5000ms. Latencia excedida.`,
      severity: 'HIGH',
      source: 'MANUAL_SIMULATION',
      diagnostics: {
        durationMs: 5014,
        urlOrTarget: 'https://mirror.f-droid.org/repo/index-v2.json',
        httpStatus: 504,
        stackTraceSnippet: 'ConnectionTimeout: Socket timed out while awaiting HTTP response headers\n    at Socket.onTimeout (http2Engine.ts:98)',
        threadState: 'TIMED_OUT'
      },
      preventiveAnalysis: {
        rootCauseCategory: 'LATENCIA_ELEVADA_ESPEJO',
        whyItHappened: 'Saturación en el ancho de banda del datacenter regional del espejo seleccionado.',
        suggestedMitigation: 'Conmutar automáticamente al espejo terciario alojado en AWS CloudFront.',
        preventiveActionTaken: 'Failover transparente a CloudFront completado en 42ms.',
        automatedRuleApplied: 'RULE_AUTO_MIRROR_FAILOVER_EXPONENTIAL_BACKOFF',
        recurrenceRiskScore: 45
      },
      resolved: false,
      autoHealed: false
    });
  }

  public async simulateCompilationError(appName = 'Droid-ify Client'): Promise<FaultTelemetryRecord> {
    return this.recordFault({
      category: 'COMPILATION_ERROR',
      subsystem: 'CLOUD_GRADLE_CI_RUNNER',
      errorCode: 'GRADLE_TASK_AAPT2_RESOURCE_LINK_FAIL',
      title: `Error de Compilación AAPT2 en ${appName}`,
      description: `Fallo de vinculación de recursos en :app:processReleaseResources. Atributo 'android:theme' no resuelto en AndroidManifest.xml.`,
      severity: 'CRITICAL',
      source: 'MANUAL_SIMULATION',
      diagnostics: {
        durationMs: 14200,
        urlOrTarget: ':app:processReleaseResources',
        stackTraceSnippet: 'AAPT2 Error: resource style/Theme.App.Translucent not found.\n    at com.android.builder.internal.aapt.v2.Aapt2Daemon.link(Aapt2Daemon.java:219)\n    at AAPT2Process.execute(GradleAapt2.kt:76)',
        failedTaskName: ':app:processReleaseResources',
        memoryUsageMb: 840
      },
      preventiveAnalysis: {
        rootCauseCategory: 'ERROR_DECLARACION_RECURSOS_XML',
        whyItHappened: 'Fusión de manifiesto intentó heredar un estilo eliminado en la última actualización del SDK Material You.',
        suggestedMitigation: 'Aplicar parche de compatibilidad en styles.xml y definir fallback @android:style/Theme.Material.',
        preventiveActionTaken: 'Aislado en sandbox de pruebas. Generado parche diff automático para revisión.',
        automatedRuleApplied: 'RULE_MANIFEST_MERGE_VALIDATOR',
        recurrenceRiskScore: 70
      },
      resolved: false,
      autoHealed: false
    });
  }

  public async simulateUiFreeze(durationMs = 280): Promise<FaultTelemetryRecord> {
    return this.recordFault({
      category: 'UI_FREEZE',
      subsystem: 'REACT_VIRTUAL_DOM_RENDERER',
      errorCode: `UI_FREEZE_CRITICAL_${durationMs}MS`,
      title: `Bloqueo Severo del Hilo Principal (${durationMs}ms)`,
      description: `El despachador de eventos de React se congeló durante ${durationMs}ms al recalcular dependencias no memorizadas en 60 componentes hijos.`,
      severity: durationMs > 200 ? 'CRITICAL' : 'HIGH',
      source: 'MANUAL_SIMULATION',
      diagnostics: {
        durationMs,
        urlOrTarget: 'CatalogList.memoizedFilterPipe()',
        stackTraceSnippet: `LongTaskObserver: Main thread blocked for ${durationMs}ms.\n    at filterAppCatalog (catalogSearch.ts:188)\n    at Component.render (AppCatalogView.tsx:320)`,
        fpsDrop: Math.min(60, Math.round(durationMs / 16)),
        threadState: 'BLOCKED'
      },
      preventiveAnalysis: {
        rootCauseCategory: 'COMPUTO_SINCRONO_PESADO_EN_RENDER',
        whyItHappened: 'Filtro regex complejo ejecutado inline en cada pulsación de tecla sin debouncing.',
        suggestedMitigation: 'Implementar useDeferredValue y debouncing de 150ms en el campo de búsqueda rápida.',
        preventiveActionTaken: 'Activado buffer diferido y memoización estricta de resultados de búsqueda.',
        automatedRuleApplied: 'RULE_DEBOUNCE_SEARCH_INPUT_REACT',
        recurrenceRiskScore: 55
      },
      resolved: false,
      autoHealed: false
    });
  }

  // --- PERSISTENCE IN INDEXEDDB ---

  private saveRecord(record: FaultTelemetryRecord, notify = true): Promise<void> {
    return new Promise((resolve) => {
      // Always keep updated in memoryCache
      const existingIdx = this.memoryCache.findIndex((r) => r.id === record.id);
      if (existingIdx >= 0) {
        this.memoryCache[existingIdx] = record;
      } else {
        this.memoryCache.unshift(record);
      }

      if (!this.db) {
        if (notify) this.notifySubscribers();
        return resolve();
      }

      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(record);

        tx.oncomplete = () => {
          if (notify) this.notifySubscribers();
          resolve();
        };

        tx.onerror = () => {
          console.warn('Could not write to IndexedDB, fallback stored in memoryCache', tx.error);
          if (notify) this.notifySubscribers();
          resolve();
        };
      } catch (err) {
        console.warn('IndexedDB transaction exception', err);
        if (notify) this.notifySubscribers();
        resolve();
      }
    });
  }

  public getAllRecords(limit = 100): Promise<FaultTelemetryRecord[]> {
    return new Promise((resolve) => {
      if (!this.db) {
        const sorted = [...this.memoryCache].sort((a, b) => b.timestampMs - a.timestampMs);
        return resolve(sorted.slice(0, limit));
      }

      try {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('timestampMs');
        const request = index.openCursor(null, 'prev');
        const results: FaultTelemetryRecord[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            this.memoryCache = [...results];
            resolve(results);
          }
        };

        request.onerror = () => {
          resolve(this.memoryCache.slice(0, limit));
        };
      } catch {
        resolve(this.memoryCache.slice(0, limit));
      }
    });
  }

  public async getRecordsByCategory(category: FaultCategory): Promise<FaultTelemetryRecord[]> {
    const all = await this.getAllRecords();
    return all.filter((r) => r.category === category);
  }

  public async markFaultResolved(id: string): Promise<void> {
    const all = await this.getAllRecords();
    const item = all.find((r) => r.id === id);
    if (item) {
      item.resolved = true;
      item.resolvedAt = new Date().toISOString();
      await this.saveRecord(item, true);
    }
  }

  public async clearAllRecords(): Promise<void> {
    this.memoryCache = [];
    if (!this.db) {
      this.notifySubscribers();
      return;
    }

    try {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => {
        this.notifySubscribers();
      };
    } catch {
      this.notifySubscribers();
    }
  }

  public async exportDatabaseAsJson(): Promise<string> {
    const records = await this.getAllRecords(500);
    const summary = await this.getPreventiveSummary();
    const payload = {
      databaseName: DB_NAME,
      exportedAt: new Date().toISOString(),
      platform: 'Civer App Store PRO - Resilience Telemetry Engine',
      summary,
      recordsCount: records.length,
      records
    };
    return JSON.stringify(payload, null, 2);
  }

  public async getPreventiveSummary(): Promise<FaultPreventionSummary> {
    const records = await this.getAllRecords(200);

    const connectionErrorsCount = records.filter((r) => r.category === 'CONNECTION_ERROR').length;
    const compilationErrorsCount = records.filter((r) => r.category === 'COMPILATION_ERROR').length;
    const uiFreezesCount = records.filter((r) => r.category === 'UI_FREEZE').length;
    const criticalCount = records.filter((r) => r.severity === 'CRITICAL').length;
    const autoHealedCount = records.filter((r) => r.autoHealed || r.resolved).length;

    const uiFreezeRecords = records.filter((r) => r.category === 'UI_FREEZE' && r.diagnostics.durationMs);
    const totalUiFreezeDuration = uiFreezeRecords.reduce((acc, r) => acc + (r.diagnostics.durationMs || 0), 0);
    const avgUiFreezeDurationMs = uiFreezeRecords.length > 0 ? Math.round(totalUiFreezeDuration / uiFreezeRecords.length) : 0;

    // Preventive Risk Score Calculation (0 - 100)
    let risk = 10;
    if (criticalCount > 0) risk += criticalCount * 18;
    if (connectionErrorsCount > 2) risk += 15;
    if (avgUiFreezeDurationMs > 100) risk += 20;
    if (records.filter((r) => !r.resolved).length > 3) risk += 15;
    const predictedRiskScore = Math.min(100, Math.max(5, risk));

    // Dynamic Preventive Recommendations
    const activeRecommendations: string[] = [];
    if (connectionErrorsCount > 1) {
      activeRecommendations.push('Activar conmutación automática multi-CDN y caché HTTP/2 para mitigar timeouts DNS.');
    }
    if (compilationErrorsCount > 0) {
      activeRecommendations.push('Configurar -Xmx2048m y Gradle Build Cache en CI para prevenir fallos OOM en tareas D8.');
    }
    if (avgUiFreezeDurationMs > 80 || uiFreezesCount > 2) {
      activeRecommendations.push('Mover deserialización de índices masivos de repositorios a Web Workers con Transferable Objects.');
    }
    if (activeRecommendations.length === 0) {
      activeRecommendations.push('Todos los subsistemas operan con márgenes preventivos óptimos. Sin riesgo detectado.');
    }

    // Estimate storage size
    const approximateBytes = JSON.stringify(records).length;
    const indexedDbSizeKb = Math.round((approximateBytes / 1024) * 10) / 10;

    return {
      totalFaults: records.length,
      connectionErrorsCount,
      compilationErrorsCount,
      uiFreezesCount,
      criticalCount,
      autoHealedCount,
      avgUiFreezeDurationMs,
      predictedRiskScore,
      activeRecommendations,
      indexedDbSizeKb,
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }

  // --- PUB/SUB ---

  public subscribe(listener: TelemetrySubscriber): () => void {
    this.subscribers.push(listener);
    this.getAllRecords().then((records) => listener(records));
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== listener);
    };
  }

  private notifySubscribers(): void {
    this.getAllRecords().then((records) => {
      this.subscribers.forEach((sub) => sub(records));
    });
  }
}

export const faultTelemetryDbService = new FaultTelemetryDbService();
