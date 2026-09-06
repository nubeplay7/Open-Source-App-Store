import React, { useState } from 'react';
import { 
  Compass, 
  Gamepad2, 
  Layers, 
  Search, 
  Cpu, 
  Star, 
  Download, 
  Sparkles, 
  ChevronRight, 
  GitBranch, 
  ShieldCheck, 
  Upload,
  User,
  History,
  Lightbulb,
  FileCode2,
  Smartphone,
  MessageSquare,
  Code2,
  HeartPulse,
  Database,
  Bot,
  GraduationCap
} from 'lucide-react';
import { AppCatalogItem, UserProfile } from '../types';

interface AppStoreViewProps {
  catalog: AppCatalogItem[];
  userProfile: UserProfile;
  onSelectApp: (app: AppCatalogItem) => void;
  onInstallApp: (app: AppCatalogItem) => void;
  onCompileApp: (app: AppCatalogItem) => void;
  onOpenAccountDrawer: () => void;
  onOpenCompiler: () => void;
  onOpenPublisher: () => void;
  onOpenChangelog?: () => void;
  onOpenProposals?: () => void;
  onOpenArchitectureDocs?: () => void;
  onOpenCrossDeviceSync?: (app?: AppCatalogItem) => void;
  onOpenSocialChat?: () => void;
  onOpenCollabStudio?: () => void;
  onOpenRepoSync?: () => void;
  onOpenAgentOrchestrator?: () => void;
  onOpenAgentAcademy?: () => void;
  onOpenBlueprint?: () => void;
}

type IosTab = 'TODAY' | 'GAMES' | 'APPS' | 'COMPILER' | 'SEARCH';

export const AppStoreView: React.FC<AppStoreViewProps> = ({
  catalog,
  userProfile,
  onSelectApp,
  onInstallApp,
  onCompileApp,
  onOpenAccountDrawer,
  onOpenCompiler,
  onOpenPublisher,
  onOpenChangelog,
  onOpenProposals,
  onOpenArchitectureDocs,
  onOpenCrossDeviceSync,
  onOpenSocialChat,
  onOpenCollabStudio,
  onOpenRepoSync,
  onOpenAgentOrchestrator,
  onOpenAgentAcademy,
  onOpenBlueprint
}) => {
  const [activeTab, setActiveTab] = useState<IosTab>('TODAY');
  const [searchQuery, setSearchQuery] = useState('');

  const todayApp = catalog[0]; // Droid-ify
  const secondApp = catalog[3]; // Seal

  const filteredApps = catalog.filter(
    (app) =>
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans select-none">
      {/* iOS Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900/80 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'TODAY' && 'Hoy'}
              {activeTab === 'GAMES' && 'Juegos'}
              {activeTab === 'APPS' && 'Apps'}
              {activeTab === 'COMPILER' && 'Compilador'}
              {activeTab === 'SEARCH' && 'Buscar'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenCrossDeviceSync && (
              <button
                onClick={() => onOpenCrossDeviceSync()}
                title="Sincronización de Dispositivos (iCloud / Fleet Sync)"
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-teal-950/70 border border-teal-800/70 text-teal-300 text-xs font-semibold hover:bg-teal-900/70 transition flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dispositivos</span>
              </button>
            )}

            {onOpenSocialChat && (
              <button
                onClick={onOpenSocialChat}
                title="Comunidad & Chat FOSS"
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/70 text-indigo-300 text-xs font-semibold hover:bg-indigo-900/70 transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Chat</span>
              </button>
            )}

            {onOpenCollabStudio && (
              <button
                onClick={onOpenCollabStudio}
                title="Estudio Colaborativo Git"
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/70 transition flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Colaborar</span>
              </button>
            )}

            {onOpenRepoSync && (
              <button
                onClick={onOpenRepoSync}
                title="Repo Sync & Health Score Hub"
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/70 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/70 transition flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Repo Sync</span>
              </button>
            )}

            {onOpenAgentOrchestrator && (
              <button
                onClick={onOpenAgentOrchestrator}
                title="Agent Orchestrator Hub & MCP Telemetry"
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-purple-950/70 border border-purple-800/70 text-purple-300 text-xs font-semibold hover:bg-purple-900/70 transition flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Agents</span>
              </button>
            )}

            {onOpenAgentAcademy && (
              <button
                onClick={onOpenAgentAcademy}
                title="Agent Academy & Interactive Architecture Tutorials"
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/70 transition flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Academy</span>
              </button>
            )}

            {onOpenChangelog && (
              <button
                onClick={onOpenChangelog}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/60 transition"
              >
                <History className="w-3.5 h-3.5" />
                <span>Changelog</span>
              </button>
            )}

            {onOpenProposals && (
              <button
                onClick={onOpenProposals}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-semibold hover:bg-purple-900/60 transition"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Propuestas</span>
              </button>
            )}

            <button
              onClick={onOpenAccountDrawer}
              className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center hover:ring-2 hover:ring-indigo-500 transition shadow-md"
            >
              {userProfile.avatarLetter}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        {/* TODAY TAB */}
        {activeTab === 'TODAY' && (
          <div className="space-y-8">
            {/* Editorial Card 1: App del Día */}
            {todayApp && (
              <div
                onClick={() => onSelectApp(todayApp)}
                className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 border border-emerald-800/40 p-6 sm:p-8 cursor-pointer shadow-2xl transition hover:scale-[1.01]"
              >
                <div className="space-y-2 max-w-md">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    APP DEL DÍA • FOSS DESTACADO
                  </span>
                  <h2 className="text-3xl font-extrabold text-white leading-tight">
                    {todayApp.name}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {todayApp.tagline}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${todayApp.iconBg} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {todayApp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{todayApp.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{todayApp.price}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInstallApp(todayApp);
                    }}
                    className="px-6 py-2 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-emerald-400 hover:text-slate-950 transition shadow-lg"
                  >
                    OBTENER
                  </button>
                </div>
              </div>
            )}

            {/* Editorial Card 2: Cloud Compiler Highlight */}
            <div
              onClick={onOpenCompiler}
              className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 border border-indigo-800/40 p-6 sm:p-8 cursor-pointer shadow-2xl transition hover:scale-[1.01]"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                POTENCIA CLOUD
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                Compilador de APKs en GitHub Actions
              </h3>
              <p className="text-xs text-slate-300 mt-2 max-w-lg">
                Olvídate de configurar Android Studio y Gradle localmente. Compila cualquier proyecto open source en la nube y obtén tu APK firmado listo para instalar.
              </p>
              <div className="mt-6 flex justify-end">
                <span className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition">
                  PROBAR COMPILADOR
                </span>
              </div>
            </div>

            {/* List of Recommended Apps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Apps Esenciales</h3>
                <button onClick={() => setActiveTab('APPS')} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                  Ver todo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catalog.slice(1, 7).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl ${app.iconBg} flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md`}>
                        {app.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs truncate">{app.name}</h4>
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono text-[9px] font-bold">
                            {app.healthGrade || 'A+'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{app.tagline}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-mono">★ {app.rating}</span>
                          <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-0.5">
                            <HeartPulse className="w-2.5 h-2.5" />
                            {app.healthScore !== undefined ? `${app.healthScore}%` : '96%'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInstallApp(app);
                      }}
                      className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs transition shrink-0"
                    >
                      OBTENER
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* APPS TAB */}
        {activeTab === 'APPS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {catalog.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${app.iconBg} flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0`}>
                      {app.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-xs truncate">{app.name}</h4>
                        <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono text-[9px] font-bold">
                          {app.healthGrade || 'A+'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{app.developer.name}</p>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">{app.tagline}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">{app.apkSizeMb} MB</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInstallApp(app);
                      }}
                      className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                    >
                      OBTENER
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'SEARCH' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar apps, repositorios y clientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-3">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  className="bg-slate-900/70 hover:bg-slate-800/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl ${app.iconBg} flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0`}>
                      {app.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{app.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{app.tagline}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInstallApp(app);
                    }}
                    className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs transition shrink-0"
                  >
                    OBTENER
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* iOS Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-900 px-6 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('TODAY')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'TODAY' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Hoy</span>
          </button>

          <button
            onClick={() => setActiveTab('APPS')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'APPS' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Apps</span>
          </button>

          <button
            onClick={onOpenCompiler}
            className="flex flex-col items-center gap-1 transition text-slate-500 hover:text-indigo-400"
          >
            <Cpu className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Compilar CI</span>
          </button>

          <button
            onClick={() => setActiveTab('SEARCH')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'SEARCH' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Buscar</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
