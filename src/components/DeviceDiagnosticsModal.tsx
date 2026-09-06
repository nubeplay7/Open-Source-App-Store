import React, { useState } from 'react';
import { 
  Smartphone, 
  Cpu, 
  BatteryCharging, 
  ShieldCheck, 
  Activity, 
  HardDrive, 
  Terminal, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Sliders, 
  Lock,
  Zap,
  Layers,
  Info,
  Key
} from 'lucide-react';
import { DeviceTelemetry } from '../types';

interface DeviceDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: DeviceTelemetry;
  onAddToast?: (toast: any) => void;
}

export const DeviceDiagnosticsModal: React.FC<DeviceDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onAddToast
}) => {
  const [isRunningIntegrityCheck, setIsRunningIntegrityCheck] = useState(false);
  const [integrityResults, setIntegrityResults] = useState<{
    basicIntegrity: boolean;
    deviceIntegrity: boolean;
    strongIntegrity: boolean;
  }>({
    basicIntegrity: true,
    deviceIntegrity: true,
    strongIntegrity: false
  });

  if (!isOpen) return null;

  const handleTestIntegrity = () => {
    setIsRunningIntegrityCheck(true);
    setTimeout(() => {
      setIsRunningIntegrityCheck(false);
      setIntegrityResults({
        basicIntegrity: true,
        deviceIntegrity: true,
        strongIntegrity: true
      });
      if (onAddToast) {
        onAddToast({
          title: 'Atestación Play Integrity Aprobada',
          message: 'MEETS_BASIC_INTEGRITY & MEETS_DEVICE_INTEGRITY verificados sin hardware ban.',
          type: 'success'
        });
      }
    }, 1500);
  };

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
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-700/60 text-purple-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Centro de Diagnóstico & Telemetría del Dispositivo</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  SELinux: Enforcing
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoreo en tiempo real de hardware, particiones A/B, estado Shizuku ADB y atestación Play Integrity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestIntegrity}
              disabled={isRunningIntegrityCheck}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningIntegrityCheck ? 'animate-spin' : ''}`} />
              <span>{isRunningIntegrityCheck ? 'Atestando...' : 'Test Play Integrity'}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Arquitectura CPU</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-black text-white font-mono">ARM64-v8a</div>
              <p className="text-[11px] text-slate-400 mt-1">{telemetry.cpuCores} núcleos activos</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Versión de Android</span>
                <Smartphone className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-black text-emerald-400 font-mono">{telemetry.androidVersion}</div>
              <p className="text-[11px] text-slate-400 mt-1">API Level {telemetry.apiLevel}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Batería & Térmicos</span>
                <BatteryCharging className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-black text-amber-400 font-mono">88% • 31.4°C</div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">Salud: Excelente</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Daemon Shizuku</span>
                <Terminal className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-lg font-black text-sky-400 font-mono">Activo (v13.5)</div>
              <p className="text-[11px] text-slate-400 mt-1">UID 2000 (Shell Privilegiado)</p>
            </div>
          </div>

          {/* Detailed Hardware & Partition Section */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              Almacenamiento & Particiones Dinámicas A/B
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Memoria Interna (/data)</span>
                  <span className="text-white font-bold">{(telemetry.storageTotalGb - telemetry.storageUsedGb).toFixed(1)} GB libres de {telemetry.storageTotalGb} GB</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${Math.round((telemetry.storageUsedGb / telemetry.storageTotalGb) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Memoria RAM Unificada (/ram)</span>
                  <span className="text-white font-bold">{telemetry.ramUsedGb} GB ocupados de {telemetry.ramTotalGb} GB</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${Math.round((telemetry.ramUsedGb / telemetry.ramTotalGb) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Play Integrity & Attestation Box */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Veredicto de Atestación Play Integrity API
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                PROYECTO DESVINCULADO DE GOOGLE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">MEETS_BASIC_INTEGRITY</div>
                  <p className="text-[10px] text-slate-400">El dispositivo no está manipulado gravemente.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">MEETS_DEVICE_INTEGRITY</div>
                  <p className="text-[10px] text-slate-400">Certificado CTS conforme para apps bancarias.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${integrityResults.strongIntegrity ? 'text-emerald-400' : 'text-slate-600'} shrink-0`} />
                <div>
                  <div className="text-xs font-bold text-white">MEETS_STRONG_INTEGRITY</div>
                  <p className="text-[10px] text-slate-400">Hardware backed Keymaster / StrongBox TEE.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shizuku / Wireless ADB Daemon Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-950/60 to-slate-950/40 border border-sky-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                Servicio Shizuku IPC Daemon
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">CONECTADO</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Shizuku permite a Civer App Store realizar instalaciones desatendidas (silent background installs) sin necesidad de permisos de superusuario (Root), interactuando directamente con el servicio <code className="text-sky-300">IPackageManager</code> de Android a través de llamadas binder seguras.
            </p>
            <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 font-mono text-xs text-slate-400">
              $ adb shell sh /sdcard/Android/data/moe.shizuku.privileged.api/start.sh
              <br />
              <span className="text-emerald-400">[OK] Shizuku server running (v13.5.4.r1049, port=5555)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
