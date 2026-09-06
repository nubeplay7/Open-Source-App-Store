import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Cpu, 
  ExternalLink, 
  X, 
  Download, 
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';
import { GitHubBuildRun } from '../types';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'build';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  durationMs?: number;
  buildRun?: GitHubBuildRun;
  actionLabel?: string;
  autoCloseDelayMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type ToastNotification = ToastItem;

export interface ToastNotificationCenterProps {
  toasts: ToastItem[];
  onDismiss?: (id: string) => void;
  onCloseToast?: (id: string) => void;
  onActionToast?: (toast: ToastItem) => void;
  onOpenCompilerModal?: () => void;
}

export const ToastNotificationCenter: React.FC<ToastNotificationCenterProps> = ({
  toasts,
  onDismiss,
  onCloseToast,
  onActionToast,
  onOpenCompilerModal
}) => {
  if (toasts.length === 0) return null;

  const handleClose = (id: string) => {
    if (onCloseToast) onCloseToast(id);
    else if (onDismiss) onDismiss(id);
  };

  return (
    <aside 
      aria-label="Notificaciones del sistema"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none p-2 sm:p-0"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => handleClose(toast.id)}
          onAction={() => onActionToast && onActionToast(toast)}
          onOpenCompilerModal={onOpenCompilerModal}
        />
      ))}
    </aside>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
  onAction?: () => void;
  onOpenCompilerModal?: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss, onAction, onOpenCompilerModal }) => {
  const duration = toast.durationMs ?? toast.autoCloseDelayMs ?? 5500;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const getStyleDetails = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          border: 'border-emerald-500/60',
          bg: 'bg-[#0f1d18]',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800/80',
          badgeText: 'ÉXITO CI/CD',
          accent: 'bg-emerald-500'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          border: 'border-rose-500/60',
          bg: 'bg-[#1e1014]',
          badge: 'bg-rose-950 text-rose-300 border-rose-800/80',
          badgeText: 'FALLO BUILD',
          accent: 'bg-rose-500'
        };
      case 'build':
        return {
          icon: <Cpu className="w-5 h-5 text-cyan-400 shrink-0 animate-spin" />,
          border: 'border-cyan-500/60',
          bg: 'bg-[#0d1824]',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-800/80',
          badgeText: 'GITHUB ACTIONS',
          accent: 'bg-cyan-500'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          border: 'border-amber-500/60',
          bg: 'bg-[#1f1910]',
          badge: 'bg-amber-950 text-amber-300 border-amber-800/80',
          badgeText: 'ADVERTENCIA',
          accent: 'bg-amber-500'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          border: 'border-blue-500/60',
          bg: 'bg-[#0f172a]',
          badge: 'bg-blue-950 text-blue-300 border-blue-800/80',
          badgeText: 'SISTEMA',
          accent: 'bg-blue-500'
        };
    }
  };

  const style = getStyleDetails();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto rounded-2xl border ${style.border} ${style.bg} p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-cyan-500/10 flex flex-col gap-2.5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4`}
    >
      {/* Top indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.accent}`} />

      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="flex items-start gap-2.5">
          {style.icon}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono font-bold border ${style.badge}`}>
                {style.badgeText}
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {toast.timestamp}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
              {toast.title}
            </h4>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition shrink-0"
          title="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed pl-7">
        {toast.message}
      </p>

      {/* Build Run Specific Details if available */}
      {toast.buildRun && (
        <div className="ml-7 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">App:</span>
            <span className="font-bold text-white">{toast.buildRun.appName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Versión:</span>
            <span className="text-purple-300">{toast.buildRun.versionTag}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Commit:</span>
            <span className="text-emerald-400">[{toast.buildRun.commitHash}]</span>
          </div>
          {toast.buildRun.durationSeconds && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Duración:</span>
              <span className="text-cyan-300">{toast.buildRun.durationSeconds}s</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {toast.buildRun && onOpenCompilerModal && (
          <button
            onClick={() => {
              onOpenCompilerModal();
              onDismiss();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition flex items-center gap-1"
          >
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Ver Compilador</span>
          </button>
        )}

        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white transition flex items-center gap-1 shadow-sm"
          >
            <span>{toast.action.label}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {!toast.action && toast.actionLabel && onAction && (
          <button
            onClick={() => {
              onAction();
              onDismiss();
            }}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white transition flex items-center gap-1 shadow-sm"
          >
            <span>{toast.actionLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
