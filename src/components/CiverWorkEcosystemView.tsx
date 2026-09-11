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
  ExternalLink,
  Bot,
  Network,
  Radio,
  Globe,
  Layers,
  Terminal,
  CheckCheck
} from 'lucide-react';
import { 
  PaidTestingMission, 
  SharkTankProject, 
  InternalWorkContract, 
  ContributorWallet, 
  CiverRoyaltyDistribution,
  CiverWorkRole,
  CiverDepartment,
  WorkConvocation,
  CommunityChannel,
  OmniRouterStatus
} from '../types';
import { 
  DEFAULT_ROYALTY_DISTRIBUTION, 
  INITIAL_TESTING_MISSIONS, 
  INITIAL_SHARK_TANK_PROJECTS, 
  INITIAL_WORKER_WALLET, 
  SAMPLE_MASTER_AGREEMENT,
  INITIAL_DEPARTMENTS,
  INITIAL_CONVOCATIONS,
  INITIAL_COMMUNITY_CHANNELS,
  INITIAL_OMNIROUTER_STATUS
} from '../data/civerWorkData';

export const CiverWorkEcosystemView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TESTING' | 'SHARK_TANK' | 'ROYALTIES' | 'CONTRACTS' | 'OMNIROUTER' | 'CONVOCATIONS' | 'DEPARTMENTS'>('TESTING');
  
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

  // New Features State: Convocations, Departments, OmniRouter
  const [enrolledConvocations, setEnrolledConvocations] = useState<Record<string, boolean>>({
    'conv-vibe-01': true
  });
  const [omniPromptText, setOmniPromptText] = useState('Crea un botón flotante con Jetpack Compose y WebSocket client para Android 15');
  const [omniSelectedModel, setOmniSelectedModel] = useState('gemini-2.5-flash');
  const [omniResponseText, setOmniResponseText] = useState<string | null>(null);
  const [isOmniGenerating, setIsOmniGenerating] = useState(false);
  const [omniTokensUsed, setOmniTokensUsed] = useState(0);

  // Handler: Enroll Convocation
  const handleEnrollConvocation = (convId: string) => {
    setEnrolledConvocations(prev => ({ ...prev, [convId]: true }));
    alert('🎉 ¡Te has postulado con éxito a la convocatoria! Un agente de Recursos Humanos (Agent-PeopleOps) te contactará por Telegram para tu onboarding.');
  };

  // Handler: Run OmniRouter Prompt
  const handleRunOmniPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!omniPromptText.trim()) return;
    setIsOmniGenerating(true);
    setOmniResponseText(null);

    setTimeout(() => {
      setIsOmniGenerating(false);
      setOmniTokensUsed(prev => prev + 412);
      setOmniResponseText(
        `// Generado instantáneamente con IA Infinita OmniRouter (${omniSelectedModel})
// Proveedor en cascada verificado: 0 costo | Latencia: 140ms
@Composable
fun SovereignActionFab(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    FloatingActionButton(
        onClick = onClick,
        containerColor = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary,
        elevation = FloatingActionButtonDefaults.elevation(8.dp),
        modifier = modifier
    ) {
        Icon(Icons.Filled.Bolt, contentDescription = "Acción Soberana Civer")
    }
}`
      );
    }, 1200);
  };

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

          <button
            onClick={() => setActiveTab('OMNIROUTER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'OMNIROUTER'
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="flex items-center gap-1.5">
              <span>5. IA Infinita (OmniRouter)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CONVOCATIONS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'CONVOCATIONS'
                ? 'bg-rose-950/80 border-rose-700 text-rose-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>6. Convocatorias (2h/día) & Comunidad</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>7. Organigrama IA (12 Departamentos 24/7)</span>
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

        {/* TAB 5: OMNIROUTER IA INFINITA (POOL MULTI-CUENTA) */}
        {activeTab === 'OMNIROUTER' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-900/40 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    <span>Pool de Cuentas OmniRouter: "IA Infinita Agéntica"</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse">
                      48 Cuentas Activas
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Nuestros sistemas integran un pool agregado de múltiples cuentas autenticadas (Kaggle GPU, Baseten, Gemini, DeepSeek, Groq). Conmutan en cascada en &lt;45ms si una cuota se satura, garantizando que tú y todos los colaboradores tengan <strong>acceso ilimitado y gratuito a la mejor IA agéntica</strong> sin pagar un solo dólar de su bolsillo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-cyan-800/60 text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-400">Saldo Agregado</div>
                    <div className="text-sm font-black text-cyan-400 font-mono">
                      ${INITIAL_OMNIROUTER_STATUS.totalCombinedCreditUsd.toLocaleString()} USD
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-400">Cuentas Autenticadas</div>
                <div className="text-lg font-black text-white mt-1">48 Cuentas</div>
                <div className="text-[10px] text-emerald-400 font-medium">Pool multi-proveedor</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-400">Tokens 24h</div>
                <div className="text-lg font-black text-cyan-400 font-mono mt-1">8,420,000</div>
                <div className="text-[10px] text-slate-400">Despachados sin lag</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-400">Enrutamiento Cascada</div>
                <div className="text-lg font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Activo</span>
                </div>
                <div className="text-[10px] text-slate-400">&lt;45ms conmutación</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-400">Costo para el Usuario</div>
                <div className="text-lg font-black text-amber-400 mt-1">$0.00 USD</div>
                <div className="text-[10px] text-emerald-400">100% Cubierto por Civer</div>
              </div>
            </div>

            {/* Provider Pools Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nodos del Pool de Cuentas Conectadas en OmniRouter</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {INITIAL_OMNIROUTER_STATUS.pools.map(pool => (
                  <div key={pool.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 transition space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {pool.provider}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1.5">{pool.accountAlias}</h4>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {pool.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cuentas en Pool:</span>
                        <strong className="text-white">{pool.totalAccountsCount} activas</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Saldo/Cuota:</span>
                        <strong className="text-cyan-400">{pool.remainingTokensQuota}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Latencia p99:</span>
                        <strong className="text-emerald-400 font-mono">{pool.latencyMs} ms</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] text-slate-400 mb-1">Modelos Servidos:</div>
                      <div className="flex flex-wrap gap-1">
                        {pool.supportedModels.map((m, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive OmniRouter Prompt Playground */}
            <div className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Consola de Vibe Coding con IA Infinita</h3>
                </div>
                <div className="text-xs text-slate-400">
                  Tokens consumidos en esta sesión: <strong className="text-cyan-400 font-mono">{omniTokensUsed} tok ($0.00 USD)</strong>
                </div>
              </div>

              <form onSubmit={handleRunOmniPrompt} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={omniSelectedModel}
                    onChange={e => setOmniSelectedModel(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono shrink-0"
                  >
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultrarrápido)</option>
                    <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Razonamiento profundo)</option>
                    <option value="deepseek-chat (V3)">DeepSeek V3 (Arquitectura MoE 671B)</option>
                    <option value="deepseek-reasoner (R1)">DeepSeek R1 (Lógica y auditoría)</option>
                    <option value="llama-3.3-70b-versatile">Groq LLaMA 3.3 70B (500 tok/s)</option>
                  </select>

                  <input
                    type="text"
                    value={omniPromptText}
                    onChange={e => setOmniPromptText(e.target.value)}
                    placeholder="Escribe lo que quieres que la IA construya o investigue..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    type="submit"
                    disabled={isOmniGenerating}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isOmniGenerating ? (
                      <>
                        <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Enrutando Pool...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Generar con IA Gratis</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {omniResponseText && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 font-mono text-xs text-cyan-200 whitespace-pre-wrap leading-relaxed">
                  {omniResponseText}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CONVOCATORIAS & COMUNIDAD */}
        {activeTab === 'CONVOCATIONS' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-900/40 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-400" />
                <span>Convocatorias de Participación Remota (Mínimo 2 horas al día)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Buscamos personas de cualquier país con deseos de aprender, colaborar y ganar dinero desde su computadora o teléfono. Todo el soporte de IA y compilación está 100% cubierto por Civer Cloud. Únete a las reuniones quincenales por Zoom o Google Meet y forma parte de la red de software libre que sí paga.
              </p>
            </div>

            {/* Convocations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {INITIAL_CONVOCATIONS.map(conv => {
                const isEnrolled = !!enrolledConvocations[conv.id];
                return (
                  <div key={conv.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-rose-900/60 transition">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {conv.targetRole}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{conv.enrolledCount} / {conv.openSpots} postulan</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-snug">{conv.title}</h3>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Compromiso Requerido:</div>
                        <div className="text-amber-300 font-bold mt-0.5">{conv.requiredTimeCommitment}</div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-300">Requisitos Mínimos:</div>
                        {conv.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-400">
                            <span className="text-rose-400 shrink-0">•</span>
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <div className="text-[11px] font-bold text-emerald-400">Beneficios y Regalías:</div>
                        {conv.benefits.map((ben, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                            <span className="text-emerald-400 shrink-0">✓</span>
                            <span>{ben}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <button
                        onClick={() => handleEnrollConvocation(conv.id)}
                        disabled={isEnrolled}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                          isEnrolled 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default' 
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950'
                        }`}
                      >
                        {isEnrolled ? (
                          <>
                            <CheckCheck className="w-4 h-4" />
                            <span>Postulación Enviada (Activo)</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Postularme a esta Convocatoria</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Community Communication Channels */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Canales de Comunicación del Ecosistema Internacional</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {INITIAL_COMMUNITY_CHANNELS.map(chan => (
                  <div key={chan.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
                          {chan.platform}
                        </span>
                        {chan.isLiveNow && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-950 text-red-300 border border-red-800 animate-pulse flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5" />
                            <span>EN VIVO</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white">{chan.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{chan.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900">
                      <span className="text-[10px] font-mono text-slate-500">{chan.activeMembersCount} miembros</span>
                      <a
                        href={chan.urlOrHandle.startsWith('http') ? chan.urlOrHandle : `https://t.me/${chan.urlOrHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <span>{chan.urlOrHandle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ORGANIGRAMA DE AGENTES IA (12 DEPARTAMENTOS 24/7) */}
        {activeTab === 'DEPARTMENTS' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span>Organigrama Corporativo: 12 Departamentos de Agentes IA Especializados (24/7)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Nuestra empresa opera como un enjambre autónomo con 12 departamentos dirigidos por agentes de inteligencia artificial sin descanso. Ellos gestionan la seguridad, la compilación en la nube, la auditoría de contratos, el enrutamiento de IA y la liquidación de pagos para que los usuarios humanos se concentren en crear y ganar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INITIAL_DEPARTMENTS.map(dept => (
                <div key={dept.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-800/80 transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {dept.code}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-1.5">{dept.name}</h3>
                      <div className="text-[11px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        <span>{dept.leaderAgent}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{dept.status}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dept.mission}
                  </p>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] space-y-1 font-mono">
                    <div className="text-slate-400">Cómputo Asignado:</div>
                    <div className="text-amber-300 font-semibold">{dept.computeAllocated}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Tareas en 24h: <strong className="text-white font-mono">{dept.tasksCompleted24h}</strong></span>
                    <span>En cola: <strong className="text-indigo-400 font-mono">{dept.activeJobsCount}</strong></span>
                  </div>
                </div>
              ))}
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
