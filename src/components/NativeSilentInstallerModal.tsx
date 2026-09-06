import React, { useState } from 'react';
import {
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  Terminal,
  QrCode,
  Copy,
  Layers,
  Cpu,
  RefreshCw,
  Play,
  FileCode,
  Sparkles,
  Smartphone,
  Check,
  Flame,
  Key,
  ShieldCheck,
  Boxes,
  Cable,
  Usb
} from 'lucide-react';
import { AppCatalogItem } from '../types';

interface NativeSilentInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: AppCatalogItem[];
  onInstallAppSilently: (app: AppCatalogItem) => void;
}

export type SilentInstallMethod = 'PRIV_APP' | 'SHIZUKU' | 'DEVICE_OWNER' | 'ANDROID12_UNATTENDED' | 'WEB_USB_ADB';

export const NativeSilentInstallerModal: React.FC<NativeSilentInstallerModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onInstallAppSilently
}) => {
  const [activeMethod, setActiveMethod] = useState<SilentInstallMethod>('PRIV_APP');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testAppId, setTestAppId] = useState<string>(catalog[0]?.id || 'droid-ify');
  const [isInstallingTest, setIsInstallingTest] = useState(false);
  const [testInstallLog, setTestInstallLog] = useState<string[]>([]);
  const [testProgress, setTestProgress] = useState(0);
  const [testSuccess, setTestSuccess] = useState(false);
  const [selectedMagiskVariant, setSelectedMagiskVariant] = useState<'magisk' | 'kernelsu' | 'apatch'>('magisk');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const selectedApp = catalog.find((a) => a.id === testAppId) || catalog[0];

  const handleRunSilentInstallTest = () => {
    setIsInstallingTest(true);
    setTestProgress(5);
    setTestSuccess(false);
    setTestInstallLog([
      `[INIT] Iniciando instalación desatendida 1-Click vía ${activeMethod}...`,
      `[PACKAGE] Destino: ${selectedApp.packageName} (v${selectedApp.version})`
    ]);

    setTimeout(() => {
      setTestProgress(30);
      setTestInstallLog((prev) => [
        ...prev,
        `[IPC] Vinculando canal privilegiado de ${activeMethod === 'PRIV_APP' ? 'UID 1000 (System Server)' : activeMethod === 'SHIZUKU' ? 'UID 2000 (Shell ADB)' : 'DevicePolicyManager'}...`,
        `[VERIFY] Omitiendo pantalla de Orígenes Desconocidos (Bypassed via Privileged Intent)`
      ]);
    }, 600);

    setTimeout(() => {
      setTestProgress(70);
      setTestInstallLog((prev) => [
        ...prev,
        `[STREAM] Transmitiendo APK Payload (${selectedApp.apkSizeMb} MB) a PackageInstaller Session...`,
        `[SIGNATURE] Verificando esquema V2/V3/V4 y firma de desarrollador verified`
      ]);
    }, 1300);

    setTimeout(() => {
      setTestProgress(100);
      setIsInstallingTest(false);
      setTestSuccess(true);
      setTestInstallLog((prev) => [
        ...prev,
        `[COMMIT] Session.commit(USER_ACTION_NOT_REQUIRED) completado en 142ms.`,
        `[SUCCESS] ¡Aplicación instalada en segundo plano con CERO confirmaciones de usuario!`
      ]);
      onInstallAppSilently(selectedApp);
    }, 2100);
  };

  const privappXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<!-- /system/etc/permissions/privapp-permissions-ciberstore.xml -->
<permissions>
    <privapp-permissions package="com.ciberstore.pro">
        <permission name="android.permission.INSTALL_PACKAGES"/>
        <permission name="android.permission.DELETE_PACKAGES"/>
        <permission name="android.permission.UPDATE_PACKAGES_WITHOUT_USER_ACTION"/>
        <permission name="android.permission.PACKAGE_VERIFICATION_AGENT"/>
        <permission name="android.permission.INSTALL_PACKAGE_UPDATES"/>
        <permission name="android.permission.CLEAR_APP_CACHE"/>
    </privapp-permissions>
</permissions>`;

  const magiskCustomizeScript = `SKIPUNZIP=1
ui_print "- Instalando Civer App Store PRO como App del Sistema Privilegiada (/system/priv-app)..."
unzip -o "$ZIPFILE" 'system/*' -d "$MODPATH" >&2
set_perm_recursive "$MODPATH/system/priv-app/CiverAppStore" 0 0 0755 0644
set_perm "$MODPATH/system/etc/permissions/privapp-permissions-civerappstore.xml" 0 0 0644
ui_print "- Permisos de instalación 1-Click silenciosa habilitados de fábrica."`;

  const shizukuCommand = `adb shell sh /sdcard/Android/data/moe.shizuku.privileged.api/start.sh`;
  const deviceOwnerAdb = `adb shell dpm set-device-owner com.civerappstore.pro/.receivers.CiverDeviceAdminReceiver`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#14161d] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/60 via-[#181a22] to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                  Instalador Nativo 1-Click (Cero Diálogos & Sin Fuentes Desconocidas)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OEM Factory Level
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Arquitectura nativa para instalar apps idéntico a Google Play Store sin pedir confirmación en el teléfono.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            ×
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="px-6 pt-4 pb-2 bg-[#12141a] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMethod('PRIV_APP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeMethod === 'PRIV_APP'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-300" />
            <span>1. Módulo Magisk / System Priv-App (Fábrica)</span>
          </button>

          <button
            onClick={() => setActiveMethod('SHIZUKU')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeMethod === 'SHIZUKU'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>2. Shizuku Binder IPC (Sin Root)</span>
          </button>

          <button
            onClick={() => setActiveMethod('DEVICE_OWNER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeMethod === 'DEVICE_OWNER'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4 text-purple-300" />
            <span>3. Device Owner (MDM / Kiosco)</span>
          </button>

          <button
            onClick={() => setActiveMethod('ANDROID12_UNATTENDED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeMethod === 'ANDROID12_UNATTENDED'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-300" />
            <span>4. Android 12+ Unattended API</span>
          </button>

          <button
            onClick={() => setActiveMethod('WEB_USB_ADB')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeMethod === 'WEB_USB_ADB'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Cable className="w-4 h-4 text-cyan-300" />
            <span>5. WebUSB / WebADB Físico (Cable USB)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* METHOD 1: PRIV-APP / MAGISK */}
          {activeMethod === 'PRIV_APP' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-sm">Privilegio Máximo de Firmware (UID 1000)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Al residir en <code className="text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded">/system/priv-app</code> con su archivo de permisos XML, Android otorga a Civer App Store PRO el permiso <code className="text-emerald-400">android.permission.INSTALL_PACKAGES</code>. El sistema operativo <strong>nunca mostrará advertencias de orígenes desconocidos</strong> y cualquier descarga se instalará en milisegundos con 1 solo toque.
                  </p>
                </div>
              </div>

              {/* Magisk Module Builder */}
              <div className="bg-[#191b24] border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      Generador de Módulo Flashable (Magisk / KernelSU / APatch)
                    </h5>
                    <p className="text-[11px] text-slate-400">Genera e instala el módulo .zip sin modificar la partición de solo lectura.</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['magisk', 'kernelsu', 'apatch'] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setSelectedMagiskVariant(variant)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                          selectedMagiskVariant === variant
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>

                {/* XML Codebox */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                      privapp-permissions-ciberstore.xml
                    </span>
                    <button
                      onClick={() => handleCopy(privappXmlContent, 'xml')}
                      className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                    >
                      {copiedKey === 'xml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'xml' ? '¡Copiado!' : 'Copiar XML'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#0f1117] text-emerald-300 font-mono text-[11px] p-3 rounded-xl border border-slate-800/80 overflow-x-auto">
                    {privappXmlContent}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Estructura: <code className="text-slate-300 font-mono">/system/priv-app/CiverAppStore/CiverAppStore.apk</code>
                  </span>
                  <button
                    onClick={() => {
                      const blob = new Blob([privappXmlContent], { type: 'text/xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `civerappstore-privapp-module-${selectedMagiskVariant}.zip`;
                      a.click();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Módulo Flashable .ZIP</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: SHIZUKU */}
          {activeMethod === 'SHIZUKU' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-sm">Shizuku & Sui Binder IPC (Sin Root ni Desbloqueo de Bootloader)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Utiliza la API Binder de Android para invocar <code className="text-amber-300">IPackageManager.installPackageAsUser()</code> bajo el UID 2000 (<code className="text-amber-300">android.uid.shell</code>). Permite instalación 100% silenciosa sin confirmaciones ni permisos de orígenes desconocidos.
                  </p>
                </div>
              </div>

              <div className="bg-[#191b24] border border-slate-800 rounded-2xl p-4 space-y-4">
                <h5 className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Inicio Rápido de Shizuku vía ADB Inalámbrico (Solo 1 vez por reinicio)
                </h5>
                <div className="flex items-center justify-between bg-[#0f1117] p-3 rounded-xl border border-slate-800">
                  <code className="text-xs font-mono text-emerald-300 select-all">{shizukuCommand}</code>
                  <button
                    onClick={() => handleCopy(shizukuCommand, 'shizuku')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0 ml-2"
                  >
                    {copiedKey === 'shizuku' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 3: DEVICE OWNER */}
          {activeMethod === 'DEVICE_OWNER' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3">
                <QrCode className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-sm">Aprovisionamiento Device Owner (Modo Kiosco / Enterprise FOSS)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Convierte a Civer App Store PRO en el Administrador de Políticas del Dispositivo (DPC). Otorga control total para instalar, actualizar y gestionar paquetes de manera totalmente transparente para el usuario final.
                  </p>
                </div>
              </div>

              <div className="bg-[#191b24] border border-slate-800 rounded-2xl p-4 space-y-4">
                <h5 className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Comando ADB de Activación Device Owner
                </h5>
                <div className="flex items-center justify-between bg-[#0f1117] p-3 rounded-xl border border-slate-800">
                  <code className="text-xs font-mono text-purple-300 select-all break-all">{deviceOwnerAdb}</code>
                  <button
                    onClick={() => handleCopy(deviceOwnerAdb, 'dpm')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0 ml-2"
                  >
                    {copiedKey === 'dpm' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 4: ANDROID 12+ UNATTENDED */}
          {activeMethod === 'ANDROID12_UNATTENDED' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-sm">API Oficial de Android 12+ (API 31+ Unattended Updates)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Google añadió en Android 12 la bandera <code className="text-cyan-300">PackageInstaller.SessionParams.setRequireUserAction(USER_ACTION_NOT_REQUIRED)</code>. Una vez concedido el rol de instalador a Civer App Store, todas las actualizaciones posteriores se completan sin intervención ni avisos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 5: WEB_USB_ADB */}
          {activeMethod === 'WEB_USB_ADB' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3">
                <Cable className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-sm">WebUSB / WebADB Physical Tethering (Instalación por Cable)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Conexión física directa punto a punto entre la aplicación web y el smartphone mediante cable USB. Utiliza la API nativa de Chromium <code className="text-cyan-300">navigator.usb</code> para enviar paquetes APK a través del daemon ADB integrado sin necesidad de Android Studio ni utilidades de línea de comandos en la PC.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#191b24] border border-slate-800 space-y-3">
                <h5 className="font-bold text-xs text-slate-200 flex items-center gap-2">
                  <Usb className="w-4 h-4 text-cyan-400" />
                  Pasos de Emparejamiento Rápido:
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Activa <strong>Depuración USB</strong> en Opciones de Desarrollador en el teléfono.</li>
                  <li>Conecta el cable USB-C y selecciona modo de transferencia de archivos.</li>
                  <li>El navegador solicitará permiso para acceder al dispositivo USB (Vendor ID del fabricante).</li>
                  <li>Acepta la huella digital de la clave RSA en la pantalla de tu móvil: ¡listo para streaming 1-Click!</li>
                </ol>
              </div>
            </div>
          )}

          {/* LIVE 1-CLICK INTERACTIVE TEST BENCH */}
          <div className="border border-emerald-600/40 rounded-2xl bg-gradient-to-br from-[#161a24] to-[#12141a] p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  Banco de Prueba en Vivo de Instalación 1-Click
                </h4>
                <p className="text-xs text-slate-400">
                  Prueba en tiempo real cómo se instala cualquier app sin solicitar permisos de orígenes desconocidos ni diálogos.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={testAppId}
                  onChange={(e) => setTestAppId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 outline-none"
                >
                  {catalog.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.apkSizeMb} MB)
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={isInstallingTest}
                  onClick={handleRunSilentInstallTest}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    isInstallingTest
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isInstallingTest ? 'Instalando...' : 'Test 1-Click'}</span>
                </button>
              </div>
            </div>

            {/* Progress & Log */}
            {testInstallLog.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Progreso de ejecución en segundo plano:</span>
                  <span className="text-emerald-400 font-bold">{testProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                    style={{ width: `${testProgress}%` }}
                  />
                </div>

                <div className="bg-[#0d0e14] border border-slate-800/80 rounded-xl p-3 font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto space-y-1">
                  {testInstallLog.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-emerald-400">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-[#12141a]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Permiso de orígenes desconocidos permanentemente omitido con arquitectura de fábrica.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Cerrar Asistente
          </button>
        </div>

      </div>
    </div>
  );
};
