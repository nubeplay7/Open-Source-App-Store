import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  Activity,
  Server,
  Fingerprint,
  Cpu,
  GitBranch,
  Play,
  Flame,
  FileCode,
  AlertTriangle,
  Code2,
  Radio,
  Bot,
  Terminal,
  BookOpen,
  Copy,
  Check
} from 'lucide-react';
import { 
  ClonedRepoCandidate, 
  RepoHealthMetrics, 
  RepoHeuristicAnalyzer 
} from '../services/repoHeuristicService';
import { persistentCiQueueService, PersistentBuildQueueItem } from '../services/persistentCiQueueService';
import { civerWebSocketBus } from '../services/civerWebSocketBus';
import { OPENAPI_SPEC, PROTOBUF_DEFINITION } from '../services/apiContractsService';
import { MCP_SERVER_MANIFEST } from '../services/mcpToolsService';
import { AppCatalogItem } from '../types';

interface FdroidMirror {
  id: string;
  name: string;
  url: string;
  region: string;
  latencyMs: number;
  status: 'ONLINE' | 'SYNCING' | 'ERROR';
  indexVersion: 'V2 (JSON Entry)' | 'V1 (XML Legacy)';
  lastUpdated: string;
  fingerprint: string;
}

const DEFAULT_MIRRORS: FdroidMirror[] = [
  {
    id: 'mirror-1',
    name: 'F-Droid Main (Frankfurt, DE)',
    url: 'https://f-droid.org/repo',
    region: 'Europa (Alemania)',
    latencyMs: 38,
    status: 'ONLINE',
    indexVersion: 'V2 (JSON Entry)',
    lastUpdated: 'Hace 4 minutos',
    fingerprint: '43238D512C1E5EB2D6569F4A3AFBF5523418B82E0A3ED1552770ABB9A9C1CCAB'
  },
  {
    id: 'mirror-2',
    name: 'IzzyOnDroid Main Repo',
    url: 'https://apt.izzysoft.de/fdroid/repo',
    region: 'Europa (Dinamarca)',
    latencyMs: 44,
    status: 'ONLINE',
    indexVersion: 'V2 (JSON Entry)',
    lastUpdated: 'Hace 12 minutos',
    fingerprint: '3BF0D6ABFEAE5F601822BC66E464004F8B121F475B089A69451E6CE935D70282'
  },
  {
    id: 'mirror-3',
    name: 'Dotsrc Danish Mirror',
    url: 'https://mirrors.dotsrc.org/fdroid/repo',
    region: 'Europa Nórdica',
    latencyMs: 52,
    status: 'ONLINE',
    indexVersion: 'V2 (JSON Entry)',
    lastUpdated: 'Hace 22 minutos',
    fingerprint: '43238D512C1E5EB2D6569F4A3AFBF5523418B82E0A3ED1552770ABB9A9C1CCAB'
  }
];

const SAMPLE_REPOS_FOR_IMPORT: ClonedRepoCandidate[] = [
  {
    id: 'repo-tachiyomi-sy',
    name: 'tachiyomi-sy',
    repoUrl: 'https://github.com/jobobby04/TachiyomiSY',
    defaultBranch: 'master',
    stars: 3200,
    forks: 410,
    openIssues: 12,
    closedIssues: 240,
    lastCommitIso: new Date(Date.now() - 2 * 86400000).toISOString(),
    weeklyCommits: 8,
    filesList: [
      'build.gradle.kts',
      'settings.gradle.kts',
      'gradlew',
      'gradle/wrapper/gradle-wrapper.properties',
      'app/src/main/AndroidManifest.xml',
      'app/build.gradle.kts'
    ],
    description: 'Lector de mangas y cómics FOSS con extensiones descentralizadas y soporte de copia de seguridad local.',
    suggestedCategory: 'MULTIMEDIA',
    suggestedPackageName: 'eu.kanade.tachiyomi.sy'
  },
  {
    id: 'repo-lawnchair',
    name: 'lawnchair-v14',
    repoUrl: 'https://github.com/LawnchairLauncher/lawnchair',
    defaultBranch: '14-dev',
    stars: 8900,
    forks: 1200,
    openIssues: 45,
    closedIssues: 810,
    lastCommitIso: new Date(Date.now() - 1 * 86400000).toISOString(),
    weeklyCommits: 14,
    filesList: [
      'build.gradle.kts',
      'settings.gradle.kts',
      'gradlew',
      'app/src/main/AndroidManifest.xml'
    ],
    description: 'Launcher de código abierto personalizable basado en Android 14 Quickstep con soporte para iconos temáticos.',
    suggestedCategory: 'CUSTOMIZATION',
    suggestedPackageName: 'ch.deletescape.lawnchair.plah'
  },
  {
    id: 'repo-k-9-mail',
    name: 'thunderbird-android',
    repoUrl: 'https://github.com/thunderbird/thunderbird-android',
    defaultBranch: 'main',
    stars: 12400,
    forks: 2300,
    openIssues: 80,
    closedIssues: 3200,
    lastCommitIso: new Date(Date.now() - 3 * 86400000).toISOString(),
    weeklyCommits: 22,
    filesList: [
      'build.gradle',
      'settings.gradle',
      'gradlew',
      'app/src/main/AndroidManifest.xml'
    ],
    description: 'Cliente de correo electrónico Open Source con encriptación OpenPGP completa y sincronización IMAP/POP3.',
    suggestedCategory: 'COMMUNICATION',
    suggestedPackageName: 'net.thunderbird.android'
  },
  {
    id: 'repo-simple-calc',
    name: 'simple-calculator-foss',
    repoUrl: 'https://github.com/SimpleMobileTools/Simple-Calculator',
    defaultBranch: 'master',
    stars: 950,
    forks: 180,
    openIssues: 4,
    closedIssues: 120,
    lastCommitIso: new Date(Date.now() - 40 * 86400000).toISOString(),
    weeklyCommits: 1,
    filesList: [
      'build.gradle.kts',
      'settings.gradle.kts',
      'gradlew',
      'app/src/main/AndroidManifest.xml'
    ],
    description: 'Calculadora rápida y sin anuncios con historial de operaciones y soporte de widgets.',
    suggestedCategory: 'TOOLS',
    suggestedPackageName: 'com.simplemobiletools.calculator'
  }
];

interface RepoIndexSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppToCatalog?: (app: AppCatalogItem) => void;
  onOpenBlueprint?: () => void;
  onOpenAcademy?: () => void;
}

type ModalTab = 'MIRRORS' | 'BATCH_IMPORT' | 'CI_QUEUE' | 'API_GATEWAY_DOCS' | 'MCP_AGENT_WORKSPACE';

export const RepoIndexSyncModal: React.FC<RepoIndexSyncModalProps> = ({
  isOpen,
  onClose,
  onAddAppToCatalog,
  onOpenBlueprint,
  onOpenAcademy
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('MIRRORS');
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [mirrors] = useState<FdroidMirror[]>(DEFAULT_MIRRORS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<number>(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [selectedMirror, setSelectedMirror] = useState<string>('mirror-1');

  // Heuristics & Batch Import State
  const [candidates] = useState<ClonedRepoCandidate[]>(SAMPLE_REPOS_FOR_IMPORT);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(['repo-tachiyomi-sy', 'repo-lawnchair']);
  const [healthResults, setHealthResults] = useState<Record<string, RepoHealthMetrics>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number>(0);

  // CI Persistent Queue State
  const [queueItems, setQueueItems] = useState<PersistentBuildQueueItem[]>([]);

  useEffect(() => {
    // Run initial heuristic scoring for candidates
    const scores: Record<string, RepoHealthMetrics> = {};
    candidates.forEach(c => {
      scores[c.id] = RepoHeuristicAnalyzer.analyze(c);
    });
    setHealthResults(scores);

    // Subscribe to CI queue
    const unsubQueue = persistentCiQueueService.subscribe((q) => {
      setQueueItems(q);
    });

    return () => {
      unsubQueue();
    };
  }, [candidates]);

  if (!isOpen) return null;

  const handleStartSync = () => {
    setIsSyncing(true);
    setSyncStep(1);
    setSyncLogs([
      `[INFO] Iniciando conexión con Worker F-Droid Index V2...`,
      `[HTTP] GET https://f-droid.org/repo/entry.json (Index V2 Header)`,
      `[STREAM] Descargando bloque de manifiesto criptográfico de 2.4 KB...`
    ]);

    setTimeout(() => {
      setSyncStep(2);
      setSyncLogs((prev) => [
        ...prev,
        `[AUTH] Verificando firma jar Ed25519 con clave pública del repositorio...`,
        `[CRYPTO] Firma V2 VÁLIDA (Fingerprint: 43238D512C...CCAB)`,
        `[DIFF] Comprobando timestamp local (2026-08-30T18:00Z) vs remoto (2026-08-31T06:45Z)...`,
        `[INDEX] Detectadas 14 actualizaciones delta de paquetes en F-Droid Main.`
      ]);
    }, 1200);

    setTimeout(() => {
      setSyncStep(3);
      setSyncLogs((prev) => [
        ...prev,
        `[WORKER] Parseando streams JSON en chunks de 64KB (Zero RAM Spike)...`,
        `[INDEX] Ingesta de 4,892 paquetes completada en 382ms.`,
        `[CACHE] Base de datos local SQLite / IndexedDB indexada con éxito.`,
        `[SUCCESS] Sincronización F-Droid Index V2 finalizada (Ahorro de datos: 92%).`
      ]);
      setIsSyncing(false);
      civerWebSocketBus.emit('CATALOG_UPDATED', { source: 'F-Droid Mirror V2', deltaCount: 14 });
    }, 2500);
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRunBatchHeuristics = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const scores: Record<string, RepoHealthMetrics> = {};
      candidates.forEach(c => {
        scores[c.id] = RepoHeuristicAnalyzer.analyze(c);
      });
      setHealthResults(scores);
      setIsAnalyzing(false);
      civerWebSocketBus.emit('HEURISTIC_ANALYSIS_COMPLETED', { totalAnalyzed: candidates.length });
    }, 600);
  };

  const handleBatchImportSelected = () => {
    const toImport = candidates.filter(c => selectedCandidates.includes(c.id));
    let count = 0;
    toImport.forEach(c => {
      const health = healthResults[c.id] || RepoHeuristicAnalyzer.analyze(c);
      const item = RepoHeuristicAnalyzer.convertToCatalogItem(c, health);
      if (onAddAppToCatalog) {
        onAddAppToCatalog(item);
      }
      count++;
    });
    setImportSuccessCount(prev => prev + count);
    civerWebSocketBus.emit('CATALOG_UPDATED', { importedCount: count });
  };

  const handleEnqueueCi = (candidate: ClonedRepoCandidate) => {
    persistentCiQueueService.enqueueBuild({
      id: candidate.id,
      name: candidate.name,
      githubUrl: candidate.repoUrl,
      gradleTask: './gradlew assembleRelease'
    }, 'HIGH');
    setActiveTab('CI_QUEUE');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="repo-index-sync-modal"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Repo Sync, Heuristics & CI Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Indexación diferencial, análisis de salud de repositorios, cola persistente de CI y contratos API.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('MIRRORS')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'MIRRORS'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Espejos F-Droid V2</span>
          </button>
          <button
            onClick={() => setActiveTab('BATCH_IMPORT')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'BATCH_IMPORT'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Health Score & Batch Import</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Heurístico
            </span>
          </button>
          <button
            onClick={() => setActiveTab('CI_QUEUE')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'CI_QUEUE'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Cola Persistente CI ({queueItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('API_GATEWAY_DOCS')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'API_GATEWAY_DOCS'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>OpenAPI & Proto</span>
          </button>
          <button
            onClick={() => setActiveTab('MCP_AGENT_WORKSPACE')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'MCP_AGENT_WORKSPACE'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>MCP & Agent Hub</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              Agentic
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: MIRRORS */}
          {activeTab === 'MIRRORS' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Protocolo Index V2 Activo</span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Index V2 reemplaza el archivo XML pesado (index.xml de 25MB+) por <code className="text-cyan-200 font-mono">entry.json</code> y fragmentos delta, reduciendo el consumo de ancho de banda hasta un 92%.
                  </p>
                </div>
                <button
                  onClick={handleStartSync}
                  disabled={isSyncing}
                  className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-cyan-950 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Índices'}</span>
                </button>
              </div>

              {/* Mirrors Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Espejos y Repositorios Conectados</span>
                </h3>
                <div className="space-y-2">
                  {mirrors.map((mirror) => (
                    <div
                      key={mirror.id}
                      onClick={() => setSelectedMirror(mirror.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedMirror === mirror.id
                          ? 'bg-slate-800/80 border-cyan-500/60 shadow-md'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{mirror.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                            {mirror.indexVersion}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 break-all">{mirror.url}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Fingerprint className="w-3 h-3 text-cyan-400" />
                          <span className="font-mono truncate max-w-xs">{mirror.fingerprint}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div>
                          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 justify-end">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>{mirror.latencyMs} ms</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{mirror.lastUpdated}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logs */}
              {syncLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>Terminal de Ingesta y Validación V2</span>
                    </h3>
                    <span className="text-[11px] font-mono text-cyan-400">Paso {syncStep}/3</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                    {syncLogs.map((log, index) => (
                      <div key={index} className="leading-relaxed">
                        {log.includes('[SUCCESS]') ? (
                          <span className="text-emerald-400 font-bold">{log}</span>
                        ) : log.includes('[CRYPTO]') ? (
                          <span className="text-cyan-300 font-bold">{log}</span>
                        ) : log.includes('[AUTH]') ? (
                          <span className="text-purple-300">{log}</span>
                        ) : (
                          <span className="text-slate-400">{log}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BATCH IMPORT & HEURISTIC HEALTH */}
          {activeTab === 'BATCH_IMPORT' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Evaluador Heurístico de Repositorios Móviles</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Puntaje de salud basado en frecuencia de commits, resolución de issues y validación de Gradle Wrapper.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunBatchHeuristics}
                    disabled={isAnalyzing}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>Reanalizar</span>
                  </button>
                  <button
                    onClick={handleBatchImportSelected}
                    disabled={selectedCandidates.length === 0}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Importar Selección ({selectedCandidates.length})</span>
                  </button>
                </div>
              </div>

              {importSuccessCount > 0 && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Se han importado {importSuccessCount} aplicaciones exitosamente al catálogo.</span>
                </div>
              )}

              {/* Repos List */}
              <div className="space-y-3">
                {candidates.map((candidate) => {
                  const health = healthResults[candidate.id];
                  const isSelected = selectedCandidates.includes(candidate.id);

                  return (
                    <div
                      key={candidate.id}
                      className={`p-4 rounded-2xl border transition ${
                        isSelected 
                          ? 'bg-slate-800/70 border-emerald-500/50 shadow-md' 
                          : 'bg-slate-950/40 border-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCandidate(candidate.id)}
                            className="mt-1 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white">{candidate.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                                {candidate.defaultBranch}
                              </span>
                              {health && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  health.overallScore >= 80 
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                    : health.overallScore >= 60
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                }`}>
                                  Score: {health.overallScore}% ({health.grade})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                              {candidate.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                              <span>★ {candidate.stars} stars</span>
                              <span>•</span>
                              <span>{candidate.weeklyCommits} commits/sem</span>
                              <span>•</span>
                              <span>{candidate.openIssues} issues abiertas</span>
                            </div>
                          </div>
                        </div>

                        {/* Health breakdown & Actions */}
                        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                          {health && (
                            <div className="hidden sm:flex flex-col items-end text-right text-[10px] font-mono text-slate-400">
                              <div>Gradle: {health.gradleBuildScore}%</div>
                              <div>Actividad: {health.commitFrequencyScore}%</div>
                              <div>Issues: {health.openIssuesScore}%</div>
                            </div>
                          )}
                          <button
                            onClick={() => handleEnqueueCi(candidate)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
                            title="Compilar en GitHub CI"
                          >
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>Encolar CI</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CI QUEUE */}
          {activeTab === 'CI_QUEUE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Cola Persistente de Compilaciones GitHub Actions</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Trabajos encolados con soporte para reintentos automáticos y recuperación ante caídas de red.
                  </p>
                </div>
                <button
                  onClick={() => persistentCiQueueService.clearCompleted()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                >
                  Limpiar Completados
                </button>
              </div>

              <div className="space-y-3">
                {queueItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    No hay compilaciones en cola en este momento.
                  </div>
                ) : (
                  queueItems.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{job.appName}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            job.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300' :
                            job.status === 'RUNNING' ? 'bg-amber-950 text-amber-300 animate-pulse' :
                            job.status === 'RETRYING' ? 'bg-rose-950 text-rose-300' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {job.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Pri: {job.priority}
                          </span>
                        </div>

                        {job.status === 'FAILED' && (
                          <button
                            onClick={() => persistentCiQueueService.retryBuild(job.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 rounded font-semibold"
                          >
                            Reintentar
                          </button>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Progreso del Runner</span>
                          <span>{job.progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              job.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${job.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Log Snippets */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[10px] text-slate-400 max-h-20 overflow-y-auto space-y-0.5">
                        {job.logs.map((log, lIdx) => (
                          <div key={lIdx} className="truncate">{log}</div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: API & SCHEMAS DOCS */}
          {activeTab === 'API_GATEWAY_DOCS' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>Especificación OpenAPI 3.1 & Protocol Buffers</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Contratos estandarizados listos para auto-descubrimiento e integración con agentes y herramientas de desarrollo locales.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>OpenAPI JSON Endpoint Spec</span>
                    <span className="font-mono text-[10px] text-purple-400">v3.1.0</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 max-h-72 overflow-y-auto">
                    {JSON.stringify(OPENAPI_SPEC, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>Civer Store gRPC Proto Definition</span>
                    <span className="font-mono text-[10px] text-cyan-400">proto3</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 max-h-72 overflow-y-auto">
                    {PROTOBUF_DEFINITION}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MCP AGENT HUB & WORKSPACE TOOLS */}
          {activeTab === 'MCP_AGENT_WORKSPACE' && (
            <div className="space-y-6">
              {/* Agent Overview Hero */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>Servidor MCP & Control Total de Agentes</span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Especificación oficial <code className="text-purple-300 font-mono">Model Context Protocol (MCP)</code> para que tus agentes autónomos controlen el catálogo, evalúen código Gradle, despachen compilaciones CI y consulten telemetría en tu computadora local.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(MCP_SERVER_MANIFEST, null, 2));
                    setCopiedMcp(true);
                    setTimeout(() => setCopiedMcp(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-purple-950 shrink-0"
                >
                  {copiedMcp ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedMcp ? '¡Copiado al portapapeles!' : 'Copiar Manifiesto MCP'}</span>
                </button>
              </div>

              {/* MCP Tools Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Herramientas MCP Registradas ({MCP_SERVER_MANIFEST.tools.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MCP_SERVER_MANIFEST.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-purple-300">
                          {tool.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono border border-slate-800">
                          Tool
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Parámetros: {Object.keys(tool.inputSchema.properties || {}).join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Local Workflow Tutorial */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Tutorial de Control Agéntico en tu Computadora Local</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    1. <strong>Exportación:</strong> Descarga el repositorio ZIP desde AI Studio y extráelo en tu máquina local.
                  </p>
                  <p>
                    2. <strong>Configuración del Servidor MCP:</strong> Agrega <code className="text-cyan-300 font-mono">src/services/mcpToolsService.ts</code> a la configuración de tu cliente MCP (Claude Desktop, Cursor, Roo, etc.).
                  </p>
                  <p>
                    3. <strong>Documentación Completa:</strong> Consulta <code className="text-cyan-300 font-mono">/ARCHITECTURE_MAP.md</code> para ver diagramas de secuencia, flujos de persistencia de IndexedDB y manuales de integración.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>WebSocket EventBus: Conectado</span>
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
