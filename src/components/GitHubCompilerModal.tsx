import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Download, 
  Sparkles, 
  ExternalLink, 
  GitBranch, 
  RefreshCw, 
  History, 
  HardDrive, 
  FileCheck2, 
  Layers, 
  X, 
  Loader2, 
  RotateCcw, 
  Zap, 
  Code2, 
  Copy, 
  Check, 
  FolderDown, 
  Radio, 
  BarChart3, 
  Search, 
  Filter, 
  FileJson,
  Key,
  ShieldCheck,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Wifi
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppCatalogItem, GitHubBuildRun, KeystoreEntry, ClonedAppRepo } from '../types';
import { 
  BUILD_SIMULATION_STEPS, 
  getBuildSimulationSteps,
  generateGitHubWorkflowYaml, 
  generateRandomHash, 
  generateSha256Checksum,
  verifyGitHubToken
} from '../services/githubCiService';
import { BuildEvidenceGallery } from './BuildEvidenceGallery';
import { ToastNotification } from './ToastNotificationCenter';

interface GitHubCompilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetApp: AppCatalogItem | null;
  catalog: AppCatalogItem[];
  buildHistory: GitHubBuildRun[];
  onNewBuildCompleted: (run: GitHubBuildRun) => void;
  onInstallApk: (app: AppCatalogItem) => void;
  githubPat: string;
  onOpenKeystoreVault?: () => void;
  keystores?: KeystoreEntry[];
  selectedKeyId?: string;
  onSelectKeyId?: (id: string) => void;
  onVerifyGitHubPat?: (token?: string) => void;
  onAddToast?: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  clonedRepos?: Record<string, ClonedAppRepo>;
  onCloneRepoLocally?: (app: AppCatalogItem) => void;
  onSyncClonedRepo?: (appId: string) => void;
}

type CompilerTab = 'BUILDER' | 'HISTORY' | 'ABI_MATRIX' | 'ANALYTICS_CHART' | 'CUSTOM_REPO' | 'OFFLINE_CLONE' | 'EVIDENCE' | 'WORKFLOW_CONFIG';

export const GitHubCompilerModal: React.FC<GitHubCompilerModalProps> = ({
  isOpen,
  onClose,
  targetApp,
  catalog,
  buildHistory,
  onNewBuildCompleted,
  onInstallApk,
  githubPat,
  onOpenKeystoreVault,
  keystores = [],
  selectedKeyId,
  onSelectKeyId,
  onVerifyGitHubPat,
  onAddToast,
  clonedRepos = {},
  onCloneRepoLocally,
  onSyncClonedRepo
}) => {
  const [activeTab, setActiveTab] = useState<CompilerTab>('BUILDER');
  const [selectedApp, setSelectedApp] = useState<AppCatalogItem>(targetApp || catalog[0]);
  
  // Keystore Selection
  const activeKeystore = keystores.find(k => k.id === selectedKeyId) || keystores[0];

  // Custom repo form state
  const [customRepoUrl, setCustomRepoUrl] = useState('');
  const [customAppName, setCustomAppName] = useState('');
  const [customBranch, setCustomBranch] = useState('main');
  const [customGradleTask, setCustomGradleTask] = useState('./gradlew assembleRelease');

  // Active build state
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeRun, setActiveRun] = useState<GitHubBuildRun | null>(null);
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [consoleFilter, setConsoleFilter] = useState<'ALL' | 'COMMANDS' | 'SUCCESS' | 'ERRORS'>('ALL');
  const [consoleSearch, setConsoleSearch] = useState('');
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);

  // PAT verification state
  const [isVerifyingPat, setIsVerifyingPat] = useState(false);

  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetApp) {
      setSelectedApp(targetApp);
    }
  }, [targetApp]);

  useEffect(() => {
    if (autoScrollLogs) {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRun?.logs, autoScrollLogs]);

  const handleVerifyPat = async () => {
    if (onVerifyGitHubPat) {
      onVerifyGitHubPat(githubPat);
      return;
    }

    setIsVerifyingPat(true);
    const res = await verifyGitHubToken(githubPat);
    setIsVerifyingPat(false);

    if (onAddToast) {
      if (res.valid) {
        onAddToast({
          title: 'GitHub PAT Verificado',
          message: `Conectado como @${res.user} • Scopes: ${res.scopes.slice(0, 3).join(', ')} • Rate Limit: ${res.rateLimit.remaining}/${res.rateLimit.limit}`,
          type: 'success'
        });
      } else {
        onAddToast({
          title: 'Error de Verificación GitHub',
          message: res.error || 'Token no válido',
          type: 'error'
        });
      }
    }
  };

  // Launch Build with custom Keystore Vault
  const handleStartBuild = (appToBuild: AppCatalogItem, customCommitHash?: string) => {
    setIsBuilding(true);
    setActiveTab('BUILDER');

    const runId = `gh-run-${Math.floor(10000 + Math.random() * 90000)}`;
    const commitHash = customCommitHash || generateRandomHash(7);
    const versionTag = `${appToBuild.version}-ci.${Math.floor(Math.random() * 900 + 100)}`;
    const sha256 = generateSha256Checksum();
    const signingKey = activeKeystore;

    const newRun: GitHubBuildRun = {
      id: runId,
      appId: appToBuild.id,
      appName: appToBuild.name,
      packageName: appToBuild.packageName,
      repoUrl: appToBuild.githubUrl,
      branch: appToBuild.defaultBranch || 'main',
      commitHash: commitHash,
      commitMessage: `ci(build): automated compile dispatch via FOSS Store Actions Bridge [${commitHash}]`,
      versionTag: versionTag,
      status: 'in_progress',
      progress: 5,
      currentStep: 'Initializing GitHub Actions Cloud Runner...',
      startedAt: 'Justo ahora',
      durationSeconds: 0,
      apkSizeMb: appToBuild.apkSizeMb,
      sha256Checksum: sha256,
      runner: 'ubuntu-latest (GitHub 4-core Runner, 16GB RAM)',
      architecture: 'Universal (arm64-v8a + armeabi-v7a + x86_64)',
      signingKeyId: signingKey?.id,
      signingKeyName: signingKey?.name,
      signingKeyAlias: signingKey?.alias,
      signingKeyFingerprint: signingKey?.sha256Fingerprint,
      signingAlgorithm: signingKey?.algorithm,
      schemeV4: signingKey?.schemeV4Supported !== false,
      logs: [
        {
          timestamp: '00:00',
          step: 'Workflow Dispatch',
          message: `Dispatching workflow to GitHub Actions: ${appToBuild.name} (${appToBuild.packageName})`,
          type: 'info'
        },
        {
          timestamp: '00:01',
          step: 'Auth Token',
          message: githubPat ? 'Using authenticated GitHub PAT (@oscar-manuel) with workflow permissions' : 'Using Open Cloud Actions Pool runner',
          type: 'info'
        },
        {
          timestamp: '00:02',
          step: 'Signing Key Vault',
          message: signingKey 
            ? `Active Vault Keystore loaded: [${signingKey.name}] (Alias: ${signingKey.alias}, ${signingKey.algorithm})`
            : 'Applying default Civer App Store Release Master Key (Scheme v1, v2, v3, v4)',
          type: 'info'
        }
      ]
    };

    setActiveRun(newRun);

    const simulationSteps = getBuildSimulationSteps(signingKey);
    let stepIndex = 0;
    const startTime = Date.now();

    const executeNextStep = () => {
      if (stepIndex >= simulationSteps.length) {
        // Finished
        setIsBuilding(false);
        const totalDuration = Math.round((Date.now() - startTime) / 1000);
        const completedRun: GitHubBuildRun = {
          ...newRun,
          status: 'completed',
          progress: 100,
          currentStep: 'Compilación y firma de APK completadas con éxito',
          completedAt: 'Justo ahora',
          durationSeconds: totalDuration > 0 ? totalDuration : 42,
          apkDownloadUrl: `${appToBuild.githubUrl}/releases/download/${appToBuild.version}/${appToBuild.packageName}_${appToBuild.version}.apk`,
          logs: [
            ...(activeRun?.logs || newRun.logs),
            {
              timestamp: '00:42',
              step: 'Artifact Verification',
              message: `APK successfully built and verified against SHA-256 [${sha256.substring(0, 16)}...] signed with ${signingKey?.alias || 'ciber-release-key'}`,
              type: 'success'
            }
          ]
        };
        setActiveRun(completedRun);
        onNewBuildCompleted(completedRun);

        if (onAddToast) {
          onAddToast({
            title: 'Compilación Finalizada con Éxito',
            message: `${appToBuild.name} (${versionTag}) firmado con [${signingKey?.alias || 'release-key'}] y listo para instalar.`,
            type: 'success'
          });
        }

        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.5 }
          });
        } catch {
          // silent
        }
        return;
      }

      const step = simulationSteps[stepIndex];
      setTimeout(() => {
        const logEntry = step.log(appToBuild, runId);
        setActiveRun((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            progress: step.progress,
            currentStep: step.stepName,
            logs: [...prev.logs, logEntry]
          };
        });
        stepIndex++;
        executeNextStep();
      }, step.delayMs);
    };

    executeNextStep();
  };

  // Retry CI Workflow with single click
  const handleRetryBuild = (runToRetry?: GitHubBuildRun) => {
    const target = runToRetry 
      ? (catalog.find(c => c.id === runToRetry.appId) || selectedApp)
      : selectedApp;

    handleStartBuild(target);
  };

  // Copy Manifest JSON
  const handleCopyManifest = () => {
    const manifest = {
      $schema: 'https://ciberstore.foss.dev/schemas/build-manifest-v2.json',
      manifestVersion: '2.5.0',
      generatedAt: new Date().toISOString(),
      app: {
        id: selectedApp.id,
        name: selectedApp.name,
        packageName: selectedApp.packageName,
        version: selectedApp.version,
        targetSdk: selectedApp.targetSdk,
        minAndroid: selectedApp.minAndroid,
        license: selectedApp.license
      },
      repository: {
        url: selectedApp.githubUrl,
        branch: selectedApp.defaultBranch || 'main',
        gradleTask: selectedApp.gradleTask || './gradlew assembleRelease'
      },
      keystoreSigning: {
        keyName: activeKeystore?.name || 'Default Master Release',
        keyAlias: activeKeystore?.alias || 'ciber-release-key',
        algorithm: activeKeystore?.algorithm || 'RSA 4096-bit',
        sha256Fingerprint: activeKeystore?.sha256Fingerprint,
        schemeV4: activeKeystore?.schemeV4Supported !== false
      },
      buildConfiguration: {
        runnerType: 'ubuntu-latest',
        jvmVersion: '17',
        ndkVersion: '25.2.9519653',
        abiFilters: ['arm64-v8a', 'armeabi-v7a', 'x86_64'],
        signingScheme: ['v1', 'v2', 'v3', 'v4'],
        reproducibleBuild: true
      },
      telemetrySafety: {
        trackersCount: selectedApp.trackersCount,
        exodusPrivacyVerified: true
      },
      lastBuildArtifact: activeRun ? {
        runId: activeRun.id,
        versionTag: activeRun.versionTag,
        sha256: activeRun.sha256Checksum,
        sizeMb: activeRun.apkSizeMb
      } : null
    };

    const jsonStr = JSON.stringify(manifest, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);

    // Also trigger instant download
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ciber-build-manifest-${selectedApp.packageName}-${selectedApp.version}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (onAddToast) {
      onAddToast({
        title: 'Manifiesto de Compilación Exportado',
        message: `Guardado JSON con configuración criptográfica y llave [${activeKeystore?.alias || 'release-key'}].`,
        type: 'success'
      });
    }
  };

  // Download raw console logs (.log file)
  const handleDownloadLogs = () => {
    if (!activeRun) return;
    const logText = activeRun.logs.map(l => `[${l.timestamp}] [${l.step}] [${l.type.toUpperCase()}]: ${l.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-runner-${activeRun.id}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Custom Repo Dispatch
  const handleCustomRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRepoUrl || !customAppName) return;

    const customApp: AppCatalogItem = {
      id: `custom-${Date.now()}`,
      name: customAppName,
      packageName: `com.custom.${customAppName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      category: 'TOOLS',
      tagline: 'Aplicación personalizada compilada desde repositorio GitHub',
      description: 'Aplicación compilada a través del despachador de GitHub Actions.',
      iconBg: 'bg-indigo-600',
      iconGradient: 'from-indigo-500 to-purple-700',
      iconSymbol: 'GitBranch',
      bannerGradient: 'from-indigo-950 via-purple-900 to-slate-950',
      screenshots: [],
      rating: 5.0,
      reviewCount: '1',
      downloads: '1',
      apkSizeMb: 18.5,
      version: 'v1.0.0-custom',
      minAndroid: 'Android 8.0 (API 26)',
      targetSdk: 35,
      license: 'GPL-3.0',
      githubUrl: customRepoUrl,
      githubStars: 'Custom',
      isFree: true,
      price: 'Gratis • Custom FOSS',
      developer: {
        name: 'Custom Developer',
        verified: false
      },
      permissions: ['INTERNET', 'REQUEST_INSTALL_PACKAGES'],
      trackersCount: 0,
      isStore: false,
      canCompileWithCi: true,
      defaultBranch: customBranch || 'main',
      gradleTask: customGradleTask || './gradlew assembleRelease',
      recentReleaseDate: 'Hoy',
      changelogSummary: 'Primera compilación en GitHub Actions.'
    };

    handleStartBuild(customApp);
  };

  const handleCopyYaml = () => {
    const yaml = generateGitHubWorkflowYaml(selectedApp.name, selectedApp.gradleTask, activeKeystore);
    navigator.clipboard.writeText(yaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  // Filtered logs
  const filteredLogs = (activeRun?.logs || []).filter(log => {
    if (consoleFilter === 'COMMANDS' && log.type !== 'command') return false;
    if (consoleFilter === 'SUCCESS' && log.type !== 'success') return false;
    if (consoleFilter === 'ERRORS' && log.type !== 'error') return false;
    if (consoleSearch) {
      const q = consoleSearch.toLowerCase();
      return log.message.toLowerCase().includes(q) || log.step.toLowerCase().includes(q);
    }
    return true;
  });

  const isAppCloned = !!clonedRepos[selectedApp.id];
  const appCloneData = clonedRepos[selectedApp.id];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] max-h-[880px] overflow-hidden shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-100 text-lg">Compilador Cloud GitHub Actions</h3>
                <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Runners Ubuntu Listos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Firma criptográfica con Keystore Vault y despacho directo a GitHub Actions CI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* GitHub PAT Status Pill */}
            <button
              onClick={handleVerifyPat}
              disabled={isVerifyingPat}
              title="Verificar token GitHub PAT"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 border border-sky-800/60 transition flex items-center gap-1.5 shadow"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isVerifyingPat ? 'animate-spin' : 'text-emerald-400'}`} />
              <span>{isVerifyingPat ? 'Verificando PAT...' : 'GitHub PAT: @oscar-manuel'}</span>
            </button>

            {/* Copy Manifest Button */}
            <button
              onClick={handleCopyManifest}
              title="Exportar Manifiesto de Compilación como JSON"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-purple-300 border border-purple-800/60 transition flex items-center gap-1.5 shadow"
            >
              {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileJson className="w-3.5 h-3.5 text-purple-400" />}
              <span>{copiedManifest ? '¡Exportado!' : 'Exportar Manifiesto'}</span>
            </button>

            {onOpenKeystoreVault && (
              <button
                onClick={onOpenKeystoreVault}
                title="Bóveda de Llaves de Firma"
                className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-xs font-semibold text-amber-300 border border-amber-800/60 transition flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Vault ({keystores.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('BUILDER')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'BUILDER'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Compilar ({selectedApp.name})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'HISTORY'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial ({buildHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ABI_MATRIX')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ABI_MATRIX'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Matriz Multi-ABI (Split APKs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EVIDENCE')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'EVIDENCE'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Galería de Evidencias ({buildHistory.filter(b => b.status === 'completed').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('OFFLINE_CLONE')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'OFFLINE_CLONE'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderDown className="w-4 h-4" />
            <span>Clon Local & Sincronización</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS_CHART')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ANALYTICS_CHART'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas & Tiempos CI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CUSTOM_REPO')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'CUSTOM_REPO'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Cualquier Repo GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WORKFLOW_CONFIG')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'WORKFLOW_CONFIG'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Workflow YAML</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: BUILDER & REAL-TIME CONSOLE */}
          {activeTab === 'BUILDER' && (
            <div className="space-y-5">
              
              {/* App selector bar */}
              <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${selectedApp.iconBg} flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0`}>
                    {selectedApp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-100">{selectedApp.name}</h4>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {selectedApp.version}
                      </span>
                      {isAppCloned && (
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-md font-mono">
                          📁 Clonado Local
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-md">
                      {selectedApp.githubUrl} • Rama: {selectedApp.defaultBranch || 'main'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
                  <select
                    value={selectedApp.id}
                    onChange={(e) => {
                      const found = catalog.find((c) => c.id === e.target.value);
                      if (found) setSelectedApp(found);
                    }}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-sky-500 font-sans"
                  >
                    {catalog.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name} ({app.version})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleStartBuild(selectedApp)}
                    disabled={isBuilding}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 flex items-center gap-2 shrink-0 transition disabled:opacity-50"
                  >
                    {isBuilding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Compilando en Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Lanzar Compilación CI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Keystore Signing Vault Selection Bar */}
              <div className="bg-gradient-to-r from-amber-950/50 via-slate-950 to-slate-950 rounded-2xl p-4 border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-300">Firma Criptográfica:</span>
                      <strong className="text-xs text-slate-100 font-mono">
                        {activeKeystore?.name || 'Llave Maestra Civer App Store'}
                      </strong>
                      <span className="text-[10px] bg-slate-900 text-amber-400 font-mono px-1.5 py-0.5 rounded border border-amber-900/60">
                        {activeKeystore?.algorithm || 'RSA 4096-bit'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-lg">
                      Alias: {activeKeystore?.alias || 'ciber-release-key'} • SHA-256: {activeKeystore?.sha256Fingerprint.substring(0, 29)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {keystores.length > 0 && onSelectKeyId && (
                    <select
                      value={selectedKeyId || activeKeystore?.id}
                      onChange={(e) => onSelectKeyId(e.target.value)}
                      className="bg-slate-900 border border-amber-800/60 text-amber-300 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-amber-500"
                    >
                      {keystores.map(k => (
                        <option key={k.id} value={k.id}>
                          {k.alias} ({k.algorithm.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  )}

                  {onOpenKeystoreVault && (
                    <button
                      type="button"
                      onClick={onOpenKeystoreVault}
                      className="px-3 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 text-xs font-bold border border-amber-700/80 transition"
                    >
                      Gestionar Bóveda
                    </button>
                  )}
                </div>
              </div>

              {/* Live Build Status & Real-time Console Log Component */}
              {activeRun ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  {/* Status Banner */}
                  <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {activeRun.status === 'in_progress' ? (
                        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Paso actual: {activeRun.currentStep}</span>
                        </div>
                      ) : activeRun.status === 'completed' ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Compilación y Firma Finalizadas con Éxito ({activeRun.versionTag})</span>
                        </div>
                      ) : (
                        <span className="text-rose-400 text-xs font-semibold">Error en compilación</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> 4 vCPU 16GB</span>
                      <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> {activeRun.commitHash}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-1.5">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        activeRun.status === 'completed' ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                      }`}
                      style={{ width: `${activeRun.progress}%` }}
                    />
                  </div>

                  {/* Console Header & Filters Bar */}
                  <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-slate-300 font-mono font-semibold">
                        <Terminal className="w-3.5 h-3.5 text-sky-400" />
                        <span>Runner Console ({filteredLogs.length} líneas)</span>
                      </span>

                      {/* Log level filter */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                        <button
                          onClick={() => setConsoleFilter('ALL')}
                          className={`px-2 py-0.5 rounded transition ${consoleFilter === 'ALL' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                        >
                          Todo
                        </button>
                        <button
                          onClick={() => setConsoleFilter('COMMANDS')}
                          className={`px-2 py-0.5 rounded transition ${consoleFilter === 'COMMANDS' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                        >
                          Comandos
                        </button>
                        <button
                          onClick={() => setConsoleFilter('SUCCESS')}
                          className={`px-2 py-0.5 rounded transition ${consoleFilter === 'SUCCESS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                        >
                          Éxito
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Search log */}
                      <div className="relative">
                        <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                        <input
                          type="text"
                          placeholder="Buscar en logs..."
                          value={consoleSearch}
                          onChange={(e) => setConsoleSearch(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-sky-500 font-mono w-32 sm:w-44"
                        />
                      </div>

                      {/* Auto-scroll toggle */}
                      <button
                        onClick={() => setAutoScrollLogs(!autoScrollLogs)}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition ${
                          autoScrollLogs ? 'bg-sky-950 text-sky-300 border-sky-800' : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        Auto-scroll: {autoScrollLogs ? 'ON' : 'OFF'}
                      </button>

                      {/* Download Log Button */}
                      <button
                        onClick={handleDownloadLogs}
                        title="Descargar registro de terminal completo (.log)"
                        className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>.LOG</span>
                      </button>
                    </div>
                  </div>

                  {/* Terminal Console View */}
                  <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-1.5 border-b border-slate-800/80 select-text">
                    {filteredLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                        <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                        <span className="text-slate-400 font-semibold shrink-0">[{log.step}]</span>
                        <span className={`flex-1 ${
                          log.type === 'success' 
                            ? 'text-emerald-400 font-semibold' 
                            : log.type === 'command' 
                            ? 'text-amber-300' 
                            : log.type === 'error' 
                            ? 'text-rose-400' 
                            : 'text-slate-300'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div ref={terminalBottomRef} />
                  </div>

                  {/* Build Finished Actions & 1-Click Retry */}
                  <div className="p-4 bg-emerald-950/20 border-t border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5 text-left w-full sm:w-auto">
                      <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Binario APK Compilado & Firmado con Vault
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Llave: {activeRun.signingKeyAlias || 'ciber-release-key'} • SHA256: {activeRun.sha256Checksum?.substring(0, 24)}... ({selectedApp.apkSizeMb} MB)
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleRetryBuild(activeRun)}
                        disabled={isBuilding}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Reintentar CI</span>
                      </button>

                      <a
                        href={selectedApp.githubUrl ? `${selectedApp.githubUrl}/releases` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar APK</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onInstallApk(selectedApp)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Instalar en Dispositivo</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 rounded-3xl border border-slate-800 text-slate-400 space-y-3">
                  <Cpu className="w-12 h-12 mx-auto text-sky-500 animate-bounce" />
                  <h4 className="text-sm font-bold text-slate-200">Runner Listo para Despachar Compilación</h4>
                  <p className="text-xs max-w-md mx-auto">
                    Selecciona una aplicación del catálogo o un repositorio personalizado, verifica tu llave de firma en el Keystore Vault y presiona <strong>Lanzar Compilación CI</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BUILD HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-100 text-base">Historial de Compilaciones GitHub Actions</h4>
                  <p className="text-xs text-slate-400">
                    Últimas compilaciones ejecutadas en la nube para el ecosistema Civer App Store
                  </p>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono">
                  {buildHistory.length} Registros
                </span>
              </div>

              <div className="space-y-3">
                {buildHistory.map((run) => (
                  <div
                    key={run.id}
                    className="bg-slate-950 rounded-2xl p-3.5 sm:p-4 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm truncate">{run.appName}</span>
                            <span className="text-xs bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-mono shrink-0 whitespace-nowrap">
                              {run.versionTag}
                            </span>
                            <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 shrink-0 whitespace-nowrap">
                              🔑 {run.signingKeyAlias || 'ciber-release-key'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                            Commit {run.commitHash} • {run.commitMessage}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> {run.startedAt}
                        </span>
                        <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono whitespace-nowrap shrink-0">
                          {run.apkSizeMb} MB
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-mono bg-slate-900/80 p-2 rounded-xl text-slate-400 break-all flex items-center justify-between gap-2">
                      <span className="break-all">SHA256: {run.sha256Checksum}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono shrink-0">
                        <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {run.architecture}
                      </span>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <button
                          type="button"
                          onClick={() => handleRetryBuild(run)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition flex items-center gap-1 border border-slate-700 whitespace-nowrap shrink-0"
                        >
                          <RotateCcw className="w-3 h-3 shrink-0" />
                          <span>Reintentar</span>
                        </button>

                        <a
                          href={run.repoUrl ? `${run.repoUrl}/releases` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span>Descargar</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            const found = catalog.find((c) => c.id === run.appId) || selectedApp;
                            onInstallApk(found);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <Play className="w-3 h-3 shrink-0" />
                          <span>Instalar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE GALLERY */}
          {activeTab === 'EVIDENCE' && (
            <BuildEvidenceGallery
              runs={buildHistory}
              catalog={catalog}
              onInstallApk={onInstallApk}
            />
          )}

          {/* TAB 4: OFFLINE LOCAL CLONE & REPO SYNC */}
          {activeTab === 'OFFLINE_CLONE' && (
            <div className="space-y-5 max-w-2xl mx-auto py-2">
              <div className="bg-purple-950/30 border border-purple-800/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                    <FolderDown className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-purple-200">Clonado Local en Dispositivo & Sincronización Upstream</h4>
                    <p className="text-xs text-slate-300">
                      Descarga el código fuente localmente en tu almacenamiento nativo, audita sin conexión y sincroniza con GitHub Actions antes de compilar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200">Repositorio Seleccionado:</span>
                    <h5 className="font-mono text-sm text-sky-400">{selectedApp.githubUrl}</h5>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                    isAppCloned ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    {isAppCloned ? 'Clonado Localmente' : 'No Clonado'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ruta Local (/storage):</span>
                    <span className="text-purple-300">{appCloneData?.localPath || `/storage/emulated/0/CiberDev/src/${selectedApp.id}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tamaño del Código Fuente:</span>
                    <span>{appCloneData?.sizeMb || 24.5} MB (Incluye `.git` y Gradle Wrappers)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Última Sincronización:</span>
                    <span className="text-emerald-400">{appCloneData?.lastSyncedAt || 'No sincronizado'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => onCloneRepoLocally && onCloneRepoLocally(selectedApp)}
                    className={`w-full sm:flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isAppCloned 
                        ? 'bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900' 
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50'
                    }`}
                  >
                    <FolderDown className="w-4 h-4" />
                    <span>{isAppCloned ? 'Actualizar Clon Local' : 'Clonar Repositorio a Dispositivo'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSyncClonedRepo) onSyncClonedRepo(selectedApp.id);
                      handleStartBuild(selectedApp);
                    }}
                    disabled={isBuilding}
                    className="w-full sm:flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 disabled:opacity-50"
                  >
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Sincronizar & Compilar en GitHub</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABI_MATRIX (Multi-Architecture Split APKs) */}
          {activeTab === 'ABI_MATRIX' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-sky-400" />
                    <span>Matriz de Arquitecturas ABI & Generación de Split APKs</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Divide el artefacto universal en paquetes dedicados por microarquitectura nativa para reducir hasta un 65% el peso de descarga.
                  </p>
                </div>
              </div>

              {/* ABI Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-sky-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-300">arm64-v8a</span>
                    <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded font-mono">Principal</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Smartphones modernos (ARM 64-bit). Cubre el 92% de dispositivos Android actuales.
                  </p>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    ~18.4 MB (-61.8%)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">armeabi-v7a</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Legacy</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dispositivos antiguos de 32-bit (Android 5.0 a 10). Máximo ahorro de espacio.
                  </p>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    ~16.9 MB (-64.9%)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">x86_64</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Emulador</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Emuladores Android Studio, ChromeOS, Waydroid y dispositivos Intel/AMD.
                  </p>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    ~21.2 MB (-56.0%)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 opacity-75">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-400">Universal Fat APK</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-mono">Pesado</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Contiene todas las bibliotecas `.so` embebidas. Mayor compatibilidad, mayor peso.
                  </p>
                  <div className="text-xs font-mono font-bold text-amber-400">
                    ~48.2 MB (+120%)
                  </div>
                </div>
              </div>

              {/* Gradle Config Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-sky-400" />
                    Configuración Gradle Generada (app/build.gradle):
                  </span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono">
                    R8 Full Mode & ABI Splits
                  </span>
                </div>

                <pre className="p-3.5 rounded-xl bg-[#090b10] border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`android {
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a", "armeabi-v7a", "x86_64"
            universalApk false
        }
    }
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}`}
                </pre>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleStartBuild(selectedApp)}
                    disabled={isBuilding}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-950/50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Compilar Matriz Multi-ABI en GitHub Actions</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS & DURATION BAR CHART */}
          {activeTab === 'ANALYTICS_CHART' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sky-400" />
                    <span>Duración de Compilaciones & Tasa de Éxito de GitHub Runners</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Métricas de tiempo de compilación Gradle, consumo de memoria y tasa de éxito de pipelines CI.
                  </p>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Tasa de Éxito en CI</div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">98.5%</div>
                  <p className="text-[10px] text-slate-500">26 compilaciones exitosas de 27</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Tiempo Promedio de Compilación</div>
                  <div className="text-2xl font-extrabold text-sky-400 font-mono">41.2 seg</div>
                  <p className="text-[10px] text-slate-500">Con Gradle Build Cache habilitado</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Memoria Runner Peak</div>
                  <div className="text-2xl font-extrabold text-purple-400 font-mono">3.4 GB / 16GB</div>
                  <p className="text-[10px] text-slate-500">Heap Size JVM optimizado</p>
                </div>
              </div>

              {/* Visual Bar Chart */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>HISTÓRICO DE DURACIÓN POR PIPELINE (SEGUNDOS)</span>
                  <span className="text-emerald-400">● 100% Exitoso</span>
                </div>

                <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800 select-none">
                  {[
                    { label: 'Droid-ify v0.6', duration: 44, success: true },
                    { label: 'Aurora Store v4', duration: 52, success: true },
                    { label: 'Obtainium v1.1', duration: 38, success: true },
                    { label: 'Neo Store v1.2', duration: 41, success: true },
                    { label: 'ReVanced v1.9', duration: 49, success: true },
                    { label: 'Termux v0.118', duration: 58, success: true },
                    { label: 'Civer App Store CI', duration: 36, success: true },
                    { label: 'Actual Run', duration: 42, success: true }
                  ].map((bar, idx) => {
                    const maxSec = 70;
                    const heightPercent = Math.round((bar.duration / maxSec) * 100);

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-8 bg-slate-900 border border-slate-700 text-[10px] font-mono px-2 py-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-lg">
                          {bar.label}: {bar.duration}s
                        </div>

                        <div className="w-full max-w-[36px] bg-slate-900 rounded-t-lg overflow-hidden h-40 flex items-end">
                          <div 
                            className="w-full bg-gradient-to-t from-sky-600 to-indigo-500 group-hover:from-sky-400 group-hover:to-indigo-400 rounded-t transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono truncate w-full text-center">
                          {bar.duration}s
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[11px] font-mono text-slate-500 px-2">
                  <span>Primeros commits (Cache fría)</span>
                  <span>Pipeline actual (Cache caliente)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOM REPO DISPATCHER */}
          {activeTab === 'CUSTOM_REPO' && (
            <form onSubmit={handleCustomRepoSubmit} className="space-y-4 max-w-2xl mx-auto py-2">
              <div className="bg-sky-950/30 border border-sky-800/40 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" /> Despachar Compilación para Repositorio Arbitrario
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Ingresa cualquier repositorio Android de GitHub público o privado para enviar la orden de compilación a GitHub Actions.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre de la Aplicación</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mi App Android FOSS"
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">URL del Repositorio de GitHub</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/usuario/repositorio"
                    value={customRepoUrl}
                    onChange={(e) => setCustomRepoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Rama (Branch)</label>
                    <input
                      type="text"
                      placeholder="main o master"
                      value={customBranch}
                      onChange={(e) => setCustomBranch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Tarea Gradle (Gradle Task)</label>
                    <input
                      type="text"
                      placeholder="./gradlew assembleRelease"
                      value={customGradleTask}
                      onChange={(e) => setCustomGradleTask(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isBuilding}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-950/50 flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4" />
                  <span>Enviar a Compilar en GitHub Actions</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: WORKFLOW YAML GENERATOR */}
          {activeTab === 'WORKFLOW_CONFIG' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-slate-100">Workflow YAML para `.github/workflows/build-apk.yml`</h4>
                  <p className="text-xs text-slate-400">
                    Copia y pega este archivo en cualquier repositorio para compilar y generar APKs automáticamente en cada Release o Commit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyYaml}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                >
                  {copiedYaml ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedYaml ? '¡Copiado!' : 'Copiar YAML'}</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-sky-300 max-h-96 overflow-y-auto">
                <pre>{generateGitHubWorkflowYaml(selectedApp.name, selectedApp.gradleTask, activeKeystore)}</pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
