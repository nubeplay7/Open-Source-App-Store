import React, { useState } from 'react';
import { 
  Workflow, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Database, 
  Terminal, 
  Smartphone, 
  ExternalLink, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Info,
  GitBranch,
  RefreshCw,
  Zap,
  Activity,
  Code2
} from 'lucide-react';

export type NodeType = 'CORE_MODULE' | 'EXTERNAL_REPO' | 'SECURITY_SERVICE' | 'OS_INTEGRATION';

export interface GraphNode {
  id: string;
  name: string;
  category: NodeType;
  layer: string;
  shortDesc: string;
  x: number; // percentage in SVG coordinate system (0 to 1000)
  y: number; // percentage in SVG coordinate system (0 to 600)
  icon: string;
  color: string;
  strokeColor: string;
  badge: string;
  protocol: string;
  techStack: string;
  upstreamIds: string[]; // depends on
  downstreamIds: string[]; // feeds into
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  protocol: string;
  isAnimated?: boolean;
}

export const ARCHITECTURE_NODES: GraphNode[] = [
  // Tier 1: UI Shell & Client
  {
    id: 'ciber-shell',
    name: 'Multi-UI Shell (Civer App Store)',
    category: 'CORE_MODULE',
    layer: 'Capa 1: Presentación & UX',
    shortDesc: 'Front-end modular con vistas adaptables (Civer App Store, Play Store, App Store, Matrix Pro, Dev Workspace).',
    x: 500,
    y: 80,
    icon: 'Smartphone',
    color: '#8b5cf6',
    strokeColor: '#c084fc',
    badge: 'Core UI',
    protocol: 'React 18 + Tailwind SPA',
    techStack: 'TypeScript, Vite, TailwindCSS, Motion',
    upstreamIds: ['catalog-core', 'telemetry-core'],
    downstreamIds: ['ci-actions-runner', 'shizuku-bridge', 'delta-patcher']
  },
  
  // Tier 2: Core Engines
  {
    id: 'catalog-core',
    name: 'FOSS Catalog & Metadata Engine',
    category: 'CORE_MODULE',
    layer: 'Capa 2: Datos & Repositorios',
    shortDesc: 'Agrega y normaliza catálogos de aplicaciones FOSS con filtros de arquitectura, estado de seguridad y permisos.',
    x: 230,
    y: 200,
    icon: 'Database',
    color: '#3b82f6',
    strokeColor: '#60a5fa',
    badge: 'Index V2',
    protocol: 'Local State + Index Sync',
    techStack: 'IndexedDB, In-memory JSON V2, Cache API',
    upstreamIds: ['f-droid-repo', 'aurora-gplay-api', 'obtainium-git-bridge'],
    downstreamIds: ['ciber-shell', 'exodus-auditor']
  },
  {
    id: 'ci-actions-runner',
    name: 'GitHub CI Actions Cloud Compiler',
    category: 'CORE_MODULE',
    layer: 'Capa 2: Compilación & Cloud',
    shortDesc: 'Despacha workflows automatizados a GitHub Actions para compilar APKs reproducibles desde el código fuente.',
    x: 770,
    y: 200,
    icon: 'Terminal',
    color: '#10b981',
    strokeColor: '#34d399',
    badge: 'Cloud CI',
    protocol: 'GitHub Actions REST API v3',
    techStack: 'Octokit Dispatch, Runner Ubuntu-latest, OpenJDK 17',
    upstreamIds: ['ciber-shell'],
    downstreamIds: ['apksigner-daemon', 'obtainium-git-bridge']
  },

  // Tier 3: Security & Bridge Layer
  {
    id: 'shizuku-bridge',
    name: 'Shizuku ADB Rootless Daemon',
    category: 'SECURITY_SERVICE',
    layer: 'Capa 3: Instalación & Permisos',
    shortDesc: 'Interacción directa con el servicio PackageInstaller de Android mediante comandos ADB sin requerir privilegios de Root.',
    x: 500,
    y: 330,
    icon: 'ShieldCheck',
    color: '#f59e0b',
    strokeColor: '#fbbf24',
    badge: 'ADB Binder',
    protocol: 'moe.shizuku.api.Binder / IPC',
    techStack: 'Android ADB Shell, Shizuku Provider API',
    upstreamIds: ['ciber-shell', 'apksigner-daemon'],
    downstreamIds: ['android-pm-service']
  },
  {
    id: 'apksigner-daemon',
    name: 'APK Signature & SHA-256 Validator',
    category: 'SECURITY_SERVICE',
    layer: 'Capa 3: Criptografía',
    shortDesc: 'Verifica esquemas de firma APK v1, v2, v3 y valida certificados X.509 antes del despliegue en dispositivo.',
    x: 770,
    y: 350,
    icon: 'ShieldCheck',
    color: '#06b6d4',
    strokeColor: '#22d3ee',
    badge: 'X.509 v3',
    protocol: 'apksigner verify / SHA-256 Checksum',
    techStack: 'WebCrypto API, BouncyCastle Android Fork',
    upstreamIds: ['ci-actions-runner'],
    downstreamIds: ['shizuku-bridge']
  },
  {
    id: 'exodus-auditor',
    name: 'Exodus Privacy Tracker Scanner',
    category: 'SECURITY_SERVICE',
    layer: 'Capa 3: Auditoría de Privacidad',
    shortDesc: 'Inspecciona binarios APK y metadatos de manifiesto contra la base de datos de rastreadores y firmas analíticas de Exodus.',
    x: 230,
    y: 350,
    icon: 'ShieldCheck',
    color: '#ec4899',
    strokeColor: '#f472b6',
    badge: 'Privacy Audit',
    protocol: 'Exodus Privacy Signatures DB',
    techStack: 'Static Manifest AST Parser, Class Signature Matcher',
    upstreamIds: ['catalog-core', 'exodus-privacy-api'],
    downstreamIds: ['ciber-shell']
  },
  {
    id: 'delta-patcher',
    name: 'Delta Patch & Diff Engine',
    category: 'CORE_MODULE',
    layer: 'Capa 2: Optimizador de Red',
    shortDesc: 'Calcula parches binarios diferenciales para actualizar APKs descargando únicamente los bloques modificados.',
    x: 350,
    y: 260,
    icon: 'Zap',
    color: '#a855f7',
    strokeColor: '#c084fc',
    badge: 'BSDiff V4',
    protocol: 'Binary Delta Streaming',
    techStack: 'BSDiff / Courgette binary patch format',
    upstreamIds: ['ciber-shell'],
    downstreamIds: ['shizuku-bridge']
  },
  {
    id: 'telemetry-core',
    name: 'Telemetry & Benchmark Hub',
    category: 'CORE_MODULE',
    layer: 'Capa 2: Diagnóstico',
    shortDesc: 'Monitorea métricas en tiempo real de RAM, velocidad de indexación, cold-start y rendimiento de batería.',
    x: 650,
    y: 110,
    icon: 'Activity',
    color: '#6366f1',
    strokeColor: '#818cf8',
    badge: 'Telemetry',
    protocol: 'Device Telemetry Observer',
    techStack: 'PerformanceObserver API, Battery API, Device API',
    upstreamIds: [],
    downstreamIds: ['ciber-shell']
  },

  // Tier 4: External Repositories & OS Layer
  {
    id: 'f-droid-repo',
    name: 'F-Droid Official Repository',
    category: 'EXTERNAL_REPO',
    layer: 'Repositorio Externo',
    shortDesc: 'Espejo oficial de F-Droid con miles de paquetes verificados bajo licencias de código abierto.',
    x: 100,
    y: 120,
    icon: 'GitBranch',
    color: '#0284c7',
    strokeColor: '#38bdf8',
    badge: 'FOSS Repo',
    protocol: 'HTTPS / JSON Index-v2 / JAR signature',
    techStack: 'F-Droid Server, Repomaker v2',
    upstreamIds: [],
    downstreamIds: ['catalog-core']
  },
  {
    id: 'aurora-gplay-api',
    name: 'Aurora GPlay Mirror API',
    category: 'EXTERNAL_REPO',
    layer: 'Repositorio Externo',
    shortDesc: 'Proxy anónimo para consultar metadatos y descargar APKs desde Google Play Store sin cuentas vinculadas.',
    x: 100,
    y: 250,
    icon: 'ExternalLink',
    color: '#14b8a6',
    strokeColor: '#2dd4bf',
    badge: 'GPlay API',
    protocol: 'Protobuf / Google Play Auth API',
    techStack: 'Aurora Services, Play Store Token Client',
    upstreamIds: [],
    downstreamIds: ['catalog-core']
  },
  {
    id: 'obtainium-git-bridge',
    name: 'Obtainium Git Releases Bridge',
    category: 'EXTERNAL_REPO',
    layer: 'Repositorio Externo',
    shortDesc: 'Rastreador directo de releases en repositorios de GitHub, GitLab y SourceForge para entrega inmediata.',
    x: 900,
    y: 220,
    icon: 'GitBranch',
    color: '#f43f5e',
    strokeColor: '#fb7185',
    badge: 'Direct Releases',
    protocol: 'GitHub Releases API / Git Tags',
    techStack: 'REST API, Webhook Listeners',
    upstreamIds: [],
    downstreamIds: ['catalog-core', 'ci-actions-runner']
  },
  {
    id: 'exodus-privacy-api',
    name: 'Exodus Privacy Global Database',
    category: 'EXTERNAL_REPO',
    layer: 'Servicio Externo de Seguridad',
    shortDesc: 'Base de conocimiento comunitaria de firmas de telemetría y SDKs de publicidad en Android.',
    x: 100,
    y: 450,
    icon: 'ShieldCheck',
    color: '#db2777',
    strokeColor: '#f472b6',
    badge: 'Trackers DB',
    protocol: 'REST / Open Signatures API',
    techStack: 'Exodus Privacy API',
    upstreamIds: [],
    downstreamIds: ['exodus-auditor']
  },
  {
    id: 'android-pm-service',
    name: 'Android OS PackageInstaller',
    category: 'OS_INTEGRATION',
    layer: 'Capa 4: Sistema Operativo',
    shortDesc: 'Subsistema de Android nativo que administra el ciclo de vida de instalación y permisos de aplicaciones.',
    x: 500,
    y: 480,
    icon: 'Smartphone',
    color: '#22c55e',
    strokeColor: '#4ade80',
    badge: 'OS Daemon',
    protocol: 'android.content.pm.IPackageInstaller',
    techStack: 'Android Framework (API 21 - 35)',
    upstreamIds: ['shizuku-bridge'],
    downstreamIds: []
  }
];

export const ARCHITECTURE_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'f-droid-repo', target: 'catalog-core', label: 'Index v2 Sync', protocol: 'JSON Index', isAnimated: true },
  { id: 'e2', source: 'aurora-gplay-api', target: 'catalog-core', label: 'Anonymous Fetch', protocol: 'Protobuf', isAnimated: true },
  { id: 'e3', source: 'obtainium-git-bridge', target: 'catalog-core', label: 'Release Track', protocol: 'Git Tags', isAnimated: false },
  { id: 'e4', source: 'catalog-core', target: 'ciber-shell', label: 'Catalog Feed', protocol: 'In-Memory Stream', isAnimated: true },
  { id: 'e5', source: 'telemetry-core', target: 'ciber-shell', label: 'System Metrics', protocol: 'Observer API', isAnimated: true },
  { id: 'e6', source: 'ciber-shell', target: 'ci-actions-runner', label: 'Dispatch Build', protocol: 'REST v3', isAnimated: true },
  { id: 'e7', source: 'ci-actions-runner', target: 'apksigner-daemon', label: 'APK Artifact', protocol: 'Blob / SHA-256', isAnimated: true },
  { id: 'e8', source: 'apksigner-daemon', target: 'shizuku-bridge', label: 'Verified Payload', protocol: 'APK Scheme v3', isAnimated: true },
  { id: 'e9', source: 'ciber-shell', target: 'shizuku-bridge', label: 'Install Intent', protocol: 'ADB Shell', isAnimated: true },
  { id: 'e10', source: 'shizuku-bridge', target: 'android-pm-service', label: 'Package Commit', protocol: 'Binder IPC', isAnimated: true },
  { id: 'e11', source: 'ciber-shell', target: 'delta-patcher', label: 'Diff Request', protocol: 'Binary Stream', isAnimated: false },
  { id: 'e12', source: 'delta-patcher', target: 'shizuku-bridge', label: 'Patched APK', protocol: 'BSDiff Output', isAnimated: false },
  { id: 'e13', source: 'exodus-privacy-api', target: 'exodus-auditor', label: 'Tracker Signatures', protocol: 'REST Sync', isAnimated: true },
  { id: 'e14', source: 'catalog-core', target: 'exodus-auditor', label: 'Manifest AST', protocol: 'XML Parsing', isAnimated: false },
  { id: 'e15', source: 'exodus-auditor', target: 'ciber-shell', label: 'Audit Badge', protocol: '0-Trackers Score', isAnimated: true }
];

interface ArchitectureGraphViewProps {
  onSelectModuleId?: (moduleId: string) => void;
}

export const ArchitectureGraphView: React.FC<ArchitectureGraphViewProps> = ({ onSelectModuleId }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ciber-shell');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedNode = ARCHITECTURE_NODES.find((n) => n.id === selectedNodeId) || ARCHITECTURE_NODES[0];

  // Filtering nodes
  const filteredNodes = ARCHITECTURE_NODES.filter((node) => {
    const matchesCat = categoryFilter === 'ALL' || node.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      node.name.toLowerCase().includes(q) || 
      node.shortDesc.toLowerCase().includes(q) ||
      node.techStack.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const isNodeHighlighted = (nodeId: string) => {
    if (!hoveredNodeId) return true;
    if (hoveredNodeId === nodeId) return true;
    const isConnected = ARCHITECTURE_EDGES.some(
      (e) => (e.source === hoveredNodeId && e.target === nodeId) || (e.target === hoveredNodeId && e.source === nodeId)
    );
    return isConnected;
  };

  const isEdgeHighlighted = (edge: GraphEdge) => {
    if (!hoveredNodeId && !selectedNodeId) return true;
    const targetId = hoveredNodeId || selectedNodeId;
    return edge.source === targetId || edge.target === targetId;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Filter & Search Bar */}
      <div className="bg-[#111622] px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el grafo (ej: Shizuku, CI, F-Droid, APK)..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'Todos los Nodos' },
            { id: 'CORE_MODULE', label: 'Módulos Core' },
            { id: 'SECURITY_SERVICE', label: 'Seguridad & Cripto' },
            { id: 'EXTERNAL_REPO', label: 'Repos Externos' },
            { id: 'OS_INTEGRATION', label: 'Capa Android OS' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual Area: SVG Canvas + Inspector Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* SVG Network Graph Canvas */}
        <div className="flex-1 relative bg-[#070a10] overflow-hidden flex items-center justify-center p-2 sm:p-4 min-h-[420px]">
          
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg
            viewBox="0 0 1000 560"
            className="w-full h-full max-h-[560px] select-none"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
          >
            <defs>
              <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#a855f7" />
              </marker>
            </defs>

            {/* Render Edges */}
            {ARCHITECTURE_EDGES.map((edge) => {
              const sourceNode = ARCHITECTURE_NODES.find((n) => n.id === edge.source);
              const targetNode = ARCHITECTURE_NODES.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isHighlight = isEdgeHighlighted(edge);
              const isAnimated = edge.isAnimated;

              return (
                <g key={edge.id} className="transition-all duration-300">
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isHighlight ? (selectedNodeId === edge.source || selectedNodeId === edge.target ? '#c084fc' : '#475569') : '#1e293b'}
                    strokeWidth={isHighlight ? 2.5 : 1}
                    strokeDasharray={isAnimated ? '6 4' : undefined}
                    className={isAnimated && isHighlight ? 'animate-pulse' : ''}
                    markerEnd={isHighlight ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                  />

                  {/* Midpoint Label */}
                  {isHighlight && (
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 6}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="bg-slate-900"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {ARCHITECTURE_NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const isHighlighted = isNodeHighlighted(node.id);
              const isFiltered = filteredNodes.some((n) => n.id === node.id);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onSelectModuleId) onSelectModuleId(node.id);
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer transition-all duration-200"
                  opacity={isFiltered ? (isHighlighted ? 1 : 0.25) : 0.15}
                >
                  {/* Outer Glow on selection */}
                  {isSelected && (
                    <circle
                      r="36"
                      fill="none"
                      stroke={node.strokeColor}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r="26"
                    fill="#0f172a"
                    stroke={isSelected ? node.strokeColor : '#334155'}
                    strokeWidth={isSelected ? 3 : 2}
                    className="hover:scale-110 transition-transform"
                  />

                  <circle
                    r="20"
                    fill={node.color}
                    opacity={isSelected ? 0.35 : 0.15}
                  />

                  {/* Node Icon/Symbol */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={node.strokeColor}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.badge.slice(0, 3)}
                  </text>

                  {/* Node Name Label below */}
                  <text
                    textAnchor="middle"
                    dy="42"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight={isSelected ? 'bold' : '500'}
                    fontFamily="system-ui"
                  >
                    {node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name}
                  </text>

                  {/* Node Protocol Badge */}
                  <text
                    textAnchor="middle"
                    dy="54"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {node.badge}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend Overlay at bottom left */}
          <div className="absolute bottom-3 left-3 bg-[#0d1117]/90 border border-slate-800/80 rounded-xl p-2.5 backdrop-blur text-[10px] space-y-1 hidden sm:block">
            <div className="text-slate-400 font-bold uppercase tracking-wider mb-1">Leyenda de Capas</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-300">Civer App Store Core UI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-300">Catálogo & Metadatos FOSS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">GitHub CI/CD Runner</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">Shizuku & Seguridad</span>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div className="lg:w-80 bg-[#0e131f] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                {selectedNode.layer}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ID: {selectedNode.id}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {selectedNode.name}
            </h3>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Descripción del Módulo</div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-3 rounded-xl border border-slate-800">
              {selectedNode.shortDesc}
            </p>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Stack Tecnológico & Protocolo</div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="text-slate-400">Protocolo: <span className="text-emerald-300 font-semibold">{selectedNode.protocol}</span></div>
              <div className="text-slate-400">Stack: <span className="text-slate-200">{selectedNode.techStack}</span></div>
            </div>
          </div>

          {/* Dependencies / Connections */}
          <div className="space-y-2 text-xs">
            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Flujo de Dependencias</div>
            
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Depende de (Upstream):</div>
              {selectedNode.upstreamIds.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic pl-2">Ninguno (Punto de entrada o Servicio Externo)</div>
              ) : (
                selectedNode.upstreamIds.map((upId) => {
                  const upNode = ARCHITECTURE_NODES.find((n) => n.id === upId);
                  return (
                    <button
                      key={upId}
                      onClick={() => setSelectedNodeId(upId)}
                      className="w-full text-left p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 flex items-center justify-between transition"
                    >
                      <span className="font-mono text-purple-300">{upNode?.name || upId}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="space-y-1 pt-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Alimenta a (Downstream):</div>
              {selectedNode.downstreamIds.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic pl-2">Ninguno (Nodo final de ejecución)</div>
              ) : (
                selectedNode.downstreamIds.map((downId) => {
                  const downNode = ARCHITECTURE_NODES.find((n) => n.id === downId);
                  return (
                    <button
                      key={downId}
                      onClick={() => setSelectedNodeId(downId)}
                      className="w-full text-left p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 flex items-center justify-between transition"
                    >
                      <span className="font-mono text-emerald-300">{downNode?.name || downId}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
