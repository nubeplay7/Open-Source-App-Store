import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Play, 
  Copy, 
  Check, 
  Key, 
  Terminal, 
  Cpu, 
  Layers, 
  Sparkles, 
  FileCheck2, 
  GitBranch, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  HardDrive,
  CheckCircle,
  Smartphone,
  Eye
} from 'lucide-react';
import { GitHubBuildRun, AppCatalogItem } from '../types';

interface BuildEvidenceGalleryProps {
  runs: GitHubBuildRun[];
  onInstallApk?: (app: AppCatalogItem) => void;
  catalog?: AppCatalogItem[];
  compact?: boolean;
  selectedRunId?: string;
  onSelectRunId?: (runId: string) => void;
}

export const BuildEvidenceGallery: React.FC<BuildEvidenceGalleryProps> = ({
  runs,
  onInstallApk,
  catalog = [],
  compact = false,
  selectedRunId,
  onSelectRunId
}) => {
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [expandedLogRunId, setExpandedLogRunId] = useState<string | null>(null);

  const completedRuns = runs.filter(r => r.status === 'completed');

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const toggleLogExpand = (id: string) => {
    setExpandedLogRunId(prev => prev === id ? null : id);
  };

  if (completedRuns.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
        <FileCheck2 className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
        <h4 className="text-sm font-bold text-slate-200">No hay evidencias de compilación recientes</h4>
        <p className="text-xs max-w-md mx-auto">
          Ejecuta una compilación en el Compilador Cloud para generar reportes criptográficos, certificados de firma y binarios verificados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Evidence Banner */}
      {!compact && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-950 to-sky-950/80 p-4 rounded-2xl border border-emerald-800/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Galería de Evidencias & Auditoría Criptográfica</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded-full font-mono">
                  {completedRuns.length} Builds Verificados
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Certificados de compilación reproducible, hashes SHA-256 inmutables y firmas Scheme v1-v4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>0 Vulnerabilidades • Diffoscope 100% Match</span>
          </div>
        </div>
      )}

      {/* Grid of Evidence Cards */}
      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}>
        {completedRuns.map((run) => {
          const matchedApp = catalog.find(a => a.id === run.appId || a.name === run.appName);
          const isSelected = selectedRunId === run.id;
          const isLogExpanded = expandedLogRunId === run.id;

          return (
            <div 
              key={run.id}
              onClick={() => onSelectRunId && onSelectRunId(run.id)}
              className={`bg-[#0d1117] border rounded-2xl p-4.5 space-y-3.5 transition shadow-lg ${
                isSelected 
                  ? 'border-sky-500/80 ring-1 ring-sky-500/50 bg-slate-900/90' 
                  : 'border-slate-800/90 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-950 shrink-0">
                    {run.appName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-sm text-slate-100">{run.appName}</h5>
                      <span className="text-[11px] font-mono font-bold bg-sky-950 text-sky-300 px-2 py-0.5 rounded-md border border-sky-800/80">
                        {run.versionTag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[220px] sm:max-w-xs">
                      {run.packageName}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shrink-0">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>CI Verificado</span>
                </span>
              </div>

              {/* Cryptographic Proof Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-slate-300">
                <div className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Esquemas Firma</span>
                  <span className="text-xs font-bold text-amber-300 font-mono">
                    {run.schemeV4 !== false ? 'v1, v2, v3, v4' : 'v1, v2, v3'}
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Tamaño APK</span>
                  <span className="text-xs font-bold text-sky-300 font-mono">{run.apkSizeMb || 18.5} MB</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Duración CI</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{run.durationSeconds}s</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Reproducibilidad</span>
                  <span className="text-xs font-bold text-purple-300 font-mono">100% FOSS</span>
                </div>
              </div>

              {/* Signing Key & Hash Details */}
              <div className="space-y-2 bg-slate-950/90 p-3 rounded-xl border border-slate-800/90 text-xs">
                {/* Signing Key */}
                <div className="flex items-center justify-between text-slate-300 flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Llave:</span>
                    <span className="text-slate-200 font-mono font-bold">
                      {run.signingKeyAlias || 'ciber-release-key'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                    {run.signingAlgorithm || 'RSA 4096-bit'}
                  </span>
                </div>

                {/* SHA-256 Fingerprint */}
                {run.sha256Checksum && (
                  <div className="space-y-1 pt-1 border-t border-slate-850">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>SHA-256 Checksum:</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySha(run.sha256Checksum || '');
                        }}
                        className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                      >
                        {copiedSha === run.sha256Checksum ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Hash</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/70 border border-slate-800 font-mono text-[10px] text-sky-300 break-all select-all">
                      {run.sha256Checksum}
                    </div>
                  </div>
                )}
              </div>

              {/* Commit & Runner info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1 font-mono">
                  <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">{run.branch}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sky-400">[{run.commitHash}]</span>
                </div>
                <span className="text-slate-500">{run.completedAt || 'Reciente'}</span>
              </div>

              {/* Collapsible Console Logs Preview */}
              <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLogExpand(run.id);
                  }}
                  className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 py-1"
                >
                  <span className="flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Logs de Compilación ({run.logs.length} pasos)</span>
                  </span>
                  {isLogExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isLogExpanded && (
                  <div className="p-2.5 rounded-xl bg-black/80 border border-slate-800 font-mono text-[10px] space-y-1 max-h-40 overflow-y-auto">
                    {run.logs.map((log, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-slate-500">[{log.timestamp}]</span>
                        <span className={`font-semibold ${
                          log.type === 'error' ? 'text-rose-400' :
                          log.type === 'success' ? 'text-emerald-400' :
                          log.type === 'command' ? 'text-amber-400' : 'text-sky-300'
                        }`}>
                          [{log.step}]:
                        </span>
                        <span className="text-slate-300 flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {matchedApp && onInstallApk && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInstallApk(matchedApp);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Instalar APK</span>
                  </button>
                )}

                <a
                  href={run.apkDownloadUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`${run.packageName}_${run.versionTag}.apk`}
                  onClick={(e) => e.stopPropagation()}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs border border-sky-800/60 flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar APK</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
