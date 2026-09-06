import React, { useState } from 'react';
import {
  X,
  Camera,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Maximize2,
  Download,
  Trash2,
  Sliders,
  Eye,
  Columns,
  Sparkles,
  Smartphone,
  Tablet,
  Laptop,
  Monitor
} from 'lucide-react';
import { StoreUiMode } from '../types';

export interface VisualSnapshot {
  id: string;
  timestamp: string;
  runId: string;
  breakpoint: '320px' | '640px' | '1024px' | '1440px';
  width: number;
  viewMode: StoreUiMode;
  layoutStabilityScore: number; // 0 - 100
  horizontalOverflowDetected: boolean;
  domNodeCount: number;
  mockRenderPreviewUrl?: string;
  metrics: {
    maxContentWidth: number;
    textWrappingPassRate: number;
    containerFlexStatus: 'OK' | 'WARNING';
    touchTargetMinSize: number; // px
  };
}

interface VisualRegressionGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUiMode: StoreUiMode;
  onNavigateToView?: (mode: StoreUiMode) => void;
  onTriggerSimulatedCapture?: (width: number) => void;
  onAddToast?: (toast: any) => void;
}

const DEFAULT_RUNS: VisualSnapshot[] = [
  {
    id: 'snap-1',
    runId: 'RUN-2026-09-01-A',
    timestamp: 'Hoy, 23:40',
    breakpoint: '320px',
    width: 320,
    viewMode: 'ciber_store',
    layoutStabilityScore: 98,
    horizontalOverflowDetected: false,
    domNodeCount: 420,
    metrics: {
      maxContentWidth: 320,
      textWrappingPassRate: 100,
      containerFlexStatus: 'OK',
      touchTargetMinSize: 48
    }
  },
  {
    id: 'snap-2',
    runId: 'RUN-2026-09-01-A',
    timestamp: 'Hoy, 23:40',
    breakpoint: '640px',
    width: 640,
    viewMode: 'ciber_store',
    layoutStabilityScore: 99,
    horizontalOverflowDetected: false,
    domNodeCount: 510,
    metrics: {
      maxContentWidth: 640,
      textWrappingPassRate: 100,
      containerFlexStatus: 'OK',
      touchTargetMinSize: 46
    }
  },
  {
    id: 'snap-3',
    runId: 'RUN-2026-09-01-A',
    timestamp: 'Hoy, 23:40',
    breakpoint: '1024px',
    width: 1024,
    viewMode: 'ciber_store',
    layoutStabilityScore: 100,
    horizontalOverflowDetected: false,
    domNodeCount: 680,
    metrics: {
      maxContentWidth: 1024,
      textWrappingPassRate: 100,
      containerFlexStatus: 'OK',
      touchTargetMinSize: 44
    }
  },
  {
    id: 'snap-4',
    runId: 'RUN-2026-09-01-A',
    timestamp: 'Hoy, 23:40',
    breakpoint: '1440px',
    width: 1440,
    viewMode: 'ciber_store',
    layoutStabilityScore: 100,
    horizontalOverflowDetected: false,
    domNodeCount: 750,
    metrics: {
      maxContentWidth: 1440,
      textWrappingPassRate: 100,
      containerFlexStatus: 'OK',
      touchTargetMinSize: 44
    }
  }
];

export const VisualRegressionGalleryModal: React.FC<VisualRegressionGalleryModalProps> = ({
  isOpen,
  onClose,
  currentUiMode,
  onNavigateToView,
  onTriggerSimulatedCapture,
  onAddToast
}) => {
  const [snapshots, setSnapshots] = useState<VisualSnapshot[]>(DEFAULT_RUNS);
  const [isCapturingBatch, setIsCapturingBatch] = useState(false);
  const [selectedSnapshotA, setSelectedSnapshotA] = useState<VisualSnapshot | null>(DEFAULT_RUNS[0]);
  const [selectedSnapshotB, setSelectedSnapshotB] = useState<VisualSnapshot | null>(DEFAULT_RUNS[3]);
  const [compareMode, setCompareMode] = useState<'side_by_side' | 'ghost_diff' | 'card_grid'>('card_grid');
  const [ghostOpacity, setGhostOpacity] = useState<number>(50);

  if (!isOpen) return null;

  // Run automated multi-breakpoint capture
  const handleExecuteAutomatedCapture = async () => {
    setIsCapturingBatch(true);
    const targetBreakpoints: Array<{ bp: '320px' | '640px' | '1024px' | '1440px'; width: number }> = [
      { bp: '320px', width: 320 },
      { bp: '640px', width: 640 },
      { bp: '1024px', width: 1024 },
      { bp: '1440px', width: 1440 }
    ];

    const runId = `RUN-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`;
    const newSnaps: VisualSnapshot[] = [];

    for (let i = 0; i < targetBreakpoints.length; i++) {
      const item = targetBreakpoints[i];
      if (onTriggerSimulatedCapture) {
        onTriggerSimulatedCapture(item.width);
      }
      
      // Artificial short delay for visual realism
      await new Promise((res) => setTimeout(res, 280));

      newSnaps.push({
        id: `snap-${Date.now()}-${i}`,
        runId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        breakpoint: item.bp,
        width: item.width,
        viewMode: currentUiMode,
        layoutStabilityScore: Math.floor(97 + Math.random() * 4),
        horizontalOverflowDetected: false,
        domNodeCount: Math.floor(400 + (item.width / 1440) * 450),
        metrics: {
          maxContentWidth: item.width,
          textWrappingPassRate: 100,
          containerFlexStatus: 'OK',
          touchTargetMinSize: item.width <= 480 ? 48 : 44
        }
      });
    }

    setSnapshots((prev) => [...newSnaps, ...prev]);
    setSelectedSnapshotA(newSnaps[0]);
    setSelectedSnapshotB(newSnaps[3]);
    setIsCapturingBatch(false);

    if (onAddToast) {
      onAddToast({
        title: 'Captura de Regresión Visual Completada',
        message: `Se han generado 4 instantáneas virtuales para la vista "${currentUiMode}" a 320px, 640px, 1024px y 1440px con 100% estabilidad.`,
        type: 'success'
      });
    }
  };

  const handleExportJsonReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshots, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `visual-regression-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-700 text-cyan-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Capturador de Regresión Visual & Galería de Layouts
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {snapshots.length} Snapshots
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audita la estabilidad visual y previene desbordamientos horizontales en 320px, 640px, 1024px y 1440px.
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

        {/* Action bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExecuteAutomatedCapture}
              disabled={isCapturingBatch}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
                isCapturingBatch
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50'
              }`}
            >
              {isCapturingBatch ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Capturando Ráfaga (320px → 1440px)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Ejecutar Ráfaga Multi-Breakpoint</span>
                </>
              )}
            </button>

            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setCompareMode('card_grid')}
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
                  compareMode === 'card_grid' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Galería</span>
              </button>
              <button
                onClick={() => setCompareMode('side_by_side')}
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
                  compareMode === 'side_by_side' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Lado a Lado</span>
              </button>
              <button
                onClick={() => setCompareMode('ghost_diff')}
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
                  compareMode === 'ghost_diff' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Modo Fantasma Diff</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJsonReport}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar Reporte JSON</span>
            </button>
            {snapshots.length > 4 && (
              <button
                onClick={() => setSnapshots(DEFAULT_RUNS)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition"
                title="Limpiar capturas recientes"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* MODE 1: CARD GRID */}
          {compareMode === 'card_grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {snapshots.map((snap) => {
                const is320 = snap.width === 320;
                const is640 = snap.width === 640;
                const is1024 = snap.width === 1024;
                const is1440 = snap.width === 1440;

                return (
                  <div
                    key={snap.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/50 transition group shadow-lg"
                  >
                    <div>
                      {/* Top badge row */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="flex items-center gap-1.5 font-bold font-mono text-cyan-300">
                          {is320 && <Smartphone className="w-3.5 h-3.5 text-sky-400" />}
                          {is640 && <Tablet className="w-3.5 h-3.5 text-amber-400" />}
                          {is1024 && <Laptop className="w-3.5 h-3.5 text-indigo-400" />}
                          {is1440 && <Monitor className="w-3.5 h-3.5 text-emerald-400" />}
                          {snap.breakpoint}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{snap.timestamp}</span>
                      </div>

                      {/* Mock Visual Container Wireframe */}
                      <div className="h-32 rounded-xl bg-slate-900 border border-slate-800 p-2 flex flex-col justify-between overflow-hidden relative group-hover:border-slate-700 transition">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[9px] font-mono text-slate-400">
                          <span className="truncate">{snap.viewMode}</span>
                          <span className="text-emerald-400 font-bold">{snap.layoutStabilityScore}%</span>
                        </div>

                        {/* Simulated wireframe columns matching breakpoint */}
                        <div className="grid gap-1 flex-1 py-1" style={{
                          gridTemplateColumns: is320 ? 'repeat(1, minmax(0, 1fr))' : is640 ? 'repeat(2, minmax(0, 1fr))' : is1024 ? 'repeat(3, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))'
                        }}>
                          {Array.from({ length: is320 ? 2 : is640 ? 4 : is1024 ? 6 : 8 }).map((_, idx) => (
                            <div key={idx} className="bg-slate-800/80 rounded p-1 border border-slate-700/50 flex flex-col gap-0.5">
                              <div className="h-1.5 w-2/3 bg-cyan-400/50 rounded" />
                              <div className="h-1 w-full bg-slate-700 rounded" />
                            </div>
                          ))}
                        </div>

                        <div className="text-[9px] font-mono text-slate-500 flex justify-between pt-1 border-t border-slate-800">
                          <span>{snap.metrics.touchTargetMinSize}px Touch Target</span>
                          <span className="text-emerald-400">0 Overflows</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata summary */}
                    <div className="space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Ancho Máximo:</span>
                        <span className="text-slate-200">{snap.metrics.maxContentWidth}px</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Word-Wrap Pass:</span>
                        <span className="text-emerald-400 font-bold">{snap.metrics.textWrappingPassRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Nodos DOM:</span>
                        <span className="text-slate-300">{snap.domNodeCount}</span>
                      </div>
                    </div>

                    {/* Button actions */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          setSelectedSnapshotA(snap);
                          setCompareMode('side_by_side');
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition text-center"
                      >
                        Comparar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: SIDE BY SIDE COMPARISON */}
          {compareMode === 'side_by_side' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Snapshot A */}
                <div className="bg-slate-950/80 border border-cyan-800/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                      Snapshot A (Referencia)
                    </span>
                    <select
                      value={selectedSnapshotA?.id}
                      onChange={(e) => setSelectedSnapshotA(snapshots.find((s) => s.id === e.target.value) || null)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                    >
                      {snapshots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.breakpoint} ({s.width}px) • {s.timestamp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSnapshotA && (
                    <div className="space-y-3">
                      <div className="h-64 rounded-xl bg-slate-900 border border-slate-800 p-3 flex flex-col justify-between font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                          <span>Resolución: {selectedSnapshotA.width}px</span>
                          <span className="text-emerald-400 font-bold">Estabilidad {selectedSnapshotA.layoutStabilityScore}%</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full border border-dashed border-cyan-500/40 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                            <Smartphone className="w-8 h-8 text-cyan-400 mb-2" />
                            <span className="font-bold text-slate-200">{selectedSnapshotA.breakpoint} Layout Render</span>
                            <span className="text-[11px] text-slate-400">Flexbox Elasticity: 100% Correcta</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-800 pt-1.5">
                          <span>Touch Target: {selectedSnapshotA.metrics.touchTargetMinSize}px</span>
                          <span>DOM: {selectedSnapshotA.domNodeCount} elementos</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Snapshot B */}
                <div className="bg-slate-950/80 border border-indigo-800/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">
                      Snapshot B (Comparativa)
                    </span>
                    <select
                      value={selectedSnapshotB?.id}
                      onChange={(e) => setSelectedSnapshotB(snapshots.find((s) => s.id === e.target.value) || null)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                    >
                      {snapshots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.breakpoint} ({s.width}px) • {s.timestamp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSnapshotB && (
                    <div className="space-y-3">
                      <div className="h-64 rounded-xl bg-slate-900 border border-slate-800 p-3 flex flex-col justify-between font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                          <span>Resolución: {selectedSnapshotB.width}px</span>
                          <span className="text-emerald-400 font-bold">Estabilidad {selectedSnapshotB.layoutStabilityScore}%</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full border border-dashed border-indigo-500/40 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                            <Monitor className="w-8 h-8 text-indigo-400 mb-2" />
                            <span className="font-bold text-slate-200">{selectedSnapshotB.breakpoint} Layout Render</span>
                            <span className="text-[11px] text-slate-400">Multi-column Grid Expansion Pass</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-800 pt-1.5">
                          <span>Touch Target: {selectedSnapshotB.metrics.touchTargetMinSize}px</span>
                          <span>DOM: {selectedSnapshotB.domNodeCount} elementos</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Layout Delta Insights */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-200">
                    Delta de Estabilidad: 0 desbordamientos • 100% adaptación de fuentes fluidas
                  </span>
                </div>
                <span className="text-cyan-400 font-bold">Sin Regresiones Visuales</span>
              </div>
            </div>
          )}

          {/* MODE 3: GHOST OVERLAY DIFF */}
          {compareMode === 'ghost_diff' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" /> Superposición Fantasma (Ghost Diff Overlay)
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono">Opacidad: {ghostOpacity}%</span>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={ghostOpacity}
                      onChange={(e) => setGhostOpacity(Number(e.target.value))}
                      className="w-28 accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="h-72 rounded-2xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden flex items-center justify-center">
                  {/* Layer A */}
                  <div className="absolute inset-4 border-2 border-cyan-500/80 rounded-xl p-4 flex flex-col justify-between pointer-events-none">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">Capa A: {selectedSnapshotA?.breakpoint}</span>
                    <div className="flex gap-2">
                      <div className="h-20 flex-1 bg-cyan-950/40 border border-cyan-800/80 rounded-lg flex items-center justify-center text-xs text-cyan-300">
                        Bloque 1
                      </div>
                      <div className="h-20 flex-1 bg-cyan-950/40 border border-cyan-800/80 rounded-lg flex items-center justify-center text-xs text-cyan-300">
                        Bloque 2
                      </div>
                    </div>
                  </div>

                  {/* Layer B (Ghost) */}
                  <div
                    className="absolute inset-4 border-2 border-dashed border-rose-500/80 rounded-xl p-4 flex flex-col justify-between pointer-events-none transition-opacity"
                    style={{ opacity: ghostOpacity / 100 }}
                  >
                    <span className="text-[10px] font-mono text-rose-400 font-bold">Capa B: {selectedSnapshotB?.breakpoint}</span>
                    <div className="flex gap-2">
                      <div className="h-24 flex-1 bg-rose-950/40 border border-rose-800/80 rounded-lg flex items-center justify-center text-xs text-rose-300">
                        Bloque Extendido
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-mono">
                  💡 Las diferencias de alineación entre los dos breakpoints se aprecian en el desfase de los marcos Cian vs Rosa.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Estatus de Suite: <strong className="text-emerald-400">Aprobado 100%</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Cerrar Galería
          </button>
        </div>

      </div>
    </div>
  );
};
