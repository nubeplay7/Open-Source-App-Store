import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  Bot,
  Zap,
  Layers,
  ChevronRight,
  ChevronDown,
  FileCode,
  Sparkles,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Radio,
  Sliders,
  Database,
  BarChart3,
  TrendingUp,
  LineChart as LineChartIcon,
  Send
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  globalAgentTelemetryBus,
  AgentActionLog,
  ActiveAgentState
} from '../services/globalAgentTelemetryBus';
import { globalAgentEventBus } from '../services/globalAgentEventBus';

interface AgentTelemetryAuditViewProps {
  onSelectAgent?: (agentId: string) => void;
  onOpenAcademy?: () => void;
}

export const AgentTelemetryAuditView: React.FC<AgentTelemetryAuditViewProps> = ({
  onSelectAgent,
  onOpenAcademy
}) => {
  const [logs, setLogs] = useState<AgentActionLog[]>([]);
  const [agents, setAgents] = useState<ActiveAgentState[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [activeTab, setActiveTab] = useState<'SEQUENCE_JOURNAL' | 'TIME_SERIES_CHARTS'>('SEQUENCE_JOURNAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterActionType, setFilterActionType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Decision Player / Replay State
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [replaySpeed, setReplaySpeed] = useState<number>(1); // 1x, 2x, 4x
  const replayTimerRef = useRef<any>(null);

  const refreshData = () => {
    setLogs(globalAgentTelemetryBus.getAuditTrail());
    setAgents(globalAgentTelemetryBus.getActiveAgents());
  };

  useEffect(() => {
    refreshData();

    const unsubscribe = globalAgentTelemetryBus.subscribe((newLog) => {
      if (isLiveStreaming) {
        setLogs(globalAgentTelemetryBus.getAuditTrail());
        setAgents(globalAgentTelemetryBus.getActiveAgents());
      }
    });

    return () => {
      unsubscribe();
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [isLiveStreaming]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterRole !== 'ALL' && log.agentRole !== filterRole) return false;
      if (filterActionType !== 'ALL' && log.actionType !== filterActionType) return false;
      if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = log.agentName.toLowerCase().includes(q);
        const matchesTarget = log.targetResource.toLowerCase().includes(q);
        const matchesRationale = log.decisionRationale.toLowerCase().includes(q);
        const matchesResult = log.resultSummary.toLowerCase().includes(q);
        return matchesName || matchesTarget || matchesRationale || matchesResult;
      }
      return true;
    });
  }, [logs, filterRole, filterActionType, filterStatus, searchQuery]);

  // Selected Log object
  const activeSelectedLog = useMemo(() => {
    if (!selectedLogId && filteredLogs.length > 0) return filteredLogs[0];
    return logs.find((l) => l.id === selectedLogId) || filteredLogs[0] || null;
  }, [selectedLogId, filteredLogs, logs]);

  // Chronological ordered logs for playback (oldest to newest)
  const chronologicalLogs = useMemo(() => {
    return [...logs].reverse();
  }, [logs]);

  // Replay Controller
  useEffect(() => {
    if (isReplaying) {
      const intervalMs = Math.max(250, 1500 / replaySpeed);
      replayTimerRef.current = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= chronologicalLogs.length - 1) {
            setIsReplaying(false);
            return prev;
          }
          const next = prev + 1;
          setSelectedLogId(chronologicalLogs[next]?.id || null);
          return next;
        });
      }, intervalMs);
    } else {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    }
    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [isReplaying, replaySpeed, chronologicalLogs]);

  const handleStartReplay = () => {
    if (chronologicalLogs.length === 0) return;
    setIsReplaying(true);
    if (replayIndex >= chronologicalLogs.length - 1) {
      setReplayIndex(0);
      setSelectedLogId(chronologicalLogs[0]?.id || null);
    }
  };

  const handleStepReplay = (direction: 'next' | 'prev') => {
    setIsReplaying(false);
    setReplayIndex((prev) => {
      const target = direction === 'next' ? Math.min(chronologicalLogs.length - 1, prev + 1) : Math.max(0, prev - 1);
      setSelectedLogId(chronologicalLogs[target]?.id || null);
      return target;
    });
  };

  const handleExportJson = () => {
    const jsonStr = globalAgentTelemetryBus.exportJournalJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer-telemetry-audit-trail-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['id', 'timestamp', 'agentId', 'agentName', 'agentRole', 'actionType', 'targetResource', 'status', 'durationMs', 'decisionRationale', 'resultSummary'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      l.agentId,
      `"${l.agentName.replace(/"/g, '""')}"`,
      l.agentRole,
      l.actionType,
      `"${l.targetResource.replace(/"/g, '""')}"`,
      l.status,
      l.durationMs,
      `"${l.decisionRationale.replace(/"/g, '""')}"`,
      `"${l.resultSummary.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer-telemetry-audit-trail-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (confirm('¿Vaciar todo el registro forense en IndexedDB?')) {
      globalAgentTelemetryBus.clearAuditTrail();
      refreshData();
    }
  };

  // Time-Series Aggregation Data
  const timeSeriesData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (sorted.length === 0) return [];

    // Group into timeline points
    return sorted.map((log, index) => {
      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const mutationsCount = log.actionType === 'STATE_MUTATION' ? 1 : 0;
      return {
        step: `#${index + 1}`,
        time: timeStr,
        agent: log.agentName,
        duration: log.durationMs,
        mutations: mutationsCount,
        isSuccess: log.status === 'SUCCESS' ? 1 : 0,
        actionType: log.actionType,
        stateDeltas: (log.actionType === 'STATE_MUTATION' ? 2 : (log.actionType === 'CI_DISPATCH' ? 2 : 1))
      };
    });
  }, [logs]);

  // Agent Role Breakdown Data for Bar Chart
  const roleBreakdownData = useMemo(() => {
    const map: Record<string, { role: string; total: number; mutations: number; mcpCalls: number; avgDuration: number; durSum: number }> = {};
    
    logs.forEach((log) => {
      if (!map[log.agentRole]) {
        map[log.agentRole] = {
          role: log.agentRole,
          total: 0,
          mutations: 0,
          mcpCalls: 0,
          avgDuration: 0,
          durSum: 0
        };
      }
      map[log.agentRole].total += 1;
      map[log.agentRole].durSum += log.durationMs;
      if (log.actionType === 'STATE_MUTATION') {
        map[log.agentRole].mutations += 1;
      }
      if (log.actionType === 'MCP_TOOL_INVOCATION') {
        map[log.agentRole].mcpCalls += 1;
      }
    });

    return Object.values(map).map((item) => ({
      ...item,
      avgDuration: Math.round(item.durSum / item.total)
    }));
  }, [logs]);

  // System State Progression Data
  const stateDynamicsData = useMemo(() => {
    let simulatedQueue = 2;
    let simulatedHealthIndex = 88;
    let contextSizeKb = 14;

    const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return sorted.map((log, index) => {
      if (log.actionType === 'CI_DISPATCH') simulatedQueue += 1;
      if (log.actionType === 'STATE_MUTATION') simulatedHealthIndex = Math.min(100, simulatedHealthIndex + 1.5);
      contextSizeKb += 2.3;

      return {
        step: `Op ${index + 1}`,
        time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ciQueue: simulatedQueue,
        healthIndex: Math.round(simulatedHealthIndex),
        contextSizeKb: Math.round(contextSizeKb * 10) / 10,
        agent: log.agentName
      };
    });
  }, [logs]);

  const handleSimulateAgentOperation = async () => {
    setIsSimulating(true);
    const mockAgents = [
      { id: 'agent_gemini_orch', name: 'Gemini Autonomous Orchestrator', role: 'ORCHESTRATOR' as const },
      { id: 'agent_sec_audit', name: 'Security & Integrity Auditor', role: 'SECURITY_AUDITOR' as const },
      { id: 'agent_gh_compiler', name: 'GitHub Actions Matrix Compiler', role: 'COMPILER' as const },
      { id: 'agent_sys_architect', name: 'System Map & MCP Explorer', role: 'ARCHITECT' as const }
    ];
    const chosenAgent = mockAgents[Math.floor(Math.random() * mockAgents.length)];

    const operations = [
      {
        actionType: 'STATE_MUTATION' as const,
        targetResource: 'civer.store.v1.DeployPatch',
        rationale: 'Despliegue automatizado de parche hotfix y actualización de headers binarios Protobuf en repositorio.',
        duration: Math.floor(Math.random() * 120) + 45,
        payload: {
          controller: 'civerTransportBridge',
          mutation: 'patchApplied',
          before: { version: '2.4.1', status: 'STABLE' },
          after: { version: '2.4.2-hotfix', status: 'APPLIED', deltaBytes: 10420 }
        }
      },
      {
        actionType: 'CI_DISPATCH' as const,
        targetResource: 'civer.store.v1.TriggerBuild',
        rationale: 'Disparo de compilación reproducible multi-arquitectura (arm64-v8a) con firmas de verificación.',
        duration: Math.floor(Math.random() * 250) + 90,
        payload: {
          controller: 'ciMatrixController',
          mutation: 'queueJob',
          before: { pendingJobs: 1 },
          after: { pendingJobs: 2, dispatchedAgent: chosenAgent.name }
        }
      },
      {
        actionType: 'MCP_TOOL_INVOCATION' as const,
        targetResource: 'civer://system/map.json',
        rationale: 'Consultando grafo estructural del sistema mediante MCP Server interno para validar dependencias.',
        duration: Math.floor(Math.random() * 40) + 15,
        payload: { tool: 'civer_get_system_map', format: 'json' }
      }
    ];

    const chosenOp = operations[Math.floor(Math.random() * operations.length)];

    await globalAgentTelemetryBus.logAgentAction({
      agentId: chosenAgent.id,
      agentName: chosenAgent.name,
      agentRole: chosenAgent.role,
      actionType: chosenOp.actionType,
      targetResource: chosenOp.targetResource,
      decisionRationale: chosenOp.rationale,
      payload: chosenOp.payload,
      resultSummary: `Operación completada con éxito. Latencia: ${chosenOp.duration}ms. Estado del bus sincronizado.`,
      status: 'SUCCESS',
      durationMs: chosenOp.duration
    });

    globalAgentEventBus.broadcast(
      'PATCH_DEPLOYED',
      { target: chosenOp.targetResource, rationale: chosenOp.rationale },
      chosenAgent.name
    );

    setTimeout(() => {
      refreshData();
      setIsSimulating(false);
    }, 400);
  };

  // Metrics
  const totalActions = logs.length;
  const successActions = logs.filter((l) => l.status === 'SUCCESS').length;
  const successRate = totalActions > 0 ? Math.round((successActions / totalActions) * 100) : 100;
  const avgDuration = totalActions > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.durationMs, 0) / totalActions) : 0;

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-purple-950/30 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-purple-900/40 border border-purple-700 text-purple-300">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Agent Activity Journal & Telemetry Suite
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              IndexedDB Journal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualización forense de la cadena de operaciones gRPC/MCP, mutaciones de estado y series temporales de telemetría.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Simulation Trigger */}
          <button
            onClick={handleSimulateAgentOperation}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md transition border border-purple-400/30"
            title="Simula una llamada gRPC/MCP por un agente y mutación de estado"
          >
            <Send className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulando...' : '⚡ Disparar Operación gRPC'}</span>
          </button>

          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              isLiveStreaming
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                : 'bg-amber-950 text-amber-300 border-amber-800 hover:bg-amber-900'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isLiveStreaming ? 'Live Streaming' : 'Pausado'}</span>
          </button>

          <button
            onClick={refreshData}
            title="Refrescar desde IndexedDB"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportJson}
            title="Exportar JSON"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            onClick={handleExportCsv}
            title="Exportar CSV"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handleClear}
            title="Limpiar registro"
            className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900 text-red-300 border border-red-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('SEQUENCE_JOURNAL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'SEQUENCE_JOURNAL'
              ? 'bg-purple-950 text-purple-300 border border-purple-700 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Secuencia de Operaciones & Journal</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-900/60 text-purple-200 text-[10px] font-mono">
            {filteredLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TIME_SERIES_CHARTS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'TIME_SERIES_CHARTS'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Time-Series Charts & Métricas de Estado</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-900/60 text-cyan-200 text-[10px] font-mono">
            Recharts
          </span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Operaciones Totales</span>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{totalActions}</div>
          </div>
          <Bot className="w-6 h-6 text-purple-500/30" />
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Tasa de Éxito</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{successRate}%</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/30" />
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Latencia Media</span>
            <div className="text-xl font-bold text-cyan-400 mt-0.5">{avgDuration}ms</div>
          </div>
          <Clock className="w-6 h-6 text-cyan-500/30" />
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Agentes Activos</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{agents.length}</div>
          </div>
          <Cpu className="w-6 h-6 text-amber-500/30" />
        </div>
      </div>

      {activeTab === 'TIME_SERIES_CHARTS' ? (
        /* Time-Series Charts & State Changes Analytics */
        <div className="space-y-4">
          {/* Main Throughput & Latency Chart */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Secuencia Temporal de Operaciones y Latencia (ms)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Puntos de Registro: {timeSeriesData.length}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMutations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="step" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="duration" name="Latencia RPC (ms)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDuration)" />
                  <Area type="monotone" dataKey="stateDeltas" name="Mutaciones de Estado" stroke="#06b6d4" fillOpacity={1} fill="url(#colorMutations)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid: Role Breakdown & System State Progression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart: Activity by Agent Role */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Distribución de Acciones por Rol de Agente
                </h4>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="role" stroke="#64748b" fontSize={10} interval={0} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Total Acciones" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mutations" name="Mutaciones" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mcpCalls" name="MCP Invocations" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: System State Progression (CI Queue, Health Index, Memory Context) */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2">
                <LineChartIcon className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Dinámica de Estado del Sistema en Vivo
                </h4>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stateDynamicsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="step" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="healthIndex" name="Health Score (%)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="ciQueue" name="Cola CI Jobs" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="contextSizeKb" name="Context Memory (KB)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sequence Journal & Replay View */
        <>

      {/* Replay & Sequence Player Controller */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Decision Sequence Player:</span>
          </span>
          <span className="text-xs font-mono text-purple-300">
            Paso {replayIndex + 1} de {chronologicalLogs.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStepReplay('prev')}
            disabled={replayIndex === 0}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition border border-slate-800"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => (isReplaying ? setIsReplaying(false) : handleStartReplay())}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              isReplaying
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {isReplaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isReplaying ? 'Pausar Replay' : 'Reproducir Secuencia'}</span>
          </button>

          <button
            onClick={() => handleStepReplay('next')}
            disabled={replayIndex >= chronologicalLogs.length - 1}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition border border-slate-800"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setReplayIndex(0);
              setSelectedLogId(chronologicalLogs[0]?.id || null);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-800"
            title="Reiniciar al inicio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-900 text-[10px] font-mono font-bold">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setReplaySpeed(spd)}
                className={`px-2 py-1 transition ${
                  replaySpeed === spd ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por justificación, comando o recurso..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
        >
          <option value="ALL">Todos los Roles de Agente</option>
          <option value="ORCHESTRATOR">ORCHESTRATOR</option>
          <option value="SECURITY_AUDITOR">SECURITY_AUDITOR</option>
          <option value="COMPILER">COMPILER</option>
          <option value="ARCHITECT">ARCHITECT</option>
          <option value="REPO_SYNC">REPO_SYNC</option>
          <option value="COMMUNITY_BOT">COMMUNITY_BOT</option>
        </select>

        <select
          value={filterActionType}
          onChange={(e) => setFilterActionType(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
        >
          <option value="ALL">Todos los Tipos de Acción</option>
          <option value="MCP_TOOL_INVOCATION">MCP_TOOL_INVOCATION</option>
          <option value="STATE_MUTATION">STATE_MUTATION</option>
          <option value="CODE_INSPECTION">CODE_INSPECTION</option>
          <option value="CI_DISPATCH">CI_DISPATCH</option>
          <option value="DECISION_RECORD">DECISION_RECORD</option>
          <option value="CONTEXT_SYNC">CONTEXT_SYNC</option>
          <option value="TELEMETRY_QUERY">TELEMETRY_QUERY</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
        >
          <option value="ALL">Todos los Estados</option>
          <option value="SUCCESS">SUCCESS (Éxito)</option>
          <option value="PENDING">PENDING (En curso)</option>
          <option value="FAILURE">FAILURE (Fallo)</option>
          <option value="BLOCKED">BLOCKED (Bloqueado)</option>
        </select>
      </div>

      {/* Main Split View: Sequence List & Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Sequence Stream Timeline */}
        <div className="lg:col-span-7 space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-500 font-mono">
              No se encontraron registros que coincidan con los filtros aplicados.
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const isSelected = activeSelectedLog?.id === log.id;
              const statusColor =
                log.status === 'SUCCESS'
                  ? 'text-emerald-400 border-emerald-800 bg-emerald-950/40'
                  : log.status === 'FAILURE'
                  ? 'text-red-400 border-red-800 bg-red-950/40'
                  : log.status === 'BLOCKED'
                  ? 'text-amber-400 border-amber-800 bg-amber-950/40'
                  : 'text-blue-400 border-blue-800 bg-blue-950/40';

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer relative space-y-2 ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-950/30 ring-1 ring-purple-500/30'
                      : 'bg-slate-950 hover:border-slate-700 border-slate-800'
                  }`}
                >
                  {/* Step Connector Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                        {filteredLogs.length - idx}
                      </span>
                      <span className="text-xs font-bold text-slate-100">{log.agentName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900 text-purple-300 border border-slate-800">
                        {log.agentRole}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${statusColor}`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Decision rationale snippet */}
                  <div className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-cyan-400 font-bold pb-0.5">
                      Recurso: <span className="text-slate-200">{log.targetResource}</span> ({log.actionType})
                    </div>
                    <p className="line-clamp-2 text-slate-300">{log.decisionRationale}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-900">
                    <span className="text-emerald-400 flex items-center gap-1 line-clamp-1">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                      <span>{log.resultSummary}</span>
                    </span>
                    <span className="text-slate-500 flex-shrink-0">{log.durationMs}ms</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Deep Decision Inspection Panel */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4 max-h-[550px] overflow-y-auto">
          {activeSelectedLog ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Detalles de la Decisión</span>
                  <h4 className="text-sm font-bold text-slate-100 mt-0.5">{activeSelectedLog.agentName}</h4>
                </div>
                <button
                  onClick={() => handleCopyJson(JSON.stringify(activeSelectedLog, null, 2), activeSelectedLog.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition border border-slate-700"
                >
                  {copiedId === activeSelectedLog.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === activeSelectedLog.id ? 'Copiado' : 'Copiar Log'}</span>
                </button>
              </div>

              {/* Meta properties */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ID de Registro</span>
                  <span className="text-slate-200">{activeSelectedLog.id}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Timestamp</span>
                  <span className="text-slate-200">{new Date(activeSelectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Tipo de Acción</span>
                  <span className="text-cyan-300 font-bold">{activeSelectedLog.actionType}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Duración</span>
                  <span className="text-emerald-300 font-bold">{activeSelectedLog.durationMs} ms</span>
                </div>
              </div>

              {/* Target & Rationale */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Recurso Objetivo</span>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300">
                  {activeSelectedLog.targetResource}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Justificación Algorítmica (Decision Rationale)</span>
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed">
                  {activeSelectedLog.decisionRationale}
                </div>
              </div>

              {/* Payload Preview */}
              {activeSelectedLog.payload && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Payload / Argumentos</span>
                  <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                    {JSON.stringify(activeSelectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Result Summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Resultado Operacional</span>
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-lg text-xs font-mono text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{activeSelectedLog.resultSummary}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs font-mono">
              Selecciona una acción del historial para inspeccionar su trazabilidad.
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
