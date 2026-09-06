/**
 * SystemMapGeneratorService
 *
 * Generates a comprehensive, introspectable JSON hierarchy of all application modules,
 * their inter-dependencies, state management controllers, transport bridges, and data stores.
 * Designed to provide autonomous AI agents and architects with a complete, navigable mental
 * model of the codebase architecture.
 */

export interface SystemModuleNode {
  id: string;
  name: string;
  category: 'CORE_INFRA' | 'UI_VIEW' | 'MODAL_WORKSPACE' | 'STATE_CONTROLLER' | 'TRANSPORT_BRIDGE' | 'DATA_STORE' | 'INTEGRATION_ADAPTER';
  description: string;
  filePath?: string;
  dependencies: string[]; // IDs of modules this module depends on
  dependents: string[];   // IDs of modules that depend on this module
  stateManagement?: {
    type: 'IndexedDB' | 'LocalStorage' | 'React_State' | 'In_Memory_Bus' | 'Ring_Buffer';
    primaryStoreKey?: string;
    isPersistent: boolean;
    schemaSummary?: string;
  };
  interfacesExposed?: string[];
  securityLevel?: 'PUBLIC' | 'AUTHENTICATED' | 'AGENT_ORCHESTRATOR_ONLY' | 'SANDBOXED';
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'STANDBY';
  metrics?: Record<string, any>;
}

export interface SystemMapHierarchy {
  systemIdentity: {
    name: string;
    version: string;
    engine: string;
    generatedAt: string;
    architectureType: string;
    totalModulesCount: number;
    totalConnectionsCount: number;
  };
  layers: {
    id: string;
    name: string;
    description: string;
    modules: SystemModuleNode[];
  }[];
  stateControllers: {
    controllerId: string;
    name: string;
    scope: string;
    storageBackend: string;
    reactiveStreams: string[];
    subscribedEvents: string[];
  }[];
  transportBridges: {
    protocol: string;
    endpoint: string;
    encoding: string;
    latencyAverageMs: number;
    methodsCount: number;
  }[];
  dependencyMatrix: {
    source: string;
    target: string;
    type: 'CALLS' | 'MUTATES_STATE' | 'SUBSCRIBES_EVENT' | 'PERSISTS_TO';
  }[];
}

class SystemMapGeneratorService {
  private static instance: SystemMapGeneratorService;
  private cachedMap: SystemMapHierarchy | null = null;
  private lastGeneratedTime: number = 0;

  private constructor() {}

  public static getInstance(): SystemMapGeneratorService {
    if (!SystemMapGeneratorService.instance) {
      SystemMapGeneratorService.instance = new SystemMapGeneratorService();
    }
    return SystemMapGeneratorService.instance;
  }

  /**
   * Builds and returns the comprehensive System Map hierarchy JSON object
   */
  public generateSystemMap(): SystemMapHierarchy {
    const now = new Date().toISOString();

    const modules: SystemModuleNode[] = [
      // 1. Core Infra & Entry
      {
        id: 'mod_app_root',
        name: 'App Root & Navigation Coordinator',
        category: 'CORE_INFRA',
        description: 'Main React application container, mode switcher (Store, Matrix Pro, CI Pipeline, Fault Simulator), modal managers, and layout adapters.',
        filePath: '/src/App.tsx',
        dependencies: [
          'mod_state_telemetry_bus',
          'mod_state_ci_queue',
          'mod_state_event_bus',
          'mod_transport_grpc',
          'mod_transport_mcp',
          'mod_service_repo_heuristic',
          'mod_view_store_catalog',
          'mod_view_matrix_pro',
          'mod_view_ci_pipeline',
          'mod_modal_orchestrator',
          'mod_modal_blueprint',
          'mod_modal_command_palette'
        ],
        dependents: [],
        stateManagement: {
          type: 'React_State',
          primaryStoreKey: 'storeUiMode, activeApp, filterState',
          isPersistent: false
        },
        interfacesExposed: ['render()', 'onSwitchUiMode()', 'openModal()'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },

      // 2. State Management Controllers
      {
        id: 'mod_state_telemetry_bus',
        name: 'GlobalAgentTelemetryBus (IndexedDB Journal & Context Buffer)',
        category: 'STATE_CONTROLLER',
        description: 'Centralized telemetry hub persisting agent decision journals, action logs, audit trails in IndexedDB and in-memory multi-agent shared context buffer.',
        filePath: '/src/services/globalAgentTelemetryBus.ts',
        dependencies: ['mod_store_indexeddb_telemetry'],
        dependents: ['mod_app_root', 'mod_transport_grpc', 'mod_transport_mcp', 'mod_modal_orchestrator', 'mod_view_telemetry_audit'],
        stateManagement: {
          type: 'IndexedDB',
          primaryStoreKey: 'civer_agent_telemetry_db -> agent_actions_journal, agent_context_buffer',
          isPersistent: true,
          schemaSummary: 'AgentActionLog { id, timestamp, agentId, agentRole, actionType, targetResource, decisionRationale, durationMs }'
        },
        interfacesExposed: ['logAgentAction()', 'getAuditTrail()', 'getSharedContext()', 'setSharedContext()', 'subscribe()', 'exportJournalJson()'],
        securityLevel: 'AGENT_ORCHESTRATOR_ONLY',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_state_ci_queue',
        name: 'PersistentCiQueueService (CI Compilation Queue)',
        category: 'STATE_CONTROLLER',
        description: 'Multi-priority build scheduler handling reproducible Android compilation jobs, retry matrix, and LocalStorage durability.',
        filePath: '/src/services/persistentCiQueueService.ts',
        dependencies: ['mod_store_local_ci_queue', 'mod_state_event_bus'],
        dependents: ['mod_app_root', 'mod_view_ci_pipeline', 'mod_transport_grpc', 'mod_transport_mcp'],
        stateManagement: {
          type: 'LocalStorage',
          primaryStoreKey: 'civer_ci_queue_v1',
          isPersistent: true,
          schemaSummary: 'CiBuildJob { id, appId, appName, githubUrl, priority, status, logs, workerId }'
        },
        interfacesExposed: ['enqueueBuild()', 'getQueue()', 'cancelJob()', 'retryJob()', 'processNextJob()'],
        securityLevel: 'AGENT_ORCHESTRATOR_ONLY',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_state_event_bus',
        name: 'GlobalAgentEventBus (WebSocket Real-Time Dispatcher)',
        category: 'STATE_CONTROLLER',
        description: 'PubSub event broker replicating real-time WebSocket protocol for agent-to-agent synchronization, build progress notifications, and telemetry streaming.',
        filePath: '/src/services/globalAgentEventBus.ts',
        dependencies: [],
        dependents: ['mod_state_telemetry_bus', 'mod_transport_grpc', 'mod_transport_mcp', 'mod_modal_orchestrator', 'mod_modal_docs'],
        stateManagement: {
          type: 'In_Memory_Bus',
          primaryStoreKey: 'eventHistory ring buffer (max 100)',
          isPersistent: false,
          schemaSummary: 'AgentEventMessage { id, type, payload, timestamp, emitter }'
        },
        interfacesExposed: ['broadcast()', 'subscribe()', 'getHistory()'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_service_repo_heuristic',
        name: 'RepoHeuristicService & Health Score Engine',
        category: 'STATE_CONTROLLER',
        description: 'Scans FOSS GitHub/GitLab repositories, evaluates Kotlin DSL Gradle scripts, SPDX license integrity, commit frequency, and security vulnerability density.',
        filePath: '/src/services/repoHeuristicService.ts',
        dependencies: ['mod_state_telemetry_bus'],
        dependents: ['mod_app_root', 'mod_transport_mcp', 'mod_view_matrix_pro', 'mod_modal_orchestrator'],
        stateManagement: {
          type: 'Ring_Buffer',
          primaryStoreKey: 'REPO_CANDIDATES_POOL & healthMetricsCache',
          isPersistent: false
        },
        interfacesExposed: ['getHealthScoreLeaderboard()', 'getBatchImportCandidates()', 'batchImportHealthyApps()', 'analyzeRepository()'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_service_registry',
        name: 'ServiceRegistry & Health Prober',
        category: 'STATE_CONTROLLER',
        description: 'Maintains active catalog of micro-services, gRPC endpoints, MCP servers, and F-Droid mirror latency probes.',
        filePath: '/src/services/serviceRegistry.ts',
        dependencies: [],
        dependents: ['mod_app_root', 'mod_modal_orchestrator'],
        stateManagement: {
          type: 'React_State',
          primaryStoreKey: 'registeredServices[]',
          isPersistent: false
        },
        interfacesExposed: ['getServices()', 'pingService()', 'registerService()'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },

      // 3. Transport & Protocol Bridges
      {
        id: 'mod_transport_grpc',
        name: 'CiverTransportBridge (gRPC-web & Protobuf Gateway)',
        category: 'TRANSPORT_BRIDGE',
        description: 'High-performance binary-typed gateway implementing CiverTransportBridgeService methods: TriggerBuild, GetAppStats, DeployPatch, SyncMirrors.',
        filePath: '/src/services/civerTransportBridge.ts',
        dependencies: ['mod_state_event_bus', 'mod_state_telemetry_bus', 'mod_state_ci_queue'],
        dependents: ['mod_app_root', 'mod_modal_command_palette', 'mod_modal_orchestrator', 'mod_modal_docs'],
        interfacesExposed: ['triggerBuild()', 'getAppStats()', 'deployPatch()', 'syncMirrors()', 'getProtoDescriptor()'],
        securityLevel: 'AUTHENTICATED',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_transport_mcp',
        name: 'InternalMcpServer (Model Context Protocol Server v2024-11-05)',
        category: 'TRANSPORT_BRIDGE',
        description: 'Standard MCP JSON-RPC 2.0 server exposing 10 agentic tools and 4 real-time resource URIs for autonomous LLM interaction and catalog manipulation.',
        filePath: '/src/services/internalMcpServer.ts',
        dependencies: ['mod_service_repo_heuristic', 'mod_state_telemetry_bus', 'mod_state_ci_queue', 'mod_state_event_bus'],
        dependents: ['mod_app_root', 'mod_modal_orchestrator', 'mod_modal_docs', 'mod_service_discovery'],
        interfacesExposed: ['handleJsonRpcRequest()', 'getTools()', 'getResources()', 'callTool()', 'readResource()'],
        securityLevel: 'AUTHENTICATED',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_service_discovery',
        name: 'McpDiscoveryToolService (Autonomous Agent Discovery Engine)',
        category: 'TRANSPORT_BRIDGE',
        description: 'Periodically introspects and exports the entire platform API surface, MCP tool schema, WebSocket events, and gRPC endpoints into Markdown/JSON.',
        filePath: '/src/services/mcpDiscoveryToolService.ts',
        dependencies: ['mod_transport_mcp', 'mod_transport_grpc', 'mod_state_event_bus'],
        dependents: ['mod_modal_docs', 'mod_modal_orchestrator'],
        interfacesExposed: ['generateDiscoveryMarkdown()', 'getDiscoverySnapshot()', 'exportDiscoveryFile()'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },

      // 4. UI Views & Dashboards
      {
        id: 'mod_view_store_catalog',
        name: 'FOSS Store Catalog & App Matrix',
        category: 'UI_VIEW',
        description: 'Consumer & power-user application store view with curated FOSS repositories, reproducible badges, categories, search, and installation handlers.',
        filePath: '/src/components/AppCatalogGrid.tsx',
        dependencies: ['mod_app_root'],
        dependents: ['mod_app_root'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_view_matrix_pro',
        name: 'Matrix Pro Workstation & Developer Console',
        category: 'UI_VIEW',
        description: 'Pro workstation layout offering multi-pane APK inspect, heuristic health radars, binary comparison, and Gradle configuration analyzer.',
        filePath: '/src/components/MatrixProWorkstation.tsx',
        dependencies: ['mod_service_repo_heuristic', 'mod_state_telemetry_bus'],
        dependents: ['mod_app_root'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_view_ci_pipeline',
        name: 'CI/CD Pipeline Matrix & Runner Farm',
        category: 'UI_VIEW',
        description: 'Interactive visualization of live compilation workers, build queues, Gradle console logs, and APK artifact signing.',
        filePath: '/src/components/CiPipelineWorkspace.tsx',
        dependencies: ['mod_state_ci_queue', 'mod_state_event_bus'],
        dependents: ['mod_app_root'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_view_telemetry_audit',
        name: 'Agent Activity Journal & Replay Visualizer',
        category: 'UI_VIEW',
        description: 'Time-series charts and step-by-step sequence replayer for external agent gRPC/MCP invocations and state changes.',
        filePath: '/src/components/AgentTelemetryAuditView.tsx',
        dependencies: ['mod_state_telemetry_bus', 'mod_state_event_bus'],
        dependents: ['mod_modal_orchestrator'],
        securityLevel: 'AGENT_ORCHESTRATOR_ONLY',
        healthStatus: 'HEALTHY'
      },

      // 5. Modals & Interactive Workspaces
      {
        id: 'mod_modal_orchestrator',
        name: 'Agent Orchestrator Hub Modal',
        category: 'MODAL_WORKSPACE',
        description: 'Comprehensive command center for active AI agents, MCP connection topologies, live gRPC tester, context buffer, and event inspector.',
        filePath: '/src/components/AgentOrchestratorHubModal.tsx',
        dependencies: ['mod_state_telemetry_bus', 'mod_transport_grpc', 'mod_transport_mcp', 'mod_view_telemetry_audit'],
        dependents: ['mod_app_root'],
        securityLevel: 'AGENT_ORCHESTRATOR_ONLY',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_modal_blueprint',
        name: 'Architecture Blueprint Modal (D3.js Graph)',
        category: 'MODAL_WORKSPACE',
        description: 'Dynamic D3.js force-directed physics graph visualizing modules, contracts, agent communication nodes, and system map.',
        filePath: '/src/components/ArchitectureBlueprintModal.tsx',
        dependencies: ['mod_state_telemetry_bus', 'mod_transport_grpc', 'mod_transport_mcp'],
        dependents: ['mod_app_root'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_modal_command_palette',
        name: 'Command Palette & gRPC Request Builder',
        category: 'MODAL_WORKSPACE',
        description: 'Global developer command interface (Ctrl+K) equipped with fuzzy command search, CLI simulator, and interactive binary gRPC request workbench.',
        filePath: '/src/components/CommandPalette.tsx',
        dependencies: ['mod_transport_grpc', 'mod_state_ci_queue', 'mod_service_repo_heuristic'],
        dependents: ['mod_app_root'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_modal_docs',
        name: 'Agent Technical Docs Modal',
        category: 'MODAL_WORKSPACE',
        description: 'Structured onboarding documentation detailing Protobuf contracts, JSON schemas, WebSocket event types, and MCP tool definitions for AI agents.',
        filePath: '/src/components/AgentTechnicalDocsModal.tsx',
        dependencies: ['mod_transport_grpc', 'mod_transport_mcp'],
        dependents: ['mod_app_root'],
        securityLevel: 'PUBLIC',
        healthStatus: 'HEALTHY'
      },

      // 6. Persistent Storage Backends
      {
        id: 'mod_store_indexeddb_telemetry',
        name: 'IndexedDB Store: civer_agent_telemetry_db',
        category: 'DATA_STORE',
        description: 'Local durable database managing object stores: agent_actions_journal and agent_context_buffer with multi-index queries.',
        dependencies: [],
        dependents: ['mod_state_telemetry_bus'],
        stateManagement: {
          type: 'IndexedDB',
          primaryStoreKey: 'civer_agent_telemetry_db (v1)',
          isPersistent: true
        },
        securityLevel: 'SANDBOXED',
        healthStatus: 'HEALTHY'
      },
      {
        id: 'mod_store_local_ci_queue',
        name: 'LocalStorage Store: civer_ci_queue_v1',
        category: 'DATA_STORE',
        description: 'Synchronous persistent key-value store maintaining serializable JSON array of CI compilation tasks.',
        dependencies: [],
        dependents: ['mod_state_ci_queue'],
        stateManagement: {
          type: 'LocalStorage',
          primaryStoreKey: 'civer_ci_queue_v1',
          isPersistent: true
        },
        securityLevel: 'SANDBOXED',
        healthStatus: 'HEALTHY'
      }
    ];

    // Compute backlink dependents
    modules.forEach((mod) => {
      mod.dependencies.forEach((depId) => {
        const targetMod = modules.find((m) => m.id === depId);
        if (targetMod && !targetMod.dependents.includes(mod.id)) {
          targetMod.dependents.push(mod.id);
        }
      });
    });

    const layers = [
      {
        id: 'layer_presentation',
        name: 'Presentation & UI Layer',
        description: 'React functional components, responsive viewports, and interactive modals.',
        modules: modules.filter((m) => m.category === 'UI_VIEW' || m.category === 'MODAL_WORKSPACE' || m.category === 'CORE_INFRA')
      },
      {
        id: 'layer_state_management',
        name: 'State Management & Orchestration Layer',
        description: 'Event buses, telemetry queues, heuristic scanners, and multi-agent buffers.',
        modules: modules.filter((m) => m.category === 'STATE_CONTROLLER')
      },
      {
        id: 'layer_transport_gateways',
        name: 'Transport & Protocol Gateway Layer',
        description: 'gRPC-web bridge, Model Context Protocol server, and WebSocket broadcaster.',
        modules: modules.filter((m) => m.category === 'TRANSPORT_BRIDGE')
      },
      {
        id: 'layer_storage',
        name: 'Durability & Storage Layer',
        description: 'Client-side database engines (IndexedDB, LocalStorage, Ring Buffers).',
        modules: modules.filter((m) => m.category === 'DATA_STORE')
      }
    ];

    const stateControllers = [
      {
        controllerId: 'mod_state_telemetry_bus',
        name: 'GlobalAgentTelemetryBus',
        scope: 'GLOBAL_MULTI_AGENT',
        storageBackend: 'IndexedDB (civer_agent_telemetry_db)',
        reactiveStreams: ['agentDecisionStream', 'contextMutationStream'],
        subscribedEvents: ['BUILD_QUEUED', 'BUILD_COMPLETED', 'PATCH_DEPLOYED', 'REPO_SYNC_STATUS']
      },
      {
        controllerId: 'mod_state_ci_queue',
        name: 'PersistentCiQueueService',
        scope: 'CI_COMPILATION_MATRIX',
        storageBackend: 'LocalStorage (civer_ci_queue_v1)',
        reactiveStreams: ['queueUpdateStream', 'workerLogStream'],
        subscribedEvents: ['BUILD_QUEUED', 'BUILD_STATUS_CHANGE']
      },
      {
        controllerId: 'mod_state_event_bus',
        name: 'GlobalAgentEventBus',
        scope: 'WEBSOCKET_BROADCAST',
        storageBackend: 'In-Memory Ring Buffer (100 items)',
        reactiveStreams: ['wsBroadcastChannel'],
        subscribedEvents: ['*']
      },
      {
        controllerId: 'mod_service_repo_heuristic',
        name: 'RepoHeuristicService',
        scope: 'CATALOG_INTELLIGENCE',
        storageBackend: 'In-Memory Cache',
        reactiveStreams: ['healthScoreStream'],
        subscribedEvents: ['REPO_SCAN_REQUESTED']
      }
    ];

    const transportBridges = [
      {
        protocol: 'gRPC-web / HTTP2',
        endpoint: '/grpc-web/civer.store.v1.CiverTransportBridgeService',
        encoding: 'application/grpc-web+proto, application/grpc-web+json',
        latencyAverageMs: 140,
        methodsCount: 5
      },
      {
        protocol: 'Model Context Protocol (MCP v2024-11-05)',
        endpoint: '/api/v1/mcp/jsonrpc',
        encoding: 'JSON-RPC 2.0',
        latencyAverageMs: 25,
        methodsCount: 10
      },
      {
        protocol: 'WebSocket Event Bus',
        endpoint: 'wss://civer.store.local/ws/v1/events',
        encoding: 'JSON (Typed AgentEventMessage)',
        latencyAverageMs: 8,
        methodsCount: 8
      },
      {
        protocol: 'REST OpenAPI 3.1',
        endpoint: '/api/v1',
        encoding: 'application/json',
        latencyAverageMs: 45,
        methodsCount: 12
      }
    ];

    // Compute dependency matrix
    const dependencyMatrix: SystemMapHierarchy['dependencyMatrix'] = [];
    modules.forEach((source) => {
      source.dependencies.forEach((targetId) => {
        const targetMod = modules.find((m) => m.id === targetId);
        if (targetMod) {
          let type: 'CALLS' | 'MUTATES_STATE' | 'SUBSCRIBES_EVENT' | 'PERSISTS_TO' = 'CALLS';
          if (targetMod.category === 'DATA_STORE') type = 'PERSISTS_TO';
          else if (targetMod.category === 'STATE_CONTROLLER') type = 'MUTATES_STATE';
          else if (targetMod.id === 'mod_state_event_bus') type = 'SUBSCRIBES_EVENT';

          dependencyMatrix.push({
            source: source.id,
            target: targetId,
            type
          });
        }
      });
    });

    const hierarchy: SystemMapHierarchy = {
      systemIdentity: {
        name: 'Civer FOSS Store & Agentic Workstation',
        version: 'v2026.09-MatrixPro',
        engine: 'Vite 6 + React 18 + TypeScript 5.7 + Tailwind CSS',
        generatedAt: now,
        architectureType: 'Decoupled Multi-Tier SPA with gRPC-web, MCP v2024-11-05 & IndexedDB Event Sourcing',
        totalModulesCount: modules.length,
        totalConnectionsCount: dependencyMatrix.length
      },
      layers,
      stateControllers,
      transportBridges,
      dependencyMatrix
    };

    this.cachedMap = hierarchy;
    this.lastGeneratedTime = Date.now();
    return hierarchy;
  }

  /**
   * Generates a clean Markdown representation of the system map hierarchy
   */
  public generateMarkdownSystemMap(): string {
    const map = this.generateSystemMap();

    let md = `# SYSTEM MAP: ${map.systemIdentity.name}\n\n`;
    md += `**Version:** ${map.systemIdentity.version}  \n`;
    md += `**Architecture:** ${map.systemIdentity.architectureType}  \n`;
    md += `**Total Modules:** ${map.systemIdentity.totalModulesCount} | **Total Connections:** ${map.systemIdentity.totalConnectionsCount}  \n`;
    md += `**Generated At:** ${map.systemIdentity.generatedAt}\n\n`;
    md += `---\n\n`;

    md += `## 1. Architectural Layers & Module Breakdown\n\n`;

    map.layers.forEach((layer) => {
      md += `### 📂 Layer: ${layer.name}\n`;
      md += `*${layer.description}*\n\n`;

      layer.modules.forEach((mod) => {
        md += `#### 🔹 [${mod.id}] ${mod.name}\n`;
        md += `- **Category:** \`${mod.category}\` | **Security:** \`${mod.securityLevel}\`\n`;
        if (mod.filePath) md += `- **File:** \`${mod.filePath}\`\n`;
        md += `- **Description:** ${mod.description}\n`;
        if (mod.stateManagement) {
          md += `- **State Engine:** \`${mod.stateManagement.type}\` (Persistent: ${mod.stateManagement.isPersistent ? 'Yes' : 'No'})\n`;
          if (mod.stateManagement.primaryStoreKey) md += `  - Key: \`${mod.stateManagement.primaryStoreKey}\`\n`;
        }
        if (mod.interfacesExposed && mod.interfacesExposed.length > 0) {
          md += `- **Exposed APIs:** \`${mod.interfacesExposed.join('`, `')}\`\n`;
        }
        md += `- **Dependencies (${mod.dependencies.length}):** ${mod.dependencies.length > 0 ? mod.dependencies.map((d) => `\`${d}\``).join(', ') : '_None_'}\n`;
        md += `- **Dependents (${mod.dependents.length}):** ${mod.dependents.length > 0 ? mod.dependents.map((d) => `\`${d}\``).join(', ') : '_None_'}\n\n`;
      });
    });

    md += `---\n\n## 2. State Management Controllers\n\n`;
    map.stateControllers.forEach((ctrl) => {
      md += `### 🧠 ${ctrl.name} (\`${ctrl.controllerId}\`)\n`;
      md += `- **Scope:** \`${ctrl.scope}\`\n`;
      md += `- **Storage Backend:** \`${ctrl.storageBackend}\`\n`;
      md += `- **Reactive Streams:** \`${ctrl.reactiveStreams.join(', ')}\`\n`;
      md += `- **Subscribed Events:** \`${ctrl.subscribedEvents.join(', ')}\`\n\n`;
    });

    md += `---\n\n## 3. Protocol & Transport Bridges\n\n`;
    map.transportBridges.forEach((bridge) => {
      md += `- **${bridge.protocol}:** \`${bridge.endpoint}\` | Encoding: \`${bridge.encoding}\` | Latency: ~${bridge.latencyAverageMs}ms | Methods: ${bridge.methodsCount}\n`;
    });

    return md;
  }

  /**
   * Returns a JSON stringified version of the system map
   */
  public exportSystemMapJson(): string {
    return JSON.stringify(this.generateSystemMap(), null, 2);
  }

  /**
   * Browser file download trigger
   */
  public downloadSystemMapJson(): void {
    const json = this.exportSystemMapJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer-system-map-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const systemMapGenerator = SystemMapGeneratorService.getInstance();
