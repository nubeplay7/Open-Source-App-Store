import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  GitBranch, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck, 
  Tag, 
  Code,
  FileCode,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppCatalogCategory, AppCatalogItem, DeveloperAppSubmission } from '../types';

interface DeveloperPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppPublished: (newApp: AppCatalogItem) => void;
  onOpenCompilerForApp: (app: AppCatalogItem) => void;
}

export const DeveloperPublishModal: React.FC<DeveloperPublishModalProps> = ({
  isOpen,
  onClose,
  onAppPublished,
  onOpenCompilerForApp
}) => {
  const [formData, setFormData] = useState<DeveloperAppSubmission>({
    name: '',
    packageName: '',
    category: 'TOOLS',
    tagline: '',
    description: '',
    version: 'v1.0.0',
    license: 'GPL-3.0',
    priceType: 'FREE_FOSS',
    githubUrl: '',
    branch: 'main',
    gradleTask: './gradlew assembleRelease',
    developerName: '',
    minAndroid: 'Android 8.0 (API 26)'
  });

  const [customPrice, setCustomPrice] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newApp: AppCatalogItem = {
      id: `dev-app-${Date.now()}`,
      name: formData.name,
      packageName: formData.packageName || `com.${formData.developerName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      category: formData.category,
      tagline: formData.tagline,
      description: formData.description,
      iconBg: 'bg-indigo-600',
      iconGradient: 'from-indigo-500 to-purple-700',
      iconSymbol: 'Package',
      bannerGradient: 'from-indigo-950 via-purple-900 to-slate-950',
      screenshots: [],
      rating: 5.0,
      reviewCount: '1',
      downloads: '1',
      apkSizeMb: 12.4,
      version: formData.version,
      minAndroid: formData.minAndroid,
      targetSdk: 35,
      license: formData.license,
      githubUrl: formData.githubUrl,
      githubStars: '1',
      isFree: formData.priceType === 'FREE_FOSS',
      price: formData.priceType === 'FREE_FOSS' ? 'Gratis • FOSS' : formData.priceType === 'DONATION' ? 'Donación sugerida' : `$${customPrice} USD`,
      developer: {
        name: formData.developerName || 'Desarrollador FOSS',
        github: formData.githubUrl,
        verified: true
      },
      permissions: ['INTERNET', 'REQUEST_INSTALL_PACKAGES'],
      trackersCount: 0,
      isStore: false,
      canCompileWithCi: true,
      defaultBranch: formData.branch,
      gradleTask: formData.gradleTask,
      recentReleaseDate: 'Hoy',
      changelogSummary: 'Versión inicial publicada en FOSS Store Matrix Hub.',
      isFeatured: false
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onAppPublished(newApp);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // silent
      }

      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-950/50">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Portal para Desarrolladores & Publicación</h3>
              <p className="text-xs text-slate-400">
                Registra tu aplicación, vincula tu repositorio GitHub y habilita compilación continua de APKs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Información Básica de la Aplicación
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre de la Aplicación *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. FocusNote Libre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre de Paquete (Package Name)</label>
                <input
                  type="text"
                  placeholder="org.ejemplo.miapp"
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as AppCatalogCategory })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="TOOLS">Herramientas & Root</option>
                  <option value="MULTIMEDIA">Multimedia & Audio/Video</option>
                  <option value="PRIVACY">Privacidad & Cripto</option>
                  <option value="PRODUCTIVITY">Productividad</option>
                  <option value="COMMUNICATION">Comunicación</option>
                  <option value="CUSTOMIZATION">Personalización & Launcher</option>
                  <option value="GAMING">Juegos & Emuladores</option>
                  <option value="FINANCE">Finanzas Libres</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Desarrollador / Organización *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre o equipo"
                  value={formData.developerName}
                  onChange={(e) => setFormData({ ...formData, developerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subtítulo / Tagline Corto</label>
              <input
                type="text"
                placeholder="Una frase llamativa describiendo la app..."
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Descripción Completa</label>
              <textarea
                rows={3}
                placeholder="Explica las características principales, arquitectura y funciones de la app..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Section 2: GitHub Repository & CI Compilation */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" /> Vinculación de GitHub Actions & Compilador CI
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">URL Repositorio GitHub *</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/usuario/mi-app-android"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Rama Predeterminada</label>
                <input
                  type="text"
                  placeholder="main"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Comando / Tarea Gradle</label>
                <input
                  type="text"
                  placeholder="./gradlew assembleRelease"
                  value={formData.gradleTask}
                  onChange={(e) => setFormData({ ...formData, gradleTask: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Versión Inicial</label>
                <input
                  type="text"
                  placeholder="v1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & License */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Licencia y Modelo de Distribución
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Licencia de Software</label>
                <select
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                >
                  <option value="GPL-3.0">GNU GPL v3.0 (Recomendada FOSS)</option>
                  <option value="AGPL-3.0">GNU AGPL v3.0</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                  <option value="MIT">MIT License</option>
                  <option value="BSD-3-Clause">BSD 3-Clause</option>
                  <option value="MPL-2.0">Mozilla Public License 2.0</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Modelo de Precio</label>
                <select
                  value={formData.priceType}
                  onChange={(e) => setFormData({ ...formData, priceType: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="FREE_FOSS">100% Gratis y Libre (FOSS)</option>
                  <option value="DONATION">Gratis con Donación Opcional</option>
                  <option value="COMMERCIAL">De Pago / Comercial</option>
                </select>
              </div>
            </div>

            {formData.priceType === 'COMMERCIAL' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Precio en USD ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.99"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.githubUrl}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/50 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Registrando en Catálogo...' : 'Publicar Aplicación'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
