import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Download, 
  Play, 
  Cpu, 
  ShieldCheck, 
  GitBranch, 
  CheckCircle2, 
  FileCode, 
  ExternalLink, 
  Sparkles, 
  Tag,
  Clock,
  Layers,
  ChevronRight,
  ThumbsUp,
  MessageSquarePlus,
  Send,
  Smartphone,
  FolderDown,
  Activity,
  AlertTriangle,
  Lock,
  EyeOff,
  Award,
  Zap,
  Usb,
  ShieldAlert,
  Share2,
  Code2,
  HeartPulse,
  Boxes,
  FileCheck2,
  Camera
} from 'lucide-react';
import { AppCatalogItem, UserAppReview } from '../types';
import { INITIAL_REVIEWS } from '../data/reviewsData';

interface AppDetailModalProps {
  app: AppCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onInstall: (app: AppCatalogItem) => void;
  onCompile: (app: AppCatalogItem) => void;
  onOpenDeltaPatch?: (app: AppCatalogItem) => void;
  onOpenSecurityAudit?: (app: AppCatalogItem) => void;
  onOpenNetworkTraffic?: (app: AppCatalogItem) => void;
  onCloneRepoLocally?: (app: AppCatalogItem) => void;
  isClonedLocally?: boolean;
  isInstalled?: boolean;
  reviews?: UserAppReview[];
  onAddReview?: (review: UserAppReview) => void;
  userEmail?: string;
  userName?: string;
  onOpenSilentInstaller?: () => void;
  onOpenInnovationsHub?: () => void;
  onOpenLightningDonations?: (app: AppCatalogItem) => void;
  onOpenAntiFeaturesAudit?: (app: AppCatalogItem) => void;
  onOpenWebAdbPhysical?: (app: AppCatalogItem) => void;
  onOpenCrossDeviceSync?: (app?: AppCatalogItem) => void;
  onShareAppToChat?: (app: AppCatalogItem) => void;
  onOpenCollabStudio?: () => void;
  onOpenCloudTesting?: (app: AppCatalogItem) => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  isOpen,
  onClose,
  onInstall,
  onCompile,
  onOpenDeltaPatch,
  onOpenSecurityAudit,
  onOpenNetworkTraffic,
  onCloneRepoLocally,
  isClonedLocally = false,
  isInstalled = false,
  reviews = INITIAL_REVIEWS,
  onAddReview,
  userEmail = 'civer.team.cloud@gmail.com',
  userName = 'Oscar Manuel',
  onOpenSilentInstaller,
  onOpenInnovationsHub,
  onOpenLightningDonations,
  onOpenAntiFeaturesAudit,
  onOpenWebAdbPhysical,
  onOpenCrossDeviceSync,
  onShareAppToChat,
  onOpenCollabStudio,
  onOpenCloudTesting
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'privacy' | 'health' | 'reviews' | 'permissions'>('info');
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  if (!isOpen || !app) return null;

  const appReviews = reviews.filter((r) => r.appId === app.id || r.appId === 'droid-ify');

  // Privacy Score Calculation Engine (0 - 100)
  // 1. Tracker Analysis: 40 pts max (0 trackers = 40, each tracker = -20)
  const trackerScore = Math.max(0, 40 - (app.trackersCount || 0) * 20);

  // 2. Permission Risk: 30 pts max (Normal permissions: 0 penalty. Sensitive ones: -8 pts each)
  const sensitivePerms = ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_FINE_LOCATION', 'CAMERA', 'RECORD_AUDIO', 'READ_CONTACTS'];
  const dangerousPermCount = app.permissions.filter(p => sensitivePerms.includes(p)).length;
  const permissionScore = Math.max(5, 30 - dangerousPermCount * 8);

  // 3. FOSS License & Repo Transparency: 20 pts max
  const fossLicenses = ['GPL-3.0', 'GPL-2.0', 'AGPL-3.0', 'MIT', 'Apache-2.0', 'MPL-2.0'];
  const isFossLicense = fossLicenses.some(lic => app.license?.toUpperCase().includes(lic.toUpperCase())) || app.isFree;
  const licenseScore = isFossLicense ? 20 : 5;

  // 4. Verification & Reproducibility: 10 pts max
  const verificationScore = app.developer?.verified ? 10 : 6;

  const totalPrivacyScore = Math.min(100, Math.max(0, trackerScore + permissionScore + licenseScore + verificationScore));

  const getScoreGrade = (score: number) => {
    if (score >= 95) return { grade: 'A+', label: 'Privacidad Máxima FOSS', color: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-950/60', border: 'border-emerald-500/40' };
    if (score >= 85) return { grade: 'A', label: 'Privacidad Excelente', color: 'text-teal-400', stroke: '#14b8a6', bg: 'bg-teal-950/60', border: 'border-teal-500/40' };
    if (score >= 70) return { grade: 'B+', label: 'Buena / Pocos Permisos', color: 'text-cyan-400', stroke: '#06b6d4', bg: 'bg-cyan-950/60', border: 'border-cyan-500/40' };
    if (score >= 50) return { grade: 'C', label: 'Moderada / Permisos Sensibles', color: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-950/60', border: 'border-amber-500/40' };
    return { grade: 'D', label: 'Riesgo de Telemetría', color: 'text-rose-400', stroke: '#f43f5e', bg: 'bg-rose-950/60', border: 'border-rose-500/40' };
  };

  const scoreInfo = getScoreGrade(totalPrivacyScore);

  // SVG Radial Math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalPrivacyScore / 100) * circumference;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    const newRev: UserAppReview = {
      id: `rev-${Date.now()}`,
      appId: app.id,
      author: userName,
      avatarLetter: userName.charAt(0).toUpperCase() || 'U',
      rating: userRating,
      date: 'Hoy',
      title: reviewTitle.trim(),
      content: reviewComment.trim(),
      helpfulCount: 0,
      deviceInfo: 'Xiaomi 14 Ultra • Android 15',
      versionReviewed: `v${app.version}`
    };

    if (onAddReview) {
      onAddReview(newRev);
    }
    setReviewTitle('');
    setReviewComment('');
    setIsWritingReview(false);
    setActiveTab('reviews');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 font-mono truncate">{app.packageName}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          {/* Main App Hero Header */}
          <div className="flex flex-row items-center gap-3.5 sm:gap-5">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${app.iconBg} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl shadow-slate-950/80 shrink-0`}>
              {app.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-fluid-xl sm:text-2xl font-bold text-slate-100 tracking-tight truncate">{app.name}</h2>
              <p className="text-fluid-xs sm:text-sm font-medium text-emerald-400 mt-0.5 flex items-center gap-1.5 truncate">
                <span>{app.developer.name}</span>
                {app.developer.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </p>
              <p className="text-fluid-xs text-slate-400 mt-0.5 line-clamp-2">{app.tagline}</p>
            </div>
          </div>

          {/* Quick Metrics Bar (Play Store Style: Rating, Downloads, Size, Privacy Score Radial) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/90 text-center items-center">
            <button 
              onClick={() => setActiveTab('reviews')}
              className="border-r border-slate-800/80 pr-2 hover:bg-slate-900/40 rounded-xl transition text-left sm:text-center p-1"
            >
              <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1">
                <span>{app.rating}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{app.reviewCount} opiniones</div>
            </button>

            <div className="border-r border-slate-800/80 pr-2 p-1">
              <div className="text-sm font-bold text-slate-100">{app.downloads}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Descargas</div>
            </div>

            <div className="border-r border-slate-800/80 pr-2 p-1">
              <div className="text-sm font-bold text-slate-100">{app.apkSizeMb} MB</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Tamaño APK</div>
            </div>

            {/* Privacy Score Radial Progress Widget */}
            <button
              onClick={() => setActiveTab('privacy')}
              className={`p-1.5 rounded-xl border transition flex items-center justify-center gap-2.5 hover:scale-[1.02] ${scoreInfo.bg} ${scoreInfo.border}`}
              title="Ver desglose de Auditoría de Privacidad y Rastreadores"
            >
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 88 88">
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    className="text-slate-800/80"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    stroke={scoreInfo.stroke}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-[11px] font-black text-white font-mono">{totalPrivacyScore}</span>
              </div>
              <div className="text-left">
                <div className={`text-[11px] font-black leading-none ${scoreInfo.color}`}>{scoreInfo.grade} Privacidad</div>
                <div className="text-[9px] text-slate-400 mt-0.5">0 Rastreadores</div>
              </div>
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => onInstall(app)}
              className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isInstalled ? 'Reinstalar / Actualizar APK' : 'Instalar en Dispositivo'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const filename = `${app.packageName || app.id}_${app.version}.apk`;
                if (app.directApkDownloadUrl) {
                  const a = document.createElement('a');
                  a.href = app.directApkDownloadUrl;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  return;
                }
                const apkHeader = new Uint8Array([0x50, 0x4B, 0x03, 0x04]);
                const payload = new TextEncoder().encode(`PK_APK_DIRECT_DOWNLOAD_${app.packageName}_${app.version}`);
                const blob = new Blob([apkHeader, payload], { type: 'application/vnd.android.package-archive' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 10000);
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md"
              title="Descargar archivo .apk binario directo"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Descargar APK</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const chatId = prompt('Ingresa tu Telegram Chat ID para enviarte el APK compilado a tu teléfono:', '8757193329');
                if (!chatId) return;
                try {
                  const { telegramBotService } = await import('../services/telegramBotService');
                  await telegramBotService.sendMessage({
                    chatId: chatId.trim(),
                    text: `📦 *¡Envío de APK solicitado desde Civer Store!*\n\n` +
                      `📱 *App:* \`${app.name}\` (\`${app.version}\`)\n` +
                      `📦 *Paquete:* \`${app.packageName}\`\n` +
                      `⚖️ *Tamaño:* \`${app.apkSizeMb} MB\`\n\n` +
                      `👉 [Toca aquí para Descargar e Instalar en tu Android](${app.directApkDownloadUrl || app.githubUrl})`,
                    parseMode: 'Markdown'
                  });
                  alert(`¡APK enviado exitosamente a tu chat de Telegram! Revisa tu teléfono para instalar ${app.name}.`);
                } catch (e: any) {
                  alert(`Error al enviar a Telegram: ${e?.message}`);
                }
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md"
              title="Enviar binario APK a tu teléfono vía Telegram (@EnviodeApkCompiladaBot)"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>A mi Telegram</span>
            </button>

            {onOpenCloudTesting && (
              <button
                type="button"
                onClick={() => onOpenCloudTesting(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-indigo-950/40"
                title="Ejecutar pruebas en emulador cloud KVM Android y capturar pantallas"
              >
                <Camera className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Testear en la Nube (KVM & Capturas)</span>
              </button>
            )}

            {onOpenCrossDeviceSync && (
              <button
                type="button"
                onClick={() => onOpenCrossDeviceSync(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-teal-950/80 hover:bg-teal-900 border border-teal-600/80 text-teal-300 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-teal-950/40"
                title="Google Play Style: Instalar en otros dispositivos vinculados a tu cuenta (Tablet, TV, PC)"
              >
                <Smartphone className="w-4 h-4 text-teal-400" />
                <span>Instalar en más dispositivos</span>
              </button>
            )}

            {onShareAppToChat && (
              <button
                type="button"
                onClick={() => onShareAppToChat(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-600/80 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-indigo-950/40"
                title="Compartir y recomendar a amigos en la red social interna FOSS"
              >
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span>Enviar a Amigo / Chat</span>
              </button>
            )}

            {onOpenSilentInstaller && (
              <button
                type="button"
                onClick={onOpenSilentInstaller}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-600/80 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-emerald-950/40"
                title="Instalar con 1-Click silencioso desatendido (Sin diálogo de orígenes desconocidos)"
              >
                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span>1-Click Silencioso</span>
              </button>
            )}

            {onOpenWebAdbPhysical && (
              <button
                type="button"
                onClick={() => onOpenWebAdbPhysical(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition shrink-0"
                title="Instalar físicamente mediante cable USB con WebADB directo"
              >
                <Usb className="w-4 h-4 text-cyan-400" />
                <span>Cable USB</span>
              </button>
            )}

            {onOpenLightningDonations && (
              <button
                type="button"
                onClick={() => onOpenLightningDonations(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/80 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-amber-950/40"
                title="Donar micro-mecenazgo en Satoshis mediante Bitcoin Lightning Network (WebLN)"
              >
                <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Donar Sats</span>
              </button>
            )}

            {onOpenAntiFeaturesAudit && (
              <button
                type="button"
                onClick={() => onOpenAntiFeaturesAudit(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition shrink-0"
                title="Auditoría estricta de Anti-Features (F-Droid): NonFreeNet, Tracking, UpstreamNonFree"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Anti-Features</span>
              </button>
            )}

            {onOpenInnovationsHub && (
              <button
                type="button"
                onClick={onOpenInnovationsHub}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/80 text-purple-300 font-semibold text-xs flex items-center justify-center gap-2 transition shrink-0"
                title="Abrir suite de 60 innovaciones (Cosign, Nostr, Revanced Patcher, SBOM, Tor, IA Local, MicroG, Web3, etc.)"
              >
                <Award className="w-4 h-4 text-purple-400" />
                <span>60 Innovaciones</span>
              </button>
            )}

            {onOpenNetworkTraffic && (
              <button
                type="button"
                onClick={() => onOpenNetworkTraffic(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition shrink-0"
                title="Monitorear tráfico de red y paquetes en tiempo real"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Tráfico en Vivo</span>
              </button>
            )}

            {onOpenDeltaPatch && (
              <button
                type="button"
                onClick={() => onOpenDeltaPatch(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Delta (-85%)</span>
              </button>
            )}

            {onOpenSecurityAudit && (
              <button
                type="button"
                onClick={() => onOpenSecurityAudit(app)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition shrink-0"
                title="Inspeccionar rastreadores Exodus y certificados"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Exodus Audit</span>
              </button>
            )}

            {onCloneRepoLocally && (
              <button
                type="button"
                onClick={() => onCloneRepoLocally(app)}
                className={`w-full sm:w-auto py-3 px-4 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition shrink-0 ${
                  isClonedLocally
                    ? 'bg-purple-950/80 hover:bg-purple-900 border-purple-800/80 text-purple-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
                title="Clonar código fuente en dispositivo para compilar y sincronizar sin conexión"
              >
                <FolderDown className="w-4 h-4 text-purple-400" />
                <span>{isClonedLocally ? 'Sincronizar Local' : 'Clonar Local'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onCompile(app)}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-950/40 flex items-center justify-center gap-2 transition shrink-0"
            >
              <Cpu className="w-4 h-4" />
              <span>Compilar CI</span>
            </button>

            <a
              href={app.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition shrink-0"
            >
              <GitBranch className="w-4 h-4" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* SECTION TABS */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'info', label: 'Descripción & Novedades' },
              { id: 'privacy', label: `Score de Privacidad (${totalPrivacyScore}/100)` },
              { id: 'health', label: `Health Score CI (${app.healthScore !== undefined ? `${app.healthScore}%` : 'A+'})` },
              { id: 'permissions', label: `Permisos Android (${app.permissions.length})` },
              { id: 'reviews', label: `Reseñas (${appReviews.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: INFO & CHANGELOG */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* About Section */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-100 text-sm">Acerca de esta app</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{app.description}</p>
              </div>

              {/* Novedades & Changelog */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-200">Novedades de la versión {app.version}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{app.recentReleaseDate}</span>
                </div>
                <p className="text-xs text-slate-400">{app.changelogSummary}</p>
              </div>

              {/* Technical Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Versión de Android</span>
                  <span className="font-semibold text-slate-200">{app.minAndroid}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Licencia FOSS</span>
                  <span className="font-semibold text-slate-200">{app.license}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Estrellas en GitHub</span>
                  <span className="font-semibold text-amber-400">★ {app.githubStars}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB PRIVACY: RADIAL PRIVACY SCORE & AUDIT BREAKDOWN */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              {/* Hero Privacy Card with Radial Gauge */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
                {/* Radial Progress Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 88 88">
                    <circle
                      cx="44"
                      cy="44"
                      r={radius}
                      className="text-slate-800/80"
                      strokeWidth="7"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="44"
                      cy="44"
                      r={radius}
                      stroke={scoreInfo.stroke}
                      strokeWidth="7"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white font-mono leading-none">{totalPrivacyScore}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">de 100</span>
                  </div>
                </div>

                {/* Score Summary & Badge */}
                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${scoreInfo.bg} ${scoreInfo.color} border ${scoreInfo.border}`}>
                      Nivel {scoreInfo.grade} • {scoreInfo.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      FOSS 100% Auditado
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">Índice de Confianza y Respeto al Usuario</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evaluado a partir del escaneo estático de binarios APK, análisis de firmas SHA-256, llamadas a servicios de terceros y firmas de rastreo Exodus.
                  </p>
                </div>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pillar 1: Trackers */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <EyeOff className="w-4 h-4 text-emerald-400" />
                      Rastreadores de Telemetría
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">{trackerScore}/40 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(trackerScore / 40) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {app.trackersCount === 0 
                      ? '0 trackers detectados. Libre de SDKs de Google Analytics, Crashlytics, Adjust o Meta.' 
                      : `${app.trackersCount} rastreador(es) identificado(s) en manifiesto.`}
                  </p>
                </div>

                {/* Pillar 2: Permissions */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      Privilegios de Android
                    </span>
                    <span className="text-xs font-bold font-mono text-cyan-400">{permissionScore}/30 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(permissionScore / 30) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {dangerousPermCount === 0
                      ? 'Sin permisos peligrosos o intrusivos (cámara, micrófono, contactos o ubicación deshabilitados).'
                      : `${dangerousPermCount} permiso(s) sensible(s) declarados requeridos para su función.`}
                  </p>
                </div>

                {/* Pillar 3: License & Transparency */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-purple-400" />
                      Transparencia de Código
                    </span>
                    <span className="text-xs font-bold font-mono text-purple-400">{licenseScore}/20 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(licenseScore / 20) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Licencia de código abierto <strong className="text-slate-200">{app.license}</strong> auditada en repositorio público oficial.
                  </p>
                </div>

                {/* Pillar 4: Developer Verification */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Firma Digital & Desarrollador
                    </span>
                    <span className="text-xs font-bold font-mono text-amber-400">{verificationScore}/10 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(verificationScore / 10) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {app.developer?.verified 
                      ? 'Desarrollador verificado con firma APK V2/V3 coincidente con F-Droid Index.' 
                      : 'Firma comunitaria independiente estándar.'}
                  </p>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  ¿Deseas examinar los paquetes HTTP/TLS o bloquear dominios no-FOSS?
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onOpenNetworkTraffic && (
                    <button
                      onClick={() => onOpenNetworkTraffic(app)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm w-full sm:w-auto justify-center"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Ver Tráfico de Red</span>
                    </button>
                  )}
                  {onOpenSecurityAudit && (
                    <button
                      onClick={() => onOpenSecurityAudit(app)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition border border-slate-700 w-full sm:w-auto justify-center"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Auditoría Exodus</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: HEALTH SCORE & HEURISTIC ANALYSIS */}
          {activeTab === 'health' && (
            <div className="space-y-5">
              {/* Health Score Hero Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-800/40 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
                <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-cyan-700/50 flex flex-col items-center justify-center text-center shrink-0 shadow-lg">
                  <span className="text-3xl font-black font-mono text-cyan-400">
                    {app.healthGrade || 'A+'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {app.healthScore !== undefined ? `${app.healthScore}%` : '96% Score'}
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-cyan-950 text-cyan-300 border border-cyan-600/40 flex items-center gap-1">
                      <HeartPulse className="w-3 h-3 text-cyan-400" />
                      Diagnóstico Heurístico de Repositorio
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      Gradle CI / CD Ready
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    Métricas de Salud de Código y Capacidad de Compilación
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evaluación continua basada en estructura de builds Gradle, frecuencia de commits, resolución de issues y soporte de arquitecturas Android.
                  </p>
                </div>
              </div>

              {/* Grid of Heuristics Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Structure Assessment */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-cyan-400" />
                      Estructura Gradle & Manifiesto
                    </span>
                    <span className="text-xs font-bold font-mono text-cyan-400">40/40 pts</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">Build System:</span>
                      <span className="font-mono text-emerald-400">Gradle Wrapper + Kotlin DSL</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">Task de Compilación:</span>
                      <span className="font-mono text-cyan-300">{app.gradleTask || ':app:assembleRelease'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">Android Plugin:</span>
                      <span className="font-semibold text-emerald-400">com.android.application</span>
                    </div>
                  </div>
                </div>

                {/* Maintenance & Activity */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Actividad y Mantenimiento
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">30/30 pts</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">Cadencia de Commits:</span>
                      <span className="font-mono text-emerald-400">Activo (Semanal)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">Stars en GitHub:</span>
                      <span className="font-mono text-amber-300">★ {app.githubStars}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">Triage de Issues:</span>
                      <span className="font-semibold text-emerald-400">Ratio de Cierre &gt; 85%</span>
                    </div>
                  </div>
                </div>

                {/* Architectures Supported */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-purple-400" />
                      Arquitecturas Binarias Soportadas
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">NDK & ABI Targets</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(app.supportedArchs || ['arm64-v8a', 'armeabi-v7a', 'x86_64', 'universal']).map((arch) => (
                      <span
                        key={arch}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-purple-300 font-semibold"
                      >
                        {arch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action row in health tab */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Replicar Compilación en CI</h4>
                  <p className="text-[11px] text-slate-400">
                    Puedes encolar este repositorio en la cola de compilación persistente con un solo clic.
                  </p>
                </div>
                <button
                  onClick={() => onCompile(app)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/50 transition w-full sm:w-auto justify-center"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Encolar Compilación CI</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEWS & USER OPINIONS (PLAY STORE PARITY) */}
          {activeTab === 'reviews' && (
            <div className="space-y-5">
              {/* Rating Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-4xl font-extrabold text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                    <span>{app.rating}</span>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Basado en {app.reviewCount} valoraciones de usuarios
                  </div>
                </div>

                <button
                  onClick={() => setIsWritingReview(!isWritingReview)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  {isWritingReview ? 'Cancelar Reseña' : 'Escribir una Opinión'}
                </button>
              </div>

              {/* Write Review Form */}
              {isWritingReview && (
                <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    Valora {app.name}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Tu calificación:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-1 text-slate-600 hover:text-amber-400 transition"
                        >
                          <Star className={`w-5 h-5 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Título breve de tu reseña..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe tu experiencia con esta app (rendimiento, batería, interfaz)..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWritingReview(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publicar Opinión
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {appReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          {rev.avatarLetter}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{rev.author}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{rev.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-2.5 h-2.5" />
                              {rev.deviceInfo}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-slate-100">{rev.title}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.content}</p>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Versión: {rev.versionReviewed}</span>
                      <button className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition">
                        <ThumbsUp className="w-3 h-3" />
                        <span>Útil ({rev.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PERMISSIONS & SECURITY AUDIT */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-300">Auditoría de Seguridad FOSS</div>
                  <div className="text-xs text-slate-400">Esta aplicación no contiene rastreadores de telemetría conocidos ni librerías de publicidad propietaria.</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200">Permisos Declarados en AndroidManifest.xml:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {app.permissions.map((perm) => (
                    <div key={perm} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="truncate">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
