import React, { useState, useEffect } from 'react';
import {
  X,
  FileCode,
  Network,
  Play,
  Copy,
  Check,
  Download,
  Terminal,
  Server,
  Zap,
  Shield,
  Layers,
  Sparkles,
  Bot,
  Radio,
  ExternalLink,
  ChevronRight,
  Code
} from 'lucide-react';
import { civerTransportBridge, BuildPriority, PatchType } from '../services/civerTransportBridge';
import { internalMcpServer } from '../services/internalMcpServer';
import { globalStatePersistenceService } from '../services/globalStatePersistenceService';
import { repoHeuristicApi } from '../services/repoHeuristicService';
import { serviceRegistry } from '../services/serviceRegistry';
import { agentKnowledgeRegistry } from '../services/agentKnowledgeRegistry';

interface AgentAPIExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (toast: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }) => void;
}

interface EndpointDefinition {
  id: string;
  protocol: 'gRPC-web' | 'MCP JSON-RPC' | 'WebSocket' | 'REST';
  method: 'POST' | 'GET' | 'RPC' | 'WS';
  path: string;
  title: string;
  description: string;
  category: 'CI/CD' | 'CATALOG' | 'HEURISTICS' | 'TELEMETRY' | 'ORCHESTRATION' | 'SYSTEM';
  requestSchema: Record<string, any>;
  samplePayload: Record<string, any>;
}

const API_CATALOG: EndpointDefinition[] = [
  // gRPC-web Bridge Endpoints
  {
    id: 'grpc-trigger-build',
    protocol: 'gRPC-web',
    method: 'RPC',
    path: 'civer.store.v1.CiverTransportBridgeService/TriggerBuild',
    title: 'Trigger CI Compilation Build',
    description: 'Encola una tarea determinista en GitHub Actions Matrix CI con prioridad y parámetros Gradle.',
    category: 'CI/CD',
    requestSchema: {
      app_id: 'string (required)',
      app_name: 'string (required)',
      github_url: 'string (required)',
      gradle_task: 'string (default: ./gradlew assembleRelease)',
      priority: 'BUILD_PRIORITY_CRITICAL | BUILD_PRIORITY_HIGH | BUILD_PRIORITY_NORMAL',
      requester_agent_id: 'string'
    },
    samplePayload: {
      app_id: 'com.aurora.store',
      app_name: 'Aurora Store',
      github_url: 'https://github.com/whyorean/AuroraStore',
      gradle_task: './gradlew assembleRelease',
      priority: 'BUILD_PRIORITY_HIGH',
      requester_agent_id: 'api-explorer-agent'
    }
  },
  {
    id: 'grpc-get-full-snapshot',
    protocol: 'gRPC-web',
    method: 'RPC',
    path: 'civer.store.v1.CiverTransportBridgeService/GetFullStateSnapshot',
    title: 'Get Full State Snapshot (5s Consolidation)',
    description: 'Devuelve en una sola ida y vuelta el estado omnisciente de todo el catálogo, cola CI, agentes activos y telemetría.',
    category: 'SYSTEM',
    requestSchema: {
      requester_agent_id: 'string',
      include_catalog_details: 'boolean'
    },
    samplePayload: {
      requester_agent_id: 'api-explorer-agent',
      include_catalog_details: true
    }
  },
  {
    id: 'grpc-deploy-patch',
    protocol: 'gRPC-web',
    method: 'RPC',
    path: 'civer.store.v1.CiverTransportBridgeService/DeployPatch',
    title: 'Deploy Native Bytecode .so Patch',
    description: 'Aplica un parche binario delta en tiempo de ejecución para modificar símbolos o resolver fallos.',
    category: 'ORCHESTRATION',
    requestSchema: {
      app_id: 'string (required)',
      patch_type: 'PATCH_TYPE_SO_BYTECODE | PATCH_TYPE_GRADLE_HEURISTIC',
      patch_payload_base64: 'string',
      requester_agent_id: 'string'
    },
    samplePayload: {
      app_id: 'org.torproject.android',
      patch_type: 'PATCH_TYPE_SO_BYTECODE',
      patch_payload_base64: 'UEsDBBQAAAAIAAA=',
      requester_agent_id: 'security-patcher-01'
    }
  },
  {
    id: 'grpc-sync-mirrors',
    protocol: 'gRPC-web',
    method: 'RPC',
    path: 'civer.store.v1.CiverTransportBridgeService/SyncMirrors',
    title: 'Sync F-Droid Index V2 Mirrors',
    description: 'Ejecuta sincronización diferencial de espejos de F-Droid y actualiza metadatos.',
    category: 'CATALOG',
    requestSchema: {
      mirror_id: 'string (e.g. mirror-1)',
      requester_agent_id: 'string'
    },
    samplePayload: {
      mirror_id: 'mirror-1',
      requester_agent_id: 'repo-sync-worker'
    }
  },

  // MCP JSON-RPC 2.0 Tools
  {
    id: 'mcp-execute-recipe',
    protocol: 'MCP JSON-RPC',
    method: 'POST',
    path: 'mcp://tools/call -> civer_execute_recipe',
    title: 'Execute Multi-Step Recipe Flow',
    description: 'Ejecuta un flujo de tareas multi-paso (sync -> build -> audit -> publish) con auto-healing heurístico.',
    category: 'ORCHESTRATION',
    requestSchema: {
      recipeId: 'string (required)',
      executorAgentId: 'string',
      simulatedFailureStep: 'string (optional)'
    },
    samplePayload: {
      recipeId: 'sync-build-audit-publish',
      executorAgentId: 'nexus-orchestrator',
      simulatedFailureStep: ''
    }
  },
  {
    id: 'mcp-browse-catalog',
    protocol: 'MCP JSON-RPC',
    method: 'POST',
    path: 'mcp://tools/call -> civer_browse_catalog',
    title: 'Browse FOSS Catalog with Heuristic Filters',
    description: 'Consulta y filtra aplicaciones por categoría, texto, arquitectura y puntuación de salud.',
    category: 'CATALOG',
    requestSchema: {
      category: 'string',
      searchQuery: 'string',
      minHealthScore: 'number',
      requireZeroTrackers: 'boolean',
      limit: 'number'
    },
    samplePayload: {
      category: 'ALL',
      searchQuery: 'store',
      minHealthScore: 80,
      requireZeroTrackers: true,
      limit: 10
    }
  },
  {
    id: 'mcp-health-scores',
    protocol: 'MCP JSON-RPC',
    method: 'POST',
    path: 'mcp://tools/call -> civer_get_health_scores',
    title: 'Audit Repository AST Health Scores',
    description: 'Calcula el ranking de salud estática de repositorios móviles de código abierto.',
    category: 'HEURISTICS',
    requestSchema: {
      minScore: 'number',
      category: 'string',
      requireReproducible: 'boolean',
      limit: 'number'
    },
    samplePayload: {
      minScore: 85,
      requireReproducible: true,
      limit: 5
    }
  },
  {
    id: 'mcp-knowledge-registry',
    protocol: 'MCP JSON-RPC',
    method: 'POST',
    path: 'mcp://tools/call -> civer_query_knowledge_registry',
    title: 'Query System Knowledge & Codebase DNA',
    description: 'Consulta programáticamente el AST, servicios, contratos y esquemas de persistencia del sistema.',
    category: 'SYSTEM',
    requestSchema: {
      query: 'string',
      category: 'string'
    },
    samplePayload: {
      query: 'recipe',
      category: 'ORCHESTRATION'
    }
  }
];

export const AgentAPIExplorerModal: React.FC<AgentAPIExplorerModalProps> = ({
  isOpen,
  onClose,
  onAddToast
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDefinition>(API_CATALOG[0]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeProtocol, setActiveProtocol] = useState<string>('ALL');
  const [payloadInput, setPayloadInput] = useState<string>(
    JSON.stringify(API_CATALOG[0].samplePayload, null, 2)
  );
  const [agentPersona, setAgentPersona] = useState<string>('Nexus-Orchestrator');
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDurationMs, setResponseDurationMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOpenApi, setCopiedOpenApi] = useState(false);

  useEffect(() => {
    setPayloadInput(JSON.stringify(selectedEndpoint.samplePayload, null, 2));
    setResponseOutput(null);
    setResponseStatus(null);
    setResponseDurationMs(null);
  }, [selectedEndpoint]);

  if (!isOpen) return null;

  const filteredEndpoints = API_CATALOG.filter((ep) => {
    if (activeCategory !== 'ALL' && ep.category !== activeCategory) return false;
    if (activeProtocol !== 'ALL' && ep.protocol !== activeProtocol) return false;
    return true;
  });

  const handleExecuteTryItOut = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(payloadInput);
      } catch {
        parsedPayload = {};
      }

      let result: any = null;

      if (selectedEndpoint.id === 'grpc-trigger-build') {
        const payload: any = parsedPayload;
        result = await civerTransportBridge.triggerBuild({
          app_id: payload.app_id || 'com.aurora.store',
          app_name: payload.app_name || 'Aurora Store',
          github_url: payload.github_url || 'https://github.com/whyorean/AuroraStore',
          gradle_task: payload.gradle_task || './gradlew assembleRelease',
          priority: BuildPriority.BUILD_PRIORITY_HIGH,
          requester_agent_id: agentPersona
        });
      } else if (selectedEndpoint.id === 'grpc-get-full-snapshot') {
        result = await civerTransportBridge.getFullStateSnapshot({
          requester_agent_id: agentPersona,
          include_catalog_details: true
        });
      } else if (selectedEndpoint.id === 'grpc-deploy-patch') {
        const payload: any = parsedPayload;
        result = await civerTransportBridge.deployPatch({
          app_id: payload.app_id || 'org.torproject.android',
          version_name: payload.version_name || '1.0.4',
          patch_type: PatchType.PATCH_TYPE_DELTA_SO,
          binary_hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          delta_payload: 'UEsDBBQAAAAIAAA=',
          deployer_agent_id: agentPersona
        });
      } else if (selectedEndpoint.id === 'grpc-sync-mirrors') {
        result = await civerTransportBridge.syncMirrors({
          mirror_id: (parsedPayload as any).mirror_id || 'mirror-1',
          force_full_resync: (parsedPayload as any).force_full_resync ?? true
        });
      } else if (selectedEndpoint.protocol === 'MCP JSON-RPC') {
        const toolName = selectedEndpoint.path.split('-> ')[1];
        const res = await internalMcpServer.handleJsonRpcRequest({
          jsonrpc: '2.0',
          id: `explorer-${Date.now()}`,
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: parsedPayload
          }
        });
        result = res;
      }

      const end = performance.now();
      setResponseDurationMs(Math.round(end - start));
      setResponseStatus(200);
      setResponseOutput(result);

      onAddToast?.({
        title: 'Llamada API Exitosa',
        message: `${selectedEndpoint.title} respondió con 200 OK (${Math.round(end - start)}ms).`,
        type: 'success'
      });
    } catch (err: any) {
      const end = performance.now();
      setResponseDurationMs(Math.round(end - start));
      setResponseStatus(500);
      setResponseOutput({
        error: {
          code: 500,
          message: err.message || 'Error en ejecución de servicio',
          stack: err.stack
        }
      });
      onAddToast?.({
        title: 'Error de Llamada',
        message: err.message || 'Error al ejecutar endpoint',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySnippet = () => {
    const snippet = `// Invocación generada para ${selectedEndpoint.title}
import { civerTransportBridge } from '@/services/civerTransportBridge';
import { internalMcpServer } from '@/services/internalMcpServer';

const response = await ${
      selectedEndpoint.protocol === 'gRPC-web'
        ? `civerTransportBridge.${selectedEndpoint.path.split('/')[1]?.toLowerCase().replace(/^./, (c) => c.toLowerCase()) || 'call'}(${payloadInput});`
        : `internalMcpServer.handleJsonRpcRequest({ jsonrpc: '2.0', method: 'tools/call', params: { name: '${selectedEndpoint.path.split('-> ')[1]}', arguments: ${payloadInput} } });`
    }`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportOpenApi = () => {
    const openApiJson = serviceRegistry.getJsonSchema();
    const blob = new Blob([openApiJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer-openapi-3.1-spec-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onAddToast?.({
      title: 'OpenAPI 3.1 Exportada',
      message: 'Especificación descargada en formato JSON estándar.',
      type: 'success'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-950 border border-purple-800 rounded-xl">
              <Network className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  Agent API Explorer & Interactive Swagger / gRPC-web Console
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Live OpenAPI 3.1 & Protobuf v3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Documentación interactiva auto-generada para gRPC-web, Model Context Protocol (MCP) y WebSocket EventBus con consola "Try it out".
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportOpenApi}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Exportar OpenAPI 3.1</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Persona Bar */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-mono">Protocolo:</span>
            {['ALL', 'gRPC-web', 'MCP JSON-RPC'].map((proto) => (
              <button
                key={proto}
                onClick={() => setActiveProtocol(proto)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                  activeProtocol === proto
                    ? 'bg-purple-950 text-purple-300 border border-purple-700'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {proto}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-mono">Persona Agéntica:</span>
            <select
              value={agentPersona}
              onChange={(e) => setAgentPersona(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="Nexus-Orchestrator">Nexus-Orchestrator (Leader)</option>
              <option value="Gradle-Auditor-V4">Gradle-Auditor-V4 (AST Engine)</option>
              <option value="Security-Guardian">Security-Guardian (0-Trackers)</option>
              <option value="Release-Manager">Release-Manager (CI Pipeline)</option>
            </select>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Endpoint Catalog */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/50 flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Endpoints & RPC Methods ({filteredEndpoints.length})
            </div>
            <div className="p-2 space-y-1">
              {filteredEndpoints.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                const protoColor =
                  ep.protocol === 'gRPC-web'
                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                    : 'bg-purple-950 text-purple-300 border-purple-800';

                return (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEndpoint(ep)}
                    className={`w-full text-left p-2.5 rounded-lg border transition space-y-1 ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-600 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border ${protoColor}`}>
                        {ep.protocol}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {ep.category}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 truncate">
                      {ep.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {ep.path}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Interactive Swagger Console */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Endpoint Hero Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    {selectedEndpoint.protocol}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100">
                    {selectedEndpoint.title}
                  </h3>
                </div>
                <button
                  onClick={handleCopySnippet}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition font-mono"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copiado' : 'Copiar TS Snippet'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400">
                {selectedEndpoint.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-300">
                <span className="text-purple-400 font-bold">RPC/URI:</span> {selectedEndpoint.path}
              </div>
            </div>

            {/* Parameter Schema & Payload Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Request Schema Specs */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 font-mono uppercase">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Request Schema Contract</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300">
                  <pre>{JSON.stringify(selectedEndpoint.requestSchema, null, 2)}</pre>
                </div>
              </div>

              {/* Live Payload Editor */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 font-mono uppercase">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Payload Input (JSON)</span>
                  </div>
                  <button
                    onClick={() => setPayloadInput(JSON.stringify(selectedEndpoint.samplePayload, null, 2))}
                    className="text-[10px] font-mono text-purple-400 hover:underline"
                  >
                    Restaurar Ejemplo
                  </button>
                </div>
                <textarea
                  value={payloadInput}
                  onChange={(e) => setPayloadInput(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Try It Out Trigger */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleExecuteTryItOut}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-900/30"
              >
                <Play className="w-4 h-4" />
                <span>{isLoading ? 'Ejecutando llamada RPC...' : 'Try It Out (Simular Llamada Agéntica)'}</span>
              </button>

              {responseStatus && (
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Status: {responseStatus} OK
                  </span>
                  <span className="text-slate-400">
                    Latencia: <strong className="text-purple-300">{responseDurationMs}ms</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Live Server Response Inspector */}
            {responseOutput && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase">
                    Response Output (Wire Packet / JSON)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(responseOutput, null, 2));
                      onAddToast?.({ title: 'Copiado', message: 'Respuesta copiada al portapapeles', type: 'info' });
                    }}
                    className="text-[10px] font-mono text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copiar Respuesta
                  </button>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 max-h-72 overflow-y-auto font-mono text-xs text-emerald-300">
                  <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
