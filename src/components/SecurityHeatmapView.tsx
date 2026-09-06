import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers, 
  Sparkles, 
  ExternalLink,
  Activity,
  Zap,
  Lock,
  Smartphone,
  Eye,
  RefreshCw
} from 'lucide-react';
import { AppCatalogItem } from '../types';

interface SecurityHeatmapViewProps {
  apps: AppCatalogItem[];
  installedAppIds: string[];
  onSelectApp?: (app: AppCatalogItem) => void;
  onOpenAuditDetail?: (app: AppCatalogItem) => void;
}

interface ThreatNode {
  id: string;
  name: string;
  type: 'APP' | 'TRACKER' | 'PERMISSION_RISK' | 'SECURITY_CORE';
  riskLevel: 'CLEAN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  x: number;
  y: number;
  r: number;
  appRef?: AppCatalogItem;
  trackersCount?: number;
  description: string;
  connections: string[]; // Connected Node IDs
}

export const SecurityHeatmapView: React.FC<SecurityHeatmapViewProps> = ({
  apps,
  installedAppIds,
  onSelectApp,
  onOpenAuditDetail
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'INSTALLED_ONLY' | 'TRACKERS_ONLY' | 'CLEAN_ONLY'>('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Target apps subset
  const targetApps = useMemo(() => {
    return apps.filter(a => {
      if (filterMode === 'INSTALLED_ONLY' && !installedAppIds.includes(a.id)) return false;
      if (filterMode === 'TRACKERS_ONLY' && a.trackersCount === 0) return false;
      if (filterMode === 'CLEAN_ONLY' && a.trackersCount > 0) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.packageName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [apps, installedAppIds, filterMode, searchQuery]);

  // Generate dynamic graph nodes & edges
  const { nodes, edges } = useMemo(() => {
    const generatedNodes: ThreatNode[] = [];
    const generatedEdges: Array<{ id: string; source: string; target: string; risk: string }> = [];

    // Central Core Node
    generatedNodes.push({
      id: 'core-sentinel',
      name: 'Android Knox & SELinux Sentinel',
      type: 'SECURITY_CORE',
      riskLevel: 'CLEAN',
      x: 450,
      y: 260,
      r: 28,
      description: 'Capa criptográfica de atestación de hardware Play Integrity y aislamiento de procesos en espacio de usuario.',
      connections: []
    });

    // Global Tracker Cluster Nodes
    const trackerNodesDef = [
      { id: 'tracker-firebase', name: 'Google Firebase Analytics', desc: 'Recopilación de telemetría de eventos y sesiones de usuario.', risk: 'MEDIUM' as const, x: 200, y: 120 },
      { id: 'tracker-crashlytics', name: 'Crashlytics Core', desc: 'Captura y reporte de excepciones no controladas en tiempo real.', risk: 'LOW' as const, x: 700, y: 130 },
      { id: 'tracker-facebook', name: 'Meta / Facebook Graph SDK', desc: 'Rastreador publicitario e identificación cruzada de huella de dispositivo.', risk: 'HIGH' as const, x: 740, y: 390 },
      { id: 'tracker-appsflyer', name: 'AppsFlyer Attribution', desc: 'Atribución comercial y medición de conversiones móviles invasivas.', risk: 'CRITICAL' as const, x: 180, y: 400 }
    ];

    trackerNodesDef.forEach(t => {
      generatedNodes.push({
        id: t.id,
        name: t.name,
        type: 'TRACKER',
        riskLevel: t.risk,
        x: t.x,
        y: t.y,
        r: 20,
        description: t.desc,
        connections: ['core-sentinel']
      });
      generatedEdges.push({
        id: `edge-${t.id}-core`,
        source: t.id,
        target: 'core-sentinel',
        risk: t.risk
      });
    });

    // Position App Nodes in an orbital ring around center
    const totalApps = targetApps.length;
    targetApps.forEach((app, index) => {
      const angle = (index / Math.max(totalApps, 1)) * 2 * Math.PI - Math.PI / 2;
      const radius = 185 + (index % 2 === 0 ? 15 : -15);
      const cx = 450 + Math.cos(angle) * radius;
      const cy = 260 + Math.sin(angle) * radius;

      const risk: ThreatNode['riskLevel'] = 
        app.trackersCount === 0 
          ? 'CLEAN' 
          : app.trackersCount > 2 
          ? 'HIGH' 
          : 'MEDIUM';

      const connectedTrackers: string[] = ['core-sentinel'];

      if (app.trackersCount > 0) {
        if (index % 2 === 0) {
          connectedTrackers.push('tracker-firebase');
          generatedEdges.push({ id: `edge-${app.id}-firebase`, source: app.id, target: 'tracker-firebase', risk: 'MEDIUM' });
        } else {
          connectedTrackers.push('tracker-crashlytics');
          generatedEdges.push({ id: `edge-${app.id}-crashlytics`, source: app.id, target: 'tracker-crashlytics', risk: 'LOW' });
        }
      }

      generatedEdges.push({
        id: `edge-${app.id}-core`,
        source: app.id,
        target: 'core-sentinel',
        risk
      });

      generatedNodes.push({
        id: app.id,
        name: app.name,
        type: 'APP',
        riskLevel: risk,
        x: Math.round(cx),
        y: Math.round(cy),
        r: 16,
        appRef: app,
        trackersCount: app.trackersCount,
        description: `${app.name} (${app.packageName}) • ${app.trackersCount === 0 ? 'FOSS 100% libre de rastreadores' : `${app.trackersCount} firmas detectadas`}`,
        connections: connectedTrackers
      });
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [targetApps]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <span>Security Heatmap & Grafo de Vulnerabilidades Exodus</span>
          </h3>
          <p className="text-xs text-slate-400">
            Mapa interactivo de telemetría analizando dependencias, permisos críticos y firmas invasivas
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'ALL'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas ({apps.length})
          </button>
          <button
            onClick={() => setFilterMode('INSTALLED_ONLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'INSTALLED_ONLY'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Instaladas ({installedAppIds.length})
          </button>
          <button
            onClick={() => setFilterMode('CLEAN_ONLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'CLEAN_ONLY'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            0 Rastreadores (Puras)
          </button>
          <button
            onClick={() => setFilterMode('TRACKERS_ONLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'TRACKERS_ONLY'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Con Rastreadores
          </button>
        </div>
      </div>

      {/* Main Canvas + Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-2 relative overflow-hidden shadow-2xl min-h-[460px] flex items-center justify-center">
          <svg
            viewBox="0 0 900 520"
            className="w-full h-full select-none"
            style={{ minHeight: '440px' }}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="heatmap-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
              
              {/* Radial Gradients */}
              <radialGradient id="grad-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#heatmap-grid)" />

            {/* Concentric Security Zones */}
            <circle cx="450" cy="260" r="120" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <circle cx="450" cy="260" r="190" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
            <circle cx="450" cy="260" r="240" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4" opacity="0.15" />

            {/* Connecting Edges */}
            {edges.map((edge) => {
              const src = nodes.find(n => n.id === edge.source);
              const tgt = nodes.find(n => n.id === edge.target);
              if (!src || !tgt) return null;

              const isHighlighted = selectedNodeId === src.id || selectedNodeId === tgt.id || hoveredNodeId === src.id || hoveredNodeId === tgt.id;

              const strokeColor = 
                edge.risk === 'CRITICAL' ? '#f43f5e' :
                edge.risk === 'HIGH' ? '#fb7185' :
                edge.risk === 'MEDIUM' ? '#fbbf24' :
                edge.risk === 'LOW' ? '#38bdf8' : '#34d399';

              return (
                <line
                  key={edge.id}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeOpacity={isHighlighted ? 0.9 : 0.25}
                  strokeDasharray={edge.risk !== 'CLEAN' ? '3 3' : undefined}
                />
              );
            })}

            {/* Interactive Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;

              const fillColor = 
                node.type === 'SECURITY_CORE' ? '#10b981' :
                node.riskLevel === 'CLEAN' ? '#10b981' :
                node.riskLevel === 'LOW' ? '#0ea5e9' :
                node.riskLevel === 'MEDIUM' ? '#f59e0b' :
                node.riskLevel === 'HIGH' ? '#f43f5e' : '#e11d48';

              return (
                <g
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (node.appRef && onSelectApp) {
                      onSelectApp(node.appRef);
                    }
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer transition-transform"
                >
                  {/* Outer Pulsing Aura for selected/hovered */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 8}
                      fill={fillColor}
                      fillOpacity={0.25}
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    fill="#0f172a"
                    stroke={fillColor}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Inner Status Indicator */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r - 6}
                    fill={fillColor}
                    fillOpacity={0.85}
                  />

                  {/* Node Label */}
                  <text
                    x={node.x}
                    y={node.y + node.r + 14}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize={node.type === 'SECURITY_CORE' ? '11' : '10'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="pointer-events-none select-none font-mono"
                  >
                    {node.name.length > 18 ? `${node.name.substring(0, 16)}...` : node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800/90 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 flex items-center gap-3 backdrop-blur shadow">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> FOSS 0 Rastreadores</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Telemetría Básica</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> SDK Invasivo</span>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl space-y-4">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  selectedNode.riskLevel === 'CLEAN' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  selectedNode.riskLevel === 'LOW' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                  selectedNode.riskLevel === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {selectedNode.riskLevel === 'CLEAN' ? 'Nivel Seguro • 0 Riesgos' : `Riesgo: ${selectedNode.riskLevel}`}
                </span>
                <span className="text-xs text-slate-500 font-mono">{selectedNode.type}</span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{selectedNode.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {selectedNode.appRef && (
                <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paquete:</span>
                    <span className="text-slate-200 truncate max-w-[170px]">{selectedNode.appRef.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Versión:</span>
                    <span className="text-emerald-400">{selectedNode.appRef.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rastreadores Exodus:</span>
                    <span className={selectedNode.appRef.trackersCount === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {selectedNode.appRef.trackersCount === 0 ? '0 (FOSS Verificado)' : `${selectedNode.appRef.trackersCount} firmas`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Licencia:</span>
                    <span className="text-purple-300">{selectedNode.appRef.license}</span>
                  </div>
                </div>
              )}

              {selectedNode.appRef && onOpenAuditDetail && (
                <button
                  onClick={() => onOpenAuditDetail(selectedNode.appRef!)}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-950"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspeccionar Auditoría Completa</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <Activity className="w-10 h-10 text-slate-600" />
              <div>
                <h5 className="font-bold text-slate-300 text-sm">Selecciona un Nodo del Heatmap</h5>
                <p className="text-xs text-slate-500 mt-1">
                  Haz clic en cualquier aplicación o rastreador para visualizar detalles de seguridad y aislar vectores de telemetría.
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Summary */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400">
            <span>Auditadas: <b className="text-white">{targetApps.length}</b></span>
            <span>Limpias: <b className="text-emerald-400">{targetApps.filter(a => a.trackersCount === 0).length}</b></span>
            <span>Con Tracker: <b className="text-amber-400">{targetApps.filter(a => a.trackersCount > 0).length}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};
