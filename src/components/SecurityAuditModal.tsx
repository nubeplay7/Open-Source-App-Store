import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  Lock, 
  Key, 
  Fingerprint, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  FileText, 
  Activity, 
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Info,
  Network
} from 'lucide-react';
import { AppCatalogItem } from '../types';
import { SecurityHeatmapView } from './SecurityHeatmapView';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppCatalogItem[];
  selectedApp?: AppCatalogItem | null;
  onSelectApp?: (app: AppCatalogItem) => void;
  onOpenInstaller?: (app: AppCatalogItem) => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  onClose,
  apps,
  selectedApp,
  onSelectApp,
  onOpenInstaller
}) => {
  const [activeAppId, setActiveAppId] = useState<string>(selectedApp ? selectedApp.id : (apps[0]?.id || 'droid-ify'));
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HEATMAP' | 'TRACKERS' | 'PERMISSIONS' | 'SIGNATURE' | 'REPRODUCIBLE'>('OVERVIEW');

  if (!isOpen) return null;

  const currentApp = apps.find(a => a.id === activeAppId) || selectedApp || apps[0];

  const filteredApps = apps.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartDeepScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  // Detailed mock trackers analysis
  const getTrackersList = (app: AppCatalogItem) => {
    if (app.trackersCount === 0) {
      return [];
    }
    // For apps with simulated trackers
    return [
      { name: 'Google Firebase Analytics', category: 'Analytics', risk: 'MEDIUM', codeSignature: 'com.google.firebase.analytics' },
      { name: 'Crashlytics Core', category: 'Crash Reporting', risk: 'LOW', codeSignature: 'com.google.firebase.crashlytics' }
    ];
  };

  const trackers = getTrackersList(currentApp);
  const isZeroTelemetry = (currentApp.trackersCount === 0);

  // Permission categorization
  const permissionBreakdown = (currentApp.permissions || []).map(perm => {
    const isCritical = perm.includes('INSTALL') || perm.includes('ACCESSIBILITY') || perm.includes('SYSTEM') || perm.includes('STORAGE');
    const isMedium = perm.includes('FOREGROUND') || perm.includes('BOOT') || perm.includes('NOTIFICATION');
    return {
      name: perm,
      level: isCritical ? 'CRITICAL' : isMedium ? 'MODERATE' : 'SAFE',
      description: perm.includes('INTERNET') 
        ? 'Permite comunicación por red TCP/UDP con repositorios y servidores upstream.'
        : perm.includes('INSTALL')
        ? 'Permite solicitar al sistema la instalación desatendida o manual de archivos APK.'
        : perm.includes('NOTIFICATIONS')
        ? 'Permite mostrar alertas de actualizaciones disponibles y estado de descarga.'
        : 'Permiso estándar de Android para sincronización en segundo plano.'
    };
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Auditor de Seguridad Criptográfica & Privacidad Exodus</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  Zero-Telemetry Audit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspección estática y dinámica de binarios APK, firmas APK v2/v3, certificados GPG y rastreadores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartDeepScan}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Escaneando Binario...' : 'Re-Escanear APK'}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body (2 Columns) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Apps List */}
          <div className="w-72 bg-slate-950/50 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar app para auditar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredApps.map(app => {
                const isSelected = app.id === currentApp.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      setActiveAppId(app.id);
                      if (onSelectApp) onSelectApp(app);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-center gap-3 ${
                      isSelected 
                        ? 'bg-emerald-950/60 border border-emerald-700/60 text-white' 
                        : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${app.iconBg}`}>
                      {app.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{app.name}</span>
                        {app.trackersCount === 0 ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="0 Rastreadores" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title={`${app.trackersCount} Rastreadores`} />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{app.packageName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Audit Report */}
          <div className="flex-1 bg-slate-900 flex flex-col overflow-hidden">
            {/* App Header Banner */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ${currentApp.iconBg}`}>
                  {currentApp.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{currentApp.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {currentApp.version}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {currentApp.license}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400">{currentApp.packageName}</p>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-1">{currentApp.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {onOpenInstaller && (
                  <button
                    onClick={() => onOpenInstaller(currentApp)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-emerald-900 flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Instalar APK</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'OVERVIEW', label: 'Resumen de Auditoría', icon: Activity },
                { id: 'HEATMAP', label: 'Security Heatmap & Grafo Exodus', icon: Network },
                { id: 'TRACKERS', label: `Rastreadores (${currentApp.trackersCount})`, icon: ShieldAlert },
                { id: 'PERMISSIONS', label: `Permisos Manifest (${currentApp.permissions.length})`, icon: Lock },
                { id: 'SIGNATURE', label: 'Criptografía & Firma APK', icon: Key },
                { id: 'REPRODUCIBLE', label: 'Reproducible Build Status', icon: Cpu }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
                      isActive 
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {isScanning ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <ShieldCheck className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Desensamblando DEX / smali y verificando firmas...</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">Buscando firmas de trackers Exodus v2026.08 y hashes SHA-256...</p>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'HEATMAP' && (
                    <SecurityHeatmapView
                      apps={apps}
                      installedAppIds={['droid-ify', 'obtainium', 'termux']}
                      onSelectApp={(app) => {
                        setActiveAppId(app.id);
                        if (onSelectApp) onSelectApp(app);
                      }}
                      onOpenAuditDetail={(app) => {
                        setActiveAppId(app.id);
                        setActiveTab('TRACKERS');
                      }}
                    />
                  )}

                  {activeTab === 'OVERVIEW' && (
                    <div className="space-y-6">
                      {/* Metric Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                            <span>Puntuación de Privacidad</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="text-2xl font-black text-emerald-400">100 / 100</div>
                          <p className="text-[11px] text-slate-400 mt-1">Cero telemetría detectada</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                            <span>Rastreadores Exodus</span>
                            <ShieldAlert className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="text-2xl font-black text-white">{currentApp.trackersCount}</div>
                          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">100% Libre de SDKs invasivos</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                            <span>Esquema de Firma</span>
                            <Key className="w-4 h-4 text-sky-400" />
                          </div>
                          <div className="text-2xl font-black text-sky-400">v2 + v3</div>
                          <p className="text-[11px] text-slate-400 mt-1">APK Signing Block verificado</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                            <span>Compilación Verificable</span>
                            <Cpu className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="text-2xl font-black text-purple-400">100% RB</div>
                          <p className="text-[11px] text-slate-400 mt-1">Byte-for-byte idéntico a Git</p>
                        </div>
                      </div>

                      {/* Summary Banner */}
                      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-emerald-300">Auditoría Aprobada: Grado Militar FOSS</h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            Este paquete binario ha sido analizado contra la base de datos de firmas de Exodus Privacy. No contiene código analítico de terceros, SDKs de publicidad, ni telemetría invasiva. Su código fuente es 100% auditable bajo licencia {currentApp.license}.
                          </p>
                        </div>
                      </div>

                      {/* Cryptographic SHA-256 Digest Box */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Fingerprint className="w-4 h-4 text-sky-400" />
                            Digest Criptográfico SHA-256 del APK
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            MATCH EXACTO CON REPOSITORIO
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-sky-300 break-all select-all">
                          e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400 pt-1">
                          <div>MD5: <span className="text-slate-300">4a8b23c91d8e7f60321a</span></div>
                          <div>SHA-1: <span className="text-slate-300">98fc1c149afbf4c8996fb92427ae41e4</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'TRACKERS' && (
                    <div className="space-y-4">
                      {isZeroTelemetry ? (
                        <div className="p-8 rounded-2xl bg-emerald-950/20 border border-emerald-900/50 text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <h4 className="text-base font-bold text-emerald-300">0 Rastreadores Detectados</h4>
                          <p className="text-xs text-slate-300 max-w-lg mx-auto">
                            Exodus Privacy escaneó los archivos bytecode dex del APK y no encontró ninguna firma coincidente con los más de 450 servicios de rastreo conocidos (Google Analytics, Facebook, Adjust, AppsFlyer, etc.).
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {trackers.map((t, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/40 flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                                <p className="text-xs font-mono text-slate-400">{t.codeSignature}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
                                {t.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'PERMISSIONS' && (
                    <div className="space-y-3">
                      <div className="text-xs text-slate-400 mb-2">
                        Permisos declarados en el archivo <code className="text-sky-300">AndroidManifest.xml</code> analizados por nivel de privilegio:
                      </div>
                      {permissionBreakdown.map((p, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-white">android.permission.{p.name}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.level === 'CRITICAL' 
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800' 
                                  : p.level === 'MODERATE'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}>
                                {p.level}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'SIGNATURE' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Key className="w-4 h-4 text-sky-400" />
                          Información del Certificado de Firma X.509
                        </h4>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                            <span className="text-slate-400">Subject / Emisor:</span>
                            <span className="text-slate-200">CN={currentApp.developer.name}, OU=FOSS, O={currentApp.name}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                            <span className="text-slate-400">Algoritmo de Clave:</span>
                            <span className="text-slate-200">RSA 4096-bit (e=65537)</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                            <span className="text-slate-400">Algoritmo de Firma:</span>
                            <span className="text-slate-200">SHA256withRSA</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                            <span className="text-slate-400">Validez:</span>
                            <span className="text-emerald-400">2020-01-01 hasta 2055-12-31</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'REPRODUCIBLE' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/50 space-y-2">
                        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                          <Cpu className="w-4 h-4" />
                          <span>Estado de Reproducibilidad (Reproducible Builds)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Una compilación reproducible permite a cualquier persona compilar el código fuente desde GitHub bajo el commit exacto y obtener exactamente el mismo binario APK bit por bit, garantizando que no se inyectó código malicioso en el proceso de entrega.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 font-mono text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Git Commit:</span>
                          <span className="text-purple-300 font-bold">f8b2c14a90de3</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Gradle Toolchain:</span>
                          <span className="text-slate-200">OpenJDK 17.0.9 + Gradle 8.7</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Diffoscope Output:</span>
                          <span className="text-emerald-400 font-bold">0 DIFERENCIAS (100% MATCH)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
