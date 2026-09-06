import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  Info,
  Download,
  Lock,
  EyeOff,
  Radio,
  Share2
} from 'lucide-react';
import { AppCatalogItem } from '../types';

interface AntiFeaturesAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: AppCatalogItem[];
  onOpenAppDetail: (app: AppCatalogItem) => void;
}

export interface AntiFeatureFlag {
  code: 'NonFreeNet' | 'NonFreeAdd' | 'NonFreeDep' | 'Tracking' | 'UpstreamNonFree';
  name: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

const ANTI_FEATURE_DEFINITIONS: Record<string, AntiFeatureFlag> = {
  NonFreeNet: {
    code: 'NonFreeNet',
    name: 'Red No Libre (NonFreeNet)',
    severity: 'MEDIUM',
    description: 'La aplicación interactúa o depende de servicios de red remotos cuyos protocolos o servidores son privativos.'
  },
  NonFreeAdd: {
    code: 'NonFreeAdd',
    name: 'Complementos No Libres (NonFreeAdd)',
    severity: 'LOW',
    description: 'Promociona o recomienda extensiones, plugins o suscripciones cerradas que no son de código abierto.'
  },
  NonFreeDep: {
    code: 'NonFreeDep',
    name: 'Dependencias No Libres (NonFreeDep)',
    severity: 'HIGH',
    description: 'Requiere binarios o bibliotecas de enlace cerradas (como Google Play Services o DRM) para ejecutar funciones secundarias.'
  },
  Tracking: {
    code: 'Tracking',
    name: 'Rastreo & Telemetría (Tracking)',
    severity: 'HIGH',
    description: 'Registra o envía métricas de uso de usuario sin consentimiento previo explícito.'
  },
  UpstreamNonFree: {
    code: 'UpstreamNonFree',
    name: 'Código Upstream No Libre (UpstreamNonFree)',
    severity: 'HIGH',
    description: 'El repositorio upstream del proyecto incluye activos o código bajo licencia privativa.'
  }
};

// Generate simulated anti-features mapping for catalog apps
const APP_ANTI_FEATURES: Record<string, string[]> = {
  'aurora-store': ['NonFreeNet'], // Communicates with Google Play servers
  'newpipe': ['NonFreeNet'], // Scrapes YouTube web servers
  'fossify-gallery': [],
  'droid-ify': [],
  'obtainium': [],
  'vlc-android': [],
  'k-9-mail': [],
  'organic-maps': [],
  'keepassdx': [],
  'syncthing': [],
  'termux': [],
  'retro-music': ['NonFreeAdd'], // Mentions donate/theme unlock in some builds
  'bitwarden': ['NonFreeNet'], // Defaults to bitwarden.com cloud
  'anysoftkeyboard': [],
  'inner-tune': ['NonFreeNet'], // Streams from YouTube Music
  'seal': ['NonFreeNet'], // yt-dlp wrapper
  'feeder': [],
  'libre-torrent': []
};

export const AntiFeaturesAuditModal: React.FC<AntiFeaturesAuditModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onOpenAppDetail
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CLEAN' | 'FLAGGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [strictShieldEnabled, setStrictShieldEnabled] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string>(catalog[0]?.id || 'aurora-store');

  if (!isOpen) return null;

  const filteredApps = catalog.filter((app) => {
    const flags = APP_ANTI_FEATURES[app.id] || [];
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterSeverity === 'CLEAN') return flags.length === 0;
    if (filterSeverity === 'FLAGGED') return flags.length > 0;
    return true;
  });

  const selectedApp = catalog.find((a) => a.id === selectedAppId) || catalog[0];
  const selectedFlags = APP_ANTI_FEATURES[selectedApp?.id] || [];

  const totalClean = catalog.filter((a) => (APP_ANTI_FEATURES[a.id] || []).length === 0).length;
  const totalFlagged = catalog.length - totalClean;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] max-h-[880px] overflow-hidden shadow-2xl flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-950/50 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-100 text-lg">
                  Auditoría Estricta de Anti-Features (Estándar F-Droid)
                </h3>
                <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
                  {totalClean}/{catalog.length} 100% Puras
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detección de dependencias no libres, servicios cerrados upstream y cláusulas restrictivas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Strict Shield Toggle */}
            <button
              onClick={() => setStrictShieldEnabled((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                strictShieldEnabled
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Bloquea descargas de apps que dependan de servicios no libres"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Escudo Anti-Features: {strictShieldEnabled ? 'ACTIVO' : 'INACTIVO'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar aplicación para auditar Anti-Features..."
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filterSeverity === 'ALL'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({catalog.length})
            </button>
            <button
              onClick={() => setFilterSeverity('CLEAN')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filterSeverity === 'CLEAN'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Puras ({totalClean})
            </button>
            <button
              onClick={() => setFilterSeverity('FLAGGED')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filterSeverity === 'FLAGGED'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Con Advertencias ({totalFlagged})
            </button>
          </div>
        </div>

        {/* Content Body (2 Columns) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/50">
          
          {/* Apps List (5 cols) */}
          <div className="lg:col-span-5 space-y-2 overflow-y-auto max-h-[580px] pr-1">
            {filteredApps.map((app) => {
              const flags = APP_ANTI_FEATURES[app.id] || [];
              const isSelected = app.id === selectedAppId;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/80 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${app.iconBg || 'bg-slate-900'} border border-slate-800 flex items-center justify-center text-xl shrink-0`}>
                      {app.iconSymbol}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">{app.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{app.packageName}</p>
                    </div>
                  </div>

                  <div>
                    {flags.length === 0 ? (
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        0 Anti-Features
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        {flags.length} Flag
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected App Detailed Audit (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedApp && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                
                {/* Header of Audit */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${selectedApp.iconBg || 'bg-slate-900'} border border-slate-800 flex items-center justify-center text-2xl shrink-0`}>
                      {selectedApp.iconSymbol}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-100">{selectedApp.name}</h3>
                      <p className="text-xs text-slate-400">Licencia: {selectedApp.license} • Versión: v{selectedApp.version}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAppDetail(selectedApp)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 px-3 py-1.5 rounded-xl border border-slate-700 transition flex items-center gap-1"
                  >
                    <span>Ficha Play Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Audit Verdict Banner */}
                {selectedFlags.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/70 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>Certificación de Pureza FOSS 100% Verificada</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Esta aplicación no contiene rastreadores, no depende de servicios privativos cerrados y no exige librerías propietarias como Google Play Services para su correcto funcionamiento.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-800/70 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <span>Advertencia de Anti-Features Detectada</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Se han identificado características que pueden requerir atención o configuraciones de privacidad adicionales por parte del usuario.
                    </p>
                  </div>
                )}

                {/* Anti-Feature Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Desglose de Flags Auditadas:
                  </h4>

                  {selectedFlags.length === 0 ? (
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400">
                      Ningún Anti-Feature registrado según las especificaciones de F-Droid y Debian Free Software Guidelines (DFSG).
                    </div>
                  ) : (
                    selectedFlags.map((flagCode) => {
                      const flag = ANTI_FEATURE_DEFINITIONS[flagCode];
                      if (!flag) return null;

                      return (
                        <div
                          key={flagCode}
                          className="p-3.5 rounded-xl bg-slate-900 border border-amber-800/60 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-amber-300 flex items-center gap-2">
                              <Radio className="w-3.5 h-3.5 text-amber-400" />
                              {flag.name}
                            </span>
                            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-mono">
                              Severidad: {flag.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{flag.description}</p>
                          <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-slate-400 font-mono">
                            Mitigación recomendada: Utilice un servidor proxy Tor o configure una instancia auto-alojada si está disponible.
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* DFSG & FSF Standards Reference */}
                <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <span className="font-bold text-slate-400 block">Marco de Auditoría:</span>
                  <p>
                    Las auditorías se realizan contra el estándar F-Droid metadata v2 y las 4 Libertades Esenciales del Software Libre según la Free Software Foundation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total auditadas: {catalog.length} aplicaciones FOSS de catálogo</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
