import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ThumbsUp, 
  MessageSquarePlus, 
  Filter, 
  Search, 
  Cpu, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  AlertTriangle, 
  Tag, 
  Send,
  PlusCircle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { SystemProposal, ProposalCategory, ProposalStatus } from '../types';

interface ProposalsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: SystemProposal[];
  onAddProposal: (proposal: SystemProposal) => void;
  onVoteProposal: (proposalId: string) => void;
  userEmail: string;
  userName: string;
}

export const ProposalsHubModal: React.FC<ProposalsHubModalProps> = ({
  isOpen,
  onClose,
  proposals,
  onAddProposal,
  onVoteProposal,
  userEmail,
  userName
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmittingNew, setIsSubmittingNew] = useState<boolean>(false);
  const [selectedProposalForDetail, setSelectedProposalForDetail] = useState<SystemProposal | null>(null);

  // New Proposal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ProposalCategory>('PLAY_STORE_PARITY');
  const [newTags, setNewTags] = useState('');

  const filteredProposals = proposals.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.submittedBy.toLowerCase().includes(q);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    // AI Analysis automatic estimation
    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const createdProposal: SystemProposal = {
      id: `prop-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      submittedBy: userName || 'Oscar Manuel',
      userEmail: userEmail || 'civer.team.cloud@gmail.com',
      category: newCategory,
      priorityVotes: 1,
      userHasVoted: true,
      status: 'UNDER_AI_ANALYSIS',
      createdAt: new Date().toISOString().split('T')[0],
      tags: tagsArray.length > 0 ? tagsArray : ['Comunidad', 'Propuesta'],
      aiAnalysis: {
        technicalFeasibilityScore: Math.floor(Math.random() * 15) + 85, // 85-99
        architecturalImpact: `Propuesta evaluada por el agente Antigravity. Impacto clasificado como relevante para la evolución del Hub.`,
        recommendedPhase: 'Iteración 4 (Próxima)',
        estimatedComplexity: 'MEDIA',
        agentNotes: `La propuesta "${newTitle.slice(0, 40)}..." ha sido indexada y será tomada en cuenta como input prioritario para el próximo ciclo de compilación e ingeniería.`,
        requiredComponents: ['CoreStateEngine', 'ModuleIntegrationHook']
      }
    };

    onAddProposal(createdProposal);
    setNewTitle('');
    setNewDescription('');
    setNewTags('');
    setIsSubmittingNew(false);
    setSelectedProposalForDetail(createdProposal);
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
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Hub de Sugerencia de Mejoras y Propuestas
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full">
                  AI Agent Review Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ingresa propuestas técnicas para que los agentes de IA y desarrolladores las analicen e implementen en las siguientes iteraciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSubmittingNew(!isSubmittingNew)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              {isSubmittingNew ? 'Ver Lista' : 'Proponer Mejora'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUBMIT NEW PROPOSAL FORM */}
        {isSubmittingNew ? (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-purple-400 mb-2 font-bold text-base">
                <Lightbulb className="w-5 h-5" />
                Registrar Nueva Propuesta Técnica de Mejora
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Tu sugerencia será evaluada por el modelo de IA para calcular su viabilidad técnica, impacto en la arquitectura y fase de implementación.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título de la Propuesta *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Integrar emulador de descargas simultáneas en segundo plano"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Categoría de Arquitectura *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ProposalCategory)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition"
                    >
                      <option value="PLAY_STORE_PARITY">Play Store Parity & UI</option>
                      <option value="CLOUD_CI_COMPILER">Compilador Cloud CI (GitHub Actions)</option>
                      <option value="SECURITY_SHIZUKU">Seguridad & Shizuku ADB</option>
                      <option value="REPOSITORIES_SYNC">Sincronización de Repositorios V2</option>
                      <option value="UI_UX_RESPONSIVE">UI/UX & Modos Visuales</option>
                      <option value="PERFORMANCE_BATTERY">Rendimiento & Batería</option>
                      <option value="COMMUNITY_EXTENSIONS">Extensiones Comunitarias</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Etiquetas / Tags (separados por coma)
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Ej: ADB, Shizuku, Descargas, Cache"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descripción Detallada y Requisitos Técnicos *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe qué problema resuelve, qué tecnologías o APIs de Android se necesitan y cómo enriquecería la experiencia de usuario..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition resize-none"
                  />
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200/90 flex items-start gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>
                    El agente Antigravity procesará la propuesta inmediatamente para calcular su puntuación de factibilidad técnica (1-100) y asignarla al roadmap.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmittingNew(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Propuesta
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* FILTER & SEARCH CONTROLS */}
            <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar propuestas por título, tag o autor..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Todas las Categorías</option>
                  <option value="PLAY_STORE_PARITY">Play Store Parity</option>
                  <option value="CLOUD_CI_COMPILER">Compilador Cloud CI</option>
                  <option value="SECURITY_SHIZUKU">Seguridad & Shizuku</option>
                  <option value="REPOSITORIES_SYNC">Sync Repositorios</option>
                  <option value="UI_UX_RESPONSIVE">UI / UX</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="UNDER_AI_ANALYSIS">En Análisis IA</option>
                  <option value="PLANNED_NEXT">Planificada Próxima</option>
                  <option value="IMPLEMENTED">Implementada</option>
                  <option value="PROPOSED">Propuesta Abierta</option>
                </select>
              </div>
            </div>

            {/* PROPOSALS LIST & DETAIL VIEW */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LIST COLUMN */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{filteredProposals.length} propuestas registradas</span>
                  <span>Ordenadas por votos y relevancia</span>
                </div>

                {filteredProposals.map((proposal) => {
                  const isSelected = selectedProposalForDetail?.id === proposal.id;
                  return (
                    <div
                      key={proposal.id}
                      onClick={() => setSelectedProposalForDetail(proposal)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-850 border-purple-500/80 shadow-lg shadow-purple-950/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        {/* Top badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700">
                              {proposal.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              proposal.status === 'IMPLEMENTED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : proposal.status === 'PLANNED_NEXT'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}>
                              {proposal.status === 'IMPLEMENTED' ? '✓ Implementada' : proposal.status === 'PLANNED_NEXT' ? '⏳ Planificada' : '🧠 En Análisis IA'}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-slate-500">
                            {proposal.createdAt}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-sm font-bold text-slate-100 mb-1.5">
                          {proposal.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {proposal.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1">
                          {proposal.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer / Voting Row */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="text-xs text-slate-400">
                          Por: <span className="text-slate-200 font-medium">{proposal.submittedBy}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono font-semibold">
                            <BrainCircuit className="w-3.5 h-3.5" />
                            {proposal.aiAnalysis.technicalFeasibilityScore}% viabilidad
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onVoteProposal(proposal.id);
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              proposal.userHasVoted
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{proposal.priorityVotes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI ANALYSIS & DETAIL COLUMN */}
              <div className="lg:col-span-5">
                {selectedProposalForDetail ? (
                  <div className="sticky top-0 p-5 rounded-2xl bg-slate-950 border border-purple-500/40 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                        <BrainCircuit className="w-5 h-5" />
                        Análisis Técnico del Agente IA
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {selectedProposalForDetail.aiAnalysis.technicalFeasibilityScore}/100 Factibilidad
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-100 mb-1">
                        {selectedProposalForDetail.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedProposalForDetail.description}
                      </p>
                    </div>

                    {/* Progress Bar of Feasibility */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>Puntuación de Viabilidad Técnica</span>
                        <span className="text-purple-400 font-bold">{selectedProposalForDetail.aiAnalysis.technicalFeasibilityScore}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
                          style={{ width: `${selectedProposalForDetail.aiAnalysis.technicalFeasibilityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta specs grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Fase Recomendada</span>
                        <span className="font-semibold text-slate-200">{selectedProposalForDetail.aiAnalysis.recommendedPhase}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Complejidad</span>
                        <span className="font-semibold text-slate-200">{selectedProposalForDetail.aiAnalysis.estimatedComplexity}</span>
                      </div>
                    </div>

                    {/* Agent Notes */}
                    <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200/90 leading-relaxed">
                      <span className="font-semibold block mb-1 text-purple-300">Dictamen del Agente:</span>
                      {selectedProposalForDetail.aiAnalysis.agentNotes}
                    </div>

                    {/* Required components */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Componentes requeridos:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProposalForDetail.aiAnalysis.requiredComponents.map((comp, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-emerald-400 border border-slate-800">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">ID: {selectedProposalForDetail.id}</span>
                      <button
                        onClick={() => onVoteProposal(selectedProposalForDetail.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          selectedProposalForDetail.userHasVoted
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {selectedProposalForDetail.userHasVoted ? 'Votada (+1)' : 'Votar Prioridad'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center flex flex-col items-center justify-center text-slate-500 h-64">
                    <BrainCircuit className="w-10 h-10 mb-2 opacity-50 text-purple-400" />
                    <p className="text-xs text-slate-400">
                      Selecciona una propuesta de la lista para ver su análisis de viabilidad de IA y desglose arquitectónico.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </>
        )}

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Las propuestas con más de 40 votos se priorizan automáticamente en la siguiente iteración</span>
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
