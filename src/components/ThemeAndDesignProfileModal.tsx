import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Check, 
  Layers, 
  Maximize2, 
  Eye, 
  Sliders, 
  RefreshCw, 
  X, 
  Sun, 
  Moon, 
  Monitor, 
  Zap,
  LayoutGrid
} from 'lucide-react';
import { DesignSystemSettings, UIThemePalette, UIVisualDensity, UICornerRadius } from '../types';
import { THEME_PROFILES, DEFAULT_DESIGN_SETTINGS } from '../data/themeProfilesData';

interface ThemeAndDesignProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DesignSystemSettings;
  onUpdateSettings: (newSettings: DesignSystemSettings) => void;
  onAddToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const ThemeAndDesignProfileModal: React.FC<ThemeAndDesignProfileModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'PALETTES' | 'DENSITY_RADIUS' | 'EFFECTS'>('PALETTES');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'DARK' | 'LIGHT' | 'OLED' | 'VIBRANT' | 'RETRO'>('ALL');

  if (!isOpen) return null;

  const currentTheme = THEME_PROFILES.find((t) => t.id === settings.palette) || THEME_PROFILES[0];

  const filteredPalettes = selectedCategory === 'ALL'
    ? THEME_PROFILES
    : THEME_PROFILES.filter((t) => t.category === selectedCategory);

  const handleSelectPalette = (paletteId: UIThemePalette) => {
    const chosen = THEME_PROFILES.find((p) => p.id === paletteId);
    onUpdateSettings({ ...settings, palette: paletteId });
    if (onAddToast && chosen) {
      onAddToast('Paleta Aplicada', `Se activó la paleta "${chosen.name}" sin alterar tus datos ni módulos.`, 'success');
    }
  };

  const handleSelectDensity = (density: UIVisualDensity) => {
    onUpdateSettings({ ...settings, density });
    if (onAddToast) {
      const names: Record<UIVisualDensity, string> = {
        COMPACT: 'Compacta (Alta Densidad)',
        BALANCED: 'Equilibrada (Estándar)',
        SPACIOUS: 'Espaciosa (Táctil Amplia)'
      };
      onAddToast('Densidad de UI Actualizada', `Modo ajustado a ${names[density]}.`, 'info');
    }
  };

  const handleSelectRadius = (radius: UICornerRadius) => {
    onUpdateSettings({ ...settings, radius });
    if (onAddToast) {
      const names: Record<UICornerRadius, string> = {
        SHARP: 'Bordes Industriales (Sharp 4px)',
        BALANCED: 'Bordes Modernos (16px)',
        ROUNDED_PILL: 'Bordes Píldora (24px)',
        CUPERTINO_GLASS: 'Cupertino Glass (iOS Style 20px)'
      };
      onAddToast('Estilo de Borde Aplicado', `Curvatura configurada en ${names[radius]}.`, 'info');
    }
  };

  const handleResetDefaults = () => {
    onUpdateSettings({ ...DEFAULT_DESIGN_SETTINGS });
    if (onAddToast) {
      onAddToast('Diseño Restablecido', 'Se restablecieron los valores predeterminados de diseño de Civer App Store.', 'info');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Motor de Perfiles de Diseño & Paletas de Color</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-full">
                  8 Paletas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personaliza la apariencia cromática, curvatura y densidad sin sobrescribir ninguna función
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              title="Restablecer tema por defecto"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restablecer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('PALETTES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'PALETTES'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Paletas Cromáticas
            </button>
            <button
              onClick={() => setActiveTab('DENSITY_RADIUS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'DENSITY_RADIUS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Densidad & Curvatura
            </button>
            <button
              onClick={() => setActiveTab('EFFECTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'EFFECTS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Efectos & Renderizado
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden md:flex items-center gap-2">
            <span>Tema activo:</span>
            <span className="font-semibold text-emerald-400">{currentTheme.name}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PALETTES */}
          {activeTab === 'PALETTES' && (
            <div className="space-y-5">
              {/* System Sync Toggle Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-lg space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-100">Sincronización con el Sistema (System Sync)</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          settings.enableSystemSync
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {settings.enableSystemSync ? 'SYNC ACTIVO' : 'MANUAL'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Alterna automáticamente entre modo claro y oscuro respetando la configuración del sistema operativo.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !settings.enableSystemSync;
                      const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                      const nextPalette = nextVal ? (isSystemDark ? 'dark_titanium' : 'light_frosted') : settings.palette;
                      onUpdateSettings({ ...settings, enableSystemSync: nextVal, palette: nextPalette });
                      if (onAddToast) {
                        onAddToast(
                          nextVal ? 'Sincronización del Sistema Activada' : 'Modo Manual de Paleta',
                          nextVal 
                            ? `El tema ahora sigue tu dispositivo (${isSystemDark ? 'Oscuro' : 'Claro'}).`
                            : 'Puedes elegir cualquier paleta personalizada de la lista.',
                          nextVal ? 'success' : 'info'
                        );
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.enableSystemSync ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.enableSystemSync ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-slate-300">
                      {typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>SO Detectado: <strong className="text-slate-200">Modo Oscuro</strong></span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>SO Detectado: <strong className="text-slate-200">Modo Claro</strong></span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">matchMedia(prefers-color-scheme)</span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['ALL', 'DARK', 'LIGHT', 'OLED', 'VIBRANT', 'RETRO'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    {cat === 'ALL' && 'Todas (8)'}
                    {cat === 'DARK' && 'Oscuro Pro'}
                    {cat === 'LIGHT' && 'Claro / Escarcha'}
                    {cat === 'OLED' && 'OLED #000'}
                    {cat === 'VIBRANT' && 'Vibrante / HyperOS'}
                    {cat === 'RETRO' && 'Terminal Retro'}
                  </button>
                ))}
              </div>

              {/* Palette Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPalettes.map((p) => {
                  const isSelected = settings.palette === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPalette(p.id)}
                      className={`relative group cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                          : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70'
                      }`}
                    >
                      {/* Selection Badge */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-bold shadow-sm">
                          <Check className="w-3 h-3" />
                          ACTIVO
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        {/* Swatch Previews */}
                        <div className="flex -space-x-1.5 p-1 rounded-lg bg-slate-900/90 border border-slate-700/60 shrink-0">
                          {p.previewColors.map((c, i) => (
                            <span
                              key={i}
                              className="w-5 h-5 rounded-full border border-slate-800 shadow-inner"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-100 truncate">{p.name}</h3>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400">
                              {p.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {p.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Mini Preview Box */}
                      <div 
                        className="mt-3.5 p-2.5 rounded-lg border flex items-center justify-between text-xs"
                        style={{
                          backgroundColor: p.previewColors[1] || '#0f172a',
                          borderColor: p.previewColors[2] ? `${p.previewColors[2]}40` : '#334155'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: p.previewColors[2] || '#10b981' }}
                          />
                          <span style={{ color: p.category === 'LIGHT' ? '#0f172a' : '#f8fafc' }} className="font-medium text-[11px]">
                            Ejemplo de Tarjeta
                          </span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: p.previewColors[2] || '#10b981',
                            color: p.category === 'LIGHT' || p.id === 'amber_terminal' || p.id === 'oled_pure_black' ? '#000000' : '#ffffff'
                          }}
                        >
                          BOTÓN ACCIÓN
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DENSITY & RADIUS */}
          {activeTab === 'DENSITY_RADIUS' && (
            <div className="space-y-6">
              {/* Density Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-emerald-400" />
                    Densidad de Información & Espaciado
                  </h3>
                  <span className="text-xs text-slate-400">Ajusta el padding y la cantidad de datos visibles</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'COMPACT' as const,
                      title: 'Compacta',
                      subtitle: 'Alta Densidad',
                      desc: 'Espaciados reducidos para pantallas pequeñas o visualización de grandes matrices de datos.',
                      icon: LayoutGrid
                    },
                    {
                      id: 'BALANCED' as const,
                      title: 'Equilibrada',
                      subtitle: 'Recomendada',
                      desc: 'Espaciado estándar óptimo con lectura cómoda y diseño moderno.',
                      icon: Layers
                    },
                    {
                      id: 'SPACIOUS' as const,
                      title: 'Espaciosa',
                      subtitle: 'Touch Friendly',
                      desc: 'Áreas de toque ampliadas (48px+), ideales para tablets o navegación relajada.',
                      icon: Maximize2
                    }
                  ].map((d) => {
                    const isSelected = settings.density === d.id;
                    const Icon = d.icon;
                    return (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDensity(d.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                            <span className="text-sm font-bold text-slate-100">{d.title}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-400 mb-1">{d.subtitle}</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{d.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Corner Radius Options */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Estilo de Esquinas & Curvatura de Bordes
                  </h3>
                  <span className="text-xs text-slate-400">Configura la personalidad geométrica</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'SHARP' as const,
                      title: 'Industrial Sharp',
                      radiusClass: 'rounded-sm',
                      desc: '4px - Rectilíneo, minimalista técnico'
                    },
                    {
                      id: 'BALANCED' as const,
                      title: 'Modern Balanced',
                      radiusClass: 'rounded-xl',
                      desc: '16px - Material 3 / Web estándar'
                    },
                    {
                      id: 'ROUNDED_PILL' as const,
                      title: 'Soft Pill',
                      radiusClass: 'rounded-2xl',
                      desc: '24px - Esquinas súper redondeadas'
                    },
                    {
                      id: 'CUPERTINO_GLASS' as const,
                      title: 'Cupertino Glass',
                      radiusClass: 'rounded-2xl',
                      desc: '20px - Estilo Apple iOS con borde sutil'
                    }
                  ].map((r) => {
                    const isSelected = settings.radius === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleSelectRadius(r.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-100">{r.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className={`w-full h-8 bg-slate-900 border border-slate-700 mb-2 ${r.radiusClass} flex items-center justify-center text-[10px] text-slate-400`}>
                          Vista previa
                        </div>
                        <p className="text-[11px] text-slate-400">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EFFECTS */}
          {activeTab === 'EFFECTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Efectos Visuales & Rendimiento
                </h3>
                <p className="text-xs text-slate-400">
                  Activa o desactiva capas de composición pesadas según la potencia de tu procesador gráfico.
                </p>

                <div className="space-y-3 pt-2">
                  {/* Backdrop Blur Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-900/80">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Desenfoque de Fondo (Backdrop Blur Glassmorphism)</div>
                      <div className="text-[11px] text-slate-400">Genera efectos de vidrio translúcido en modales y barras flotantes</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableBlurEffects}
                      onChange={(e) => onUpdateSettings({ ...settings, enableBlurEffects: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                    />
                  </label>

                  {/* Glowing Halos Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-900/80">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Resplandores de Acento & Halos Neón</div>
                      <div className="text-[11px] text-slate-400">Añade sombras luminosas suaves en botones primarios y tarjetas destacadas</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableGlowEffects}
                      onChange={(e) => onUpdateSettings({ ...settings, enableGlowEffects: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                    />
                  </label>

                  {/* Smooth Transitions Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-900/80">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Transiciones de Entrada & Animaciones Fluidas</div>
                      <div className="text-[11px] text-slate-400">Animaciones de escalado suave al abrir modales y cambiar de vista</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableSmoothTransitions}
                      onChange={(e) => onUpdateSettings({ ...settings, enableSmoothTransitions: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Los cambios se guardan instantáneamente en tu sesión local.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-600/20"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
