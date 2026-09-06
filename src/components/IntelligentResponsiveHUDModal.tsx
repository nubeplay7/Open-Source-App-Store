import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Maximize2,
  Minimize2,
  RotateCw,
  Sparkles,
  Zap,
  Activity,
  Compass,
  Cpu,
  Fingerprint,
  Layers,
  Scale,
  Sliders,
  Check,
  Eye,
  SlidersHorizontal,
  ShieldCheck,
  Tv
} from 'lucide-react';
import { ResponsiveLayoutState } from '../hooks/useResponsiveLayout';

interface IntelligentResponsiveHUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: ResponsiveLayoutState;
  onSelectPreset?: (preset: any) => void;
  onAddToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const IntelligentResponsiveHUDModal: React.FC<IntelligentResponsiveHUDModalProps> = ({
  isOpen,
  onClose,
  layout,
  onSelectPreset,
  onAddToast
}) => {
  const [autoAdaptiveMode, setAutoAdaptiveMode] = useState(true);

  if (!isOpen) return null;

  const handleCalibrate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'));
    }
    if (onAddToast) {
      onAddToast(
        'Calibración Completada',
        `Pantalla detectada: ${layout.width}x${layout.height}px (${layout.deviceLabel}). Sistema auto-adaptado con éxito.`,
        'success'
      );
    }
  };

  const getDeviceIcon = () => {
    if (layout.isMobile) return <Smartphone className="w-6 h-6 text-sky-400" />;
    if (layout.isTablet) return <Tablet className="w-6 h-6 text-amber-400" />;
    if (layout.isLaptop) return <Laptop className="w-6 h-6 text-purple-400" />;
    if (layout.isUltraWide) return <Tv className="w-6 h-6 text-emerald-400" />;
    return <Monitor className="w-6 h-6 text-indigo-400" />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="intelligent-responsive-hud-modal"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-4 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100">Motor de Responsividad Inteligente</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-Detect Activo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diagnóstico de hardware y adaptación fluida para cualquier dispositivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCalibrate}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              title="Recalibrar medidas de pantalla"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recalibrar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Cerrar diagnóstico"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Main Hero Card: Live Device Identification */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-emerald-900/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-emerald-400" />
            </div>

            <div className="flex items-start justify-between gap-4 relative z-10 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 shadow-inner">
                  {getDeviceIcon()}
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Dispositivo Identificado
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {layout.deviceLabel}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span className="font-mono text-emerald-300 font-semibold">{layout.width} × {layout.height} px</span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">DPR: {layout.dpr}x</span>
                    <span>•</span>
                    <span className="capitalize">{layout.orientation}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-emerald-400 text-center">
                  Escala Fluida: {Math.round(layout.fluidScale * 100)}%
                </span>
                <span className="text-[11px] text-slate-400 sm:text-right">
                  {layout.columnCount} {layout.columnCount === 1 ? 'Columna Óptima' : 'Columnas Óptimas'}
                </span>
              </div>
            </div>
          </div>

          {/* 4-Metric Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Resolution */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Viewport CSS</div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {layout.width} × {layout.height}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Relación: {layout.aspectRatio}:1</div>
            </div>

            {/* Pointer / Touch */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Interacción</div>
              <div className="text-sm font-bold text-sky-400 font-mono mt-1 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>{layout.isTouch ? 'Táctil / Touch' : 'Mouse / Puntero'}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {layout.isTouchOnly ? 'Exclusivo Touch' : 'Hover Habilitado'}
              </div>
            </div>

            {/* Grid Columns */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Distribución</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{layout.columnCount} {layout.columnCount === 1 ? 'Columna' : 'Columnas'}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Gap: {layout.gridGapPx}px</div>
            </div>

            {/* Safe Area Notch */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Notch / Safe Area</div>
              <div className="text-sm font-bold text-purple-400 font-mono mt-1">
                {layout.hasNotch ? `T:${layout.safeArea.top}px B:${layout.safeArea.bottom}px` : 'Estándar 0px'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Protección de bordes</div>
            </div>
          </div>

          {/* Intelligent Capabilities List */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Sistemas de Auto-Adaptación Activos en Tiempo Real
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Escalado Proporcional de Fuentes (Fluid Clamps)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Los textos se redimensionan usando la fórmula CSS clamp matemática, evitando saltos bruscos o quiebres.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Blindaje Anti-Overflow Horizontal</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Bloqueo de desplazamientos laterales no deseados y desbordes en teléfonos estrechos.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Adaptación Táctil Móvil (Mobile-First)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Botones y zonas de toque con altura mínima ergonómica (44px+) y dock de navegación inferior.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Ajuste Dinámico de Imágenes y Banners</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Proporción de aspecto protegida para evitar estiramientos o imágenes pixeladas.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>El sistema opera en modo 100% automático y reactivo a cualquier cambio de orientación o tamaño.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Entendido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
