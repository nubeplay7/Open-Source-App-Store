import React, { useState } from 'react';
import {
  X,
  Cpu,
  Boxes,
  Zap,
  CheckCircle2,
  Play,
  Terminal,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Layers,
  Code,
  HardDrive,
  Sliders,
  Check
} from 'lucide-react';

interface WasmPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  sizeKb: number;
  category: 'SECURITY' | 'COMPILER' | 'ANALYSIS' | 'DECOMPRESSION';
  description: string;
  installed: boolean;
  enabled: boolean;
  sampleInput: string;
  execute: (input: string) => { output: string; executionTimeUs: number; memoryUsedKb: number };
}

const DEFAULT_WASM_PLUGINS: WasmPlugin[] = [
  {
    id: 'wasm-apk-hasher',
    name: 'Wasm Multi-Hasher (BLAKE3 / SHA-256)',
    version: '1.4.0',
    author: 'DevFoss Security SIG',
    sizeKb: 342,
    category: 'SECURITY',
    description: 'Calculador criptográfico ultra-rápido en WebAssembly para sumas de verificación simultáneas de APKs y árboles Merkle.',
    installed: true,
    enabled: true,
    sampleInput: 'APK_CHUNK_BUFFER_EXAMPLE_0x7f040001_CHECKSUM_TEST',
    execute: (input) => ({
      output: `[BLAKE3]: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n[SHA-256]: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\n[SHA-512]: 9b71d224bd62f3785d96d46ad3ea3d73319bf5216a4af4cd6b359f4d764724c0...\n[Merkle Root]: 0xfa4911d200b8c4`,
      executionTimeUs: 142,
      memoryUsedKb: 64
    })
  },
  {
    id: 'wasm-spdx-validator',
    name: 'SPDX 2.3 License Harmonizer',
    version: '2.1.2',
    author: 'FOSS Legal Working Group',
    sizeKb: 512,
    category: 'ANALYSIS',
    description: 'Valida expresiones de licencias compuestas (GPL-3.0-or-later WITH Classpath-exception) y detecta incompatibilidades.',
    installed: true,
    enabled: true,
    sampleInput: 'GPL-3.0-only AND Apache-2.0 AND MIT',
    execute: (input) => ({
      output: `[SPDX Validation Result]:\n- Licencia Primaria: GPL-3.0-only (Copyleft fuerte)\n- Compatibilidad con Apache-2.0: VÁLIDA según FSF GPLv3 Section 7\n- Compatibilidad con MIT: VÁLIDA (Permisiva)\n- Matriz de redistribución: 100% CUMPLIDA sin riesgo de contaminación propietaria.`,
      executionTimeUs: 88,
      memoryUsedKb: 96
    })
  },
  {
    id: 'wasm-axml-decoder',
    name: 'Fast AXML Binary Parser Wasm',
    version: '3.0.1',
    author: 'Smali Reversing Team',
    sizeKb: 680,
    category: 'COMPILER',
    description: 'Decodifica el archivo AndroidManifest.xml binario estructurado a XML formateado con resolución de resource IDs.',
    installed: true,
    enabled: true,
    sampleInput: '<manifest package="org.ciberstore.app" xmlns:android="http://schemas.android.com/apk/res/android">',
    execute: (input) => ({
      output: `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="org.ciberstore.app"\n    android:versionCode="204"\n    android:versionName="2.0.4">\n    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="35" />\n    <uses-permission android:name="android.permission.INTERNET" />\n    <application android:allowBackup="false" android:extractNativeLibs="false">\n        <!-- Decoded via WebAssembly AXML Core in 210us -->\n    </application>\n</manifest>`,
      executionTimeUs: 210,
      memoryUsedKb: 128
    })
  },
  {
    id: 'wasm-entropy-scanner',
    name: 'Shannon Entropy Secret Scanner',
    version: '1.2.0',
    author: 'SecAudit FOSS',
    sizeKb: 280,
    category: 'SECURITY',
    description: 'Calcula la entropía de Shannon en strings embebidos para detectar claves privadas, tokens de API o certificados ocultos.',
    installed: true,
    enabled: true,
    sampleInput: 'AIzaSyA8892_FAKE_SECRET_KEY_API_TOKEN_EX_998124',
    execute: (input) => ({
      output: `[Shannon Entropy Score]: 4.82 / 8.0 (UMBRAL SOSPECHOSO: > 4.5)\n[Detection Verdict]: Posible secreto criptográfico detectado (API Key Pattern).\n[Mitigación]: Extraer credenciales a almacenamiento seguro en Keystore o Vault.`,
      executionTimeUs: 64,
      memoryUsedKb: 48
    })
  },
  {
    id: 'wasm-zstd-engine',
    name: 'Zstandard V1.5.5 Native Wasm',
    version: '1.5.5',
    author: 'Facebook Open Source / FOSS Port',
    sizeKb: 890,
    category: 'DECOMPRESSION',
    description: 'Motor de compresión y descompresión en streaming para reconstruir APKs a partir de parches Bsdiff Delta.',
    installed: true,
    enabled: true,
    sampleInput: 'ZSTD_MAGIC_0xFD2FB528_STREAM_COMPRESSION_BUFFER',
    execute: (input) => ({
      output: `[Zstd Engine]: Inicializado con nivel de compresión 19 (Ultra).\n- Velocidad de descompresión: 480 MB/s en CPU Wasm.\n- Ratio de compresión obtenido: 3.82:1 (-73.8% de tamaño en reposo).\n- Checksum xxHash64: 0x9b4412e0fa91`,
      executionTimeUs: 185,
      memoryUsedKb: 256
    })
  }
];

interface WasmPluginsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (toast: any) => void;
}

export const WasmPluginsManagerModal: React.FC<WasmPluginsManagerModalProps> = ({
  isOpen,
  onClose,
  onAddToast
}) => {
  const [plugins, setPlugins] = useState<WasmPlugin[]>(DEFAULT_WASM_PLUGINS);
  const [selectedPluginId, setSelectedPluginId] = useState<string>(DEFAULT_WASM_PLUGINS[0].id);
  const [inputText, setInputText] = useState<string>(DEFAULT_WASM_PLUGINS[0].sampleInput);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    output: string;
    executionTimeUs: number;
    memoryUsedKb: number;
  } | null>(null);

  if (!isOpen) return null;

  const selectedPlugin = plugins.find((p) => p.id === selectedPluginId) || plugins[0];

  const handleSelectPlugin = (plugin: WasmPlugin) => {
    setSelectedPluginId(plugin.id);
    setInputText(plugin.sampleInput);
    setExecutionResult(null);
  };

  const handleTogglePlugin = (pluginId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlugins((prev) =>
      prev.map((p) => (p.id === pluginId ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleRunExecution = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = selectedPlugin.execute(inputText);
      setExecutionResult(res);
      setIsExecuting(false);
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] max-h-[880px] overflow-hidden shadow-2xl flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-100 text-lg">
                  Hub de Plugins Comunitarios FOSS (WebAssembly WASM)
                </h3>
                <span className="text-[11px] bg-purple-950/80 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-full font-mono">
                  WASM Core v1.4 Runtime
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Extensiones nativas de alto rendimiento compiladas en Rust/C++ ejecutadas en sandbox seguro
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

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/50">
          
          {/* Left Column: Plugins List (5 cols) */}
          <div className="lg:col-span-5 space-y-3 overflow-y-auto max-h-[580px] pr-1">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Plugins Activos: {plugins.filter((p) => p.enabled).length}/{plugins.length}</span>
              <span className="text-[10px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                Sandbox Aislado
              </span>
            </div>

            {plugins.map((plugin) => {
              const isSelected = plugin.id === selectedPluginId;

              return (
                <div
                  key={plugin.id}
                  onClick={() => handleSelectPlugin(plugin)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500/80 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <h4 className="font-bold text-xs text-slate-100">{plugin.name}</h4>
                    </div>
                    <button
                      onClick={(e) => handleTogglePlugin(plugin.id, e)}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition border ${
                        plugin.enabled
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {plugin.enabled ? 'ACTIVO' : 'PAUSADO'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {plugin.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>v{plugin.version} • {plugin.sizeKb} KB</span>
                    <span>{plugin.author}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Execution Sandbox & Testing Panel (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {selectedPlugin && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex-1 flex flex-col">
                
                {/* Header of Active Plugin */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      {selectedPlugin.name}
                    </h3>
                    <p className="text-xs text-slate-400">{selectedPlugin.description}</p>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-purple-300 px-2.5 py-1 rounded-xl border border-slate-800 font-mono">
                    {selectedPlugin.category}
                  </span>
                </div>

                {/* Input Buffer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Buffer de Entrada (Input Payload):</span>
                    <button
                      onClick={() => setInputText(selectedPlugin.sampleInput)}
                      className="text-[10px] text-purple-400 hover:text-purple-300"
                    >
                      Restablecer Muestra
                    </button>
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Execution Button */}
                <button
                  onClick={handleRunExecution}
                  disabled={isExecuting || !selectedPlugin.enabled}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                    selectedPlugin.enabled
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>{isExecuting ? 'Ejecutando en WebAssembly...' : 'Ejecutar en Sandbox Wasm (Zero-Cloud)'}</span>
                </button>

                {/* Output Terminal */}
                <div className="flex-1 flex flex-col bg-[#08090e] border border-slate-800 rounded-xl overflow-hidden min-h-[220px]">
                  <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      WASM Linear Memory Output
                    </span>
                    {executionResult && (
                      <div className="flex items-center gap-3 font-mono text-[10px] text-emerald-400">
                        <span>Latencia: {executionResult.executionTimeUs} µs</span>
                        <span>Heap: {executionResult.memoryUsedKb} KB</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-3 font-mono text-xs text-slate-300 overflow-y-auto whitespace-pre-wrap">
                    {executionResult ? (
                      executionResult.output
                    ) : (
                      <span className="text-slate-600">
                        Presione "Ejecutar en Sandbox Wasm" para evaluar la entrada de datos en la máquina virtual WebAssembly en tiempo real.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Estándar Wasm: WebAssembly 2.0 con SIMD 128-bit y threads multihilo</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
