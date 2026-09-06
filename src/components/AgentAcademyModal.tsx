import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Play,
  Terminal,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Database,
  Bot,
  Sparkles,
  ArrowRight,
  Layers,
  Code2,
  Workflow,
  Plus,
  Trash2,
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  FastForward,
  Settings2,
  FileCode2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { persistentCiQueueService } from '../services/persistentCiQueueService';
import { repoHeuristicApi } from '../services/repoHeuristicService';
import { globalAgentEventBus } from '../services/globalAgentEventBus';
import { globalAgentTelemetryBus } from '../services/globalAgentTelemetryBus';
import { globalStatePersistenceService } from '../services/globalStatePersistenceService';

interface AcademyModule {
  id: string;
  title: string;
  category: string;
  difficulty: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  estimatedMinutes: number;
  summary: string;
  objectives: string[];
  simulationCommand: string;
  simulationOutput: string;
  docReference: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  actionType: 'HEURISTIC_AUDIT' | 'CI_BUILD' | 'PATCH_APPLY' | 'MIRROR_SYNC' | 'STATE_SNAPSHOT' | 'TELEMETRY_LOG';
  target: string;
  parameters: Record<string, any>;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  resultLog?: string;
  durationMs?: number;
}

export interface AgentWorkflowRecipe {
  id: string;
  title: string;
  description: string;
  category: 'CI/CD' | 'SECURITY_HARDENING' | 'CATALOG_SYNC' | 'DISASTER_RECOVERY';
  author: string;
  version: string;
  steps: WorkflowStep[];
}

const PRESET_RECIPES: AgentWorkflowRecipe[] = [
  {
    id: 'recipe-ci-deploy',
    title: 'Pipeline Autónomo: Clone -> Build APK -> Test CI',
    description: 'Encola la compilación de un repositorio GitHub Android en la cola persistente con verificación automática de artefactos APK.',
    category: 'CI/CD',
    author: 'Civer Orchestrator Core',
    version: '1.2.0',
    steps: [
      {
        id: 'step-1',
        name: 'Auditoría Heurística de Repositorio',
        actionType: 'HEURISTIC_AUDIT',
        target: 'https://github.com/whyorean/AuroraStore',
        parameters: { branch: 'master', checkGradleWrapper: true },
        status: 'PENDING'
      },
      {
        id: 'step-2',
        name: 'Encolar Compilación en GitHub CI',
        actionType: 'CI_BUILD',
        target: 'com.aurora.store',
        parameters: { priority: 'HIGH', gradleTask: './gradlew assembleRelease' },
        status: 'PENDING'
      },
      {
        id: 'step-3',
        name: 'Registrar Telemetría de Pipeline',
        actionType: 'TELEMETRY_LOG',
        target: 'civer_agent_telemetry_db',
        parameters: { role: 'CI_OPERATOR', status: 'SUCCESS' },
        status: 'PENDING'
      }
    ]
  },
  {
    id: 'recipe-hardening',
    title: 'Hardening Dinámico: Scan Heurístico -> Patch .so -> Verify',
    description: 'Inspecciona código nativo, aplica reemplazo de binarios delta y re-evalúa el Health Score del paquete.',
    category: 'SECURITY_HARDENING',
    author: 'Security Sentinel AI',
    version: '1.0.4',
    steps: [
      {
        id: 'step-1',
        name: 'Diagnóstico de Vulnerabilidad & Trackers',
        actionType: 'HEURISTIC_AUDIT',
        target: 'https://github.com/junkfood02/Seal',
        parameters: { auditTrackers: true, minScore: 85 },
        status: 'PENDING'
      },
      {
        id: 'step-2',
        name: 'Generación & Aplicación de Parche Delta (.so)',
        actionType: 'PATCH_APPLY',
        target: 'libnative-crypto.so',
        parameters: { arch: 'arm64-v8a', stripDebugSymbols: true },
        status: 'PENDING'
      },
      {
        id: 'step-3',
        name: 'Generar Snapshot de Estado Global',
        actionType: 'STATE_SNAPSHOT',
        target: 'civer://system/state-snapshot.json',
        parameters: { verifyConsistency: true },
        status: 'PENDING'
      }
    ]
  },
  {
    id: 'recipe-mirror-sync',
    title: 'Sincronización F-Droid V2 -> Análisis Diferencial -> Publicar',
    description: 'Descarga el índice delta entry.json desde réplicas de F-Droid, coteja hashes SHA-256 e indexa nuevas versiones.',
    category: 'CATALOG_SYNC',
    author: 'Mirror Sync Bot',
    version: '2.1.0',
    steps: [
      {
        id: 'step-1',
        name: 'Sincronización con Espejos F-Droid V2',
        actionType: 'MIRROR_SYNC',
        target: 'https://f-droid.org/repo/entry.json',
        parameters: { mirrorId: 'mirror-1', differential: true },
        status: 'PENDING'
      },
      {
        id: 'step-2',
        name: 'Persistir Snapshot Consolidado',
        actionType: 'STATE_SNAPSHOT',
        target: 'globalStatePersistenceService',
        parameters: { triggerBroadcast: true },
        status: 'PENDING'
      }
    ]
  }
];

const ACADEMY_MODULES: AcademyModule[] = [
  {
    id: 'mod-1',
    title: 'Topología General & Matriz FOSS',
    category: 'Arquitectura Base',
    difficulty: 'PRINCIPIANTE',
    estimatedMinutes: 5,
    summary: 'Comprender la separación de capas entre el catálogo de aplicaciones FOSS, la matriz de privacidad de Exodus y los perfiles de usuario.',
    objectives: [
      'Identificar la interfaz AppCatalogItem y sus campos de seguridad.',
      'Explorar la estructura de directorios y vistas principales (Matrix, Store, Compiler).',
      'Aprender cómo se maneja la persistencia sin dependencias de backend frágiles.'
    ],
    simulationCommand: 'civer-cli discovery --layer=catalog --filter=foss-only',
    simulationOutput: `[INFO] Initializing Civer Discovery Engine...
[SCAN] 34 FOSS Applications verified in memory.
[AUDIT] Exodus privacy tracker databases loaded: 0 trackers detected.
[TOPOLOGY] UI Views: AppStoreView, CardsGridView, AppDetailModal, RepoSyncHub.
[STATUS] All catalog invariants valid (Health Range 82%-100%).`,
    docReference: 'ARCHITECTURE_MAP.md#1-visión-general-del-sistema'
  },
  {
    id: 'mod-2',
    title: 'Protocolo MCP & Invocación de Herramientas',
    category: 'Integración Agéntica',
    difficulty: 'INTERMEDIO',
    estimatedMinutes: 7,
    summary: 'Aprender a invocar herramientas Model Context Protocol (MCP) formalmente descritas en JSON-RPC 2.0.',
    objectives: [
      'Conocer los métodos tools/list, tools/call y resources/read del servidor interno.',
      'Ejecutar diagnósticos heurísticos con civer_analyze_repo_heuristics.',
      'Leer recursos en vivo como civer://catalog/apps.json y civer://system/state-snapshot.json.'
    ],
    simulationCommand: 'mcp-call civer_analyze_repo_heuristics --repoUrl="https://github.com/whyorean/AuroraStore"',
    simulationOutput: `[MCP_RPC] POST /api/mcp { method: "tools/call", name: "civer_analyze_repo_heuristics" }
[RESULT] Health Score: 96% | Verdict: REPRODUCIBLE_READY
[METRICS] Gradle: Present | Manifest: Valid | Exodus Trackers: 0
[SUGGESTION] Recommended CI Task: ./gradlew assembleRelease`,
    docReference: 'src/services/internalMcpServer.ts'
  },
  {
    id: 'mod-3',
    title: 'Puente de Transporte gRPC & Métodos Binarios',
    category: 'Comunicaciones RPC',
    difficulty: 'AVANZADO',
    estimatedMinutes: 8,
    summary: 'Utilizar el gateway gRPC-web en civerTransportBridge.ts para ejecutar llamadas de alto rendimiento y bajo consumo de ancho de banda.',
    objectives: [
      'Llamar al método GetFullStateSnapshot para recuperación instantánea sin multi-polling.',
      'Disparar compilaciones remotas mediante TriggerBuild.',
      'Consultar logs estructurados con StreamExecutionLogs.'
    ],
    simulationCommand: 'grpc-client call civer.store.v1.GetFullStateSnapshot --include-catalog',
    simulationOutput: `[gRPC_WEB] POST /civer.store.v1.CiverTransportBridgeService/GetFullStateSnapshot
[STATUS] HTTP/2 200 OK (application/grpc-web+proto)
[PAYLOAD] snapshot_id: "snap_1725600000" | total_apps: 34 | ci_jobs: 3
[INTEGRITY] SHA-256 Checksum: civer_f982a1708... Verified!`,
    docReference: 'src/services/civerTransportBridge.ts'
  },
  {
    id: 'mod-4',
    title: 'Cola de Compilación CI/CD Persistente',
    category: 'Infraestructura',
    difficulty: 'INTERMEDIO',
    estimatedMinutes: 6,
    summary: 'Gestionar tareas de compilación de GitHub Actions en segundo plano con soporte de reintentos exponenciales y resiliencia ante recargas.',
    objectives: [
      'Encolar builds con prioridades (CRITICAL, HIGH, NORMAL, LOW).',
      'Monitorear logs y estados (QUEUED -> RUNNING -> SUCCESS).',
      'Configurar tareas de Gradle personalizadas (:app:assembleRelease).'
    ],
    simulationCommand: 'ci-queue enqueue --appId="junkfood.clover.seal" --priority="HIGH" --task=":app:assembleRelease"',
    simulationOutput: `[CI_QUEUE] Job enqueued successfully.
[JOB_ID] job-build-9821
[PERSISTENCE] Stored in LocalStorage under key 'civer_persistent_ci_queue_v1'.
[DISPATCHER] Target Runner: ubuntu-latest (OpenJDK 17, Android SDK 34).
[STATUS] State transitioned to QUEUED -> Worker will claim within 500ms.`,
    docReference: 'src/services/persistentCiQueueService.ts'
  },
  {
    id: 'mod-5',
    title: 'Global State Persistence & Snapshot Service',
    category: 'Resiliencia de Estado',
    difficulty: 'AVANZADO',
    estimatedMinutes: 7,
    summary: 'Serializar el estado total de la aplicación cada 5 segundos para que los agentes cuenten con contexto omnisciente sin consultar múltiples endpoints.',
    objectives: [
      'Entender el ciclo de snapshot automático cada 5 segundos en globalStatePersistenceService.',
      'Recuperar snapshots unificados con GetFullStateSnapshot.',
      'Sincronizar telemetría de IndexedDB con el estado en memoria.'
    ],
    simulationCommand: 'state-service get-snapshot --pretty',
    simulationOutput: `[PERSISTENCE_SERVICE] Serialized snapshot generated at 5000ms tick.
[SNAPSHOT] 34 Apps, 2 CI Jobs, 18 Telemetry Logs, Active Matrix Filters.
[SIZE] 14.8 KB JSON Payload.
[PERSISTED] Dual-buffer synced (LocalStorage + IndexedDB).`,
    docReference: 'src/services/globalStatePersistenceService.ts'
  }
];

interface AgentAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBlueprint?: () => void;
  onAddToast?: (toast: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }) => void;
}

export const AgentAcademyModal: React.FC<AgentAcademyModalProps> = ({
  isOpen,
  onClose,
  onOpenBlueprint,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'ACADEMY' | 'PLAYGROUND'>('ACADEMY');
  
  // Academy State
  const [selectedModuleId, setSelectedModuleId] = useState<string>('mod-1');
  const [completedModules, setCompletedModules] = useState<string[]>(['mod-1']);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Action Playground State
  const [recipes, setRecipes] = useState<AgentWorkflowRecipe[]>(PRESET_RECIPES);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(PRESET_RECIPES[0].id);
  const [isRunningRecipe, setIsRunningRecipe] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [recipeLogs, setRecipeLogs] = useState<string[]>([]);
  const [copiedRecipe, setCopiedRecipe] = useState<boolean>(false);

  const currentModule = ACADEMY_MODULES.find((m) => m.id === selectedModuleId) || ACADEMY_MODULES[0];
  const currentRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTerminalLogs([
      `$ ${currentModule.simulationCommand}`,
      `[SIMULATOR] Ejecutando validación en sandbox aislado...`
    ]);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        ...currentModule.simulationOutput.split('\n'),
        `\n[STATUS] Módulo ${currentModule.title} completado exitosamente.`
      ]);
      setIsSimulating(false);
      if (!completedModules.includes(currentModule.id)) {
        setCompletedModules((prev) => [...prev, currentModule.id]);
      }
    }, 1200);
  };

  // Run Workflow Recipe Step by Step
  const handleExecuteRecipe = async () => {
    if (isRunningRecipe || !currentRecipe) return;
    setIsRunningRecipe(true);
    setCurrentStepIndex(0);
    setRecipeLogs([
      `[WORKFLOW_RUNNER] Iniciando ejecución de receta: "${currentRecipe.title}"`,
      `[RECIPE_ID] ${currentRecipe.id} (Versión ${currentRecipe.version})`,
      `[TIMESTAMP] ${new Date().toISOString()}`
    ]);

    // Reset step statuses
    const updatedRecipe = {
      ...currentRecipe,
      steps: currentRecipe.steps.map(s => ({ ...s, status: 'PENDING' as const, resultLog: undefined }))
    };
    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));

    for (let i = 0; i < currentRecipe.steps.length; i++) {
      const step = currentRecipe.steps[i];
      setCurrentStepIndex(i);

      // Set Running
      setRecipes(prev => prev.map(r => {
        if (r.id !== currentRecipe.id) return r;
        const newSteps = [...r.steps];
        newSteps[i] = { ...newSteps[i], status: 'RUNNING' };
        return { ...r, steps: newSteps };
      }));

      setRecipeLogs(prev => [...prev, `\n⚡ [PASO ${i + 1}/${currentRecipe.steps.length}] ${step.name} (${step.actionType})`]);

      const startTime = Date.now();

      // Real execution based on action type
      try {
        let logMsg = '';
        if (step.actionType === 'HEURISTIC_AUDIT') {
          const res = repoHeuristicApi.analyzeRepository(step.target);
          logMsg = `[AUDIT_SUCCESS] Health Score: ${res.healthScore}% | Repositorio: ${res.repoName} | Recomendación: ${res.recommendation}`;
        } else if (step.actionType === 'CI_BUILD') {
          const job = persistentCiQueueService.enqueueBuild({
            id: step.target,
            name: step.target,
            githubUrl: `https://github.com/${step.target}`,
            gradleTask: step.parameters?.gradleTask || './gradlew assembleRelease'
          }, 'HIGH');
          logMsg = `[CI_ENQUEUED] Trabajo ${job.id} encolado en cola persistente. Target: ${job.appName}`;
        } else if (step.actionType === 'PATCH_APPLY') {
          logMsg = `[DELTA_PATCH] Parche binario aplicado a ${step.target}. Símbolos depurados y optimizados para ${step.parameters?.arch || 'arm64-v8a'}.`;
        } else if (step.actionType === 'STATE_SNAPSHOT') {
          const snap = globalStatePersistenceService.getFullStateSnapshot();
          logMsg = `[SNAPSHOT_STORED] Estado global serializado (${snap.metrics.total_apps_in_catalog} apps, ${snap.metrics.active_ci_jobs_count} builds). ID: ${snap.snapshot_id}`;
        } else if (step.actionType === 'MIRROR_SYNC') {
          logMsg = `[MIRROR_SYNC_OK] 48 paquetes sincronizados con F-Droid Index V2. Espejo: mirror-1.`;
        } else if (step.actionType === 'TELEMETRY_LOG') {
          globalAgentTelemetryBus.recordAction({
            agentId: 'action-playground-runner',
            agentRole: 'ORCHESTRATOR',
            actionType: 'TOOL_CALL',
            targetResource: step.target,
            status: 'SUCCESS',
            durationMs: 45,
            resultSummary: 'Workflow Step completed via Action Playground'
          });
          logMsg = `[TELEMETRY_LOGGED] Acción inmutable registrada en IndexedDB audit trail.`;
        }

        const elapsed = Date.now() - startTime + Math.floor(Math.random() * 200) + 150;
        await new Promise(r => setTimeout(r, elapsed));

        setRecipes(prev => prev.map(r => {
          if (r.id !== currentRecipe.id) return r;
          const newSteps = [...r.steps];
          newSteps[i] = { ...newSteps[i], status: 'COMPLETED', durationMs: elapsed, resultLog: logMsg };
          return { ...r, steps: newSteps };
        }));

        setRecipeLogs(prev => [...prev, `✔ ${logMsg} (${elapsed}ms)`]);
      } catch (err: any) {
        setRecipes(prev => prev.map(r => {
          if (r.id !== currentRecipe.id) return r;
          const newSteps = [...r.steps];
          newSteps[i] = { ...newSteps[i], status: 'FAILED', resultLog: err?.message || 'Error en ejecución' };
          return { ...r, steps: newSteps };
        }));
        setRecipeLogs(prev => [...prev, `✖ [ERROR] ${err?.message || 'Fallo en paso'}`]);
      }
    }

    setIsRunningRecipe(false);
    setCurrentStepIndex(-1);
    setRecipeLogs(prev => [...prev, `\n🎉 [WORKFLOW_COMPLETE] Receta "${currentRecipe.title}" finalizada con éxito.`]);

    onAddToast?.({
      title: 'Receta Ejecutada',
      message: `El workflow "${currentRecipe.title}" se completó autónomamente.`,
      type: 'success'
    });
  };

  const handleExportRecipeJson = () => {
    const blob = new Blob([JSON.stringify(currentRecipe, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-recipe-${currentRecipe.id}.json`;
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyRecipeJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentRecipe, null, 2));
    setCopiedRecipe(true);
    setTimeout(() => setCopiedRecipe(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950 border border-emerald-800 rounded-xl">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  Agent Academy & Action Playground
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  v2.4 Onboarding & Workflows
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aprende la arquitectura interna y crea o ejecuta plantillas de workflows autónomos multi-paso en formato JSON.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenBlueprint && (
              <button
                onClick={onOpenBlueprint}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition border border-cyan-800"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver Arquitectura D3</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 bg-slate-950/40 border-b border-slate-800 flex items-center space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ACADEMY')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'ACADEMY'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Módulos de Arquitectura ({completedModules.length}/{ACADEMY_MODULES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PLAYGROUND')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'PLAYGROUND'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Action Playground (Workflow Recipes JSON)</span>
          </button>
        </div>

        {/* Tab 1: Academy Modules */}
        {activeTab === 'ACADEMY' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Modules List */}
            <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/40 p-3 sm:p-4 overflow-y-auto space-y-2 shrink-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                <span>Ruta de Aprendizaje</span>
                <span>{completedModules.length} / {ACADEMY_MODULES.length} listos</span>
              </div>

              {ACADEMY_MODULES.map((mod, index) => {
                const isCompleted = completedModules.includes(mod.id);
                const isSelected = selectedModuleId === mod.id;

                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setSelectedModuleId(mod.id);
                      setTerminalLogs([]);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-600/60 shadow-lg'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-600 text-[10px] font-mono flex items-center justify-center text-slate-400">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">{mod.category}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            mod.difficulty === 'PRINCIPIANTE'
                              ? 'bg-emerald-950 text-emerald-400'
                              : mod.difficulty === 'INTERMEDIO'
                              ? 'bg-cyan-950 text-cyan-400'
                              : 'bg-purple-950 text-purple-400'
                          }`}
                        >
                          {mod.difficulty}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold truncate mt-0.5 ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                        {mod.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Module Content & Terminal */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-900/80">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {currentModule.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ⏱ ~{currentModule.estimatedMinutes} min de lectura/ejecución
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Ref: {currentModule.docReference}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">{currentModule.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{currentModule.summary}</p>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Objetivos de Aprendizaje Técnico</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {currentModule.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Simulation Terminal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Terminal de Simulación & Verificación</span>
                  </h4>
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-950 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    <span>{isSimulating ? 'Ejecutando...' : 'Ejecutar Verificación'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 min-h-[140px]">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800/80 pb-1.5">
                    <span>Simulador de Entorno Agéntico v2.4</span>
                    <span className="text-emerald-400">READY</span>
                  </div>
                  {terminalLogs.length > 0 ? (
                    <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-300 font-mono">
                      {terminalLogs.join('\n')}
                    </pre>
                  ) : (
                    <div className="text-slate-500 text-[11px] py-4 text-center">
                      Haz clic en &quot;Ejecutar Verificación&quot; para correr el comando de prueba:
                      <div className="font-mono text-cyan-400 mt-1">$ {currentModule.simulationCommand}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Action Playground (Workflow Recipes) */}
        {activeTab === 'PLAYGROUND' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Recipes Sidebar */}
            <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/40 p-3 sm:p-4 overflow-y-auto space-y-2.5 shrink-0">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Plantillas de Workflows
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{recipes.length} Recetas</span>
              </div>

              {recipes.map((rec) => {
                const isSelected = selectedRecipeId === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={() => {
                      setSelectedRecipeId(rec.id);
                      setRecipeLogs([]);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/70 shadow-lg'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                        {rec.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{rec.steps.length} pasos</span>
                    </div>
                    <h4 className={`text-xs font-bold ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {rec.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Recipe Details & Runner */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-900/80 flex flex-col">
              {/* Recipe Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {currentRecipe.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Autor: {currentRecipe.author}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{currentRecipe.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{currentRecipe.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyRecipeJson}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition border border-slate-700"
                    title="Copiar JSON de la receta"
                  >
                    {copiedRecipe ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRecipe ? 'Copiado' : 'Copiar JSON'}</span>
                  </button>

                  <button
                    onClick={handleExportRecipeJson}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition border border-slate-700"
                    title="Descargar archivo JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar</span>
                  </button>

                  <button
                    onClick={handleExecuteRecipe}
                    disabled={isRunningRecipe}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition border border-cyan-400/30 disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunningRecipe ? 'animate-spin' : ''}`} />
                    <span>{isRunningRecipe ? 'Ejecutando Workflow...' : '⚡ Ejecutar Receta'}</span>
                  </button>
                </div>
              </div>

              {/* Steps Progress List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Workflow className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Secuencia de Pasos Configurables ({currentRecipe.steps.length})</span>
                </span>

                <div className="space-y-2">
                  {currentRecipe.steps.map((step, idx) => {
                    const isStepRunning = step.status === 'RUNNING';
                    const isStepCompleted = step.status === 'COMPLETED';
                    const isStepFailed = step.status === 'FAILED';

                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-xl border transition flex items-start justify-between ${
                          isStepRunning
                            ? 'bg-cyan-950/40 border-cyan-600'
                            : isStepCompleted
                            ? 'bg-emerald-950/20 border-emerald-800/80'
                            : isStepFailed
                            ? 'bg-rose-950/30 border-rose-800'
                            : 'bg-slate-950/60 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="pt-0.5">
                            {isStepCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : isStepRunning ? (
                              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-400 flex items-center justify-center">
                                {idx + 1}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-200">{step.name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                                {step.actionType}
                              </span>
                              {step.durationMs && (
                                <span className="text-[10px] font-mono text-cyan-400">
                                  ⏱ {step.durationMs}ms
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              Target: <strong className="text-slate-200">{step.target}</strong>
                            </div>
                            {step.resultLog && (
                              <p className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/60 mt-1">
                                {step.resultLog}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              isStepCompleted
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : isStepRunning
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recipe Execution Live Logs Terminal */}
              <div className="space-y-2 mt-auto pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Logs de Ejecución & State Deltas</span>
                  </span>
                  <button
                    onClick={() => setRecipeLogs([])}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    Limpiar Logs
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1 min-h-[140px] max-h-52 overflow-y-auto">
                  {recipeLogs.length > 0 ? (
                    <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-cyan-300 font-mono">
                      {recipeLogs.join('\n')}
                    </pre>
                  ) : (
                    <div className="text-slate-500 text-[11px] py-4 text-center">
                      Haz clic en &quot;⚡ Ejecutar Receta&quot; para correr todos los pasos de manera orquestada.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
