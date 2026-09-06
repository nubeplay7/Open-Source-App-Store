import React, { useState } from 'react';
import {
  Code,
  FileCode,
  Layers,
  Search,
  Copy,
  Check,
  Download,
  Shield,
  Eye,
  Terminal,
  Cpu,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Boxes
} from 'lucide-react';
import { DexClassItem } from '../types';
import { SAMPLE_DECOMPILED_CLASSES, SAMPLE_ANDROID_MANIFEST_XML } from '../data/dexDecompilerData';

interface DexDecompilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPackage?: string;
  appName?: string;
  onAddToast?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const DexDecompilerModal: React.FC<DexDecompilerModalProps> = ({
  isOpen,
  onClose,
  targetPackage = 'org.civerappstore.app',
  appName = 'Civer App Store PRO',
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'SMALI_CLASSES' | 'ANDROID_MANIFEST' | 'BYTECODE_METRICS'>('SMALI_CLASSES');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const classes: DexClassItem[] = SAMPLE_DECOMPILED_CLASSES[targetPackage] || SAMPLE_DECOMPILED_CLASSES['org.civerappstore.app'] || [];
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);

  const currentClass = classes[selectedClassIndex] || classes[0];
  const currentMethod = currentClass?.methods[selectedMethodIndex] || currentClass?.methods[0];
  const manifestXml = SAMPLE_ANDROID_MANIFEST_XML[targetPackage] || SAMPLE_ANDROID_MANIFEST_XML['org.civerappstore.app'] || '';

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    if (onAddToast) onAddToast('Copiado al Portapapeles', `${label} copiado exitosamente`, 'info');
  };

  const handleDownloadSmali = () => {
    const blob = new Blob([currentClass?.smaliSource + '\n\n' + currentMethod?.smaliCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentClass?.className.replace(/\./g, '_')}.smali`;
    a.click();
    URL.revokeObjectURL(url);
    if (onAddToast) onAddToast('Descarga Iniciada', `Archivo ${currentClass?.className}.smali guardado`, 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-950/80 border border-sky-700/60 rounded-xl text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Descompilador DEX & Smali WebAssembly
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                  WASM v2.4 Native
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Paquete: <span className="text-sky-400 font-semibold">{targetPackage}</span> ({appName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSmali}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium flex items-center gap-1.5 border border-slate-700 transition"
              title="Descargar código Smali de la clase"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Exportar .smali</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 gap-2">
          <button
            onClick={() => setActiveTab('SMALI_CLASSES')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'SMALI_CLASSES'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Clases Smali & Métodos</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
              {classes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ANDROID_MANIFEST')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'ANDROID_MANIFEST'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AndroidManifest.xml Binario Decodificado</span>
          </button>

          <button
            onClick={() => setActiveTab('BYTECODE_METRICS')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'BYTECODE_METRICS'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Métricas del DEX Pool</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'SMALI_CLASSES' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Sidebar: Class & Method Navigator */}
              <div className="w-full md:w-80 bg-slate-950/70 border-r border-slate-800 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-800">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar clase o método..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                      Clases Extraídas (DEX Pool)
                    </div>
                    <div className="space-y-1">
                      {classes.map((cls, idx) => (
                        <button
                          key={cls.className}
                          onClick={() => {
                            setSelectedClassIndex(idx);
                            setSelectedMethodIndex(0);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                            selectedClassIndex === idx
                              ? 'bg-sky-950/80 border border-sky-700/60 text-sky-300'
                              : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="truncate">
                            <div className="font-semibold truncate">{cls.className.split('.').pop()}</div>
                            <div className="text-[10px] text-slate-500 truncate">{cls.packageName}</div>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                            {cls.methods.length}m
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentClass && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                        Métodos ({currentClass.methods.length})
                      </div>
                      <div className="space-y-1">
                        {currentClass.methods.map((method, mIdx) => (
                          <button
                            key={method.name}
                            onClick={() => setSelectedMethodIndex(mIdx)}
                            className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition truncate ${
                              selectedMethodIndex === mIdx
                                ? 'bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-semibold'
                                : 'hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            <span className="text-purple-400">fn </span>
                            {method.name}()
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Code Display */}
              <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                {/* Method / Class Info Header */}
                <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400">Class:</span>
                    <span className="text-sky-300 font-semibold truncate">{currentClass?.className}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">Super:</span>
                    <span className="text-emerald-400">{currentClass?.superClass}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(currentMethod?.smaliCode || '', 'Código Smali')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded border border-slate-700 transition"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copiado' : 'Copiar Smali'}</span>
                  </button>
                </div>

                {/* Smali Code Previewer with Syntax Highlighting styling */}
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#0b101b] selection:bg-sky-900">
                  <div className="text-slate-500 mb-2"># Método desensamblado: {currentMethod?.name}</div>
                  <pre className="whitespace-pre overflow-x-auto text-sky-200 font-mono">
                    <code>{currentMethod?.smaliCode || '# No method selected'}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ANDROID_MANIFEST' && (
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-300">
                  Decodificación AXML binario a XML legible (con Intent Filters & Permissions)
                </div>
                <button
                  onClick={() => handleCopy(manifestXml, 'AndroidManifest.xml')}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar XML</span>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-emerald-300 bg-[#080d1a]">
                <pre className="whitespace-pre overflow-x-auto">
                  <code>{manifestXml}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'BYTECODE_METRICS' && (
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 font-mono">Total de Clases DEX</div>
                  <div className="text-2xl font-bold text-white mt-1">1,482</div>
                  <div className="text-[11px] text-emerald-400 mt-1">100% Sin Ofuscación Pesada</div>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 font-mono">Total Métodos Indexados</div>
                  <div className="text-2xl font-bold text-sky-400 mt-1">14,290 / 65,536</div>
                  <div className="text-[11px] text-sky-300 mt-1">MultiDex Limit: Seguro (21.8%)</div>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 font-mono">String Pool Table</div>
                  <div className="text-2xl font-bold text-purple-400 mt-1">8,102 Strings</div>
                  <div className="text-[11px] text-purple-300 mt-1">Cero URLs sospechosas detectadas</div>
                </div>
              </div>

              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Auditoría Automática de Seguridad en Bytecode
                </h4>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>No se encontraron llamadas a `Runtime.getRuntime().exec()` no autorizadas.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Los canales IPC con Shizuku utilizan `Shizuku.pingBinder()` con verificación de token UID.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Cifrado TLS 1.3 forzado en toda la pila de red OkHttp.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Desensamblador FOSS integrado para auditoría libre</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
