import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  WifiOff,
  Terminal,
  Cpu,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Download,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  Zap,
  Activity,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Flame,
  Info,
  ExternalLink
} from 'lucide-react';
import { FaultTelemetryRecord, FaultPreventionSummary, FaultCategory, FaultSeverity } from '../types';
import { faultTelemetryDbService } from '../services/faultTelemetryDbService';

interface FaultTelemetryIndexedDbDashboardProps {
  onAddToast?: (toast: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const FaultTelemetryIndexedDbDashboard: React.FC<FaultTelemetryIndexedDbDashboardProps> = ({
  onAddToast
}) => {
  const [records, setRecords] = useState<FaultTelemetryRecord[]>([]);
  const [summary, setSummary] = useState<FaultPreventionSummary | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | FaultCategory>('ALL');
  const [activeSeverity, setActiveSeverity] = useState<'ALL' | FaultSeverity>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<FaultTelemetryRecord | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Subscribe to real-time IndexedDB updates
  const refreshTelemetry = async () => {
    const list = await faultTelemetryDbService.getAllRecords();
    setRecords(list);
    const sum = await faultTelemetryDbService.getPreventiveSummary();
    setSummary(sum);
  };

  useEffect(() => {
    refreshTelemetry();
    const unsub = faultTelemetryDbService.subscribe((updatedList) => {
      setRecords(updatedList);
      faultTelemetryDbService.getPreventiveSummary().then(setSummary);
    });
    return unsub;
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchCategory = activeCategory === 'ALL' || r.category === activeCategory;
      const matchSeverity = activeSeverity === 'ALL' || r.severity === activeSeverity;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.errorCode.toLowerCase().includes(q) ||
        r.subsystem.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.preventiveAnalysis.rootCauseCategory.toLowerCase().includes(q) ||
        (r.diagnostics.urlOrTarget && r.diagnostics.urlOrTarget.toLowerCase().includes(q));

      return matchCategory && matchSeverity && matchSearch;
    });
  }, [records, activeCategory, activeSeverity, searchQuery]);

  // Simulation Triggers
  const handleSimulateConnection = async () => {
    setIsSimulating(true);
    try {
      const newFault = await faultTelemetryDbService.simulateConnectionError('Espejo F-Droid Frankfurt #02');
      if (onAddToast) {
        onAddToast({
          title: 'Error de Conexión Registrado en IndexedDB',
          message: `${newFault.errorCode}: ${newFault.title}. Almacenado de forma persistente.`,
          type: 'warning'
        });
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateCompilation = async () => {
    setIsSimulating(true);
    try {
      const newFault = await faultTelemetryDbService.simulateCompilationError('VLC Media Player FOSS');
      if (onAddToast) {
        onAddToast({
          title: 'Fallo de Compilación Registrado en IndexedDB',
          message: `${newFault.errorCode} registrado en base de datos local con diagnóstico AAPT2.`,
          type: 'error'
        });
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateUiFreeze = async () => {
    setIsSimulating(true);
    try {
      const duration = 280;
      const newFault = await faultTelemetryDbService.simulateUiFreeze(duration);
      if (onAddToast) {
        onAddToast({
          title: `Bloqueo de UI Registrado (${duration}ms)`,
          message: `Long Task detectado por PerformanceObserver y categorizado para análisis preventivo.`,
          type: 'warning'
        });
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleMarkResolved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await faultTelemetryDbService.markFaultResolved(id);
    if (onAddToast) {
      onAddToast({
        title: 'Fallo Marcado como Mitigado',
        message: 'Estado de resolución persistido en el ObjectStore de IndexedDB.',
        type: 'success'
      });
    }
  };

  const handleClearDatabase = async () => {
    if (window.confirm('¿Seguro que deseas purgar todos los registros de telemetría de fallos en IndexedDB?')) {
      await faultTelemetryDbService.clearAllRecords();
      if (onAddToast) {
        onAddToast({
          title: 'Base de Datos IndexedDB Vaciada',
          message: 'El almacén local "fault_telemetry_records" ha sido reseteado.',
          type: 'info'
        });
      }
    }
  };

  const handleExportJson = async () => {
    const jsonStr = await faultTelemetryDbService.exportDatabaseAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer_fault_telemetry_indexeddb_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onAddToast) {
      onAddToast({
        title: 'Base de Datos IndexedDB Exportada',
        message: 'Archivo JSON generado con todas las anomalías y análisis preventivos.',
        type: 'success'
      });
    }
  };

  const handleCopySnippet = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onAddToast) {
      onAddToast({
        title: 'Copiado al Portapapeles',
        message: 'Diagnóstico forense copiado para depuración.',
        type: 'info'
      });
    }
  };

  const getCategoryBadge = (category: FaultCategory) => {
    switch (category) {
      case 'CONNECTION_ERROR':
        return {
          label: 'Conexión de Red',
          icon: WifiOff,
          bg: 'bg-sky-950/70 border-sky-600/50 text-sky-400',
          pillBg: 'bg-sky-500/20 text-sky-300'
        };
      case 'COMPILATION_ERROR':
        return {
          label: 'Fallo Compilación',
          icon: Terminal,
          bg: 'bg-amber-950/70 border-amber-600/50 text-amber-400',
          pillBg: 'bg-amber-500/20 text-amber-300'
        };
      case 'UI_FREEZE':
        return {
          label: 'Bloqueo de UI',
          icon: Cpu,
          bg: 'bg-purple-950/70 border-purple-600/50 text-purple-400',
          pillBg: 'bg-purple-500/20 text-purple-300'
        };
    }
  };

  const getSeverityBadge = (severity: FaultSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 border border-rose-600 text-rose-300 font-bold';
      case 'HIGH':
        return 'bg-orange-950/80 border border-orange-600/70 text-orange-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-950/80 border border-amber-600/60 text-amber-300';
      case 'LOW':
        return 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-300';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* 1. TOP PREVENTIVE SUMMARY & KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Connection Errors */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'CONNECTION_ERROR' ? 'ALL' : 'CONNECTION_ERROR')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeCategory === 'CONNECTION_ERROR'
              ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Errores Conexión</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <WifiOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {summary?.connectionErrorsCount ?? 0}
            </span>
            <span className="text-xs text-sky-400 font-medium">en IndexedDB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Timeouts DNS, mirrors caídos y reintentos automáticos
          </p>
        </div>

        {/* Card 2: Compilation Errors */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'COMPILATION_ERROR' ? 'ALL' : 'COMPILATION_ERROR')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeCategory === 'COMPILATION_ERROR'
              ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fallos Compilación</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {summary?.compilationErrorsCount ?? 0}
            </span>
            <span className="text-xs text-amber-400 font-medium">CI / Gradle</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            OOM de JVM, fallos AAPT2 y errores de enlace D8/R8
          </p>
        </div>

        {/* Card 3: UI Freezes */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'UI_FREEZE' ? 'ALL' : 'UI_FREEZE')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeCategory === 'UI_FREEZE'
              ? 'bg-purple-950/50 border-purple-500 ring-1 ring-purple-500'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bloqueos de UI</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {summary?.uiFreezesCount ?? 0}
            </span>
            <span className="text-xs text-purple-400 font-mono">
              prom. {summary?.avgUiFreezeDurationMs ?? 0}ms
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Long Tasks (&gt;50ms) en hilo principal y frame drops
          </p>
        </div>

        {/* Card 4: Predictive Risk Score & IndexedDB Health */}
        <div className="p-4 rounded-xl border bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Riesgo Preventivo</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                (summary?.predictedRiskScore ?? 0) > 50
                  ? 'text-rose-400'
                  : (summary?.predictedRiskScore ?? 0) > 25
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {summary?.predictedRiskScore ?? 15}%
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              IDB: {summary?.indexedDbSizeKb ?? 0} KB
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {summary?.autoHealedCount ?? 0} fallos mitigados preventivamente
          </p>
        </div>
      </div>

      {/* 2. REAL-TIME TESTING & SIMULATION PANEL (TRIGGER BUTTONS) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Inyección de Telemetría en Tiempo Real & Pruebas Preventivas
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
              IndexedDB Store: CiverFaultTelemetryDB
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Descargar volcador completo de IndexedDB en JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Exportar JSON</span>
            </button>
            <button
              onClick={handleClearDatabase}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-xs font-semibold transition"
              title="Purgar registros en IndexedDB"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar DB</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Haz clic en cualquiera de los generadores para simular fallas reales y observar cómo el motor de telemetría las captura, categoriza y persiste de inmediato en el almacenamiento local IndexedDB:
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleSimulateConnection}
            disabled={isSimulating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-900/60 hover:bg-sky-800/80 text-sky-200 border border-sky-700/60 text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <WifiOff className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Simular Error de Conexión (504 Timeout)</span>
          </button>

          <button
            onClick={handleSimulateCompilation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border border-amber-700/60 text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Simular Fallo de Compilación (Gradle AAPT2)</span>
          </button>

          <button
            onClick={handleSimulateUiFreeze}
            disabled={isSimulating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/60 text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Simular Bloqueo de UI (Main Thread 280ms)</span>
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC PREVENTIVE RECOMMENDATIONS ENGINE */}
      {summary && summary.activeRecommendations.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Análisis Preventivo Automatizado (Motor Heurístico):</span>
              <span className="text-[10px] text-slate-400 font-mono">Actualizado: {summary.lastSyncedAt}</span>
            </div>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              {summary.activeRecommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 4. FILTERS & SEARCH TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({records.length})
          </button>

          <button
            onClick={() => setActiveCategory('CONNECTION_ERROR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === 'CONNECTION_ERROR'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-900 text-sky-400 hover:text-white border border-slate-800'
            }`}
          >
            <WifiOff className="w-3 h-3" />
            <span>Conexión ({summary?.connectionErrorsCount ?? 0})</span>
          </button>

          <button
            onClick={() => setActiveCategory('COMPILATION_ERROR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === 'COMPILATION_ERROR'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-amber-400 hover:text-white border border-slate-800'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Compilación ({summary?.compilationErrorsCount ?? 0})</span>
          </button>

          <button
            onClick={() => setActiveCategory('UI_FREEZE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === 'UI_FREEZE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-purple-400 hover:text-white border border-slate-800'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Bloqueos UI ({summary?.uiFreezesCount ?? 0})</span>
          </button>
        </div>

        {/* Severity Filter & Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={activeSeverity}
            onChange={(e) => setActiveSeverity(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-mono"
          >
            <option value="ALL">Severidad: Todas</option>
            <option value="CRITICAL">Severidad: CRITICAL</option>
            <option value="HIGH">Severidad: HIGH</option>
            <option value="MEDIUM">Severidad: MEDIUM</option>
            <option value="LOW">Severidad: LOW</option>
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, error..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* 5. TELEMETRY RECORDS LIST */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">No hay anomalías que coincidan con los filtros seleccionados</p>
            <p className="text-xs text-slate-400">
              La base de datos local IndexedDB no contiene registros pendientes para este criterio.
            </p>
          </div>
        ) : (
          filteredRecords.map((item) => {
            const catBadge = getCategoryBadge(item.category);
            const isExpanded = expandedRecordId === item.id;
            const CatIcon = catBadge.icon;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800/90 bg-slate-900/90 hover:border-slate-700 transition overflow-hidden shadow-lg"
              >
                {/* Record Header */}
                <div
                  onClick={() => setExpandedRecordId(isExpanded ? null : item.id)}
                  className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${catBadge.pillBg} shrink-0`}>
                      <CatIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white truncate">
                          {item.errorCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {item.subsystem}
                        </span>
                        {item.resolved ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Mitigado / Resuelto
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-700/60 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Activo
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200 mt-1 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Timers */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {item.diagnostics.durationMs && (
                        <span className="text-[10px] font-mono font-bold text-amber-400 block">
                          {item.diagnostics.durationMs}ms
                        </span>
                      )}
                    </div>

                    {!item.resolved && (
                      <button
                        onClick={(e) => handleMarkResolved(item.id, e)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600 text-xs font-medium transition"
                      >
                        Marcar Resuelto
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(item);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-xs font-medium transition"
                    >
                      Diagnóstico Forense
                    </button>

                    <div className="text-slate-500">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Accordion */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-950/60 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {/* Left: Diagnostics */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                          Diagnóstico Técnico del Sistema
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">ID Registro:</span>
                            <span className="font-mono text-slate-300 truncate block">{item.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Origen Hook:</span>
                            <span className="font-mono text-slate-300 block">{item.source}</span>
                          </div>
                          {item.diagnostics.urlOrTarget && (
                            <div className="col-span-2">
                              <span className="text-slate-500 block">Destino / Tarea:</span>
                              <span className="font-mono text-sky-400 break-all">{item.diagnostics.urlOrTarget}</span>
                            </div>
                          )}
                          {item.diagnostics.durationMs && (
                            <div>
                              <span className="text-slate-500 block">Duración Bloqueo:</span>
                              <span className="font-mono text-amber-400 font-bold">{item.diagnostics.durationMs} ms</span>
                            </div>
                          )}
                          {item.diagnostics.fpsDrop && (
                            <div>
                              <span className="text-slate-500 block">Caída de Cuadros (FPS):</span>
                              <span className="font-mono text-rose-400 font-bold">-{item.diagnostics.fpsDrop} FPS</span>
                            </div>
                          )}
                          {item.diagnostics.memoryUsageMb && (
                            <div>
                              <span className="text-slate-500 block">Consumo Memoria:</span>
                              <span className="font-mono text-purple-400 font-bold">{item.diagnostics.memoryUsageMb} MB</span>
                            </div>
                          )}
                          {item.diagnostics.threadState && (
                            <div>
                              <span className="text-slate-500 block">Estado del Hilo:</span>
                              <span className="font-mono text-slate-300 font-bold">{item.diagnostics.threadState}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Preventive Root Cause Analysis */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                            Análisis Preventivo & Causa Raíz
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                            Riesgo: {item.preventiveAnalysis.recurrenceRiskScore}%
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div>
                            <span className="text-slate-500 font-bold">Categoría Causa: </span>
                            <span className="text-amber-300 font-mono">{item.preventiveAnalysis.rootCauseCategory}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold">¿Por qué ocurrió?: </span>
                            <span className="text-slate-300">{item.preventiveAnalysis.whyItHappened}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold">Mitigación Sugerida: </span>
                            <span className="text-emerald-300">{item.preventiveAnalysis.suggestedMitigation}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold">Acción Aplicada: </span>
                            <span className="text-sky-300">{item.preventiveAnalysis.preventiveActionTaken}</span>
                          </div>
                          <div className="pt-1">
                            <span className="text-[10px] font-mono text-slate-500 block">Regla Heurística Automatizada:</span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-block mt-0.5">
                              {item.preventiveAnalysis.automatedRuleApplied}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stack trace snippet */}
                    {item.diagnostics.stackTraceSnippet && (
                      <div className="relative p-2.5 rounded-lg bg-black/90 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            Volcado de Pila (Stack Trace Snippet)
                          </span>
                          <button
                            onClick={(e) => handleCopySnippet(item.diagnostics.stackTraceSnippet || '', item.id, e)}
                            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition"
                          >
                            {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === item.id ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                        <pre className="text-slate-300 font-mono whitespace-pre">{item.diagnostics.stackTraceSnippet}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. MODAL: DEEP FORENSIC INSPECTOR */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">{selectedRecord.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(selectedRecord.severity)}`}>
                      {selectedRecord.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedRecord.id} • {selectedRecord.subsystem} • {new Date(selectedRecord.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Descripción del Incidente</span>
              {selectedRecord.description}
            </div>

            {/* Diagnostics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Código de Error</span>
                <span className="font-mono font-bold text-amber-400 truncate block">{selectedRecord.errorCode}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Categoría</span>
                <span className="font-bold text-sky-400 truncate block">{selectedRecord.category}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Duración</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedRecord.diagnostics.durationMs ? `${selectedRecord.diagnostics.durationMs}ms` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Estado Mitigación</span>
                <span className={`font-bold ${selectedRecord.resolved ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedRecord.resolved ? 'Resuelto' : 'Requiere Atención'}
                </span>
              </div>
            </div>

            {/* Preventive Deep Analysis */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Análisis de Causa Raíz & Recomendaciones Preventivas</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Índice de Recurrencia: {selectedRecord.preventiveAnalysis.recurrenceRiskScore}%
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Categoría Raíz:</span>
                  <span className="text-amber-300 font-mono">{selectedRecord.preventiveAnalysis.rootCauseCategory}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">¿Por qué ocurrió?:</span>
                  <p className="text-slate-300">{selectedRecord.preventiveAnalysis.whyItHappened}</p>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Mitigación Preventiva:</span>
                  <p className="text-emerald-300">{selectedRecord.preventiveAnalysis.suggestedMitigation}</p>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Acción de Failover Ejecutada:</span>
                  <p className="text-sky-300">{selectedRecord.preventiveAnalysis.preventiveActionTaken}</p>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Regla Heurística Aplicada:</span>
                  <span className="font-mono text-[11px] text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 inline-block mt-1">
                    {selectedRecord.preventiveAnalysis.automatedRuleApplied}
                  </span>
                </div>
              </div>
            </div>

            {/* Stack trace */}
            {selectedRecord.diagnostics.stackTraceSnippet && (
              <div className="p-3 rounded-xl bg-black border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono">
                  <span>VOLCADO DE PILA (STACK TRACE)</span>
                  <button
                    onClick={(e) => handleCopySnippet(selectedRecord.diagnostics.stackTraceSnippet || '', selectedRecord.id, e)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedId === selectedRecord.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Traza</span>
                  </button>
                </div>
                <pre className="text-slate-300 font-mono text-[11px] whitespace-pre overflow-x-auto p-2 bg-slate-950 rounded-lg">
                  {selectedRecord.diagnostics.stackTraceSnippet}
                </pre>
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                Persistido en almacén 'fault_telemetry_records' (IndexedDB)
              </span>

              <div className="flex items-center gap-2">
                {!selectedRecord.resolved && (
                  <button
                    onClick={async (e) => {
                      await handleMarkResolved(selectedRecord.id, e);
                      setSelectedRecord(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Marcar Mitigado
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
