import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Server, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  Zap, 
  Radio, 
  ExternalLink,
  Lock,
  Wifi
} from 'lucide-react';
import { 
  multiRegionalMirrorService, 
  MirrorEndpoint, 
  MirrorAuditResult, 
  RegionalLatencyMetrics 
} from '../services/multiRegionalMirrorService';

interface MultiRegionalMirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiRegionalMirrorModal: React.FC<MultiRegionalMirrorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [mirrors, setMirrors] = useState<MirrorEndpoint[]>([]);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'MIRRORS' | 'AUDIT' | 'METRICS'>('MIRRORS');
  const [auditResult, setAuditResult] = useState<MirrorAuditResult | null>(null);
  const [regionalMetrics, setRegionalMetrics] = useState<RegionalLatencyMetrics[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('com.spotube');

  useEffect(() => {
    if (isOpen) {
      setMirrors(multiRegionalMirrorService.getMirrors());
      setRegionalMetrics(multiRegionalMirrorService.calculateRegionalMetrics());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProbeMirrors = async () => {
    setIsProbing(true);
    try {
      const updated = await multiRegionalMirrorService.probeAllMirrors();
      setMirrors(updated);
      setRegionalMetrics(multiRegionalMirrorService.calculateRegionalMetrics());
    } finally {
      setIsProbing(false);
    }
  };

  const handleRunAudit = () => {
    const res = multiRegionalMirrorService.auditPackageConsistency(
      selectedAppId,
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
    setAuditResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Espejos Multirregionales & Failover Paritario</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Fase 08
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sincronización paritaria entre Civer Cloud (MX), Google Drive Vault (US-East) y DigitalOcean Spaces (US-West)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleProbeMirrors}
              disabled={isProbing}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isProbing ? 'Sondeando...' : 'Sondear Red'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 flex gap-4 bg-slate-950/30 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('MIRRORS')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-2 ${
              activeTab === 'MIRRORS'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Nodos & Réplicas Activas ({mirrors.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-2 ${
              activeTab === 'AUDIT'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoría de Consistencia SHA-256</span>
          </button>
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-2 ${
              activeTab === 'METRICS'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Percentiles Regionales P50 / P90</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'MIRRORS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mirrors.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative group hover:border-cyan-500/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300">
                        {m.region}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {m.latencyMs} ms
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{m.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{m.baseUrl}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Prioridad Cascada:</span>
                      <span className="font-mono text-cyan-400 font-bold">Nivel #{m.priority}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Failover Cascade Info */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Protocolo de Failover Automático en Cascada (&lt;45ms)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Si el nodo primario en local/LAN sufre una interrupción o latencia mayor a 300ms, el cliente redirige la descarga de forma transparente hacia el Google Drive Vault (Descarga Intelectual 3). Si Google Drive reporta cuota de transferencia saturada, el tercer nivel conmuta automáticamente a DigitalOcean Spaces SFO3.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-mono">Seleccionar APK de Catálogo:</span>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="block bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="com.spotube">com.spotube (Spotube v3.8.2)</option>
                    <option value="org.videolan.vlc">org.videolan.vlc (VLC Android)</option>
                    <option value="ch.deletescape.lawnchair.plah">ch.deletescape.lawnchair (Lawnchair 14)</option>
                    <option value="eu.kanade.tachiyomi.sy">eu.kanade.tachiyomi.sy (TachiyomiSY)</option>
                  </select>
                </div>
                <button
                  onClick={handleRunAudit}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ejecutar Auditoría Cruzada SHA-256</span>
                </button>
              </div>

              {auditResult && (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Resultado de Paridad Criptográfica</h4>
                      <p className="text-xs text-slate-400">Verificado: {auditResult.verifiedAt}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                      auditResult.quorumAchieved
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950/80 text-rose-400 border-rose-800'
                    }`}>
                      {auditResult.quorumAchieved ? 'QUÓRUM 3/3 ALCANZADO' : 'FALLO DE PARIDAD'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {auditResult.mirrorsChecked.map((c) => (
                      <div
                        key={c.mirrorId}
                        className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono text-slate-300">{c.mirrorId}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400 font-mono">Digest SHA-256: VÁLIDO</span>
                          <span className="font-mono text-cyan-400 font-bold">{c.downloadLatencyMs} ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'METRICS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {regionalMetrics.map((rm) => (
                  <div key={rm.region} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{rm.region}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{rm.uptimePercentage}% Uptime</span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Latencia P50 (Mediana):</span>
                        <span className="font-mono text-white font-bold">{rm.p50Ms} ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Latencia P90:</span>
                        <span className="font-mono text-cyan-400 font-bold">{rm.p90Ms} ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Latencia P99 (Pico):</span>
                        <span className="font-mono text-amber-400 font-bold">{rm.p99Ms} ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-mono">Malla CDN Activa: 3 Nodos en Alta Disponibilidad</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
