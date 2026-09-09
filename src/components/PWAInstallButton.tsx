import React from 'react';
import { Smartphone, Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenModal: () => void;
  variant?: 'navbar' | 'floating' | 'card' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenModal,
  variant = 'navbar'
}) => {
  const { isInstallable, isInstalled } = usePWAInstall();

  // If already installed in standalone mode, show a subtle active badge or hide based on variant
  if (isInstalled && variant === 'floating') {
    return null;
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={onOpenModal}
        id="btn-android-install-compact"
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition active:scale-95"
        title="Instalar en Android"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Instalar APK</span>
      </button>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 animate-bounce">
        <button
          onClick={onOpenModal}
          id="btn-android-install-floating"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/30 hover:scale-105 transition-transform active:scale-95 border border-emerald-300/40"
        >
          <Smartphone className="w-4 h-4" />
          <span>Instalar en Android</span>
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
        </button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>App Nativa para Dispositivos Android</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">PWA & APK</span>
            </div>
            <div className="text-xs text-slate-400">Instala en tu teléfono o tablet con 1 clic o descarga el APK firmado</div>
          </div>
        </div>
        <button
          onClick={onOpenModal}
          id="btn-android-install-card"
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-500/20 active:scale-95 flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar Ahora</span>
        </button>
      </div>
    );
  }

  // Default navbar variant
  return (
    <button
      onClick={onOpenModal}
      id="btn-android-install-navbar"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-400/50 text-xs font-bold transition active:scale-95 shadow-sm"
      title="Instalar en dispositivo Android"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
      <span className="hidden sm:inline">Instalar en Android</span>
      <span className="sm:hidden">Instalar</span>
      {isInstallable && (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      )}
    </button>
  );
};
