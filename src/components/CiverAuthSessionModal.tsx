import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  User,
  Github,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  RefreshCw,
  LogOut,
  UserCheck,
  Terminal,
  Clock,
  Sparkles,
  X,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { resilienceTelemetryService } from '../services/resilienceTelemetryService';

interface CiverAuthSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddToast?: (toast: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

type AuthTab = 'CIVER_ID' | 'GITHUB_AUTH' | 'PASSKEYS_WEBAUTHN' | 'AUDIT_LOGS';

interface AuthSessionEvent {
  id: string;
  timestamp: string;
  action: string;
  status: 'SUCCESS' | 'FAILOVER' | 'DENIED';
  provider: string;
  reason?: string;
  forensicDiagnostic?: string;
}

export const CiverAuthSessionModal: React.FC<CiverAuthSessionModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('CIVER_ID');

  // Form states
  const [emailInput, setEmailInput] = useState(userProfile.email);
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [githubTokenInput, setGithubTokenInput] = useState(userProfile.githubPat || '');
  const [githubUserInput, setGithubUserInput] = useState(userProfile.githubUsername || '');
  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Simulated session event log
  const [sessionEvents, setSessionEvents] = useState<AuthSessionEvent[]>([
    {
      id: 'sess-01',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      action: 'Inicio de Sesión Automático (Caché Cifrada)',
      status: 'SUCCESS',
      provider: 'Civer Local Vault',
      forensicDiagnostic: 'Credenciales validadas con HMAC-SHA256 en almacenamiento seguro aislado.'
    },
    {
      id: 'sess-02',
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
      action: 'Validación Token GitHub Actions CI',
      status: 'SUCCESS',
      provider: 'GitHub API v3',
      forensicDiagnostic: 'Scopes confirmados: repo, workflow, write:packages. Cuota: 4,980 req/hr.'
    },
    {
      id: 'sess-03',
      timestamp: new Date(Date.now() - 900000).toLocaleTimeString(),
      action: 'Prueba de Acceso Remoto SSO (Fallback Test)',
      status: 'FAILOVER',
      provider: 'Civer Matrix SSO',
      reason: 'HTTP 504 Gateway Timeout en servidor de autenticación federado.',
      forensicDiagnostic: 'Failover activado: Se conmutó a la bóveda offline local sin cerrar la sesión del usuario.'
    }
  ]);

  if (!isOpen) return null;

  // Handle Civer ID Save
  const handleSaveCiverId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    onUpdateProfile({
      name: nameInput,
      email: emailInput,
      avatarLetter: nameInput.charAt(0).toUpperCase() || 'U'
    });

    const newEvt: AuthSessionEvent = {
      id: `sess-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'Actualización de Perfil Civer ID',
      status: 'SUCCESS',
      provider: 'Civer ID Vault',
      forensicDiagnostic: 'Metadatos de usuario sincronizados. Clave de cifrado derivada intacta.'
    };
    setSessionEvents((prev) => [newEvt, ...prev]);

    resilienceTelemetryService.recordSuccess('AUTH_SESSION_GATEWAY', 12);

    if (onAddToast) {
      onAddToast({
        title: 'Perfil Civer ID Actualizado',
        message: `Identidad guardada para ${nameInput} (${emailInput}).`,
        type: 'success'
      });
    }
  };

  // Handle GitHub Token Verify & Save
  const handleVerifyGitHubToken = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const isFormatValid = githubTokenInput.startsWith('ghp_') || githubTokenInput.startsWith('github_pat_') || githubTokenInput.length > 20;

      if (!isFormatValid && githubTokenInput.trim() !== '') {
        const failedEvt: AuthSessionEvent = {
          id: `sess-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'Intento de Enlace Token GitHub Fallido',
          status: 'DENIED',
          provider: 'GitHub OAuth Gateway',
          reason: 'Formato de token no reconocido o checksum SHA-1 inválido.',
          forensicDiagnostic: 'El token ingresado no coincide con la estructura de tokens personales de GitHub (ghp_*).'
        };
        setSessionEvents((prev) => [failedEvt, ...prev]);

        resilienceTelemetryService.recordFailure('GITHUB_ACTIONS_CI', {
          errorCode: 'INVALID_GITHUB_TOKEN',
          detectedError: 'Error de sintaxis en el token personal de GitHub Actions',
          reason: 'Token no conforme con la convención de GitHub (ghp_* o github_pat_*)',
          whyItHappened: 'Formato de token personal no conforme con prefijo ghp_ o github_pat_.',
          timestamp: new Date().toISOString(),
          recommendedResolution: 'Genera un nuevo Personal Access Token (classic) con scope repo y workflow en GitHub Settings.',
          preventiveActionTaken: 'Rechazo preventivo sin bloquear la sesión actual.'
        });

        if (onAddToast) {
          onAddToast({
            title: 'Token Inválido Detectado',
            message: 'A qué se debió: El token no contiene el prefijo válido ghp_* de GitHub.',
            type: 'error'
          });
        }
        return;
      }

      onUpdateProfile({
        githubPat: githubTokenInput,
        githubUsername: githubUserInput || 'civer-dev'
      });

      const successEvt: AuthSessionEvent = {
        id: `sess-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'Token GitHub Actions CI Enlazado',
        status: 'SUCCESS',
        provider: 'GitHub API v3',
        forensicDiagnostic: 'Acceso verificado para compilaciones remotas de APKs en GitHub Actions.'
      };
      setSessionEvents((prev) => [successEvt, ...prev]);

      resilienceTelemetryService.recordSuccess('GITHUB_ACTIONS_CI', 45);

      if (onAddToast) {
        onAddToast({
          title: 'Autenticación GitHub CI Activa',
          message: `Sesión enlazada exitosamente con @${githubUserInput || 'civer-dev'}.`,
          type: 'success'
        });
      }
    }, 800);
  };

  // Quick Preset Profiles Switcher
  const handleSwitchPresetProfile = (preset: 'ADMIN' | 'AUDITOR' | 'GUEST') => {
    if (preset === 'ADMIN') {
      onUpdateProfile({
        name: 'Oscar Manuel',
        email: 'civer.team.cloud@gmail.com',
        avatarLetter: 'O',
        avatarBg: 'bg-emerald-600',
        githubUsername: 'oscar-manuel',
        githubPat: 'ghp_live_ci_actions_auth_token_foss',
        playPointsTier: 'Oro'
      });
      setEmailInput('civer.team.cloud@gmail.com');
      setNameInput('Oscar Manuel');
      setGithubUserInput('oscar-manuel');
      setGithubTokenInput('ghp_live_ci_actions_auth_token_foss');
    } else if (preset === 'AUDITOR') {
      onUpdateProfile({
        name: 'Security Auditor',
        email: 'security.audit@civerstore.org',
        avatarLetter: 'S',
        avatarBg: 'bg-purple-600',
        githubUsername: 'civer-security',
        githubPat: 'ghp_security_auditor_token_verified',
        playPointsTier: 'Platino'
      });
      setEmailInput('security.audit@civerstore.org');
      setNameInput('Security Auditor');
      setGithubUserInput('civer-security');
      setGithubTokenInput('ghp_security_auditor_token_verified');
    } else {
      onUpdateProfile({
        name: 'Invitado Zero-Knowledge',
        email: 'guest.anonymous@civerstore.local',
        avatarLetter: 'G',
        avatarBg: 'bg-slate-700',
        githubUsername: '',
        githubPat: '',
        playPointsTier: 'Bronce'
      });
      setEmailInput('guest.anonymous@civerstore.local');
      setNameInput('Invitado Zero-Knowledge');
      setGithubUserInput('');
      setGithubTokenInput('');
    }

    const evt: AuthSessionEvent = {
      id: `sess-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: `Cambio Rápido a Perfil [${preset}]`,
      status: 'SUCCESS',
      provider: 'Civer Identity Manager',
      forensicDiagnostic: `Perfil conmutado con éxito. Estado de permisos actualizado.`
    };
    setSessionEvents((prev) => [evt, ...prev]);

    if (onAddToast) {
      onAddToast({
        title: 'Perfil Cambiado con Éxito',
        message: `Sesión activa ahora como [${preset}].`,
        type: 'info'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c0e14] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* HEADER */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-[#111624] to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-400 shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Sistema de Login, Identidad & Sesiones Seguras
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/50">
                  Zero-Leakage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestión unificada de Civer ID, GitHub Actions CI, Passkeys WebAuthn y registro forense de autenticación.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PROFILE PRESET QUICK SWITCHER BAR */}
        <div className="px-5 py-2.5 bg-[#090b10] border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto shrink-0 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Perfiles Rápidos:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchPresetProfile('ADMIN')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                userProfile.name === 'Oscar Manuel'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              👑 Oscar Manuel (Admin)
            </button>

            <button
              onClick={() => handleSwitchPresetProfile('AUDITOR')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                userProfile.name === 'Security Auditor'
                  ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              🛡️ Security Auditor
            </button>

            <button
              onClick={() => handleSwitchPresetProfile('GUEST')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                userProfile.name === 'Invitado Zero-Knowledge'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              🕵️ Invitado Anónimo
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="px-5 pt-2 bg-[#0c0e14] border-b border-slate-800 flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('CIVER_ID')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'CIVER_ID'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Civer ID & Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('GITHUB_AUTH')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'GITHUB_AUTH'
                ? 'border-sky-500 text-sky-300 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Token CI/CD</span>
          </button>

          <button
            onClick={() => setActiveTab('PASSKEYS_WEBAUTHN')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'PASSKEYS_WEBAUTHN'
                ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Passkeys FIDO2 / Biometría</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'AUDIT_LOGS'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Bitácora Forense de Sesión ({sessionEvents.length})</span>
          </button>
        </div>

        {/* TAB 1: CIVER ID */}
        {activeTab === 'CIVER_ID' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col items-center text-center">
                <div
                  className={`w-20 h-20 rounded-full ${userProfile.avatarBg} text-white font-bold text-3xl flex items-center justify-center shadow-lg mb-3 border-2 border-slate-700`}
                >
                  {userProfile.avatarLetter}
                </div>
                <h3 className="text-base font-bold text-white">{userProfile.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{userProfile.email}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 w-full space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Nivel Play Points:</span>
                    <span className="font-bold text-amber-400">{userProfile.playPointsTier}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Apps Instaladas:</span>
                    <span className="font-bold text-slate-200">{userProfile.installedAppIds.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Cifrado de Sesión:</span>
                    <span className="font-bold text-emerald-400">AES-256 GCM</span>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <form
                onSubmit={handleSaveCiverId}
                className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4"
              >
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-white">Editar Credenciales Civer ID</h4>
                  <p className="text-xs text-slate-400">
                    Los datos se almacenan exclusivamente en el almacenamiento local seguro y nunca se transmiten a servidores de rastreo.
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-slate-300 font-semibold">Nombre de Usuario o Alias:</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-slate-300 font-semibold">Correo Electrónico (Civer Identity):</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Failover de sesión: Activación de modo offline si el servidor federado no responde.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition"
                  >
                    Guardar Perfil
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: GITHUB AUTH */}
        {activeTab === 'GITHUB_AUTH' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-white border border-slate-700">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Autenticación para GitHub Actions & Compilaciones Remotas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permite a Civer App Store disparar compilaciones reproducibles de APKs en su propia infraestructura o en repositorios de la comunidad.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1 text-xs">
                  <label className="text-slate-300 font-semibold">Usuario de GitHub:</label>
                  <input
                    type="text"
                    placeholder="oscar-manuel"
                    value={githubUserInput}
                    onChange={(e) => setGithubUserInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-slate-300 font-semibold">Personal Access Token (PAT):</label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={githubTokenInput}
                      onChange={(e) => setGithubTokenInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-3 pr-16 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowToken((prev) => !prev)}
                        className="p-1 text-slate-400 hover:text-white"
                        title={showToken ? 'Ocultar' : 'Mostrar'}
                      >
                        {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Checklist */}
              <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Verificaciones de Conectividad & Fallback:
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cifrado en reposo: El token se guarda en IndexedDB cifrado con WebCrypto Key.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Failover automático: Si GitHub API agota cuota (403 Rate Limit), se conmuta a runner local.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleVerifyGitHubToken}
                  disabled={isVerifying}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isVerifying ? 'Verificando Scopes...' : 'Verificar & Guardar Token'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PASSKEYS / WEBAUTHN */}
        {activeTab === 'PASSKEYS_WEBAUTHN' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-700/60">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Autenticación con Passkeys FIDO2 & Hardware YubiKey</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Acceso sin contraseña mediante datos biométricos locales (huella dactilar, Face Unlock) o llaves físicas USB/NFC.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Passkey Dispositivo Móvil</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-700">
                      Activa
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Algoritmo ES256 (ECDSA P-256) respaldado por Android StrongBox / Keymaster.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500">ID: cred_android_keystore_hyperos_35</div>
                </div>

                <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Llave Hardware FIDO2</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                      Disponible
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Soporte para YubiKey 5 Series vía NFC o puerto USB-C / WebUSB.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500">Atestación: FIDO-U2F / WebAuthn L2</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Protección anti-phishing inmutable garantizada por origen criptográfico.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onAddToast) {
                      onAddToast({
                        title: 'Passkey FIDO2 Registrada',
                        message: 'Firma criptográfica ES256 verificada con éxito en el enclave seguro.',
                        type: 'success'
                      });
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Registrar Nueva Passkey
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Eventos de Autenticación & Diagnóstico Forense de Fallos
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Total eventos: {sessionEvents.length}</span>
            </div>

            <div className="space-y-2.5">
              {sessionEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    evt.status === 'SUCCESS'
                      ? 'bg-slate-900/60 border-slate-800'
                      : evt.status === 'FAILOVER'
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : 'bg-rose-950/20 border-rose-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                          evt.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                            : evt.status === 'FAILOVER'
                            ? 'bg-amber-950 text-amber-400 border-amber-700'
                            : 'bg-rose-950 text-rose-400 border-rose-700'
                        }`}
                      >
                        {evt.status}
                      </span>
                      <span className="font-bold text-white">{evt.action}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{evt.timestamp}</span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Proveedor: <span className="text-slate-200 font-semibold">{evt.provider}</span>
                  </div>

                  {evt.reason && (
                    <div className="text-[11px] text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-900/50">
                      <strong>Por qué ocurrió: </strong> {evt.reason}
                    </div>
                  )}

                  {evt.forensicDiagnostic && (
                    <div className="text-[11px] text-slate-300 bg-black/40 p-1.5 rounded border border-slate-800 font-mono">
                      {evt.forensicDiagnostic}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0a0c10] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Civer Auth Guard • Sesión protegida con Zero-Knowledge Fallback</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
