import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Server, 
  Laptop, 
  Smartphone, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Wifi 
} from 'lucide-react';
import { clusterTelemetryService, ClusterHealthTelemetry } from '../services/clusterTelemetryService';

export const ClusterLiveTelemetryBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [telemetry, setTelemetry] = useState<ClusterHealthTelemetry>(clusterTelemetryService.getTelemetry());
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const unsubscribe = clusterTelemetryService.subscribe(data => {
      setTelemetry({ ...data });
    });
    return () => unsubscribe();
  }, []);

  const handleManualPulse = async () => {
    setIsPulsing(true);
    await clusterTelemetryService.triggerPulse();
    setTimeout(() => setIsPulsing(false), 800);
  };

  const getNodeIcon = (role: string) => {
    switch (role) {
      case 'MASTER':
        return <Server className="w-3.5 h-3.5 text-cyan-400" />;
      case 'PEER_WORKER':
        return <Laptop className="w-3.5 h-3.5 text-indigo-400" />;
      case 'TEST_DEVICE':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CLOUD_EDGE':
        return <Globe className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-white font-mono">Clúster Mesh 24/7:</span>
        <span className="text-emerald-400 font-medium">{telemetry.activeNodesCount}/{telemetry.totalNodesCount} Nodos Activos</span>
        <button
          onClick={handleManualPulse}
          disabled={isPulsing}
          className="ml-1 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          title="Emitir Pulso de Sincronización"
        >
          <RefreshCw className={`w-3 h-3 ${isPulsing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Red Mesh de Clúster Soberano &amp; DiscoveryWeb
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{telemetry.clusterStatus}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sincronización paritaria perpetua entre Desktop ASUS, Laptop ThinkPad (DiscoveryWeb), Samsung A06 y Cloudflare Edge.
            </p>
          </div>
        </div>

        <button
          onClick={handleManualPulse}
          disabled={isPulsing}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono transition flex items-center gap-1.5 shrink-0 border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isPulsing ? 'animate-spin' : ''}`} />
          <span>{isPulsing ? 'Emitiendo Pulso...' : 'Pulso de Red'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {telemetry.nodes.map(node => (
          <div 
            key={node.id} 
            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {getNodeIcon(node.role)}
                  <span className="text-xs font-bold text-white truncate max-w-[130px]">{node.name}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {node.status}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{node.ip}</div>
              <div className="text-[10px] text-slate-300 mt-1 line-clamp-2">{node.details}</div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px] font-mono">
              <span className="text-slate-500">RTT:</span>
              <span className="text-cyan-400 font-bold">{node.latencyMs} ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
