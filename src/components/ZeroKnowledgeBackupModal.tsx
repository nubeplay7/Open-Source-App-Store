import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Download, 
  Upload, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  HardDrive, 
  FileCode, 
  Layers, 
  X,
  RefreshCw
} from 'lucide-react';
import { UserProfile, NotebookDocument, JiraDevTask, DesignSystemSettings, FeatureFlagsConfig } from '../types';

interface ZeroKnowledgeBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: Partial<UserProfile>) => void;
  notebookDocs: NotebookDocument[];
  onUpdateNotebookDocs: (docs: NotebookDocument[]) => void;
  devTasks: JiraDevTask[];
  onUpdateDevTasks: (tasks: JiraDevTask[]) => void;
  designSettings: DesignSystemSettings;
  onUpdateDesignSettings: (settings: Partial<DesignSystemSettings>) => void;
  featureFlags: FeatureFlagsConfig;
  onUpdateFeatureFlags: (flags: Partial<FeatureFlagsConfig>) => void;
  onAddToast?: (toast: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const ZeroKnowledgeBackupModal: React.FC<ZeroKnowledgeBackupModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateUserProfile,
  notebookDocs,
  onUpdateNotebookDocs,
  devTasks,
  onUpdateDevTasks,
  designSettings,
  onUpdateDesignSettings,
  featureFlags,
  onUpdateFeatureFlags,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'RESTORE' | 'SPECS'>('EXPORT');
  
  // Export states
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [includeRepos, setIncludeRepos] = useState(true);
  const [includeProfile, setIncludeProfile] = useState(true);
  const [includeWorkspace, setIncludeWorkspace] = useState(true);
  const [includeTheme, setIncludeTheme] = useState(true);
  const [includeFeatureFlags, setIncludeFeatureFlags] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Restore states
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [rawEncryptedJson, setRawEncryptedJson] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedPreview, setDecryptedPreview] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real WebCrypto AES-GCM 256 Key Derivation & Encryption
  const handleExportBackup = async () => {
    if (!exportPassphrase || exportPassphrase.length < 8) {
      if (onAddToast) {
        onAddToast({
          title: 'Contraseña Débil',
          message: 'La frase de paso debe tener al menos 8 caracteres para garantizar resistencia criptográfica.',
          type: 'error'
        });
      }
      return;
    }

    if (exportPassphrase !== confirmPassphrase) {
      if (onAddToast) {
        onAddToast({
          title: 'Las contraseñas no coinciden',
          message: 'Por favor confirma la frase de paso exactamente igual para evitar pérdida de acceso.',
          type: 'error'
        });
      }
      return;
    }

    setIsExporting(true);
    try {
      // 1. Prepare payload
      const payload: any = {
        app: 'CIBER_STORE_PRO',
        version: '10.0',
        exportedAt: new Date().toISOString(),
        data: {}
      };

      if (includeProfile) payload.data.userProfile = userProfile;
      if (includeRepos) payload.data.customRepos = userProfile.customRepos;
      if (includeWorkspace) {
        payload.data.notebookDocs = notebookDocs;
        payload.data.devTasks = devTasks;
      }
      if (includeTheme) payload.data.designSettings = designSettings;
      if (includeFeatureFlags) payload.data.featureFlags = featureFlags;

      const plaintextString = JSON.stringify(payload);
      const enc = new TextEncoder();
      const plaintextBuffer = enc.encode(plaintextString);

      // 2. Generate random 16-byte Salt and 12-byte IV for AES-GCM
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // 3. Import password material for PBKDF2
      const baseKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(exportPassphrase),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      // 4. Derive AES-GCM 256-bit Key with 100,000 iterations of SHA-256
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // 5. Encrypt with AES-GCM (provides confidentiality and integrity with 128-bit auth tag)
      const ciphertextBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        derivedKey,
        plaintextBuffer
      );

      // 6. Format bundle as base64 envelope
      const toBase64 = (buf: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      };

      const encryptedEnvelope = {
        format: 'CIBER_VAULT_E2EE_V1',
        algorithm: 'AES-GCM-256',
        kdf: 'PBKDF2-HMAC-SHA256',
        iterations: 100000,
        saltHex: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
        ivHex: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        cipherBase64: toBase64(ciphertextBuffer),
        timestamp: new Date().toISOString()
      };

      // 7. Trigger download of file
      const blob = new Blob([JSON.stringify(encryptedEnvelope, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ciber-store-backup-${new Date().toISOString().substring(0, 10)}.ciber-vault`;
      a.click();
      URL.revokeObjectURL(url);

      if (onAddToast) {
        onAddToast({
          title: '¡Respaldo Cifrado E2EE Descargado!',
          message: 'Archivo .ciber-vault protegido con AES-256-GCM. Solo tú puedes descifrarlo con tu contraseña.',
          type: 'success'
        });
      }

      setExportPassphrase('');
      setConfirmPassphrase('');
    } catch (err: any) {
      console.error(err);
      if (onAddToast) {
        onAddToast({
          title: 'Error al Cifrar Respaldo',
          message: err.message || 'Error en WebCrypto Subtle API',
          type: 'error'
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Real WebCrypto Decryption
  const handleDecryptBackup = async () => {
    setRestoreError(null);
    if (!restorePassphrase) {
      setRestoreError('Debes ingresar la frase de paso para derivar la clave criptográfica.');
      return;
    }

    if (!rawEncryptedJson) {
      setRestoreError('Carga un archivo .ciber-vault o pega el contenido JSON cifrado.');
      return;
    }

    setIsDecrypting(true);
    try {
      const envelope = JSON.parse(rawEncryptedJson);
      if (envelope.format !== 'CIBER_VAULT_E2EE_V1') {
        throw new Error('Formato de bóveda inválido o no reconocido.');
      }

      const fromHex = (hex: string) => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return bytes;
      };

      const fromBase64 = (base64: string) => {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
      };

      const salt = fromHex(envelope.saltHex);
      const iv = fromHex(envelope.ivHex);
      const ciphertextBuffer = fromBase64(envelope.cipherBase64);

      const enc = new TextEncoder();
      const baseKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(restorePassphrase),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: envelope.iterations || 100000,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        derivedKey,
        ciphertextBuffer
      );

      const dec = new TextDecoder();
      const plaintext = dec.decode(decryptedBuffer);
      const parsed = JSON.parse(plaintext);

      setDecryptedPreview(parsed);
      if (onAddToast) {
        onAddToast({
          title: '¡Descifrado Exitoso!',
          message: 'Respaldo verificado con integridad MAC intacta. Revisa los datos antes de aplicarlos.',
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error(err);
      setRestoreError('Contraseña incorrecta o el archivo de respaldo ha sido alterado (Fallo en autenticación GCM).');
      setDecryptedPreview(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleApplyRestoredData = () => {
    if (!decryptedPreview || !decryptedPreview.data) return;
    const { data } = decryptedPreview;

    if (data.userProfile) onUpdateUserProfile(data.userProfile);
    if (data.notebookDocs) onUpdateNotebookDocs(data.notebookDocs);
    if (data.devTasks) onUpdateDevTasks(data.devTasks);
    if (data.designSettings) onUpdateDesignSettings(data.designSettings);
    if (data.featureFlags) onUpdateFeatureFlags(data.featureFlags);

    if (onAddToast) {
      onAddToast({
        title: '¡Datos Restaurados en la Plataforma!',
        message: 'Ajustes, notas, repositorios y perfiles restablecidos desde la bóveda cifrada.',
        type: 'success'
      });
    }

    onClose();
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawEncryptedJson(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div id="zero-knowledge-backup-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0e1117] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Respaldo Cifrado Zero-Knowledge (E2EE)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  AES-GCM 256 + PBKDF2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Soberanía de datos 100% en el cliente: tus notas, repos y ajustes cifrados sin servidores intermediarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0a0d14] px-5">
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'EXPORT' ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Crear Respaldo Cifrado (.ciber-vault)</span>
          </button>
          <button
            onClick={() => setActiveTab('RESTORE')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'RESTORE' ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar desde Bóveda</span>
          </button>
          <button
            onClick={() => setActiveTab('SPECS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'SPECS' ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Especificaciones Criptográficas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: EXPORT */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-6">
              
              {/* Modules to include */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Seleccionar Módulos a Incluir en la Bóveda Cifrada:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeRepos}
                      onChange={(e) => setIncludeRepos(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Repositorios F-Droid</div>
                      <div className="text-[11px] text-slate-400">URLs y huellas de repos propios</div>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeProfile}
                      onChange={(e) => setIncludeProfile(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Perfil & Apps Instaladas</div>
                      <div className="text-[11px] text-slate-400">Tokens PAT, wishlist y catálogo local</div>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeWorkspace}
                      onChange={(e) => setIncludeWorkspace(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Workspace (Obsidian & Jira)</div>
                      <div className="text-[11px] text-slate-400">Notas Markdown y tareas dev</div>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeTheme}
                      onChange={(e) => setIncludeTheme(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Preferencias de Diseño</div>
                      <div className="text-[11px] text-slate-400">Paleta OLED, fuentes y radios</div>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeFeatureFlags}
                      onChange={(e) => setIncludeFeatureFlags(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Perfiles de Funcionalidad</div>
                      <div className="text-[11px] text-slate-400">16 flags activos del sistema</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Passphrase inputs */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Frase de Paso de Cifrado (Clave Maestra E2EE):</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400">Introduce tu contraseña maestra:</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={exportPassphrase}
                        onChange={(e) => setExportPassphrase(e.target.value)}
                        placeholder="Mínimo 8 caracteres..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white pr-10 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400">Confirma la contraseña:</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassphrase}
                      onChange={(e) => setConfirmPassphrase(e.target.value)}
                      placeholder="Repite la contraseña..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <p>
                    <strong>Cero Conocimiento:</strong> La contraseña nunca se envía a ningún servidor ni se almacena en memoria persistente. Si la olvidas, es matemáticamente imposible recuperar los datos del archivo cifrado.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleExportBackup}
                    disabled={isExporting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition flex items-center gap-2"
                  >
                    {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{isExporting ? 'Cifrando con WebCrypto...' : 'Generar y Descargar .ciber-vault'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RESTORE */}
          {activeTab === 'RESTORE' && (
            <div className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Cargar Archivo de Bóveda (.ciber-vault):</span>
                </label>
                <div className="p-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/60 text-center space-y-2 hover:border-emerald-500 transition">
                  <HardDrive className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-xs text-slate-300">
                    Arrastra tu archivo <strong>.ciber-vault</strong> aquí o selecciónalo
                  </div>
                  <input
                    type="file"
                    accept=".ciber-vault,.json"
                    onChange={handleFileDrop}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Password for decryption */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span>Contraseña Maestra para Descifrar:</span>
                  </label>
                  <input
                    type="password"
                    value={restorePassphrase}
                    onChange={(e) => setRestorePassphrase(e.target.value)}
                    placeholder="Introduce la contraseña con la que creaste el respaldo..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {restoreError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{restoreError}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleDecryptBackup}
                    disabled={isDecrypting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition flex items-center gap-2"
                  >
                    {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                    <span>{isDecrypting ? 'Descifrando Payload...' : 'Descifrar e Inspeccionar Datos'}</span>
                  </button>
                </div>
              </div>

              {/* Decrypted preview */}
              {decryptedPreview && (
                <div className="p-5 rounded-2xl bg-[#0a0d14] border border-emerald-600/50 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="font-bold text-xs text-white">Contenido Verificado en la Bóveda</h4>
                        <p className="text-[11px] text-slate-400">Exportado el: {decryptedPreview.exportedAt}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleApplyRestoredData}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Restaurar Datos a la App</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Usuario:</span>
                      <div className="font-bold text-white truncate">{decryptedPreview.data?.userProfile?.name || 'N/A'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Notas Markdown:</span>
                      <div className="font-bold text-emerald-400">{decryptedPreview.data?.notebookDocs?.length || 0} docs</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Tareas Jira:</span>
                      <div className="font-bold text-purple-400">{decryptedPreview.data?.devTasks?.length || 0} tareas</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Repositorios:</span>
                      <div className="font-bold text-cyan-400">{decryptedPreview.data?.customRepos?.length || 0} repos</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: SPECS */}
          {activeTab === 'SPECS' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Arquitectura Criptográfica WebCrypto E2EE
                </h4>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                  <li><strong>Algoritmo de Cifrado Simétrico:</strong> AES-GCM (Galois/Counter Mode) con llave de 256 bits y tag de autenticación MAC de 128 bits. Garantiza tanto la confidencialidad como la detección inmediata de cualquier bit manipulado.</li>
                  <li><strong>Derivación de Clave (KDF):</strong> PBKDF2 (Password-Based Key Derivation Function 2) con HMAC-SHA-256 y 100,000 iteraciones calculadas en el procesador local, haciéndola resistente a ataques de diccionario por GPU o ASIC.</li>
                  <li><strong>Vector de Inicialización (IV) y Salt:</strong> 12 bytes de IV criptográficamente aleatorios por respaldo (`crypto.getRandomValues`) y 16 bytes de Salt único para neutralizar tablas Rainbow.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>W3C Web Cryptography API Nativa (SubtleCrypto)</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold transition"
          >
            Cerrar Bóveda
          </button>
        </div>

      </div>
    </div>
  );
};
