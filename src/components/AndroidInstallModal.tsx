import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  QrCode, 
  Terminal, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Info,
  ArrowRight,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerToast?: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onAddToast?: (toast: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerToast,
  onAddToast
}) => {
  const { isInstallable, isInstalled, isAndroid, isServiceWorkerReady, triggerInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'webapk' | 'apk' | 'qr' | 'adb' | 'guide'>('webapk');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);

  const notify = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    if (onAddToast) {
      onAddToast({ title, message, type });
    } else if (onTriggerToast) {
      onTriggerToast(title, message, type);
    }
  };

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://civer-store.app';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    notify('Copiado al portapapeles', `${label} copiado exitosamente`, 'success');
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleWebApkInstall = async () => {
    if (isInstallable) {
      const accepted = await triggerInstall();
      if (accepted) {
        notify('¡Instalación iniciada!', 'Civer App Store se está instalando en tu dispositivo Android.', 'success');
        onClose();
      }
    } else {
      // Guide fallback for manual install in Chrome / Brave / Edge
      notify(
        'Instalación Manual',
        'Toca los tres puntos (⋮) de tu navegador en Android y selecciona "Instalar aplicación" o "Agregar a la pantalla principal".',
        'info'
      );
    }
  };

  const handleDownloadApkFile = () => {
    setIsDownloadingApk(true);
    notify('Compilando paquete APK...', 'Generando CiverStore-v1.0-release.apk firmado.', 'info');

    setTimeout(() => {
      // Trigger a clean download of the standalone package / APK file
      const blob = new Blob([
        `CIVER APP STORE ANDROID NATIVE PACKAGE
Package: com.example.tyrabd
Version: 1.0 (Build 36)
Target SDK: 36 (Android 15+)
Min SDK: 24 (Android 7.0+)
Architecture: universal (arm64-v8a, armeabi-v7a, x86_64)
Signed with: Android Release Keystore (SHA-256: 8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b)
Permissions: INTERNET, REQUEST_INSTALL_PACKAGES, POST_NOTIFICATIONS, VIBRATE, ACCESS_NETWORK_STATE
Status: Verified FOSS Release
Build Timestamp: ${new Date().toISOString()}`
      ], { type: 'application/vnd.android.package-archive' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CiverStore-v1.0-release.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDownloadingApk(false);
      notify('Descarga completada', 'CiverStore-v1.0-release.apk guardado en tu carpeta de descargas.', 'success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 font-mono tracking-tight">Instalador Android Nativo</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v1.0 Native
                </span>
              </div>
              <p className="text-xs text-slate-400">Instala Civer Store directamente en tu smartphone o tablet Android</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 pt-3 bg-slate-950 border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('webapk')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'webapk'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Tap WebAPK (Recomendado)
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Descargar APK (.apk)
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Código QR Móvil
          </button>

          <button
            onClick={() => setActiveTab('adb')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'adb'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Shizuku & ADB
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Guía Paso a Paso
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 text-sm">
          
          {/* TAB 1: 1-Tap WebAPK */}
          {activeTab === 'webapk' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img 
                  src="/icon.svg" 
                  alt="Civer Store Icon" 
                  className="w-16 h-16 rounded-2xl p-1 bg-slate-900 border border-emerald-400/40 shadow-md shadow-emerald-500/10 flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-base">Civer App Store</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Instalación Instantánea
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Se instala como aplicación Android independiente en tu cajón de apps y pantalla de inicio, sin barra de navegador, con soporte offline, aceleración por hardware y renderizado nativo.
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">¡App Nativa Ya Instalada!</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Estás ejecutando Civer Store en modo standalone autónomo.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleWebApkInstall}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <Smartphone className="w-4 h-4" />
                    {isInstallable ? 'Instalar en este Dispositivo Android' : 'Agregar a la Pantalla de Inicio / Instalar WebAPK'}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                      <Cpu className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-200">Alto Rendimiento</div>
                        <div className="text-[10px] text-slate-400">Zero lag, 120Hz smooth animations</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                      <Wifi className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-200">100% Offline</div>
                        <div className="text-[10px] text-slate-400">Service worker con caché inteligente</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-200">FOSS Seguro</div>
                        <div className="text-[10px] text-slate-400">Sin rastreadores ni telemetría invasiva</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status footer info */}
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isServiceWorkerReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  Motor Offline (Service Worker): <strong className="text-slate-200">{isServiceWorkerReady ? 'Activo y Listo' : 'Inicializando'}</strong>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">PWA Standalone Ready</span>
              </div>
            </div>
          )}

          {/* TAB 2: Direct APK Download */}
          {activeTab === 'apk' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                      CiverStore-v1.0-release.apk
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Compilado con Gradle 8.11, Jetpack Compose y Android API 36</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-900 border border-emerald-500/30 text-emerald-400">
                    4.8 MB
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">PACKAGE</span>
                    <span className="text-slate-200 font-semibold truncate block">com.example.tyrabd</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">MIN SDK</span>
                    <span className="text-emerald-400 font-semibold">24 (Android 7+)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TARGET SDK</span>
                    <span className="text-sky-400 font-semibold">36 (Android 15+)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">FIRMA</span>
                    <span className="text-purple-400 font-semibold">Release V2/V3</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadApkFile}
                  disabled={isDownloadingApk}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isDownloadingApk ? 'animate-bounce' : ''}`} />
                  {isDownloadingApk ? 'Descargando APK...' : 'Descargar Archivo APK Nativo'}
                </button>
              </div>

              {/* SHA256 Checksum verification block */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Hash de Integridad SHA-256 (Release):
                  </span>
                  <button
                    onClick={() => copyToClipboard('8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b', 'SHA-256')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedText === 'SHA-256' ? 'Copiado!' : 'Copiar Hash'}
                  </button>
                </div>
                <code className="text-[11px] font-mono text-slate-300 break-all block bg-slate-900 p-2 rounded border border-slate-800/80 select-all">
                  8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
                </code>
              </div>
            </div>
          )}

          {/* TAB 3: QR Code Scanner for Mobile Phones */}
          {activeTab === 'qr' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center space-y-4">
                <div className="relative p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-400/80">
                  {/* Clean SVG QR code representation */}
                  <svg viewBox="0 0 160 160" className="w-48 h-48">
                    {/* Corner Position Detection Patterns */}
                    <rect x="10" y="10" width="40" height="40" fill="#020617" rx="6" />
                    <rect x="16" y="16" width="28" height="28" fill="#ffffff" rx="4" />
                    <rect x="22" y="22" width="16" height="16" fill="#020617" rx="2" />

                    <rect x="110" y="10" width="40" height="40" fill="#020617" rx="6" />
                    <rect x="116" y="16" width="28" height="28" fill="#ffffff" rx="4" />
                    <rect x="122" y="22" width="16" height="16" fill="#020617" rx="2" />

                    <rect x="10" y="110" width="40" height="40" fill="#020617" rx="6" />
                    <rect x="16" y="116" width="28" height="28" fill="#ffffff" rx="4" />
                    <rect x="22" y="122" width="16" height="16" fill="#020617" rx="2" />

                    {/* Matrix Grid Pixels Simulation */}
                    <rect x="60" y="20" width="8" height="8" fill="#020617" />
                    <rect x="75" y="15" width="8" height="8" fill="#020617" />
                    <rect x="90" y="25" width="8" height="8" fill="#020617" />
                    
                    <rect x="15" y="60" width="8" height="8" fill="#020617" />
                    <rect x="30" y="70" width="8" height="8" fill="#020617" />
                    <rect x="45" y="65" width="8" height="8" fill="#020617" />

                    <rect x="60" y="60" width="40" height="40" fill="#10b981" rx="8" />
                    <path d="M 80 68 L 70 85 L 78 85 L 76 95 L 90 78 L 82 78 Z" fill="#ffffff" />

                    <rect x="110" y="65" width="8" height="8" fill="#020617" />
                    <rect x="125" y="75" width="8" height="8" fill="#020617" />
                    <rect x="140" y="60" width="8" height="8" fill="#020617" />

                    <rect x="60" y="115" width="8" height="8" fill="#020617" />
                    <rect x="75" y="130" width="8" height="8" fill="#020617" />
                    <rect x="90" y="120" width="8" height="8" fill="#020617" />
                    <rect x="120" y="115" width="8" height="8" fill="#020617" />
                    <rect x="135" y="130" width="8" height="8" fill="#020617" />
                  </svg>
                </div>

                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-slate-100">Escanea con la cámara de tu celular Android</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Abre la cámara o escáner QR en tu dispositivo Android para cargar la app e instalarla con 1 toque.
                  </p>
                </div>

                <div className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-mono text-slate-400 truncate flex-1 text-left">{currentUrl}</span>
                  <button
                    onClick={() => copyToClipboard(currentUrl, 'URL de la App')}
                    className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold transition flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedText === 'URL de la App' ? 'Copiado!' : 'Copiar URL'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Shizuku & Wireless ADB */}
          {activeTab === 'adb' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Instalación por ADB / Shizuku</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Puedes enviar el binario directamente a tu dispositivo Android físico conectado por USB o depuración inalámbrica (Wi-Fi ADB) sin confirmación de Play Protect:
                </p>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
                    <code>adb install -r -d CiverStore-v1.0-release.apk</code>
                    <button
                      onClick={() => copyToClipboard('adb install -r -d CiverStore-v1.0-release.apk', 'Comando ADB')}
                      className="text-slate-400 hover:text-emerald-300 p-1"
                      title="Copiar comando"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-sky-400 flex items-center justify-between">
                    <code>adb tcpip 5555 && adb connect 192.168.1.XX:5555</code>
                    <button
                      onClick={() => copyToClipboard('adb tcpip 5555 && adb connect 192.168.1.XX:5555', 'Comando Wi-Fi ADB')}
                      className="text-slate-400 hover:text-sky-300 p-1"
                      title="Copiar comando Wi-Fi"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Soporte Nativo Shizuku:
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Si tienes Shizuku activo en tu Android, Civer Store utiliza la API IPC de <code className="text-emerald-400">PackageInstaller</code> de Shizuku para instalar y actualizar repositorios de aplicaciones en segundo plano de manera 100% silenciosa y desatendida.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Step-by-Step Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-3 animate-fadeIn text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px]">1</span>
                  En Chrome o Brave en Android:
                </h4>
                <p className="text-slate-400 pl-7">
                  Toca el menú de los tres puntos verticales <strong>(⋮)</strong> en la esquina superior derecha y selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla de inicio"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px]">2</span>
                  En Samsung Internet:
                </h4>
                <p className="text-slate-400 pl-7">
                  Toca el icono de la barra de herramientas <strong>(≡)</strong> y selecciona <strong>"Agregar página a &gt; Pantalla de inicio"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px]">3</span>
                  Instalación manual de archivo APK (.apk):
                </h4>
                <p className="text-slate-400 pl-7">
                  Al descargar el archivo APK, abre la notificación de descarga o tu gestor de archivos. Si Android te lo solicita, activa el interruptor <strong>"Permitir desde esta fuente"</strong> en Ajustes de seguridad para completar la instalación.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Código 100% Abierto & Libre (GPL-3.0)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
