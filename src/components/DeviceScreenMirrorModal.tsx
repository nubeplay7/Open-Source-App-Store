import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  X, 
  Camera, 
  RefreshCw, 
  ArrowLeft, 
  Home, 
  Square, 
  Volume2, 
  VolumeX, 
  Power, 
  ShieldCheck, 
  Wifi, 
  Battery, 
  Maximize2,
  CheckCircle2
} from 'lucide-react';

interface DeviceScreenMirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  deviceName: string;
}

export const DeviceScreenMirrorModal: React.FC<DeviceScreenMirrorModalProps> = ({
  isOpen,
  onClose,
  deviceId,
  deviceName
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [fps, setFps] = useState(30);
  const [screenTimestamp, setScreenTimestamp] = useState<string>(new Date().toLocaleTimeString());
  const [touchFeedback, setTouchFeedback] = useState<{ x: number; y: number } | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setScreenTimestamp(new Date().toLocaleTimeString());
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 720);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1600);
    
    setTouchFeedback({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setLastAction(`Tap en (${x}, ${y}) vía Shizuku / Input Dispatcher`);
    setTimeout(() => setTouchFeedback(null), 600);
  };

  const handleHardwareKey = (key: string) => {
    setLastAction(`Comando de Hardware: ${key}`);
    setTimeout(() => setLastAction(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-950/50">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">{deviceName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  En Vivo ({fps} FPS)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Serial: {deviceId} | Conexión: ADB over SSH (ThinkPad T480s)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Screen + Controls */}
        <div className="flex-1 overflow-y-auto py-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center justify-center">
          
          {/* Mobile Screen Frame */}
          <div className="md:col-span-6 flex justify-center">
            <div className="relative w-[280px] sm:w-[310px] aspect-[9/19.5] rounded-[42px] p-3 bg-slate-950 border-4 border-slate-700/80 shadow-2xl shadow-indigo-950/40 flex flex-col justify-between overflow-hidden">
              
              {/* Dynamic Island / Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              </div>

              {/* Screen Area Canvas */}
              <div 
                onClick={handleScreenClick}
                className="relative flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-[32px] overflow-hidden flex flex-col justify-between p-3.5 select-none cursor-crosshair group"
              >
                {/* Touch Feedback Ripple */}
                {touchFeedback && (
                  <div 
                    className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-sky-400/40 border border-sky-300 pointer-events-none animate-ping z-30"
                    style={{ left: touchFeedback.x, top: touchFeedback.y }}
                  />
                )}

                {/* Status Bar */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 px-2 z-10">
                  <span>{screenTimestamp}</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <Battery className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>

                {/* Simulated Civer App Store Mobile UI */}
                <div className="space-y-3 my-auto py-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/60">
                    <Smartphone className="w-7 h-7 text-slate-950" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Civer App Store Matrix</div>
                    <div className="text-[10px] text-emerald-400 font-mono">v1.0.4 • Shizuku Concedido</div>
                  </div>
                  
                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left space-y-1 text-[10px]">
                    <div className="text-slate-300 font-semibold flex items-center justify-between">
                      <span>Misión de QA en Progreso</span>
                      <span className="text-amber-400 font-bold">+2,500 sats</span>
                    </div>
                    <p className="text-slate-400 text-[9px]">
                      Testea la pantalla de checkout sin trackers.
                    </p>
                  </div>
                </div>

                {/* Android Bottom Navigation Bar */}
                <div className="flex justify-around items-center pt-2 pb-1 border-t border-slate-800/80 z-10 text-slate-400">
                  <button onClick={() => handleHardwareKey('BACK')} className="p-1.5 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleHardwareKey('HOME')} className="p-1.5 hover:text-white">
                    <Home className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleHardwareKey('RECENTS')} className="p-1.5 hover:text-white">
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Remote Testing Controls */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Centro de Control de Hardware en Tiempo Real</h3>
              <p className="text-xs text-slate-400">
                Interactúa con el hardware físico para ejecutar pruebas de QA y validar que la app no crashea en Android 14.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleHardwareKey('KEYEVENT_POWER')}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-2 border border-slate-700/60"
              >
                <Power className="w-4 h-4 text-red-400" />
                <span>Bloquear / Desbloquear</span>
              </button>
              <button
                onClick={() => handleHardwareKey('SCREENSHOT_CAPTURE')}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-2 border border-slate-700/60"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Captura de Evidencia</span>
              </button>
              <button
                onClick={() => handleHardwareKey('VOLUME_UP')}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-2 border border-slate-700/60"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Subir Volumen</span>
              </button>
              <button
                onClick={() => handleHardwareKey('KILL_BACKGROUND_PROCESSES')}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-2 border border-slate-700/60"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Reciclar Memoria (RAM)</span>
              </button>
            </div>

            {/* Live Feedback Toast */}
            {lastAction && (
              <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-800/60 text-xs font-mono text-sky-300 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-sky-400" />
                <span>{lastAction}</span>
              </div>
            )}

            {/* Hardware Health Specs Card */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>SoC / Procesador</span>
                <span className="text-slate-200">MediaTek Helio G85 (8-Core)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Memoria RAM Libre</span>
                <span className="text-emerald-400">2.4 GB / 4.0 GB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Temperatura de Batería</span>
                <span className="text-slate-200">31.2°C (Óptima)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shizuku Daemon Privileged</span>
                <span className="text-emerald-400 font-bold">UID 0 (Rootless Shizuku)</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
