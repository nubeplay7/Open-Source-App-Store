import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  Trash2, 
  Fingerprint, 
  Sparkles, 
  FileKey,
  X,
  ExternalLink,
  Smartphone,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ToastNotification } from './ToastNotificationCenter';
import { KeystoreEntry } from '../types';
import { INITIAL_KEYSTORES } from '../data/keystoresData';

interface KeystoreVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  keystores?: KeystoreEntry[];
  selectedKeyId?: string;
  onSelectKeyId?: (id: string) => void;
  onUpdateKeystores?: (keys: KeystoreEntry[]) => void;
  onOpenWebAuthnHsm?: () => void;
}

export const KeystoreVaultModal: React.FC<KeystoreVaultModalProps> = ({
  isOpen,
  onClose,
  onAddToast,
  keystores: externalKeystores,
  selectedKeyId: externalSelectedKeyId,
  onSelectKeyId,
  onUpdateKeystores,
  onOpenWebAuthnHsm
}) => {
  const [internalKeystores, setInternalKeystores] = useState<KeystoreEntry[]>(INITIAL_KEYSTORES);
  const [internalSelectedKeyId, setInternalSelectedKeyId] = useState<string>(INITIAL_KEYSTORES[0].id);

  const keystores = externalKeystores || internalKeystores;
  const selectedKeyId = externalSelectedKeyId || internalSelectedKeyId;

  const setSelectedKeyId = (id: string) => {
    setInternalSelectedKeyId(id);
    if (onSelectKeyId) onSelectKeyId(id);
  };

  const setKeystores = (newKeys: KeystoreEntry[] | ((prev: KeystoreEntry[]) => KeystoreEntry[])) => {
    if (typeof newKeys === 'function') {
      const updated = newKeys(keystores);
      setInternalKeystores(updated);
      if (onUpdateKeystores) onUpdateKeystores(updated);
    } else {
      setInternalKeystores(newKeys);
      if (onUpdateKeystores) onUpdateKeystores(newKeys);
    }
  };

  const [copiedFingerprint, setCopiedFingerprint] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // New Key Form State
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyAlias, setNewKeyAlias] = useState('');
  const [newAlgorithm, setNewAlgorithm] = useState<'RSA 4096-bit' | 'ECDSA P-256'>('RSA 4096-bit');
  const [newValidityYears, setNewValidityYears] = useState('25');
  const [newPassphrase, setNewPassphrase] = useState('');

  if (!isOpen) return null;

  const selectedKey = keystores.find(k => k.id === selectedKeyId) || keystores[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFingerprint(id);
    setTimeout(() => setCopiedFingerprint(null), 2000);
    if (onAddToast) {
      onAddToast({
        title: 'Huella Criptográfica Copiada',
        message: 'La huella digital SHA-256 está en tu portapapeles para verificación de APKs.',
        type: 'success'
      });
    }
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyAlias) return;

    const currentYear = new Date().getFullYear();
    const expiryYear = currentYear + parseInt(newValidityYears, 10);
    
    // Generate simulated high-entropy hex fingerprint
    const randomHex = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':');
    const randomHexSha1 = () => Array.from({ length: 20 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':');

    const newEntry: KeystoreEntry = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      alias: newKeyAlias,
      algorithm: newAlgorithm,
      validUntil: `${expiryYear}-12-31`,
      sha256Fingerprint: randomHex(),
      sha1Fingerprint: randomHexSha1(),
      isGlobalDefault: false,
      assignedAppIds: [],
      createdDate: new Date().toISOString().split('T')[0],
      schemeV4Supported: true
    };

    setKeystores([newEntry, ...keystores]);
    setSelectedKeyId(newEntry.id);
    setIsCreatingNew(false);
    setNewKeyName('');
    setNewKeyAlias('');
    setNewPassphrase('');

    if (onAddToast) {
      onAddToast({
        title: 'Nueva Llave Creada con Éxito',
        message: `Se ha generado el Keystore "${newEntry.name}" con algoritmo ${newEntry.algorithm}.`,
        type: 'success'
      });
    }
  };

  const handleSetGlobalDefault = (id: string) => {
    setKeystores(keystores.map(k => ({
      ...k,
      isGlobalDefault: k.id === id
    })));
    if (onAddToast) {
      onAddToast({
        title: 'Llave Maestra Actualizada',
        message: 'Todas las compilaciones de CI utilizarán esta firma por defecto.',
        type: 'success'
      });
    }
  };

  const handleExportKeystore = (key: KeystoreEntry) => {
    const exportData = {
      keystoreVersion: 'v4.2.0',
      exportedAt: new Date().toISOString(),
      keystoreName: key.name,
      alias: key.alias,
      algorithm: key.algorithm,
      validUntil: key.validUntil,
      sha256Fingerprint: key.sha256Fingerprint,
      sha1Fingerprint: key.sha1Fingerprint,
      schemeSupport: ['APK Signature Scheme v1 (JAR)', 'Scheme v2 (Full APK)', 'Scheme v3 (Key rotation)', 'Scheme v4 (fs-verity hash tree)']
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key.alias}-keystore-backup.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (onAddToast) {
      onAddToast({
        title: 'Keystore Exportado',
        message: `El archivo ${key.alias}-keystore-backup.json ha sido descargado.`,
        type: 'success'
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[90vh] max-h-[850px] overflow-hidden shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-950/50 shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-100 text-base sm:text-lg truncate">Bóveda de Llaves de Firma & Secretos CI</h3>
                <span className="text-[11px] bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2.5 py-0.5 rounded-lg font-mono flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Scheme v1, v2, v3 & v4</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate sm:whitespace-normal">
                Administra certificados criptográficos, exporta/importa llaves y garantiza compilaciones reproducibles con la misma firma APK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition shrink-0 ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Keystores Sidebar */}
          <div className="w-full md:w-80 bg-slate-950/70 border-r border-slate-800 flex flex-col">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Certificados ({keystores.length})
              </span>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Llave</span>
              </button>
            </div>

            {onOpenWebAuthnHsm && (
              <div className="p-2.5 mx-3 mt-3 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-2 shadow-sm">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Firma Hardware HSM</span>
                  </div>
                  <p className="text-[10px] text-purple-400/80 truncate">YubiKey 5 / Nitrokey FIDO2</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWebAuthnHsm();
                  }}
                  className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shrink-0 transition shadow"
                  title="Firmar con llave física de seguridad FIDO2"
                >
                  Firmar
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {keystores.map((key) => {
                const isSelected = key.id === selectedKeyId && !isCreatingNew;
                return (
                  <button
                    key={key.id}
                    onClick={() => {
                      setSelectedKeyId(key.id);
                      setIsCreatingNew(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/70 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                        <FileKey className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{key.name}</span>
                      </span>
                      {key.isGlobalDefault && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                          GLOBAL
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Alias: {key.alias}</span>
                      <span>{key.algorithm.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Key Details / Create View */}
          <div className="flex-1 bg-slate-900 overflow-y-auto p-6">
            {isCreatingNew ? (
              <div className="max-w-xl mx-auto space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-slate-100 text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Generar Nuevo Keystore Criptográfico</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Crea un par de claves privada/pública para firmar compilaciones automatizadas en GitHub Actions.
                  </p>
                </div>

                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nombre Descriptivo de la Llave</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Llave de Producción FOSS 2026"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Alias del Certificado</label>
                      <input
                        type="text"
                        required
                        placeholder="release-key-alias"
                        value={newKeyAlias}
                        onChange={(e) => setNewKeyAlias(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Algoritmo de Firma</label>
                      <select
                        value={newAlgorithm}
                        onChange={(e) => setNewAlgorithm(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="RSA 4096-bit">RSA 4096-bit (Recomendado)</option>
                        <option value="ECDSA P-256">ECDSA P-256 (Ultra rápido)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Validez (Años)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newValidityYears}
                        onChange={(e) => setNewValidityYears(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Contraseña de Protección (Opcional)</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={newPassphrase}
                        onChange={(e) => setNewPassphrase(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Las llaves generadas son compatibles con el esquema de rotación de firmas APK v3 y verificación de hardware Knox/Play Integrity.</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-950/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Generar Certificado</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedKey ? (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Key Overview Card */}
                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{selectedKey.name}</span>
                        {selectedKey.isGlobalDefault && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                            Firma Maestra Activa
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Alias: <span className="text-amber-300">{selectedKey.alias}</span> • Creada: {selectedKey.createdDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!selectedKey.isGlobalDefault && (
                        <button
                          onClick={() => handleSetGlobalDefault(selectedKey.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                        >
                          Hacer Maestra Global
                        </button>
                      )}
                      <button
                        onClick={() => handleExportKeystore(selectedKey)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar</span>
                      </button>
                    </div>
                  </div>

                  {/* Fingerprints */}
                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/90 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Fingerprint className="w-4 h-4 text-emerald-400" />
                          <span>Huella Digital SHA-256 (APK Cert)</span>
                        </span>
                        <button
                          onClick={() => handleCopy(selectedKey.sha256Fingerprint, 'sha256')}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1"
                        >
                          {copiedFingerprint === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedFingerprint === 'sha256' ? 'Copiado' : 'Copiar SHA256'}</span>
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-emerald-300 break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                        {selectedKey.sha256Fingerprint}
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/90 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Lock className="w-4 h-4 text-sky-400" />
                          <span>Huella Digital SHA-1 (Compatibilidad)</span>
                        </span>
                        <button
                          onClick={() => handleCopy(selectedKey.sha1Fingerprint, 'sha1')}
                          className="text-[11px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1"
                        >
                          {copiedFingerprint === 'sha1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedFingerprint === 'sha1' ? 'Copiado' : 'Copiar SHA1'}</span>
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-sky-300 break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                        {selectedKey.sha1Fingerprint}
                      </div>
                    </div>
                  </div>

                  {/* Scheme Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">Scheme v1</div>
                      <div className="text-emerald-400 font-bold mt-0.5">Soportado</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">Scheme v2</div>
                      <div className="text-emerald-400 font-bold mt-0.5">Soportado</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">Scheme v3</div>
                      <div className="text-emerald-400 font-bold mt-0.5">Soportado</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">Scheme v4</div>
                      <div className="text-emerald-400 font-bold mt-0.5">fs-verity Activo</div>
                    </div>
                  </div>
                </div>

                {/* Integration Info */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>Sincronización Automática con Compilador GitHub Actions</span>
                  </div>
                  <p>
                    Cuando lanzas una compilación desde el Compilador Cloud, la llave seleccionada es inyectada mediante secretos cifrados en tiempo de ejecución, asegurando que las actualizaciones de tus APKs se puedan instalar sobre versiones previas sin errores de discrepancia de firma (*Signature Mismatch*).
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
