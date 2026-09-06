import React, { useState, useMemo } from 'react';
import {
  X,
  Layers,
  Download,
  Copy,
  Check,
  Search,
  Cpu,
  Database,
  Network,
  Shield,
  Code2,
  RefreshCw,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  ExternalLink,
  Bot
} from 'lucide-react';
import {
  systemMapGenerator,
  SystemMapHierarchy,
  SystemModuleNode
} from '../services/systemMapGeneratorService';

interface SystemMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrchestrator?: () => void;
  onOpenBlueprint?: () => void;
  onOpenDocs?: () => void;
}

export const SystemMapModal: React.FC<SystemMapModalProps> = ({
  isOpen,
  onClose,
  onOpenOrchestrator,
  onOpenBlueprint,
  onOpenDocs
}) => {
  const [map, setMap] = useState<SystemMapHierarchy>(() => systemMapGenerator.generateSystemMap());
  const [selectedLayerId, setSelectedLayerId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('mod_app_root');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'EXPLORER' | 'RAW_JSON' | 'MARKDOWN' | 'CONTROLLERS'>('EXPLORER');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    layer_presentation: true,
    layer_state_management: true,
    layer_transport_gateways: true,
    layer_storage: true
  });

  const refreshMap = () => {
    setMap(systemMapGenerator.generateSystemMap());
  };

  const allModules = useMemo(() => {
    return map.layers.flatMap((l) => l.modules);
  }, [map]);

  const filteredModules = useMemo(() => {
    return allModules.filter((m) => {
      if (selectedLayerId !== 'ALL') {
        const layer = map.layers.find((l) => l.id === selectedLayerId);
        if (!layer || !layer.modules.some((mod) => mod.id === m.id)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allModules, selectedLayerId, searchQuery, map]);

  const selectedModule = useMemo(() => {
    return allModules.find((m) => m.id === selectedModuleId) || allModules[0];
  }, [selectedModuleId, allModules]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(systemMapGenerator.exportSystemMapJson());
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyMd = () => {
    navigator.clipboard.writeText(systemMapGenerator.generateMarkdownSystemMap());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[92vh] max-h-[900px] bg-[#0d1117] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#161b22] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-700 text-purple-300">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                  System Map Generator & Hierarchy Visualizer
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {map.systemIdentity.version}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Modelo mental navegable en JSON para agentes autónomos y arquitectos ({map.systemIdentity.totalModulesCount} módulos, {map.systemIdentity.totalConnectionsCount} dependencias)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={refreshMap}
              title="Regenerar System Map"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'JSON Copiado' : 'Copiar JSON'}</span>
            </button>
            <button
              onClick={() => systemMapGenerator.downloadSystemMapJson()}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .json</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Bar */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center space-x-2">
            {[
              { id: 'EXPLORER', label: 'Explorador de Módulos', icon: Layers },
              { id: 'CONTROLLERS', label: 'Controladores de Estado', icon: Cpu },
              { id: 'RAW_JSON', label: 'Jerarquía JSON Pura', icon: Code2 },
              { id: 'MARKDOWN', label: 'Vista Markdown', icon: FolderTree }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeViewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveViewMode(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            {onOpenBlueprint && (
              <button
                onClick={onOpenBlueprint}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 flex items-center gap-1 text-[11px]"
              >
                <span>Física D3.js</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            {onOpenOrchestrator && (
              <button
                onClick={onOpenOrchestrator}
                className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-800 flex items-center gap-1 text-[11px]"
              >
                <span>Hub Agéntico</span>
                <Bot className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden p-4 sm:p-5 flex flex-col">
          {activeViewMode === 'EXPLORER' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-0">
              {/* Left Column: Module Hierarchy Tree */}
              <div className="md:col-span-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col overflow-hidden min-h-0">
                <div className="p-3 border-b border-slate-800 space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrar módulos, clases, IDs..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                    <button
                      onClick={() => setSelectedLayerId('ALL')}
                      className={`px-2 py-0.5 rounded transition ${
                        selectedLayerId === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      TODAS
                    </button>
                    {map.layers.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setSelectedLayerId(l.id)}
                        className={`px-2 py-0.5 rounded whitespace-nowrap transition ${
                          selectedLayerId === l.id ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {l.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                  {map.layers.map((layer) => {
                    const isExpanded = expandedNodes[layer.id] !== false;
                    const layerModules = layer.modules.filter((m) =>
                      filteredModules.some((fm) => fm.id === m.id)
                    );
                    if (layerModules.length === 0) return null;

                    return (
                      <div key={layer.id} className="space-y-1">
                        <div
                          onClick={() => toggleNode(layer.id)}
                          className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 cursor-pointer text-xs font-bold text-slate-300 font-mono"
                        >
                          <div className="flex items-center gap-1.5">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-purple-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                            <span>{layer.name}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-purple-300">
                            {layerModules.length}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="pl-3 space-y-1">
                            {layerModules.map((mod) => {
                              const isSelected = selectedModule?.id === mod.id;
                              return (
                                <div
                                  key={mod.id}
                                  onClick={() => setSelectedModuleId(mod.id)}
                                  className={`px-2.5 py-2 rounded-lg cursor-pointer transition flex items-center justify-between gap-2 text-xs ${
                                    isSelected
                                      ? 'bg-purple-950 border border-purple-700 text-purple-200 font-semibold'
                                      : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                      <span className="truncate">{mod.name}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 truncate pl-3">
                                      {mod.id}
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                                    {mod.category.replace('_', ' ')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Module Deep Detail Inspector */}
              <div className="md:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto min-h-0 space-y-4">
                {selectedModule ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{selectedModule.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                            {selectedModule.category}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-purple-400 mt-0.5">{selectedModule.id}</div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {selectedModule.healthStatus}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-1">Descripción</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        {selectedModule.description}
                      </p>
                    </div>

                    {selectedModule.filePath && (
                      <div>
                        <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-1">Ubicación en Código Fuente</h4>
                        <code className="text-xs font-mono text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 block">
                          {selectedModule.filePath}
                        </code>
                      </div>
                    )}

                    {selectedModule.stateManagement && (
                      <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                        <h4 className="text-xs font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" />
                          <span>Controlador de Estado y Persistencia</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
                          <div>
                            <span className="text-slate-500">Motor:</span>{' '}
                            <span className="text-white font-bold">{selectedModule.stateManagement.type}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Persistente:</span>{' '}
                            <span className={selectedModule.stateManagement.isPersistent ? 'text-emerald-400' : 'text-amber-400'}>
                              {selectedModule.stateManagement.isPersistent ? 'Sí (Durable)' : 'No (Volátil)'}
                            </span>
                          </div>
                        </div>
                        {selectedModule.stateManagement.primaryStoreKey && (
                          <div className="text-[11px] font-mono text-slate-400 pt-1">
                            <span className="text-slate-500">Key:</span> {selectedModule.stateManagement.primaryStoreKey}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedModule.interfacesExposed && selectedModule.interfacesExposed.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Interfaces & Métodos Expuestos</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedModule.interfacesExposed.map((iface, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-slate-900 text-emerald-300 border border-slate-800 font-mono text-[11px]">
                              {iface}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dependencies & Dependents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                          Dependencias ({selectedModule.dependencies.length})
                        </span>
                        {selectedModule.dependencies.length === 0 ? (
                          <p className="text-[11px] text-slate-500 font-mono italic">Sin dependencias externas</p>
                        ) : (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {selectedModule.dependencies.map((depId) => (
                              <div
                                key={depId}
                                onClick={() => setSelectedModuleId(depId)}
                                className="text-[11px] font-mono text-purple-300 hover:text-purple-100 hover:underline cursor-pointer truncate"
                              >
                                → {depId}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                          Módulos Dependientes ({selectedModule.dependents.length})
                        </span>
                        {selectedModule.dependents.length === 0 ? (
                          <p className="text-[11px] text-slate-500 font-mono italic">Sin dependientes directos</p>
                        ) : (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {selectedModule.dependents.map((depId) => (
                              <div
                                key={depId}
                                onClick={() => setSelectedModuleId(depId)}
                                className="text-[11px] font-mono text-cyan-300 hover:text-cyan-100 hover:underline cursor-pointer truncate"
                              >
                                ← {depId}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 my-auto">Selecciona un módulo del árbol para ver detalles</div>
                )}

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Arquitectura: {map.systemIdentity.architectureType.split(' ')[0]}</span>
                  <span>Generado: {new Date(map.systemIdentity.generatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}

          {activeViewMode === 'CONTROLLERS' && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {map.stateControllers.map((ctrl) => (
                  <div key={ctrl.controllerId} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-bold text-white">{ctrl.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-purple-300 border border-slate-800">
                        {ctrl.scope}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">Storage Backend:</span>{' '}
                        <span className="text-slate-200">{ctrl.storageBackend}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Streams Reactivos:</span>{' '}
                        <span className="text-emerald-300">{ctrl.reactiveStreams.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Eventos Suscritos:</span>{' '}
                        <span className="text-cyan-300">{ctrl.subscribedEvents.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Protocol Bridges */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-mono uppercase text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span>Pasarelas de Protocolo & Puentes de Transporte</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {map.transportBridges.map((b, i) => (
                    <div key={i} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{b.protocol}</span>
                        <span className="text-[10px] font-mono text-emerald-400">~{b.latencyAverageMs}ms latencia</span>
                      </div>
                      <code className="text-[11px] font-mono text-purple-300 bg-slate-900 px-2 py-1 rounded block truncate border border-slate-800">
                        {b.endpoint}
                      </code>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Codificación: {b.encoding}</span>
                        <span>{b.methodsCount} métodos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeViewMode === 'RAW_JSON' && (
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Schema: SystemMapHierarchy (JSON Schema v7 compliant)</span>
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="flex-1 overflow-auto p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-purple-200 leading-relaxed">
                {systemMapGenerator.exportSystemMapJson()}
              </pre>
            </div>
          )}

          {activeViewMode === 'MARKDOWN' && (
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Formato Markdown Autogenerado para Agentes</span>
                <button
                  onClick={handleCopyMd}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copiedMd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMd ? 'Copiado' : 'Copiar Markdown'}</span>
                </button>
              </div>
              <pre className="flex-1 overflow-auto p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {systemMapGenerator.generateMarkdownSystemMap()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
