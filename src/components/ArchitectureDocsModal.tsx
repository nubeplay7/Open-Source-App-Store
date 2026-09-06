import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Cpu, 
  Workflow, 
  ShieldCheck, 
  Activity, 
  FileCode2, 
  ExternalLink, 
  Search, 
  ChevronRight, 
  BookOpen,
  ArrowRight,
  Database,
  Terminal,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { MODULE_DOCUMENTATIONS } from '../data/moduleDocsData';
import { ModuleDocumentation, SystemBlueprintLayer } from '../types';
import { ArchitectureGraphView } from './ArchitectureGraphView';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangelog: () => void;
  onOpenProposals: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({
  isOpen,
  onClose,
  onOpenChangelog,
  onOpenProposals
}) => {
  const [activeSubView, setActiveSubView] = useState<'BLUEPRINTS' | 'GRAPH'>('BLUEPRINTS');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(MODULE_DOCUMENTATIONS[0].id);
  const [layerFilter, setLayerFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedModule = MODULE_DOCUMENTATIONS.find((m) => m.id === selectedModuleId) || MODULE_DOCUMENTATIONS[0];

  const filteredModules = MODULE_DOCUMENTATIONS.filter((mod) => {
    const matchesLayer = layerFilter === 'ALL' || mod.layer === layerFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      mod.name.toLowerCase().includes(q) || 
      mod.shortDescription.toLowerCase().includes(q) ||
      mod.keyComponents.some(k => k.toLowerCase().includes(q));

    return matchesLayer && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Planos y Documentación Modular del Sistema
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full">
                  8 Módulos Core
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Especificaciones de capas, flujos de entrada/salida, seguridad criptográfica y contratos de arquitectura
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700/80 text-xs">
              <button
                onClick={() => setActiveSubView('BLUEPRINTS')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeSubView === 'BLUEPRINTS'
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Planos Modulares</span>
              </button>
              <button
                onClick={() => setActiveSubView('GRAPH')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeSubView === 'GRAPH'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Grafo de Red Interactivo</span>
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenChangelog();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Ver Registro de Cambios
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeSubView === 'GRAPH' ? (
          <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
            <ArchitectureGraphView
              onSelectModuleId={(modId) => {
                const found = MODULE_DOCUMENTATIONS.find((m) => m.id === modId);
                if (found) {
                  setSelectedModuleId(found.id);
                }
              }}
            />
          </div>
        ) : (
          <>
            {/* TOP ARCHITECTURE LAYER SCHEMATIC */}
            <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[700px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Topología de Capas:
            </div>
            
            <div className="flex-1 flex items-center gap-1.5">
              <div className="px-3 py-1.5 rounded-lg bg-purple-950/50 border border-purple-800/60 text-purple-300 text-xs flex items-center gap-1.5 font-mono">
                <Smartphone className="w-3.5 h-3.5" />
                1. Multi-UI Shell
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              <div className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5" />
                2. GitHub CI Actions
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              <div className="px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                3. Shizuku ADB Installer
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              <div className="px-3 py-1.5 rounded-lg bg-blue-950/50 border border-blue-800/60 text-blue-300 text-xs flex items-center gap-1.5 font-mono">
                <Database className="w-3.5 h-3.5" />
                4. Catalog & Stores Data
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & LAYER FILTER */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar documentación técnica de módulos..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'FRONTEND_UI', label: 'UI Shell' },
              { id: 'CLOUD_CI_PIPELINE', label: 'Cloud CI' },
              { id: 'SECURITY_INSTALLER', label: 'Shizuku Installer' },
              { id: 'DATA_STORE', label: 'Data Store' },
              { id: 'TELEMETRY_ENGINE', label: 'Telemetría' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setLayerFilter(btn.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  layerFilter === btn.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* BODY (MODULE LIST + DETAILED BLUEPRINT VIEW) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* MODULE SELECTION LIST */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 mb-2">
              Módulos del Sistema ({filteredModules.length}):
            </div>

            {filteredModules.map((mod) => {
              const isSelected = selectedModule.id === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 mb-1 inline-block">
                      {mod.layer}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 mb-1">
                      {mod.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {mod.shortDescription}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 mt-1 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* DETAILED BLUEPRINT INSPECTOR */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-700/80 shadow-xl space-y-6">
              
              {/* Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
                      LAYER: {selectedModule.layer}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ID: {selectedModule.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {selectedModule.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate max-w-[200px]">{selectedModule.keyComponents[0]}</span>
                </div>
              </div>

              {/* Detailed Architecture Markdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Workflow className="w-4 h-4" />
                  Arquitectura Detallada y Principios de Diseño
                </h4>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 whitespace-pre-line">
                  {selectedModule.detailedArchitecture.trim()}
                </div>
              </div>

              {/* Data In / Out Flows */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Flujos de Datos Entrada / Salida (I/O)
                </h4>
                <div className="space-y-1.5">
                  {selectedModule.inputOutputFlows.map((flow, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{flow}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Telemetry 2-Col Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                    Modelo de Seguridad & Permisos
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedModule.securityAndPermissions}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <Cpu className="w-4 h-4" />
                    Telemetría & Rendimiento
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedModule.telemetryAndPerformance}
                  </p>
                </div>
              </div>

              {/* Future Enhancements */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Mejoras y Extensiones Planificadas
                </h4>
                <div className="space-y-1.5">
                  {selectedModule.futureEnhancements.map((enh, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-900/30 text-xs text-purple-200/90 flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{enh}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Locations */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
                <div>
                  <span className="text-slate-500">Ubicación de Código: </span>
                  <span className="text-slate-300">{selectedModule.codeLocation}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
        </>
        )}

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Documentación de arquitectura generada y auditada en tiempo real</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
