import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  RefreshCw, 
  Filter, 
  Download, 
  Search, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  Server, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Radio, 
  Database,
  Sliders
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { AppCatalogItem } from '../types';

interface PacketLog {
  id: string;
  timestamp: string;
  appId: string;
  appName: string;
  destination: string;
  ip: string;
  port: number;
  protocol: 'HTTPS' | 'TLS 1.3' | 'DNS' | 'QUIC' | 'HTTP';
  type: 'foss_repo' | 'tracker' | 'cdn' | 'p2p';
  bytesSent: number;
  bytesReceived: number;
  status: 'allowed' | 'blocked_sinkhole';
  encrypted: boolean;
}

interface NetworkTrafficModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp?: AppCatalogItem | null;
  catalog?: AppCatalogItem[];
  isOffline?: boolean;
}

const INITIAL_PACKETS: PacketLog[] = [
  { id: 'p1', timestamp: '10:42:01', appId: 'droid-ify', appName: 'Droid-ify', destination: 'f-droid.org/repo/index-v2.json', ip: '148.251.137.66', port: 443, protocol: 'TLS 1.3', type: 'foss_repo', bytesSent: 340, bytesReceived: 12400, status: 'allowed', encrypted: true },
  { id: 'p2', timestamp: '10:42:02', appId: 'droid-ify', appName: 'Droid-ify', destination: 'graph.facebook.com/v16.0/telemetry', ip: '157.240.22.35', port: 443, protocol: 'HTTPS', type: 'tracker', bytesSent: 820, bytesReceived: 0, status: 'blocked_sinkhole', encrypted: true },
  { id: 'p3', timestamp: '10:42:03', appId: 'obtainium', appName: 'Obtainium', destination: 'api.github.com/repos/ImranR98/Obtainium/releases', ip: '140.82.121.6', port: 443, protocol: 'TLS 1.3', type: 'foss_repo', bytesSent: 480, bytesReceived: 8900, status: 'allowed', encrypted: true },
  { id: 'p4', timestamp: '10:42:04', appId: 'obtainium', appName: 'Obtainium', destination: 'app-measurement.com/a/telemetry', ip: '142.250.180.14', port: 443, protocol: 'HTTPS', type: 'tracker', bytesSent: 650, bytesReceived: 0, status: 'blocked_sinkhole', encrypted: true },
  { id: 'p5', timestamp: '10:42:05', appId: 'aurora-store', appName: 'Aurora Store', destination: 'auroraoss.com/check_tokens', ip: '104.21.55.12', port: 443, protocol: 'QUIC', type: 'foss_repo', bytesSent: 210, bytesReceived: 1450, status: 'allowed', encrypted: true },
  { id: 'p6', timestamp: '10:42:06', appId: 'f-droid', appName: 'F-Droid Client', destination: 'raw.githubusercontent.com/f-droid/fdroiddata', ip: '185.199.108.133', port: 443, protocol: 'TLS 1.3', type: 'foss_repo', bytesSent: 520, bytesReceived: 34200, status: 'allowed', encrypted: true },
  { id: 'p7', timestamp: '10:42:07', appId: 'civer-app-store-pro', appName: 'Civer App Store PRO', destination: 'cloudflare-dns.com/dns-query', ip: '1.1.1.1', port: 853, protocol: 'DNS', type: 'cdn', bytesSent: 94, bytesReceived: 210, status: 'allowed', encrypted: true },
];

export const NetworkTrafficModal: React.FC<NetworkTrafficModalProps> = ({
  isOpen,
  onClose,
  selectedApp,
  catalog = [],
  isOffline = false
}) => {
  const [activeAppId, setActiveAppId] = useState<string>(selectedApp?.id || 'all');
  const [isLiveCapturing, setIsLiveCapturing] = useState<boolean>(true);
  const [isSinkholeEnabled, setIsSinkholeEnabled] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'tracker' | 'foss_repo' | 'blocked'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Real-time chart data points
  const [chartData, setChartData] = useState<{ time: string; fossKbps: number; trackerKbps: number; cdnKbps: number }[]>([
    { time: '10:41:50', fossKbps: 12.4, trackerKbps: 0.0, cdnKbps: 2.1 },
    { time: '10:41:55', fossKbps: 24.8, trackerKbps: 1.2, cdnKbps: 4.5 },
    { time: '10:42:00', fossKbps: 86.2, trackerKbps: 0.0, cdnKbps: 3.2 },
    { time: '10:42:05', fossKbps: 45.1, trackerKbps: 2.4, cdnKbps: 5.6 },
    { time: '10:42:10', fossKbps: 112.0, trackerKbps: 0.0, cdnKbps: 8.1 },
    { time: '10:42:15', fossKbps: 68.3, trackerKbps: 0.8, cdnKbps: 4.0 },
    { time: '10:42:20', fossKbps: 94.7, trackerKbps: 0.0, cdnKbps: 6.2 },
  ]);

  const [packetLogs, setPacketLogs] = useState<PacketLog[]>(INITIAL_PACKETS);

  // Sync selectedApp if prop changes
  useEffect(() => {
    if (selectedApp) {
      setActiveAppId(selectedApp.id);
    }
  }, [selectedApp]);

  // Live traffic tick simulator
  useEffect(() => {
    if (!isLiveCapturing || !isOpen || isOffline) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      // Generate realistic dynamic bandwidth
      const isBurst = Math.random() > 0.65;
      const fossTraffic = isBurst ? +(Math.random() * 90 + 30).toFixed(1) : +(Math.random() * 25 + 5).toFixed(1);
      const trackerAttempt = Math.random() > 0.7 ? +(Math.random() * 3 + 0.5).toFixed(1) : 0;
      const cdnTraffic = +(Math.random() * 8 + 1).toFixed(1);

      setChartData((prev) => {
        const next = [...prev.slice(-14), {
          time: timeStr,
          fossKbps: fossTraffic,
          trackerKbps: isSinkholeEnabled ? 0 : trackerAttempt,
          cdnKbps: cdnTraffic
        }];
        return next;
      });

      // Random packet generator
      const knownApps: Array<{ id: string; name: string; host: string; type: PacketLog['type']; prot: PacketLog['protocol'] }> = [
        { id: 'droid-ify', name: 'Droid-ify', host: 'f-droid.org', type: 'foss_repo', prot: 'TLS 1.3' },
        { id: 'obtainium', name: 'Obtainium', host: 'github.com/releases', type: 'foss_repo', prot: 'HTTPS' },
        { id: 'aurora-store', name: 'Aurora Store', host: 'play.googleapis.com', type: 'cdn', prot: 'QUIC' },
        { id: 'civer-app-store-pro', name: 'Civer App Store PRO', host: 'api.github.com/actions', type: 'foss_repo', prot: 'HTTPS' },
        { id: 'telemetry-sample', name: 'Audited App', host: 'telemetry.adjust.com', type: 'tracker', prot: 'DNS' }
      ];

      const sample = knownApps[Math.floor(Math.random() * knownApps.length)];
      const isBlocked = sample.type === 'tracker' && isSinkholeEnabled;

      const newPacket: PacketLog = {
        id: `p-${Date.now()}`,
        timestamp: timeStr,
        appId: sample.id,
        appName: sample.name,
        destination: sample.host,
        ip: `192.0.2.${Math.floor(Math.random() * 250 + 1)}`,
        port: sample.prot === 'DNS' ? 53 : 443,
        protocol: sample.prot,
        type: sample.type,
        bytesSent: Math.floor(Math.random() * 400 + 50),
        bytesReceived: isBlocked ? 0 : Math.floor(Math.random() * 4500 + 300),
        status: isBlocked ? 'blocked_sinkhole' : 'allowed',
        encrypted: true
      };

      setPacketLogs((prev) => [newPacket, ...prev.slice(0, 39)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveCapturing, isOpen, isOffline, isSinkholeEnabled]);

  if (!isOpen) return null;

  // Filter packet logs
  const filteredPackets = packetLogs.filter((p) => {
    if (activeAppId !== 'all' && p.appId !== activeAppId) return false;
    if (filterType === 'tracker' && p.type !== 'tracker') return false;
    if (filterType === 'foss_repo' && p.type !== 'foss_repo') return false;
    if (filterType === 'blocked' && p.status !== 'blocked_sinkhole') return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return p.destination.toLowerCase().includes(q) || p.appName.toLowerCase().includes(q) || p.ip.includes(q);
    }
    return true;
  });

  const totalBytesCaptured = packetLogs.reduce((acc, p) => acc + p.bytesSent + p.bytesReceived, 0);
  const totalTrackersBlocked = packetLogs.filter((p) => p.status === 'blocked_sinkhole').length;
  const currentFossSpeed = chartData[chartData.length - 1]?.fossKbps || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold shadow-inner shrink-0">
              <Activity className="w-5 h-5 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Monitor de Tráfico de Red en Vivo & Inspección FOSS
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                  eBPF / DNS Sinkhole
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supervisa el tráfico saliente por aplicación y bloquea endpoints no-FOSS o telemetría en tiempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline notice if active */}
        {isOffline && (
          <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span>Modo Sin Conexión activo. Tráfico de red suspendido; mostrando caché de registros previos.</span>
            </div>
            <span className="font-mono text-[10px] bg-amber-900 px-2 py-0.5 rounded">OFFLINE CACHED</span>
          </div>
        )}

        {/* Top Control & KPI Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Velocidad FOSS Actual</div>
            <div className="text-lg font-black text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>{currentFossSpeed} KB/s</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Trackers Neutralizados</div>
            <div className="text-lg font-black text-rose-400 font-mono flex items-center gap-1 mt-0.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{totalTrackersBlocked} Bloqueados</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Paquetes Inspeccionados</div>
            <div className="text-lg font-black text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>{packetLogs.length} TLS/QUIC</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Datos Transferidos</div>
            <div className="text-lg font-black text-purple-400 font-mono flex items-center gap-1 mt-0.5">
              <Database className="w-4 h-4 text-purple-400" />
              <span>{(totalBytesCaptured / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>

        {/* Middle Area: Interactive Line Chart with Recharts */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Chart Header & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300">App Objetivo:</span>
              <select
                value={activeAppId}
                onChange={(e) => setActiveAppId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-300 focus:outline-none"
              >
                <option value="all">Todas las Aplicaciones (Global)</option>
                {catalog.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.id})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsSinkholeEnabled(!isSinkholeEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSinkholeEnabled 
                    ? 'bg-rose-950 text-rose-300 border border-rose-700/60' 
                    : 'bg-slate-800 text-slate-400'
                }`}
                title="DNS Sinkhole bloquea automáticamente intentos de conexión hacia servidores de analíticas"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DNS Sinkhole: {isSinkholeEnabled ? 'ACTIVO (Bloqueo Total)' : 'PASIVO'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsLiveCapturing(!isLiveCapturing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isLiveCapturing ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-600 text-white'
                }`}
              >
                {isLiveCapturing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isLiveCapturing ? 'Pausar Live' : 'Reanudar'}</span>
              </button>
            </div>
          </div>

          {/* Recharts Line / Area Visualizer */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="font-semibold text-slate-200">Repositorios FOSS / APKs (KB/s)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="font-semibold text-rose-300">Intentos de Rastreo Telemetría (KB/s)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
                  <span className="font-semibold text-cyan-300">CDNs / DNS DoH</span>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Muestreo cada 2.5s</span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fossGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="trackerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="cdnGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} unit=" KB" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="fossKbps" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#fossGradient)" name="FOSS Repos" />
                  <Area type="monotone" dataKey="trackerKbps" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#trackerGradient)" name="Trackers Bloqueados" />
                  <Area type="monotone" dataKey="cdnKbps" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#cdnGradient)" name="CDN/DNS" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Packet Log Table */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200">Inspección de Paquetes en Tiempo Real</h4>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar host o IP..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  {(['all', 'foss_repo', 'tracker', 'blocked'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2 py-1 rounded transition capitalize ${
                        filterType === type ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {type === 'all' ? 'Todos' : type === 'foss_repo' ? 'FOSS' : type === 'tracker' ? 'Trackers' : 'Bloqueados'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-2">Hora</th>
                    <th className="py-2 px-2">Aplicación</th>
                    <th className="py-2 px-2">Destino / Host FQDN</th>
                    <th className="py-2 px-2">Protocolo</th>
                    <th className="py-2 px-2">Bytes</th>
                    <th className="py-2 px-2">Estado Firewall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filteredPackets.map((pkt) => (
                    <tr key={pkt.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-2 px-2 text-slate-500">{pkt.timestamp}</td>
                      <td className="py-2 px-2 font-sans font-semibold text-slate-200">{pkt.appName}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className={pkt.type === 'tracker' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                            {pkt.destination}
                          </span>
                          <span className="text-[10px] text-slate-500">({pkt.ip}:{pkt.port})</span>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {pkt.protocol}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-400">
                        {pkt.bytesSent + pkt.bytesReceived > 1024 
                          ? `${((pkt.bytesSent + pkt.bytesReceived) / 1024).toFixed(1)} KB` 
                          : `${pkt.bytesSent + pkt.bytesReceived} B`}
                      </td>
                      <td className="py-2 px-2">
                        {pkt.status === 'blocked_sinkhole' ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] font-bold inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            SINKHOLE BLOQUEADO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            FOSS PERMITIDO
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-center sm:text-left">
            Total de filtros activos: <strong className="text-cyan-300">AdAway + StevenBlack Hosts + Exodus Telemetry Blacklist</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Cerrar Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
