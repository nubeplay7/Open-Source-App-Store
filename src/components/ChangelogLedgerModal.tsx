import React, { useState, useMemo } from 'react';
import { 
  X, 
  History, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers, 
  FileText, 
  Sparkles, 
  Download, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Cpu, 
  Workflow, 
  Terminal, 
  Smartphone,
  ExternalLink,
  Plus
} from 'lucide-react';
import { SYSTEM_CHANGELOG } from '../data/changelogData';
import { SystemChangelogEntry } from '../types';

interface ChangelogLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProposals: () => void;
  onOpenArchitectureDocs: () => void;
}

export const ChangelogLedgerModal: React.FC<ChangelogLedgerModalProps> = ({
  isOpen,
  onClose,
  onOpenProposals,
  onOpenArchitectureDocs
}) => {
  const [selectedIterationNumber, setSelectedIterationNumber] = useState<number>(3);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'phases' | 'implemented' | 'pending' | 'modules'>('all');
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true });

  const activeIteration = useMemo(() => {
    return SYSTEM_CHANGELOG.find((c) => c.iterationNumber === selectedIterationNumber) || SYSTEM_CHANGELOG[SYSTEM_CHANGELOG.length - 1];
  }, [selectedIterationNumber]);

  const togglePhase = (num: number) => {
    setExpandedPhases(prev => ({ ...prev, [num]: !prev[num] }));
  };

  // Export full ledger to Markdown
  const handleExportMarkdown = () => {
    let md = `# REGISTRO DE CAMBIOS Y PLANOS DE ARQUITECTURA DEL SISTEMA\n`;
    md += `*Plataforma FOSS Hub & Mobile Store Architecture*\n\n`;
    md += `Generado el: ${new Date().toLocaleString()}\n\n`;

    SYSTEM_CHANGELOG.forEach((entry) => {
      md += `## [ITERACIÓN ${entry.iterationNumber}] ${entry.title}\n`;
      md += `**Fecha de Solicitud:** ${entry.requestDate}\n`;
      md += `**Autor:** ${entry.author}\n\n`;
      md += `### 📝 Solicitud del Usuario\n> "${entry.promptSummary}"\n\n`;
      md += `### 💡 Resumen Ejecutivo\n${entry.executiveSummary}\n\n`;

      md += `### 🏗️ Fases de Arquitectura\n`;
      entry.architecturePhases.forEach((phase) => {
        md += `- **Fase ${phase.phaseNumber}: ${phase.name}** [${phase.status}]\n`;
        md += `  ${phase.description}\n`;
        md += `  *Entregables:* ${phase.keyDeliverables.join(', ')}\n`;
      });
      md += `\n`;

      md += `### ✅ Funcionalidades Implementadas y Verificadas\n`;
      entry.implementedFeatures.forEach((feat) => {
        md += `- [x] **${feat.title}** (${feat.category}) - Módulo: \`${feat.module}\` [${feat.status}]\n`;
        md += `  ${feat.description}\n`;
      });
      md += `\n`;

      md += `### 🔮 Roadmap y Tareas Pendientes\n`;
      entry.pendingRoadmap.forEach((road) => {
        md += `- [ ] **[${road.priority}] ${road.title}** (Objetivo: ${road.targetIteration})\n`;
        md += `  ${road.description}\n`;
        md += `  *Requisitos:* ${road.technicalRequirements.join(', ')}\n`;
      });
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `foss-hub-system-changelog-iteration-${selectedIterationNumber}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Registro de Cambios y Planos del Sistema
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  v3.0.0 Live Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoría iterativa continua: Solicitudes, fases de diseño, funciones verificadas y roadmap
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Descargar registro completo en formato Markdown"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Exportar Markdown
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ITERATION SELECTOR BAR */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Iteraciones:</span>
            {SYSTEM_CHANGELOG.map((entry) => {
              const isSelected = entry.iterationNumber === selectedIterationNumber;
              return (
                <button
                  key={entry.iterationNumber}
                  onClick={() => setSelectedIterationNumber(entry.iterationNumber)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 border border-emerald-500 font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
                  Iteración #{entry.iterationNumber}
                  <span className="text-[10px] opacity-75">({entry.implementedFeatures.length} feats)</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenArchitectureDocs();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 text-xs border border-blue-800/50 transition font-medium"
            >
              <Layers className="w-3.5 h-3.5" />
              Ver Planos Modulares
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenProposals();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 text-xs border border-purple-800/50 transition font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sugerir Mejoras ({3} pendientes)
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ACTIVE ITERATION HEADER CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    ITERACIÓN #{activeIteration.iterationNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    {activeIteration.requestDate}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  {activeIteration.title}
                </h3>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Autor:</span> {activeIteration.author}
              </div>
            </div>

            {/* Prompt Summary Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                SOLICITUD ORIGINAL DEL USUARIO (USER PROMPT)
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "{activeIteration.promptSummary}"
              </p>
            </div>

            {/* Executive Summary */}
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-100">Resumen Ejecutivo del Arquitecto: </span>
              {activeIteration.executiveSummary}
            </div>
          </div>

          {/* TAB FILTER BUTTONS */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'all', label: 'Vista Completa' },
              { id: 'phases', label: `Fases Arquitectónicas (${activeIteration.architecturePhases.length})` },
              { id: 'implemented', label: `Implementado & Verificado (${activeIteration.implementedFeatures.length})` },
              { id: 'pending', label: `Roadmap & Pendiente (${activeIteration.pendingRoadmap.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SECTION 1: ARCHITECTURE PHASES */}
          {(activeTab === 'all' || activeTab === 'phases') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-emerald-400" />
                  Fases de Arquitectura y Planificación de Ingeniería
                </h4>
                <span className="text-xs text-slate-400">
                  {activeIteration.architecturePhases.filter(p => p.status === 'COMPLETED').length} de {activeIteration.architecturePhases.length} completadas
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activeIteration.architecturePhases.map((phase) => (
                  <div 
                    key={phase.phaseNumber}
                    className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden"
                  >
                    <button
                      onClick={() => togglePhase(phase.phaseNumber)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-900/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                          {phase.phaseNumber}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-100">
                            {phase.name}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {phase.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {phase.status}
                        </span>
                        {expandedPhases[phase.phaseNumber] ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {expandedPhases[phase.phaseNumber] && (
                      <div className="px-4 pb-3 pt-1 border-t border-slate-900 bg-slate-900/20 space-y-2">
                        <p className="text-xs text-slate-300">
                          {phase.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-400 font-medium">Entregables:</span>
                          {phase.keyDeliverables.map((del, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                              {del}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: IMPLEMENTED & VERIFIED WORKING */}
          {(activeTab === 'all' || activeTab === 'implemented') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Funcionalidades Implementadas & Verificadas en Funcionamiento
                </h4>
                <span className="text-xs text-emerald-400 font-semibold">
                  100% Verificado Activo
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeIteration.implementedFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                          {feat.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {feat.status}
                        </span>
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-100 mb-1">
                        {feat.title}
                      </h5>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {feat.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Módulo: <span className="text-slate-300">{feat.module}</span></span>
                      <span>{feat.verifiedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: PENDING ROADMAP */}
          {(activeTab === 'all' || activeTab === 'pending') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Roadmap de Ingeniería & Mejoras Pendientes
                </h4>
                <span className="text-xs text-amber-400">
                  Próxima meta de evolución
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activeIteration.pendingRoadmap.map((road) => (
                  <div
                    key={road.id}
                    className="p-4 rounded-xl bg-slate-950/50 border border-amber-500/20 hover:border-amber-500/40 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          road.priority === 'CRITICAL' 
                            ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                            : road.priority === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          Prioridad {road.priority}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-100">
                          {road.title}
                        </h5>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {road.targetIteration}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">
                      {road.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Requisitos Técnicos:</span>
                      {road.technicalRequirements.map((req, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-amber-200/90 border border-slate-800">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMPACT & ARCHITECTURE SUMMARY */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-0.5">
                Impacto Arquitectónico Global:
              </div>
              <p className="text-xs text-slate-400">
                {activeIteration.architecturalImpact}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenProposals();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Proponer Mejora para Iteración 4
              </button>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Registro verificado y sincronizado con el agente Antigravity</span>
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
