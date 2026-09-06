import React, { useState } from 'react';
import { 
  Gauge, 
  Activity, 
  Zap, 
  Cpu, 
  Timer, 
  HardDrive, 
  Scale,
  Sparkles
} from 'lucide-react';
import { AppStoreInfo } from '../types';

interface PerformanceBenchmarkViewProps {
  stores: AppStoreInfo[];
  onSelectStore: (store: AppStoreInfo) => void;
}

export const PerformanceBenchmarkView: React.FC<PerformanceBenchmarkViewProps> = ({
  stores,
  onSelectStore
}) => {
  const [metricMode, setMetricMode] = useState<'ramIdle' | 'ramIndex' | 'coldStart' | 'syncSpeed' | 'apkSize'>('ramIdle');

  const getMetricData = (store: AppStoreInfo) => {
    switch (metricMode) {
      case 'ramIdle':
        return {
          value: store.performance.ramUsageIdleMb,
          unit: 'MB',
          label: 'RAM en Reposo',
          max: 80,
          inverse: true // Lower is better
        };
      case 'ramIndex':
        return {
          value: store.performance.ramUsageIndexingMb,
          unit: 'MB',
          label: 'RAM durante Indexación',
          max: 200,
          inverse: true
        };
      case 'coldStart':
        return {
          value: store.performance.coldStartTimeMs,
          unit: 'ms',
          label: 'Arranque en Frío (Cold Start)',
          max: 900,
          inverse: true
        };
      case 'syncSpeed':
        return {
          value: store.performance.indexSyncSpeedSec,
          unit: 'seg',
          label: 'Tiempo de Sincronización de Repositorio',
          max: 7.0,
          inverse: true
        };
      case 'apkSize':
        return {
          value: store.techStack.apkPayloadSizeMb,
          unit: 'MB',
          label: 'Tamaño del APK Instalador',
          max: 25.0,
          inverse: true
        };
    }
  };

  const sortedStores = [...stores].sort((a, b) => {
    const dataA = getMetricData(a).value;
    const dataB = getMetricData(b).value;
    return (dataA as number) - (dataB as number);
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Benchmarks & Métricas de Rendimiento Real
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Mediciones en dispositivos físicos Android 13/14 (Snapdragon 8 Gen 2 / 8GB RAM). Menores valores representan mayor eficiencia en memoria y CPU.
            </p>
          </div>

          {/* Metric selector buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setMetricMode('ramIdle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                metricMode === 'ramIdle'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              RAM Reposo
            </button>
            <button
              onClick={() => setMetricMode('ramIndex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                metricMode === 'ramIndex'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              RAM Index
            </button>
            <button
              onClick={() => setMetricMode('coldStart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                metricMode === 'coldStart'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Cold Start (ms)
            </button>
            <button
              onClick={() => setMetricMode('syncSpeed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                metricMode === 'syncSpeed'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Sync Speed (s)
            </button>
            <button
              onClick={() => setMetricMode('apkSize')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                metricMode === 'apkSize'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Tamaño APK
            </button>
          </div>
        </div>
      </div>

      {/* Visual Bar Chart Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Ranking Ordenado: {getMetricData(sortedStores[0]).label} (Menor es mejor)</span>
          <span className="text-slate-500 text-[11px] font-normal lowercase">valores en {getMetricData(sortedStores[0]).unit}</span>
        </h3>

        <div className="space-y-3.5">
          {sortedStores.map((store, index) => {
            const metric = getMetricData(store);
            const percentage = Math.min(Math.max(((metric.value as number) / metric.max) * 100, 4), 100);
            
            // Color grade based on efficiency
            let barColor = 'bg-emerald-500';
            if (percentage > 70) barColor = 'bg-rose-500';
            else if (percentage > 45) barColor = 'bg-amber-500';

            return (
              <div 
                key={store.id} 
                onClick={() => onSelectStore(store)}
                className="group cursor-pointer p-2.5 rounded-lg hover:bg-slate-850/60 transition-all border border-transparent hover:border-slate-800"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[11px] w-5">#{index + 1}</span>
                    <span className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {store.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      ({store.techStack.uiArchitecture})
                    </span>
                  </div>
                  <div className="font-mono font-bold text-slate-100 flex items-center gap-1">
                    <span className="text-emerald-400">{metric.value}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{metric.unit}</span>
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep-dive Benchmark Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase mb-2">
            <Cpu className="w-4 h-4" />
            Consumo de Memoria RAM
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-400">F-Droid Classic</strong> y <strong className="text-emerald-400">Foxy Droid</strong> lideran en bajo consumo (~25-32MB en reposo) al prescindir de frameworks pesados de inyección de dependencias o motores Flutter.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase mb-2">
            <Timer className="w-4 h-4" />
            Velocidad de Sincronización (Index V2)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-sky-400">Accrescent</strong> y <strong className="text-sky-400">Droid-ify</strong> completan la sincronización de catálogos masivos en menos de 2.5 segundos gracias al nuevo protocolo binario F-Droid Index V2 y SQLite FTS4.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase mb-2">
            <HardDrive className="w-4 h-4" />
            Arranque en Frío (Cold Start)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Los clientes nativos en Kotlin con Compose optimizado con R8 y ProGuard inician en menos de 400ms, proporcionando una respuesta táctil inmediata sin lags perceptibles.
          </p>
        </div>
      </div>
    </div>
  );
};
