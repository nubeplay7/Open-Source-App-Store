import React, { useState } from 'react';
import {
  X,
  Sliders,
  Maximize2,
  Type,
  Image as ImageIcon,
  LayoutGrid,
  Sparkles,
  RotateCw,
  Check,
  MoveHorizontal,
  MoveVertical,
  Layers,
  ZoomIn,
  Eye,
  Smartphone,
  Monitor
} from 'lucide-react';
import { DesignSystemSettings, UICornerRadius, UIVisualDensity } from '../types';
import { DEFAULT_DESIGN_SETTINGS } from '../data/themeProfilesData';

interface LiveVisualCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DesignSystemSettings;
  onUpdateSettings: (newSettings: DesignSystemSettings) => void;
  onAddToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const LiveVisualCustomizerModal: React.FC<LiveVisualCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'DIMENSIONS' | 'TYPOGRAPHY' | 'IMAGES' | 'GRID_SPACING' | 'PRESETS'>('DIMENSIONS');

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<DesignSystemSettings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  const handleApplyPreset = (presetName: string, presetSettings: Partial<DesignSystemSettings>) => {
    onUpdateSettings({ ...settings, ...presetSettings });
    if (onAddToast) {
      onAddToast('Plantilla de Diseño Aplicada', `Se cargó el perfil "${presetName}" en tiempo real.`, 'success');
    }
  };

  const handleReset = () => {
    onUpdateSettings({ ...DEFAULT_DESIGN_SETTINGS });
    if (onAddToast) {
      onAddToast('Valores Restablecidos', 'Dimensiones, tipografía e imágenes restauradas a valores predeterminados.', 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="live-visual-customizer-modal"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-4 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-purple-950/50">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100">Diseñador Visual & Editor de Dimensiones</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/80 rounded-full">
                  Elementor Style UI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ajusta en tiempo real anchos, altos, tamaño de fuentes, escalado de imágenes y separación
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              title="Restablecer valores predeterminados"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Restablecer</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Cerrar diseñador visual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DIMENSIONS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'DIMENSIONS'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Ancho & Contenedor</span>
          </button>

          <button
            onClick={() => setActiveTab('TYPOGRAPHY')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'TYPOGRAPHY'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Tipografía & Textos</span>
          </button>

          <button
            onClick={() => setActiveTab('IMAGES')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'IMAGES'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Imágenes & Elementos</span>
          </button>

          <button
            onClick={() => setActiveTab('GRID_SPACING')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'GRID_SPACING'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Columnas & Espaciado</span>
          </button>

          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'PRESETS'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Plantillas de 1 Clic</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* TAB 1: DIMENSIONS & CONTAINER MAX-WIDTH */}
          {activeTab === 'DIMENSIONS' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MoveHorizontal className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Ancho Máximo del Contenedor Principal</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800">
                    {settings.containerMaxWidth === 'fluid' ? '100% Fluido' : `${settings.customMaxWidthPx}px`}
                  </span>
                </div>

                {/* Preset Width Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'fluid', label: '100% Fluido', px: 1920 },
                    { id: '1200px', label: '1200px (Laptop)', px: 1200 },
                    { id: '1440px', label: '1440px (Estándar)', px: 1440 },
                    { id: '1600px', label: '1600px (Amplio)', px: 1600 },
                    { id: '1920px', label: '1920px (Full HD)', px: 1920 },
                  ].map((item) => {
                    const isSelected = settings.containerMaxWidth === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleUpdate({
                          containerMaxWidth: item.id as any,
                          customMaxWidthPx: item.px
                        })}
                        className={`p-2.5 rounded-xl border text-center transition text-xs font-semibold ${
                          isSelected
                            ? 'bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-950/40'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Ajuste fino manual (Slider):</span>
                    <span className="font-mono text-purple-300 font-bold">{settings.customMaxWidthPx} px</span>
                  </div>
                  <input
                    type="range"
                    min="700"
                    max="2560"
                    step="20"
                    value={settings.customMaxWidthPx}
                    onChange={(e) => handleUpdate({
                      containerMaxWidth: 'custom',
                      customMaxWidthPx: parseInt(e.target.value, 10)
                    })}
                    className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>700px (Compacto)</span>
                    <span>1440px (Desktop)</span>
                    <span>2560px (Ultra-Wide 4K)</span>
                  </div>
                </div>
              </div>

              {/* UI Scale Factor Slider */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ZoomIn className="w-5 h-5 text-sky-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Escala Global de Interfaz (Zoom Factor)</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-800">
                    {Math.round(settings.uiScaleFactor * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0.80"
                  max="1.25"
                  step="0.05"
                  value={settings.uiScaleFactor}
                  onChange={(e) => handleUpdate({ uiScaleFactor: parseFloat(e.target.value) })}
                  className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>80% (Vista compacta / densa)</span>
                  <span>100% (Normal)</span>
                  <span>125% (Vista accesible grande)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY & FONT SCALING */}
          {activeTab === 'TYPOGRAPHY' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Font Scaling % */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Escala Porcentual de Fuentes</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800">
                    {settings.fontScalingPercent}%
                  </span>
                </div>

                <input
                  type="range"
                  min="75"
                  max="150"
                  step="5"
                  value={settings.fontScalingPercent}
                  onChange={(e) => handleUpdate({ fontScalingPercent: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>75% (Letra pequeña)</span>
                  <span>100% (Predeterminada)</span>
                  <span>150% (Lectura gigante)</span>
                </div>
              </div>

              {/* Base Font Size & Line Height Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Base Font Size */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Tamaño Base de Párrafos</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{settings.baseFontSizePx} px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="22"
                    step="1"
                    value={settings.baseFontSizePx}
                    onChange={(e) => handleUpdate({ baseFontSizePx: parseInt(e.target.value, 10) })}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    Controla el tamaño estándar de texto para tarjetas, descripciones y diálogos.
                  </p>
                </div>

                {/* Line Height */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Interlineado (Line Height)</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{settings.lineHeightRatio}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="1.9"
                    step="0.1"
                    value={settings.lineHeightRatio}
                    onChange={(e) => handleUpdate({ lineHeightRatio: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    Aumenta el espaciado vertical entre líneas para mayor comodidad de lectura.
                  </p>
                </div>
              </div>

              {/* Letter Spacing Mode */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                <span className="text-xs font-semibold text-slate-200">Espaciado de Caracteres (Tracking)</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'tight', label: 'Compacto (Tight)', desc: '-0.025em' },
                    { id: 'normal', label: 'Normal', desc: '0em estándar' },
                    { id: 'wide', label: 'Expandido (Wide)', desc: '+0.035em' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleUpdate({ letterSpacingMode: mode.id as any })}
                      className={`p-3 rounded-xl border text-left transition ${
                        settings.letterSpacingMode === mode.id
                          ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES & VISUAL ELEMENTS */}
          {activeTab === 'IMAGES' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Card Image Thumbnail Height */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Altura de Banners e Imágenes de Tarjetas</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-400 uppercase px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800">
                    {settings.cardImageHeight}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'compact', label: 'Compacto', height: '110px', desc: 'Ahorro de espacio vertical' },
                    { id: 'standard', label: 'Estándar', height: '160px', desc: 'Equilibrio visual ideal' },
                    { id: 'large', label: 'Destacado', height: '220px', desc: 'Imágenes grandes de impacto' },
                    { id: 'banner', label: 'Banner Panorámico', height: '280px', desc: 'Estilo Play Store Hero' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleUpdate({ cardImageHeight: opt.id as any })}
                      className={`p-3 rounded-xl border text-left transition ${
                        settings.cardImageHeight === opt.id
                          ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] font-mono text-indigo-300 mt-0.5">{opt.height}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Border Radius & Object Fit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image Corner Radius Slider */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Curvatura de Esquinas de Imágenes</span>
                    <span className="text-xs font-mono text-indigo-400 font-bold">{settings.imageCornerRadiusPx} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="2"
                    value={settings.imageCornerRadiusPx}
                    onChange={(e) => handleUpdate({ imageCornerRadiusPx: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0px (Recto)</span>
                    <span>16px (Moderno)</span>
                    <span>32px (Super Redondo)</span>
                  </div>
                </div>

                {/* Object Fit Selector */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                  <span className="text-xs font-semibold text-slate-200">Ajuste de Proporción (Object Fit)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdate({ imageObjectFit: 'cover' })}
                      className={`p-2.5 rounded-xl border text-center transition text-xs font-semibold ${
                        settings.imageObjectFit === 'cover'
                          ? 'bg-indigo-950/80 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Cover (Llenar sin bordes)
                    </button>
                    <button
                      onClick={() => handleUpdate({ imageObjectFit: 'contain' })}
                      className={`p-2.5 rounded-xl border text-center transition text-xs font-semibold ${
                        settings.imageObjectFit === 'contain'
                          ? 'bg-indigo-950/80 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Contain (Imagen Completa)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GRID COLUMNS & SPACING */}
          {activeTab === 'GRID_SPACING' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Card Grid Columns */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Distribución de Columnas en Catálogo</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800">
                    {settings.cardGridColumns === 'auto' ? 'Auto-Fit Inteligente' : `${settings.cardGridColumns} Columnas`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 1, label: '1 Col' },
                    { id: 2, label: '2 Cols' },
                    { id: 3, label: '3 Cols' },
                    { id: 4, label: '4 Cols' },
                    { id: 5, label: '5 Cols' },
                    { id: 6, label: '6 Cols' }
                  ].map((col) => {
                    const isSelected = settings.cardGridColumns === col.id;
                    return (
                      <button
                        key={col.id.toString()}
                        onClick={() => handleUpdate({ cardGridColumns: col.id as any })}
                        className={`p-2.5 rounded-xl border text-center transition text-xs font-bold ${
                          isSelected
                            ? 'bg-amber-950/80 border-amber-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {col.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Padding Slider */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MoveVertical className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Margen y Relleno Interno de Secciones</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800">
                    {settings.contentPaddingPx} px
                  </span>
                </div>

                <input
                  type="range"
                  min="8"
                  max="48"
                  step="4"
                  value={settings.contentPaddingPx}
                  onChange={(e) => handleUpdate({ contentPaddingPx: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>8px (Ultra Compacto)</span>
                  <span>20px (Equilibrado)</span>
                  <span>48px (Espacioso de Lujo)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRESETS */}
          {activeTab === 'PRESETS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Plantillas Visuales Integrales preconfiguradas:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleApplyPreset('Ultra Ancho Panorámico', {
                    containerMaxWidth: '1920px',
                    customMaxWidthPx: 1920,
                    cardGridColumns: 'auto',
                    cardImageHeight: 'large',
                    fontScalingPercent: 105,
                    contentPaddingPx: 24,
                    uiScaleFactor: 1.0
                  })}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-purple-900/50 hover:border-purple-500 text-left transition group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm group-hover:text-purple-300 transition">
                      🖥️ Ultra Ancho Panorámico (4K)
                    </span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                      1920px
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Aprovecha monitores grandes con 5-6 columnas, imágenes de alto impacto y tipografía optimizada.
                  </p>
                </button>

                <button
                  onClick={() => handleApplyPreset('Alta Densidad Compacta', {
                    containerMaxWidth: '1200px',
                    customMaxWidthPx: 1200,
                    cardGridColumns: 'auto',
                    cardImageHeight: 'compact',
                    fontScalingPercent: 90,
                    baseFontSizePx: 13,
                    contentPaddingPx: 12,
                    uiScaleFactor: 0.9
                  })}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-sky-900/50 hover:border-sky-500 text-left transition group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm group-hover:text-sky-300 transition">
                      ⚡ Desarrollador de Alta Densidad
                    </span>
                    <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full font-mono">
                      Compact
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Maximiza la cantidad de información visible en pantalla con imágenes compactas y márgenes ajustados.
                  </p>
                </button>

                <button
                  onClick={() => handleApplyPreset('Modo Lectura & Accesibilidad', {
                    containerMaxWidth: '1440px',
                    customMaxWidthPx: 1440,
                    fontScalingPercent: 125,
                    baseFontSizePx: 18,
                    lineHeightRatio: 1.7,
                    contentPaddingPx: 28,
                    uiScaleFactor: 1.15
                  })}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-900/50 hover:border-emerald-500 text-left transition group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm group-hover:text-emerald-300 transition">
                      📖 Modo Lectura & Gran Tipografía
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      +125%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Fuentes grandes de alto contraste con interlineado generoso para lectura descansada.
                  </p>
                </button>

                <button
                  onClick={() => handleApplyPreset('Equilibrio Civer App Store PRO', {
                    ...DEFAULT_DESIGN_SETTINGS
                  })}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-600 text-left transition group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm group-hover:text-white transition">
                      💎 Predeterminado Civer App Store PRO
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      Estándar
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Configuración balanceada de fábrica adaptada a todo tipo de resoluciones y dispositivos.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Los cambios se reflejan al instante en tiempo real sin recargar la página.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Guardar y Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
