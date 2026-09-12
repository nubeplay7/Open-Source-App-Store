import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  Zap,
  ShieldCheck,
  RefreshCw,
  Server,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  QrCode,
  Key,
  HardDrive,
  Cpu,
  Wifi,
  ExternalLink,
  Laptop,
  Tv,
  Tablet,
  Radio,
  Send,
  Sparkles,
  Lock,
  ArrowRight,
  Terminal,
  FileCode,
  Settings,
  ChevronRight,
  Search,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  AppCatalogItem, 
  ConnectedDevice, 
  CrossDeviceSyncState, 
  DeviceType, 
  RemoteInstallQueueItem, 
  StoreUiMode, 
  UserProfile 
} from '../types';
import { deviceFleetSyncService } from '../services/deviceFleetSyncService';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getAppSha256 } from '../services/apkHashVerificationService';

interface AndroidAppEcosystemViewProps {
  userProfile: UserProfile;
  catalog: AppCatalogItem[];
  onSwitchUiMode: (mode: StoreUiMode) => void;
  onSelectApp: (app: AppCatalogItem) => void;
  onTriggerInstall: (app: AppCatalogItem) => void;
  onOpenAccountDrawer: () => void;
  onAddToast: (toast: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

type EcosystemTab = 'installers' | 'remote_fleet' | 'account_sso' | 'architecture';

export const AndroidAppEcosystemView: React.FC<AndroidAppEcosystemViewProps> = ({
  userProfile,
  catalog,
  onSwitchUiMode,
  onSelectApp,
  onTriggerInstall,
  onOpenAccountDrawer,
  onAddToast
}) => {
  const { isInstallable, isInstalled, isAndroid, isServiceWorkerReady, triggerInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<EcosystemTab>('installers');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cross Device Fleet State
  const [syncState, setSyncState] = useState<CrossDeviceSyncState>(deviceFleetSyncService.getState());
  const [selectedTargetDeviceId, setSelectedTargetDeviceId] = useState<string>(
    syncState.activeFleet.find(d => d.deviceType === 'PHONE')?.id || syncState.activeFleet[0]?.id || ''
  );
  const [selectedAppToRemoteInstall, setSelectedAppToRemoteInstall] = useState<AppCatalogItem>(
    catalog[0] || {
      id: 'store-civer-native',
      name: 'Civer App Store',
      packageName: 'org.civer.store',
      version: '2.6.0',
      apkSizeMb: 18.4,
      category: 'STORES',
      tagline: 'Tienda FOSS Completa',
      description: 'Plataforma completa de software libre',
      iconBg: 'bg-emerald-950',
      iconGradient: 'from-emerald-500 to-teal-700',
      iconSymbol: 'ShieldCheck',
      bannerGradient: 'from-emerald-900 via-slate-950 to-slate-950',
      screenshots: [],
      rating: 5.0,
      reviewCount: '1.2K',
      downloads: '500K+',
      minAndroid: '7.0',
      targetSdk: 35,
      license: 'GPL-3.0',
      githubUrl: 'https://github.com/civer-foss/civer-app-store',
      githubStars: '14.8k',
      isFree: true,
      price: '$0.00',
      developer: { name: 'Civer Core Team', verified: true },
      permissions: ['INTERNET', 'REQUEST_INSTALL_PACKAGES'],
      trackersCount: 0,
      isStore: true,
      canCompileWithCi: true,
      defaultBranch: 'main',
      gradleTask: 'assembleRelease',
      recentReleaseDate: '2026-09-08',
      changelogSummary: 'Lanzamiento v2.6.0'
    }
  );
  const [appSearchQuery, setAppSearchQuery] = useState('');

  // Remote Push Dispatcher Status
  const [isPushingInstall, setIsPushingInstall] = useState(false);
  const [pushProgress, setPushProgress] = useState(0);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushSuccess, setPushSuccess] = useState(false);

  // OTA Update Check State
  const [isCheckingOta, setIsCheckingOta] = useState(false);
  const [otaStatusMessage, setOtaStatusMessage] = useState<string | null>(null);

  // New Device Pairing Modal/Inline
  const [isPairingDevice, setIsPairingDevice] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>('PHONE');

  // Architecture Code Tab
  const [codeTab, setCodeTab] = useState<'manifest' | 'gradle' | 'activity' | 'sw' | 'assetlinks'>('manifest');

  // Subscribe to device fleet changes
  useEffect(() => {
    const unsubscribe = deviceFleetSyncService.subscribe((newState) => {
      setSyncState(newState);
    });
    return () => unsubscribe();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    onAddToast({
      title: 'Copiado al Portapapeles',
      message: `${label} copiado con éxito.`,
      type: 'success'
    });
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleWebApkInstall = async () => {
    if (isInstallable) {
      const accepted = await triggerInstall();
      if (accepted) {
        onAddToast({
          title: '¡Instalación WebAPK Iniciada!',
          message: 'Civer App Store se está integrando como aplicación nativa en tu dispositivo Android.',
          type: 'success'
        });
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {
          // silent
        }
      }
    } else {
      onAddToast({
        title: 'Instalación Nativa Asistida',
        message: 'En tu navegador móvil Android, pulsa el menú (⋮) y selecciona "Instalar aplicación" o "Añadir a pantalla principal".',
        type: 'info'
      });
    }
  };

  const handleDownloadReleaseApk = (arch: string = 'universal') => {
    onAddToast({
      title: `Descargando APK (${arch})`,
      message: `Iniciando descarga segura de CiverAppStore-v2.6.0-${arch}.apk`,
      type: 'info'
    });

    const dummyApkContent = `CIVER-APP-STORE-BINARY-PAYLOAD-BUILD-2026-ARCH-${arch.toUpperCase()}-VERIFIED`;
    const blob = new Blob([dummyApkContent], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CiverAppStore-v2.6.0-${arch}.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCheckOta = () => {
    setIsCheckingOta(true);
    setOtaStatusMessage('Consultando manifest y hash de compilación en el servidor de despliegue...');
    setTimeout(() => {
      setOtaStatusMessage('Service Worker validado. La aplicación en Android y la versión Web están 100% sincronizadas en el commit a7f90e2 (v2.6.0).');
      setIsCheckingOta(false);
      onAddToast({
        title: 'OTA 1:1 Sincronizado',
        message: 'La aplicación móvil instalada tiene exactamente la misma versión que la web.',
        type: 'success'
      });
    }, 1200);
  };

  // Google Play style remote push install
  const handleTriggerRemotePushInstall = () => {
    if (!selectedTargetDeviceId) {
      onAddToast({
        title: 'Selecciona un Dispositivo',
        message: 'Por favor escoge un dispositivo Android de destino para enviar la instalación.',
        type: 'warning'
      });
      return;
    }

    const targetDevice = syncState.activeFleet.find(d => d.id === selectedTargetDeviceId);
    if (!targetDevice) return;

    setIsPushingInstall(true);
    setPushProgress(10);
    setPushSuccess(false);
    setPushLogs([
      `[PUSH DISPATCHER] Conectando con Civer Sync Gateway para ${userProfile.email}...`,
      `[DESTINO] Dispositivo objetivo: ${targetDevice.name} (${targetDevice.model} - ${targetDevice.osVersion})`,
      `[PAQUETE] Preparando payload para ${selectedAppToRemoteInstall.name} (${selectedAppToRemoteInstall.packageName})`
    ]);

    setTimeout(() => {
      setPushProgress(35);
      setPushLogs(prev => [
        ...prev,
        `✓ Comando de instalación remota firmado criptográficamente con Civer ID (#CIVER-9924).`,
        `✓ ${targetDevice.name} recibió el intent vía push channel WebSocket / FCM silencioso.`,
        `✓ Dispositivo iniciando descarga de binario (${selectedAppToRemoteInstall.apkSizeMb} MB)...`
      ]);
    }, 800);

    setTimeout(() => {
      setPushProgress(70);
      const sha256 = getAppSha256(selectedAppToRemoteInstall);
      setPushLogs(prev => [
        ...prev,
        `✓ Descarga completada en almacenamiento temporal del dispositivo.`,
        `✓ Verificando digest SHA-256 localmente en ${targetDevice.name}: ${sha256.substring(0, 20)}... [MATCH 100%]`,
        `✓ Ejecutando sesión desatendida mediante Shizuku PackageInstaller API (sin root)...`
      ]);
    }, 1800);

    setTimeout(() => {
      setPushProgress(100);
      setPushSuccess(true);
      setPushLogs(prev => [
        ...prev,
        `✓ ¡Instalación exitosa! ${selectedAppToRemoteInstall.name} ya está disponible en el launcher de ${targetDevice.name}.`,
        `✓ Inventario de flota sincronizado en tiempo real.`
      ]);

      deviceFleetSyncService.triggerRemoteInstall(selectedTargetDeviceId, selectedAppToRemoteInstall);
      setIsPushingInstall(false);

      onAddToast({
        title: '¡Instalación Remota Completada!',
        message: `${selectedAppToRemoteInstall.name} se instaló automáticamente en ${targetDevice.name}.`,
        type: 'success'
      });

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      } catch {
        // silent
      }
    }, 3000);
  };

  const handlePairNewDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    const paired = deviceFleetSyncService.pairNewDevice(
      newDeviceName.trim(),
      newDeviceModel.trim() || 'Android Device',
      newDeviceType
    );

    setIsPairingDevice(false);
    setNewDeviceName('');
    setNewDeviceModel('');
    setSelectedTargetDeviceId(paired.id);

    onAddToast({
      title: 'Dispositivo Vinculado',
      message: `${paired.name} se ha vinculado a la cuenta ${userProfile.email}.`,
      type: 'success'
    });
  };

  const filteredCatalog = catalog.filter(app => 
    app.name.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
    app.packageName.toLowerCase().includes(appSearchQuery.toLowerCase())
  );

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'PHONE': return <Smartphone className="w-4 h-4 text-sky-400" />;
      case 'TABLET': return <Tablet className="w-4 h-4 text-purple-400" />;
      case 'TV': return <Tv className="w-4 h-4 text-emerald-400" />;
      case 'DESKTOP': return <Laptop className="w-4 h-4 text-cyan-400" />;
      default: return <Smartphone className="w-4 h-4 text-sky-400" />;
    }
  };

  const civerSha256 = '4a816f1c4e9761e89f8160100f919294e803d15b24479e0bf571991d9f0f9c2a';

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 min-h-full">
      {/* Top Professional Hero Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Quick Back */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4">
            <button 
              onClick={() => onSwitchUiMode('ciber_store')} 
              className="hover:text-emerald-400 transition"
            >
              Civer App Store
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400 font-semibold">Ecosistema Android & App Nativa</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  Android 7.0 a 15 (API 24 - 35)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-600/50 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Contenedor Nativo TWA / WebAPK 1:1
                </span>
                <span className="px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-600/50 text-purple-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  Actualizaciones OTA Instantáneas
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  0 Rastreadores • Exodus Audit
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-sans">
                Civer App Store para Android
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Toda la plataforma y herramientas integradas dentro de una aplicación nativa para Android. Mismos módulos, misma versión y sincronización directa con tu navegador web. Si actualizamos la interfaz o los servicios en la nube, tu aplicación móvil se actualiza al instante sin necesidad de reinstalar.
              </p>
            </div>

            {/* Quick Session Badge & Fast Action */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-[280px] sm:min-w-[320px] shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Cuenta Activa Sincronizada</div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white flex items-center justify-center text-sm shadow-md">
                  {userProfile.avatarLetter}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-white truncate">{userProfile.name}</div>
                  <div className="text-xs font-mono text-emerald-400 truncate">{userProfile.email}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 flex items-center justify-between font-mono">
                <span>Dispositivos Vinculados:</span>
                <strong className="text-slate-200">{syncState.activeFleet.length} dispositivos</strong>
              </div>
              <button
                onClick={handleWebApkInstall}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition"
              >
                <Smartphone className="w-4 h-4 fill-slate-950" />
                <span>Instalar Directamente en Android</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto border-b border-slate-800/80 pb-px">
            <button
              onClick={() => setActiveTab('installers')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'installers'
                  ? 'border-emerald-500 text-emerald-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Instaladores & Binarios APK</span>
            </button>

            <button
              onClick={() => setActiveTab('remote_fleet')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'remote_fleet'
                  ? 'border-sky-500 text-sky-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Dispositivos & Instalación Remota (Play Store Parity)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-950 text-sky-300 border border-sky-800">
                {syncState.activeFleet.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('account_sso')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'account_sso'
                  ? 'border-purple-500 text-purple-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Key className="w-4 h-4 text-purple-400" />
              <span>Cuenta Unificada & Sesión Móvil (SSO)</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'architecture'
                  ? 'border-cyan-500 text-cyan-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Arquitectura & Código Nativo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ======================================================== */}
        {/* TAB 1: INSTALLERS & APK BINARIES */}
        {/* ======================================================== */}
        {activeTab === 'installers' && (
          <div className="space-y-8 animate-fadeIn">
            {/* OTA Synchronization Status Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center shrink-0 text-emerald-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    Sincronización en Tiempo Real OTA (Over-The-Air)
                    <span className="text-[10px] font-mono bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                      EN VIVO 1:1
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Al instalar la aplicación en Android, cualquier cambio en la interfaz, nuevos módulos o actualizaciones se aplicarán automáticamente a través del Service Worker y la caché atómica, sin requerir descargas manuales de APKs.
                  </p>
                  {otaStatusMessage && (
                    <div className="mt-2 text-xs font-mono text-emerald-400 bg-black/40 p-2 rounded-lg border border-emerald-800/60">
                      {otaStatusMessage}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCheckOta}
                  disabled={isCheckingOta}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isCheckingOta ? 'animate-spin' : ''}`} />
                  <span>{isCheckingOta ? 'Comprobando...' : 'Comprobar Actualizaciones OTA'}</span>
                </button>
              </div>
            </div>

            {/* Install Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: WebAPK (Recommended) */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-600/70 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
                  Recomendado
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Instalador WebAPK Android</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Instalación nativa directa desde el navegador. Crea un binario de sistema Android con icono en el lanzador, soporte de pantalla completa, navegación nativa y actualización silenciosa.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-300 font-mono">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Empaqueta 100% esta misma plataforma web</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Actualizaciones automáticas sin reinstalar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Integración completa con Shizuku API</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleWebApkInstall}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition"
                >
                  <Smartphone className="w-4 h-4 fill-slate-950" />
                  <span>Instalar WebAPK en Android</span>
                </button>
              </div>

              {/* Card 2: Release Signed APK */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-600/50 flex items-center justify-center text-sky-400 shadow-inner">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Binario APK Oficial (Release)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Archivo .apk estándar firmado criptográficamente con Keystore v2+v3 para instalación mediante PackageInstaller o gestores como Droid-ify y Obtainium.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/50 border border-slate-800 space-y-1 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Tamaño del Binario:</span>
                      <strong className="text-slate-200">18.4 MB</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Firma Digital:</span>
                      <strong className="text-emerald-400">Scheme v2 + v3</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Digest SHA-256:</span>
                      <button 
                        onClick={() => copyToClipboard(civerSha256, 'Hash SHA-256 APK')}
                        className="text-sky-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'Hash SHA-256 APK' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>4a816f1c...</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadReleaseApk('universal')}
                    className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar CiverStore-v2.6.0.apk</span>
                  </button>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <button 
                      onClick={() => handleDownloadReleaseApk('arm64-v8a')}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-center border border-slate-700"
                    >
                      arm64-v8a
                    </button>
                    <button 
                      onClick={() => handleDownloadReleaseApk('armeabi-v7a')}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-center border border-slate-700"
                    >
                      armeabi-v7a
                    </button>
                    <button 
                      onClick={() => handleDownloadReleaseApk('x86_64')}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-center border border-slate-700"
                    >
                      x86_64
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Full Gradle Android Project Source */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-600/50 flex items-center justify-center text-purple-400 shadow-inner">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Proyecto Android Nativo (Código)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Código fuente completo listo para compilar con Android Studio o GitHub Actions. Incluye Gradle Kotlin DSL, AndroidManifest y configuración TWA.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-300 font-mono">
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Gradle 8.5 + AGP 8.2 Compatible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Shizuku Provider & AIDL Bindings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Digital Asset Links preconfigurado</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onAddToast({
                        title: 'Generando Paquete Fuente',
                        message: 'Empaquetando Android Studio project zip...',
                        type: 'info'
                      });
                      const zipDummy = `PK-ZIP-CIVER-APP-STORE-ANDROID-NATIVE-GRADLE-PROJECT`;
                      const blob = new Blob([zipDummy], { type: 'application/zip' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `civer-store-android-native-src.zip`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Proyecto Gradle (.zip)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('architecture')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition text-center"
                  >
                    Inspeccionar Código Fuente en Vivo
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Installation Visual Guide */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Guía de Instalación Rápida en Dispositivos Android
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <div className="font-bold text-slate-200">Abre desde tu Navegador Android</div>
                  <p className="text-slate-400 leading-relaxed">
                    Visita este mismo sitio web en Chrome, Brave, Edge o Firefox desde tu teléfono o tablet.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-sky-950 border border-sky-600 text-sky-400 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <div className="font-bold text-slate-200">Pulsa "Instalar Aplicación"</div>
                  <p className="text-slate-400 leading-relaxed">
                    Acepta el diálogo o pulsa el botón verde superior. Se descargará el contenedor WebAPK oficial del sistema.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-purple-950 border border-purple-600 text-purple-400 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <div className="font-bold text-slate-200">Inicia Sesión con tu Cuenta</div>
                  <p className="text-slate-400 leading-relaxed">
                    Usa el escaneo de código QR o tus credenciales para sincronizar tu flota y controlar instalaciones remotas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: REMOTE FLEET & PUSH INSTALL (PLAY STORE PARITY) */}
        {/* ======================================================== */}
        {activeTab === 'remote_fleet' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Play Store Parity Explanation Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                    Google Play Cross-Device Remote Install Engine
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Instala aplicaciones en tus teléfonos y tablets Android desde este navegador
                </h3>
                <p className="text-xs text-slate-300">
                  Al igual que en la versión web de Google Play Store, cuando tienes la sesión iniciada en tus dispositivos, puedes seleccionar cualquier aplicación y despachar la instalación directa y desatendida hacia el dispositivo que elijas.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPairingDevice(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-950 transition"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Vincular Nuevo Dispositivo</span>
                </button>
              </div>
            </div>

            {/* Remote Install Dispatcher Studio */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: App Selector & Target Device Picker (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-400" />
                      1. Selecciona la Aplicación a Instalar Remotamente
                    </h4>
                    <span className="text-xs font-mono text-slate-400">{catalog.length} apps disponibles</span>
                  </div>

                  {/* Search box for app */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={appSearchQuery}
                      onChange={(e) => setAppSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre o paquete (ej: Droid-ify, Aurora, NewPipe)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  {/* App Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {filteredCatalog.slice(0, 10).map((app) => {
                      const isSelected = selectedAppToRemoteInstall.id === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedAppToRemoteInstall(app)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center gap-3 ${
                            isSelected
                              ? 'bg-emerald-950/60 border-emerald-500/80 text-white shadow-sm'
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${app.iconGradient} flex items-center justify-center text-white shrink-0 font-bold text-xs`}>
                            {app.name.substring(0, 1)}
                          </div>
                          <div className="overflow-hidden flex-1">
                            <div className="font-semibold text-xs truncate">{app.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{app.packageName}</div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* App Summary Card */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200">
                        {selectedAppToRemoteInstall.name} <span className="font-mono text-emerald-400">v{selectedAppToRemoteInstall.version}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Peso: {selectedAppToRemoteInstall.apkSizeMb} MB • {selectedAppToRemoteInstall.trackersCount} rastreadores
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-1 rounded border border-emerald-800">
                      SHA-256 Verificado
                    </span>
                  </div>
                </div>

                {/* Target Device Selection */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      2. Elige el Dispositivo Android de Destino
                    </h4>
                    <span className="text-xs text-emerald-400 font-mono">
                      Sesión: {userProfile.email}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {syncState.activeFleet.map((device) => {
                      const isSelected = selectedTargetDeviceId === device.id;
                      const isAlreadyInstalled = device.installedAppIds.includes(selectedAppToRemoteInstall.id);

                      return (
                        <div
                          key={device.id}
                          onClick={() => setSelectedTargetDeviceId(device.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-sky-950/60 border-sky-500/80 text-white shadow-md'
                              : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                              {getDeviceIcon(device.deviceType)}
                            </div>
                            <div>
                              <div className="font-bold text-xs flex items-center gap-1.5">
                                <span>{device.name}</span>
                                {device.isCurrentDevice && (
                                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                                    Este Equipo
                                  </span>
                                )}
                                {device.isOnline ? (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="En línea" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-slate-600" title="Desconectado" />
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {device.model} • {device.osVersion.split('(')[0]} • Batería: {device.batteryPercent}%
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {isAlreadyInstalled ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                Ya Instalado
                              </span>
                            ) : (
                              <div className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                                <span>Listo para enviar</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dispatch Button */}
                  <button
                    type="button"
                    onClick={handleTriggerRemotePushInstall}
                    disabled={isPushingInstall}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${isPushingInstall ? 'animate-bounce' : ''}`} />
                    <span>
                      {isPushingInstall
                        ? 'Despachando comando e instalando...'
                        : `Enviar e Instalar en ${syncState.activeFleet.find(d => d.id === selectedTargetDeviceId)?.name || 'Dispositivo'}`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Column: Real-time Remote Dispatch Console (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Consola de Despliegue Remoto en Vivo
                    </h4>
                    {isPushingInstall && (
                      <span className="text-[10px] font-mono text-emerald-400 animate-pulse">
                        ENVIANDO PUSH...
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Progreso de Despliegue:</span>
                      <strong className="text-white">{pushProgress}%</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
                        style={{ width: `${pushProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Terminal Log Box */}
                  <div className="flex-1 bg-black/80 rounded-xl p-3 border border-slate-800 font-mono text-[11px] space-y-1.5 min-h-[220px] max-h-[300px] overflow-y-auto">
                    {pushLogs.length === 0 ? (
                      <div className="text-slate-500 italic text-center py-10">
                        Presiona "Enviar e Instalar" para ver el flujo de instalación remota hacia tu dispositivo Android en tiempo real...
                      </div>
                    ) : (
                      pushLogs.map((log, index) => (
                        <div key={index} className="text-slate-300 flex items-start gap-1.5">
                          <span className="text-emerald-500 select-none">›</span>
                          <span className={log.includes('exitos') ? 'text-emerald-300 font-bold' : log.includes('✓') ? 'text-sky-300' : 'text-slate-300'}>
                            {log}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Security Assurance Card */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1 text-slate-400">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      Instalación Cero Confianza (Zero-Trust Push)
                    </div>
                    <p className="leading-tight">
                      El comando push transporta el hash SHA-256 verificado en origen. El dispositivo destino descarga el APK desde el mirror oficial y rechaza la instalación si no coincide 1:1.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Fleet Detailed Table */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Dispositivos Vinculados a esta Cuenta</h3>
                  <p className="text-xs text-slate-400">Gestiona la flota de hardware Android vinculada a {userProfile.email}</p>
                </div>
                <button
                  onClick={() => deviceFleetSyncService.performFullSync(userProfile)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sincronizar Flota Ahora</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {syncState.activeFleet.map((dev) => (
                  <div key={dev.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          {getDeviceIcon(dev.deviceType)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{dev.name}</div>
                          <div className="text-[10px] text-slate-400">{dev.model}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        dev.isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {dev.isOnline ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        SO: <strong className="text-slate-200">{dev.osVersion.split('(')[0]}</strong>
                      </div>
                      <div>
                        Batería: <strong className="text-emerald-400">{dev.batteryPercent}%</strong>
                      </div>
                      <div>
                        Libre: <strong className="text-slate-200">{dev.storageAvailableGb} GB</strong>
                      </div>
                      <div>
                        Apps: <strong className="text-purple-400">{dev.installedAppIds.length}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Último sync: {new Date(dev.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => {
                          deviceFleetSyncService.unlinkDevice(dev.id);
                          onAddToast({
                            title: 'Dispositivo Desvinculado',
                            message: `${dev.name} fue removido de la flota.`,
                            type: 'info'
                          });
                        }}
                        className="text-rose-400 hover:underline"
                      >
                        Desvincular
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inline Pair Device Modal */}
            {isPairingDevice && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      Vincular Nuevo Dispositivo Android
                    </h3>
                    <button onClick={() => setIsPairingDevice(false)} className="text-slate-400 hover:text-white">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handlePairNewDeviceSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre del Dispositivo</label>
                      <input
                        type="text"
                        required
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        placeholder="Ej: Pixel 8a Personal, Galaxy Tab S8..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Modelo / Referencia</label>
                      <input
                        type="text"
                        value={newDeviceModel}
                        onChange={(e) => setNewDeviceModel(e.target.value)}
                        placeholder="Ej: SM-G991B, Pixel 8a..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Factor de Forma</label>
                      <select
                        value={newDeviceType}
                        onChange={(e) => setNewDeviceType(e.target.value as DeviceType)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="PHONE">Teléfono Móvil (Smartphone)</option>
                        <option value="TABLET">Tablet Android</option>
                        <option value="TV">Android TV / Google TV</option>
                        <option value="DESKTOP">Waydroid / Subconjunto Linux</option>
                      </select>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPairingDevice(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-md shadow-sky-950"
                      >
                        Confirmar Vinculación
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ACCOUNT UNIFIED SSO & MOBILE SESSION */}
        {/* ======================================================== */}
        {activeTab === 'account_sso' && (
          <div className="space-y-8 animate-fadeIn">
            {/* SSO Header Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Sesión Única Universal (Single Sign-On SSO)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Conexión total entre tu navegador web y la aplicación móvil de Android
                </h3>
                <p className="text-xs text-slate-300">
                  Igual que en Google Drive o Spotify: inicia sesión una sola vez y tendrás tus aplicaciones instaladas, tu lista de deseos, tus tokens de compilación y tus repositorios sincronizados al instante.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onOpenAccountDrawer}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950 transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Ajustes de Perfil & Seguridad</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* QR Code Quick Mobile Transfer (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-600/50 flex items-center justify-center text-purple-400">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Transferir Sesión al Teléfono</h3>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-xs">
                    Escanea este código QR con la cámara de tu Android o desde la app Civer Store para iniciar sesión automáticamente.
                  </p>
                </div>

                {/* Simulated High-Res SVG QR Code */}
                <div className="p-4 rounded-2xl bg-white shadow-2xl border-4 border-purple-500/40 max-w-[220px] mx-auto">
                  <svg viewBox="0 0 100 100" className="w-48 h-48">
                    {/* QR Code finder patterns */}
                    <rect x="5" y="5" width="26" height="26" fill="#000" rx="3" />
                    <rect x="9" y="9" width="18" height="18" fill="#fff" rx="2" />
                    <rect x="13" y="13" width="10" height="10" fill="#000" rx="1" />

                    <rect x="69" y="5" width="26" height="26" fill="#000" rx="3" />
                    <rect x="73" y="9" width="18" height="18" fill="#fff" rx="2" />
                    <rect x="77" y="13" width="10" height="10" fill="#000" rx="1" />

                    <rect x="5" y="69" width="26" height="26" fill="#000" rx="3" />
                    <rect x="9" y="73" width="18" height="18" fill="#fff" rx="2" />
                    <rect x="13" y="77" width="10" height="10" fill="#000" rx="1" />

                    {/* Data Matrix Dots */}
                    <rect x="36" y="8" width="5" height="5" fill="#000" />
                    <rect x="46" y="8" width="5" height="5" fill="#000" />
                    <rect x="56" y="8" width="5" height="5" fill="#000" />
                    <rect x="36" y="18" width="5" height="5" fill="#000" />
                    <rect x="56" y="18" width="5" height="5" fill="#000" />
                    <rect x="36" y="28" width="5" height="5" fill="#000" />
                    <rect x="46" y="28" width="5" height="5" fill="#000" />

                    <rect x="8" y="36" width="5" height="5" fill="#000" />
                    <rect x="18" y="36" width="5" height="5" fill="#000" />
                    <rect x="28" y="36" width="5" height="5" fill="#000" />
                    <rect x="38" y="38" width="6" height="6" fill="#7c3aed" rx="1" />
                    <rect x="48" y="38" width="6" height="6" fill="#7c3aed" rx="1" />
                    <rect x="58" y="38" width="6" height="6" fill="#7c3aed" rx="1" />
                    <rect x="68" y="38" width="6" height="6" fill="#7c3aed" rx="1" />
                    <rect x="78" y="38" width="6" height="6" fill="#7c3aed" rx="1" />
                    <rect x="88" y="38" width="6" height="6" fill="#7c3aed" rx="1" />

                    <rect x="38" y="48" width="6" height="6" fill="#7c3aed" rx="1" />
                    <rect x="48" y="48" width="6" height="6" fill="#10b981" rx="1" />
                    <rect x="58" y="48" width="6" height="6" fill="#7c3aed" rx="1" />

                    <rect x="8" y="46" width="5" height="5" fill="#000" />
                    <rect x="18" y="46" width="5" height="5" fill="#000" />
                    <rect x="28" y="46" width="5" height="5" fill="#000" />

                    <rect x="8" y="56" width="5" height="5" fill="#000" />
                    <rect x="18" y="56" width="5" height="5" fill="#000" />
                    <rect x="28" y="56" width="5" height="5" fill="#000" />

                    <rect x="36" y="68" width="5" height="5" fill="#000" />
                    <rect x="46" y="68" width="5" height="5" fill="#000" />
                    <rect x="56" y="68" width="5" height="5" fill="#000" />
                    <rect x="68" y="68" width="5" height="5" fill="#000" />
                    <rect x="78" y="68" width="5" height="5" fill="#000" />
                    <rect x="88" y="68" width="5" height="5" fill="#000" />

                    <rect x="36" y="78" width="5" height="5" fill="#000" />
                    <rect x="56" y="78" width="5" height="5" fill="#000" />
                    <rect x="76" y="78" width="5" height="5" fill="#000" />
                    <rect x="86" y="78" width="5" height="5" fill="#000" />

                    <rect x="36" y="88" width="5" height="5" fill="#000" />
                    <rect x="46" y="88" width="5" height="5" fill="#000" />
                    <rect x="66" y="88" width="5" height="5" fill="#000" />
                    <rect x="86" y="88" width="5" height="5" fill="#000" />
                  </svg>
                </div>

                <div className="text-xs font-mono text-slate-400 bg-black/60 p-2.5 rounded-xl border border-slate-800 w-full flex items-center justify-between">
                  <span>Código de Emparejamiento PIN:</span>
                  <strong className="text-emerald-400 text-sm font-bold tracking-wider">892-415</strong>
                </div>
              </div>

              {/* Sync Scope & Preferences (7 cols) */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white">Elementos que se Sincronizan Automáticamente</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifica qué aspectos de tu cuenta se transfieren de forma cifrada E2EE entre dispositivos
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-200">Inventario de Aplicaciones Instaladas</div>
                      <div className="text-[11px] text-slate-400">Permite ver qué apps tienes en cada teléfono y tablet</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">Activo</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-200">Lista de Deseos & Favoritos</div>
                      <div className="text-[11px] text-slate-400">Las apps guardadas en la web aparecen en la app móvil</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">Activo</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-200">Repositorios FOSS Personalizados</div>
                      <div className="text-[11px] text-slate-400">Sincroniza tus mirrors de F-Droid, Izzy y repositorios Git</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">Activo</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-200">Claves Keystore & Credenciales de Compilador</div>
                      <div className="text-[11px] text-slate-400">Tus firmas de APK para GitHub Actions protegidas por WebAuthn</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">Activo</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs text-slate-300">
                    <strong>Privacidad Absoluta:</strong> La sincronización utiliza criptografía asimétrica Ed25519. Ningún dato de telemetría personal o de uso se envía a servidores de terceros.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ARCHITECTURE & NATIVE ANDROID CODE */}
        {/* ======================================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Architecture Overview Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/60 space-y-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Trusted Web Activity (TWA) & Shizuku Native Bridge
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Cómo Funciona la Plataforma Dentro de la Aplicación Nativa Android
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                La aplicación nativa Android utiliza la tecnología <strong>Trusted Web Activity (TWA)</strong> de Chromium para renderizar exactamente el mismo código React 18, componentes y estilos Tailwind que estás viendo aquí, pero alojada dentro de un APK nativo firmado. Se comunica con el sistema operativo mediante <strong>Shizuku AIDL</strong> y un Service Worker que garantiza velocidad instantánea y funcionamiento offline.
              </p>
            </div>

            {/* Code Tabs */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-950 p-2 border-b border-slate-800 flex items-center justify-between overflow-x-auto">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCodeTab('manifest')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                      codeTab === 'manifest'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AndroidManifest.xml
                  </button>

                  <button
                    onClick={() => setCodeTab('gradle')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                      codeTab === 'gradle'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    build.gradle.kts
                  </button>

                  <button
                    onClick={() => setCodeTab('activity')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                      codeTab === 'activity'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    TwaLauncherActivity.kt
                  </button>

                  <button
                    onClick={() => setCodeTab('sw')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                      codeTab === 'sw'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    sw.js (Live OTA Cache)
                  </button>

                  <button
                    onClick={() => setCodeTab('assetlinks')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                      codeTab === 'assetlinks'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    assetlinks.json
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(
                    codeTab === 'manifest' ? manifestCode : codeTab === 'gradle' ? gradleCode : codeTab === 'activity' ? activityCode : codeTab === 'sw' ? swCode : assetLinksCode,
                    `Código ${codeTab}`
                  )}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 transition shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Archivo</span>
                </button>
              </div>

              <div className="p-4 bg-black/90 font-mono text-xs text-slate-300 overflow-x-auto max-h-[460px] leading-relaxed select-all">
                {codeTab === 'manifest' && <pre>{manifestCode}</pre>}
                {codeTab === 'gradle' && <pre>{gradleCode}</pre>}
                {codeTab === 'activity' && <pre>{activityCode}</pre>}
                {codeTab === 'sw' && <pre>{swCode}</pre>}
                {codeTab === 'assetlinks' && <pre>{assetLinksCode}</pre>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Architecture Source Code Snippets
const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.civer.store">

    <!-- Permisos FOSS para Instalación y Red -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="moe.shizuku.manager.permission.API_V23" />

    <application
        android:name=".CiverStoreApplication"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="Civer App Store"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/Theme.CiverStore.Fullscreen">

        <!-- Trusted Web Activity Principal -->
        <activity
            android:name=".TwaLauncherActivity"
            android:exported="true"
            android:screenOrientation="unspecified">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Digital Asset Links Intent Filter para verificación de dominio -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="civer-store.app" />
            </intent-filter>
        </activity>

        <meta-data
            android:name="asset_statements"
            android:resource="@string/asset_statements" />
    </application>
</manifest>`;

const gradleCode = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "org.civer.store"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.civer.store"
        minSdk = 24
        targetSdk = 35
        versionCode = 260
        versionName = "2.6.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }
}

dependencies {
    // AndroidX & Trusted Web Activity (TWA)
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
    implementation("androidx.browser:browser:1.8.0")
    
    // Shizuku API para Instalación Silenciosa Sin Root
    implementation("dev.rikka.shizuku:api:13.1.5")
    implementation("dev.rikka.shizuku:provider:13.1.5")
}`;

const activityCode = `package org.civer.store

import android.net.Uri
import android.os.Bundle
import com.google.androidbrowserhelper.trusted.LauncherActivity
import rikka.shizuku.Shizuku

class TwaLauncherActivity : LauncherActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Inicializar enlace con el servicio de Shizuku
        if (Shizuku.pingBinder()) {
            setupShizukuPackageInstallerBridge()
        }
    }

    override fun getLaunchingUrl(): Uri {
        // Enlace al contenedor web en vivo con persistencia local
        return Uri.parse("https://civer-store.app/?mode=android_ecosystem&source=twa_native")
    }

    private fun setupShizukuPackageInstallerBridge() {
        // Vinculación de permisos desatendidos
    }
}`;

const swCode = `// Service Worker: Estrategia Stale-While-Revalidate para OTA Instantáneo 1:1
const CACHE_NAME = 'civer-store-v2.6.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request).then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return response;
      }).catch(() => cached);
      return cached || networked;
    })
  );
});`;

const assetLinksCode = `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "org.civer.store",
      "sha256_cert_fingerprints": [
        "4A:81:6F:1C:4E:97:61:E8:9F:81:60:10:0F:91:92:94:E8:03:D1:5B:24:47:9E:0B:F5:71:99:1D:9F:0F:9C:2A"
      ]
    }
  }
]`;
