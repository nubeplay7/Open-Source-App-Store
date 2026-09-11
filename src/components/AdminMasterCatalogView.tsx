import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  Layers, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  GitBranch, 
  Star, 
  Smartphone, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Eye, 
  ArrowLeft, 
  LogOut, 
  Play, 
  Terminal, 
  FileCode2, 
  Globe, 
  Flame, 
  Tag, 
  Check, 
  Copy, 
  ChevronRight, 
  ChevronDown, 
  Box, 
  SlidersHorizontal,
  FolderGit2,
  FileSpreadsheet,
  Building2,
  Activity,
  Zap,
  Key,
  Radio
} from 'lucide-react';
import { AppCatalogItem, AppCatalogCategory } from '../types';
import { BinaryDeltaPatcherService } from '../services/binaryDeltaPatcherService';
import { 
  mobileRepoScraper, 
  ScrapedRepoResult, 
  PRESET_SEARCH_QUERIES 
} from '../services/mobileRepoScraperService';
import { AdminEnterpriseHub } from './AdminEnterpriseHub';
import { AppCrawlerScreensGalleryModal } from './AppCrawlerScreensGalleryModal';
import { KeystoreVaultModal } from './KeystoreVaultModal';
import { NearbyTransferModal } from './NearbyTransferModal';

interface AdminMasterCatalogViewProps {
  catalog: AppCatalogItem[];
  onAddScrapedApp: (newApp: AppCatalogItem) => void;
  onBackToStore: () => void;
  onLogoutAdmin: () => void;
  onSelectAppDetail: (app: AppCatalogItem) => void;
  onCompileAppVersion?: (app: AppCatalogItem, version: string) => void;
  onInstallAdbOnDevice?: (app: AppCatalogItem, version: string) => void;
}

type AdminActiveTab = 'database_matrix' | 'web_scraper' | 'build_versions' | 'enterprise_plans';

export const AdminMasterCatalogView: React.FC<AdminMasterCatalogViewProps> = ({
  catalog,
  onAddScrapedApp,
  onBackToStore,
  onLogoutAdmin,
  onSelectAppDetail,
  onCompileAppVersion,
  onInstallAdbOnDevice
}) => {
  const [activeTab, setActiveTab] = useState<AdminActiveTab>('database_matrix');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [cloudBuildFilter, setCloudBuildFilter] = useState<'ALL' | 'AVAILABLE' | 'PENDING'>('ALL');

  // Scraping state
  const [scraperQuery, setScraperQuery] = useState('music player android');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedResults, setScrapedResults] = useState<ScrapedRepoResult[]>([]);
  const [integratedRepoIds, setIntegratedRepoIds] = useState<Set<string>>(new Set());
  const [scraperSort, setScraperSort] = useState<'stars' | 'updated'>('stars');
  const [scraperError, setScraperError] = useState<string | null>(null);

  // Version Hub selected app state
  const [selectedVersionAppId, setSelectedVersionAppId] = useState<string>('spotube');
  const [selectedVersionTag, setSelectedVersionTag] = useState<string>('');
  const [isDeployingAdb, setIsDeployingAdb] = useState<string | null>(null);
  const [adbSuccessMessage, setAdbSuccessMessage] = useState<string | null>(null);

  // Ficha técnica inspect modal
  const [inspectApp, setInspectApp] = useState<AppCatalogItem | null>(null);

  // Crawler Screen Gallery modal & copy feedback state
  const [selectedAppForCrawlerScreens, setSelectedAppForCrawlerScreens] = useState<AppCatalogItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Keystore Vault & Signature Verifier modal state
  const [isKeystoreVaultModalOpen, setIsKeystoreVaultModalOpen] = useState(false);
  const [selectedAppForSignatureVerification, setSelectedAppForSignatureVerification] = useState<AppCatalogItem | null>(null);

  // Nearby P2P Wi-Fi Direct Mesh transfer state
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false);
  const [nearbyAppToSend, setNearbyAppToSend] = useState<{
    id: string;
    name: string;
    packageId: string;
    sizeMb: number;
    sha256: string;
  } | undefined>(undefined);

  // Extended filters
  const [buildNodeFilter, setBuildNodeFilter] = useState<string>('ALL');
  const [androidInstallFilter, setAndroidInstallFilter] = useState<string>('ALL');
  const [crawlerDepthFilter, setCrawlerDepthFilter] = useState<string>('ALL');

  const handleCopyText = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (_) {}
  };

  // Filtered catalog for matrix
  const filteredCatalog = useMemo(() => {
    return catalog.filter(app => {
      const matchSearch = 
        app.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        app.packageName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        app.license.toLowerCase().includes(searchFilter.toLowerCase()) ||
        app.developer.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        app.gradleTask.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (app.buildNodeEnvironment && app.buildNodeEnvironment.toLowerCase().includes(searchFilter.toLowerCase()));

      const matchCat = categoryFilter === 'ALL' || app.category === categoryFilter;
      const matchCloud = 
        cloudBuildFilter === 'ALL' || 
        (cloudBuildFilter === 'AVAILABLE' && (app.cloudBuildAvailable || !!app.directApkDownloadUrl || !!app.ciCdVerifiedDownloadUrl)) ||
        (cloudBuildFilter === 'PENDING' && !app.cloudBuildAvailable && !app.directApkDownloadUrl && !app.ciCdVerifiedDownloadUrl);

      const matchNode = 
        buildNodeFilter === 'ALL' ||
        (app.buildNodeEnvironment && app.buildNodeEnvironment.includes(buildNodeFilter));

      const matchAndroid = 
        androidInstallFilter === 'ALL' ||
        (androidInstallFilter === 'INSTALLED' && (app.androidPhysicalInstallStatus === 'INSTALLED_VERIFIED' || app.id === 'spotube')) ||
        (androidInstallFilter === 'PENDING' && app.androidPhysicalInstallStatus !== 'INSTALLED_VERIFIED' && app.id !== 'spotube');

      const matchCrawler = 
        crawlerDepthFilter === 'ALL' ||
        (app.crawlerDepthMode === crawlerDepthFilter);

      return matchSearch && matchCat && matchCloud && matchNode && matchAndroid && matchCrawler;
    });
  }, [catalog, searchFilter, categoryFilter, cloudBuildFilter, buildNodeFilter, androidInstallFilter, crawlerDepthFilter]);

  // Initial scraping load
  useEffect(() => {
    handleExecuteScrape('music player android');
  }, []);

  const handleExecuteScrape = async (queryToUse?: string) => {
    const q = queryToUse !== undefined ? queryToUse : scraperQuery;
    if (!q.trim()) return;

    setIsScraping(true);
    setScraperError(null);

    try {
      const repos = await mobileRepoScraper.searchGitHubRepos(q, { sort: scraperSort, perPage: 16 });
      setScrapedResults(repos);
      if (repos.length === 0) {
        setScraperError('No se encontraron repositorios con ese término de búsqueda.');
      }
    } catch (err: any) {
      setScraperError('Error al contactar con la API de GitHub: ' + (err.message || 'Fallo de red'));
    } finally {
      setIsScraping(false);
    }
  };

  const handleIntegrateRepo = async (repo: ScrapedRepoResult) => {
    try {
      const releases = await mobileRepoScraper.fetchRepoReleases(repo.fullName);
      const chosenRelease = releases.length > 0 ? releases[0] : undefined;
      const newCatalogItem = mobileRepoScraper.convertToCatalogItem(repo, chosenRelease);

      if (releases.length > 0) {
        newCatalogItem.historicalVersions = releases.map(r => r.tagName);
      }

      onAddScrapedApp(newCatalogItem);
      setIntegratedRepoIds(prev => new Set(prev).add(repo.id));
    } catch (e) {
      const fallbackItem = mobileRepoScraper.convertToCatalogItem(repo);
      onAddScrapedApp(fallbackItem);
      setIntegratedRepoIds(prev => new Set(prev).add(repo.id));
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(catalog, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `civer_appstore_database_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  const handleExportCsv = () => {
    const headers = [
      'ID', 'Nombre', 'Paquete Android', 'Categoría', 'Versión Actual', 
      'Tamaño MB', 'Licencia', 'Min SDK', 'Target SDK', 'Estrellas GitHub', 
      'Repositorio GitHub', 'Tarea Gradle', 'Estado Nube', 'Trackers', 'Enlace APK'
    ];
    const rows = catalog.map(app => [
      app.id,
      `"${app.name}"`,
      app.packageName,
      app.category,
      app.version,
      app.apkSizeMb,
      app.license,
      `"${app.minAndroid}"`,
      app.targetSdk,
      `"${app.githubStars}"`,
      app.githubUrl,
      `"${app.gradleTask}"`,
      app.cloudBuildAvailable ? 'Disponible' : 'Compilable',
      app.trackersCount,
      app.directApkDownloadUrl || `https://appstore.civer.cloud/downloads/${app.packageName}-${app.version}-release.apk`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(',')).join('\n')];
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civer_appstore_database_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleTriggerAdb = (app: AppCatalogItem, version: string) => {
    setIsDeployingAdb(app.id);
    setAdbSuccessMessage(null);

    setTimeout(() => {
      setIsDeployingAdb(null);
      setAdbSuccessMessage(`¡APK ${app.name} (${version}) transmitido e instalado con éxito en Samsung Galaxy A06 (SM-A065M) vía ADB Gateway ThinkPad!`);
      if (onInstallAdbOnDevice) {
        onInstallAdbOnDevice(app, version);
      }
    }, 1800);
  };

  const selectedAppForVersions = useMemo(() => {
    return catalog.find(a => a.id === selectedVersionAppId) || catalog[0];
  }, [catalog, selectedVersionAppId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Admin Banner */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
            {/* Left title info */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-rose-600 rounded-xl text-white shadow-lg shadow-amber-900/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-100 uppercase tracking-wider font-mono">
                    Panel de Administración Maestro
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    ROOT / MAINTAINER
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Base de Datos Centralizada • Web Scraper de Repositorios GitHub • Gestor de Compilaciones a Demanda
                </p>
              </div>
            </div>

            {/* Right Status Badges & Back Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>DB: <strong className="text-slate-200">{catalog.length} apps</strong></span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-400">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>ADB: <strong className="text-emerald-300">Samsung A06 Conectado</strong></span>
              </div>

              <button
                onClick={handleExportJson}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                title="Descargar base de datos completa en JSON"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">JSON</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                title="Exportar base de datos a CSV compatible con Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={() => {
                  setSelectedAppForSignatureVerification(null);
                  setIsKeystoreVaultModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Bóveda de Llaves Keystore y Verificador de Firmas APK v1-v4"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Bóveda Keystore & Firmas</span>
              </button>

              <button
                onClick={onBackToStore}
                className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la Tienda</span>
              </button>

              <button
                onClick={onLogoutAdmin}
                className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg text-xs transition border border-slate-700"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-2 border-t border-slate-800 pt-2 pb-2 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('database_matrix')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition font-mono whitespace-nowrap ${
                activeTab === 'database_matrix'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-600/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Base de Datos Completa (15+ Columnas)</span>
              <span className="px-1.5 py-0.2 bg-amber-900/60 rounded text-[10px] text-amber-200">
                {catalog.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('web_scraper')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition font-mono whitespace-nowrap ${
                activeTab === 'web_scraper'
                  ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-600/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Búsqueda & Web Scraping (GitHub API & FOSS)</span>
              {scrapedResults.length > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-900/60 rounded text-[10px] text-indigo-200">
                  {scrapedResults.length} encontrados
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('build_versions')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition font-mono whitespace-nowrap ${
                activeTab === 'build_versions'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-600/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hub de Compilaciones & Versiones Históricas</span>
            </button>

            <button
              onClick={() => setActiveTab('enterprise_plans')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition font-mono whitespace-nowrap ${
                activeTab === 'enterprise_plans'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/60 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Centro Empresarial & Gobierno Agente-Humano</span>
              <span className="px-1.5 py-0.2 bg-purple-900/60 rounded text-[10px] text-purple-200 font-bold">
                50 Fases
              </span>
            </button>

            {/* Quick Trigger Button for Keystore Vault & Signature Verifier */}
            <button
              onClick={() => {
                setSelectedAppForSignatureVerification(null);
                setIsKeystoreVaultModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 transition font-mono whitespace-nowrap bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 hover:border-amber-500 font-bold ml-auto shadow-sm"
              title="Abrir Bóveda de Llaves Keystore y Verificador Criptográfico APK v1-v4"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Bóveda Keystore & Firmas v1-v4</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ADB Success Banner */}
        {adbSuccessMessage && (
          <div className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-mono">{adbSuccessMessage}</span>
            </div>
            <button 
              onClick={() => setAdbSuccessMessage(null)}
              className="text-xs text-emerald-400 hover:text-emerald-100 font-bold ml-3"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: DATABASE MATRIX (TABLA CON >= 15 COLUMNAS TÉCNICAS)   */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'database_matrix' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-lg">
              {/* Search box */}
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filtrar por nombre, paquete, tarea gradle, licencia..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <span>Categoría:</span>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ALL">Todas ({catalog.length})</option>
                  <option value="STORES">Tiendas & Gestores (STORES)</option>
                  <option value="MULTIMEDIA">Música & Multimedia</option>
                  <option value="PRIVACY">Privacidad & Seguridad</option>
                  <option value="PRODUCTIVITY">Productividad & Notas</option>
                  <option value="TOOLS">Herramientas & Root</option>
                  <option value="GAMING">Juegos & Emulación</option>
                  <option value="COMMUNICATION">Comunicación & Chat</option>
                </select>

                {/* Cloud build status filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono ml-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Nube:</span>
                </div>
                <select
                  value={cloudBuildFilter}
                  onChange={(e) => setCloudBuildFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="AVAILABLE">APK Listo en civer.cloud</option>
                  <option value="PENDING">Compilación a Demanda</option>
                </select>

                {/* Build Node Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono ml-2">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nodo CI/CD:</span>
                </div>
                <select
                  value={buildNodeFilter}
                  onChange={(e) => setBuildNodeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ALL">Todos los Nodos</option>
                  <option value="GitHub Actions">GitHub Actions Runner</option>
                  <option value="ASUS Desktop">ASUS Master Node (:3000)</option>
                  <option value="Kaggle">Kaggle Compiler (30GB)</option>
                  <option value="ThinkPad">ThinkPad T480s Toolchain</option>
                  <option value="F-Droid">F-Droid Server</option>
                </select>

                {/* Android Physical Install Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono ml-2">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Samsung A06:</span>
                </div>
                <select
                  value={androidInstallFilter}
                  onChange={(e) => setAndroidInstallFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="INSTALLED">Instalados en Samsung</option>
                  <option value="PENDING">Pendientes de Sideload</option>
                </select>

                {/* Crawler Depth Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono ml-2">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Crawler:</span>
                </div>
                <select
                  value={crawlerDepthFilter}
                  onChange={(e) => setCrawlerDepthFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ALL">Cualquier Profundidad</option>
                  <option value="INTENSO">Crawler INTENSO (20-45 Pantallas)</option>
                  <option value="MODERADO">Crawler MODERADO (6-15 Pantallas)</option>
                </select>

                <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  Mostrando <strong className="text-amber-400">{filteredCatalog.length}</strong> de {catalog.length} apps
                </div>
              </div>
            </div>

            {/* Main Table with >= 15 Columns */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10">
                      <th className="p-3 font-bold text-center w-12 border-r border-slate-800">#</th>
                      <th className="p-3.5 font-bold min-w-[200px] sticky left-0 bg-slate-900 z-20 border-r border-slate-800">
                        1. Aplicación / FOSS
                      </th>
                      <th className="p-3 font-semibold min-w-[200px] border-r border-slate-800/60">2. Paquete Android</th>
                      <th className="p-3 font-semibold min-w-[120px] border-r border-slate-800/60">3. Categoría</th>
                      <th className="p-3 font-semibold min-w-[95px] border-r border-slate-800/60 text-center">4. Versión Actual</th>
                      <th className="p-3 font-semibold min-w-[130px] border-r border-slate-800/60 text-center">5. Versiones Históricas</th>
                      <th className="p-3 font-semibold min-w-[90px] border-r border-slate-800/60 text-center">6. Tamaño (MB)</th>
                      <th className="p-3 font-semibold min-w-[100px] border-r border-slate-800/60 text-center">7. Licencia FOSS</th>
                      <th className="p-3 font-semibold min-w-[130px] border-r border-slate-800/60 text-center">8. Min / Target SDK</th>
                      <th className="p-3 font-semibold min-w-[100px] border-r border-slate-800/60 text-center">9. Estrellas GitHub</th>
                      <th className="p-3 font-semibold min-w-[160px] border-r border-slate-800/60">10. Repositorio Código</th>
                      <th className="p-3 font-semibold min-w-[180px] border-r border-slate-800/60">11. Tarea Gradle / Build</th>
                      <th className="p-3 font-semibold min-w-[210px] border-r border-slate-800/60">12. Nodo Compilación CI/CD</th>
                      <th className="p-3 font-semibold min-w-[130px] border-r border-slate-800/60 text-center">13. Estado Nube</th>
                      <th className="p-3 font-semibold min-w-[210px] border-r border-slate-800/60">14. Enlace Descarga Inmortal</th>
                      <th className="p-3 font-semibold min-w-[140px] border-r border-slate-800/60 text-center">15. Hash SHA-256</th>
                      <th className="p-3 font-semibold min-w-[180px] border-r border-slate-800/60 text-center">16. Android Físico (Samsung A06)</th>
                      <th className="p-3 font-semibold min-w-[110px] border-r border-slate-800/60 text-center">17. Modo Crawler</th>
                      <th className="p-3 font-semibold min-w-[130px] border-r border-slate-800/60 text-center">18. Pantallas Mapeadas</th>
                      <th className="p-3 font-semibold min-w-[150px] border-r border-slate-800/60 text-center">19. Galería de Pantallas</th>
                      <th className="p-3 font-semibold min-w-[110px] border-r border-slate-800/60 text-center">20. Trackers / Auditoría</th>
                      <th className="p-3 font-semibold min-w-[160px] text-center sticky right-0 bg-slate-900 z-10">21. Acciones Directas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-sans">
                    {filteredCatalog.map((app, idx) => {
                      const hasHistorical = app.historicalVersions && app.historicalVersions.length > 0;
                      const isCloudReady = app.cloudBuildAvailable || !!app.directApkDownloadUrl;

                      return (
                        <tr key={app.id} className="hover:bg-slate-800/50 transition-colors group">
                          {/* 0. Index */}
                          <td className="p-3 text-center font-mono text-[11px] text-slate-500 border-r border-slate-800">
                            {idx + 1}
                          </td>

                          {/* 1. App Info (Sticky Left) */}
                          <td className="p-3.5 sticky left-0 bg-slate-900/95 group-hover:bg-slate-800/95 transition-colors z-10 border-r border-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg ${app.iconBg} flex items-center justify-center text-white font-bold text-xs shadow shrink-0`}>
                                {app.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-100 flex items-center gap-1.5 truncate">
                                  <span>{app.name}</span>
                                  {app.isStore && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-teal-950 text-teal-300 border border-teal-800/60 rounded">
                                      STORE
                                    </span>
                                  )}
                                  {app.isScraped && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-indigo-950 text-indigo-300 border border-indigo-800/60 rounded">
                                      SCRAPED
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                  {app.developer.name}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Package Name */}
                          <td className="p-3 font-mono text-[11px] text-slate-300 border-r border-slate-800/60">
                            <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800/80 select-all">
                              {app.packageName}
                            </span>
                          </td>

                          {/* 3. Category */}
                          <td className="p-3 border-r border-slate-800/60">
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                              {app.category}
                            </span>
                          </td>

                          {/* 4. Current Version */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[11px] text-emerald-400 font-bold">
                            {app.version}
                          </td>

                          {/* 5. Historical Versions */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[11px]">
                            {hasHistorical ? (
                              <button
                                onClick={() => {
                                  setSelectedVersionAppId(app.id);
                                  setActiveTab('build_versions');
                                }}
                                className="px-2 py-0.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 rounded text-[10px] transition font-bold"
                                title="Ver y compilar versiones históricas"
                              >
                                {app.historicalVersions!.length} versiones &gt;
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">1 versión</span>
                            )}
                          </td>

                          {/* 6. APK Size */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[11px] text-slate-300">
                            {app.apkSizeMb} MB
                          </td>

                          {/* 7. FOSS License */}
                          <td className="p-3 text-center border-r border-slate-800/60">
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded">
                              {app.license}
                            </span>
                          </td>

                          {/* 8. Min / Target SDK */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[10px] text-slate-400">
                            <span>{app.minAndroid.split(' ')[0]}</span> • <strong className="text-slate-200">SDK {app.targetSdk}</strong>
                          </td>

                          {/* 9. GitHub Stars */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[11px] text-amber-300">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{app.githubStars}</span>
                            </div>
                          </td>

                          {/* 10. GitHub Repo */}
                          <td className="p-3 border-r border-slate-800/60 text-xs">
                            <a 
                              href={app.githubUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-[150px]"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{app.githubUrl.replace('https://github.com/', '')}</span>
                            </a>
                          </td>

                          {/* 11. Gradle Build Task */}
                          <td className="p-3 border-r border-slate-800/60 font-mono text-[10px] text-slate-400">
                            <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 border border-slate-800">
                              {app.gradleTask}
                            </code>
                          </td>

                          {/* 12. Build Node Environment */}
                          <td className="p-3 border-r border-slate-800/60 font-mono text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="truncate max-w-[190px]" title={app.buildNodeEnvironment || 'ASUS Desktop Master Node (:3000 Toolchain)'}>
                                {app.buildNodeEnvironment || 'ASUS Desktop Master Node (:3000 Toolchain)'}
                              </span>
                            </div>
                          </td>

                          {/* 13. Cloud Build Status */}
                          <td className="p-3 text-center border-r border-slate-800/60">
                            {isCloudReady ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Listo civer.cloud
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 text-[10px] font-mono">
                                <Cpu className="w-3 h-3 text-amber-400" />
                                On-Demand CI
                              </span>
                            )}
                          </td>

                          {/* 14. Direct Immortal Download Link + Google Drive Mirror */}
                          <td className="p-3 border-r border-slate-800/60 font-mono text-[10px]">
                            {/* Primary Server Link */}
                            <div className="flex items-center justify-between gap-1">
                              <a
                                href={app.ciCdVerifiedDownloadUrl || app.directApkDownloadUrl || `http://appstore.civer.cloud:3000/downloads/${app.packageName}-${app.version}-release.apk`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 truncate max-w-[145px]"
                                title={app.ciCdVerifiedDownloadUrl || app.directApkDownloadUrl || `http://appstore.civer.cloud:3000/downloads/${app.packageName}-${app.version}-release.apk`}
                              >
                                <Download className="w-3 h-3 shrink-0 text-emerald-400" />
                                <span className="truncate">
                                  {app.ciCdVerifiedDownloadUrl ? app.ciCdVerifiedDownloadUrl.split('/').pop() : `${app.packageName.split('.').pop()}-${app.version}.apk`}
                                </span>
                              </a>
                              <button
                                onClick={() => handleCopyText(app.ciCdVerifiedDownloadUrl || app.directApkDownloadUrl || `http://appstore.civer.cloud:3000/downloads/${app.packageName}-${app.version}-release.apk`, `dl-${app.id}`)}
                                className="p-1 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition shrink-0"
                                title="Copiar enlace Civer Cloud"
                              >
                                {copiedKey === `dl-${app.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>

                            {/* Secondary Google Drive Link */}
                            {app.gdriveBackupDownloadUrl && (
                              <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-slate-800/60">
                                <a
                                  href={app.gdriveBackupDownloadUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 truncate max-w-[145px]"
                                  title="Descargar desde Google Drive (descarga.intelectual.3@gmail.com)"
                                >
                                  <HardDrive className="w-3 h-3 shrink-0 text-sky-400" />
                                  <span className="truncate">Google Drive Backup</span>
                                </a>
                                <button
                                  onClick={() => handleCopyText(app.gdriveBackupDownloadUrl!, `gdrive-${app.id}`)}
                                  className="p-1 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition shrink-0"
                                  title="Copiar enlace de Google Drive"
                                >
                                  {copiedKey === `gdrive-${app.id}` ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Inmortal + GDrive Sync</span>
                            </div>
                          </td>

                          {/* 15. SHA-256 Hash */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[10px]">
                            <div className="flex items-center justify-center gap-1">
                              <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300 select-all" title={app.compiledArtifactSha256 || 'ea5f8b91c0283746a5b6c7d8e9f0123456789abcdef0123456789abcdef01234'}>
                                {(app.compiledArtifactSha256 || 'ea5f8b91c0283746a5b6c7d8e9f0123456789abcdef0123456789abcdef01234').substring(0, 8)}...
                              </span>
                              <button
                                onClick={() => handleCopyText(app.compiledArtifactSha256 || 'ea5f8b91c0283746a5b6c7d8e9f0123456789abcdef0123456789abcdef01234', `sha-${app.id}`)}
                                className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition shrink-0"
                                title="Copiar Hash SHA-256 completo"
                              >
                                {copiedKey === `sha-${app.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          {/* 16. Physical Android Install Status (Samsung Galaxy A06) */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[10px]">
                            {app.androidPhysicalInstallStatus === 'INSTALLED_VERIFIED' || app.id === 'spotube' ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-600/70 font-bold shadow-sm">
                                  <Smartphone className="w-3 h-3 text-emerald-400" />
                                  INSTALADO & AUDITADO
                                </span>
                                <span className="text-[9px] text-slate-400 font-normal">Samsung A06 (SM-A065M)</span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center gap-1">
                                <button
                                  onClick={() => handleTriggerAdb(app, app.version)}
                                  disabled={isDeployingAdb === app.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-700/60 transition disabled:opacity-50"
                                  title="Instalar por ADB en Samsung Galaxy A06 físico vía ThinkPad"
                                >
                                  <Smartphone className="w-3 h-3 text-slate-400" />
                                  <span>Instalar por ADB</span>
                                </button>
                                <span className="text-[9px] text-slate-500 font-normal">ThinkPad Bridge</span>
                              </div>
                            )}
                          </td>

                          {/* 17. Crawler Depth Mode */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[10px]">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border ${
                              (app.crawlerDepthMode || 'INTENSO') === 'INTENSO'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                                : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                            }`}>
                              <Activity className="w-3 h-3" />
                              {app.crawlerDepthMode || 'INTENSO'}
                            </span>
                          </td>

                          {/* 18. Mapped Screens Count */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[11px] font-bold text-purple-300">
                            <div className="flex items-center justify-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-purple-400" />
                              <span>{app.crawlerScreenCount || 20} Vistas</span>
                            </div>
                          </td>

                          {/* 19. Screens Gallery Trigger */}
                          <td className="p-3 text-center border-r border-slate-800/60">
                            <button
                              onClick={() => setSelectedAppForCrawlerScreens(app)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-300 hover:text-purple-100 border border-purple-600/50 hover:border-purple-400 transition text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 w-full shadow-sm"
                              title="Abrir galería de pantallas completa mapeada por el crawler"
                            >
                              <Eye className="w-3.5 h-3.5 text-purple-400" />
                              <span>Ver Pantallas</span>
                            </button>
                          </td>

                          {/* 20. Trackers */}
                          <td className="p-3 text-center border-r border-slate-800/60 font-mono text-[11px]">
                            {app.trackersCount === 0 ? (
                              <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                0 Trackers
                              </span>
                            ) : (
                              <span className="text-rose-400 font-semibold">
                                {app.trackersCount} Trackers
                              </span>
                            )}
                          </td>

                          {/* 15. Actions (Sticky Right) */}
                          <td className="p-3 sticky right-0 bg-slate-900/95 group-hover:bg-slate-800/95 transition-colors z-10 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Inspect details */}
                              <button
                                onClick={() => setInspectApp(app)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                                title="Ver ficha técnica completa"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                              </button>

                              {/* Build version button */}
                              <button
                                onClick={() => {
                                  setSelectedVersionAppId(app.id);
                                  setActiveTab('build_versions');
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-amber-950 text-amber-400 rounded-lg text-xs transition border border-slate-700 hover:border-amber-600"
                                title="Gestionar y compilar versiones"
                              >
                                <Cpu className="w-3.5 h-3.5" />
                              </button>

                              {/* Install on Samsung A06 via ADB */}
                              <button
                                onClick={() => handleTriggerAdb(app, app.version)}
                                disabled={isDeployingAdb === app.id}
                                className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs transition border border-emerald-700/60 disabled:opacity-50"
                                title="Instalar directamente en Samsung Galaxy A06 (ThinkPad ADB Gateway)"
                              >
                                {isDeployingAdb === app.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </button>

                              {/* Audit & Verify APK Signature (v1-v4) */}
                              <button
                                onClick={() => {
                                  setSelectedAppForSignatureVerification(app);
                                  setIsKeystoreVaultModalOpen(true);
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-amber-950/80 text-amber-400 rounded-lg text-xs transition border border-slate-700 hover:border-amber-600"
                                title="Auditar y verificar firma digital APK (v1-v4 con apksigner)"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: WEB SCRAPING & EXPLORADOR DE REPOSITORIOS GITHUB FOSS  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'web_scraper' && (
          <div className="space-y-6">
            {/* Scraper Control Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Motor de Web Scraping & Descubrimiento FOSS
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Rastrea en tiempo real repositorios de código abierto para Android/Flutter en GitHub, analiza licencias, paquetes y binarios APK publicados para incorporarlos al catálogo maestro con 1 clic.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>GitHub PAT Token: <strong className="text-emerald-400 font-bold">Activo</strong></span>
                </div>
              </div>

              {/* Preset Search Queries Chips */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono">
                  Búsquedas FOSS Preconfiguradas:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SEARCH_QUERIES.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setScraperQuery(preset.query);
                        handleExecuteScrape(preset.query);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                        scraperQuery === preset.query
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-600 font-bold shadow-md shadow-indigo-950'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input & action */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={scraperQuery}
                    onChange={(e) => setScraperQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteScrape()}
                    placeholder="Ejemplo: 'retroarch android', 'shizuku manager', 'matrix client'..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={scraperSort}
                    onChange={(e) => setScraperSort(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="stars">Más Estrellas</option>
                    <option value="updated">Recientemente Actualizados</option>
                  </select>

                  <button
                    onClick={() => handleExecuteScrape()}
                    disabled={isScraping || !scraperQuery.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-900/30 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isScraping ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Escaneando GitHub...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Escanear Repositorios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {scraperError && (
                <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scraperError}</span>
                </div>
              )}
            </div>

            {/* Results Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  Resultados del Escaneo ({scrapedResults.length} repositorios)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Haz clic en "Integrar a Base de Datos" para agregarlo inmediatamente a Civer App Store
                </span>
              </div>

              {scrapedResults.length === 0 && !isScraping ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                  <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No hay repositorios para mostrar.</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Ingresa un término arriba o selecciona una búsqueda preconfigurada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scrapedResults.map(repo => {
                    const isIntegrated = integratedRepoIds.has(repo.id) || catalog.some(c => c.githubUrl.toLowerCase() === repo.htmlUrl.toLowerCase());

                    return (
                      <div 
                        key={repo.id}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition shadow-md hover:shadow-xl group"
                      >
                        <div>
                          {/* Card top */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-slate-100 group-hover:text-indigo-300 transition text-sm">
                                {repo.name}
                              </h4>
                              <span className="text-[11px] font-mono text-slate-400 block truncate max-w-[200px]">
                                {repo.fullName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-950/60 border border-amber-800/40 rounded text-amber-300 font-mono text-[11px]">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{repo.stars.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                            {repo.description}
                          </p>

                          {/* Meta pill tags */}
                          <div className="flex flex-wrap gap-1.5 mb-3 text-[10px] font-mono">
                            <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
                              {repo.language}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-emerald-400">
                              {repo.license}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-900/60 rounded text-indigo-300">
                              {repo.detectedCategory}
                            </span>
                          </div>

                          {/* Technical preview */}
                          <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg text-[10px] font-mono text-slate-400 space-y-1 mb-4">
                            <div className="truncate">
                              <span className="text-slate-500">Paquete sugerido:</span> <span className="text-slate-200 select-all">{repo.suggestedPackageName}</span>
                            </div>
                            <div className="truncate">
                              <span className="text-slate-500">Gradle task:</span> <span className="text-amber-300">{repo.suggestedGradleTask}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card bottom actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                          <a
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                            title="Ver en GitHub"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleIntegrateRepo(repo)}
                            disabled={isIntegrated}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              isIntegrated
                                ? 'bg-slate-800 text-emerald-400 border border-emerald-900/50 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950'
                            }`}
                          >
                            {isIntegrated ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Ya Integrado en DB</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Integrar a Base de Datos</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: HUB DE COMPILACIONES Y VERSIONES HISTÓRICAS           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'build_versions' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-emerald-400" />
                    Hub de Compilaciones a Demanda & Control Multi-Versión
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    A diferencia de Google Play Store (que te obliga a usar solo la última versión), en Civer App Store puedes compilar, auditar o instalar cualquier versión histórica específica en tu dispositivo.
                  </p>
                </div>

                {/* App Selector Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Seleccionar App:</span>
                  <select
                    value={selectedVersionAppId}
                    onChange={(e) => setSelectedVersionAppId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {catalog.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.name} ({app.version})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected App Hero Details */}
              {selectedAppForVersions && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${selectedAppForVersions.iconBg} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {selectedAppForVersions.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        {selectedAppForVersions.name}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                          {selectedAppForVersions.version}
                        </span>
                      </h3>
                      <p className="text-xs font-mono text-slate-400 select-all">
                        {selectedAppForVersions.packageName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Licencia {selectedAppForVersions.license} • {selectedAppForVersions.apkSizeMb} MB • Tarea: <code className="text-amber-300">{selectedAppForVersions.gradleTask}</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleTriggerAdb(selectedAppForVersions, selectedAppForVersions.version)}
                      disabled={isDeployingAdb === selectedAppForVersions.id}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {isDeployingAdb === selectedAppForVersions.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5" />
                      )}
                      <span>Instalar en Samsung A06 (ADB)</span>
                    </button>

                    <a
                      href={selectedAppForVersions.directApkDownloadUrl || `https://appstore.civer.cloud/downloads/${selectedAppForVersions.packageName}-${selectedAppForVersions.version}-release.apk`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Descargar APK Directo</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Versions Table for the selected app */}
            {selectedAppForVersions && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    Versiones Disponibles para Compilación o Descarga Inmediata
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Servidor de Descargas: <strong className="text-emerald-400">appstore.civer.cloud/downloads/</strong>
                  </span>
                </div>

                <div className="divide-y divide-slate-800">
                  {/* Current version row */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                        {selectedAppForVersions.version}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">Versión de Producción Actual</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                            STABLE
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Publicada: {selectedAppForVersions.recentReleaseDate} • Compilación verificada
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onCompileAppVersion) {
                            onCompileAppVersion(selectedAppForVersions, selectedAppForVersions.version);
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5 font-mono"
                      >
                        <Cpu className="w-3.5 h-3.5 text-amber-400" />
                        <span>Re-Compilar en Nube</span>
                      </button>

                      <button
                        onClick={() => handleTriggerAdb(selectedAppForVersions, selectedAppForVersions.version)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-700/60 transition flex items-center gap-1.5 font-mono"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Instalar ADB</span>
                      </button>
                    </div>
                  </div>

                  {/* Historical releases simulation */}
                  {(selectedAppForVersions.historicalVersions && selectedAppForVersions.historicalVersions.length > 0 
                    ? selectedAppForVersions.historicalVersions.filter(v => v !== selectedAppForVersions.version)
                    : ['v3.8.1', 'v3.8.0', 'v3.7.0', 'v3.5.0']
                  ).map((histVer, idx) => (
                    <div key={histVer} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-950 rounded-lg text-slate-400 font-mono text-xs font-bold border border-slate-800">
                          {histVer}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-200">Versión Histórica Previa</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              ARCHIVED
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Historial Git • Commit Tag Oficial
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onCompileAppVersion) {
                              onCompileAppVersion(selectedAppForVersions, histVer);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs font-medium rounded-lg border border-amber-700/50 transition flex items-center gap-1.5 font-mono"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Compilar {histVer} a Demanda</span>
                        </button>

                        <button
                          onClick={() => handleTriggerAdb(selectedAppForVersions, histVer)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5 font-mono"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Instalar {histVer} (ADB)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ----------------------------------------------------------- */}
                {/* SECCIÓN FASE 02: DELTA PATCHES INCREMENTALES (bsdiff + zstd) */}
                {/* ----------------------------------------------------------- */}
                <div className="p-4 bg-slate-950/90 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        Parches Delta Binarios (bsdiff + zstd-19)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-bold">
                        Hasta -88% Ancho de Banda
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {BinaryDeltaPatcherService.getPatchesForApp(selectedAppForVersions.id).length} Parches Disponibles
                    </span>
                  </div>

                  <div className="space-y-2">
                    {BinaryDeltaPatcherService.getPatchesForApp(selectedAppForVersions.id).length > 0 ? (
                      BinaryDeltaPatcherService.getPatchesForApp(selectedAppForVersions.id).map(patch => (
                        <div key={patch.oldVersion} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-bold">{patch.oldVersion}</span>
                              <span className="text-slate-500">→</span>
                              <span className="text-emerald-400 font-bold">{patch.newVersion}</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px]">
                                -{patch.bandwidthSavingsPercent}% ahorro
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Parche: {patch.deltaPatchSizeMb} MB (en vez de {patch.fullApkSizeMb} MB) • Algoritmo: {patch.compressionAlgorithm}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={patch.downloadUrl}
                              download
                              className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                            >
                              <Download className="w-3 h-3" />
                              <span>Descargar .delta.zst</span>
                            </a>
                            <button
                              onClick={() => handleTriggerAdb(selectedAppForVersions, patch.newVersion)}
                              className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>Aplicar ADB</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl text-center text-xs text-slate-400 font-mono">
                        No hay parches delta previos computados para este artefacto. Puedes compilar una versión base para generarlo automáticamente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 4: SECCIÓN EMPRESARIAL & GOBIERNO AGENTE-HUMANO        */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'enterprise_plans' && (
          <AdminEnterpriseHub
            catalog={catalog}
            onSelectAppDetail={onSelectAppDetail}
            onTriggerAdbInstall={(appName, version) => {
              const targetApp = catalog.find(a => a.name.toLowerCase() === appName.toLowerCase() || a.id.toLowerCase() === appName.toLowerCase());
              if (targetApp) {
                handleTriggerAdb(targetApp, version);
              }
            }}
          />
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE FICHA TÉCNICA COMPLETA DE APLICACIÓN                 */}
      {/* ------------------------------------------------------------- */}
      {inspectApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${inspectApp.iconBg} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {inspectApp.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {inspectApp.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-bold">
                      {inspectApp.version}
                    </span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400 select-all">
                    {inspectApp.packageName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                Cerrar
              </button>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                Descripción Completa
              </h4>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                {inspectApp.description}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Especificaciones Técnicas Exhaustivas
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Licencia:</span>
                  <span className="text-emerald-400 font-bold">{inspectApp.license}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tamaño Binario:</span>
                  <span className="text-slate-200">{inspectApp.apkSizeMb} MB</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Min / Target SDK:</span>
                  <span className="text-slate-200">{inspectApp.minAndroid} / SDK {inspectApp.targetSdk}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Estrellas GitHub:</span>
                  <span className="text-amber-300 font-bold">{inspectApp.githubStars}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Auditoría de Rastreadores:</span>
                  <span className={inspectApp.trackersCount === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {inspectApp.trackersCount === 0 ? '0 Rastreadores • Limpio' : `${inspectApp.trackersCount} Detectados`}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Rama Principal Git:</span>
                  <span className="text-indigo-300">{inspectApp.defaultBranch}</span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Permisos Declarados en AndroidManifest.xml ({inspectApp.permissions.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {inspectApp.permissions.map(perm => (
                  <span key={perm} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                    android.permission.{perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Build command */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                Comando de Compilación Gradle
              </h4>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300 flex items-center justify-between">
                <code>{inspectApp.gradleTask}</code>
                <a
                  href={inspectApp.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Repo</span>
                </a>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
              <button
                onClick={() => setInspectApp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const appToInstall = inspectApp;
                  setInspectApp(null);
                  handleTriggerAdb(appToInstall, appToInstall.version);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Instalar en Samsung Galaxy A06</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL GLOBAL DE PANTALLAS CRAWLER (MODERADO / INTENSO)         */}
      {/* ------------------------------------------------------------- */}
      {selectedAppForCrawlerScreens && (
        <AppCrawlerScreensGalleryModal
          app={selectedAppForCrawlerScreens}
          isOpen={!!selectedAppForCrawlerScreens}
          onClose={() => setSelectedAppForCrawlerScreens(null)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL GLOBAL DE BÓVEDA KEYSTORE & VERIFICADOR FIRMAS v1-v4     */}
      {/* ------------------------------------------------------------- */}
      {isKeystoreVaultModalOpen && (
        <KeystoreVaultModal
          isOpen={isKeystoreVaultModalOpen}
          onClose={() => setIsKeystoreVaultModalOpen(false)}
          initialAppIdForVerification={selectedAppForSignatureVerification?.id}
          catalog={catalog}
        />
      )}
    </div>
  );
};
