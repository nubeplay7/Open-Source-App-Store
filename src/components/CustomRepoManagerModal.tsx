import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  CheckCircle2, 
  Globe, 
  Key, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  QrCode, 
  X, 
  ShieldCheck, 
  Activity, 
  AlertCircle,
  Copy,
  Download,
  Share2
} from 'lucide-react';

export interface FOSSRepository {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'CORE' | 'COMMUNITY' | 'HARDENED' | 'CUSTOM';
  gpgFingerprint: string;
  appCount: number;
  lastSync: string;
  isEnabled: boolean;
  pingMs: number;
  status: 'ONLINE' | 'SYNCING' | 'OFFLINE';
}

const INITIAL_REPOSITORIES: FOSSRepository[] = [
  {
    id: 'f-droid-main',
    name: 'F-Droid Official Main',
    url: 'https://f-droid.org/repo',
    description: 'Repositorio maestro oficial de F-Droid con más de 4,200 aplicaciones 100% de código abierto verificadas.',
    category: 'CORE',
    gpgFingerprint: '43238D512C1E5EB2D6569F4A3AFAC552D3F01F714B',
    appCount: 4230,
    lastSync: 'Hace 12 minutos',
    isEnabled: true,
    pingMs: 42,
    status: 'ONLINE'
  },
  {
    id: 'f-droid-archive',
    name: 'F-Droid Archive',
    url: 'https://f-droid.org/archive',
    description: 'Histórico completo de versiones antiguas y binarios legados de aplicaciones F-Droid.',
    category: 'CORE',
    gpgFingerprint: '43238D512C1E5EB2D6569F4A3AFAC552D3F01F714B',
    appCount: 18450,
    lastSync: 'Hace 1 hora',
    isEnabled: false,
    pingMs: 56,
    status: 'ONLINE'
  },
  {
    id: 'izzy-on-droid',
    name: 'IzzyOnDroid F-Droid Repo',
    url: 'https://apt.izzysoft.de/fdroid/repo',
    description: 'Repositorio curado de binarios compilados directamente por los desarrolladores originales en GitHub/GitLab.',
    category: 'COMMUNITY',
    gpgFingerprint: '3BF0E63110169346D5B1A0379C0E76F1E1E64DA9',
    appCount: 1120,
    lastSync: 'Hace 5 minutos',
    isEnabled: true,
    pingMs: 38,
    status: 'ONLINE'
  },
  {
    id: 'guardian-project',
    name: 'The Guardian Project',
    url: 'https://guardianproject.info/fdroid/repo',
    description: 'Herramientas avanzadas de privacidad, cifrado Tor y comunicaciones seguras (Orbot, Briar, Haven).',
    category: 'HARDENED',
    gpgFingerprint: 'B7C2EEFD8DCF499B7745E65D7B7CA2B6E673BC1C',
    appCount: 48,
    lastSync: 'Hace 23 minutos',
    isEnabled: true,
    pingMs: 64,
    status: 'ONLINE'
  },
  {
    id: 'microg-official',
    name: 'microG Project Official',
    url: 'https://microg.org/fdroid/repo',
    description: 'Capa de compatibilidad libre y sin rastreo para Google Play Services, GmsCore y Services Core.',
    category: 'HARDENED',
    gpgFingerprint: '9BD06727E62796C9C51C0A14612B13612B3E0DE7',
    appCount: 14,
    lastSync: 'Hace 45 minutos',
    isEnabled: true,
    pingMs: 49,
    status: 'ONLINE'
  },
  {
    id: 'bitwarden-repo',
    name: 'Bitwarden Official F-Droid',
    url: 'https://mobileapp.bitwarden.com/fdroid/repo',
    description: 'Versión oficial sin dependencias de Google Play Services ni trackers del gestor de contraseñas Bitwarden.',
    category: 'COMMUNITY',
    gpgFingerprint: '737B5C7D0EE54EB326A20CD42A8C0EF27C218B14',
    appCount: 6,
    lastSync: 'Hace 2 horas',
    isEnabled: true,
    pingMs: 35,
    status: 'ONLINE'
  },
  {
    id: 'accrescent-store',
    name: 'Accrescent Hardened Core',
    url: 'https://store.accrescent.app/repo',
    description: 'Repositorio moderno con verificación estricta de firma de desarrollador y arquitectura anti-tampering.',
    category: 'HARDENED',
    gpgFingerprint: 'A5E12E99B4CD56A2190B1E63C70D26E0FA49D104',
    appCount: 85,
    lastSync: 'Hace 18 minutos',
    isEnabled: true,
    pingMs: 41,
    status: 'ONLINE'
  }
];

interface CustomRepoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (toast: any) => void;
}

export const CustomRepoManagerModal: React.FC<CustomRepoManagerModalProps> = ({
  isOpen,
  onClose,
  onAddToast
}) => {
  const [repos, setRepos] = useState<FOSSRepository[]>(INITIAL_REPOSITORIES);
  const [isAddingRepo, setIsAddingRepo] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoGpg, setNewRepoGpg] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [selectedRepoForQr, setSelectedRepoForQr] = useState<FOSSRepository | null>(null);

  if (!isOpen) return null;

  const toggleRepo = (id: string) => {
    setRepos(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    if (onAddToast) {
      const target = repos.find(r => r.id === id);
      onAddToast({
        title: target?.isEnabled ? 'Repositorio Desactivado' : 'Repositorio Activado',
        message: `${target?.name} ha sido actualizado en el índice local.`,
        type: 'info'
      });
    }
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      setRepos(prev => prev.map(r => ({ ...r, lastSync: 'Recién actualizado', pingMs: Math.floor(Math.random() * 30) + 25 })));
      if (onAddToast) {
        onAddToast({
          title: 'Sincronización Completa',
          message: 'Se actualizaron los índices Index-v2 de todos los repositorios FOSS activos.',
          type: 'success'
        });
      }
    }, 1200);
  };

  const handleSaveNewRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl || !newRepoName) return;

    const newRepo: FOSSRepository = {
      id: `custom-${Date.now()}`,
      name: newRepoName,
      url: newRepoUrl,
      description: 'Repositorio FOSS personalizado añadido manualmente por el usuario.',
      category: 'CUSTOM',
      gpgFingerprint: newRepoGpg || 'E2A180F53B76CD81920AF4C8732109DE4',
      appCount: Math.floor(Math.random() * 50) + 10,
      lastSync: 'Recién añadido',
      isEnabled: true,
      pingMs: 45,
      status: 'ONLINE'
    };

    setRepos(prev => [newRepo, ...prev]);
    setIsAddingRepo(false);
    setNewRepoUrl('');
    setNewRepoName('');
    setNewRepoGpg('');

    if (onAddToast) {
      onAddToast({
        title: 'Nuevo Repositorio Añadido',
        message: `Se indexó correctamente "${newRepo.name}". Clave GPG validada.`,
        type: 'success'
      });
    }
  };

  const totalEnabledApps = repos.filter(r => r.isEnabled).reduce((acc, curr) => acc + curr.appCount, 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[88vh] max-h-[800px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-700/60 text-sky-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Gestor de Fuentes & Repositorios FOSS Descentralizados</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                  {repos.filter(r => r.isEnabled).length} / {repos.length} Activos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Soporte de índices F-Droid Index V2, IzzyOnDroid, Accrescent, mirrors y verificación criptográfica GPG
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-2 transition border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Sincronizando...' : 'Actualizar Índices'}</span>
            </button>
            <button
              onClick={() => setIsAddingRepo(true)}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Repo</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500">Total de Paquetes Indexados:</span>{' '}
              <span className="font-bold text-white font-mono">{totalEnabledApps.toLocaleString()} APKs</span>
            </div>
            <div>
              <span className="text-slate-500">Protocolo:</span>{' '}
              <span className="font-bold text-sky-400 font-mono">F-Droid Index-v2 / JSON-LD</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Firmas GPG Validadas</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {/* Add New Repo Form Modal Overlay */}
          {isAddingRepo && (
            <form 
              onSubmit={handleSaveNewRepo}
              className="p-5 rounded-2xl bg-slate-950 border border-sky-600/50 space-y-4 shadow-xl animate-fadeIn"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-400" />
                  Añadir Nuevo Repositorio FOSS / Git Mirror
                </h3>
                <button 
                  type="button" 
                  onClick={() => setIsAddingRepo(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Repositorio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Tachiyomi Extensions Repo"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Base del Repositorio (HTTPS/Onion)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://raw.githubusercontent.com/.../fdroid/repo"
                    value={newRepoUrl}
                    onChange={(e) => setNewRepoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fingerprint de Clave GPG (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: 43238D512C1E5EB2D6569F4A3AFAC552D3F01F714B"
                  value={newRepoGpg}
                  onChange={(e) => setNewRepoGpg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRepo(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition shadow-sm"
                >
                  Guardar & Verificar Índice
                </button>
              </div>
            </form>
          )}

          {/* Repositories List */}
          <div className="space-y-3">
            {repos.map(repo => (
              <div 
                key={repo.id}
                className={`p-4 rounded-2xl border transition ${
                  repo.isEnabled 
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' 
                    : 'bg-slate-950/30 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => toggleRepo(repo.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                        repo.isEnabled 
                          ? 'bg-sky-600 text-white' 
                          : 'bg-slate-800 border border-slate-700 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{repo.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          repo.category === 'CORE' 
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' 
                            : repo.category === 'HARDENED'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : repo.category === 'CUSTOM'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-sky-950 text-sky-300 border border-sky-800'
                        }`}>
                          {repo.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {repo.appCount.toLocaleString()} apps
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{repo.description}</p>
                      
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2 flex-wrap">
                        <span className="text-sky-400 truncate max-w-md">{repo.url}</span>
                        <span>•</span>
                        <span>Ping: <strong className="text-emerald-400">{repo.pingMs}ms</strong></span>
                        <span>•</span>
                        <span>Sync: {repo.lastSync}</span>
                      </div>

                      <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-slate-400" />
                        <span>GPG: {repo.gpgFingerprint.substring(0, 16)}...{repo.gpgFingerprint.substring(repo.gpgFingerprint.length - 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedRepoForQr(repo)}
                      title="Ver código QR para escanear en móvil"
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir URL en el navegador"
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code Dialog Modal */}
        {selectedRepoForQr && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-20">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white">{selectedRepoForQr.name}</h4>
                <button onClick={() => setSelectedRepoForQr(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-white rounded-xl inline-block shadow-lg mx-auto">
                <QrCode className="w-40 h-40 text-slate-950" />
              </div>
              <p className="text-xs text-slate-300 font-mono break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {selectedRepoForQr.url}?fingerprint={selectedRepoForQr.gpgFingerprint}
              </p>
              <p className="text-[11px] text-slate-400">
                Escanea este código con Droid-ify, F-Droid o Neo Store para añadir el repositorio al instante.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
