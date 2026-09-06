/**
 * Agent Knowledge Registry
 * 
 * Serializes and exposes the entire codebase structure, AST metadata, dependency graph,
 * and service definitions as a programmatically queryable MCP resource and tool.
 * Allows autonomous agents to understand the system's DNA, architecture, and navigation paths.
 */

export interface ServiceKnowledgeEntry {
  serviceName: string;
  filePath: string;
  description: string;
  category: 'GATEWAY' | 'CORE_LOGIC' | 'PERSISTENCE' | 'TELEMETRY' | 'ORCHESTRATION';
  protocol?: string;
  methods: Array<{
    name: string;
    description: string;
    params: Record<string, string>;
    returns: string;
  }>;
  dependencies: string[];
}

export interface ComponentKnowledgeEntry {
  componentName: string;
  filePath: string;
  description: string;
  category: 'VIEW' | 'MODAL' | 'WIDGET' | 'DASHBOARD';
  props: Record<string, string>;
  keyboardShortcut?: string;
}

export interface SystemDnaModel {
  systemName: string;
  version: string;
  manifesto: string;
  techStack: {
    frontend: string[];
    protocols: string[];
    persistence: string[];
    ci_cd: string[];
    android_tooling: string[];
  };
  services: ServiceKnowledgeEntry[];
  components: ComponentKnowledgeEntry[];
  storageSchemas: Array<{
    storageType: 'IndexedDB' | 'LocalStorage' | 'In-Memory';
    name: string;
    description: string;
    indexesOrKeys: string[];
  }>;
  mcpResources: Array<{
    uri: string;
    name: string;
    description: string;
  }>;
  mcpTools: Array<{
    name: string;
    description: string;
    primaryUseCase: string;
  }>;
  quickNavigationRoadmap: Array<{
    goal: string;
    recommendedService: string;
    recommendedMethodOrResource: string;
  }>;
}

class AgentKnowledgeRegistryService {
  private readonly dna: SystemDnaModel = {
    systemName: 'Civer FOSS App Store & Agentic CI/CD Ecosystem',
    version: '4.2.0',
    manifesto: 'Zero-placeholder, deterministic, full-stack Android application repository and multi-agent development ecosystem.',
    techStack: {
      frontend: ['React 18', 'TypeScript (Strict)', 'Tailwind CSS', 'Vite', 'Lucide React', 'D3.js (Force Directed Graph)'],
      protocols: ['gRPC-web (Protobuf v3)', 'Model Context Protocol (MCP v2024-11-05)', 'WebSocket EventBus', 'OpenAPI 3.1 / REST'],
      persistence: ['IndexedDB (civer_agent_journal, civer_fault_logs)', 'LocalStorage (civer_ci_queue)', '5-Second Consolidated Snapshot'],
      ci_cd: ['PersistentCiQueueService', 'GitHub Actions Matrix CI (Ubuntu + JDK 17)', 'Diffoscope Reproducible Verifier'],
      android_tooling: ['F-Droid Index-V2 Parser', 'Gradle AST Heuristic Engine', 'Shizuku Installer Bridge', 'Native .so Bytecode Injector']
    },
    services: [
      {
        serviceName: 'agentRecipeEngine',
        filePath: '/src/services/agentRecipeEngine.ts',
        description: 'Multi-step task flow orchestrator (sync -> build -> audit -> publish) with auto-debugging and heuristic healing.',
        category: 'ORCHESTRATION',
        methods: [
          { name: 'executeRecipe', description: 'Executes a multi-step workflow recipe with auto-healing', params: { recipeIdOrTemplate: 'string | AgentRecipeTemplate', executorAgentId: 'string' }, returns: 'Promise<RecipeExecutionRecord>' },
          { name: 'getTemplates', description: 'Returns all registered workflow templates', params: {}, returns: 'AgentRecipeTemplate[]' },
          { name: 'registerTemplate', description: 'Registers a custom workflow recipe template', params: { template: 'AgentRecipeTemplate' }, returns: 'boolean' }
        ],
        dependencies: ['persistentCiQueueService', 'repoHeuristicService', 'globalAgentTelemetryBus', 'globalAgentEventBus']
      },
      {
        serviceName: 'civerTransportBridge',
        filePath: '/src/services/civerTransportBridge.ts',
        description: 'gRPC-web Bridge Gateway implementing civer.store.v1.CiverTransportBridgeService.',
        category: 'GATEWAY',
        protocol: 'gRPC-web (Protobuf v3 / HTTP/2)',
        methods: [
          { name: 'triggerBuild', description: 'Dispatches compilation job with priority to GitHub Actions', params: { request: 'TriggerBuildRequest' }, returns: 'Promise<TriggerBuildResponse>' },
          { name: 'getFullStateSnapshot', description: 'Returns consolidated 5-second snapshot of all system states', params: { request: 'GetFullStateSnapshotRequest' }, returns: 'Promise<GetFullStateSnapshotResponse>' },
          { name: 'deployPatch', description: 'Applies native .so binary delta patch to target APK', params: { request: 'DeployPatchRequest' }, returns: 'Promise<DeployPatchResponse>' },
          { name: 'syncMirrors', description: 'Triggers F-Droid Index-V2 mirror sync', params: { request: 'SyncMirrorsRequest' }, returns: 'Promise<SyncMirrorsResponse>' }
        ],
        dependencies: ['globalStatePersistenceService', 'persistentCiQueueService', 'globalAgentEventBus']
      },
      {
        serviceName: 'internalMcpServer',
        filePath: '/src/services/internalMcpServer.ts',
        description: 'Internal Model Context Protocol server exposing JSON-RPC 2.0 tools and queryable URI resources.',
        category: 'GATEWAY',
        protocol: 'MCP (v2024-11-05)',
        methods: [
          { name: 'handleJsonRpcRequest', description: 'Dispatches tools/call, tools/list, resources/read, prompts/list', params: { req: 'McpJsonRpcRequest' }, returns: 'Promise<McpJsonRpcResponse>' },
          { name: 'getTools', description: 'Returns all available tool definitions with JSON schema inputs', params: {}, returns: 'McpTool[]' },
          { name: 'getResources', description: 'Returns queryable civer:// URI resources', params: {}, returns: 'McpResource[]' }
        ],
        dependencies: ['repoHeuristicService', 'globalAgentTelemetryBus', 'globalStatePersistenceService', 'systemMapGeneratorService']
      },
      {
        serviceName: 'globalStatePersistenceService',
        filePath: '/src/services/globalStatePersistenceService.ts',
        description: '5-second omniscient state snapshot serializer preventing high-frequency polling.',
        category: 'PERSISTENCE',
        methods: [
          { name: 'getFullStateSnapshot', description: 'Returns real-time consolidated system snapshot', params: {}, returns: 'ConsolidatedFullStateSnapshot' },
          { name: 'registerStateProvider', description: 'Registers a subsystem state provider for snapshot inclusion', params: { provider: 'StateProvider' }, returns: 'void' }
        ],
        dependencies: ['persistentCiQueueService', 'globalAgentTelemetryBus']
      },
      {
        serviceName: 'globalAgentTelemetryBus',
        filePath: '/src/services/globalAgentTelemetryBus.ts',
        description: 'IndexedDB-backed immutable decision journal with audit trail export and active agent state.',
        category: 'TELEMETRY',
        methods: [
          { name: 'recordAction', description: 'Logs agent action, rationale, status and duration to IndexedDB', params: { action: 'RecordActionParams' }, returns: 'Promise<AgentActionLog>' },
          { name: 'getAuditTrail', description: 'Returns complete forensic decision history', params: {}, returns: 'AgentActionLog[]' },
          { name: 'getActiveAgents', description: 'Returns real-time status of all active agent workers', params: {}, returns: 'ActiveAgentState[]' }
        ],
        dependencies: []
      },
      {
        serviceName: 'repoHeuristicService',
        filePath: '/src/services/repoHeuristicService.ts',
        description: 'Android Gradle AST parser and static health score engine (0-100%).',
        category: 'CORE_LOGIC',
        methods: [
          { name: 'analyzeRepository', description: 'Analyzes repository URL or name and returns grade and recommendations', params: { repoUrl: 'string' }, returns: 'RepoHealthResult' },
          { name: 'getHealthScoreLeaderboard', description: 'Returns ranked list of candidate repositories by score', params: { filters: 'LeaderboardFilters' }, returns: 'LeaderboardResult' }
        ],
        dependencies: []
      }
    ],
    components: [
      {
        componentName: 'AgentAPIExplorerModal',
        filePath: '/src/components/AgentAPIExplorerModal.tsx',
        description: 'Interactive Swagger/OpenAPI 3.1 and gRPC-web playground with "Try-it-out" buttons.',
        category: 'MODAL',
        props: { isOpen: 'boolean', onClose: '() => void' },
        keyboardShortcut: 'Alt+A / Command Palette'
      },
      {
        componentName: 'AgentOrchestratorHubModal',
        filePath: '/src/components/AgentOrchestratorHubModal.tsx',
        description: 'Orchestrator hub with GANTT lifecycle visualizer, decision logs, and WebSocket bus.',
        category: 'MODAL',
        props: { isOpen: 'boolean', onClose: '() => void' },
        keyboardShortcut: 'Alt+O / Command Palette'
      },
      {
        componentName: 'ArchitectureBlueprintModal',
        filePath: '/src/components/ArchitectureBlueprintModal.tsx',
        description: 'D3.js force-directed graph of all architecture nodes and API discovery map.',
        category: 'MODAL',
        props: { isOpen: 'boolean', onClose: '() => void' },
        keyboardShortcut: 'Alt+B / Command Palette'
      },
      {
        componentName: 'AgentAcademyModal',
        filePath: '/src/components/AgentAcademyModal.tsx',
        description: 'Interactive tutorial, simulation sandbox and action playground for agents.',
        category: 'MODAL',
        props: { isOpen: 'boolean', onClose: '() => void' },
        keyboardShortcut: 'Alt+T / Command Palette'
      },
      {
        componentName: 'CommandPalette',
        filePath: '/src/components/CommandPalette.tsx',
        description: 'Omni-search, instant navigation and gRPC Protobuf request builder.',
        category: 'WIDGET',
        props: { isOpen: 'boolean', onClose: '() => void' },
        keyboardShortcut: 'Ctrl+K / Cmd+K'
      }
    ],
    storageSchemas: [
      {
        storageType: 'IndexedDB',
        name: 'civer_agent_journal',
        description: 'Immutable ledger of all agent tool calls, rationales, and results.',
        indexesOrKeys: ['id', 'timestamp', 'agentId', 'agentRole', 'status', 'actionType']
      },
      {
        storageType: 'IndexedDB',
        name: 'civer_fault_logs',
        description: 'Resilience logs, network drop events, and automated recovery steps.',
        indexesOrKeys: ['id', 'timestamp', 'severity', 'errorType', 'resolved']
      },
      {
        storageType: 'LocalStorage',
        name: 'civer_ci_queue',
        description: 'Persistent compilation queue containing queued, running, and finished builds.',
        indexesOrKeys: ['items', 'lastUpdated', 'runnerMatrix']
      }
    ],
    mcpResources: [
      { uri: 'civer://system/knowledge-registry.json', name: 'Knowledge Registry DNA', description: 'Complete serialized codebase AST, dependencies, and API schemas.' },
      { uri: 'civer://system/state-snapshot.json', name: 'Omniscient 5s State Snapshot', description: 'Consolidated JSON of all catalog items, CI queue, and agent metrics.' },
      { uri: 'civer://system/architecture-blueprint.json', name: 'Architecture Graph Nodes', description: 'Topology graph representation with D3 links.' },
      { uri: 'civer://recipes/templates.json', name: 'Agent Workflow Recipes', description: 'Multi-step task flows (sync -> build -> audit -> publish).' },
      { uri: 'civer://catalog/apps.json', name: 'FOSS Apps Catalog', description: 'All available Android applications and metadata.' },
      { uri: 'civer://telemetry/audit-trail.json', name: 'Agent Decision Journal', description: 'IndexedDB action logs for forensic auditing.' }
    ],
    mcpTools: [
      { name: 'civer_browse_catalog', description: 'Filter and search apps by category, query, health score, and trackers', primaryUseCase: 'Finding apps for users or auditing' },
      { name: 'civer_get_health_scores', description: 'Evaluates AST code health and Gradle wrapper version (0-100%)', primaryUseCase: 'Assessing repo stability' },
      { name: 'civer_enqueue_build', description: 'Enqueues reproducible APK build in GitHub CI Matrix', primaryUseCase: 'Triggering remote compilation' },
      { name: 'civer_execute_recipe', description: 'Executes a multi-step task flow with auto-healing', primaryUseCase: 'Autonomous end-to-end pipelines' },
      { name: 'civer_get_full_state_snapshot', description: 'Retrieves complete 5s system state in one roundtrip', primaryUseCase: 'Context acquisition without polling' },
      { name: 'civer_query_knowledge_registry', description: 'Searches the AST and service registry for architectural details', primaryUseCase: 'Understanding platform DNA' }
    ],
    quickNavigationRoadmap: [
      { goal: 'Get full system state in 1 call', recommendedService: 'globalStatePersistenceService', recommendedMethodOrResource: 'getFullStateSnapshot() or civer://system/state-snapshot.json' },
      { goal: 'Run end-to-end release pipeline', recommendedService: 'agentRecipeEngine', recommendedMethodOrResource: 'executeRecipe("sync-build-audit-publish")' },
      { goal: 'Inspect codebase AST and API map', recommendedService: 'agentKnowledgeRegistry', recommendedMethodOrResource: 'civer://system/knowledge-registry.json' },
      { goal: 'Trigger remote CI compilation', recommendedService: 'civerTransportBridge', recommendedMethodOrResource: 'triggerBuild(TriggerBuildRequest)' },
      { goal: 'Log agent decision rationale', recommendedService: 'globalAgentTelemetryBus', recommendedMethodOrResource: 'recordAction({ ... })' }
    ]
  };

  public getDna(): SystemDnaModel {
    return { ...this.dna };
  }

  public getSerializedKnowledgeJson(): string {
    return JSON.stringify(this.dna, null, 2);
  }

  public queryKnowledge(params: { query?: string; category?: string }): any {
    let result = { ...this.dna };

    if (params.category) {
      const cat = params.category.toUpperCase();
      result.services = result.services.filter((s) => s.category === cat);
    }

    if (params.query) {
      const q = params.query.toLowerCase();
      result.services = result.services.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.methods.some((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
      );
      result.components = result.components.filter(
        (c) =>
          c.componentName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    return result;
  }
}

export const agentKnowledgeRegistry = new AgentKnowledgeRegistryService();
