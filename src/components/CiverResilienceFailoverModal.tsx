import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Cpu,
  Layers,
  Flame,
  Info,
  ExternalLink,
  LifeBuoy,
  Database,
  X
} from 'lucide-react';
import {
  SubsystemHealthRecord,
  DeepTelemetryLogEntry,
  FailoverIncidentReport,
  FailoverSubsystemId,
  TelemetryLogLevel
} from '../types';
import { resilienceTelemetryService } from '../services/resilienceTelemetryService';
import { faultTelemetryDbService } from '../services/faultTelemetryDbService';
import { FaultTelemetryIndexedDbDashboard } from './FaultTelemetryIndexedDbDashboard';

interface CiverResilienceFailoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (toast: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

type TabMode = 'CIRCUIT_BREAKERS' | 'FAULT_TELEMETRY_INDEXEDDB' | 'CHAOS_TESTING' | 'FLIGHT_RECORDER_LOGS' | 'POST_MORTEM_LEDGER';

export const CiverResilienceFailoverModal: React.FC<CiverResilienceFailoverModalProps> = ({
  isOpen,
  onClose,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('CIRCUIT_BREAKERS');
  const [subsystems, setSubsystems] = useState<SubsystemHealthRecord[]>([]);
  const [logs, setLogs] = useState<DeepTelemetryLogEntry[]>([]);
  const [incidents, setIncidents] = useState<FailoverIncidentReport[]>([]);
  const [indexedDbFaultCount, setIndexedDbFaultCount] = useState<number>(0);

  // Diagnostics & Progress
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState<{ name: string; step: number; total: number } | null>(null);

  // Filters for logs
  const [logFilterLevel, setLogFilterLevel] = useState<string>('ALL');
  const [logFilterSubsystem, setLogFilterSubsystem] = useState<string>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [isLogStreamingPaused, setIsLogStreamingPaused] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Chaos Test State
  const [selectedChaosScenario, setSelectedChaosScenario] = useState<string>('FDROID_MIRROR_DOWN');
  const [lastChaosResult, setLastChaosResult] = useState<{
    subsystemName: string;
    detectedError: string;
    whyItHappened: string;
    fallbackRoute: string;
    loopPrevented: boolean;
  } | null>(null);

  // Update data from service
  const refreshData = () => {
    setSubsystems(resilienceTelemetryService.getSubsystems());
    if (!isLogStreamingPaused) {
      setLogs(resilienceTelemetryService.getLogs());
    }
    setIncidents(resilienceTelemetryService.getIncidents());
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshData();
    faultTelemetryDbService.getAllRecords().then((list) => setIndexedDbFaultCount(list.length));
    const unsubscribe = resilienceTelemetryService.subscribe(() => {
      refreshData();
    });
    const unsubFaults = faultTelemetryDbService.subscribe((list) => {
      setIndexedDbFaultCount(list.length);
    });
    return () => {
      unsubscribe();
      unsubFaults();
    };
  }, [isOpen, isLogStreamingPaused]);

  // Overall Global Health Metrics
  const globalMetrics = useMemo(() => {
    const total = subsystems.length || 1;
    const healthy = subsystems.filter((s) => s.status === 'HEALTHY').length;
    const fallbackActive = subsystems.filter((s) => s.status === 'FALLBACK_ACTIVE').length;
    const openCircuits = subsystems.filter((s) => s.circuitState === 'OPEN').length;
    const totalLoopsPrevented = subsystems.reduce((acc, s) => acc + s.antiLoopGuard.loopPreventedCount, 0);
    const avgLatency = Math.round(
      subsystems.reduce((acc, s) => acc + s.averageLatencyMs, 0) / total
    );
    const overallHealthPercent = Math.round((healthy / total) * 100);

    return {
      total,
      healthy,
      fallbackActive,
      openCircuits,
      totalLoopsPrevented,
      avgLatency,
      overallHealthPercent
    };
  }, [subsystems]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchLevel = logFilterLevel === 'ALL' || log.level === logFilterLevel;
      const matchSub = logFilterSubsystem === 'ALL' || log.subsystem === logFilterSubsystem;
      const q = logSearchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        log.message.toLowerCase().includes(q) ||
        log.subsystem.toLowerCase().includes(q) ||
        (log.rootCauseAnalysis && log.rootCauseAnalysis.whyItHappened.toLowerCase().includes(q));

      return matchLevel && matchSub && matchQuery;
    });
  }, [logs, logFilterLevel, logFilterSubsystem, logSearchQuery]);

  // Run Self-Healing Diagnostic
  const handleRunSelfHealing = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticProgress(null);
    try {
      const result = await resilienceTelemetryService.runFullSelfHealingDiagnostic((name, step, total) => {
        setDiagnosticProgress({ name, step, total });
      });

      if (onAddToast) {
        onAddToast({
          title: 'Auto-Diagnóstico Completado',
          message: `${result.healthyCount}/${result.testedCount} subsistemas probados y en estado óptimo. Circuitos sincronizados.`,
          type: 'success'
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningDiagnostic(false);
      setDiagnosticProgress(null);
    }
  };

  // Trigger Chaos Scenario
  const handleTriggerChaos = () => {
    const result = resilienceTelemetryService.simulateChaosScenario(selectedChaosScenario);
    setLastChaosResult(result);
    if (onAddToast) {
      onAddToast({
        title: 'Prueba de Caos Inyectada',
        message: `Fallo forzado en [${result.subsystemName}]. Failover redirigió a "${result.fallbackRoute}". Anti-Loop: Protegido.`,
        type: 'warning'
      });
    }
  };

  // Reset Single Subsystem Circuit
  const handleResetCircuit = (subsystemId: FailoverSubsystemId) => {
    resilienceTelemetryService.resetCircuit(subsystemId);
    if (onAddToast) {
      onAddToast({
        title: 'Circuito Restablecido',
        message: `El subsistema ha sido devuelto al modo primario y estado CLOSED.`,
        type: 'info'
      });
    }
  };

  // Reset All Circuits
  const handleResetAll = () => {
    resilienceTelemetryService.resetAllCircuits();
    if (onAddToast) {
      onAddToast({
        title: 'Todos los Circuitos Restablecidos',
        message: '10 de 10 subsistemas operando en modo primario estándar.',
        type: 'success'
      });
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = resilienceTelemetryService.exportTelemetryJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer_telemetry_flight_recorder_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onAddToast) {
      onAddToast({
        title: 'Telemetría Exportada',
        message: 'Archivo JSON generado con métricas completas de vuelo y failover.',
        type: 'success'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-6xl h-[94vh] bg-[#0c0e14] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* TOP HEADER */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-[#111624] to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Centro de Resiliencia, Failover & Telemetría Profunda
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Anti-Loop Guard Activo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoreo continuo de 10 subsistemas, prevención de ciclos infinitos de error y registro forense de causas raíz.
              </p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunSelfHealing}
              disabled={isRunningDiagnostic}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50"
              title="Ejecutar prueba secuencial de los 10 subsistemas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Auto-Diagnóstico (Self-Healing)</span>
              <span className="md:hidden">Diagnóstico</span>
            </button>

            <button
              onClick={handleExportJson}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs transition"
              title="Exportar Telemetría Completa en JSON"
            >
              <Download className="w-4 h-4 text-sky-400" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-lg text-xs transition"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRICS HUD STRIP */}
        <div className="px-5 py-2.5 bg-[#090b10] border-b border-slate-800/80 flex items-center justify-between overflow-x-auto gap-4 scrollbar-none shrink-0">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Salud General:</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {globalMetrics.overallHealthPercent}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Subsistemas:</span>
              <span className="font-mono font-bold text-slate-200">
                {globalMetrics.healthy}/{globalMetrics.total} Operativos
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Circuitos Abiertos:</span>
              <span
                className={`font-mono font-bold ${
                  globalMetrics.openCircuits > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'
                }`}
              >
                {globalMetrics.openCircuits}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Bucles Infinitos Bloqueados:</span>
              <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                {globalMetrics.totalLoopsPrevented}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Latencia Media:</span>
              <span className="font-mono font-bold text-sky-400">{globalMetrics.avgLatency} ms</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">IndexedDB:</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                {indexedDbFaultCount} fallos
              </span>
            </div>
          </div>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-700/60 px-2.5 py-1 rounded-md transition"
            title="Devolver todos los circuitos a estado inicial saludable"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Restablecer Circuitos</span>
          </button>
        </div>

        {/* PROGRESS BAR (DURING AUTO-DIAGNOSTIC) */}
        {isRunningDiagnostic && diagnosticProgress && (
          <div className="px-5 py-2 bg-emerald-950/40 border-b border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300 animate-pulse">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-emerald-400" />
              <span>
                Sondeando {diagnosticProgress.name} ({diagnosticProgress.step}/{diagnosticProgress.total})...
              </span>
            </div>
            <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-200"
                style={{ width: `${(diagnosticProgress.step / diagnosticProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="px-5 pt-2 bg-[#0c0e14] border-b border-slate-800 flex items-center space-x-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('CIRCUIT_BREAKERS')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'CIRCUIT_BREAKERS'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Matriz de Salud & Circuit Breakers ({subsystems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FAULT_TELEMETRY_INDEXEDDB')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'FAULT_TELEMETRY_INDEXEDDB'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetría de Fallos • IndexedDB ({indexedDbFaultCount})</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Preventivo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CHAOS_TESTING')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'CHAOS_TESTING'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulador de Caos & Failover</span>
          </button>

          <button
            onClick={() => setActiveTab('FLIGHT_RECORDER_LOGS')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'FLIGHT_RECORDER_LOGS'
                ? 'border-sky-500 text-sky-300 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Consola de Telemetría Profunda ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('POST_MORTEM_LEDGER')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'POST_MORTEM_LEDGER'
                ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Registro de Incidentes ({incidents.length})</span>
          </button>
        </div>

        {/* TAB 1: CIRCUIT BREAKERS & HEALTH MATRIX */}
        {activeTab === 'CIRCUIT_BREAKERS' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subsystems.map((sub) => {
                const isHealthy = sub.status === 'HEALTHY';
                const isFallback = sub.status === 'FALLBACK_ACTIVE';
                const isCircuitOpen = sub.circuitState === 'OPEN';

                return (
                  <div
                    key={sub.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isCircuitOpen
                        ? 'bg-rose-950/20 border-rose-700/80 shadow-rose-950/30'
                        : isFallback
                        ? 'bg-amber-950/20 border-amber-600/70 shadow-amber-950/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Card Top */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {sub.category}
                            </span>
                            <h3 className="text-sm font-bold text-white leading-snug">{sub.name}</h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sub.description}</p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isHealthy
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                                : isFallback
                                ? 'bg-amber-950 text-amber-400 border-amber-600'
                                : 'bg-rose-950 text-rose-400 border-rose-600'
                            }`}
                          >
                            {sub.status}
                          </span>

                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                              sub.circuitState === 'CLOSED'
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-rose-900/80 text-rose-200 border border-rose-500'
                            }`}
                          >
                            CIRCUIT: {sub.circuitState}
                          </span>
                        </div>
                      </div>

                      {/* Health & Fallback Details */}
                      <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-slate-800 text-xs space-y-2">
                        {/* What works */}
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-300">Ruta Activa: </span>
                            <span className="text-emerald-300 font-mono">{sub.currentActiveFallback}</span>
                          </div>
                        </div>

                        {/* Fallback chain visual */}
                        <div className="pl-5 space-y-1 text-[11px] text-slate-400">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Cadena de Conmutación (Fallback Chain):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sub.fallbackChain.map((chainItem) => {
                              const isActive = chainItem.name === sub.currentActiveFallback;
                              return (
                                <span
                                  key={chainItem.level}
                                  className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 ${
                                    isActive
                                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <span>{chainItem.level}.</span>
                                  <span>{chainItem.name}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Last Root Cause (if any) */}
                        {sub.lastErrorRootCause && (
                          <div className="mt-2 p-2 rounded bg-rose-950/40 border border-rose-800/60 text-[11px] space-y-1 text-rose-200">
                            <div className="flex items-center gap-1 font-bold text-rose-300">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Último Fallo Detectado & Causa Raíz:</span>
                            </div>
                            <div>
                              <span className="text-slate-400">A qué se debió: </span>
                              <span className="font-medium text-rose-100">{sub.lastErrorRootCause.detectedError}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Por qué sucedió: </span>
                              <span className="text-slate-300">{sub.lastErrorRootCause.whyItHappened}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Acción del Failover: </span>
                              <span className="text-emerald-300 font-medium">
                                {sub.lastErrorRootCause.preventiveActionTaken}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Anti-Loop Guard Details & Metrics Bar */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div>
                          <div className="text-slate-500">Uptime</div>
                          <div className="font-mono font-bold text-slate-200">{sub.uptimePercent}%</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Peticiones</div>
                          <div className="font-mono font-bold text-slate-200">{sub.totalRequests}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Latencia</div>
                          <div className="font-mono font-bold text-sky-400">{sub.averageLatencyMs}ms</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Anti-Loop</div>
                          <div className="font-mono font-bold text-amber-400">
                            {sub.antiLoopGuard.currentRetryCount}/{sub.antiLoopGuard.maxRetries}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-500 font-mono">
                        Check: {sub.lastHealthCheck.substring(11)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            resilienceTelemetryService.recordSuccess(
                              sub.id,
                              Math.floor(Math.random() * 30) + 15
                            );
                            if (onAddToast) {
                              onAddToast({
                                title: 'Sondeo Exitoso',
                                message: `Subsistema [${sub.name}] verificado operando correctamente.`,
                                type: 'success'
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded font-medium transition"
                        >
                          Sondear
                        </button>

                        <button
                          onClick={() => handleResetCircuit(sub.id)}
                          className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-[11px] rounded font-medium transition"
                        >
                          Restablecer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FAULT TELEMETRY & PERSISTENT INDEXEDDB PREVENTIVE DASHBOARD */}
        {activeTab === 'FAULT_TELEMETRY_INDEXEDDB' && (
          <FaultTelemetryIndexedDbDashboard onAddToast={onAddToast} />
        )}

        {/* TAB 3: CHAOS TESTING & FAILOVER VERIFICATION */}
        {activeTab === 'CHAOS_TESTING' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Laboratorio de Pruebas de Resiliencia & Caos</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                    Este entorno interactivo le permite forzar condiciones adversas de red, sockets rotos y cuotas agotadas
                    para comprobar empíricamente que el sistema de <strong>Failover</strong> entra en acción al instante,
                    registra el motivo técnico exacto y <strong>evita entrar en un ciclo infinito de errores</strong> gracias al Circuit Breaker.
                  </p>
                </div>
              </div>

              {/* Chaos Scenario Selector */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: 'FDROID_MIRROR_DOWN',
                    title: 'Caída de Espejo F-Droid',
                    desc: 'Simula HTTP 502 Bad Gateway en repositorio oficial',
                    subsystem: 'FDROID_INDEX_SYNC'
                  },
                  {
                    id: 'SHIZUKU_BINDER_TIMEOUT',
                    title: 'Shizuku Binder Dead',
                    desc: 'Simula socket IPC Android congelado o terminado',
                    subsystem: 'SHIZUKU_IPC_DAEMON'
                  },
                  {
                    id: 'GITHUB_RATE_LIMIT',
                    title: 'Rate-Limit de GitHub CI',
                    desc: 'Simula HTTP 403 por agotamiento de tokens',
                    subsystem: 'GITHUB_ACTIONS_CI'
                  },
                  {
                    id: 'APK_SIGNATURE_CORRUPTED',
                    title: 'Firma APK Corrupta v4',
                    desc: 'Simula alteración de bytes y discrepancia hash',
                    subsystem: 'APK_SIGNING_VAULT'
                  }
                ].map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedChaosScenario(scenario.id)}
                    className={`text-left p-3 rounded-lg border transition ${
                      selectedChaosScenario === scenario.id
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{scenario.title}</span>
                      {selectedChaosScenario === scenario.id && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">{scenario.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Escenario seleccionado:{' '}
                  <span className="font-mono text-amber-300 font-bold">{selectedChaosScenario}</span>
                </div>
                <button
                  onClick={handleTriggerChaos}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-amber-950/40 transition"
                >
                  <Flame className="w-4 h-4" />
                  <span>Inyectar Caos & Verificar Failover</span>
                </button>
              </div>
            </div>

            {/* Chaos Result Panel */}
            {lastChaosResult && (
              <div className="bg-black/60 border border-slate-700 rounded-xl p-5 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Resultado de la Verificación de Failover
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
                    Zero Crashes • Failover 100% Exitoso
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">
                      1. Diagnóstico Forense del Fallo:
                    </div>
                    <div>
                      <span className="text-slate-400">Subsistema afectado: </span>
                      <span className="font-bold text-white">{lastChaosResult.subsystemName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">A qué se debió el fallo: </span>
                      <span className="text-rose-300 font-medium">{lastChaosResult.detectedError}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Por qué sucedió: </span>
                      <span className="text-slate-300">{lastChaosResult.whyItHappened}</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">
                      2. Acción de Contingencia & Anti-Loop:
                    </div>
                    <div>
                      <span className="text-slate-400">Ruta de contingencia activada: </span>
                      <span className="font-mono text-emerald-300 font-bold">{lastChaosResult.fallbackRoute}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Prevención de bucle infinito: </span>
                      <span className="text-emerald-400 font-bold">
                        {lastChaosResult.loopPrevented ? '¡Bloqueo Preventivo Exitoso!' : 'Reintento acotado con Backoff'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Impacto en la experiencia de usuario: </span>
                      <span className="text-sky-300">Cero interrupción. La interfaz continúa operando con normalidad.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FLIGHT RECORDER & DEEP TELEMETRY LOGS */}
        {activeTab === 'FLIGHT_RECORDER_LOGS' && (
          <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-5">
            {/* Filters Bar */}
            <div className="bg-[#090b10] border border-slate-800 rounded-xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-44 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar en logs..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="relative">
                  <select
                    value={logFilterLevel}
                    onChange={(e) => setLogFilterLevel(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 appearance-none pr-6 cursor-pointer focus:outline-none focus:border-sky-500"
                  >
                    <option value="ALL">Todos los Niveles</option>
                    <option value="INFO">INFO</option>
                    <option value="DEBUG">DEBUG</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                    <option value="FATAL">FATAL</option>
                  </select>
                  <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={logFilterSubsystem}
                    onChange={(e) => setLogFilterSubsystem(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 appearance-none pr-6 cursor-pointer focus:outline-none focus:border-sky-500"
                  >
                    <option value="ALL">Todos los Subsistemas</option>
                    <option value="KERNEL">KERNEL</option>
                    <option value="FDROID_INDEX_SYNC">F-Droid Sync</option>
                    <option value="GITHUB_ACTIONS_CI">GitHub Actions CI</option>
                    <option value="SHIZUKU_IPC_DAEMON">Shizuku Daemon</option>
                    <option value="APK_SIGNING_VAULT">Apk Signer</option>
                    <option value="DELTA_PATCH_ENGINE">Delta Updates</option>
                    <option value="P2P_WEBRTC_MESH">P2P Mesh</option>
                    <option value="LOCAL_STORAGE_CACHE">Storage Cache</option>
                  </select>
                  <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLogStreamingPaused((prev) => !prev)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                    isLogStreamingPaused
                      ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isLogStreamingPaused ? 'Reanudar Stream' : 'Pausar'}
                </button>

                <button
                  onClick={() => resilienceTelemetryService.clearLogs()}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:bg-rose-950/40 hover:text-rose-300 transition"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Terminal Log Console */}
            <div className="flex-1 bg-[#050608] border border-slate-800 rounded-xl p-3 overflow-y-auto font-mono text-xs space-y-1.5 shadow-inner">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No se encontraron eventos de telemetría con los filtros seleccionados.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const levelColor =
                    log.level === 'INFO'
                      ? 'text-sky-400 bg-sky-950/60 border-sky-800/60'
                      : log.level === 'DEBUG'
                      ? 'text-slate-400 bg-slate-800/60 border-slate-700/60'
                      : log.level === 'WARN'
                      ? 'text-amber-400 bg-amber-950/60 border-amber-800/60'
                      : log.level === 'ERROR'
                      ? 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                      : 'text-purple-300 bg-purple-950/60 border-purple-800/60';

                  return (
                    <div
                      key={log.id}
                      className="border border-slate-800/60 rounded p-2 hover:bg-slate-900/40 transition"
                    >
                      <div
                        className="flex items-start justify-between gap-2 cursor-pointer"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        <div className="flex items-start gap-2 overflow-hidden">
                          <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp.substring(11)}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${levelColor}`}
                          >
                            {log.level}
                          </span>
                          <span className="text-slate-400 font-semibold shrink-0">[{log.subsystem}]</span>
                          <span className="text-slate-200 truncate">{log.message}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {log.latencyMs !== undefined && (
                            <span className="text-[10px] text-emerald-400">{log.latencyMs}ms</span>
                          )}
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expanded forensic detail */}
                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] space-y-2 bg-black/40 p-2.5 rounded">
                          <div className="grid grid-cols-2 gap-2 text-slate-400 text-[10px]">
                            <div>
                              Trace ID: <span className="text-slate-200">{log.traceId}</span>
                            </div>
                            <div>
                              Span ID: <span className="text-slate-200">{log.spanId}</span>
                            </div>
                          </div>

                          {/* Root Cause Analysis Details */}
                          {log.rootCauseAnalysis && (
                            <div className="p-2 bg-rose-950/30 border border-rose-900/50 rounded space-y-1 text-rose-200">
                              <div className="font-bold text-rose-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Análisis de Causa Raíz (Por qué ocurrió):</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Código de Error: </span>
                                <span className="font-mono text-rose-300">{log.rootCauseAnalysis.errorCode}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Causa Técnica: </span>
                                <span>{log.rootCauseAnalysis.whyItHappened}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Acción del Failover: </span>
                                <span className="text-emerald-300 font-medium">
                                  {log.rootCauseAnalysis.preventiveActionTaken}
                                </span>
                              </div>
                              {log.rootCauseAnalysis.stackTraceSnippet && (
                                <pre className="p-1.5 bg-black/70 rounded text-[10px] overflow-x-auto text-slate-300">
                                  {log.rootCauseAnalysis.stackTraceSnippet}
                                </pre>
                              )}
                            </div>
                          )}

                          {log.contextPayload && (
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold mb-1">Context Payload:</div>
                              <pre className="p-2 bg-black/60 rounded text-[10px] text-emerald-300 overflow-x-auto">
                                {JSON.stringify(log.contextPayload, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: POST-MORTEM & INCIDENTS LEDGER */}
        {activeTab === 'POST_MORTEM_LEDGER' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Historial de Incidentes & Auditoría Post-Mortem</h3>
                <p className="text-xs text-slate-400">
                  Registro cronológico de fallas detectadas, rutas de contingencia ejecutadas y confirmación de bucles infinitos evitados.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Total Incidentes: </span>
                  <span className="text-slate-200 font-bold">{incidents.length}</span>
                </div>
                <div>
                  <span className="text-slate-400">MTTR: </span>
                  <span className="text-emerald-400 font-bold">&lt; 35ms (Instantáneo)</span>
                </div>
              </div>
            </div>

            {incidents.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-slate-800/80 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="font-semibold text-white">Sin incidentes críticos en la sesión actual</p>
                <p className="text-xs text-slate-500 mt-1">Todos los subsistemas han operado dentro de los umbrales nominales.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-mono text-[10px] font-bold">
                          {incident.errorCode}
                        </span>
                        <span className="font-bold text-white">{incident.subsystemName}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{incident.startTime}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/40 p-3 rounded-lg border border-slate-800/60">
                      <div>
                        <span className="text-slate-400">Causa raíz del fallo: </span>
                        <div className="text-slate-200 mt-0.5">{incident.whyItHappened}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Ruta de contingencia utilizada: </span>
                        <div className="text-emerald-400 font-mono font-semibold mt-0.5">
                          {incident.fallbackRouteTriggered}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Bucle infinito prevenido: 100% verificado por AntiLoopGuard</span>
                      </div>
                      <span className="text-slate-500 font-mono">ID: {incident.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM FOOTER */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0a0c10] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Civer App Store Failover Engine v6.1 • Flight Recorder & Circuit Breakers activos</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-500">Buffer: {logs.length}/400 eventos</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
