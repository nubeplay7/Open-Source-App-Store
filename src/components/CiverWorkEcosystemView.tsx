import React, { useState } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Send, 
  Lock, 
  Cpu, 
  Smartphone, 
  ArrowRight, 
  ChevronRight, 
  Check, 
  Scale, 
  MessageSquare,
  Building2,
  PieChart,
  PlusCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  PaidTestingMission, 
  SharkTankProject, 
  InternalWorkContract, 
  ContributorWallet, 
  CiverRoyaltyDistribution,
  CiverWorkRole 
} from '../types';
import { 
  DEFAULT_ROYALTY_DISTRIBUTION, 
  INITIAL_TESTING_MISSIONS, 
  INITIAL_SHARK_TANK_PROJECTS, 
  INITIAL_WORKER_WALLET, 
  SAMPLE_MASTER_AGREEMENT 
} from '../data/civerWorkData';

export const CiverWorkEcosystemView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TESTING' | 'SHARK_TANK' | 'ROYALTIES' | 'CONTRACTS'>('TESTING');
  
  // Wallet State
  const [wallet, setWallet] = useState<ContributorWallet>(INITIAL_WORKER_WALLET);
  
  // Testing Missions State
  const [missions, setMissions] = useState<PaidTestingMission[]>(INITIAL_TESTING_MISSIONS);
  const [selectedMission, setSelectedMission] = useState<PaidTestingMission | null>(null);
  const [missionReportText, setMissionReportText] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);

  // Shark Tank State
  const [projects, setProjects] = useState<SharkTankProject[]>(INITIAL_SHARK_TANK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<SharkTankProject | null>(null);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [newPitchTitle, setNewPitchTitle] = useState('');
  const [newPitchCategory, setNewPitchCategory] = useState('Fintech & Cripto');
  const [newPitchGoal, setNewPitchGoal] = useState('10000');
  const [newPitchDescription, setNewPitchDescription] = useState('');
  const [isPrivateProject, setIsPrivateProject] = useState(false);

  // Deal Room Chat Simulator
  const [dealRoomMessages, setDealRoomMessages] = useState<Array<{ sender: string; text: string; time: string; isInvestor: boolean }>>([
    {
      sender: 'Grupo Vértice Capital (Inversionista)',
      text: 'Buscamos un Vibe Coder que conozca Compose y WebSockets para integrar pagos offline en 3 semanas. Ofrecemos $1,200 USD de salario base mensual más el 18% del equity de la app.',
      time: '10:14 AM',
      isInvestor: true
    },
    {
      sender: 'Tú (Vibe Coder / Programador IA)',
      text: 'Tengo experiencia orquestando la compilación con GitHub Actions y Shizuku. ¿Los recursos de GPU en Kaggle 30GB están cubiertos por Civer Cloud?',
      time: '10:20 AM',
      isInvestor: false
    },
    {
      sender: 'Grupo Vértice Capital (Inversionista)',
      text: 'Correcto. Civer Cloud cubre el 100% de la infraestructura y cómputo de IA. Si estás de acuerdo, podemos firmar el contrato en la plataforma hoy mismo.',
      time: '10:22 AM',
      isInvestor: true
    }
  ]);
  const [dealInputText, setDealInputText] = useState('');

  // Royalties Calculator State
  const [projectedMonthlyRevenue, setProjectedMonthlyRevenue] = useState<number>(5000);
  const royalties: CiverRoyaltyDistribution = DEFAULT_ROYALTY_DISTRIBUTION;

  // Contracts State
  const [contracts, setContracts] = useState<InternalWorkContract[]>([SAMPLE_MASTER_AGREEMENT]);
  const [hasSignedMasterTerms, setHasSignedMasterTerms] = useState(true);

  // Handler: Submit Mission Report
  const handleSubmitMissionReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission) return;

    setIsSubmittingReport(true);
    setTimeout(() => {
      // Add rewards to wallet
      const reward = selectedMission.rewardUsd;
      const sats = selectedMission.rewardSats;
      
      setWallet(prev => ({
        ...prev,
        balanceUsd: Number((prev.balanceUsd + reward).toFixed(2)),
        balanceSats: prev.balanceSats + sats,
        completedMissionsCount: prev.completedMissionsCount + 1,
        totalEarnedLifetimeUsd: Number((prev.totalEarnedLifetimeUsd + reward).toFixed(2))
      }));

      // Update mission status
      setMissions(prev => prev.map(m => m.id === selectedMission.id ? { ...m, status: 'IN_REVIEW', submissionsCount: m.submissionsCount + 1 } : m));

      setIsSubmittingReport(false);
      setReportSuccessMessage(`¡Reporte enviado con éxito! Se han acreditado +$${reward.toFixed(2)} USD (+${sats.toLocaleString()} sats) a tu saldo pendiente de liquidación.`);
      setMissionReportText('');
      setCheckedItems({});
      
      setTimeout(() => {
        setSelectedMission(null);
        setReportSuccessMessage(null);
      }, 3500);
    }, 1200);
  };

  // Handler: Send Deal Room Message
  const handleSendDealMessage = () => {
    if (!dealInputText.trim()) return;
    const newMsg = {
      sender: 'Tú (Candidato)',
      text: dealInputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInvestor: false
    };
    setDealRoomMessages(prev => [...prev, newMsg]);
    setDealInputText('');

    // Simulated quick reply from investor
    setTimeout(() => {
      setDealRoomMessages(prev => [
        ...prev,
        {
          sender: selectedProject?.investorName || 'Inversionista',
          text: 'Entendido. Tu propuesta encaja con los términos marco de Civer Cloud. Revisa la cláusula de regalías en la pestaña de Contratos.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isInvestor: true
        }
      ]);
    }, 1500);
  };

  // Handler: Create Pitch
  const handleCreatePitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPitchTitle.trim()) return;

    const newProj: SharkTankProject = {
      id: `shark-proj-${Date.now()}`,
      title: newPitchTitle.trim(),
      tagline: newPitchDescription.trim().substring(0, 100) + '...',
      category: newPitchCategory,
      fundingGoalUsd: Number(newPitchGoal) || 10000,
      fundedAmountUsd: 0,
      equityOfferedPct: 15,
      proposedSalaryUsd: 1000,
      investorName: isPrivateProject ? 'Inversión Privada Confidencial' : 'Pool Comunitario Civer Cloud',
      investorType: isPrivateProject ? 'ENTERPRISE' : 'COMMUNITY_POOL',
      status: 'LOOKING_FOR_DEV',
      requiredRoles: ['VIBE_CODER', 'QA_TESTER'],
      vibeCodingPromptIdea: newPitchDescription.trim(),
      termsSigned: false,
      dealRoomMessagesCount: 1,
      isPrivateCustomerProject: isPrivateProject
    };

    setProjects(prev => [newProj, ...prev]);
    setIsPitchModalOpen(false);
    setNewPitchTitle('');
    setNewPitchDescription('');
    alert('🎉 ¡Tu proyecto ha sido postulado exitosamente en el Shark Tank de Civer Cloud!');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 pb-20 select-none">
      {/* Hero Header */}
      <header className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-950/50">
                <Briefcase className="w-5 h-5 text-white fill-current" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Civer Work & Shark Tank Hub</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Trabajo en Línea que Sí Paga
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Gana dinero testeando apps, programando con IA ilimitada o asociándote con inversionistas como copropietario de regalías.
                </p>
              </div>
            </div>
          </div>

          {/* Live Wallet Pill */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 px-4 shadow-xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Saldo Disponible</div>
              <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <span>${wallet.balanceUsd.toFixed(2)} USD</span>
                <span className="text-[10px] text-amber-400 font-mono">({wallet.balanceSats.toLocaleString()} sats)</span>
              </div>
            </div>
            <button 
              onClick={() => alert(`Retiro procesado por Lightning Network a tu nodo o billetera (275,000 sats). Liquidación instantánea.`)}
              className="ml-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Cobrar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('TESTING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'TESTING'
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. Bolsa de Testeo Remunerado ({missions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SHARK_TANK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'SHARK_TANK'
                ? 'bg-sky-950/80 border-sky-700 text-sky-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>2. Shark Tank & Deal Rooms ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROYALTIES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'ROYALTIES'
                ? 'bg-purple-950/80 border-purple-700 text-purple-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>3. Modelo Disquera (Regalías 51/49)</span>
          </button>

          <button
            onClick={() => setActiveTab('CONTRACTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'CONTRACTS'
                ? 'bg-amber-950/80 border-amber-700 text-amber-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Contratos Digitales & Marco Legal</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: TESTING MISSIONS BOARD */}
        {activeTab === 'TESTING' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/40 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Gana Dinero Probando Aplicaciones Android</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Las empresas e inversionistas pagan a la comunidad por auditar sus apps en dispositivos reales. Completa la lista de verificación, reporta anomalías para que nuestros agentes de IA las corrijan y cobra recompensas en dólares o satoshis.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Misiones Completadas</div>
                  <div className="text-lg font-black text-emerald-400">{wallet.completedMissionsCount} auditadas</div>
                </div>
              </div>
            </div>

            {/* Missions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map(mission => (
                <div 
                  key={mission.id}
                  className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 transition flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {mission.appPackage}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1.5 group-hover:text-emerald-300 transition">
                          {mission.appName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-emerald-400">${mission.rewardUsd.toFixed(2)} USD</div>
                        <div className="text-[10px] text-amber-400 font-mono">+{mission.rewardSats.toLocaleString()} sats</div>
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 mt-3">{mission.title}</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{mission.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Requisitos de Verificación:</div>
                      {mission.checklist.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mission.requiredDeviceType === 'PHYSICAL_PHONE' ? 'Teléfono Físico' : 'Cualquier Dispositivo'}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMission(mission);
                        setCheckedItems({});
                        setReportSuccessMessage(null);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                    >
                      <span>Iniciar Testeo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SHARK TANK & DEAL ROOM */}
        {activeTab === 'SHARK_TANK' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>Shark Tank & Matchmaking de Proyectos</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Empresarios e inversionistas financian aplicaciones y contratan Vibe Coders o mantenedores. Tú pones tu talento creativo con IA, nosotros proveemos cómputo ilimitado y el inversionista aporta el capital inicial.
                </p>
              </div>

              <button
                onClick={() => setIsPitchModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-lg shadow-sky-950"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Postular Idea / Proyecto</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Projects List (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                {projects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className={`bg-slate-900/80 border rounded-2xl p-5 transition cursor-pointer ${
                      selectedProject?.id === proj.id
                        ? 'border-sky-500 bg-slate-900 shadow-xl shadow-sky-950/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
                            {proj.category}
                          </span>
                          {proj.isPrivateCustomerProject && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                              Proyecto Privado B2B
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white mt-2">{proj.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{proj.tagline}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-sky-400">${proj.fundingGoalUsd.toLocaleString()} USD</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {proj.equityOfferedPct}% Equity para el equipo
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inversionista: <strong className="text-slate-200">{proj.investorName}</strong></span>
                      </div>
                      <div className="text-sky-400 font-bold flex items-center gap-1">
                        <span>Entrar a Deal Room</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deal Room Chat Panel (1 Col) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[520px] shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-sky-400">Sala de Tratos (Deal Room)</div>
                  <h3 className="text-xs font-bold text-white truncate">
                    {selectedProject ? selectedProject.title : 'Selecciona un proyecto para negociar'}
                  </h3>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Negociación vinculada al contrato marco Civer Cloud
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                  {dealRoomMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl max-w-[90%] ${
                        msg.isInvestor 
                          ? 'bg-slate-800/80 border border-slate-700/80 text-slate-200 mr-auto'
                          : 'bg-sky-950/80 border border-sky-800 text-sky-100 ml-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                        <span className="font-bold">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-slate-800 pt-3 flex gap-2">
                  <input
                    type="text"
                    value={dealInputText}
                    onChange={e => setDealInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendDealMessage()}
                    placeholder="Proponer términos, salario o porcentajes..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleSendDealMessage}
                    className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROYALTIES DISTRIBUTION CALCULATOR */}
        {activeTab === 'ROYALTIES' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-900/40 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                <span>Modelo Disquera Civer Cloud: Dueños de la Tecnología, Socios en las Ganancias</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Igual que una disquera musical es dueña de los estudios, distribución y fonogramas maestros mientras los artistas reciben regalías vitalicias por componer o cantar, Civer Cloud provee la infraestructura, la IA ilimitada, los servidores y el software. Nosotros retenemos la propiedad intelectual maestra y el 51% mayoritario, mientras el 49% restante se divide perpetuamente entre los colaboradores.
              </p>
            </div>

            {/* Interactive Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-2">
                    Ingresos Mensuales Proyectados de la Aplicación
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="500" 
                      max="30000" 
                      step="500"
                      value={projectedMonthlyRevenue}
                      onChange={e => setProjectedMonthlyRevenue(Number(e.target.value))}
                      className="flex-1 accent-purple-500"
                    />
                    <div className="text-base font-black text-purple-400 font-mono shrink-0">
                      ${projectedMonthlyRevenue.toLocaleString()} USD/mes
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    (Provenientes de suscripciones, donaciones, soporte empresarial o compras in-app)
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    División de Regalías Mensuales:
                  </div>

                  {/* 51% Civer Cloud */}
                  <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-purple-200 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Civer Cloud Enterprise (51%)</span>
                      </div>
                      <div className="text-[10px] text-purple-300/80">Plataforma, Cómputo IA, Servidores, Dominio y Dirección</div>
                    </div>
                    <div className="text-sm font-black text-purple-300 font-mono">
                      ${(projectedMonthlyRevenue * 0.51).toFixed(2)} USD
                    </div>
                  </div>

                  {/* 20% Vibe Coder */}
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vibe Coder / Desarrollador IA (20%)</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Persona que construyó la app con nuestros agentes de IA</div>
                    </div>
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      ${(projectedMonthlyRevenue * 0.20).toFixed(2)} USD
                    </div>
                  </div>

                  {/* 15% Author Idea */}
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Autor Intelectual de la Idea (15%)</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Persona que propuso la idea y el concepto original</div>
                    </div>
                    <div className="text-sm font-black text-amber-400 font-mono">
                      ${(projectedMonthlyRevenue * 0.15).toFixed(2)} USD
                    </div>
                  </div>

                  {/* 10% Maintainer */}
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>Mantenedor Activo (10%)</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Actualizaciones periódicas y parches en GitHub</div>
                    </div>
                    <div className="text-sm font-black text-sky-400 font-mono">
                      ${(projectedMonthlyRevenue * 0.10).toFixed(2)} USD
                    </div>
                  </div>

                  {/* 4% Testers */}
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>Pool de Testers y Verificación (4%)</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Comunidad que prueba en Android y reporta bugs</div>
                    </div>
                    <div className="text-sm font-black text-teal-400 font-mono">
                      ${(projectedMonthlyRevenue * 0.04).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Principles Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-400" />
                    <span>Equilibrio Soberano & Transparencia Inmutable</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Este tabulador garantiza que nadie trabaje gratis. Cualquiera con una buena idea puede ganar el 15% de cada centavo que la aplicación genere, incluso sin saber programar. Quien use la IA para materializarla gana el 20%, y quienes la prueben en sus teléfonos reciben micro-pagos inmediatos.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Sin comisiones abusivas de Google</strong>: No se paga el 30% a Google Play. Todo el valor se reparte internamente.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Pagos Directos por Lightning Network</strong>: Liquidaciones instantáneas en satoshis sin restricciones bancarias transfronterizas.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Propiedad y Respaldo Legal</strong>: Civer Cloud firma contratos digitales vinculantes de cesión y regalías.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-purple-950/40 border border-purple-900/60 text-xs text-purple-200">
                  💡 <strong>¿Eres un creador o tienes una idea?</strong> Postúlala en la pestaña Shark Tank y nuestros Vibe Coders la construirán con la IA de Civer Cloud mientras tú conservas tus regalías.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DIGITAL CONTRACTS & LEGAL FRAMEWORK */}
        {activeTab === 'CONTRACTS' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-900/40 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Bóveda de Contratos Digitales & Marco Legal Corporativo</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Cada relación de trabajo en Civer Cloud está respaldada por contratos digitales inmutables. El colaborador cede la titularidad patrimonial a Civer Cloud Enterprise y la empresa le garantiza por contrato el derecho irrevocable al cobro de sus regalías y salarios pactados.
              </p>
            </div>

            {/* Active Contract Sample */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    CONTRATO OFICIAL VINCULANTE
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">
                    {SAMPLE_MASTER_AGREEMENT.contractId} — {SAMPLE_MASTER_AGREEMENT.projectTitle}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Partes: <strong>Civer Cloud Enterprise</strong> &amp; <strong>{SAMPLE_MASTER_AGREEMENT.workerName}</strong>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>FIRMADO &amp; VIGENTE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Fecha: {SAMPLE_MASTER_AGREEMENT.effectiveDate}</div>
                </div>
              </div>

              {/* Clauses Body */}
              <div className="py-5 space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <h4 className="font-bold text-amber-400 uppercase font-mono text-[11px] mb-1">
                    Cláusula 1: Propiedad Intelectual y Cesión Patrimonial
                  </h4>
                  <p className="text-slate-300">
                    {SAMPLE_MASTER_AGREEMENT.ipOwnershipClause}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <h4 className="font-bold text-emerald-400 uppercase font-mono text-[11px] mb-1">
                    Cláusula 2: Derecho Económico a Regalías y Remuneración
                  </h4>
                  <p className="text-slate-300">
                    Civer Cloud Enterprise se obliga a liquidar puntualmente al colaborador el <strong>{SAMPLE_MASTER_AGREEMENT.royaltyPercentage}%</strong> de los ingresos netos generados por la aplicación, pagaderos mensualmente mediante transferencia bancaria o Lightning Network, además del salario base de <strong>${SAMPLE_MASTER_AGREEMENT.fixedSalaryUsd} USD</strong> mientras dure la etapa de desarrollo activo.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase font-mono text-[11px]">
                      Huella Criptográfica de la Firma Digital
                    </h4>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5 break-all">
                      {SAMPLE_MASTER_AGREEMENT.digitalSignatureHash}
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Contrato validado con hash SHA-256. Certificado criptográfico válido y firmado por Civer Cloud Root Authority.`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 shrink-0"
                  >
                    Verificar Firma
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: SUBMIT MISSION REPORT */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  REPORTE DE TESTEO REMUNERADO
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedMission.appName}</h3>
                <p className="text-xs text-slate-400">{selectedMission.title}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-emerald-400">+${selectedMission.rewardUsd.toFixed(2)} USD</div>
                <div className="text-[10px] text-amber-400 font-mono">+{selectedMission.rewardSats.toLocaleString()} sats</div>
              </div>
            </div>

            {reportSuccessMessage ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold leading-relaxed">
                {reportSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmitMissionReport} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    Lista de Verificación Obligatoria:
                  </label>
                  {selectedMission.checklist.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:bg-slate-800">
                      <input 
                        type="checkbox"
                        checked={!!checkedItems[idx]}
                        onChange={e => setCheckedItems(prev => ({ ...prev, [idx]: e.target.checked }))}
                        className="rounded accent-emerald-500"
                        required
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    Comentarios del Tester y Errores Encontrados:
                  </label>
                  <textarea 
                    value={missionReportText}
                    onChange={e => setMissionReportText(e.target.value)}
                    placeholder="Describe los resultados: ¿notaste cierres inesperados, consumo anormal de batería o fallas de interfaz? Esto alimentará a nuestros agentes de IA para corregir la app."
                    rows={4}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMission(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                  >
                    {isSubmittingReport ? <span>Enviando a Auditoría IA...</span> : <span>Enviar Reporte y Cobrar</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE PITCH / PROJECT */}
      {isPitchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-sky-400" />
              <span>Postular Nueva Idea o Proyecto de Aplicación</span>
            </h3>
            <p className="text-xs text-slate-400">
              Presenta tu idea al Shark Tank de Civer Cloud. Si un inversionista o cliente la aprueba, nuestros Vibe Coders la construirán contigo y tú recibirás el 15% de regalías perpetuas.
            </p>

            <form onSubmit={handleCreatePitch} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Título de la Aplicación</label>
                <input 
                  type="text"
                  value={newPitchTitle}
                  onChange={e => setNewPitchTitle(e.target.value)}
                  placeholder="Ej: AgroScan AI Móvil"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Categoría</label>
                  <select
                    value={newPitchCategory}
                    onChange={e => setNewPitchCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Fintech & Cripto">Fintech &amp; Cripto</option>
                    <option value="Salud & Privacidad">Salud &amp; Privacidad</option>
                    <option value="AgriTech & IA">AgriTech &amp; IA</option>
                    <option value="Logística & B2B">Logística &amp; B2B</option>
                    <option value="Educación & FOSS">Educación &amp; FOSS</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Financiamiento Solicitado ($ USD)</label>
                  <input 
                    type="number"
                    value={newPitchGoal}
                    onChange={e => setNewPitchGoal(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descripción de la Idea &amp; Funcionalidades</label>
                <textarea 
                  value={newPitchDescription}
                  onChange={e => setNewPitchDescription(e.target.value)}
                  placeholder="Explica qué problema resuelve, para quién está pensada y qué características principales debe tener..."
                  rows={3}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isPrivateProject}
                  onChange={e => setIsPrivateProject(e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span><strong>Proyecto Privado para Cliente Empresarial</strong> (No publicar código como open source)</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPitchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-950"
                >
                  Postular al Shark Tank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
