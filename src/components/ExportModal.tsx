import React, { useState } from 'react';
import { X, Copy, Check, FileDown, Share2 } from 'lucide-react';
import { AppStoreInfo, CATEGORY_DETAILS } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: AppStoreInfo[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  stores
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# ⚡ FOSS Store Matrix - Alternativas a Google Play Store & Clientes F-Droid\n\n`;
    md += `*Generado desde FOSS Store Matrix - Catálogo y Benchmark Android 2024/2025*\n\n`;
    md += `## 📊 Tabla Comparativa Resumen\n\n`;
    md += `| Tienda | Categoría | Versión | UX | Seguridad | RAM Reposo | Sin Root (Shizuku) | UI Stack |\n`;
    md += `| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |\n`;

    stores.forEach((store) => {
      const cat = CATEGORY_DETAILS[store.category].label;
      const shizuku = store.features.unattendedRootlessUpdates ? '✅ Sí' : '❌ Manual';
      md += `| **[${store.name}](${store.githubUrl})** | ${cat} | \`${store.latestVersion}\` | ${store.easeOfUseScore}/10 | ${store.securityScore}/10 | ${store.performance.ramUsageIdleMb} MB | ${shizuku} | ${store.techStack.uiArchitecture} |\n`;
    });

    md += `\n## 🔍 Fichas Técnicas Detalladas\n\n`;

    stores.forEach((store) => {
      md += `### 🔹 ${store.name} (${store.latestVersion})\n`;
      md += `> ${store.tagline}\n\n`;
      md += `- **Licencia:** ${store.license} | **Stars:** ${store.githubStars}\n`;
      md += `- **Diferenciador Clave:** ${store.keyDifferentiator}\n`;
      md += `- **Ideal para:** ${store.bestForUseCase}\n`;
      md += `- **Rendimiento:** RAM en reposo ${store.performance.ramUsageIdleMb}MB | Cold start ${store.performance.coldStartTimeMs}ms | Sync ${store.performance.indexSyncSpeedSec}s\n`;
      md += `- **Stack:** ${store.techStack.primaryLanguage} | ${store.techStack.uiArchitecture} | DB: ${store.techStack.database}\n`;
      md += `- **Ventajas:** ${store.pros.join(', ')}\n`;
      md += `- **Limitaciones:** ${store.cons.join(', ')}\n`;
      md += `- **Repositorio:** ${store.githubUrl}\n\n`;
    });

    return md;
  };

  const markdownContent = generateMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              Exportar Matriz en Formato Markdown
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 flex-1 overflow-y-auto">
          <p className="text-xs text-slate-400 mb-3">
            Copia esta comparativa con tablas y enlaces formateados en Markdown para compartirla en GitHub issues, READMEs, foros o Notion:
          </p>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-96 selection:bg-emerald-900">
            {markdownContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <span className="text-xs text-slate-500 font-mono">
            {stores.length} tiendas exportadas
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 rounded-lg text-xs font-bold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Markdown'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
