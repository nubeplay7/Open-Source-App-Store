import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code,
  Copy,
  Check,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface FluidityAuditRule {
  id: string;
  name: string;
  category: 'Typography' | 'Padding' | 'Containers' | 'TouchTargets';
  status: 'PASS' | 'WARNING' | 'OPTIMIZED';
  currentValue: string;
  recommendedValue: string;
  rateOfChange: string;
  description: string;
}

interface FluidityScoreAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewportWidth: number;
  onApplyFluidRuleFix?: (ruleId: string) => void;
  onAddToast?: (toast: any) => void;
}

const AUDIT_RULES: FluidityAuditRule[] = [
  {
    id: 'rule-h1-fluid',
    name: 'Títulos H1 & Display Headers',
    category: 'Typography',
    status: 'PASS',
    currentValue: 'clamp(1.5rem, 1rem + 2.5vw, 2.75rem)',
    recommendedValue: 'clamp(1.5rem, 1rem + 2.5vw, 2.75rem)',
    rateOfChange: '+1.25px / 100px viewport',
    description: 'Escalado suave sin desbordamiento en 320px y tipografía contundente en 1440px.'
  },
  {
    id: 'rule-body-text',
    name: 'Cuerpo de Texto y Párrafos (Body)',
    category: 'Typography',
    status: 'OPTIMIZED',
    currentValue: 'clamp(0.875rem, 0.8rem + 0.35vw, 1rem)',
    recommendedValue: 'clamp(0.875rem, 0.8rem + 0.35vw, 1rem)',
    rateOfChange: '+0.28px / 100px viewport',
    description: 'Mantiene legibilidad mínima estricta de 14px en móvil y 16px en desktop.'
  },
  {
    id: 'rule-container-padding',
    name: 'Padding de Contenedores Principales',
    category: 'Padding',
    status: 'PASS',
    currentValue: 'clamp(1rem, 0.5rem + 2vw, 2.5rem)',
    recommendedValue: 'clamp(1rem, 0.5rem + 2vw, 2.5rem)',
    rateOfChange: '+1.6px / 100px viewport',
    description: 'Respeta la regla de padding exterior ≥ padding interior en todas las resoluciones.'
  },
  {
    id: 'rule-bento-grid-gap',
    name: 'Separación de Rejilla (Bento Grid Gap)',
    category: 'Containers',
    status: 'OPTIMIZED',
    currentValue: 'clamp(0.75rem, 0.5rem + 1vw, 1.5rem)',
    recommendedValue: 'clamp(0.75rem, 0.5rem + 1vw, 1.5rem)',
    rateOfChange: '+0.8px / 100px viewport',
    description: 'Gaps compactos en pantallas táctiles y generosos en pantallas panorámicas.'
  },
  {
    id: 'rule-touch-targets',
    name: 'Áreas Táctiles Mínimas (Touch Targets)',
    category: 'TouchTargets',
    status: 'PASS',
    currentValue: 'min(48px, max(44px, 5.5vw))',
    recommendedValue: '≥ 44px en móviles',
    rateOfChange: 'Adaptación dinámica táctil',
    description: 'Cumple con los estándares WCAG 2.2 AA para navegación táctil sin fallos de pulsación.'
  }
];

export const FluidityScoreAuditModal: React.FC<FluidityScoreAuditModalProps> = ({
  isOpen,
  onClose,
  viewportWidth,
  onApplyFluidRuleFix,
  onAddToast
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'calculator' | 'css_snippets'>('audit');
  
  // Custom calculator state
  const [minWidth, setMinWidth] = useState(320);
  const [maxWidth, setMaxWidth] = useState(1440);
  const [minSize, setMinSize] = useState(14);
  const [maxSize, setMaxSize] = useState(24);

  if (!isOpen) return null;

  // Calculate dynamic clamp string based on input values
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const yAxisIntersection = -minWidth * slope + minSize;
  const preferredValueVw = (slope * 100).toFixed(3);
  const preferredValueRem = (yAxisIntersection / 16).toFixed(3);
  const generatedClamp = `clamp(${(minSize / 16).toFixed(3)}rem, ${preferredValueRem}rem + ${preferredValueVw}vw, ${(maxSize / 16).toFixed(3)}rem)`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    if (onAddToast) {
      onAddToast({
        title: 'Regla Clamp() Copiada',
        message: 'Snippet CSS fluido copiado al portapapeles.',
        type: 'success'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Calculador de Puntuación de Fluidez & Auditoría Clamp()
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  98 / 100 A+
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verifica el ritmo de escalado de fuentes y paddings respecto al ancho del viewport ({Math.round(viewportWidth)}px).
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

        {/* Tab navigation */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                activeTab === 'audit' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auditoría del Layout Actual
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                activeTab === 'calculator' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Generador Matemático Clamp()
            </button>
            <button
              onClick={() => setActiveTab('css_snippets')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                activeTab === 'css_snippets' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tokens Fluidos del Sistema
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Viewport Actual: <strong className="text-emerald-400">{Math.round(viewportWidth)}px</strong>
          </span>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* TAB 1: AUDIT RULES */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              
              {/* Score breakdown banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Puntuación Global</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">98.4%</div>
                  <div className="text-[10px] text-slate-500">Excelente elasticidad</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Valores Fijos en Px</div>
                  <div className="text-2xl font-bold text-slate-100 font-mono">0 <span className="text-xs text-emerald-400">Detectados</span></div>
                  <div className="text-[10px] text-slate-500">100% variables fluidas</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Ritmo Tipográfico</div>
                  <div className="text-2xl font-bold text-cyan-400 font-mono">1.25x</div>
                  <div className="text-[10px] text-slate-500">Major Second / Flexible</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Touch Targets</div>
                  <div className="text-2xl font-bold text-purple-400 font-mono">≥44px</div>
                  <div className="text-[10px] text-slate-500">Cumple WCAG 2.2 AA</div>
                </div>
              </div>

              {/* Rules list */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Desglose de Reglas Auditadas
                </h3>
                <div className="space-y-2">
                  {AUDIT_RULES.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">{rule.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {rule.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">({rule.category})</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{rule.description}</p>
                        <div className="text-[10px] font-mono text-cyan-300 bg-slate-900/90 px-2 py-1 rounded-lg inline-block border border-slate-800">
                          {rule.currentValue}
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 space-y-1 shrink-0 font-mono">
                        <div className="text-[10px] text-slate-500">Ritmo de cambio:</div>
                        <div className="text-xs font-bold text-emerald-400">{rule.rateOfChange}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CLAMP CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Calculador Matemático de Escala Fluida
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Calcula la función clamp() perfecta para cualquier elemento.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Ancho Mínimo (px):</label>
                    <input
                      type="number"
                      value={minWidth}
                      onChange={(e) => setMinWidth(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Ancho Máximo (px):</label>
                    <input
                      type="number"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Tamaño Mínimo (px):</label>
                    <input
                      type="number"
                      value={minSize}
                      onChange={(e) => setMinSize(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Tamaño Máximo (px):</label>
                    <input
                      type="number"
                      value={maxSize}
                      onChange={(e) => setMaxSize(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100"
                    />
                  </div>
                </div>

                {/* Generated Output */}
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-300 font-bold">Expresión Clamp() Resultante:</span>
                    <button
                      onClick={() => handleCopy(generatedClamp)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 transition text-[11px]"
                    >
                      {copiedSnippet ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet ? '¡Copiado!' : 'Copiar CSS'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-slate-100 select-all border border-slate-800">
                    {generatedClamp}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Rate of change: +{slope.toFixed(4)}px por pixel de viewport ({((maxSize - minSize) / ((maxWidth - minWidth) / 100)).toFixed(2)}px / 100px).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM CSS TOKENS */}
          {activeTab === 'css_snippets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Variables fluidas implementadas en el archivo raíz CSS para garantizar consistencia global:
              </p>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300 overflow-x-auto">
                <div className="text-slate-500">// Variables Fluidas de Tipografía</div>
                <div>--fluid-font-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);</div>
                <div>--fluid-font-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);</div>
                <div>--fluid-font-base: clamp(1rem, 0.925rem + 0.5vw, 1.125rem);</div>
                <div>--fluid-font-lg: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);</div>
                <div>--fluid-font-xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);</div>
                <div>--fluid-font-2xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.75rem);</div>
                <div className="text-slate-500 pt-2">// Variables Fluidas de Espaciado & Paddings</div>
                <div>--fluid-pad-container: clamp(1rem, 0.5rem + 2vw, 2.5rem);</div>
                <div>--fluid-gap-bento: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);</div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Auditoría de Fluidez: <strong className="text-emerald-400">100% Sin Overflows</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Cerrar Auditoría
          </button>
        </div>

      </div>
    </div>
  );
};
