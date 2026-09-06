import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Maximize2,
  RotateCw,
  X,
  ChevronDown,
  ChevronUp,
  Move,
  Sliders,
  Sparkles,
  Play,
  Pause,
  Grid,
  Info,
  FastForward,
  Activity,
  Check,
  Zap,
  Camera,
  TrendingUp,
  Layers,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { ResponsiveLayoutState } from '../hooks/useResponsiveLayout';

export type PresetViewport = 'fluid' | 'mobile_sm' | 'mobile_lg' | 'tablet' | 'foldable' | 'laptop' | 'desktop_wide';

export interface ResponsiveViewportToolbarProps {
  layout: ResponsiveLayoutState;
  activePreset: PresetViewport;
  onSelectPreset: (preset: PresetViewport) => void;
  scaleFactor: number;
  onChangeScaleFactor: (scale: number) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  isVisible?: boolean;
  onClose?: () => void;
  onOpenLiveCustomizer?: () => void;
  onOpenResponsiveHUD?: () => void;
  // Simulation sweep mode
  simulatedWidth: number | null;
  onSetSimulatedWidth: (width: number | null) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationSpeed: number;
  onChangeSimulationSpeed: (speed: number) => void;
  // Grid debug mode
  isGridDebug: boolean;
  onToggleGridDebug: () => void;
  // Heatmap mode
  isHeatmapMode: boolean;
  onToggleHeatmapMode: () => void;
  // Stress test mode
  isStressTestActive: boolean;
  onToggleStressTest: () => void;
  stressTestLevel: 'mild' | 'heavy' | 'extreme';
  onChangeStressTestLevel: (level: 'mild' | 'heavy' | 'extreme') => void;
  // Modals
  onOpenVisualRegression?: () => void;
  onOpenFluidityScore?: () => void;
  onOpenScreenInventory?: () => void;
}

export const PRESET_DIMENSIONS: Record<PresetViewport, { label: string; width: number | '100%'; height: number | '100%'; desc: string; icon: React.ReactNode }> = {
  fluid: {
    label: 'Auto Fluido (100%)',
    width: '100%',
    height: '100%',
    desc: 'Adaptación dinámica al tamaño real de tu navegador',
    icon: <Maximize2 className="w-3.5 h-3.5" />
  },
  mobile_sm: {
    label: 'Móvil Compacto (390px)',
    width: 390,
    height: 844,
    desc: 'iPhone 15 / Galaxy S24 (1 Columna)',
    icon: <Smartphone className="w-3.5 h-3.5 text-sky-400" />
  },
  mobile_lg: {
    label: 'Móvil Max (430px)',
    width: 430,
    height: 932,
    desc: 'iPhone 15 Pro Max / Pixel 9 Pro XL',
    icon: <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
  },
  foldable: {
    label: 'Plegable (670px)',
    width: 670,
    height: 800,
    desc: 'Galaxy Z Fold en tableta compacta',
    icon: <Tablet className="w-3.5 h-3.5 text-cyan-400" />
  },
  tablet: {
    label: 'Tablet iPad (820px)',
    width: 820,
    height: 1180,
    desc: 'iPad Air / Galaxy Tab (2 Columnas)',
    icon: <Tablet className="w-3.5 h-3.5 text-amber-400" />
  },
  laptop: {
    label: 'Laptop (1280px)',
    width: 1280,
    height: 800,
    desc: 'MacBook Air / Laptop Estándar (3-4 Columnas)',
    icon: <Laptop className="w-3.5 h-3.5 text-purple-400" />
  },
  desktop_wide: {
    label: 'Ultra-Wide (1600px)',
    width: 1600,
    height: 900,
    desc: 'Monitor 4K / Bento Grid expansivo',
    icon: <Monitor className="w-3.5 h-3.5 text-emerald-400" />
  }
};

export type TailwindBreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const TAILWIND_BREAKPOINTS: {
  key: TailwindBreakpointKey;
  label: string;
  minWidth: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  desc: string;
}[] = [
  { key: 'xs', label: 'xs (<640px)', minWidth: 0, badgeBg: 'bg-rose-950/80', badgeText: 'text-rose-300', badgeBorder: 'border-rose-700/60', desc: 'Móvil vertical compacto' },
  { key: 'sm', label: 'sm (≥640px)', minWidth: 640, badgeBg: 'bg-amber-950/80', badgeText: 'text-amber-300', badgeBorder: 'border-amber-700/60', desc: 'Móvil grande / Phablet' },
  { key: 'md', label: 'md (≥768px)', minWidth: 768, badgeBg: 'bg-cyan-950/80', badgeText: 'text-cyan-300', badgeBorder: 'border-cyan-700/60', desc: 'Tablets y Plegables' },
  { key: 'lg', label: 'lg (≥1024px)', minWidth: 1024, badgeBg: 'bg-indigo-950/80', badgeText: 'text-indigo-300', badgeBorder: 'border-indigo-700/60', desc: 'Laptops y Desktops' },
  { key: 'xl', label: 'xl (≥1280px)', minWidth: 1280, badgeBg: 'bg-teal-950/80', badgeText: 'text-teal-300', badgeBorder: 'border-teal-700/60', desc: 'Pantallas Grandes' },
  { key: '2xl', label: '2xl (≥1536px)', minWidth: 1536, badgeBg: 'bg-emerald-950/80', badgeText: 'text-emerald-300', badgeBorder: 'border-emerald-700/60', desc: 'Ultra-Wide & 4K' }
];

export function getActiveTailwindBreakpoint(width: number) {
  if (width >= 1536) return TAILWIND_BREAKPOINTS[5];
  if (width >= 1280) return TAILWIND_BREAKPOINTS[4];
  if (width >= 1024) return TAILWIND_BREAKPOINTS[3];
  if (width >= 768) return TAILWIND_BREAKPOINTS[2];
  if (width >= 640) return TAILWIND_BREAKPOINTS[1];
  return TAILWIND_BREAKPOINTS[0];
}

export const ResponsiveViewportToolbar: React.FC<ResponsiveViewportToolbarProps> = ({
  layout,
  activePreset,
  onSelectPreset,
  isVisible = true,
  onClose,
  onOpenLiveCustomizer,
  onOpenResponsiveHUD,
  simulatedWidth,
  onSetSimulatedWidth,
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onChangeSimulationSpeed,
  isGridDebug,
  onToggleGridDebug,
  isHeatmapMode,
  onToggleHeatmapMode,
  isStressTestActive,
  onToggleStressTest,
  stressTestLevel,
  onChangeStressTestLevel,
  onOpenVisualRegression,
  onOpenFluidityScore,
  onOpenScreenInventory
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSimulatorTray, setShowSimulatorTray] = useState(false);
  const [showGridLegend, setShowGridLegend] = useState(false);
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dockPosition, setDockPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');

  // Effective current width (either simulated width or real window layout width)
  const currentEffectiveWidth = simulatedWidth !== null ? simulatedWidth : layout.width;
  const activeBreakpoint = getActiveTailwindBreakpoint(currentEffectiveWidth);

  if (!isVisible) {
    return null;
  }

  // Calculate position classes based on dock position
  const positionClasses = {
    'bottom-right': 'bottom-16 md:bottom-4 right-2 sm:right-4',
    'bottom-left': 'bottom-16 md:bottom-4 left-2 sm:left-4',
    'top-right': 'top-14 sm:top-16 right-2 sm:right-4',
    'top-left': 'top-14 sm:top-16 left-2 sm:left-4',
  }[dockPosition];

  // Minimized pill
  if (isMinimized) {
    return (
      <div className={`fixed ${positionClasses} z-40 flex items-center gap-1.5 animate-in fade-in zoom-in duration-150`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 border border-slate-700 shadow-2xl text-slate-200 hover:text-white hover:bg-slate-800 transition text-xs font-mono"
          title="Expandir inspector de resoluciones"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeBreakpoint.badgeBg} ${activeBreakpoint.badgeText}`}>
            {activeBreakpoint.key.toUpperCase()}
          </span>
          <span className="text-[11px] font-bold text-slate-100">{Math.round(currentEffectiveWidth)}px</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900/90 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition shadow-lg"
            title="Cerrar barra"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-40 flex flex-col items-end gap-2 max-w-[96vw]`}>
      
      {/* SIMULATOR EXTENDED TRAY (Sweep Animation & Breakpoints Ladder) */}
      {showSimulatorTray && (
        <div className="w-80 sm:w-96 max-w-[92vw] bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl space-y-3 font-mono text-xs animate-in fade-in zoom-in-95 duration-150 text-slate-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-bold text-slate-100 text-[11px] uppercase tracking-wider font-sans">
                Simulador & Suite Responsiva
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${activeBreakpoint.badgeBg} ${activeBreakpoint.badgeText} ${activeBreakpoint.badgeBorder}`}>
                Breakpoint: {activeBreakpoint.key.toUpperCase()}
              </span>
              <button
                onClick={() => setShowSimulatorTray(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sweep Animation Controls */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-sans">Animación Continua (320px → 1440px)</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleSimulation}
                  className={`px-3 py-1 rounded-lg font-sans font-bold flex items-center gap-1.5 transition ${
                    isSimulating
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isSimulating ? 'Pausar' : 'Iniciar Barrido'}</span>
                </button>
              </div>
            </div>

            {/* Speed Multipliers */}
            <div className="flex items-center justify-between gap-1 text-[10px]">
              <span className="text-slate-500 flex items-center gap-1">
                <FastForward className="w-3 h-3 text-slate-400" /> Velocidad:
              </span>
              <div className="flex items-center gap-1">
                {[0.5, 1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onChangeSimulationSpeed(spd)}
                    className={`px-2 py-0.5 rounded transition ${
                      simulationSpeed === spd
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Scrub Range Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>320px (Móvil)</span>
                <span className="font-bold text-sky-400 text-xs">{Math.round(currentEffectiveWidth)} px</span>
                <span>1440px (Desktop)</span>
              </div>
              <input
                type="range"
                min="320"
                max="1440"
                step="2"
                value={Math.round(currentEffectiveWidth)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onSetSimulatedWidth(val);
                }}
                className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Quick Diagnostics & Suite Launchers */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-sans">
            {onOpenVisualRegression && (
              <button
                onClick={onOpenVisualRegression}
                className="p-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-800/80 flex items-center gap-1.5 transition font-semibold"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ráfaga Regresión</span>
              </button>
            )}
            {onOpenFluidityScore && (
              <button
                onClick={onOpenFluidityScore}
                className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80 flex items-center gap-1.5 transition font-semibold"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auditoría Fluidez</span>
              </button>
            )}
            <button
              onClick={onToggleHeatmapMode}
              className={`p-2 rounded-xl border flex items-center gap-1.5 transition font-semibold ${
                isHeatmapMode
                  ? 'bg-indigo-900 text-white border-indigo-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Heatmap: {isHeatmapMode ? 'ON' : 'OFF'}</span>
            </button>
            {onOpenScreenInventory && (
              <button
                onClick={onOpenScreenInventory}
                className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/80 flex items-center gap-1.5 transition font-semibold"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Mapa 38 Pantallas</span>
              </button>
            )}
          </div>

          {/* Stress Test In-Tray Controls */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-rose-300 font-sans font-bold">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Stress Test (Strings Largos)</span>
              </div>
              <button
                onClick={onToggleStressTest}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  isStressTestActive
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isStressTestActive ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            {isStressTestActive && (
              <div className="flex items-center justify-between gap-1 text-[9px]">
                <span className="text-slate-500">Intensidad:</span>
                <div className="flex items-center gap-1">
                  {(['mild', 'heavy', 'extreme'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => onChangeStressTestLevel(lvl)}
                      className={`px-2 py-0.5 rounded uppercase font-bold transition ${
                        stressTestLevel === lvl
                          ? 'bg-rose-950 text-rose-200 border border-rose-600'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl === 'mild' ? 'Suave' : lvl === 'heavy' ? 'Pesado' : 'Extremo'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tailwind Breakpoint Ladder Quick-Jump Buttons */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tailwind Breakpoints Activos</span>
              <span className="text-[9px] text-slate-500">Haz clic para saltar</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {TAILWIND_BREAKPOINTS.map((bp) => {
                const isActive = activeBreakpoint.key === bp.key;
                const isPassed = currentEffectiveWidth >= bp.minWidth;
                return (
                  <button
                    key={bp.key}
                    onClick={() => {
                      const targetWidth = bp.key === 'xs' ? 390 : bp.key === 'sm' ? 640 : bp.key === 'md' ? 768 : bp.key === 'lg' ? 1024 : bp.key === 'xl' ? 1280 : 1536;
                      onSetSimulatedWidth(targetWidth);
                    }}
                    className={`py-1.5 px-1 rounded-lg flex flex-col items-center justify-center transition border text-[10px] font-bold ${
                      isActive
                        ? `${bp.badgeBg} ${bp.badgeText} ${bp.badgeBorder} ring-1 ring-white/20 shadow-md`
                        : isPassed
                        ? 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/60 text-slate-600 border-slate-900 hover:border-slate-800'
                    }`}
                    title={`${bp.label} • ${bp.desc}`}
                  >
                    <span>{bp.key}</span>
                    <span className="text-[8px] font-normal opacity-70">{bp.minWidth}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Fluid button */}
          {simulatedWidth !== null && (
            <button
              onClick={() => {
                onSetSimulatedWidth(null);
                onSelectPreset('fluid');
              }}
              className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition flex items-center justify-center gap-1.5 text-[11px]"
            >
              <RotateCw className="w-3.5 h-3.5 text-rose-400" />
              <span>Restablecer a Modo Fluido 100% (Ancho Real)</span>
            </button>
          )}
        </div>
      )}

      {/* GRID DEBUG COLOR LEGEND OVERLAY */}
      {showGridLegend && (
        <div className="w-72 bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl space-y-2 font-mono text-[10px] animate-in fade-in zoom-in-95 duration-150 text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider font-sans">
              <Grid className="w-3.5 h-3.5 text-cyan-400" /> Leyenda Modo Depuración
            </span>
            <button
              onClick={() => setShowGridLegend(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1.5 p-1 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
              <span className="truncate">Contenedores</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-cyan-950/40 border border-cyan-800/60 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
              <span className="truncate">Grids & Flex</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" />
              <span className="truncate">Tarjetas / Cards</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-purple-950/40 border border-purple-800/60 text-purple-300">
              <span className="w-2.5 h-2.5 rounded bg-purple-400" />
              <span className="truncate">Headers / Navs</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300">
              <span className="w-2.5 h-2.5 rounded bg-rose-400" />
              <span className="truncate">Botones & Acciones</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-sky-950/40 border border-sky-800/60 text-sky-300">
              <span className="w-2.5 h-2.5 rounded bg-sky-400" />
              <span className="truncate">Sidebars</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FLOATING TOOLBAR PILL */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-full px-2 sm:px-2.5 py-1 sm:py-1.5 shadow-2xl text-xs font-mono select-none">
        
        {/* Position mover button */}
        <button
          onClick={() => {
            const positions: Array<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'> = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
            const nextIndex = (positions.indexOf(dockPosition) + 1) % positions.length;
            setDockPosition(positions[nextIndex]);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition shrink-0"
          title="Cambiar posición en pantalla (Esquina siguiente)"
        >
          <Move className="w-3 h-3" />
        </button>

        {/* Real-Time Tailwind Breakpoint & Width Badge */}
        <button
          onClick={() => setShowSimulatorTray(!showSimulatorTray)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition cursor-pointer ${
            activeBreakpoint.badgeBg
          } ${activeBreakpoint.badgeBorder}`}
          title="Ver detalle de Breakpoint y abrir simulador de barrido"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className={`font-bold text-[10px] sm:text-[11px] ${activeBreakpoint.badgeText}`}>
            {activeBreakpoint.key.toUpperCase()}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-[10px] sm:text-[11px] text-slate-200 font-bold">
            {Math.round(currentEffectiveWidth)}px
          </span>
        </button>

        {/* Sweep Simulator Trigger Button */}
        <button
          onClick={() => setShowSimulatorTray(!showSimulatorTray)}
          className={`px-2 py-1 rounded-lg font-sans font-semibold text-[10px] sm:text-[11px] flex items-center gap-1 transition border min-h-[28px] ${
            isSimulating || showSimulatorTray
              ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
          }`}
          title="Simulador de barrido responsivo (320px - 1440px)"
        >
          {isSimulating ? <Pause className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 text-sky-400" />}
          <span className="hidden xs:inline">Barrido</span>
        </button>

        {/* Stress Test Button */}
        <button
          onClick={onToggleStressTest}
          className={`px-2 py-1 rounded-lg font-sans font-semibold text-[10px] sm:text-[11px] flex items-center gap-1 transition border min-h-[28px] ${
            isStressTestActive
              ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-950/40 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
          }`}
          title={isStressTestActive ? "Stress Test ACTIVO: Inyectando textos ultra largos y anidamientos" : "Activar Stress Test de Layout (Strings gigantes sin espacio)"}
        >
          <Zap className={`w-3 h-3 ${isStressTestActive ? 'text-white' : 'text-rose-400'}`} />
          <span className="hidden sm:inline">Stress</span>
        </button>

        {/* Heatmap Mode Toggle Button */}
        <button
          onClick={onToggleHeatmapMode}
          className={`px-2 py-1 rounded-lg font-sans font-semibold text-[10px] sm:text-[11px] flex items-center gap-1 transition border min-h-[28px] ${
            isHeatmapMode
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-950/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
          }`}
          title={isHeatmapMode ? "Modo Breakpoint Heatmap: ACTIVO (Colorea interfaz según breakpoint)" : "Activar Modo Heatmap de Breakpoints"}
        >
          <Activity className={`w-3 h-3 ${isHeatmapMode ? 'text-white' : 'text-indigo-400'}`} />
          <span className="hidden sm:inline">Heatmap</span>
        </button>

        {/* Grid Debug Mode Toggle Button */}
        <button
          onClick={onToggleGridDebug}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowGridLegend(!showGridLegend);
          }}
          className={`px-2 py-1 rounded-lg font-sans font-semibold text-[10px] sm:text-[11px] flex items-center gap-1 transition border min-h-[28px] ${
            isGridDebug
              ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-950/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
          }`}
          title={isGridDebug ? "Modo Debug de Grilla: ACTIVO (Click derecho para ver leyenda)" : "Activar Modo Debug de Grilla (Resalta componentes con colores)"}
        >
          <Grid className={`w-3 h-3 ${isGridDebug ? 'text-white' : 'text-amber-400'}`} />
          <span className="hidden xs:inline">Grilla</span>
          {isGridDebug && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </button>

        {/* Visual Regression Capture Button */}
        {onOpenVisualRegression && (
          <button
            onClick={onOpenVisualRegression}
            className="p-1 sm:p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 transition flex items-center gap-1"
            title="Abrir Capturador de Regresión Visual (320px, 640px, 1024px, 1440px)"
          >
            <Camera className="w-3 h-3 text-cyan-400" />
            <span className="hidden lg:inline text-[10px] font-sans font-bold">Regresión</span>
          </button>
        )}

        {/* Fluidity Score Audit Button */}
        {onOpenFluidityScore && (
          <button
            onClick={onOpenFluidityScore}
            className="p-1 sm:p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 transition flex items-center gap-1"
            title="Abrir Calculador de Puntuación de Fluidez & Auditoría Clamp()"
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="hidden lg:inline text-[10px] font-sans font-bold">Fluidez 98%</span>
          </button>
        )}

        {/* Screen Inventory Matrix Button */}
        {onOpenScreenInventory && (
          <button
            onClick={onOpenScreenInventory}
            className="p-1 sm:p-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/80 transition flex items-center gap-1"
            title="Ver Inventario Completo de Pantallas & Enlaces Internos (38 Módulos)"
          >
            <Layers className="w-3 h-3 text-purple-400" />
            <span className="hidden md:inline text-[10px] font-sans font-bold">Pantallas (38)</span>
          </button>
        )}

        {/* Preset selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700/60 min-h-[28px]"
            title="Seleccionar preset de dispositivo"
          >
            {PRESET_DIMENSIONS[activePreset].icon}
            <span className="hidden sm:inline text-[10px] sm:text-[11px] font-sans font-medium">
              {PRESET_DIMENSIONS[activePreset].label.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute bottom-full right-0 mb-2 w-64 max-w-[85vw] bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                <span>Presets de Dispositivos</span>
                <button 
                  onClick={() => setShowDropdown(false)}
                  className="text-slate-400 hover:text-white p-0.5 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {(Object.keys(PRESET_DIMENSIONS) as PresetViewport[]).map((key) => {
                const preset = PRESET_DIMENSIONS[key];
                const isSelected = activePreset === key && simulatedWidth === null;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSelectPreset(key);
                      if (preset.width === '100%') {
                        onSetSimulatedWidth(null);
                      } else {
                        onSetSimulatedWidth(preset.width as number);
                      }
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-950/80 border border-indigo-500 text-white'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="p-1 rounded bg-slate-800 shrink-0">{preset.icon}</div>
                    <div className="flex-1 truncate">
                      <div className="font-sans font-bold text-[11px] truncate">{preset.label}</div>
                      <div className="text-[9px] text-slate-400 font-mono truncate">{preset.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Fluid Reset */}
        {(activePreset !== 'fluid' || simulatedWidth !== null) && (
          <button
            onClick={() => {
              onSetSimulatedWidth(null);
              onSelectPreset('fluid');
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900 transition shrink-0"
            title="Volver a Modo Fluido 100%"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        )}

        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition shrink-0"
          title="Minimizar a botón flotante pequeño"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Full Close / Dismiss Button (X) */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900 text-slate-400 hover:text-white border border-slate-700/60 transition min-w-[24px] min-h-[24px] flex items-center justify-center shrink-0"
            title="Cerrar y ocultar barra de resolución"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
