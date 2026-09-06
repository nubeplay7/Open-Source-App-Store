import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Award, 
  Smartphone, 
  Key, 
  ShieldCheck, 
  Layout, 
  Moon, 
  HardDrive, 
  Cpu, 
  Check, 
  HelpCircle, 
  Settings, 
  UserCheck, 
  LogOut, 
  Sparkles,
  Zap,
  Layers,
  ShoppingBag,
  Grid,
  History,
  Lightbulb,
  FileCode2,
  Palette,
  Sliders,
  MessageSquare,
  Code2
} from 'lucide-react';
import { DeviceTelemetry, StoreUiMode, UserProfile } from '../types';

interface AccountSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  deviceTelemetry: DeviceTelemetry;
  uiMode: StoreUiMode;
  onSelectUiMode: (mode: StoreUiMode) => void;
  onOpenCompiler: () => void;
  onOpenPublisher: () => void;
  onOpenChangelog?: () => void;
  onOpenProposals?: () => void;
  onOpenArchitectureDocs?: () => void;
  onOpenDesignProfiles?: () => void;
  onOpenFunctionalityProfiles?: () => void;
  onOpenAuthModal?: () => void;
  onOpenCrossDeviceSync?: () => void;
  onOpenSocialChat?: () => void;
  onOpenCollabStudio?: () => void;
}

export const AccountSettingsDrawer: React.FC<AccountSettingsDrawerProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  deviceTelemetry,
  uiMode,
  onSelectUiMode,
  onOpenCompiler,
  onOpenPublisher,
  onOpenChangelog,
  onOpenProposals,
  onOpenArchitectureDocs,
  onOpenDesignProfiles,
  onOpenFunctionalityProfiles,
  onOpenAuthModal,
  onOpenCrossDeviceSync,
  onOpenSocialChat,
  onOpenCollabStudio
}) => {

  const [tokenInput, setTokenInput] = useState(userProfile.githubPat || '');
  const [showTokenSaved, setShowTokenSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'MAIN' | 'DEVICE' | 'GITHUB_TOKEN' | 'UI_THEME'>('MAIN');

  const handleSaveToken = () => {
    onUpdateProfile({ githubPat: tokenInput });
    setShowTokenSaved(true);
    setTimeout(() => setShowTokenSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md h-[92vh] sm:h-[85vh] overflow-hidden shadow-2xl text-slate-100 flex flex-col mt-auto sm:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-sm">Cuenta y Configuración</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* User Account Banner (Screenshot 6 Style) */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 border-2 border-emerald-400 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-emerald-950/40">
                {userProfile.avatarLetter}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100 text-sm truncate">{userProfile.name}</div>
                <div className="text-xs text-slate-400 font-mono truncate">{userProfile.email}</div>
              </div>
              <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full font-medium">
                Principal
              </span>
            </div>

            {/* Play Points Level Bar (Screenshot 6) */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-amber-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Nivel {userProfile.playPointsTier} • {userProfile.playPoints} pts</span>
                </div>
                <span className="text-[10px] text-slate-400">800 pts para Plata</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full w-1/12" />
              </div>
            </div>

            {/* Sistema de Login, Identidad & Sesiones Seguras */}
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 font-semibold text-xs flex items-center justify-between transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sistema de Login, Passkeys & Civer ID</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            )}

            {/* Sincronización Multi-Dispositivo (Play Store / App Store Fleet Sync) */}
            {onOpenCrossDeviceSync && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCrossDeviceSync();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-950/70 hover:bg-teal-900/80 border border-teal-700/60 text-teal-200 font-semibold text-xs flex items-center justify-between transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                  <span>Mis Dispositivos & Sincronización de Apps</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
              </button>
            )}

            {/* Red Social FOSS & Chat Comunitario */}
            {onOpenSocialChat && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSocialChat();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 font-semibold text-xs flex items-center justify-between transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Red Social, Chat & Compartir Apps</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            )}

            {/* Estudio Colaborativo Git (Google Docs Style) */}
            {onOpenCollabStudio && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCollabStudio();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-200 font-semibold text-xs flex items-center justify-between transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Estudio Colaborativo (Código en Vivo & Git)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}
          </div>

          {/* Quick Menu Options (Screenshot 6 style) */}
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 divide-y divide-slate-800/70 overflow-hidden text-xs">
            {/* UI Profile Selector */}
            <div className="p-3.5 space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Layout className="w-4 h-4 text-sky-400" />
                <span>Perfil Visual de la Interfaz</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectUiMode('ciber_store')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    uiMode === 'ciber_store' || uiMode === 'play_store'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] leading-tight">Civer App Store</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectUiMode('dev_workspace')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    uiMode === 'dev_workspace'
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-[11px] leading-tight">Workspace</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectUiMode('matrix_pro')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    uiMode === 'matrix_pro'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Grid className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] leading-tight">Matrix Pro</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectUiMode('app_store')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    uiMode === 'app_store'
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] leading-tight">iOS Style</span>
                </button>
              </div>
            </div>

            {/* Administrar dispositivo y apps */}
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === 'DEVICE' ? 'MAIN' : 'DEVICE')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-medium text-slate-200">Administrar dispositivo y apps</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {deviceTelemetry.model} • {deviceTelemetry.androidVersion}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Device Telemetry Sub-panel */}
            {activeSection === 'DEVICE' && (
              <div className="p-3.5 bg-slate-900/90 space-y-3 font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-slate-400" /> Almacenamiento Interno</span>
                    <span className="text-emerald-400 font-semibold">{deviceTelemetry.storageUsedGb} GB de {deviceTelemetry.storageTotalGb} GB</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(deviceTelemetry.storageUsedGb / deviceTelemetry.storageTotalGb) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">
                    Libres: {(deviceTelemetry.storageTotalGb - deviceTelemetry.storageUsedGb).toFixed(1)} GB
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Memoria RAM</div>
                    <div className="text-slate-200 font-bold">{deviceTelemetry.ramUsedGb} GB / {deviceTelemetry.ramTotalGb} GB</div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Motor Shizuku</div>
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Activo (ADB)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Actions Token Settings */}
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === 'GITHUB_TOKEN' ? 'MAIN' : 'GITHUB_TOKEN')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
            >
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-medium text-slate-200">Token de GitHub Actions & CI</div>
                  <div className="text-[10px] text-slate-400">
                    {userProfile.githubPat ? 'Personal Access Token Configurado' : 'Usando Runners Públicos Compartidos'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {activeSection === 'GITHUB_TOKEN' && (
              <div className="p-3.5 bg-slate-900/90 space-y-3">
                <div className="text-[11px] text-slate-300">
                  Ingresa tu token de GitHub (`ghp_...`) con permisos `repo` y `workflow` para despachar compilaciones en tu propia cuenta.
                </div>
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveToken}
                      className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {showTokenSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Key className="w-3.5 h-3.5" />}
                      <span>{showTokenSaved ? '¡Guardado!' : 'Guardar Token'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Acceso Rápido a Compilador Cloud */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCompiler();
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-medium text-slate-200">Compilador Cloud GitHub Actions</div>
                  <div className="text-[10px] text-slate-400">Ver terminal en vivo y descargar APKs</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Registro de Cambios del Sistema (Changelog Ledger) */}
            {onOpenChangelog && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChangelog();
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium text-slate-200">Registro de Cambios (Changelog)</div>
                    <div className="text-[10px] text-emerald-400">Trazabilidad desde prompt 1 hasta hoy</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* Hub de Sugerencias y Propuestas */}
            {onOpenProposals && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProposals();
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-medium text-slate-200">Sugerir Mejoras & Hub de Propuestas</div>
                    <div className="text-[10px] text-purple-400">Envía ideas con análisis de viabilidad IA</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* Perfiles de Diseño & 8 Paletas */}
            {onOpenDesignProfiles && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDesignProfiles();
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium text-slate-200">Perfiles de Diseño & Paletas de Color</div>
                    <div className="text-[10px] text-emerald-400">8 temas cromáticos, densidad y curvatura</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* Perfiles de Funcionalidades & Feature Flags */}
            {onOpenFunctionalityProfiles && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFunctionalityProfiles();
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-medium text-slate-200">Perfiles de Funcionalidades & Flags</div>
                    <div className="text-[10px] text-purple-400">5 presets de trabajo y 16 módulos configurables</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* Planos y Documentación de Arquitectura */}
            {onOpenArchitectureDocs && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenArchitectureDocs();
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <FileCode2 className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-medium text-slate-200">Planos & Documentación de Módulos</div>
                    <div className="text-[10px] text-blue-400">10 planos técnicos y diagramas de flujo</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}


            {/* Portal de Desarrollador */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPublisher();
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-left"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <div>
                  <div className="font-medium text-slate-200">Portal para Desarrolladores</div>
                  <div className="text-[10px] text-slate-400">Publicar nueva app o repositorio</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Play Protect & Seguridad */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-medium text-slate-200">Play Protect & Verificación</div>
                  <div className="text-[10px] text-emerald-400">Sin aplicaciones dañinas detectadas</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
          FOSS Matrix App Client • Versión 3.2.0 • 100% Cero Rastreadores
        </div>
      </div>
    </div>
  );
};
