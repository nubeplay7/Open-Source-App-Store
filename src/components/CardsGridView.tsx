import React from 'react';
import { 
  Star, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  Check, 
  Zap, 
  Shield, 
  FolderGit2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AppStoreInfo, CATEGORY_DETAILS, PROJECT_STATUS_DETAILS } from '../types';

interface CardsGridViewProps {
  stores: AppStoreInfo[];
  onSelectStore: (store: AppStoreInfo) => void;
  onToggleCompare: (store: AppStoreInfo) => void;
  compareList: AppStoreInfo[];
}

export const CardsGridView: React.FC<CardsGridViewProps> = ({
  stores,
  onSelectStore,
  onToggleCompare,
  compareList
}) => {
  const isComparing = (id: string) => compareList.some(s => s.id === id);

  return (
    <div className="adaptive-grid-cards">
      {stores.map((store) => {
        const comparing = isComparing(store.id);
        const cat = CATEGORY_DETAILS[store.category];
        const status = PROJECT_STATUS_DETAILS[store.projectStatus];

        return (
          <div
            key={store.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-lg group relative"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 
                      onClick={() => onSelectStore(store)}
                      className="text-fluid-base font-bold text-slate-100 group-hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {store.name}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-600/40 px-1.5 py-0.5 rounded shrink-0">
                      {store.latestVersion}
                    </span>
                  </div>
                  <p className="text-fluid-xs text-slate-400 mt-1 line-clamp-2">
                    {store.tagline}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}>
                  {cat.label}
                </span>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${
                  status.isHealthy 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' 
                    : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                }`}>
                  {status.label}
                </span>

                <span className="text-[10px] font-mono font-medium text-amber-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-amber-300" /> {store.githubStars}
                </span>
              </div>

              {/* Differentiator Highlight */}
              <div className="mt-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 sm:p-3">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Diferenciador Clave
                </div>
                <p className="text-fluid-xs text-slate-300 mt-1 leading-relaxed">
                  {store.keyDifferentiator}
                </p>
              </div>

              {/* Key Scores Matrix */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 text-center">
                <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                  <div className="text-fluid-sm font-mono font-bold text-sky-400">
                    {store.easeOfUseScore.toFixed(1)}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5 truncate">
                    UX / Diseño
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                  <div className="text-fluid-sm font-mono font-bold text-emerald-400">
                    {store.securityScore.toFixed(1)}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5 truncate">
                    Seguridad
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                  <div className="text-fluid-sm font-mono font-bold text-purple-400">
                    {store.repoEcosystemScore.toFixed(1)}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5 truncate">
                    Repositorios
                  </div>
                </div>
              </div>

              {/* Technical specs snippet */}
              <div className="mt-3 text-xs space-y-1 text-slate-400 font-mono text-[11px]">
                <div className="flex justify-between gap-1">
                  <span className="truncate">RAM Reposo / Index:</span>
                  <span className="text-slate-200 shrink-0">{store.performance.ramUsageIdleMb} MB / {store.performance.ramUsageIndexingMb} MB</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="truncate">Actualización Rootless:</span>
                  <span className={`shrink-0 ${store.features.unattendedRootlessUpdates ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {store.features.unattendedRootlessUpdates ? '✅ Soportado' : '❌ Manual'}
                  </span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="truncate">Arquitectura UI:</span>
                  <span className="text-slate-300 truncate max-w-[140px] sm:max-w-[170px]">{store.techStack.uiArchitecture}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onToggleCompare(store)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-colors border whitespace-nowrap ${
                  comparing
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {comparing ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{comparing ? 'Comparando' : 'Comparar'}</span>
              </button>

              <button
                onClick={() => onSelectStore(store)}
                className="flex items-center justify-center gap-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 py-2 px-3.5 rounded-xl text-xs font-semibold transition-colors shrink-0 whitespace-nowrap"
              >
                <span>Ficha</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
