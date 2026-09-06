import React, { useState, useMemo } from 'react';
import {
  X,
  Layers,
  Search,
  ExternalLink,
  CheckCircle2,
  Filter,
  Sparkles,
  Smartphone,
  Cpu,
  Shield,
  Sliders,
  Terminal,
  Database,
  Code,
  Radio,
  History,
  BookOpen,
  GitCompare,
  LayoutGrid,
  Maximize2
} from 'lucide-react';
import { APP_SCREENS_INVENTORY, ScreenInventoryItem } from '../data/appScreensInventory';
import { StoreUiMode } from '../types';

interface ScreenInventoryNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUiMode: StoreUiMode;
  onNavigateToScreen: (actionKey: string) => void;
  onAddToast?: (toast: any) => void;
}

export const ScreenInventoryNavigatorModal: React.FC<ScreenInventoryNavigatorModalProps> = ({
  isOpen,
  onClose,
  currentUiMode,
  onNavigateToScreen,
  onAddToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { key: 'ALL', label: 'Todas las Pantallas (38)' },
    { key: 'CORE_VIEW', label: 'Vistas Principales (10)' },
    { key: 'MODAL_TOOL', label: 'Compilación & CI/CD (9)' },
    { key: 'SECURITY_DIAGNOSTICS', label: 'Seguridad & Diagnóstico (8)' },
    { key: 'RESPONSIVE_TESTING', label: 'Responsividad & Testing (8)' },
    { key: 'SETTINGS_COLLAB', label: 'Navegación & Ajustes (3)' }
  ];

  const filteredScreens = useMemo(() => {
    return APP_SCREENS_INVENTORY.filter((item) => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.routeTrigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badgeText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleTeleport = (item: ScreenInventoryItem) => {
    onNavigateToScreen(item.actionKey);
    onClose();
    if (onAddToast) {
      onAddToast({
        title: 'Navegación Interna',
        message: `Teletransportado a "${item.name}".`,
        type: 'info'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-700 text-indigo-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Inventario Completo de Pantallas & Sistema de Enlaces Internos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  38 Pantallas Mapeadas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mapa arquitectónico de todas las vistas, modales, drawers y herramientas responsivas del ecosistema.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter row */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, trigger, ruta o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
                  selectedCategory === cat.key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Screen list matrix */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredScreens.map((screen) => {
              const isCurrent = (screen.routeTrigger.includes(currentUiMode) && screen.type === 'view');

              return (
                <div
                  key={screen.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 group ${
                    isCurrent
                      ? 'bg-indigo-950/30 border-indigo-500/70 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${screen.badgeColor}`}>
                          {screen.badgeText}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          [{screen.type.toUpperCase()}]
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse">
                            ● Vista Activa
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {screen.stressTestStatus}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition">
                        {screen.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {screen.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Ruta / Trigger:</span>
                      <span className="text-slate-300 text-[10px]">{screen.routeTrigger}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Adaptación Fluida:</span>
                      <span className="text-cyan-400 text-[10px]">{screen.fluidityTarget}</span>
                    </div>
                    {screen.stats && (
                      <div className="text-[10px] text-slate-500">
                        {screen.stats}
                      </div>
                    )}

                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleTeleport(screen)}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 hover:text-white border border-indigo-700/80 font-bold transition flex items-center justify-center gap-2 text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Teletransportar / Abrir Pantalla</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredScreens.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No se encontraron pantallas coincidentes con "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Mapeo de Navegación: <strong className="text-indigo-400">38 Nodos Enlazados</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Cerrar Inventario
          </button>
        </div>

      </div>
    </div>
  );
};
