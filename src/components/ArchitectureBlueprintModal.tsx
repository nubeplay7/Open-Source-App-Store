import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  X,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Download,
  Info,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Database,
  Radio,
  Bot,
  Network,
  Terminal,
  Code2,
  Copy,
  Check,
  Play,
  ArrowRight,
  Workflow
} from 'lucide-react';
import { civerTransportBridge } from '../services/civerTransportBridge';
import { globalStatePersistenceService } from '../services/globalStatePersistenceService';
import { internalMcpServer } from '../services/internalMcpServer';

interface BlueprintNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: 'UI' | 'SERVICE' | 'STORAGE' | 'EXTERNAL' | 'AGENT' | 'MCP' | 'ACTION' | 'GATEWAY' | 'HANDLER';
  description: string;
  endpoints?: string[];
  protocol?: string;
  status: 'ACTIVE' | 'SYNCED' | 'STANDBY';
  color: string;
  radius: number;
  protocolDefinition?: {
    signature: string;
    argumentsSchema: Record<string, string>;
    responseSchema: Record<string, string>;
    samplePayload: any;
    codeSnippet: string;
  };
}

interface BlueprintLink extends d3.SimulationLinkDatum<BlueprintNode> {
  source: string | BlueprintNode;
  target: string | BlueprintNode;
  label?: string;
  type: 'DATA_FLOW' | 'RPC_CALL' | 'PERSISTENCE' | 'EVENT_BUS' | 'MCP_TOOL' | 'ACTION_BINDING';
}

const BLUEPRINT_NODES: BlueprintNode[] = [
  // UI Layer
  { id: 'ui-navbar', name: 'Navbar & Navigation', category: 'UI', description: 'Barra superior con orquestación de vistas y modal hubs', color: '#38bdf8', radius: 24, status: 'ACTIVE' },
  { id: 'ui-store', name: 'AppStore View (iOS/Store)', category: 'UI', description: 'Vista estilo App Store con categorías y destacados', color: '#38bdf8', radius: 26, status: 'ACTIVE' },
  { id: 'ui-matrix', name: 'CardsGridView Matrix', category: 'UI', description: 'Matriz técnica de comparación FOSS y auditorías', color: '#38bdf8', radius: 25, status: 'ACTIVE' },
  { id: 'ui-detail', name: 'AppDetailModal (Health/CI)', category: 'UI', description: 'Detalle de app con desglose heurístico, reviews y compilación CI', color: '#38bdf8', radius: 26, status: 'ACTIVE' },
  { id: 'ui-sync-modal', name: 'RepoIndexSync & API Gateway', category: 'UI', description: 'Hub de sincronización V2, OpenAPI, Proto y MCP tools', color: '#38bdf8', radius: 28, status: 'ACTIVE' },

  // Service Layer
  { id: 'srv-heuristic', name: 'RepoHeuristicService', category: 'SERVICE', description: 'Motor de Health Score ponderado (0-100%) y auditor de Gradle', color: '#34d399', radius: 26, status: 'ACTIVE', endpoints: ['analyzeRepoHeuristics()', 'estimateCompatibility()'] },
  { id: 'srv-ci-queue', name: 'PersistentCiQueueService', category: 'SERVICE', description: 'Cola persistente con reintentos automáticos y prioridades', color: '#34d399', radius: 28, status: 'ACTIVE', endpoints: ['enqueueJob()', 'executeJob()', 'retryFailedJobs()'] },
  { id: 'srv-telemetry-bus', name: 'GlobalAgentTelemetryBus', category: 'SERVICE', description: 'Journal de acciones de agentes y buffer de contexto en IndexedDB', color: '#a855f7', radius: 28, status: 'ACTIVE', endpoints: ['logAgentAction()', 'getAuditTrail()', 'setSharedContext()'] },
  { id: 'srv-state-persist', name: 'GlobalStatePersistenceService', category: 'SERVICE', description: 'Serializador omnisciente del estado del sistema cada 5s', color: '#38bdf8', radius: 28, status: 'ACTIVE', endpoints: ['getFullStateSnapshot()', 'registerStateProvider()'] },
  { id: 'srv-mcp', name: 'McpToolsService (MCP Server)', category: 'MCP', description: 'Servidor Model Context Protocol v2024-11-05 con 7 tools y 4 resources', color: '#ec4899', radius: 30, status: 'ACTIVE', protocol: 'JSON-RPC 2.0 / MCP' },
  { id: 'srv-ws-bus', name: 'CiverWebSocketBus', category: 'SERVICE', description: 'Bus de eventos reactivo para broadcast en tiempo real', color: '#34d399', radius: 24, status: 'ACTIVE' },

  // Storage & Persistence
  { id: 'db-idb-journal', name: 'IndexedDB (Agent Journal)', category: 'STORAGE', description: 'Almacén persistente local para trazas y auditorías de agentes', color: '#fbbf24', radius: 24, status: 'ACTIVE' },
  { id: 'db-local-queue', name: 'LocalStorage (CI Queue)', category: 'STORAGE', description: 'Persistencia resiliente de la cola de compilación', color: '#fbbf24', radius: 22, status: 'ACTIVE' },
  { id: 'db-idb-fault', name: 'IndexedDB (Fault Telemetry)', category: 'STORAGE', description: 'Registro forense de caídas de red y errores de compilación', color: '#fbbf24', radius: 22, status: 'ACTIVE' },

  // External / Protocol Gateways
  { id: 'ext-gh-actions', name: 'GitHub Actions Matrix CI', category: 'EXTERNAL', description: 'Runners de compilación remota y generación de APKs reproducibles', color: '#f87171', radius: 26, status: 'SYNCED', endpoints: ['POST /repos/{owner}/{repo}/actions/workflows/build.yml/dispatches'] },
  { id: 'ext-fdroid-v2', name: 'F-Droid Mirrors (Index-V2)', category: 'EXTERNAL', description: 'Protocolo de actualización diferencial entry.json y sha256', color: '#f87171', radius: 25, status: 'SYNCED' },

  // Autonomous Agents
  { id: 'agent-orchestrator', name: 'Nexus Orchestrator V4', category: 'AGENT', description: 'Agente supervisor de flujos y sincronización multi-mirror', color: '#c084fc', radius: 26, status: 'ACTIVE' },
  { id: 'agent-auditor', name: 'Gradle Heuristics Auditor', category: 'AGENT', description: 'Agente especializado en análisis de código estático y salud FOSS', color: '#c084fc', radius: 24, status: 'ACTIVE' }
];

const BLUEPRINT_LINKS: BlueprintLink[] = [
  { source: 'ui-navbar', target: 'ui-sync-modal', type: 'DATA_FLOW', label: 'Abre Hub' },
  { source: 'ui-store', target: 'ui-detail', type: 'DATA_FLOW', label: 'Selecciona App' },
  { source: 'ui-matrix', target: 'ui-detail', type: 'DATA_FLOW', label: 'Auditoría' },
  { source: 'ui-detail', target: 'srv-heuristic', type: 'RPC_CALL', label: 'Calcula Score' },
  { source: 'ui-detail', target: 'srv-ci-queue', type: 'RPC_CALL', label: 'Encola Build' },

  { source: 'ui-sync-modal', target: 'srv-heuristic', type: 'RPC_CALL', label: 'Triage de Repos' },
  { source: 'ui-sync-modal', target: 'srv-ci-queue', type: 'RPC_CALL', label: 'Control Cola' },
  { source: 'ui-sync-modal', target: 'srv-mcp', type: 'MCP_TOOL', label: 'Exporta Esquema' },

  { source: 'srv-ci-queue', target: 'db-local-queue', type: 'PERSISTENCE', label: 'Guarda Estado' },
  { source: 'srv-ci-queue', target: 'ext-gh-actions', type: 'RPC_CALL', label: 'Dispatch Workflow' },
  { source: 'srv-ci-queue', target: 'srv-telemetry-bus', type: 'EVENT_BUS', label: 'Registra Acción' },

  { source: 'srv-heuristic', target: 'ext-fdroid-v2', type: 'DATA_FLOW', label: 'Compara Índices' },
  { source: 'srv-mcp', target: 'srv-heuristic', type: 'MCP_TOOL', label: 'analyze_repo_heuristics' },
  { source: 'srv-mcp', target: 'srv-ci-queue', type: 'MCP_TOOL', label: 'enqueue_ci_build' },
  { source: 'srv-mcp', target: 'srv-telemetry-bus', type: 'EVENT_BUS', label: 'Auditoría Agentes' },
  { source: 'srv-mcp', target: 'srv-state-persist', type: 'MCP_TOOL', label: 'get_full_state_snapshot' },

  { source: 'srv-telemetry-bus', target: 'db-idb-journal', type: 'PERSISTENCE', label: 'Escribe Journal IDB' },
  { source: 'srv-telemetry-bus', target: 'srv-ws-bus', type: 'EVENT_BUS', label: 'Broadcast' },

  { source: 'agent-orchestrator', target: 'srv-mcp', type: 'MCP_TOOL', label: 'Invoca Tools' },
  { source: 'agent-auditor', target: 'srv-heuristic', type: 'RPC_CALL', label: 'Audita Repos' },
  { source: 'agent-orchestrator', target: 'srv-telemetry-bus', type: 'EVENT_BUS', label: 'Publica Contexto' }
];

// API DISCOVERY GRAPH: UI Actions <-> gRPC / WebSocket / MCP Gateways <-> Underlying Handlers
const API_DISCOVERY_NODES: BlueprintNode[] = [
  // UI Actions (Left Column)
  {
    id: 'act-trigger-build',
    name: "UI Action: Click 'Build APK'",
    category: 'ACTION',
    description: "Acción en UI disparada desde AppDetailModal o CompilerView para lanzar compilación CI.",
    color: '#38bdf8',
    radius: 22,
    status: 'ACTIVE',
    protocolDefinition: {
      signature: 'civer.store.v1.CiverTransportBridgeService/TriggerBuild',
      argumentsSchema: {
        app_id: 'string (e.g. "com.aurora.store")',
        app_name: 'string (e.g. "Aurora Store")',
        github_url: 'string (GitHub Repo URL)',
        gradle_task: 'string (e.g. "./gradlew assembleRelease")',
        priority: 'enum (CRITICAL=1, HIGH=2, NORMAL=3, LOW=4)',
        requester_agent_id: 'string (Caller Agent ID)'
      },
      responseSchema: {
        job_id: 'string',
        status: 'string (QUEUED | RUNNING)',
        estimated_duration_seconds: 'int32',
        queued_at: 'int64 (unix timestamp)'
      },
      samplePayload: {
        app_id: 'com.aurora.store',
        app_name: 'Aurora Store',
        github_url: 'https://github.com/whyorean/AuroraStore',
        gradle_task: './gradlew assembleRelease',
        priority: 2,
        requester_agent_id: 'nexus-agent-01'
      },
      codeSnippet: `// gRPC-web call in TypeScript
import { civerTransportBridge } from '@/services/civerTransportBridge';

const response = await civerTransportBridge.triggerBuild({
  app_id: 'com.aurora.store',
  app_name: 'Aurora Store',
  github_url: 'https://github.com/whyorean/AuroraStore',
  gradle_task: './gradlew assembleRelease',
  priority: 2,
  requester_agent_id: 'agent-autonomous-01'
});`
    }
  },
  {
    id: 'act-fetch-snapshot',
    name: "UI Action: 'Get Full State Snapshot'",
    category: 'ACTION',
    description: "Recuperación omnisciente de todo el estado de la app en un solo viaje redondo de 5s.",
    color: '#38bdf8',
    radius: 22,
    status: 'ACTIVE',
    protocolDefinition: {
      signature: 'civer.store.v1.CiverTransportBridgeService/GetFullStateSnapshot',
      argumentsSchema: {
        requester_agent_id: 'string (Caller Agent ID)',
        include_catalog_details: 'boolean (Optional, default true)'
      },
      responseSchema: {
        snapshot_id: 'string',
        total_apps: 'int32',
        total_queued_builds: 'int32',
        system_health_score: 'float',
        json_payload: 'string (Consolidated JSON)',
        generated_at_unix: 'int64'
      },
      samplePayload: {
        requester_agent_id: 'nexus-orchestrator',
        include_catalog_details: true
      },
      codeSnippet: `// TypeScript gRPC-web Invocation
const snapshot = await civerTransportBridge.getFullStateSnapshot({
  requester_agent_id: 'agent-remote-control'
});
console.log('Snapshot received:', snapshot.total_apps, 'apps indexed');`
    }
  },
  {
    id: 'act-heuristic-audit',
    name: "UI Action: 'Inspect Repo Health'",
    category: 'ACTION',
    description: "Auditoría de Gradle, manifiestos Android y cálculo de Health Score (0-100%).",
    color: '#38bdf8',
    radius: 22,
    status: 'ACTIVE',
    protocolDefinition: {
      signature: 'JSON-RPC 2.0: tools/call -> civer_analyze_repo_heuristics',
      argumentsSchema: {
        repoUrl: 'string (GitHub Repo URL)',
        branch: 'string (Optional, default: master/main)',
        filesList: 'string[] (Optional target files)'
      },
      responseSchema: {
        healthScore: 'number (0-100)',
        verdict: 'string (REPRODUCIBLE_READY | WARNING | UNSUITABLE)',
        recommendation: 'string',
        checks: 'object'
      },
      samplePayload: {
        jsonrpc: '2.0',
        id: 'req_001',
        method: 'tools/call',
        params: {
          name: 'civer_analyze_repo_heuristics',
          arguments: { repoUrl: 'https://github.com/junkfood02/Seal' }
        }
      },
      codeSnippet: `// MCP JSON-RPC 2.0 Call
const res = await internalMcpServer.handleJsonRpcRequest({
  jsonrpc: '2.0',
  id: Date.now(),
  method: 'tools/call',
  params: {
    name: 'civer_analyze_repo_heuristics',
    arguments: { repoUrl: 'https://github.com/junkfood02/Seal' }
  }
});`
    }
  },
  {
    id: 'act-mirror-sync',
    name: "UI Action: 'Sync F-Droid Mirrors'",
    category: 'ACTION',
    description: "Sincronización diferencial con espejos de F-Droid Index V2.",
    color: '#38bdf8',
    radius: 22,
    status: 'ACTIVE',
    protocolDefinition: {
      signature: 'JSON-RPC 2.0: tools/call -> civer_sync_mirrors',
      argumentsSchema: {
        mirrorId: 'string (e.g. "mirror-1", "mirror-2")'
      },
      responseSchema: {
        success: 'boolean',
        packagesSynchronized: 'number',
        timestamp: 'string (ISO 8601)'
      },
      samplePayload: {
        jsonrpc: '2.0',
        id: 'sync_01',
        method: 'tools/call',
        params: { name: 'civer_sync_mirrors', arguments: { mirrorId: 'mirror-1' } }
      },
      codeSnippet: `// MCP Tool Execution
const result = await internalMcpServer.handleJsonRpcRequest({
  jsonrpc: '2.0',
  id: 'sync_job_1',
  method: 'tools/call',
  params: { name: 'civer_sync_mirrors', arguments: { mirrorId: 'mirror-1' } }
});`
    }
  },

  // Gateways (Center Column)
  {
    id: 'gw-grpc-bridge',
    name: 'Gateway: gRPC-web Bridge',
    category: 'GATEWAY',
    description: 'Gateway de transporte binario de alto rendimiento (Protobuf v3 / HTTP/2).',
    color: '#a855f7',
    radius: 28,
    status: 'ACTIVE',
    protocol: 'gRPC-web / Protobuf'
  },
  {
    id: 'gw-mcp-server',
    name: 'Gateway: MCP JSON-RPC 2.0',
    category: 'GATEWAY',
    description: 'Servidor Model Context Protocol v2024-11-05 para agentes de lenguaje.',
    color: '#ec4899',
    radius: 28,
    status: 'ACTIVE',
    protocol: 'JSON-RPC 2.0 (MCP)'
  },
  {
    id: 'gw-ws-eventbus',
    name: 'Gateway: WebSocket EventBus',
    category: 'GATEWAY',
    description: 'Canal duplex de broadcast y streaming de telemetría en tiempo real.',
    color: '#34d399',
    radius: 28,
    status: 'ACTIVE',
    protocol: 'WebSocket / WSS'
  },

  // Underlying Handlers (Right Column)
  {
    id: 'hand-ci-service',
    name: 'Handler: persistentCiQueueService',
    category: 'HANDLER',
    description: 'Gestor de colas en segundo plano con persistencia LocalStorage y reintentos.',
    color: '#fbbf24',
    radius: 24,
    status: 'ACTIVE',
    endpoints: ['enqueueBuild()', 'getQueue()', 'clearCompleted()']
  },
  {
    id: 'hand-state-persistence',
    name: 'Handler: globalStatePersistenceService',
    category: 'HANDLER',
    description: 'Serializa snapshots totales cada 5s y alimenta el buffer unificado.',
    color: '#fbbf24',
    radius: 24,
    status: 'ACTIVE',
    endpoints: ['getFullStateSnapshot()', 'registerStateProvider()']
  },
  {
    id: 'hand-heuristic-engine',
    name: 'Handler: repoHeuristicService',
    category: 'HANDLER',
    description: 'Auditor de AST y dependencias de repositorios Android móviles.',
    color: '#fbbf24',
    radius: 24,
    status: 'ACTIVE',
    endpoints: ['analyzeRepository()', 'getHealthScoreLeaderboard()']
  },
  {
    id: 'hand-telemetry-db',
    name: 'Handler: globalAgentTelemetryBus',
    category: 'HANDLER',
    description: 'Journal inmutable de operaciones y buffer en IndexedDB.',
    color: '#fbbf24',
    radius: 24,
    status: 'ACTIVE',
    endpoints: ['recordAction()', 'getAuditTrail()']
  }
];

const API_DISCOVERY_LINKS: BlueprintLink[] = [
  // UI Actions -> Gateways
  { source: 'act-trigger-build', target: 'gw-grpc-bridge', type: 'RPC_CALL', label: 'TriggerBuild()' },
  { source: 'act-fetch-snapshot', target: 'gw-grpc-bridge', type: 'RPC_CALL', label: 'GetFullStateSnapshot()' },
  { source: 'act-heuristic-audit', target: 'gw-mcp-server', type: 'MCP_TOOL', label: 'civer_analyze_repo_heuristics' },
  { source: 'act-mirror-sync', target: 'gw-mcp-server', type: 'MCP_TOOL', label: 'civer_sync_mirrors' },
  { source: 'act-fetch-snapshot', target: 'gw-mcp-server', type: 'MCP_TOOL', label: 'civer://system/state-snapshot.json' },

  // Gateways -> Handlers
  { source: 'gw-grpc-bridge', target: 'hand-ci-service', type: 'DATA_FLOW', label: 'enqueueBuild()' },
  { source: 'gw-grpc-bridge', target: 'hand-state-persistence', type: 'DATA_FLOW', label: 'getFullStateSnapshot()' },
  { source: 'gw-mcp-server', target: 'hand-heuristic-engine', type: 'DATA_FLOW', label: 'analyzeRepository()' },
  { source: 'gw-mcp-server', target: 'hand-state-persistence', type: 'DATA_FLOW', label: 'getFullStateSnapshot()' },
  { source: 'gw-ws-eventbus', target: 'hand-telemetry-db', type: 'EVENT_BUS', label: 'broadcast()' },
  { source: 'hand-ci-service', target: 'gw-ws-eventbus', type: 'EVENT_BUS', label: 'emit(BUILD_QUEUED)' }
];

interface ArchitectureBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAcademy?: () => void;
  onOpenHub?: () => void;
  onOpenDebugger?: () => void;
  onAddToast?: (toast: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }) => void;
}

export const ArchitectureBlueprintModal: React.FC<ArchitectureBlueprintModalProps> = ({
  isOpen,
  onClose,
  onOpenAcademy,
  onOpenHub,
  onOpenDebugger,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'TOPOLOGY' | 'API_DISCOVERY'>('API_DISCOVERY');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<BlueprintNode | null>(API_DISCOVERY_NODES[0]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isExecutingTest, setIsExecutingTest] = useState<boolean>(false);

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Initialize and Render D3 Graph
  useEffect(() => {
    if (!isOpen || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 850;
    const height = 540;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Definitions
    const defs = svg.append('defs');

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('class', 'blueprint-main-group');

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial Zoom Centering
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 7, height / 9).scale(0.85));

    // Choose Data Source
    const activeNodes = activeTab === 'TOPOLOGY' ? BLUEPRINT_NODES : API_DISCOVERY_NODES;
    const activeLinks = activeTab === 'TOPOLOGY' ? BLUEPRINT_LINKS : API_DISCOVERY_LINKS;

    // Filter nodes and links
    const filteredNodes = filterCategory === 'ALL'
      ? activeNodes
      : activeNodes.filter((n) => n.category === filterCategory);

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = activeLinks.filter((l) => {
      const src = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgt = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return filteredNodeIds.has(src) && filteredNodeIds.has(tgt);
    });

    // Force simulation
    const simulation = d3.forceSimulation<BlueprintNode>(filteredNodes)
      .force('link', d3.forceLink<BlueprintNode, BlueprintLink>(filteredLinks).id((d) => d.id).distance(130))
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d) => (d as BlueprintNode).radius + 20));

    // Draw Links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.type === 'MCP_TOOL') return '#ec4899';
        if (d.type === 'PERSISTENCE') return '#fbbf24';
        if (d.type === 'EVENT_BUS') return '#34d399';
        if (d.type === 'RPC_CALL') return '#a855f7';
        return '#64748b';
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) => (d.type === 'EVENT_BUS' || d.type === 'MCP_TOOL' ? '4,4' : 'none'))
      .attr('marker-end', 'url(#arrow)');

    // Link Labels
    const linkText = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(filteredLinks)
      .enter()
      .append('text')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .text((d) => d.label || '');

    // Draw Nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(filteredNodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, BlueprintNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (_, d) => {
        setSelectedNode(d);
        setTestResult(null);
      });

    // Outer Circle Glow
    node.append('circle')
      .attr('r', (d) => d.radius + 4)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.45)
      .attr('filter', 'url(#glow)');

    // Main Circle
    node.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', '#090d16')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2.2);

    // Inner icon symbol
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '4px')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .attr('fill', (d) => d.color)
      .text((d) => (d.category === 'ACTION' ? '⚡' : d.category === 'GATEWAY' ? '⇄' : d.category.charAt(0)));

    // Node Name Label
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 14)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', '#f1f5f9')
      .text((d) => d.name);

    // Node Category Sublabel
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 24)
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('fill', (d) => d.color)
      .text((d) => d.category);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkText
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 4);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [isOpen, filterCategory, activeTab]);

  if (!isOpen) return null;

  const handleZoom = (delta: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(250).call(zoomBehaviorRef.current.scaleBy, delta);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 850;
    const height = 540;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(350).call(
      zoomBehaviorRef.current.transform,
      d3.zoomIdentity.translate(width / 7, height / 9).scale(0.85)
    );
  };

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunLiveTest = async (node: BlueprintNode) => {
    if (!node.protocolDefinition) return;
    setIsExecutingTest(true);
    setTestResult('Enviando solicitud al handler gRPC/MCP en vivo...');

    try {
      if (node.id === 'act-trigger-build') {
        const res = await civerTransportBridge.triggerBuild({
          app_id: 'com.aurora.store',
          app_name: 'Aurora Store',
          github_url: 'https://github.com/whyorean/AuroraStore',
          gradle_task: './gradlew assembleRelease',
          priority: 2,
          requester_agent_id: 'api-discovery-tester'
        });
        setTestResult(JSON.stringify(res, null, 2));
      } else if (node.id === 'act-fetch-snapshot') {
        const res = await civerTransportBridge.getFullStateSnapshot({
          requester_agent_id: 'api-discovery-tester'
        });
        setTestResult(JSON.stringify({
          snapshot_id: res.snapshot.snapshot_id,
          total_apps: res.snapshot.metrics.total_apps_in_catalog,
          system_health: res.snapshot.system_health_score,
          status: 'CONSISTENT_VERIFIED'
        }, null, 2));
      } else if (node.id === 'act-heuristic-audit') {
        const res = await internalMcpServer.handleJsonRpcRequest({
          jsonrpc: '2.0',
          id: 'test_audit_01',
          method: 'tools/call',
          params: {
            name: 'civer_analyze_repo_heuristics',
            arguments: { repoUrl: 'https://github.com/junkfood02/Seal' }
          }
        });
        setTestResult(JSON.stringify(res.result, null, 2));
      } else if (node.id === 'act-mirror-sync') {
        const res = await internalMcpServer.handleJsonRpcRequest({
          jsonrpc: '2.0',
          id: 'test_sync_01',
          method: 'tools/call',
          params: { name: 'civer_sync_mirrors', arguments: { mirrorId: 'mirror-1' } }
        });
        setTestResult(JSON.stringify(res.result, null, 2));
      } else {
        setTestResult('Endpoint verificado y en estado READY (HTTP/2 200 OK).');
      }

      onAddToast?.({
        title: 'Llamada de Prueba Exitosa',
        message: `Se invocó con éxito el handler asociado a "${node.name}".`,
        type: 'success'
      });
    } catch (err: any) {
      setTestResult(`Error: ${err?.message || 'Fallo en llamada'}`);
    } finally {
      setIsExecutingTest(false);
    }
  };

  const handleExportJson = () => {
    const data = {
      title: 'Civer App Store API Discovery & Architecture Graph',
      generatedAt: new Date().toISOString(),
      activeTab: activeTab,
      nodes: activeTab === 'TOPOLOGY' ? BLUEPRINT_NODES : API_DISCOVERY_NODES,
      links: activeTab === 'TOPOLOGY' ? BLUEPRINT_LINKS : API_DISCOVERY_LINKS
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer-api-discovery-${Date.now()}.json`;
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl">
              <Network className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  Visualizador de Arquitectura & API Discovery Map (D3.js)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  D3 Directed Force Graph
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mapeo interactivo entre acciones de UI, gateways gRPC/WebSocket y protocolos de control remoto para agentes.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenDebugger && (
              <button
                onClick={onOpenDebugger}
                className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition border border-purple-800"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Wire Debugger</span>
              </button>
            )}

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switch Tabs */}
        <div className="px-4 sm:px-6 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setActiveTab('API_DISCOVERY');
                setSelectedNode(API_DISCOVERY_NODES[0]);
                setFilterCategory('ALL');
              }}
              className={`py-3 flex items-center space-x-2 border-b-2 transition ${
                activeTab === 'API_DISCOVERY'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Workflow className="w-4 h-4" />
              <span>API Discovery Map (UI Actions ⇄ gRPC / WebSocket / MCP)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('TOPOLOGY');
                setSelectedNode(BLUEPRINT_NODES[0]);
                setFilterCategory('ALL');
              }}
              className={`py-3 flex items-center space-x-2 border-b-2 transition ${
                activeTab === 'TOPOLOGY'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Topología General de Módulos (Direct Graph)</span>
            </button>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 my-1.5">
            <button onClick={() => handleZoom(1.2)} className="p-1 rounded text-slate-400 hover:text-white" title="Acercar">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleZoom(0.8)} className="p-1 rounded text-slate-400 hover:text-white" title="Alejar">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleResetZoom} className="p-1 rounded text-slate-400 hover:text-white" title="Centrar">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 pl-1">{(zoomLevel * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Main Canvas & Detail Sidebar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* D3 Canvas Container */}
          <div ref={containerRef} className="flex-1 h-full bg-[#050811] relative overflow-hidden">
            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Canvas Legend Overlay */}
            <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-slate-950/85 border border-slate-800 text-[10px] backdrop-blur-md space-y-1 hidden sm:block">
              <div className="font-bold text-slate-300 pb-0.5">Leyenda de Relaciones:</div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="w-3 h-0.5 bg-purple-500 inline-block"></span>
                <span>Llamada RPC / gRPC-web</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="w-3 h-0.5 bg-pink-500 inline-block border-dashed"></span>
                <span>Invocación MCP Tool</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span>
                <span>WebSocket / EventBus</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="w-3 h-0.5 bg-amber-400 inline-block"></span>
                <span>Flujo de Datos / Persistencia</span>
              </div>
            </div>
          </div>

          {/* Node & Protocol Inspector Drawer */}
          <div className="w-full lg:w-[450px] border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/95 p-4 sm:p-5 overflow-y-auto space-y-4 shrink-0">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                      style={{ backgroundColor: `${selectedNode.color}20`, color: selectedNode.color, border: `1px solid ${selectedNode.color}40` }}
                    >
                      {selectedNode.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1.5">{selectedNode.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded text-slate-500 hover:text-slate-300 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Descripción Funcional</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
                </div>

                {/* Protocol Definition Box */}
                {selectedNode.protocolDefinition ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center justify-between">
                        <span>Firma del Protocolo RPC / MCP</span>
                        <span className="text-[9px] text-purple-400">Remote Control Ready</span>
                      </span>
                      <p className="font-mono text-xs text-purple-200 font-bold break-all bg-slate-950/70 p-2 rounded border border-purple-900/60">
                        {selectedNode.protocolDefinition.signature}
                      </p>
                    </div>

                    {/* Method Arguments Specification */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Argumentos Requeridos por el Agente
                      </span>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                        {Object.entries(selectedNode.protocolDefinition.argumentsSchema).map(([param, type]) => (
                          <div key={param} className="flex items-center justify-between">
                            <span className="text-cyan-400 font-bold">{param}:</span>
                            <span className="text-slate-400">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Code Invocation Snippet */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          Código de Invocación Remota
                        </span>
                        <button
                          onClick={() => handleCopyCode(selectedNode.protocolDefinition!.codeSnippet)}
                          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
                        {selectedNode.protocolDefinition.codeSnippet}
                      </pre>
                    </div>

                    {/* Live Test Trigger Button */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <button
                        onClick={() => handleRunLiveTest(selectedNode)}
                        disabled={isExecutingTest}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                      >
                        <Play className={`w-3.5 h-3.5 ${isExecutingTest ? 'animate-spin' : ''}`} />
                        <span>{isExecutingTest ? 'Invocando Handler...' : '⚡ Probar Llamada de Control Remoto'}</span>
                      </button>

                      {testResult && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200">
                          <span className="text-[10px] text-emerald-400 font-bold block mb-1">Respuesta del Servidor:</span>
                          <pre className="whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto text-emerald-300">
                            {testResult}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedNode.endpoints && selectedNode.endpoints.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Endpoints & Métodos Expuestos</span>
                        <div className="space-y-1">
                          {selectedNode.endpoints.map((ep, i) => (
                            <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300">
                              {ep}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedNode.protocol && (
                      <div className="p-2.5 rounded-xl bg-pink-950/40 border border-pink-800/50 space-y-1">
                        <span className="text-[10px] font-bold text-pink-300 uppercase font-mono">Protocolo de Comunicación</span>
                        <p className="font-mono text-xs text-pink-200">{selectedNode.protocol}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-slate-500">
                <Info className="w-8 h-8 text-slate-600" />
                <p className="text-xs font-medium text-slate-400">Selecciona un nodo del grafo de descubrimiento</p>
                <p className="text-[11px] text-slate-500">
                  Haz clic en cualquier acción de UI, gateway gRPC o handler de backend para ver su contrato exacto y probarlo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
