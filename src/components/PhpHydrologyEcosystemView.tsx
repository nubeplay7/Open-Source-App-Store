import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Workflow, 
  Sparkles, 
  ShoppingCart, 
  Code2, 
  Cpu, 
  Activity, 
  FileCode2, 
  Download, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Zap, 
  Building2, 
  Copy, 
  RefreshCw, 
  Terminal,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { 
  phpHydrologyService, 
  PhpHealthData, 
  BuilderWidgetDefinition, 
  BuilderRenderResult, 
  CommerceProduct, 
  WordPressPluginMetadata 
} from '../services/phpHydrologyService';

export const PhpHydrologyEcosystemView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RIVERS_MAP' | 'ELEMENTOR_BUILDER' | 'WOOCOMMERCE_STORE' | 'PLUGINS_VAULT' | 'PHP_TELEMETRY'>('RIVERS_MAP');
  const [phpHealth, setPhpHealth] = useState<PhpHealthData | null>(null);
  const [plugins, setPlugins] = useState<WordPressPluginMetadata[]>([]);
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [widgets, setWidgets] = useState<BuilderWidgetDefinition[]>([]);
  
  // Elementor Builder State
  const [layoutBlocks, setLayoutBlocks] = useState<Array<{ type: string; props: Record<string, any> }>>([
    {
      type: 'HERO_BANNER',
      props: {
        title: 'Civer App Store Matrix',
        subtitle: 'Ecosistema de Software Libre y Trabajo Remunerado en Línea',
        badge: 'HEADLESS PHP & REACT'
      }
    },
    {
      type: 'TELEMETRY_HUD',
      props: { nodes: ['ASUS_MASTER', 'THINKPAD_PEER', 'SAMSUNG_A06', 'LAGUNA_PHP'] }
    },
    {
      type: 'PAYOUT_CARD',
      props: { currency: 'SATS', instant_settlement: true }
    }
  ]);
  const [builderResult, setBuilderResult] = useState<BuilderRenderResult | null>(null);
  const [codeViewMode, setCodeViewMode] = useState<'PREVIEW' | 'HTML' | 'COMPOSE'>('PREVIEW');
  const [isCompiling, setIsCompiling] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // WooCommerce Cart State
  const [cart, setCart] = useState<Record<string, number>>({
    'prod-civer-vip-pass': 1
  });
  const [checkoutResult, setCheckoutResult] = useState<any | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const health = await phpHydrologyService.getPhpHealth();
    setPhpHealth(health);

    const plg = await phpHydrologyService.getInstalledWordPressPlugins();
    setPlugins(plg);

    const prods = await phpHydrologyService.getCommerceProducts();
    setProducts(prods);

    const w = await phpHydrologyService.getBuilderWidgets();
    setWidgets(w);

    handleCompileBuilder(layoutBlocks);
  };

  const handleCompileBuilder = async (blocks: Array<{ type: string; props: Record<string, any> }>) => {
    setIsCompiling(true);
    const res = await phpHydrologyService.renderElementorLayout(blocks);
    setBuilderResult(res);
    setIsCompiling(false);
  };

  const handleAddBlock = (widgetType: string) => {
    const found = widgets.find(w => w.type === widgetType);
    const newBlock = {
      type: widgetType,
      props: found ? { ...found.default_props } : {}
    };
    const updated = [...layoutBlocks, newBlock];
    setLayoutBlocks(updated);
    handleCompileBuilder(updated);
  };

  const handleRemoveBlock = (index: number) => {
    const updated = layoutBlocks.filter((_, i) => i !== index);
    setLayoutBlocks(updated);
    handleCompileBuilder(updated);
  };

  const handleAddToCart = (productId: string) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      const items = Object.entries(cart).map(([prodId, qty]) => {
        const p = products.find(prod => prod.id === prodId);
        return {
          product_id: prodId,
          name: p?.name || prodId,
          quantity: qty,
          unit_price_usd: p?.price_usd || 0
        };
      });

      const totalUsd = items.reduce((acc, curr) => acc + curr.unit_price_usd * curr.quantity, 0);
      const totalSats = Math.round(totalUsd * 1550);

      setCheckoutResult({
        status: 'PENDING_PAYMENT',
        order_id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        total_usd: totalUsd,
        total_sats: totalSats,
        savings_vs_playstore: totalUsd * 0.30,
        lightning_invoice: `lnbc${totalSats}u1p3civer${Math.random().toString(36).substring(2, 10)}`,
        spei_clabe: '012180001234567890 (BBVA - Civer Cloud Tesorería)'
      });
      setIsCheckingOut(false);
    }, 800);
  };

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-100 pb-20 select-none">
      
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Ecosistema de Ríos y Lagunas</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    PHP 8.2 + Headless WordPress
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Microservicios desacoplados: Clon FOSS de Elementor (Visual Builder) y WooCommerce con liquidación Lightning.
                </p>
              </div>
            </div>
          </div>

          {/* Quick PHP Runtime Badge */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 px-3.5 shadow-xl font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">PHP {phpHealth?.version.split(' ')[0] || '8.2.33'}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">{phpHealth?.status || 'ONLINE'}</span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-300">{plugins.length} Plugins Activos</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('RIVERS_MAP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'RIVERS_MAP'
                ? 'bg-blue-950/80 border-blue-700 text-blue-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>1. Mapa de Ríos y Lagunas</span>
          </button>
          <button
            onClick={() => setActiveTab('ELEMENTOR_BUILDER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'ELEMENTOR_BUILDER'
                ? 'bg-purple-950/80 border-purple-700 text-purple-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Clon Elementor (Visual Builder FOSS)</span>
          </button>
          <button
            onClick={() => setActiveTab('WOOCOMMERCE_STORE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'WOOCOMMERCE_STORE'
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>3. Clon WooCommerce (Commerce Engine)</span>
          </button>
          <button
            onClick={() => setActiveTab('PLUGINS_VAULT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'PLUGINS_VAULT'
                ? 'bg-amber-950/80 border-amber-700 text-amber-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>4. Bóveda de Plugins Soberanos ({plugins.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PHP_TELEMETRY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'PHP_TELEMETRY'
                ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>5. Telemetría Runtime PHP</span>
          </button>
        </div>
      </header>

      {/* Main Tab Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

        {/* TAB 1: RIVERS & LAGOONS TOPOLOGY MAP */}
        {activeTab === 'RIVERS_MAP' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="max-w-3xl space-y-2">
                <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <Workflow className="w-7 h-7 text-sky-400" />
                  <span>Topología Hidrológica: Confluencia de Microservicios</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  En Civer Cloud, los servicios operan como <strong>ríos y lagunas interconectados</strong>. 
                  El río principal de TypeScript/React confluye con la <strong>Laguna PHP 8.2</strong>, la cual nutre a su vez la <strong>Laguna Headless WordPress</strong> 
                  y sus canales de plugins soberanos (clones de Elementor y WooCommerce), desembocando en el estuario del hardware real Android (Samsung Galaxy A06).
                </p>
              </div>

              {/* Hydrology Flow Diagram */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Node 1: Río Principal Antigravity */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 space-y-3 relative shadow-xl">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-indigo-400 font-bold">RÍO PRINCIPAL</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-base font-black text-white">Antigravity Clúster</div>
                  <p className="text-xs text-slate-400">Master ASUS (:3000) &amp; Gateway (:3080). Orquestación de agentes y PWA.</p>
                  <div className="text-[10px] font-mono text-indigo-300">Caudal: REST / WebSocket Bus</div>
                </div>

                {/* Node 2: Laguna PHP Headless */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/40 space-y-3 relative shadow-xl">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-blue-400 font-bold">LAGUNA PHP</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-base font-black text-white">PHP 8.2.33 Core</div>
                  <p className="text-xs text-slate-400">Microservicio REST (:8088). Controladores de Render y Checkout.</p>
                  <div className="text-[10px] font-mono text-blue-300">Caudal: Native SAPI / JSON Router</div>
                </div>

                {/* Node 3: Laguna WordPress & Plugins */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 space-y-3 relative shadow-xl">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-purple-400 font-bold">LAGUNA WORDPRESS</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-base font-black text-white">Headless WP Plugins</div>
                  <p className="text-xs text-slate-400">Clones FOSS de Elementor y WooCommerce. 0% comisiones.</p>
                  <div className="text-[10px] font-mono text-purple-300">Caudal: WP REST API / Hooks</div>
                </div>

                {/* Node 4: Estuario Hardware Android */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 space-y-3 relative shadow-xl">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-emerald-400 font-bold">ESTUARIO NATIVO</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-base font-black text-white">Samsung Galaxy A06</div>
                  <p className="text-xs text-slate-400">Ejecución nativa de APKs mediante Shizuku y Jetpack Compose.</p>
                  <div className="text-[10px] font-mono text-emerald-300">Caudal: ADB over SSH Bridge</div>
                </div>
              </div>

              {/* Guarantees Matrix */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white mb-0.5">Desacoplamiento Absoluto</div>
                    <div className="text-slate-400">El frontend React y la app Android consumen exclusivamente contratos JSON sin depender de templates PHP acoplados.</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white mb-0.5">Paridad Cruzada Web ↔ Compose</div>
                    <div className="text-slate-400">Todo bloque diseñado en el Clon de Elementor se compila automáticamente tanto a Tailwind como a Jetpack Compose.</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Server className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white mb-0.5">Soberanía de Plugins</div>
                    <div className="text-slate-400">Los plugins son 100% compatibles con WordPress estándar y pueden exportarse a cualquier servidor en producción.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ELEMENTOR VISUAL BUILDER CLONE */}
        {activeTab === 'ELEMENTOR_BUILDER' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Widget Palette & Blocks Tree */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>Paleta de Widgets FOSS</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">Clon Elementor</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {widgets.map(w => (
                      <button
                        key={w.type}
                        onClick={() => handleAddBlock(w.type)}
                        className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-600 text-left transition flex items-center justify-between text-xs text-slate-200 group"
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="w-3.5 h-3.5 text-purple-400 group-hover:scale-125 transition" />
                          <span>{w.name}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{w.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Blocks List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Estructura de la Página ({layoutBlocks.length} bloques)</span>
                    <button 
                      onClick={() => handleCompileBuilder(layoutBlocks)}
                      className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCompiling ? 'animate-spin' : ''}`} />
                      <span>Recompilar</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {layoutBlocks.map((b, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300">#{i + 1} {b.type}</span>
                        <button 
                          onClick={() => handleRemoveBlock(i)}
                          className="p-1 text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Output & Code Inspector */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  
                  {/* Mode Selector */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCodeViewMode('PREVIEW')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          codeViewMode === 'PREVIEW'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Vista Previa en Vivo
                      </button>
                      <button
                        onClick={() => setCodeViewMode('HTML')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          codeViewMode === 'HTML'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        HTML + Tailwind
                      </button>
                      <button
                        onClick={() => setCodeViewMode('COMPOSE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          codeViewMode === 'COMPOSE'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Jetpack Compose (Android)
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const code = codeViewMode === 'HTML' 
                          ? builderResult?.compiled_html 
                          : builderResult?.compiled_jetpack_compose;
                        if (code) {
                          navigator.clipboard.writeText(code);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
                    </button>
                  </div>

                  {/* Canvas Container */}
                  {codeViewMode === 'PREVIEW' ? (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 min-h-[400px]">
                      {builderResult?.compiled_html ? (
                        <div dangerouslySetInnerHTML={{ __html: builderResult.compiled_html }} />
                      ) : (
                        <div className="py-20 text-center text-slate-500 text-xs">Sin bloques compilados.</div>
                      )}
                    </div>
                  ) : (
                    <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] border border-slate-800">
                      <pre className="whitespace-pre-wrap">
                        {codeViewMode === 'HTML' 
                          ? builderResult?.compiled_html 
                          : builderResult?.compiled_jetpack_compose}
                      </pre>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: WOOCOMMERCE COMMERCE ENGINE CLONE */}
        {activeTab === 'WOOCOMMERCE_STORE' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Products List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-400" />
                        <span>Catálogo Headless (Clon Soberano de WooCommerce)</span>
                      </h3>
                      <p className="text-xs text-slate-400">Productos digitales de software libre y microtransacciones con 0% comisiones.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                      0% Fees (Ahorro del 30%)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map(p => (
                      <div key={p.id} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-white">{p.name}</h4>
                            <span className="text-[10px] font-mono text-slate-500">{p.sku}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{p.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                          <div>
                            <div className="text-base font-black text-emerald-400">${p.price_usd.toFixed(2)} USD</div>
                            <div className="text-[10px] font-mono text-amber-400">≈ {p.price_sats.toLocaleString()} sats</div>
                          </div>
                          <button
                            onClick={() => handleAddToCart(p.id)}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs transition shadow flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Cart & Checkout Box */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    <span>Carrito de Compras Soberano</span>
                  </h3>

                  <div className="space-y-2">
                    {Object.entries(cart).map(([prodId, qty]) => {
                      const p = products.find(prod => prod.id === prodId);
                      if (!p) return null;
                      return (
                        <div key={prodId} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-slate-200">{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Cant: {qty} • ${p.price_usd.toFixed(2)} c/u</div>
                          </div>
                          <span className="font-bold text-emerald-400">${(p.price_usd * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || Object.keys(cart).length === 0}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg flex items-center justify-center gap-2"
                  >
                    {isCheckingOut ? (
                      <span>Generando Orden Headless...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Pagar con Lightning / SPEI</span>
                      </>
                    )}
                  </button>

                  {/* Checkout Receipt */}
                  {checkoutResult && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs font-mono animate-fadeIn">
                      <div className="flex justify-between text-slate-400">
                        <span>Orden</span>
                        <span className="text-white font-bold">{checkoutResult.order_id}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Total a Pagar</span>
                        <span className="text-emerald-400 font-bold">${checkoutResult.total_usd.toFixed(2)} USD ({checkoutResult.total_sats.toLocaleString()} sats)</span>
                      </div>
                      <div className="flex justify-between text-emerald-300/90 text-[10px]">
                        <span>Ahorrado vs Play Store (30%)</span>
                        <span>+${checkoutResult.savings_vs_playstore.toFixed(2)} USD</span>
                      </div>
                      <div className="pt-2 border-t border-slate-900 space-y-1">
                        <div className="text-[10px] text-slate-500">Factura Lightning BOLT11:</div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[9px] break-all text-amber-300 select-all">
                          {checkoutResult.lightning_invoice}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: SOVEREIGN PLUGINS VAULT */}
        {activeTab === 'PLUGINS_VAULT' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-5 h-5 text-amber-400" />
                    <span>Bóveda de Plugins WordPress Soberanos de Civer Cloud</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Extensiones nativas desarrolladas para WordPress estándar, listas para empaquetarse en ZIP e instalarse en cualquier droplet.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                  Directorio: php/wordpress-plugins/
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plugins.map(plg => (
                  <div key={plg.slug} className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          v{plg.version}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Activo
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">{plg.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{plg.description}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-900 text-xs font-mono">
                      <div className="text-[10px] text-slate-500">
                        Archivo principal: <span className="text-slate-300">{plg.main_file}</span>
                      </div>
                      <button
                        onClick={() => alert(`📦 Paquete ${plg.slug}.zip generado para exportación a WordPress.`)}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar ZIP para WP</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PHP RUNTIME TELEMETRY */}
        {activeTab === 'PHP_TELEMETRY' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Telemetría de la Laguna PHP</h3>
                    <p className="text-xs text-slate-400 font-mono">Runtime: PHP {phpHealth?.version || '8.2.33'}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
                  {phpHealth?.status || 'ONLINE'}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px]">Memoria en Uso</span>
                  <div className="text-base font-bold text-emerald-400">{phpHealth?.memory.current_formatted || '2.40 MB'}</div>
                  <span className="text-slate-500 text-[10px]">Límite: {phpHealth?.memory.limit || '128M'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px]">SAPI / Arquitectura</span>
                  <div className="text-base font-bold text-sky-400">{phpHealth?.sapi || 'cli-server'}</div>
                  <span className="text-slate-500 text-[10px]">SO: {phpHealth?.os || 'Windows'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px]">Puerto Local Microservicio</span>
                  <div className="text-base font-bold text-indigo-400">:8088</div>
                  <span className="text-slate-500 text-[10px]">REST API v1</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px]">OPcache Accelerator</span>
                  <div className="text-base font-bold text-purple-400">Activo</div>
                  <span className="text-slate-500 text-[10px]">Bytecode JIT Ready</span>
                </div>
              </div>

              {/* Extensions Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Extensiones PHP Habilitadas</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {Object.entries(phpHealth?.extensions || {}).map(([ext, active]) => (
                    <div key={ext} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-300">{ext}</span>
                      <span className={`text-[10px] font-bold ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {active ? '✓ HABILITADA' : '○ AUSENTE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};
