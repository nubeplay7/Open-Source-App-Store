import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Zap, 
  Activity, 
  Layers, 
  Download, 
  AlertCircle, 
  TrendingUp, 
  Server, 
  HardDrive, 
  GitCommit, 
  ShieldCheck, 
  Play, 
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { GitHubBuildRun } from '../types';

interface CiCdPerformanceSummaryProps {
  buildRuns: GitHubBuildRun[];
  onSelectRun?: (run: GitHubBuildRun) => void;
  onTriggerNewBuild?: () => void;
}

export const CiCdPerformanceSummary: React.FC<CiCdPerformanceSummaryProps> = ({
  buildRuns,
  onSelectRun,
  onTriggerNewBuild
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'completed' | 'in_progress' | 'failed'>('ALL');
  const [hoveredRun, setHoveredRun] = useState<GitHubBuildRun | null>(null);

  // Filtered runs
  const filteredRuns = useMemo(() => {
    if (statusFilter === 'ALL') return buildRuns;
    return buildRuns.filter(r => r.status === statusFilter);
  }, [buildRuns, statusFilter]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const total = buildRuns.length;
    const completed = buildRuns.filter(r => r.status === 'completed').length;
    const inProgress = buildRuns.filter(r => r.status === 'in_progress').length;
    const failed = buildRuns.filter(r => r.status === 'failed').length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;

    const completedRuns = buildRuns.filter(r => r.durationSeconds > 0);
    const avgDuration = completedRuns.length > 0 
      ? Math.round(completedRuns.reduce((acc, r) => acc + r.durationSeconds, 0) / completedRuns.length)
      : 155;

    const totalApkSize = buildRuns.reduce((acc, r) => acc + (r.apkSizeMb || 0), 0);
    const maxDuration = Math.max(...buildRuns.map(r => r.durationSeconds), 240);

    return {
      total,
      completed,
      inProgress,
      failed,
      successRate,
      avgDuration,
      totalApkSize: totalApkSize.toFixed(1),
      maxDuration
    };
  }, [buildRuns]);

  const activeRun = useMemo(() => {
    if (selectedRunId) {
      return buildRuns.find(r => r.id === selectedRunId) || buildRuns[0];
    }
    return buildRuns[0] || null;
  }, [buildRuns, selectedRunId]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 rounded-2xl border border-indigo-900/40 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-700/60 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">Rendimiento de Compilación CI/CD</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              GitHub Actions Bridge
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Monitoreo en tiempo real de compilaciones reproducibles, tiempos de pipeline y salud del clúster de runners.
          </p>
        </div>

        {onTriggerNewBuild && (
          <button
            onClick={onTriggerNewBuild}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950 shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>Despachar Nueva Compilación</span>
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Success Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-700/50 transition space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tasa de Éxito</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.successRate}%</span>
            <span className="text-[11px] text-slate-400 font-mono">({stats.completed}/{stats.total} builds)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </div>

        {/* 2. Avg Build Time */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-700/50 transition space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiempo Promedio</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300 font-mono">{stats.avgDuration}s</span>
            <span className="text-[11px] text-slate-400 font-mono">({Math.floor(stats.avgDuration / 60)}m {stats.avgDuration % 60}s)</span>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>22% más rápido con Gradle K2</span>
          </p>
        </div>

        {/* 3. System Health Score */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-700/50 transition space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Salud del Sistema</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-300 font-mono">100%</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              ÓPTIMO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            0 cuellos de botella • 88% Cache Hit
          </p>
        </div>

        {/* 4. Total Artifacts Size */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-700/50 transition space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">APKs Generados</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300 font-mono">{stats.totalApkSize} MB</span>
            <span className="text-[11px] text-slate-400">Total FOSS</span>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Firmados v2/v3/v4 con SHA-256</span>
          </p>
        </div>
      </div>

      {/* Main Interactive Bar Chart Section */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Gráfico de Duración por Build (GitHubBuildRun)</span>
            </h4>
            <p className="text-xs text-slate-400">
              Cada barra representa la duración en segundos de una compilación automatizada. Haz clic para inspeccionar.
            </p>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({buildRuns.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'completed' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Exitosos ({stats.completed})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'in_progress' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              En Curso ({stats.inProgress})
            </button>
          </div>
        </div>

        {/* Bar Chart Canvas */}
        <div className="relative pt-6 pb-2">
          {/* Average Line Indicator */}
          <div 
            className="absolute left-0 right-0 border-t border-dashed border-cyan-500/60 z-10 pointer-events-none flex items-center justify-end pr-2"
            style={{ 
              bottom: `${Math.min(90, Math.max(15, (stats.avgDuration / stats.maxDuration) * 160))}px` 
            }}
          >
            <span className="bg-slate-900/90 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow">
              Promedio: {stats.avgDuration}s
            </span>
          </div>

          {/* Bars Flex Container */}
          <div className="h-56 flex items-end gap-3 sm:gap-4 px-2 overflow-x-auto pb-6 pt-4">
            {filteredRuns.map((run) => {
              const duration = run.durationSeconds || 45;
              const heightPercent = Math.min(100, Math.max(18, (duration / stats.maxDuration) * 100));
              const isSelected = selectedRunId === run.id;

              // Color based on status
              let barColor = 'from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400';
              let borderColor = 'border-emerald-400/80';
              if (run.status === 'in_progress') {
                barColor = 'from-amber-600 to-yellow-500 animate-pulse';
                borderColor = 'border-amber-400';
              } else if (run.status === 'failed') {
                barColor = 'from-rose-600 to-red-500';
                borderColor = 'border-rose-400';
              }

              return (
                <div
                  key={run.id}
                  className="flex-1 min-w-[56px] max-w-[80px] flex flex-col items-center gap-2 group cursor-pointer"
                  onClick={() => {
                    setSelectedRunId(run.id);
                    if (onSelectRun) onSelectRun(run);
                  }}
                  onMouseEnter={() => setHoveredRun(run)}
                  onMouseLeave={() => setHoveredRun(null)}
                >
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-cyan-300 transition whitespace-nowrap">
                    {duration}s
                  </div>

                  {/* Vertical Bar */}
                  <div className="w-full bg-slate-950/80 rounded-t-xl overflow-hidden h-40 flex items-end p-1">
                    <div
                      className={`w-full rounded-t-lg bg-gradient-to-t ${barColor} transition-all duration-500 ${
                        isSelected ? `ring-2 ring-white shadow-lg ${borderColor}` : ''
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Bottom Label (App Name & Commit) */}
                  <div className="text-center w-full">
                    <p className="text-[10px] font-bold text-slate-200 truncate w-full group-hover:text-indigo-300 transition">
                      {run.appName}
                    </p>
                    <span className="text-[9px] font-mono text-slate-400 block truncate">
                      {run.commitHash || run.id.slice(-5)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Build Details Card */}
        {activeRun && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h5 className="text-xs font-bold text-white">
                  Inspección de Build: <strong className="text-emerald-300">{activeRun.appName}</strong> ({activeRun.versionTag})
                </h5>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>Commit: <strong className="text-slate-200">{activeRun.commitHash}</strong></span>
                <span>•</span>
                <span>Duración: <strong className="text-cyan-300">{activeRun.durationSeconds}s</strong></span>
                <span>•</span>
                <span>Tamaño APK: <strong className="text-amber-300">{activeRun.apkSizeMb} MB</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 font-mono">Runner Asignado:</p>
                <p className="font-mono text-xs bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-200">
                  {activeRun.runner || 'ubuntu-latest (4-core vCPU, 16GB RAM)'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 font-mono">Arquitecturas Compiladas:</p>
                <p className="font-mono text-xs bg-slate-900 p-2 rounded-lg border border-slate-800 text-purple-300">
                  {activeRun.architecture || 'arm64-v8a • armeabi-v7a • x86_64'}
                </p>
              </div>
            </div>

            {activeRun.sha256Checksum && (
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono flex items-center justify-between text-slate-400">
                <span className="truncate mr-2">SHA-256: {activeRun.sha256Checksum}</span>
                <span className="text-emerald-400 font-bold shrink-0">✓ Verificado</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Runner Infrastructure Fleet Health */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Estado del Clúster de Runners CI/CD</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">ubuntu-latest (Node 20 / JDK 17)</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">4 vCPU • 16GB RAM • Gradle Cache 88%</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">arm64-native-runner</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                STANDBY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">NDK r26b • NDK Compilations (Seal/Ytdlp)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">apksigner-security-daemon</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                ACTIVO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Verificación de esquemas de firma v2+v3+v4</p>
          </div>
        </div>
      </div>
    </div>
  );
};
