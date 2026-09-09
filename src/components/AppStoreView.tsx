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
  onOpenCiCdEvidence?: () => void;
}

type IosTab = 'TODAY' | 'GAMES' | 'APPS' | 'MY_APPS' | 'COMPILER' | 'SEARCH';
type CatalogSourceFilter = 'ALL' | 'COMMUNITY' | 'OWNED';

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
  onOpenBlueprint,
  onOpenCiCdEvidence
}) => {
  const [activeTab, setActiveTab] = useState<IosTab>('TODAY');
  const [sourceFilter, setSourceFilter] = useState<CatalogSourceFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const todayApp = catalog[0]; // Droid-ify
  const secondApp = catalog[3]; // Seal

  const isAppOwnedByUser = (app: AppCatalogItem) => {
    if (app.isUserApp) return true;
    if (userProfile.githubUsername && app.githubUrl?.toLowerCase().includes(userProfile.githubUsername.toLowerCase())) return true;
    if (userProfile.customRepos && userProfile.customRepos.some(repo => app.githubUrl?.toLowerCase().includes(repo.toLowerCase()))) return true;
    if (userProfile.forkedApps && userProfile.forkedApps[app.id]) return true;
    return false;
  };

  const filteredApps = catalog.filter((app) => {
    const matchesSearch = !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (sourceFilter === 'OWNED') {
      return isAppOwnedByUser(app);
    }
    if (sourceFilter === 'COMMUNITY') {
      return !isAppOwnedByUser(app);
    }
    return true;
  });

  const myApps = catalog.filter(isAppOwnedByUser);

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
              {activeTab === 'MY_APPS' && 'Mis Apps Creadas'}
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
            {/* Hero Card 0: Descarga Oficial del APK de Civer App Store */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <Smartphone className="w-64 h-64 text-emerald-400" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
                      APLICACIÓN ANDROID OFICIAL • v1.0.3
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Build 3 • 13.1 MB</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Lleva Civer App Store en tu móvil
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Instala la plataforma completa en tu smartphone. Descarga e instala apps FOSS sin restricciones, compila proyectos desde el móvil y mantente siempre al día con actualizaciones automáticas OTA inalámbricas.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-300 font-mono">
                    <span>✓ Instalación 1-Click (Shizuku)</span>
                    <span>•</span>
                    <span>✓ Auto-Actualización OTA</span>
                    <span>•</span>
                    <span>✓ Cero Rastreadores</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 flex-wrap">
                  <a
                    href="/downloads/com.civer.appstore-v1.0.3-release.apk"
                    download="com.civer.appstore-v1.0.3-release.apk"
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 transition hover:scale-105"
                  >
                    <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Descargar APK Oficial</span>
                  </a>

                  {onOpenCiCdEvidence && (
                    <button
                      onClick={onOpenCiCdEvidence}
                      className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
                      title="Ver Mega-Matriz de Certificación y Evidencias CI/CD en Vivo"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Evidencias CI/CD</span>
                    </button>
                  )}

                  <button
                    onClick={onOpenCompiler}
                    className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>Compilar en la Nube</span>
                  </button>
                </div>
              </div>
            </div>

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
            {/* Filter Pills Bar & Upload Own Repo CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setSourceFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    sourceFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todas ({catalog.length})
                </button>
                <button
                  onClick={() => setSourceFilter('COMMUNITY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    sourceFilter === 'COMMUNITY'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Comunidad FOSS
                </button>
                <button
                  onClick={() => setSourceFilter('OWNED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    sourceFilter === 'OWNED'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Creadas por Mí ({myApps.length})
                </button>
              </div>

              <button
                onClick={onOpenPublisher}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Subir Mi Repositorio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredApps.map((app) => (
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
                        {isAppOwnedByUser(app) && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[9px] font-bold">
                            Mía
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{app.developer.name}</p>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">{app.tagline}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">{app.apkSizeMb} MB</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompileApp(app);
                        }}
                        className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-900/60 text-indigo-300 text-[11px] font-semibold transition"
                        title="Compilar con OmniBuild"
                      >
                        Compilar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInstallApp(app);
                        }}
                        className="px-3.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                      >
                        OBTENER
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY APPS TAB */}
        {activeTab === 'MY_APPS' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-950 rounded-3xl p-6 border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4" /> BÓVEDA DE AUTORÍA & CÓDIGO PROPIO
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  Mis Aplicaciones y Repositorios
                </h3>
                <p className="text-xs text-slate-300 mt-2 max-w-xl">
                  Publica tu propio código fuente en el catálogo unificado de Civer App Store, compílalo en la nube con OmniBuild (Kaggle/GitHub/ThinkPad) y distribuye el APK compilado directamente a tus usuarios o a Telegram.
                </p>
              </div>

              <button
                onClick={onOpenPublisher}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Subir Nuevo Repositorio</span>
              </button>
            </div>

            {myApps.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <GitBranch className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-100">Aún no has registrado repositorios propios</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Conecta cualquier repositorio de GitHub (público o privado) para que forme parte de tu catálogo personal, se compile con un solo clic y esté disponible para todos tus dispositivos.
                  </p>
                </div>
                <button
                  onClick={onOpenPublisher}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                >
                  Registrar Mi Primer Repositorio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {myApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    className="bg-slate-900/90 hover:bg-slate-800 border border-emerald-800/40 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${app.iconBg} flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0`}>
                        {app.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs truncate">{app.name}</h4>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[9px] font-bold">
                            Autor
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{app.githubUrl}</p>
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1">{app.tagline}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">{app.apkSizeMb} MB</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompileApp(app);
                          }}
                          className="px-3 py-1 rounded-full bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold transition border border-emerald-800/60"
                        >
                          Compilar OmniBuild
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInstallApp(app);
                          }}
                          className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                        >
                          OBTENER
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            onClick={() => setActiveTab('MY_APPS')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'MY_APPS' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <GitBranch className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Mis Apps</span>
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
