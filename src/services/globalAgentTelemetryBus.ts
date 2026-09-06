export interface AgentActionLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  agentRole: 'ARCHITECT' | 'COMPILER' | 'SECURITY_AUDITOR' | 'REPO_SYNC' | 'ORCHESTRATOR' | 'COMMUNITY_BOT';
  actionType: 'MCP_TOOL_INVOCATION' | 'STATE_MUTATION' | 'CODE_INSPECTION' | 'CI_DISPATCH' | 'DECISION_RECORD' | 'CONTEXT_SYNC' | 'TELEMETRY_QUERY';
  targetResource: string;
  decisionRationale: string;
  payload?: Record<string, any>;
  resultSummary: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILURE' | 'BLOCKED';
  durationMs: number;
}

export interface AgentContextItem {
  key: string;
  ownerAgentId: string;
  value: any;
  updatedAt: string;
  scope: 'GLOBAL' | 'CI_PIPELINE' | 'CATALOG_AUDIT' | 'FAILOVER_MONITOR';
}

export interface ActiveAgentState {
  id: string;
  name: string;
  role: AgentActionLog['agentRole'];
  status: 'IDLE' | 'EXECUTING' | 'COLLABORATING' | 'AWAITING_INPUT';
  currentTask?: string;
  mcpConnection: {
    protocolVersion: string;
    endpoint: string;
    pingLatencyMs: number;
    authorizedTools: string[];
  };
  lastHeartbeat: string;
  actionsCount: number;
}

const INITIAL_AGENTS: ActiveAgentState[] = [
  {
    id: 'agent-orchestrator-01',
    name: 'Nexus Orchestrator V4',
    role: 'ORCHESTRATOR',
    status: 'EXECUTING',
    currentTask: 'Coordinando sincronización de espejos F-Droid V2 y cola persistente de CI',
    mcpConnection: {
      protocolVersion: '2024-11-05',
      endpoint: 'civer://mcp/v1/orchestrator',
      pingLatencyMs: 12,
      authorizedTools: ['list_catalog_apps', 'enqueue_ci_build', 'sync_fdroid_mirrors', 'get_fault_telemetry']
    },
    lastHeartbeat: new Date().toISOString(),
    actionsCount: 42
  },
  {
    id: 'agent-heuristic-auditor',
    name: 'Gradle Heuristics Auditor',
    role: 'SECURITY_AUDITOR',
    status: 'COLLABORATING',
    currentTask: 'Analizando estructura Kotlin DSL y Health Score de repositorios FOSS',
    mcpConnection: {
      protocolVersion: '2024-11-05',
      endpoint: 'civer://mcp/v1/heuristics',
      pingLatencyMs: 18,
      authorizedTools: ['analyze_repo_heuristics', 'list_catalog_apps']
    },
    lastHeartbeat: new Date().toISOString(),
    actionsCount: 89
  },
  {
    id: 'agent-ci-dispatcher',
    name: 'GitHub Actions Matrix CI Runner',
    role: 'COMPILER',
    status: 'IDLE',
    currentTask: 'En espera de nuevas tareas en la cola persistente de compilación',
    mcpConnection: {
      protocolVersion: '2024-11-05',
      endpoint: 'civer://mcp/v1/ci-runner',
      pingLatencyMs: 24,
      authorizedTools: ['enqueue_ci_build', 'get_ci_queue_status']
    },
    lastHeartbeat: new Date().toISOString(),
    actionsCount: 31
  },
  {
    id: 'agent-telemetry-sentry',
    name: 'Fault Telemetry Sentry',
    role: 'ARCHITECT',
    status: 'EXECUTING',
    currentTask: 'Monitoreando IndexedDB y registrando trazas forenses de resiliencia',
    mcpConnection: {
      protocolVersion: '2024-11-05',
      endpoint: 'civer://mcp/v1/telemetry',
      pingLatencyMs: 15,
      authorizedTools: ['get_fault_telemetry', 'list_catalog_apps']
    },
    lastHeartbeat: new Date().toISOString(),
    actionsCount: 56
  }
];

const INITIAL_JOURNAL: AgentActionLog[] = [
  {
    id: 'act-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    agentId: 'agent-orchestrator-01',
    agentName: 'Nexus Orchestrator V4',
    agentRole: 'ORCHESTRATOR',
    actionType: 'MCP_TOOL_INVOCATION',
    targetResource: 'mcp://tools/sync_fdroid_mirrors',
    decisionRationale: 'Sincronización periódica requerida para detectar nuevos release tags en repositorios oficiales de F-Droid.',
    payload: { mirrorId: 'mirror-1', protocol: 'Index-V2' },
    resultSummary: 'Índices descargados e integrados con éxito (34 paquetes actualizados).',
    status: 'SUCCESS',
    durationMs: 430
  },
  {
    id: 'act-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    agentId: 'agent-heuristic-auditor',
    agentName: 'Gradle Heuristics Auditor',
    agentRole: 'SECURITY_AUDITOR',
    actionType: 'CODE_INSPECTION',
    targetResource: 'github.com/whyorean/AuroraStore',
    decisionRationale: 'Auditoría automática de scripts de compilación Gradle Wrapper v8.5 y compatibilidad Android 15.',
    payload: { branch: 'master', hasKts: true, gradlewPresent: true },
    resultSummary: 'Health Score calculado: 98% (Calificación A+). Sin fallos de sintaxis.',
    status: 'SUCCESS',
    durationMs: 620
  },
  {
    id: 'act-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    agentId: 'agent-ci-dispatcher',
    agentName: 'GitHub Actions Matrix CI Runner',
    agentRole: 'COMPILER',
    actionType: 'CI_DISPATCH',
    targetResource: 'civer_persistent_ci_queue_v1',
    decisionRationale: 'Encolando compilación reproducible para Seal Audio/Video Downloader con prioridad HIGH.',
    payload: { appId: 'junkfood.clover.seal', priority: 'HIGH', task: ':app:assembleRelease' },
    resultSummary: 'Trabajo persistido en IndexedDB/LocalStorage con ID job-build-992.',
    status: 'SUCCESS',
    durationMs: 180
  },
  {
    id: 'act-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    agentId: 'agent-telemetry-sentry',
    agentName: 'Fault Telemetry Sentry',
    agentRole: 'ARCHITECT',
    actionType: 'CONTEXT_SYNC',
    targetResource: 'civer://context/failover_health',
    decisionRationale: 'Publicando estado de salud de los mirrors hacia el buffer compartido de agentes.',
    payload: { primaryMirrorAlive: true, fallbackLatencyMs: 82 },
    resultSummary: 'Buffer de contexto compartido actualizado para todos los agentes.',
    status: 'SUCCESS',
    durationMs: 95
  }
];

class GlobalAgentTelemetryBusService {
  private dbName = 'civer_agent_telemetry_db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isDbReady = false;
  private memoryJournal: AgentActionLog[] = [...INITIAL_JOURNAL];
  private memoryContext: Record<string, AgentContextItem> = {
    'ci_pipeline_active_jobs': {
      key: 'ci_pipeline_active_jobs',
      ownerAgentId: 'agent-ci-dispatcher',
      value: { activeCount: 1, pendingCount: 3, lastWorkerId: 'runner-gh-04' },
      updatedAt: new Date().toISOString(),
      scope: 'CI_PIPELINE'
    },
    'global_catalog_cache_version': {
      key: 'global_catalog_cache_version',
      ownerAgentId: 'agent-orchestrator-01',
      value: { version: '2026.09.06-v2', checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
      updatedAt: new Date().toISOString(),
      scope: 'GLOBAL'
    }
  };
  private activeAgents: ActiveAgentState[] = [...INITIAL_AGENTS];
  private listeners: ((log: AgentActionLog) => void)[] = [];

  constructor() {
    this.initIndexedDb();
  }

  private initIndexedDb() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isDbReady = true;
      return;
    }

    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('agent_actions_journal')) {
          const store = db.createObjectStore('agent_actions_journal', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('agentId', 'agentId', { unique: false });
          store.createIndex('actionType', 'actionType', { unique: false });
        }
        if (!db.objectStoreNames.contains('agent_context_buffer')) {
          db.createObjectStore('agent_context_buffer', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isDbReady = true;
        this.syncIndexedDbToMemory();
      };

      request.onerror = () => {
        this.isDbReady = true; // Fallback to memory
      };
    } catch {
      this.isDbReady = true;
    }
  }

  private async syncIndexedDbToMemory() {
    if (!this.db) return;
    try {
      const tx = this.db.transaction('agent_actions_journal', 'readonly');
      const store = tx.objectStore('agent_actions_journal');
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          this.memoryJournal = req.result;
        } else {
          // Seed Initial Logs into IDB
          INITIAL_JOURNAL.forEach((item) => this.persistLogToIdb(item));
        }
      };
    } catch (e) {
      console.warn('IDB Sync Error', e);
    }
  }

  private persistLogToIdb(log: AgentActionLog) {
    if (!this.db) return;
    try {
      const tx = this.db.transaction('agent_actions_journal', 'readwrite');
      const store = tx.objectStore('agent_actions_journal');
      store.put(log);
    } catch {
      // Ignored fallback
    }
  }

  public async logAgentAction(action: Omit<AgentActionLog, 'id' | 'timestamp'>): Promise<AgentActionLog> {
    const fullLog: AgentActionLog = {
      ...action,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };

    this.memoryJournal.unshift(fullLog);
    this.persistLogToIdb(fullLog);

    // Update agent action counter
    const agent = this.activeAgents.find((a) => a.id === fullLog.agentId);
    if (agent) {
      agent.actionsCount += 1;
      agent.lastHeartbeat = fullLog.timestamp;
      agent.status = fullLog.status === 'PENDING' ? 'EXECUTING' : 'IDLE';
    }

    // Notify subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(fullLog);
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });

    return fullLog;
  }

  public async recordAction(action: {
    agentId: string;
    agentName?: string;
    agentRole?: AgentActionLog['agentRole'];
    actionType?: any;
    targetResource: string;
    decisionRationale?: string;
    payload?: Record<string, any>;
    resultSummary?: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILURE' | 'BLOCKED';
    durationMs?: number;
  }): Promise<AgentActionLog> {
    return this.logAgentAction({
      agentId: action.agentId,
      agentName: action.agentName || 'Action Playground Runner',
      agentRole: action.agentRole || 'ORCHESTRATOR',
      actionType: 'MCP_TOOL_INVOCATION',
      targetResource: action.targetResource,
      decisionRationale: action.decisionRationale || 'Workflow Step execution',
      payload: action.payload || {},
      resultSummary: action.resultSummary || 'Execution finished',
      status: action.status,
      durationMs: action.durationMs || 50
    });
  }

  public getAuditTrail(): AgentActionLog[] {
    return [...this.memoryJournal];
  }

  public getActiveAgents(): ActiveAgentState[] {
    return [...this.activeAgents];
  }

  public getSharedContext(): Record<string, AgentContextItem> {
    return { ...this.memoryContext };
  }

  public setSharedContext(key: string, ownerAgentId: string, value: any, scope: AgentContextItem['scope'] = 'GLOBAL'): AgentContextItem {
    const item: AgentContextItem = {
      key,
      ownerAgentId,
      value,
      updatedAt: new Date().toISOString(),
      scope
    };
    this.memoryContext[key] = item;

    // Log this context mutation
    this.logAgentAction({
      agentId: ownerAgentId,
      agentName: this.activeAgents.find((a) => a.id === ownerAgentId)?.name || 'Autonomous Agent',
      agentRole: 'ORCHESTRATOR',
      actionType: 'CONTEXT_SYNC',
      targetResource: `civer://context/${key}`,
      decisionRationale: `Actualización de buffer compartido de contexto para clave '${key}'`,
      payload: { value, scope },
      resultSummary: `Contexto [${key}] sincronizado con éxito`,
      status: 'SUCCESS',
      durationMs: 45
    });

    return item;
  }

  public subscribe(callback: (log: AgentActionLog) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public clearAuditTrail() {
    this.memoryJournal = [];
    if (this.db) {
      try {
        const tx = this.db.transaction('agent_actions_journal', 'readwrite');
        tx.objectStore('agent_actions_journal').clear();
      } catch (e) {
        console.warn('IDB clear error', e);
      }
    }
  }

  public exportJournalJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        system: 'Civer App Store Global Agent Telemetry Bus',
        totalLogs: this.memoryJournal.length,
        activeAgents: this.activeAgents,
        sharedContext: this.memoryContext,
        journal: this.memoryJournal
      },
      null,
      2
    );
  }
}

export const globalAgentTelemetryBus = new GlobalAgentTelemetryBusService();
