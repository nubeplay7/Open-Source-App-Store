import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Star, 
  ExternalLink, 
  Plus, 
  Check, 
  Info,
  Shield,
  Zap,
  Layers,
  Cpu
} from 'lucide-react';
import { AppStoreInfo, CATEGORY_DETAILS } from '../types';

interface MatrixTableViewProps {
  stores: AppStoreInfo[];
  onSelectStore: (store: AppStoreInfo) => void;
  onToggleCompare: (store: AppStoreInfo) => void;
  compareList: AppStoreInfo[];
}

export const MatrixTableView: React.FC<MatrixTableViewProps> = ({
  stores,
  onSelectStore,
  onToggleCompare,
  compareList
}) => {
  const isComparing = (id: string) => compareList.some(s => s.id === id);

  return (
    <div className="space-y-4">
      {/* Banner overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Matriz Comparativa Técnica Exhaustiva
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analiza más de 20 especificaciones técnicas: protocolos de actualización silenciosa sin root, consumo de RAM, arranque en frío y seguridad criptográfica.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Soportado</span>
          <span className="flex items-center gap-1 ml-2"><XCircle className="w-3.5 h-3.5 text-slate-600" /> No Soportado</span>
        </div>
      </div>

      {/* Responsive Horizontal Scroll Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-mono text-[11px] uppercase tracking-wider sticky top-0">
                <th className="p-3.5 font-bold min-w-[220px] sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                  Tienda / Alternativa
                </th>
                <th className="p-3 font-semibold min-w-[130px]">Categoría</th>
                <th className="p-3 font-semibold min-w-[100px] text-center">Versión</th>
                <th className="p-3 font-semibold min-w-[90px] text-center">UX (1-10)</th>
                <th className="p-3 font-semibold min-w-[110px] text-center">Seguridad (1-10)</th>
                <th className="p-3 font-semibold min-w-[90px] text-center">Repos (1-10)</th>
                <th className="p-3 font-semibold min-w-[100px] text-center">RAM Idle</th>
                <th className="p-3 font-semibold min-w-[100px] text-center">RAM Index</th>
                <th className="p-3 font-semibold min-w-[100px] text-center">Cold Start</th>
                <th className="p-3 font-semibold min-w-[100px] text-center">Sync Speed</th>
                <th className="p-3 font-semibold min-w-[120px] text-center">Sin Root (Shizuku)</th>
                <th className="p-3 font-semibold min-w-[110px] text-center">Split APKs</th>
                <th className="p-3 font-semibold min-w-[100px] text-center">Exodus Trackers</th>
                <th className="p-3 font-semibold min-w-[140px]">Arquitectura UI</th>
                <th className="p-3 font-semibold min-w-[130px]">Base de Datos</th>
                <th className="p-3 font-semibold min-w-[120px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {stores.map((store) => {
                const comparing = isComparing(store.id);
                const categoryConfig = CATEGORY_DETAILS[store.category];

                return (
                  <tr 
                    key={store.id} 
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* Store Title & Badge - Fixed Left */}
                    <td className="p-3.5 sticky left-0 bg-slate-950 group-hover:bg-slate-900 transition-colors z-10 border-r border-slate-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                            <span 
                              onClick={() => onSelectStore(store)}
                              className="cursor-pointer hover:text-emerald-400 transition-colors"
                            >
                              {store.name}
                            </span>
                            <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono font-normal flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-300" /> {store.githubStars}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {store.tagline}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${categoryConfig.badgeBg} ${categoryConfig.badgeText} ${categoryConfig.badgeBorder}`}>
                        {categoryConfig.label}
                      </span>
                    </td>

                    {/* Version */}
                    <td className="p-3 text-center whitespace-nowrap font-mono text-xs text-emerald-400">
                      {store.latestVersion}
                    </td>

                    {/* Ease of use Score */}
                    <td className="p-3 text-center">
                      <span className="font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded text-xs">
                        {store.easeOfUseScore.toFixed(1)}
                      </span>
                    </td>

                    {/* Security Score */}
                    <td className="p-3 text-center">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-xs">
                        {store.securityScore.toFixed(1)}
                      </span>
                    </td>

                    {/* Repo Ecosystem Score */}
                    <td className="p-3 text-center">
                      <span className="font-mono font-bold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded text-xs">
                        {store.repoEcosystemScore.toFixed(1)}
                      </span>
                    </td>

                    {/* RAM Idle */}
                    <td className="p-3 text-center font-mono text-slate-200">
                      {store.performance.ramUsageIdleMb} MB
                    </td>

                    {/* RAM Indexing */}
                    <td className="p-3 text-center font-mono text-slate-300">
                      {store.performance.ramUsageIndexingMb} MB
                    </td>

                    {/* Cold Start */}
                    <td className="p-3 text-center font-mono text-slate-300">
                      {store.performance.coldStartTimeMs} ms
                    </td>

                    {/* Sync Speed */}
                    <td className="p-3 text-center font-mono text-slate-300">
                      {store.performance.indexSyncSpeedSec} s
                    </td>

                    {/* Shizuku / Unattended */}
                    <td className="p-3 text-center">
                      {store.features.unattendedRootlessUpdates ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <XCircle className="w-4 h-4 text-slate-600" /> Manual
                        </span>
                      )}
                    </td>

                    {/* Split APKs */}
                    <td className="p-3 text-center">
                      {store.features.splitApkSupport ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>

                    {/* Tracker Scanning */}
                    <td className="p-3 text-center">
                      {store.features.trackerScanningExodus ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                          Exodus
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* UI Tech Stack */}
                    <td className="p-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      {store.techStack.uiArchitecture}
                    </td>

                    {/* Database */}
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {store.techStack.database}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onSelectStore(store)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-400 transition-colors"
                          title="Ver Ficha Técnica Completa"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleCompare(store)}
                          className={`p-1.5 rounded-lg transition-colors border ${
                            comparing
                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title={comparing ? 'Quitar de comparar' : 'Añadir a comparar'}
                        >
                          {comparing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
