import React from 'react';
import { 
  ArrowLeftRight, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { AppStoreInfo, CATEGORY_DETAILS, INSTALL_METHOD_DETAILS, getAndroidVersionName } from '../types';

interface ComparisonViewProps {
  compareList: AppStoreInfo[];
  onRemoveFromCompare: (store: AppStoreInfo) => void;
  onClearCompare: () => void;
  onSelectStore: (store: AppStoreInfo) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onSelectStore
}) => {
  if (compareList.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ArrowLeftRight className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-100">
          No hay tiendas seleccionadas para comparar
        </h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Navega por la <strong>Matriz Técnica</strong> o las <strong>Fichas de Tiendas</strong> y pulsa el botón <strong>+ Comparar</strong> en 2 o más tiendas para ver una comparativa cara a cara de rendimiento, arquitectura y seguridad.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            Comparativa Cara a Cara ({compareList.length} tiendas)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Análisis detallado de ventajas, limitaciones, puntuaciones y stack tecnológico.
          </p>
        </div>

        <button
          onClick={onClearCompare}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpiar Lista</span>
        </button>
      </div>

      {/* Side-by-side Grid Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(compareList.length, 3)} gap-4`}>
        {compareList.map((store) => {
          const cat = CATEGORY_DETAILS[store.category];

          return (
            <div
              key={store.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{store.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded">
                        {store.latestVersion}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{store.tagline}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFromCompare(store)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Quitar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Scores Matrix */}
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg">
                    <div className="text-sm font-mono font-bold text-sky-400">{store.easeOfUseScore.toFixed(1)}</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">UX</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg">
                    <div className="text-sm font-mono font-bold text-emerald-400">{store.securityScore.toFixed(1)}</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Seguridad</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg">
                    <div className="text-sm font-mono font-bold text-purple-400">{store.repoEcosystemScore.toFixed(1)}</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Repos</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg">
                    <div className="text-sm font-mono font-bold text-amber-400">{store.performance.overallPerformanceScore.toFixed(1)}</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Perf</div>
                  </div>
                </div>

                {/* Best For & Differentiator */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Diferenciador Clave
                    </span>
                    <p className="text-xs text-slate-200 mt-0.5">{store.keyDifferentiator}</p>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                      ¿Para qué es mejor?
                    </span>
                    <p className="text-xs text-slate-200 mt-0.5">{store.bestForUseCase}</p>
                  </div>
                </div>

                {/* Benchmark Stats */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Benchmarks
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RAM Idle:</span>
                    <span className="text-emerald-400 font-bold">{store.performance.ramUsageIdleMb} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RAM Index:</span>
                    <span className="text-slate-200">{store.performance.ramUsageIndexingMb} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cold Start:</span>
                    <span className="text-slate-200">{store.performance.coldStartTimeMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sync Repos:</span>
                    <span className="text-slate-200">{store.performance.indexSyncSpeedSec} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tamaño APK:</span>
                    <span className="text-slate-200">{store.techStack.apkPayloadSizeMb} MB</span>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Stack & Arquitectura
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lenguaje:</span>
                    <span className="text-slate-200">{store.techStack.primaryLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">UI:</span>
                    <span className="text-slate-200 text-right truncate max-w-[150px]">{store.techStack.uiArchitecture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Base de Datos:</span>
                    <span className="text-slate-200">{store.techStack.database}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Android Mínimo:</span>
                    <span className="text-slate-200">{getAndroidVersionName(store.techStack.minSdk)}+</span>
                  </div>
                </div>

                {/* Pros */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Ventajas
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {store.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                    Limitaciones
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {store.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* View Full Sheet Button */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSelectStore(store)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-400 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Ver Ficha Técnica Completa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
