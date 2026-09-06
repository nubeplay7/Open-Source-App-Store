import React from 'react';
import { 
  X, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Layers, 
  Database, 
  Wifi, 
  Lock, 
  FolderGit2, 
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import { AppStoreInfo, CATEGORY_DETAILS, PROJECT_STATUS_DETAILS, INSTALL_METHOD_DETAILS, getAndroidVersionName } from '../types';

interface StoreDetailModalProps {
  store: AppStoreInfo | null;
  onClose: () => void;
  onToggleCompare: (store: AppStoreInfo) => void;
  isComparing: boolean;
}

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  store,
  onClose,
  onToggleCompare,
  isComparing
}) => {
  if (!store) return null;

  const cat = CATEGORY_DETAILS[store.category];
  const status = PROJECT_STATUS_DETAILS[store.projectStatus];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-50 font-sans">
                {store.name}
              </h2>
              <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-600/40 px-2 py-0.5 rounded">
                {store.latestVersion}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}>
                {cat.label}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${status.isHealthy ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {store.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(store)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
                isComparing
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {isComparing ? 'Quitar de Comparar' : '+ Comparar'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Key Differentiator & Best For */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Diferenciador Clave
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {store.keyDifferentiator}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Caso de Uso Ideal
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {store.bestForUseCase}
              </p>
            </div>
          </div>

          {/* Scores Overview */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
              Evaluación Global de Rendimiento y Seguridad
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <div className="text-lg font-mono font-bold text-sky-400">{store.easeOfUseScore.toFixed(1)}/10</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Facilidad de Uso</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <div className="text-lg font-mono font-bold text-emerald-400">{store.securityScore.toFixed(1)}/10</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Seguridad Cripto</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <div className="text-lg font-mono font-bold text-purple-400">{store.repoEcosystemScore.toFixed(1)}/10</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ecosistema Repos</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <div className="text-lg font-mono font-bold text-amber-400">{store.performance.overallPerformanceScore.toFixed(1)}/10</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Rendimiento RAM</div>
              </div>
            </div>
          </div>

          {/* Technical Specs & Performance Benchmarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tech Stack */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Stack Técnico & Arquitectura
              </div>
              <div className="text-xs font-mono space-y-1.5 text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Lenguaje:</span>
                  <span className="text-slate-100 font-bold">{store.techStack.primaryLanguage}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">UI / Presentación:</span>
                  <span className="text-slate-100">{store.techStack.uiArchitecture}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Patrón:</span>
                  <span className="text-slate-100">{store.techStack.architecturePattern}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Base de Datos:</span>
                  <span className="text-slate-100">{store.techStack.database}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Librería de Red:</span>
                  <span className="text-slate-100">{store.techStack.networkLibrary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Compatibilidad Android:</span>
                  <span className="text-emerald-400 font-bold">Android {getAndroidVersionName(store.techStack.minSdk)} hasta Android {getAndroidVersionName(store.techStack.targetSdk)}</span>
                </div>
              </div>
            </div>

            {/* Performance Benchmarks */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Métricas de Rendimiento Físico
              </div>
              <div className="text-xs font-mono space-y-1.5 text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">RAM en Reposo (Idle):</span>
                  <span className="text-slate-100 font-bold">{store.performance.ramUsageIdleMb} MB</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">RAM durante Indexación:</span>
                  <span className="text-slate-100">{store.performance.ramUsageIndexingMb} MB</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Cold Start (Arranque en frío):</span>
                  <span className="text-slate-100">{store.performance.coldStartTimeMs} ms</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Velocidad Sincronización:</span>
                  <span className="text-slate-100">{store.performance.indexSyncSpeedSec} seg</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Tamaño APK del Instalador:</span>
                  <span className="text-slate-100">{store.techStack.apkPayloadSizeMb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Soporte F-Droid Index V2:</span>
                  <span className={store.performance.indexV2Support ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {store.performance.indexV2Support ? '✅ Sí (Acelerado)' : '❌ No (Index V1)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Methods */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
              Métodos de Instalación Soportados
            </div>
            <div className="flex flex-wrap gap-2">
              {store.installMethods.map((method) => {
                const methodInfo = INSTALL_METHOD_DETAILS[method];
                return (
                  <span
                    key={method}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono ${
                      methodInfo.requiresRoot
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    }`}
                  >
                    {methodInfo.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Features Check Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
              Checklist de Funcionalidades Avanzadas
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                {store.features.unattendedRootlessUpdates ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.unattendedRootlessUpdates ? 'text-slate-200' : 'text-slate-500'}>Updates silenciosos (Shizuku)</span>
              </div>

              <div className="flex items-center gap-2">
                {store.features.backgroundAutoUpdates ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.backgroundAutoUpdates ? 'text-slate-200' : 'text-slate-500'}>Auto-updates en segundo plano</span>
              </div>

              <div className="flex items-center gap-2">
                {store.features.splitApkSupport ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.splitApkSupport ? 'text-slate-200' : 'text-slate-500'}>Soporte Split APKs / Bundles</span>
              </div>

              <div className="flex items-center gap-2">
                {store.features.trackerScanningExodus ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.trackerScanningExodus ? 'text-slate-200' : 'text-slate-500'}>Escáner de Trackers Exodus</span>
              </div>

              <div className="flex items-center gap-2">
                {store.features.torOrbotProxy ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.torOrbotProxy ? 'text-slate-200' : 'text-slate-500'}>Proxy Tor (Orbot) integrado</span>
              </div>

              <div className="flex items-center gap-2">
                {store.features.rollbackSupport ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.rollbackSupport ? 'text-slate-200' : 'text-slate-500'}>Rollback a versiones previas</span>
              </div>

              <div className="flex items-center gap-2">
                {store.features.exportImportList ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.exportImportList ? 'text-slate-200' : 'text-slate-500'}>Exportar/Importar lista de apps</span>
              </div>

              <div className="flex items-center gap-2">
                {store.features.deltaUpdates ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.deltaUpdates ? 'text-slate-200' : 'text-slate-500'}>Actualizaciones Delta (ahorro datos)</span>
              </div>

              <div className="flex items-center gap-2">
                {store.features.repoAddViaQr ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className={store.features.repoAddViaQr ? 'text-slate-200' : 'text-slate-500'}>Añadir repo vía código QR</span>
              </div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Ventajas Principales
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                {store.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-2">
                Limitaciones / Desventajas
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                {store.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Changelog & Status */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
              Registro de Cambios Reciente ({store.latestReleaseDate})
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {store.recentChangelog}
            </p>
          </div>
        </div>

        {/* Modal Footer Links */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between gap-4 bg-slate-900/95 sticky bottom-0 z-20">
          <div className="flex items-center gap-3">
            <a
              href={store.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-emerald-400 font-mono bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Código Fuente ({store.license})</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {store.websiteUrl && (
              <a
                href={store.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 font-mono transition-colors"
              >
                <span>Sitio Web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
