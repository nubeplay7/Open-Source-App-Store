import React, { useState } from 'react';
import { 
  History, 
  Cpu, 
  Download, 
  RefreshCw, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Layers, 
  Key, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  HardDrive, 
  FolderDown, 
  ExternalLink, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Wifi,
  Radio,
  FileCode2,
  BarChart3,
  Copy,
  Check
} from 'lucide-react';
import { AppCatalogItem, GitHubBuildRun, ClonedAppRepo, KeystoreEntry } from '../types';
import { BuildEvidenceGallery } from './BuildEvidenceGallery';
import { ToastNotification } from './ToastNotificationCenter';

interface BuildsHubViewProps {
  catalog: AppCatalogItem[];
  buildHistory: GitHubBuildRun[];
  clonedRepos: Record<string, ClonedAppRepo>;
  keystores: KeystoreEntry[];
  selectedKeyId: string;
  onOpenCompiler: (targetApp?: AppCatalogItem) => void;
  onOpenKeystoreVault: () => void;
  onInstallApk: (app: AppCatalogItem) => void;
  onCloneRepoLocally: (app: AppCatalogItem) => void;
  onSyncClonedRepo: (appId: string) => void;
  onRetryBuild: (run: GitHubBuildRun) => void;
  onAddToast?: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  onVerifyGitHubToken?: () => void;
  githubPat?: string;
}

type HubTab = 'ALL_BUILDS' | 'RECENT_APKS' | 'REPO_SYNC' | 'LOCAL_CLONES' | 'EVIDENCE_GALLERY';

export const BuildsHubView: React.FC<BuildsHubViewProps> = ({
  catalog,
  buildHistory,
  clonedRepos,
  keystores,
  selectedKeyId,
  onOpenCompiler,
  onOpenKeystoreVault,
  onInstallApk,
  onCloneRepoLocally,
  onSyncClonedRepo,
  onRetryBuild,
  onAddToast,
  onVerifyGitHubToken,
  githubPat
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('ALL_BUILDS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'FAILED'>('ALL');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const activeKey = keystores.find(k => k.id === selectedKeyId) || keystores[0];

  // Calculations
  const completedBuilds = buildHistory.filter(b => b.status === 'completed');
  const successRate = buildHistory.length > 0 
    ? Math.round((completedBuilds.length / buildHistory.length) * 100) 
    : 100;
  const totalApkStorageMb = completedBuilds.reduce((acc, curr) => acc + (curr.apkSizeMb || 18.5), 0);
  const totalLocalClonedMb = Object.values(clonedRepos).reduce((acc, curr) => acc + (curr.sizeMb || 0), 0);

  // Filtered builds
  const filteredBuilds = buildHistory.filter(run => {
    if (statusFilter === 'COMPLETED' && run.status !== 'completed') return false;
    if (statusFilter === 'IN_PROGRESS' && run.status !== 'in_progress') return false;
    if (statusFilter === 'FAILED' && run.status !== 'failed') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        run.appName.toLowerCase().includes(q) ||
        run.packageName.toLowerCase().includes(q) ||
        run.commitHash.toLowerCase().includes(q) ||
        run.versionTag.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
    if (onAddToast) {
      onAddToast({
        title: 'SHA-256 Copiado',
        message: 'Hash criptográfico copiado al portapapeles para verificación.',
        type: 'success'
      });
    }
  };

  const handleSyncAllRepos = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      Object.keys(clonedRepos).forEach(appId => {
        onSyncClonedRepo(appId);
      });
      if (onAddToast) {
        onAddToast({
          title: 'Repositorios Sincronizados con GitHub',
          message: `Se han actualizado todos los repositorios vinculados contra los commits upstream más recientes.`,
          type: 'success'
        });
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Hero Header & Quick Stats */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-950">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Centro de Compilaciones & Sincronización CI
                  </h2>
                  <span className="text-xs bg-sky-950 text-sky-300 border border-sky-800/80 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                    GitHub Actions Cloud
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Administra compilaciones en la nube, firmas criptográficas, descargas de APKs y clones locales
                </p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                onClick={onOpenKeystoreVault}
                className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-xs font-semibold text-amber-300 border border-amber-800/60 transition flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Llave Activa: <strong className="font-mono">{activeKey?.alias || 'ciber-release-key'}</strong></span>
              </button>

              {onVerifyGitHubToken && (
                <button
                  onClick={onVerifyGitHubToken}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 border border-sky-800/60 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GitHub PAT: <strong className="text-emerald-300">Conectado (@oscar-manuel)</strong></span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onOpenCompiler()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-sky-950 flex items-center gap-2 transition"
            >
              <Cpu className="w-4 h-4" />
              <span>Nueva Compilación CI</span>
            </button>

            <button
              onClick={handleSyncAllRepos}
              disabled={isSyncingAll}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Sincronizando...' : 'Sincronizar Todo'}</span>
            </button>
          </div>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/70">
            <span className="text-[11px] text-slate-400 font-medium block">Total Compilaciones</span>
            <div className="text-lg font-extrabold text-white font-mono mt-0.5">{buildHistory.length}</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" /> {completedBuilds.length} Exitosas
            </span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/70">
            <span className="text-[11px] text-slate-400 font-medium block">Tasa de Éxito CI</span>
            <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">{successRate}%</div>
            <span className="text-[10px] text-slate-400 mt-0.5">Ubuntu 4-Core Runner</span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/70">
            <span className="text-[11px] text-slate-400 font-medium block">Artefactos APK Generados</span>
            <div className="text-lg font-extrabold text-sky-400 font-mono mt-0.5">
              {Math.round(totalApkStorageMb)} MB
            </div>
            <span className="text-[10px] text-sky-300 mt-0.5">Firmas Scheme v1-v4</span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/70">
            <span className="text-[11px] text-slate-400 font-medium block">Clones Locales en Memoria</span>
            <div className="text-lg font-extrabold text-purple-400 font-mono mt-0.5">
              {Object.keys(clonedRepos).length} Repos
            </div>
            <span className="text-[10px] text-purple-300 mt-0.5">{totalLocalClonedMb.toFixed(1)} MB en dispositivo</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'ALL_BUILDS', label: `Historial de Compilaciones (${buildHistory.length})`, icon: History },
          { id: 'RECENT_APKS', label: `Descargas Directas APK (${completedBuilds.length})`, icon: Download },
          { id: 'REPO_SYNC', label: 'Estado de Sync Repositorios', icon: GitBranch },
          { id: 'LOCAL_CLONES', label: `Clones en Dispositivo (${Object.keys(clonedRepos).length})`, icon: HardDrive },
          { id: 'EVIDENCE_GALLERY', label: 'Evidencias Criptográficas', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HubTab)}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-sky-950/70 text-sky-400 border border-sky-800/80 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL BUILDS DETAILED HISTORY */}
      {activeTab === 'ALL_BUILDS' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por app, commit, hash, versión..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'COMPLETED', label: 'Exitosos' },
                { id: 'IN_PROGRESS', label: 'En Progreso' },
                { id: 'FAILED', label: 'Fallidos' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    statusFilter === f.id
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Builds Table / Cards */}
          <div className="space-y-3">
            {filteredBuilds.map((run) => {
              const matchedApp = catalog.find(a => a.id === run.appId || a.name === run.appName);
              return (
                <div
                  key={run.id}
                  className="bg-[#0f172a] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                        {run.appName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-100">{run.appName}</h4>
                          <span className="text-xs font-mono font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/80">
                            {run.versionTag}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            [{run.commitHash}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-sm">
                          {run.packageName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                        run.status === 'completed'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                          : run.status === 'in_progress'
                          ? 'bg-sky-950/80 text-sky-400 border border-sky-800/80 animate-pulse'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                      }`}>
                        {run.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        {run.status === 'in_progress' && <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />}
                        <span>{run.status === 'completed' ? 'Completado' : run.status === 'in_progress' ? 'Compilando...' : 'Fallido'}</span>
                      </span>

                      <button
                        onClick={() => onRetryBuild(run)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        title="Reintentar compilación"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {run.apkDownloadUrl && matchedApp && (
                        <button
                          onClick={() => onInstallApk(matchedApp)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Instalar</span>
                        </button>
                      )}

                      {run.apkDownloadUrl && (
                        <a
                          href={run.apkDownloadUrl}
                          download
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs border border-sky-800/60 flex items-center gap-1.5 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>APK</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Firma Criptográfica:</span>
                      <span className="font-mono text-amber-300 font-semibold">{run.signingKeyAlias || 'ciber-release-key'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Duración CI:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{run.durationSeconds}s</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Tamaño:</span>
                      <span className="font-mono text-sky-300 font-semibold">{run.apkSizeMb || 18.5} MB</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Fecha:</span>
                      <span className="text-slate-400">{run.completedAt || run.startedAt}</span>
                    </div>
                  </div>

                  {/* Checksum Bar */}
                  {run.sha256Checksum && (
                    <div className="flex items-center justify-between text-[11px] bg-black/50 p-2 rounded-lg border border-slate-800/60 gap-2 font-mono">
                      <span className="text-slate-400 truncate">SHA-256: {run.sha256Checksum}</span>
                      <button
                        onClick={() => handleCopySha(run.sha256Checksum || '')}
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0 font-sans text-xs font-semibold"
                      >
                        {copiedSha === run.sha256Checksum ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSha === run.sha256Checksum ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RECENT APK DIRECT DOWNLOADS */}
      {activeTab === 'RECENT_APKS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedBuilds.map((run) => {
            const matchedApp = catalog.find(a => a.id === run.appId || a.name === run.appName);
            return (
              <div
                key={run.id}
                className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {run.appName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white">{run.appName}</h4>
                        <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
                          {run.versionTag}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-1 rounded-full font-mono font-semibold border border-sky-800">
                      {run.apkSizeMb || 18.5} MB
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono truncate">
                    {run.packageName}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Esquemas de Firma:</span>
                      <span className="font-mono text-amber-300 font-bold">Scheme v1, v2, v3, v4</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Llave de Firma:</span>
                      <span className="font-mono text-slate-200">{run.signingKeyAlias || 'ciber-release-key'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Compilado:</span>
                      <span className="text-slate-400">{run.completedAt || 'Hoy'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    {matchedApp && (
                      <button
                        onClick={() => onInstallApk(matchedApp)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Instalar Directo</span>
                      </button>
                    )}

                    <a
                      href={run.apkDownloadUrl || '#'}
                      download
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-sky-800/60 flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar</span>
                    </a>
                  </div>

                  {run.sha256Checksum && (
                    <button
                      onClick={() => handleCopySha(run.sha256Checksum || '')}
                      className="w-full py-1.5 px-3 rounded-lg bg-black/60 hover:bg-black/80 text-[10px] font-mono text-slate-400 hover:text-sky-300 border border-slate-800 flex items-center justify-center gap-1.5 transition"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar SHA-256 Hash</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: REPOSITORIES SYNC STATUS */}
      {activeTab === 'REPO_SYNC' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>Repositorios GitHub Vinculados & Sincronización Automática</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitorea ramas principales, commits upstream y despacha compilaciones con código actualizado
              </p>
            </div>

            <button
              onClick={handleSyncAllRepos}
              disabled={isSyncingAll}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>Verificar Commits Upstream</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalog.map((app) => {
              const isCloned = !!clonedRepos[app.id];
              const cloneData = clonedRepos[app.id];

              return (
                <div
                  key={app.id}
                  className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${app.iconBg} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{app.name}</h4>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {app.packageName}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Sincronizado Upstream</span>
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Rama Default:</span>
                      <span className="text-sky-400">{app.defaultBranch || 'main'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Gradle Task:</span>
                      <span className="text-purple-300 truncate max-w-[200px]">{app.gradleTask || './gradlew assembleRelease'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Repositorio:</span>
                      <a 
                        href={app.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenCompiler(app)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Compilar CI</span>
                    </button>

                    <button
                      onClick={() => onCloneRepoLocally(app)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                        isCloned
                          ? 'bg-purple-950/80 text-purple-300 border-purple-800 hover:bg-purple-900'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <FolderDown className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isCloned ? 'Sincronizar Local' : 'Clonar Local'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: LOCAL CLONES ON DEVICE */}
      {activeTab === 'LOCAL_CLONES' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-950 to-indigo-950/80 p-5 rounded-3xl border border-purple-800/60 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Almacenamiento Local de Código Fuente</span>
                  <span className="text-xs bg-purple-950 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full font-mono">
                    {Object.keys(clonedRepos).length} Repositorios
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Permite editar, auditar sin conexión y sincronizar con GitHub al disponer de red Wi-Fi o datos móviles
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Espacio Utilizado en Dispositivo:</span>
              <span className="text-base font-extrabold text-purple-300 font-mono">{totalLocalClonedMb.toFixed(1)} MB</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(clonedRepos).map((repo) => {
              const matchedApp = catalog.find(a => a.id === repo.appId);
              return (
                <div
                  key={repo.appId}
                  className="bg-[#0f172a] border border-purple-900/40 rounded-3xl p-5 space-y-3.5 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-base text-white flex items-center gap-2">
                        <span>{repo.appName}</span>
                        <span className="text-xs font-mono font-semibold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                          {repo.branch}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{repo.packageName}</p>
                    </div>

                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Sincronizado</span>
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs font-mono text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Ruta Local:</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{repo.localPath}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tamaño / Archivos:</span>
                      <span className="text-purple-300 font-bold">{repo.sizeMb} MB • {repo.filesCount} archivos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Última Sincronización:</span>
                      <span className="text-slate-400">{repo.lastSyncedAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Modo de Red:</span>
                      <span className="text-sky-300 flex items-center gap-1">
                        <Wifi className="w-3.5 h-3.5" />
                        <span>{repo.networkPreference === 'WIFI_ONLY' ? 'Solo Wi-Fi' : 'Wi-Fi & Datos'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {matchedApp && (
                      <button
                        onClick={() => onOpenCompiler(matchedApp)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Compilar desde Local</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSyncClonedRepo(repo.appId)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sincronizar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: EVIDENCE GALLERY */}
      {activeTab === 'EVIDENCE_GALLERY' && (
        <BuildEvidenceGallery
          runs={buildHistory}
          catalog={catalog}
          onInstallApk={onInstallApk}
        />
      )}

    </div>
  );
};
