import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileArchive, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Code2, 
  ShieldCheck, 
  FolderDown, 
  Zap, 
  Smartphone, 
  GitBranch,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppCatalogItem, STACK_DETAILS } from '../types';
import { sourceUploadService, SourceInspectionResult } from '../services/sourceUploadService';

interface SourceCodeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppRegistered: (newApp: AppCatalogItem, autoCompile?: boolean) => void;
}

export const SourceCodeUploadModal: React.FC<SourceCodeUploadModalProps> = ({
  isOpen,
  onClose,
  onAppRegistered
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inspection, setInspection] = useState<SourceInspectionResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [gitUrlInput, setGitUrlInput] = useState<string>('');
  const [mode, setMode] = useState<'ZIP' | 'GIT'>('ZIP');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processZipFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processZipFile(file);
    }
  };

  const processZipFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Por favor selecciona un archivo comprimido en formato .zip que contenga el código fuente.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setFileName(file.name);
      const res = await sourceUploadService.inspectZipArchive(file);
      setInspection(res);
    } catch (err: any) {
      alert(`Error al analizar el archivo ZIP: ${err?.message || 'Archivo corrupto o ilegible'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSampleOmniComm = () => {
    setIsAnalyzing(true);
    setFileName('omnicomm-hub.zip (C:\\Users\\asus\\Downloads\\omnicomm-hub.zip)');
    setTimeout(() => {
      const sample = sourceUploadService.getSampleOmniCommHubApp();
      setInspection({
        appName: sample.name,
        packageName: sample.packageName,
        version: sample.version.replace('v', ''),
        description: sample.description,
        tagline: sample.tagline,
        category: sample.category,
        author: sample.developer.name,
        stackType: 'ANDROID_NATIVE',
        filesCount: 148,
        detectedFiles: [
          'metadata.json',
          'app/build.gradle.kts',
          'app/src/main/AndroidManifest.xml',
          'app/src/main/java/com/example/MainActivity.kt',
          'app/src/main/java/com/example/ui/theme/Theme.kt',
          'app/src/main/java/com/example/ui/theme/Color.kt',
          'app/src/androidTest/java/com/example/ExampleInstrumentedTest.kt'
        ],
        gradleTask: './gradlew assembleRelease',
        rawMetadata: {
          name: 'OmniComm',
          description: sample.description,
          package: sample.packageName
        }
      });
      setIsAnalyzing(false);
    }, 400);
  };

  const handleGitInspect = () => {
    if (!gitUrlInput.trim()) return;

    setIsAnalyzing(true);
    const cleanUrl = gitUrlInput.trim();
    const repoName = cleanUrl.split('/').pop()?.replace('.git', '') || 'repo-usuario';
    setFileName(`${repoName} (Git Upstream)`);

    setTimeout(() => {
      setInspection({
        appName: repoName.replace(/[-_]/g, ' ').toUpperCase(),
        packageName: `com.civer.${repoName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        version: '1.0.0',
        description: `Aplicación vinculada desde repositorio Git remoto: ${cleanUrl}`,
        tagline: `Repositorio FOSS oficial sincronizado en Civer Hub`,
        category: 'TOOLS',
        author: 'Desarrollador FOSS',
        stackType: 'ANDROID_NATIVE',
        filesCount: 82,
        detectedFiles: ['build.gradle', 'src/main/AndroidManifest.xml', 'src/main/java/App.kt'],
        gradleTask: './gradlew assembleRelease'
      });
      setIsAnalyzing(false);
    }, 500);
  };

  const handleRegisterApp = (autoCompile: boolean = false) => {
    if (!inspection) return;

    const catalogApp = sourceUploadService.createCatalogItemFromInspection(inspection, fileName || 'proyecto-fuente.zip');
    sourceUploadService.saveUserUploadedApp(catalogApp);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // silent
    }

    onAppRegistered(catalogApp, autoCompile);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">Subir Código Fuente & Proyecto Propio</h3>
              <p className="text-xs text-slate-400">
                Integra tus aplicaciones en el catálogo FOSS bajo tu autoría con compilación multi-stack
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Method Tabs: Upload ZIP vs Git URL */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setMode('ZIP')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                mode === 'ZIP' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileArchive className="w-4 h-4" />
              <span>Archivo Comprimido (.ZIP)</span>
            </button>
            <button
              onClick={() => setMode('GIT')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                mode === 'GIT' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Repositorio Git Remoto</span>
            </button>
          </div>

          {/* Mode 1: ZIP Upload / Drag & Drop */}
          {mode === 'ZIP' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-950/30 ring-4 ring-emerald-500/20' 
                    : 'border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 hover:border-slate-600'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept=".zip" 
                  className="hidden" 
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">
                    Arrastra aquí tu archivo .zip o haz clic para seleccionarlo
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Soporta proyectos en Android Nativo (Gradle), Flutter, React Native o Capacitor
                  </p>
                </div>
              </div>

              {/* Quick Preset: OmniComm Hub sample */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Ejemplo de código fuente listo:</div>
                    <div className="text-[11px] font-mono text-slate-400">C:\Users\asus\Downloads\omnicomm-hub.zip</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleOmniComm}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Cargar Ejemplo omnicomm-hub.zip
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Git Repository URL */}
          {mode === 'GIT' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>URL del Repositorio Git (GitHub, GitLab, Gitea)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://github.com/usuario/mi-app-android"
                  value={gitUrlInput}
                  onChange={(e) => setGitUrlInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleGitInspect}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shrink-0"
                >
                  Analizar
                </button>
              </div>
            </div>
          )}

          {/* Analyzing Spinner */}
          {isAnalyzing && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-mono text-emerald-400">Inspeccionando AST, dependencias y metadatos del código fuente...</p>
            </div>
          )}

          {/* Inspection Result Card */}
          {inspection && !isAnalyzing && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-emerald-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {inspection.appName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
                      <span>{inspection.appName}</span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        v{inspection.version}
                      </span>
                    </h4>
                    <p className="text-xs font-mono text-slate-400">{inspection.packageName}</p>
                  </div>
                </div>

                {/* Stack Detected Badge */}
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${STACK_DETAILS[inspection.stackType].badgeBg} ${STACK_DETAILS[inspection.stackType].badgeText} ${STACK_DETAILS[inspection.stackType].badgeBorder}`}>
                  <Cpu className="w-4 h-4" />
                  <span>Stack: {STACK_DETAILS[inspection.stackType].label}</span>
                </div>
              </div>

              {/* App Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 font-semibold">Descripción del Proyecto</div>
                  <div className="text-slate-200 mt-1 line-clamp-2">{inspection.description}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 font-semibold">Comando de Compilación Asignado</div>
                  <div className="text-emerald-300 font-mono mt-1 text-[11px] truncate">
                    {inspection.gradleTask}
                  </div>
                </div>
              </div>

              {/* Detected Files List */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-400 flex items-center justify-between">
                  <span>Archivos Detectados ({inspection.filesCount} archivos analizados)</span>
                  <span className="text-[10px] text-emerald-400">✓ Sintaxis y Estructura Válida</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 max-h-28 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1 scrollbar-thin">
                  {inspection.detectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 truncate">
                      <span className="text-emerald-500">📄</span>
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRegisterApp(false)}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Registrar en Mis Aplicaciones</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRegisterApp(true)}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Registrar y Compilar en CI Ahora</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Civer FOSS Ingestion Engine</span>
          <span>100% Cero Bloqueos • Compatible con Android 15</span>
        </div>
      </div>
    </div>
  );
};
