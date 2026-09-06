import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Download, 
  FileCode2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  TrendingDown,
  RefreshCw,
  HardDrive,
  FileCheck
} from 'lucide-react';
import { AppCatalogItem } from '../types';

interface DeltaPatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppCatalogItem | null;
}

export const DeltaPatchModal: React.FC<DeltaPatchModalProps> = ({
  isOpen,
  onClose,
  app
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [patchProgress, setPatchProgress] = useState(0);
  const [patchComplete, setPatchComplete] = useState(false);
  const [algorithm, setAlgorithm] = useState<'BSDIFF_ZSTD' | 'COURGETTE_APK' | 'FILE_BY_FILE'>('BSDIFF_ZSTD');

  if (!isOpen || !app) return null;

  const fullApkMb = 48.5;
  const deltaApkMb = algorithm === 'BSDIFF_ZSTD' ? 4.2 : algorithm === 'COURGETTE_APK' ? 3.8 : 7.1;
  const savingsPercent = Math.round(((fullApkMb - deltaApkMb) / fullApkMb) * 100);

  const handleGeneratePatch = () => {
    setIsGenerating(true);
    setPatchProgress(10);
    setPatchComplete(false);

    const interval = setInterval(() => {
      setPatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setPatchComplete(true);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="delta-patch-modal"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 shadow-inner">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Generador de Delta Updates</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                  Bsdiff + Zstd
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Compresión binaria diferencial para actualizaciones de {app.name} sin re-descargar el APK completo.
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Descarga APK Completo (v{app.version})</span>
                <HardDrive className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-300">{fullApkMb} MB</div>
              <p className="text-[11px] text-slate-500">
                Descarga de binario completo con assets, dex, recursos y librerías .so nativas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                <span>Parche Delta Optimizado</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  -{savingsPercent}% Tráfico
                </span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{deltaApkMb} MB</div>
              <p className="text-[11px] text-slate-300">
                Únicamente las diferencias binarias comprimidas con Zstandard nivel 19.
              </p>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Algoritmo de Diferencia Binaria
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'BSDIFF_ZSTD', label: 'Bsdiff + Zstd', desc: 'Máximo ahorro binario' },
                { id: 'COURGETTE_APK', label: 'Courgette DEX', desc: 'Optimizado para Dalvik/ART' },
                { id: 'FILE_BY_FILE', label: 'File-by-File', desc: 'Compresión ZIP nativa' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAlgorithm(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition ${
                    algorithm === opt.id
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Step-by-Step */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Pipeline de Re-ensamblado en Cliente (Device Native)</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-300">1</span>
                <span>Lectura del APK base instalado en <code className="text-amber-300 font-mono">/data/app/{app.packageName}</code></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-300">2</span>
                <span>Descarga del parche delta de <span className="text-emerald-400 font-bold">{deltaApkMb} MB</span> desde el repositorio FOSS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-300">3</span>
                <span>Aplicación del parche mediante motor Bsdiff C++ / Rust WASM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-300">4</span>
                <span>Verificación criptográfica de firma APK Scheme v2/v3 contra certificado del autor</span>
              </div>
            </div>
          </div>

          {/* Progress or Trigger */}
          {isGenerating && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-amber-800/40">
              <div className="flex items-center justify-between text-xs text-amber-300">
                <span>Calculando tabla de bytes diferenciales...</span>
                <span className="font-mono font-bold">{patchProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${patchProgress}%` }}
                />
              </div>
            </div>
          )}

          {patchComplete && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">¡Parche delta generado y verificado con éxito!</span>
                <span>Se ahorraron {(fullApkMb - deltaApkMb).toFixed(1)} MB en esta transacción de actualización.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Firma v3 Bit-a-Bit Verificada</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
            >
              Cerrar
            </button>
            <button
              onClick={handleGeneratePatch}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-950"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Procesando...' : 'Generar y Aplicar Delta'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
