import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Send,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Globe,
  Radio,
  FileCode,
  Terminal,
  Zap,
  X
} from 'lucide-react';
import { otaUpdateService } from '../services/otaUpdateService';
import { OtaReleaseItem, OtaUpdateManifest } from '../types';
import { NETWORK_ENDPOINTS } from '../constants/networkEndpoints';

interface OtaReleaseManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OtaReleaseManagementModal: React.FC<OtaReleaseManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const [manifest, setManifest] = useState<OtaUpdateManifest>(otaUpdateService.getManifest());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [endpointHealthy, setEndpointHealthy] = useState<boolean | null>(null);
  const [broadcastTg, setBroadcastTg] = useState(false);

  // Form State
  const currentRelease = manifest.releases['civer-app-store'] || {
    appId: 'com.civer.appstore',
    appName: 'Civer App Store Mobile',
    packageName: 'com.civer.appstore',
    versionName: '1.0.1',
    versionCode: 2,
    releaseDate: new Date().toISOString(),
    sha256Checksum: '4a4941baddbf897f0a458d870ca18afdd46818a705525329f7b5961639028c40',
    downloadUrl: `${NETWORK_ENDPOINTS.PRIMARY_DOMAIN}/downloads/com.civer.appstore-v1.0.1-release.apk`,
    fileSizeBytes: 13740428,
    fileSizeMb: 13.1,
    releaseNotes: '🚀 Civer App Store Mobile v1.0.1: Integración nativa con motor OTA continuo, catálogo FOSS sincronizado y soporte HTTPS universal.',
    minSdk: 24,
    targetSdk: 36,
    signatureScheme: 'Scheme v2+v3+v4 (fs-verity)'
  };

  const [formAppId, setFormAppId] = useState(currentRelease.appId);
  const [formAppName, setFormAppName] = useState(currentRelease.appName);
  const [formVersionName, setFormVersionName] = useState('1.0.2');
  const [formVersionCode, setFormVersionCode] = useState(currentRelease.versionCode + 1);
  const [formDownloadUrl, setFormDownloadUrl] = useState(
    `${NETWORK_ENDPOINTS.PRIMARY_DOMAIN}/downloads/com.civer.appstore-v1.0.2-release.apk`
  );
  const [formSha256, setFormSha256] = useState(currentRelease.sha256Checksum);
  const [formReleaseNotes, setFormReleaseNotes] = useState(
    '⚡ Actualización continua generada desde la plataforma web Civer: mejoras de estabilidad y sincronización en tiempo real.'
  );

  useEffect(() => {
    if (isOpen) {
      otaUpdateService.syncWithRemoteEndpoint().then(updated => {
        setManifest({ ...updated });
      });
      checkEndpointHealth();
    }
  }, [isOpen]);

  const checkEndpointHealth = async () => {
    try {
      const res = await fetch('/api/v1/ota/manifest.json', { cache: 'no-store' });
      setEndpointHealthy(res.ok);
    } catch {
      setEndpointHealthy(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishSuccess(false);

    const newRelease: OtaReleaseItem = {
      appId: formAppId,
      appName: formAppName,
      packageName: 'com.civer.appstore',
      versionName: formVersionName,
      versionCode: Number(formVersionCode),
      releaseDate: new Date().toISOString(),
      sha256Checksum: formSha256.trim(),
      downloadUrl: formDownloadUrl.trim(),
      fileSizeBytes: 13740428,
      fileSizeMb: 13.1,
      releaseNotes: formReleaseNotes.trim(),
      minSdk: 24,
      targetSdk: 36,
      signatureScheme: 'Scheme v2+v3+v4 (fs-verity)'
    };

    await otaUpdateService.publishOtaRelease(newRelease, broadcastTg ? '123456789' : undefined);
    const updated = otaUpdateService.getManifest();
    setManifest({ ...updated });
    setIsPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Panel de Publicación y Auto-Actualización Móvil OTA
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Civer OTA Engine v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Distribución continua de binarios APK hacia la app móvil instalada sin pasar por Google Play
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Top Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <Globe className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Dominio Oficial Cloudflare
                </div>
                <div className="text-sm font-bold text-slate-200 mt-0.5 break-all">
                  https://appstore.civer.cloud
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Túnel Edge Activo (SSL/TLS Full)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <Radio className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Endpoint Manifiesto OTA
                </div>
                <div className="text-sm font-mono font-bold text-emerald-300 mt-0.5">
                  /api/v1/ota/manifest.json
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  {endpointHealthy === true && (
                    <span className="text-emerald-400 font-medium">✓ En Vivo (200 OK)</span>
                  )}
                  {endpointHealthy === false && (
                    <span className="text-rose-400 font-medium">⚠️ No responde</span>
                  )}
                  {endpointHealthy === null && (
                    <span className="text-slate-400 font-medium">Comprobando...</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Verificación de Integridad
                </div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">
                  SHA-256 + FileProvider
                </div>
                <div className="text-xs text-purple-300 mt-1.5">
                  Actualización asistida con 1 toque
                </div>
              </div>
            </div>
          </div>

          {/* Current Active Release */}
          <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Versión Activa Servida a los Dispositivos Móviles
                </h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v{currentRelease.versionName} (Build {currentRelease.versionCode})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Identificador de App (Package):</span>
                <p className="font-mono text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  {currentRelease.appId}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Checksum SHA-256 Criptográfico:</span>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-slate-400 truncate max-w-[240px]">
                    {currentRelease.sha256Checksum}
                  </span>
                  <button
                    onClick={() => handleCopy(currentRelease.sha256Checksum, 'sha')}
                    className="ml-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {copiedField === 'sha' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <span className="text-slate-500 font-semibold">URL de Descarga Canónica del Binario APK:</span>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-emerald-400 truncate text-xs">
                    {currentRelease.downloadUrl}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(currentRelease.downloadUrl, 'url')}
                      className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                      title="Copiar enlace"
                    >
                      {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={currentRelease.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-sky-400 transition-colors p-1"
                      title="Descargar APK directamente"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <span className="text-slate-500 font-semibold">Notas de la Versión Activa:</span>
                <p className="text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {currentRelease.releaseNotes}
                </p>
              </div>
            </div>
          </div>

          {/* Form: Publish New Continuous Update */}
          <form onSubmit={handlePublish} className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Publicar Nueva Actualización en Caliente (Hot-Swap OTA)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Al publicar, las apps móviles detectarán la versión automáticamente
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nueva Versión (versionName)
                </label>
                <input
                  type="text"
                  value={formVersionName}
                  onChange={(e) => {
                    setFormVersionName(e.target.value);
                    setFormDownloadUrl(
                      `${NETWORK_ENDPOINTS.PRIMARY_DOMAIN}/downloads/com.civer.appstore-v${e.target.value}-release.apk`
                    );
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Código de Compilación (versionCode)
                </label>
                <input
                  type="number"
                  value={formVersionCode}
                  onChange={(e) => setFormVersionCode(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                  min={currentRelease.versionCode + 1}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Canal de Despliegue
                </label>
                <select className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500">
                  <option value="stable">Canal Estable (Producción)</option>
                  <option value="beta">Canal Beta</option>
                  <option value="nightly">Canal Nightly CI</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                URL de Descarga del APK Generado
              </label>
              <input
                type="url"
                value={formDownloadUrl}
                onChange={(e) => setFormDownloadUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Hash SHA-256 de Verificación Criptográfica
              </label>
              <input
                type="text"
                value={formSha256}
                onChange={(e) => setFormSha256(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Registro de Cambios (Release Notes)
              </label>
              <textarea
                value={formReleaseNotes}
                onChange={(e) => setFormReleaseNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={broadcastTg}
                  onChange={(e) => setBroadcastTg(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
                />
                Difundir alerta inmediata a suscriptores de Telegram (@EnviodeApkCompiladaBot)
              </label>

              <button
                type="submit"
                disabled={isPublishing}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Publicar y Actualizar Manifiesto
                  </>
                )}
              </button>
            </div>

            {publishSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                ¡Lanzamiento OTA publicado con éxito! Sincronizado en disco, memoria y endpoint en vivo.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};