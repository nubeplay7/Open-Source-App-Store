import React, { useState } from 'react';
import { 
  Sliders, 
  Terminal, 
  ShieldCheck, 
  ShoppingBag, 
  Lock, 
  BatteryCharging, 
  Check, 
  RefreshCw, 
  X, 
  Info, 
  Cpu, 
  KeyRound, 
  FolderGit2, 
  Layers, 
  DownloadCloud, 
  Share2, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Star,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { FeatureFlagsConfig, FunctionalityPreset, FunctionalityProfile } from '../types';
import { FUNCTIONALITY_PROFILES, ALL_FEATURES_ENABLED } from '../data/functionalityProfilesData';

interface FunctionalityProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  flags: FeatureFlagsConfig;
  onUpdateFlags: (newFlags: FeatureFlagsConfig) => void;
  activePreset: FunctionalityPreset;
  onSelectPreset: (preset: FunctionalityPreset) => void;
  onAddToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const FunctionalityProfilesModal: React.FC<FunctionalityProfilesModalProps> = ({
  isOpen,
  onClose,
  flags,
  onUpdateFlags,
  activePreset,
  onSelectPreset,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'PRESETS' | 'GRANULAR_FLAGS'>('PRESETS');

  if (!isOpen) return null;

  const handleApplyPreset = (profile: FunctionalityProfile) => {
    onSelectPreset(profile.id);
    onUpdateFlags({ ...profile.features });
    if (onAddToast) {
      onAddToast(
        'Perfil de Funcionalidad Aplicado',
        `Se activó el perfil "${profile.name}". Se reconfiguraron los módulos sin eliminar ningún componente.`,
        'success'
      );
    }
  };

  const handleToggleFlag = (key: keyof FeatureFlagsConfig) => {
    const updated = { ...flags, [key]: !flags[key] };
    onUpdateFlags(updated);
    onSelectPreset('CUSTOM');
    if (onAddToast) {
      onAddToast(
        'Característica Actualizada',
        `Se ${updated[key] ? 'habilitó' : 'pausó'} el módulo "${key}".`,
        'info'
      );
    }
  };

  const handleEnableAll = () => {
    onUpdateFlags({ ...ALL_FEATURES_ENABLED });
    onSelectPreset('FULL_POWER_DEV');
    if (onAddToast) {
      onAddToast('Todas las Funciones Habilitadas', 'Se activaron las 16 capacidades de la plataforma Civer App Store.', 'success');
    }
  };

  // Count active flags
  const activeCount = Object.values(flags).filter(Boolean).length;
  const totalCount = Object.keys(flags).length;

  const flagCategories = [
    {
      categoryName: 'Cloud CI/CD & Compilación en la Nube',
      icon: Terminal,
      items: [
        {
          key: 'enableGitHubCompiler' as keyof FeatureFlagsConfig,
          title: 'Compilador en la Nube (GitHub Actions)',
          desc: 'Permite compilar APKs desde repositorios GitHub mediante workflows remotos con logs en tiempo real.',
          icon: Terminal
        },
        {
          key: 'enableBuildsHub' as keyof FeatureFlagsConfig,
          title: 'Hub de Compilaciones & Galería de Evidencias',
          desc: 'Centro de control de artefactos con comprobación de hashes SHA-256 e historial de compilaciones.',
          icon: Cpu
        },
        {
          key: 'enableLocalRepoCloning' as keyof FeatureFlagsConfig,
          title: 'Clonado Local de Código Fuente',
          desc: 'Almacena y sincroniza árboles Git en /storage/emulated/0/CiberDev/src/ para desarrollo offline.',
          icon: FolderGit2
        }
      ]
    },
    {
      categoryName: 'Seguridad, Criptografía & Kernel',
      icon: Lock,
      items: [
        {
          key: 'enableKeystoreVault' as keyof FeatureFlagsConfig,
          title: 'Bóveda Criptográfica de Llaves (Keystore Vault)',
          desc: 'Gestión de certificados RSA 4096 / ECDSA con esquemas de firma APK v1 a v4.',
          icon: KeyRound
        },
        {
          key: 'enableShizukuInstaller' as keyof FeatureFlagsConfig,
          title: 'Instalador Shizuku Binder (ADB sin Root)',
          desc: 'Despliegue silencioso desatendido de APKs comunicándose con el servicio PackageInstaller de Android.',
          icon: ShieldCheck
        },
        {
          key: 'enableSecurityAudit' as keyof FeatureFlagsConfig,
          title: 'Auditor de Rastreadores Exodus & Permisos',
          desc: 'Inspección de firmas de telemetría y permisos peligrosos en cada archivo APK antes de instalar.',
          icon: Lock
        }
      ]
    },
    {
      categoryName: 'Repositorios, Delta Updates & Rendimiento',
      icon: DownloadCloud,
      items: [
        {
          key: 'enableCustomRepoManager' as keyof FeatureFlagsConfig,
          title: 'Gestor de Repositorios Descentralizados',
          desc: 'Soporte para añadir URLs y códigos QR de repositorios F-Droid de terceros y mirrors.',
          icon: Share2
        },
        {
          key: 'enableDeltaPatching' as keyof FeatureFlagsConfig,
          title: 'Actualizaciones Delta Binarias (Bsdiff/Zstd)',
          desc: 'Ahorra hasta 90% de ancho de banda descargando únicamente las diferencias entre versiones.',
          icon: DownloadCloud
        },
        {
          key: 'enableRepoIndexSync' as keyof FeatureFlagsConfig,
          title: 'Sincronización en Streaming de Índices V2',
          desc: 'Worker asíncrono para procesar entry.json sin sobrecargar la memoria heap.',
          icon: RefreshCw
        },
        {
          key: 'enableDeviceDiagnostics' as keyof FeatureFlagsConfig,
          title: 'Telemetría de Hardware & Sensores en Vivo',
          desc: 'Monitoreo de almacenamiento, memoria RAM disponible y estado de Play Protect.',
          icon: Cpu
        }
      ]
    },
    {
      categoryName: 'Workspace de Ingeniería, Gobernanza & Comunidad',
      icon: BookOpen,
      items: [
        {
          key: 'enableWorkspaceCollab' as keyof FeatureFlagsConfig,
          title: 'Civer Dev Workspace (Obsidian + Jira + Slack)',
          desc: 'Entorno de planeación viva con notas Markdown, tablero Kanban y canales de discusión técnica.',
          icon: BookOpen
        },
        {
          key: 'enableChangelogLedger' as keyof FeatureFlagsConfig,
          title: 'Registro de Cambios del Sistema (Changelog Ledger)',
          desc: 'Bitácora histórica inmutable de iteraciones, fases arquitectónicas y roadmap.',
          icon: FileText
        },
        {
          key: 'enableCommunityProposals' as keyof FeatureFlagsConfig,
          title: 'Hub de Propuestas Comunitarias Asistido por IA',
          desc: 'Sistema de sugerencias, votaciones y análisis de viabilidad técnica (1-100).',
          icon: MessageSquare
        },
        {
          key: 'enableArchitectureDocs' as keyof FeatureFlagsConfig,
          title: 'Documentación Modular & Planos del Sistema',
          desc: 'Especificaciones técnicas detalladas y contratos de entrada/salida de cada capa.',
          icon: Layers
        },
        {
          key: 'enableCommandPalette' as keyof FeatureFlagsConfig,
          title: 'Paleta de Comandos Global (Ctrl+K / Cmd+K)',
          desc: 'Acceso rápido mediante teclado a cualquier herramienta, modal o vista del sistema.',
          icon: Terminal
        },
        {
          key: 'enableReviewsAndRatings' as keyof FeatureFlagsConfig,
          title: 'Sistema de Reseñas, Calificaciones & Puntos Play',
          desc: 'Opiniones de usuarios, desglose de estrellas y gamificación comunitaria.',
          icon: Star
        }
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Perfiles de Funcionalidades & Feature Flags</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-800/60 rounded-full">
                  {activeCount}/{totalCount} Activos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Alterna entre perfiles de trabajo o activa/pausa capacidades individuales sin romper la compatibilidad
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnableAll}
              title="Habilitar todas las funciones"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors border border-slate-700 text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Habilitar Todo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('PRESETS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'PRESETS'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Perfiles Predefinidos (Presets)
            </button>
            <button
              onClick={() => setActiveTab('GRANULAR_FLAGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'GRANULAR_FLAGS'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Matriz Granular de Feature Flags (16)
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
            <span>Perfil actual:</span>
            <span className="font-semibold text-purple-400">
              {activePreset === 'CUSTOM' ? 'Personalizado (Custom)' : activePreset}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PRESETS */}
          {activeTab === 'PRESETS' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Los perfiles configuran rápidamente qué componentes están visibles y activos. 
                  <strong> Ningún módulo se elimina ni se sobrescribe</strong>; puedes volver a habilitar cualquier función en cualquier momento.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {FUNCTIONALITY_PROFILES.map((profile) => {
                  const isSelected = activePreset === profile.id;
                  const profileActiveCount = Object.values(profile.features).filter(Boolean).length;
                  return (
                    <div
                      key={profile.id}
                      onClick={() => handleApplyPreset(profile)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                          : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            {profile.id === 'FULL_POWER_DEV' && <Terminal className="w-4 h-4" />}
                            {profile.id === 'PURIST_FOSS' && <ShieldCheck className="w-4 h-4" />}
                            {profile.id === 'CASUAL_APP_STORE' && <ShoppingBag className="w-4 h-4" />}
                            {profile.id === 'SECURITY_AUDITOR' && <Lock className="w-4 h-4" />}
                            {profile.id === 'ULTRA_BATTERY_SAVER' && <BatteryCharging className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-100">{profile.name}</h3>
                              {isSelected && (
                                <span className="px-2 py-0.5 bg-purple-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> ACTIVO
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-purple-300 font-medium">{profile.tagline}</div>
                          </div>
                        </div>

                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-semibold shrink-0">
                          {profileActiveCount}/16 Módulos
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mt-2 pl-10">
                        {profile.description}
                      </p>

                      <div className="mt-3 pl-10 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-400">Recomendado para:</span>
                        <span>{profile.recommendedFor}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GRANULAR FEATURE FLAGS */}
          {activeTab === 'GRANULAR_FLAGS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Personaliza cada tecnología individualmente según tus necesidades.</span>
                <span className="font-semibold text-purple-400">{activeCount} de {totalCount} habilitadas</span>
              </div>

              {flagCategories.map((category, catIdx) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={catIdx} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <CategoryIcon className="w-3.5 h-3.5 text-purple-400" />
                      {category.categoryName}
                    </h3>

                    <div className="grid grid-cols-1 gap-2.5">
                      {category.items.map((item) => {
                        const isEnabled = Boolean(flags[item.key]);
                        const ItemIcon = item.icon;
                        return (
                          <div
                            key={item.key}
                            onClick={() => handleToggleFlag(item.key)}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                              isEnabled
                                ? 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800'
                                : 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-80'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                isEnabled 
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}>
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-100">{item.title}</span>
                                  {isEnabled ? (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/40">
                                      ACTIVO
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                                      PAUSADO
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                              </div>
                            </div>

                            {/* Toggle Switch */}
                            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                              isEnabled ? 'bg-purple-600' : 'bg-slate-700'
                            }`}>
                              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Todos los cambios son no destructivos y reversibles en cualquier instante.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md shadow-purple-600/20"
          >
            Guardar & Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
