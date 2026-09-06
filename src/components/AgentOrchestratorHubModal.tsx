import React, { useEffect, useState } from 'react';
import {
  X,
  Bot,
  Activity,
  Cpu,
  ShieldAlert,
  Radio,
  Terminal,
  RefreshCw,
  Plus,
  Layers,
  GraduationCap,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Link2,
  Copy,
  Check,
  FileCode,
  Network,
  Zap,
  Play,
  TrendingUp
} from 'lucide-react';
import {
  globalAgentTelemetryBus,
  AgentActionLog,
  ActiveAgentState,
  AgentContextItem
} from '../services/globalAgentTelemetryBus';
import { globalAgentEventBus, AgentEventMessage } from '../services/globalAgentEventBus';
import { civerTransportBridge, BuildPriority, PatchType } from '../services/civerTransportBridge';
import { serviceRegistry } from '../services/serviceRegistry';
import { AgentTelemetryAuditView } from './AgentTelemetryAuditView';
import { AgentLifecycleVisualizer } from './AgentLifecycleVisualizer';
import { internalMcpServer } from '../services/internalMcpServer';
import { repoHeuristicApi } from '../services/repoHeuristicService';

interface AgentOrchestratorHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAcademy?: () => void;
  onOpenBlueprint?: () => void;
  onOpenDocs?: () => void;
}

type TabType = 'AGENTS' | 'LIFECYCLE_TIMELINE' | 'DECISION_LOGS' | 'WEBSOCKET_BUS' | 'GRPC_BRIDGE' | 'OPENAPI_REGISTRY' | 'MCP_CONNECTIONS' | 'SHARED_CONTEXT';

export const AgentOrchestratorHubModal: React.FC<AgentOrchestratorHubModalProps> = ({
  isOpen,
  onClose,
  onOpenAcademy,
  onOpenBlueprint,
  onOpenDocs
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('AGENTS');
  const [agents, setAgents] = useState<ActiveAgentState[]>([]);
  const [logs, setLogs] = useState<AgentActionLog[]>([]);
  const [sharedContext, setSharedContext] = useState<Record<string, AgentContextItem>>({});
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-orchestrator-01');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [copiedContext, setCopiedContext] = useState(false);
  const [copiedOpenApi, setCopiedOpenApi] = useState(false);
  const [copiedProto, setCopiedProto] = useState(false);

  // MCP JSON-RPC 2.0 Live Tester State
  const [mcpMethod, setMcpMethod] = useState<string>('tools/call');
  const [mcpToolName, setMcpToolName] = useState<string>('civer_get_health_scores');
  const [mcpRawPayload, setMcpRawPayload] = useState<string>(
    JSON.stringify({ minScore: 80, limit: 5 }, null, 2)
  );
  const [mcpResponse, setMcpResponse] = useState<any>(null);
  const [mcpLoading, setMcpLoading] = useState(false);

  // WebSocket Live Events
  const [wsEvents, setWsEvents] = useState<AgentEventMessage[]>([]);
  const [simulatedEventType, setSimulatedEventType] = useState<'BUILD_COMPLETED' | 'REPO_SYNC_STATUS' | 'USER_STATE_CHANGED'>('BUILD_COMPLETED');
  const [simulatedEventPayload, setSimulatedEventPayload] = useState('{"appId": "org.fdroid.fdroid", "status": "SUCCESS"}');

  // gRPC Bridge invocation test
  const [grpcMethod, setGrpcMethod] = useState<'TriggerBuild' | 'GetAppStats' | 'DeployPatch'>('TriggerBuild');
  const [grpcAppId, setGrpcAppId] = useState('org.torproject.android');
  const [grpcResponse, setGrpcResponse] = useState<any>(null);
  const [grpcLoading, setGrpcLoading] = useState(false);

  // Task Dispatch State
  const [isDispatching, setIsDispatching] = useState(false);
  const [taskPrompt, setTaskPrompt] = useState('');
  const [taskTarget, setTaskTarget] = useState('agent-orchestrator-01');

  const refreshData = () => {
    setAgents(globalAgentTelemetryBus.getActiveAgents());
    setLogs(globalAgentTelemetryBus.getAuditTrail());
    setSharedContext(globalAgentTelemetryBus.getSharedContext());
    setWsEvents(globalAgentEventBus.getHistory());
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshData();

    const unsubscribeTelemetry = globalAgentTelemetryBus.subscribe(() => {
      refreshData();
    });

    const unsubscribeEvents = globalAgentEventBus.subscribe('*', (evt) => {
      setWsEvents((prev) => [evt, ...prev.slice(0, 100)]);
    });

    return () => {
      unsubscribeTelemetry();
      unsubscribeEvents();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = filterRole === 'ALL'
    ? logs
    : logs.filter((l) => l.agentRole === filterRole);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const handleDispatchTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskPrompt.trim()) return;

    setIsDispatching(true);
    const targetAgent = agents.find((a) => a.id === taskTarget);

    await globalAgentTelemetryBus.logAgentAction({
      agentId: taskTarget,
      agentName: targetAgent?.name || 'Autonomous Agent',
      agentRole: targetAgent?.role || 'ORCHESTRATOR',
      actionType: 'MCP_TOOL_INVOCATION',
      targetResource: `mcp://agent/${taskTarget}/execute`,
      decisionRationale: `Manual task dispatch from AgentOrchestratorHub: "${taskPrompt}"`,
      payload: { prompt: taskPrompt, priority: 'HIGH' },
      resultSummary: `Task received and dispatched to ${targetAgent?.name}. Execution initiated.`,
      status: 'SUCCESS',
      durationMs: 320
    });

    globalAgentEventBus.broadcast('MCP_TOOL_INVOKED', {
      agentId: taskTarget,
      prompt: taskPrompt,
      timestamp: Date.now()
    });

    setTaskPrompt('');
    setIsDispatching(false);
    refreshData();
  };

  const handleBroadcastSimulation = () => {
    try {
      const parsed = JSON.parse(simulatedEventPayload);
      globalAgentEventBus.broadcast(simulatedEventType, parsed, 'simulation-console');
    } catch {
      globalAgentEventBus.broadcast(simulatedEventType, { raw: simulatedEventPayload }, 'simulation-console');
    }
  };

  const handleExecuteGrpc = async () => {
    setGrpcLoading(true);
    setGrpcResponse(null);
    try {
      if (grpcMethod === 'TriggerBuild') {
        const res = await civerTransportBridge.triggerBuild({
          app_id: grpcAppId,
          app_name: grpcAppId.split('.').pop()?.toUpperCase() || 'APP',
          github_url: `https://github.com/civer-org/${grpcAppId}`,
          gradle_task: 'assembleRelease',
          priority: BuildPriority.BUILD_PRIORITY_HIGH,
          requester_agent_id: 'grpc-agent-test'
        });
        setGrpcResponse(res);
      } else if (grpcMethod === 'GetAppStats') {
        const res = await civerTransportBridge.getAppStats({ app_id: grpcAppId });
        setGrpcResponse(res);
      } else if (grpcMethod === 'DeployPatch') {
        const res = await civerTransportBridge.deployPatch({
          app_id: grpcAppId,
          version_name: 'v2.4.0',
          patch_type: PatchType.PATCH_TYPE_HOT_FIX,
          binary_hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          deployer_agent_id: 'grpc-patcher-test'
        });
        setGrpcResponse(res);
      }
    } catch (err: any) {
      setGrpcResponse({ error: err.message || 'Error en invocación gRPC' });
    } finally {
      setGrpcLoading(false);
      refreshData();
    }
  };

  const handleExecuteMcpRequest = async () => {
    setMcpLoading(true);
    try {
      let parsedParams = {};
      if (mcpRawPayload.trim()) {
        try {
          parsedParams = JSON.parse(mcpRawPayload);
        } catch {
          parsedParams = {};
        }
      }

      let jsonRpcReq: any = {
        jsonrpc: '2.0',
        id: `rpc-${Date.now()}`,
        method: mcpMethod
      };

      if (mcpMethod === 'tools/call') {
        jsonRpcReq.params = {
          name: mcpToolName,
          arguments: parsedParams
        };
      } else {
        jsonRpcReq.params = parsedParams;
      }

      const res = await internalMcpServer.handleJsonRpcRequest(jsonRpcReq);
      setMcpResponse(res);
    } catch (err: any) {
      setMcpResponse({ error: { message: err.message || 'Error en MCP JSON-RPC' } });
    } finally {
      setMcpLoading(false);
      refreshData();
    }
  };

  const handleSetMcpPreset = (method: string, toolName: string, payloadObj: any) => {
    setMcpMethod(method);
    setMcpToolName(toolName);
    setMcpRawPayload(JSON.stringify(payloadObj, null, 2));
  };

  const handleClearLogs = () => {
    if (confirm('¿Estás seguro de vaciar el journal de telemetría de IndexedDB?')) {
      globalAgentTelemetryBus.clearAuditTrail();
      refreshData();
    }
  };

  const handleExportJournal = () => {
    const jsonStr = globalAgentTelemetryBus.exportJournalJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer-agent-telemetry-journal-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openApiOverview = serviceRegistry.getRegistryOverview();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-950 border border-purple-800 rounded-xl">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  Agent Orchestrator Hub & Telemetry Control
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Multi-Agent Core & Transport
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoreo agéntico, GlobalAgentTelemetryBus (IndexedDB), WebSocket EventBus, gRPC-web Bridge y OpenAPI 3.1 Registry.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenDocs && (
              <button
                onClick={onOpenDocs}
                className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Docs Técnicas</span>
              </button>
            )}
            {onOpenAcademy && (
              <button
                onClick={onOpenAcademy}
                className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Academy</span>
              </button>
            )}
            {onOpenBlueprint && (
              <button
                onClick={onOpenBlueprint}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grafo D3</span>
              </button>
            )}
            <button
              onClick={handleExportJournal}
              title="Descargar volcado del Journal"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto">
          {[
            { id: 'AGENTS', label: `Agentes (${agents.length})`, icon: Bot },
            { id: 'LIFECYCLE_TIMELINE', label: 'Lifecycle GANTT', icon: TrendingUp },
            { id: 'DECISION_LOGS', label: `Decision Journal (${logs.length})`, icon: Activity },
            { id: 'WEBSOCKET_BUS', label: `WebSocket Bus (${wsEvents.length})`, icon: Radio },
            { id: 'GRPC_BRIDGE', label: 'gRPC-web Bridge', icon: Network },
            { id: 'OPENAPI_REGISTRY', label: 'OpenAPI 3.1 Registry', icon: FileCode },
            { id: 'MCP_CONNECTIONS', label: 'Conexiones MCP', icon: Link2 },
            { id: 'SHARED_CONTEXT', label: 'Context Buffer', icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-purple-300 border-t border-x border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: AGENTS ACTIVE MONITOR */}
          {activeTab === 'AGENTS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition space-y-3 ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-600 shadow-lg shadow-purple-950/40'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {agent.role}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          {agent.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{agent.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {agent.currentTask || 'En espera de instrucciones'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Acciones: {agent.actionsCount}</span>
                        <span className="text-purple-300">{agent.mcpConnection.pingLatencyMs}ms ping</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedAgent && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-100">{selectedAgent.name}</h3>
                        <span className="text-[10px] font-mono text-purple-400">ID: {selectedAgent.id}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Endpoint MCP: <code className="text-cyan-300 font-mono">{selectedAgent.mcpConnection.endpoint}</code>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Herramientas Autorizadas:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedAgent.mcpConnection.authorizedTools.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleDispatchTask} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={taskPrompt}
                      onChange={(e) => setTaskPrompt(e.target.value)}
                      placeholder={`Instruir comando para ${selectedAgent.name}... (ej. Auditar repositorios de multimedia)`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isDispatching || !taskPrompt.trim()}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-purple-950"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Despachar Acción</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: LIFECYCLE GANTT TIMELINE */}
          {activeTab === 'LIFECYCLE_TIMELINE' && (
            <AgentLifecycleVisualizer />
          )}

          {/* TAB: WEBSOCKET EVENT BUS */}
          {activeTab === 'WEBSOCKET_BUS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-100">GlobalAgentEventBus (WebSocket & BroadcastChannel)</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      LIVE SYNC
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transmite eventos del sistema (compilaciones terminadas, cambios de estado y sincronización) para mantener sincronizados los modelos internos de los agentes.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => globalAgentEventBus.clearHistory()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Limpiar Buffer
                  </button>
                </div>
              </div>

              {/* Event Dispatch Simulator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emitir Evento Granular en el Bus</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={simulatedEventType}
                    onChange={(e: any) => setSimulatedEventType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="BUILD_COMPLETED">BUILD_COMPLETED</option>
                    <option value="REPO_SYNC_STATUS">REPO_SYNC_STATUS</option>
                    <option value="USER_STATE_CHANGED">USER_STATE_CHANGED</option>
                  </select>
                  <input
                    type="text"
                    value={simulatedEventPayload}
                    onChange={(e) => setSimulatedEventPayload(e.target.value)}
                    placeholder='JSON Payload, ej. {"appId": "..."}'
                    className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={handleBroadcastSimulation}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Transmitir por WebSocket Bus</span>
                </button>
              </div>

              {/* Live Events Stream */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial de Eventos en Tiempo Real</h5>
                {wsEvents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-500 font-mono">
                    No hay eventos recientes en el bus.
                  </div>
                ) : (
                  wsEvents.map((evt) => (
                    <div key={evt.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {evt.type}
                        </span>
                        <span className="text-xs font-bold text-slate-200 font-mono">from: {evt.source}</span>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded max-w-xl overflow-x-auto">
                        {JSON.stringify(evt.payload)}
                      </pre>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: gRPC-web BRIDGE */}
          {activeTab === 'GRPC_BRIDGE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-950 border border-blue-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-100">CiverTransportBridge (gRPC-web & Protobuf)</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                      /proto/civer_transport_bridge.proto
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Canal binario tipado de alto rendimiento para agentes de IA: TriggerBuild, GetAppStats y DeployPatch.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('syntax = "proto3";\npackage civer.store.v1;\nservice CiverTransportBridgeService { ... }');
                    setCopiedProto(true);
                    setTimeout(() => setCopiedProto(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xs font-semibold flex items-center gap-1.5 transition border border-blue-700"
                >
                  {copiedProto ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedProto ? 'Proto Copiado' : 'Copiar .proto'}</span>
                </button>
              </div>

              {/* RPC Dispatch Form */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-blue-400" />
                  <span>Probar Método RPC</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={grpcMethod}
                    onChange={(e: any) => setGrpcMethod(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="TriggerBuild">rpc TriggerBuild()</option>
                    <option value="GetAppStats">rpc GetAppStats()</option>
                    <option value="DeployPatch">rpc DeployPatch()</option>
                  </select>
                  <input
                    type="text"
                    value={grpcAppId}
                    onChange={(e) => setGrpcAppId(e.target.value)}
                    placeholder="App Package ID (ej. org.torproject.android)"
                    className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleExecuteGrpc}
                  disabled={grpcLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{grpcLoading ? 'Transmitiendo RPC...' : 'Ejecutar Invocación gRPC'}</span>
                </button>
              </div>

              {grpcResponse && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">Respuesta gRPC-web (200 OK):</span>
                  <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                    {JSON.stringify(grpcResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB: OPENAPI 3.1 REGISTRY */}
          {activeTab === 'OPENAPI_REGISTRY' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-100">ServiceRegistry (OpenAPI 3.1 Autogenerado)</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      v{openApiOverview.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Introspección dinámica de todos los controladores de estado y modales para descubrimiento agéntico.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(serviceRegistry.getJsonSchema());
                      setCopiedOpenApi(true);
                      setTimeout(() => setCopiedOpenApi(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    {copiedOpenApi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOpenApi ? 'Schema Copiado' : 'Copiar OpenAPI JSON'}</span>
                  </button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Endpoints Totales</span>
                  <div className="text-lg font-bold text-purple-400">{openApiOverview.totalEndpoints}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Esquemas de Datos</span>
                  <div className="text-lg font-bold text-cyan-400">{openApiOverview.totalSchemas}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Categorías / Tags</span>
                  <div className="text-lg font-bold text-emerald-400">{openApiOverview.tagsCount}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Especificación</span>
                  <div className="text-lg font-bold text-amber-400">OpenAPI 3.1.0</div>
                </div>
              </div>

              {/* JSON Spec Preview */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Definición del Esquema (Live Spec)</h5>
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-h-72 overflow-y-auto">
                  {serviceRegistry.getJsonSchema()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: MCP CONNECTIONS & INTERACTIVE JSON-RPC 2.0 WORKBENCH */}
          {activeTab === 'MCP_CONNECTIONS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-950 border border-purple-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Model Context Protocol (MCP) Server & Connections</h4>
                  <p className="text-xs text-slate-400">
                    Servidor MCP v2024-11-05 nativo con 10 herramientas para consulta de catálogo, Health Score, auto-importación y compilación CI.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {agents.length} Conectados
                  </span>
                </div>
              </div>

              {/* Active Agent MCP Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {agents.map((agent) => (
                  <div key={agent.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-200">{agent.name}</span>
                        <span className="text-[10px] font-mono text-purple-400">{agent.mcpConnection.protocolVersion}</span>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300">
                        {agent.mcpConnection.endpoint}
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono text-slate-400">
                      <div>Latencia: <span className="text-emerald-400 font-bold">{agent.mcpConnection.pingLatencyMs}ms</span></div>
                      <div>Tools: <span className="text-purple-300">{agent.mcpConnection.authorizedTools.length}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Interactive MCP JSON-RPC 2.0 Test Workbench */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>MCP JSON-RPC 2.0 Test Workbench & Heuristic Scraper</span>
                  </h5>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500">Presets:</span>
                    <button
                      onClick={() => handleSetMcpPreset('tools/call', 'civer_get_health_scores', { minScore: 80, limit: 5 })}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-700"
                    >
                      Health Scores
                    </button>
                    <button
                      onClick={() => handleSetMcpPreset('tools/call', 'civer_batch_import_healthy_apps', { minScore: 80, limit: 3, agentId: 'mcp-tester-agent' })}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700"
                    >
                      Batch Import Apps
                    </button>
                    <button
                      onClick={() => handleSetMcpPreset('tools/call', 'civer_browse_catalog', { category: 'ALL', minHealthScore: 70, limit: 5 })}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700"
                    >
                      Browse Catalog
                    </button>
                    <button
                      onClick={() => handleSetMcpPreset('tools/list', '', {})}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      tools/list
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={mcpMethod}
                    onChange={(e) => setMcpMethod(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="tools/call">method: tools/call</option>
                    <option value="tools/list">method: tools/list</option>
                    <option value="resources/list">method: resources/list</option>
                    <option value="resources/read">method: resources/read</option>
                    <option value="initialize">method: initialize</option>
                  </select>

                  {mcpMethod === 'tools/call' ? (
                    <select
                      value={mcpToolName}
                      onChange={(e) => setMcpToolName(e.target.value)}
                      className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      {internalMcpServer.getTools().map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="sm:col-span-2 text-xs font-mono text-slate-400 flex items-center px-3 bg-slate-900 rounded-lg border border-slate-800">
                      Parámetros estándar MCP JSON-RPC 2.0
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Argumentos JSON (params):</span>
                  <textarea
                    rows={3}
                    value={mcpRawPayload}
                    onChange={(e) => setMcpRawPayload(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={handleExecuteMcpRequest}
                  disabled={mcpLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{mcpLoading ? 'Ejecutando JSON-RPC...' : 'Ejecutar Solicitud MCP'}</span>
                </button>

                {mcpResponse && (
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">Respuesta MCP JSON-RPC 2.0:</span>
                    <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-56">
                      {JSON.stringify(mcpResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DECISION LOGS & AUDIT JOURNAL (Full Real-Time Visualizer) */}
          {activeTab === 'DECISION_LOGS' && (
            <AgentTelemetryAuditView onOpenAcademy={onOpenAcademy} />
          )}

          {/* TAB 4: SHARED CONTEXT BUFFER */}
          {activeTab === 'SHARED_CONTEXT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Buffer de Contexto Compartido en Memoria & IndexedDB</h4>
                  <p className="text-[11px] text-slate-400">
                    Permite a diferentes agentes colaborar compartiendo estados, resultados de compilación y bloqueos.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(sharedContext, null, 2));
                    setCopiedContext(true);
                    setTimeout(() => setCopiedContext(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                >
                  {copiedContext ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedContext ? 'Copiado' : 'Copiar JSON'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(sharedContext).map((item) => (
                  <div key={item.key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-300">{item.key}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                        {item.scope}
                      </span>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                      {JSON.stringify(item.value, null, 2)}
                    </pre>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Dueño: {item.ownerAgentId} | Actualizado: {new Date(item.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
