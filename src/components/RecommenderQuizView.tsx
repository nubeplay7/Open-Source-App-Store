import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Download,
  Terminal,
  Layers
} from 'lucide-react';
import { AppStoreInfo } from '../types';

interface RecommenderQuizViewProps {
  stores: AppStoreInfo[];
  onSelectStore: (store: AppStoreInfo) => void;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    points: Record<string, number>;
  }[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'primary_goal',
    title: '1. ¿Cuál es tu objetivo principal al buscar una tienda alternativa?',
    subtitle: 'Define la necesidad primordial de tu dispositivo.',
    options: [
      {
        label: 'Descargar aplicaciones populares de Google Play Store sin cuenta ni servicios de Google',
        description: 'Necesito WhatsApp, apps bancarias, redes sociales, Uber, etc., de forma anónima.',
        points: { 'aurora-store': 10, 'droid-ify': 2, 'obtainium': 1 }
      },
      {
        label: 'Catálogo 100% de Software Libre y de Código Abierto (FOSS)',
        description: 'Quiero sustituir apps propietarias por alternativas éticas, seguras y libres de rastreadores.',
        points: { 'droid-ify': 10, 'neo-store': 9, 'fdroid-official': 6, 'accrescent': 5 }
      },
      {
        label: 'Actualizaciones inmediatas (Día 0) de mis apps favoritas desde GitHub',
        description: 'Uso apps como Revanced, Seal, NewPipe, forks de Tachiyomi y quiero releases al instante.',
        points: { 'obtainium': 10, 'droid-ify': 4, 'neo-store': 3 }
      },
      {
        label: 'Máxima seguridad criptográfica y protección contra degradación de versiones',
        description: 'Utilizo ROMs seguras (GrapheneOS/CalyxOS) y priorizo la integridad absoluta de la firma.',
        points: { 'accrescent': 10, 'obtainium': 6, 'droid-ify': 4 }
      },
      {
        label: 'Auditoría avanzada de privacidad, bloqueo de rastreadores y backup forense',
        description: 'Quiero analizar permisos, firmas y bloquear componentes internos de las aplicaciones.',
        points: { 'app-manager': 10, 'neo-store': 5, 'obtainium': 3 }
      }
    ]
  },
  {
    id: 'technical_level',
    title: '2. ¿Qué nivel de comodidad técnica prefieres?',
    subtitle: 'Elige la experiencia de usuario que mejor se adapte a tu día a día.',
    options: [
      {
        label: 'Interfaz limpia, moderna y visualmente impecable (Material You)',
        description: 'Buscar, tocar e instalar sin configurar parámetros complejos.',
        points: { 'droid-ify': 10, 'neo-store': 9, 'aurora-store': 8 }
      },
      {
        label: 'Tener control de URLs, repositorios directos y reglas de filtrado',
        description: 'No me importa pegar URLs de GitHub o configurar repositorios personalizados.',
        points: { 'obtainium': 10, 'app-manager': 8, 'droid-ify': 5 }
      },
      {
        label: 'Extremadamente ligero y minimalista sin efectos pesados',
        description: 'Dispositivo con recursos limitados o preferencia por velocidad pura.',
        points: { 'foxy-droid': 10, 'fdroid-classic': 9, 'accrescent': 8 }
      }
    ]
  },
  {
    id: 'installation_privileges',
    title: '3. ¿Dispones de Shizuku o permisos Root en tu teléfono?',
    subtitle: 'Para habilitar actualizaciones silenciosas automáticas en segundo plano.',
    options: [
      {
        label: 'Sí, uso Shizuku (ADB inalámbrico) o Root (KernelSU / Magisk / APatch)',
        description: 'Quiero que las apps se actualicen solas en segundo plano sin pulsar "Instalar".',
        points: { 'droid-ify': 9, 'obtainium': 10, 'neo-store': 9, 'app-manager': 10, 'aurora-store': 8 }
      },
      {
        label: 'No, uso un Android 12+ estándar sin Shizuku',
        description: 'Prefiero usar el instalador de sesiones nativo de Android sin tocar ADB.',
        points: { 'droid-ify': 8, 'accrescent': 10, 'aurora-store': 7, 'neo-store': 7 }
      },
      {
        label: 'Tengo un Android antiguo (Android 5 a 10)',
        description: 'Quiero la máxima compatibilidad hacia atrás.',
        points: { 'fdroid-classic': 10, 'foxy-droid': 8, 'fdroid-official': 7 }
      }
    ]
  }
];

export const RecommenderQuizView: React.FC<RecommenderQuizViewProps> = ({
  stores,
  onSelectStore
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (optionIndex: number) => {
    const nextAnswers = { ...selectedAnswers, [currentStep]: optionIndex };
    setSelectedAnswers(nextAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentStep(0);
    setShowResults(false);
  };

  // Calculate scores
  const calculateRecommendations = () => {
    const scores: Record<string, number> = {};

    Object.entries(selectedAnswers).forEach(([stepIndexStr, optionIndex]) => {
      const stepIdx = parseInt(stepIndexStr, 10);
      const question = QUIZ_QUESTIONS[stepIdx];
      if (question && question.options[optionIndex]) {
        const optionPoints = question.options[optionIndex].points;
        Object.entries(optionPoints).forEach(([storeId, pts]) => {
          scores[storeId] = (scores[storeId] || 0) + pts;
        });
      }
    });

    const sortedStoresWithScores = Object.entries(scores)
      .map(([storeId, score]) => ({
        store: stores.find(s => s.id === storeId)!,
        score
      }))
      .filter(item => item.store !== undefined)
      .sort((a, b) => b.score - a.score);

    return sortedStoresWithScores;
  };

  const currentQ = QUIZ_QUESTIONS[currentStep];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center mx-auto mb-3 text-emerald-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          Asistente de Selección Personalizada
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
          Responde a 3 preguntas rápidas sobre tus necesidades y te recomendaremos el conjunto óptimo de tiendas y clientes FOSS para tu configuración de Android.
        </p>
      </div>

      {!showResults ? (
        /* Quiz Question Step Card */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
            <span>Paso {currentStep + 1} de {QUIZ_QUESTIONS.length}</span>
            <span className="text-emerald-400 font-bold">{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-6 border border-slate-800">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          <h3 className="text-base font-bold text-slate-100 mb-1">
            {currentQ.title}
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            {currentQ.subtitle}
          </p>

          <div className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className="w-full text-left p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 hover:bg-slate-850/70 transition-all group flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {option.description}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-start">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors"
              >
                ← Volver a la pregunta anterior
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Tu Combinación FOSS Recomendada
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors font-mono"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Repetir Quiz</span>
              </button>
            </div>

            <div className="space-y-4">
              {calculateRecommendations().slice(0, 3).map((item, rank) => {
                const { store } = item;
                return (
                  <div
                    key={store.id}
                    className={`p-4.5 rounded-xl border transition-all ${
                      rank === 0
                        ? 'bg-emerald-950/40 border-emerald-600/60 shadow-lg'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            rank === 0 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            #{rank + 1} Match Recomendado
                          </span>
                          <h4 className="text-base font-bold text-slate-100">{store.name}</h4>
                          <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">
                            {store.latestVersion}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 font-medium">
                          {store.tagline}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          <strong>¿Por qué te conviene?:</strong> {store.bestForUseCase}
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectStore(store)}
                        className="flex-shrink-0 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Ver Ficha
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                      <span>UX: <strong className="text-sky-400">{store.easeOfUseScore.toFixed(1)}</strong></span>
                      <span>•</span>
                      <span>Seguridad: <strong className="text-emerald-400">{store.securityScore.toFixed(1)}</strong></span>
                      <span>•</span>
                      <span>RAM: <strong className="text-slate-200">{store.performance.ramUsageIdleMb}MB</strong></span>
                      <span>•</span>
                      <span>Sin Root: <strong className={store.features.unattendedRootlessUpdates ? 'text-emerald-400' : 'text-slate-500'}>{store.features.unattendedRootlessUpdates ? 'Sí' : 'No'}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro-tip stack recommendation */}
            <div className="mt-6 bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                El Stack "Trinidad Sagrada" de la Comunidad FOSS
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                La mayoría de los usuarios avanzados de Android combinan tres herramientas complementarias:
                <br />
                1. <strong>Droid-ify</strong> (para explorar el catálogo libre de F-Droid + IzzyOnDroid).
                <br />
                2. <strong>Obtainium</strong> (para recibir al instante versiones de GitHub de apps de alta frecuencia).
                <br />
                3. <strong>Aurora Store</strong> (para bajar apps comerciales de la Play Store en modo anónimo).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
