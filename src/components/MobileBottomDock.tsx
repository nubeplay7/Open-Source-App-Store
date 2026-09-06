import React from 'react';
import {
  ShoppingBag,
  Code2,
  Cpu,
  Palette,
  Terminal,
  Radio,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { StoreUiMode } from '../types';

interface MobileBottomDockProps {
  currentMode: StoreUiMode;
  onChangeMode: (mode: StoreUiMode) => void;
  onOpenCommandPalette: () => void;
  onOpenSidebarDrawer: () => void;
  onOpenNearbyTransfer?: () => void;
  onOpenBuildsHub?: () => void;
  activeBuildCount?: number;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  currentMode,
  onChangeMode,
  onOpenCommandPalette,
  onOpenSidebarDrawer,
  onOpenNearbyTransfer,
  onOpenBuildsHub,
  activeBuildCount = 0
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
      {/* Play Store */}
      <button
        onClick={() => onChangeMode('ciber_store')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] min-h-[44px] ${
          currentMode === 'ciber_store' || currentMode === 'play_store' || currentMode === 'app_store'
            ? 'text-emerald-400 bg-emerald-950/50'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Tienda</span>
      </button>

      {/* Dev Workspace */}
      <button
        onClick={() => onChangeMode('dev_workspace')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] min-h-[44px] ${
          currentMode === 'dev_workspace'
            ? 'text-sky-400 bg-sky-950/50'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Code2 className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Dev Studio</span>
      </button>

      {/* Quick Command */}
      <button
        onClick={onOpenCommandPalette}
        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-900/50 -mt-3 min-w-[48px] min-h-[48px]"
        title="Command Palette (Ctrl + K)"
      >
        <Terminal className="w-5 h-5" />
      </button>

      {/* Builds Hub */}
      <button
        onClick={onOpenBuildsHub}
        className="relative flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] min-h-[44px] text-slate-400 hover:text-slate-200"
      >
        <Cpu className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Builds</span>
        {activeBuildCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        )}
      </button>

      {/* Menu / Drawer Trigger */}
      <button
        onClick={onOpenSidebarDrawer}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] min-h-[44px] text-slate-400 hover:text-slate-200"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Herramientas</span>
      </button>
    </div>
  );
};
