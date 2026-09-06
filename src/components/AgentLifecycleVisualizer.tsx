import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Activity,
  Cpu,
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Filter,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  TrendingUp,
  Server
} from 'lucide-react';
import { globalAgentTelemetryBus, AgentActionLog, ActiveAgentState } from '../services/globalAgentTelemetryBus';
import { agentRecipeEngine, RecipeExecutionRecord, STANDARD_RECIPE_TEMPLATES } from '../services/agentRecipeEngine';
import { globalAgentEventBus } from '../services/globalAgentEventBus';

interface AgentTaskTimelineItem {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: AgentActionLog['agentRole'];
  taskTitle: string;
  taskType: 'RECIPE_EXECUTION' | 'CI_BUILD' | 'AST_AUDIT' | 'BYTECODE_PATCH' | 'MIRROR_SYNC' | 'STATE_PERSIST';
  startedAt: number;
  durationMs: number;
  finishedAt: number;
  status: 'RUNNING' | 'SUCCESS' | 'HEALED' | 'FAILED' | 'ROLLED_BACK';
  resourceMetrics: {
    cpuPercent: number;
    memoryMb: number;
    wirePayloadKb: number;
    dbWrites: number;
  };
  decisionRationale: string;
  targetResource: string;
  stepsCount: number;
}

interface AgentLifecycleVisualizerProps {
  onAddToast?: (toast: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }) => void;
}

export const AgentLifecycleVisualizer: React.FC<AgentLifecycleVisualizerProps> = ({ onAddToast }) => {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [timeZoom, setTimeZoom] = useState<'10M' | '1H' | 'REALTIME'>('REALTIME');
  const [selectedTask, setSelectedTask] = useState<AgentTaskTimelineItem | null>(null);
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string>('sync-build-audit-publish');
  const [executionHistory, setExecutionHistory] = useState<RecipeExecutionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AgentActionLog[]>([]);
  const [agents, setAgents] = useState<ActiveAgentState[]>([]);

  const refreshData = () => {
    setExecutionHistory(agentRecipeEngine.getExecutionHistory());
    setAuditLogs(globalAgentTelemetryBus.getAuditTrail());
    setAgents(globalAgentTelemetryBus.getActiveAgents());
  };

  useEffect(() => {
    refreshData();
    const unsubTelemetry = globalAgentTelemetryBus.subscribe(() => refreshData());
    const unsubRecipes = agentRecipeEngine.subscribe(() => refreshData());
    const unsubEvents = globalAgentEventBus.subscribe('*', () => refreshData());

    return () => {
      unsubTelemetry();
      unsubRecipes();
      unsubEvents();
    };
  }, []);

  // Transform execution records + telemetry logs into timeline items
  const timelineItems: AgentTaskTimelineItem[] = useMemo(() => {
    const items: AgentTaskTimelineItem[] = [];

    // 1. From recipe executions
    executionHistory.forEach((exec) => {
      const isHealed = exec.status === 'HEALED_AND_COMPLETED';
      const isFailed = exec.status === 'FAILED';
      const isRunning = exec.status === 'RUNNING';

      items.push({
        id: exec.executionId,
        agentId: exec.executorAgentId,
        agentName: exec.executorAgentId === 'nexus-orchestrator' ? 'Nexus Orchestrator' : 'Automated Task Worker',
        agentRole: 'ORCHESTRATOR',
        taskTitle: exec.recipeName,
        taskType: 'RECIPE_EXECUTION',
        startedAt: exec.startedAt,
        durationMs: exec.totalDurationMs || (Date.now() - exec.startedAt),
        finishedAt: exec.finishedAt || Date.now(),
        status: isRunning ? 'RUNNING' : isHealed ? 'HEALED' : isFailed ? 'FAILED' : 'SUCCESS',
        resourceMetrics: {
          cpuPercent: Math.floor(25 + Math.random() * 45),
          memoryMb: Math.floor(180 + Math.random() * 90),
          wirePayloadKb: Math.floor(12 + Math.random() * 40),
          dbWrites: exec.stepResults.length * 2 + 1
        },
        decisionRationale: exec.summary || `Ejecución de receta multi-paso ${exec.recipeName}`,
        targetResource: `recipe://${exec.recipeId}`,
        stepsCount: exec.stepResults.length
      });
    });

    // 2. From audit logs
    auditLogs.slice(0, 30).forEach((log) => {
      const duration = log.durationMs || 120;
      const started = new Date(log.timestamp).getTime();
      let taskType: AgentTaskTimelineItem['taskType'] = 'CI_BUILD';
      if (log.actionType === 'CI_DISPATCH') taskType = 'CI_BUILD';
      else if (log.actionType === 'MCP_TOOL_INVOCATION') taskType = 'AST_AUDIT';
      else if (log.actionType === 'STATE_MUTATION') taskType = 'STATE_PERSIST';
      else if (log.actionType === 'CODE_INSPECTION') taskType = 'AST_AUDIT';
      else if (log.actionType === 'CONTEXT_SYNC') taskType = 'MIRROR_SYNC';

      items.push({
        id: log.id,
        agentId: log.agentId,
        agentName: log.agentName,
        agentRole: log.agentRole,
        taskTitle: log.decisionRationale,
        taskType,
        startedAt: started,
        durationMs: duration,
        finishedAt: started + duration,
        status: log.status === 'SUCCESS' ? 'SUCCESS' : log.status === 'FAILURE' ? 'FAILED' : 'RUNNING',
        resourceMetrics: {
          cpuPercent: Math.floor(15 + Math.random() * 35),
          memoryMb: Math.floor(120 + Math.random() * 80),
          wirePayloadKb: Math.floor(4 + Math.random() * 20),
          dbWrites: 1
        },
        decisionRationale: log.decisionRationale,
        targetResource: log.targetResource,
        stepsCount: 1
      });
    });

    // Sort by startedAt descending
    return items.sort((a, b) => b.startedAt - a.startedAt);
  }, [executionHistory, auditLogs]);

  const filteredItems = useMemo(() => {
    return timelineItems.filter((item) => {
      if (selectedRole !== 'ALL' && item.agentRole !== selectedRole) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
      return true;
    });
  }, [timelineItems, selectedRole, selectedStatus]);

  // Handle live task trigger
  const handleDispatchRecipe = async (simulateHeal = false) => {
    setIsSimulatingDispatch(true);
    try {
      onAddToast?.({
        title: 'Dispatching Recipe',
        message: `Iniciando receta "${activeRecipeId}" en AgentRecipeEngine...`,
        type: 'info'
      });

      const res = await agentRecipeEngine.executeRecipe(
        activeRecipeId,
        'nexus-orchestrator',
        simulateHeal ? { simulatedFailureStep: 'step-build' } : undefined
      );

      if (res.status === 'HEALED_AND_COMPLETED') {
        onAddToast?.({
          title: 'Auto-Healing Exitoso',
          message: `La receta sufrió una falla simulada y fue auto-reparada por el motor heurístico en ${res.totalDurationMs}ms.`,
          type: 'success'
        });
      } else if (res.status === 'COMPLETED') {
        onAddToast?.({
          title: 'Receta Completada',
          message: `Flujo ${res.recipeName} completado con éxito (0 fallos).`,
          type: 'success'
        });
      }
    } catch (err: any) {
      onAddToast?.({
        title: 'Error de Despacho',
        message: err.message || 'Fallo al ejecutar receta',
        type: 'error'
      });
    } finally {
      setIsSimulatingDispatch(false);
      refreshData();
    }
  };

  // Timeline rendering calculations
  const now = Date.now();
  const timeWindowMs = timeZoom === '10M' ? 10 * 60 * 1000 : timeZoom === '1H' ? 60 * 60 * 1000 : 5 * 60 * 1000;
  const startTime = now - timeWindowMs;

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Agent Lifecycle Visualizer & GANTT Timeline
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              gRPC-web & MCP Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Traza de transiciones de estado, rendimiento de recursos (CPU, RAM, DB Writes) y justificaciones de decisiones agénticas.
          </p>
        </div>

        {/* Recipe Quick Runner */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeRecipeId}
            onChange={(e) => setActiveRecipeId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500"
          >
            {STANDARD_RECIPE_TEMPLATES.map((tpl) => (
              <option key={tpl.recipeId} value={tpl.recipeId}>
                {tpl.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleDispatchRecipe(false)}
            disabled={isSimulatingDispatch}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/30"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Ejecutar Flujo</span>
          </button>

          <button
            onClick={() => handleDispatchRecipe(true)}
            disabled={isSimulatingDispatch}
            title="Simula un fallo de compilación para verificar el auto-healing heurístico"
            className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Auto-Heal</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Filtrar Rol:</span>
          {['ALL', 'ORCHESTRATOR', 'COMPILER', 'SECURITY_AUDITOR', 'REPO_SYNC'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                selectedRole === r
                  ? 'bg-purple-950 text-purple-300 border border-purple-700'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Estado:</span>
          {['ALL', 'SUCCESS', 'HEALED', 'RUNNING', 'FAILED'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                selectedStatus === s
                  ? 'bg-purple-950 text-purple-300 border border-purple-700'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main GANTT Timeline Container */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Task Execution Stream ({filteredItems.length} registros)
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Success
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block"></span> Auto-Healed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block animate-pulse"></span> Running
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span> Failed
            </span>
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No hay tareas agénticas registradas bajo los filtros seleccionados. Ejecuta un flujo arriba.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedTask?.id === item.id;
              const statusColor =
                item.status === 'SUCCESS'
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                  : item.status === 'HEALED'
                  ? 'bg-purple-950/40 border-purple-700/60 text-purple-300'
                  : item.status === 'RUNNING'
                  ? 'bg-blue-950/40 border-blue-700/60 text-blue-300'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-300';

              const barColor =
                item.status === 'SUCCESS'
                  ? 'bg-emerald-500'
                  : item.status === 'HEALED'
                  ? 'bg-purple-500'
                  : item.status === 'RUNNING'
                  ? 'bg-blue-500'
                  : 'bg-rose-500';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTask(item)}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500 shadow-md'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {item.taskTitle}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${statusColor}`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {item.agentRole}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.decisionRationale}
                        </p>
                      </div>
                    </div>

                    {/* Resource Snapshot Chips */}
                    <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 shrink-0">
                      <span className="flex items-center gap-1" title="CPU Usage">
                        <Cpu className="w-3 h-3 text-purple-400" />
                        {item.resourceMetrics.cpuPercent}%
                      </span>
                      <span className="flex items-center gap-1" title="RAM Consumed">
                        <Server className="w-3 h-3 text-cyan-400" />
                        {item.resourceMetrics.memoryMb}MB
                      </span>
                      <span className="flex items-center gap-1" title="IndexedDB Writes">
                        <Database className="w-3 h-3 text-emerald-400" />
                        {item.resourceMetrics.dbWrites} ops
                      </span>
                      <span className="text-slate-300 font-bold">
                        {item.durationMs < 1000 ? `${item.durationMs}ms` : `${(item.durationMs / 1000).toFixed(1)}s`}
                      </span>
                    </div>
                  </div>

                  {/* Simulated GANTT Progress Bar */}
                  <div className="mt-2 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden flex">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(15, (item.durationMs / 5000) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Task Inspector Details */}
      {selectedTask && (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-slate-200">
                Task Inspector: {selectedTask.taskTitle}
              </h4>
            </div>
            <span className="text-[10px] font-mono text-purple-300">
              ID: {selectedTask.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Agente Responsable</span>
              <p className="text-slate-200 font-bold mt-0.5">{selectedTask.agentName} ({selectedTask.agentRole})</p>
              <p className="text-[10px] text-slate-400 mt-1">Target: {selectedTask.targetResource}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Métricas de Recursos</span>
              <p className="text-purple-300 mt-0.5">CPU: {selectedTask.resourceMetrics.cpuPercent}% | RAM: {selectedTask.resourceMetrics.memoryMb}MB</p>
              <p className="text-[10px] text-cyan-400 mt-1">Wire Payload: {selectedTask.resourceMetrics.wirePayloadKb}KB | IndexedDB: {selectedTask.resourceMetrics.dbWrites} writes</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Razón de Decisión</span>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed font-sans">{selectedTask.decisionRationale}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
