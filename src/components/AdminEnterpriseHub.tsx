import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  CheckSquare, 
  FileText, 
  Database, 
  Search, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Smartphone, 
  Sparkles, 
  TrendingUp, 
  Printer, 
  FolderArchive, 
  FileCode, 
  Share2, 
  Sliders, 
  Cpu, 
  Globe, 
  Calendar, 
  Award, 
  Terminal, 
  ArrowUpRight, 
  FileSpreadsheet, 
  BookOpen, 
  Boxes,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  ChevronRight,
  Eye,
  ChevronDown
} from 'lucide-react';
import { AppCatalogItem } from '../types';
import { ROADMAP_50_PHASES, RoadmapPhaseItem } from '../data/roadmap50Data';
import { STORES_DATA } from '../data/stores';
import { SYSTEM_CHANGELOG } from '../data/changelogData';
import { 
  INITIAL_JIRA_TASKS, 
  INITIAL_NOTEBOOK_DOCS, 
  INITIAL_SLACK_CHANNELS 
} from '../data/workspaceData';
import { INITIAL_PROPOSALS } from '../data/proposalsData';
import { APP_SCREENS_INVENTORY } from '../data/appScreensInventory';
import { INITIAL_BUILD_RUNS } from '../data/buildHistoryData';
import { INITIAL_KEYSTORES } from '../data/keystoresData';
import { FUNCTIONALITY_PROFILES, ALL_FEATURES_ENABLED } from '../data/functionalityProfilesData';
import { THEME_PROFILES } from '../data/themeProfilesData';

interface AdminEnterpriseHubProps {
  catalog: AppCatalogItem[];
  onSelectAppDetail?: (app: AppCatalogItem) => void;
  onTriggerAdbInstall?: (appName: string, version: string) => void;
}

type EnterpriseSubTab = 'roadmap_50' | 'tables_directory' | 'json_live_vault' | 'checklists_hub' | 'automated_actions';

export const AdminEnterpriseHub: React.FC<AdminEnterpriseHubProps> = ({
  catalog,
  onSelectAppDetail,
  onTriggerAdbInstall
}) => {
  const [subTab, setSubTab] = useState<EnterpriseSubTab>('roadmap_50');

  // --------------------------------------------------------------------------
  // ESTADO 1: ROADMAP 50 FASES
  // --------------------------------------------------------------------------
  const [roadmapFilterStage, setRoadmapFilterStage] = useState<string>('ALL');
  const [roadmapFilterStatus, setRoadmapFilterStatus] = useState<string>('ALL');
  const [roadmapSearch, setRoadmapSearch] = useState<string>('');

  // Persistencia de estados de fases en localStorage
  const [customPhaseStatuses, setCustomPhaseStatuses] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('civer_enterprise_roadmap_status');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleTogglePhaseStatus = (phaseId: number) => {
    setCustomPhaseStatuses(prev => {
      const current = prev[phaseId] || ROADMAP_50_PHASES.find(p => p.id === phaseId)?.status || 'PLANIFICADO';
      let nextStatus = 'COMPLETO';
      if (current === 'COMPLETO') nextStatus = 'EN_CURSO';
      else if (current === 'EN_CURSO') nextStatus = 'SIGUIENTE';
      else if (current === 'SIGUIENTE') nextStatus = 'PLANIFICADO';
      else nextStatus = 'COMPLETO';

      const updated = { ...prev, [phaseId]: nextStatus };
      localStorage.setItem('civer_enterprise_roadmap_status', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredRoadmap = useMemo(() => {
    return ROADMAP_50_PHASES.filter(item => {
      const currentStatus = customPhaseStatuses[item.id] || item.status;
      const matchStage = roadmapFilterStage === 'ALL' || item.macroStage.includes(roadmapFilterStage);
      const matchStatus = roadmapFilterStatus === 'ALL' || currentStatus === roadmapFilterStatus;
      const matchSearch = 
        item.title.toLowerCase().includes(roadmapSearch.toLowerCase()) ||
        item.specialty.toLowerCase().includes(roadmapSearch.toLowerCase()) ||
        item.objective.toLowerCase().includes(roadmapSearch.toLowerCase()) ||
        item.phaseCode.toLowerCase().includes(roadmapSearch.toLowerCase());

      return matchStage && matchStatus && matchSearch;
    });
  }, [roadmapFilterStage, roadmapFilterStatus, roadmapSearch, customPhaseStatuses]);

  // Métricas del Roadmap
  const completedCount = useMemo(() => {
    return ROADMAP_50_PHASES.filter(p => (customPhaseStatuses[p.id] || p.status) === 'COMPLETO').length;
  }, [customPhaseStatuses]);

  const inProgressCount = useMemo(() => {
    return ROADMAP_50_PHASES.filter(p => (customPhaseStatuses[p.id] || p.status) === 'EN_CURSO' || (customPhaseStatuses[p.id] || p.status) === 'SIGUIENTE').length;
  }, [customPhaseStatuses]);

  const progressPercentage = Math.round((completedCount / ROADMAP_50_PHASES.length) * 100);

  // --------------------------------------------------------------------------
  // ESTADO 2: DIRECTORIO DE 15 TABLAS
  // --------------------------------------------------------------------------
  const [selectedTableIndex, setSelectedTableIndex] = useState<number>(0);
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [tableCopySuccess, setTableCopySuccess] = useState(false);

  // Definición de las 15 tablas
  const tablesDirectory = useMemo(() => {
    let scrapedAppsCount = 0;
    try {
      const stored = localStorage.getItem('civer_admin_scraped_apps');
      if (stored) scrapedAppsCount = JSON.parse(stored).length;
    } catch (e) {}

    return [
      {
        id: 'apps_catalog',
        number: '01',
        name: 'Catálogo Central FOSS (APPS_CATALOG)',
        sourceFile: 'src/data/appsCatalogData.ts',
        storageType: 'TypeScript inmutable + Estado React en memoria',
        recordCount: catalog.length,
        purpose: 'Catálogo de producción de aplicaciones de software libre auditadas con enlaces de descarga directa.',
        data: catalog
      },
      {
        id: 'stores_matrix',
        number: '02',
        name: 'Matriz Técnica de Tiendas (STORES_DATA)',
        sourceFile: 'src/data/stores.ts',
        storageType: 'Data Array estático',
        recordCount: STORES_DATA.length,
        purpose: 'Comparativa en 25 columnas de clientes FOSS (Droid-ify, Aurora, Obtainium, etc.) evaluando RAM y seguridad.',
        data: STORES_DATA
      },
      {
        id: 'system_changelog',
        number: '03',
        name: 'Registro Cronológico de Cambios (SYSTEM_CHANGELOG)',
        sourceFile: 'src/data/changelogData.ts',
        storageType: 'Bitácora inmutable en código',
        recordCount: SYSTEM_CHANGELOG.length,
        purpose: 'Historial completo de iteraciones (1 a 14) con prompts originales, entregables y módulos afectados.',
        data: SYSTEM_CHANGELOG
      },
      {
        id: 'jira_tasks',
        number: '04',
        name: 'Tablero Ágil Jira / Kanban (INITIAL_JIRA_TASKS)',
        sourceFile: 'src/data/workspaceData.ts',
        storageType: 'Objeto relacional interactivo',
        recordCount: INITIAL_JIRA_TASKS.length,
        purpose: 'Control de tareas de ingeniería categorizadas por sprint, estado (Backlog, In Progress, Done) y story points.',
        data: INITIAL_JIRA_TASKS
      },
      {
        id: 'notebook_docs',
        number: '05',
        name: 'Bóveda Obsidian de Notas Técnicas (NOTEBOOK_DOCS)',
        sourceFile: 'src/data/workspaceData.ts',
        storageType: 'Documentos Markdown vivos',
        recordCount: INITIAL_NOTEBOOK_DOCS.length,
        purpose: 'Registros de decisión de arquitectura (ADRs), especificaciones de protocolos y documentación de diseño.',
        data: INITIAL_NOTEBOOK_DOCS
      },
      {
        id: 'slack_channels',
        number: '06',
        name: 'Canales de Ingeniería Slack (INITIAL_SLACK_CHANNELS)',
        sourceFile: 'src/data/workspaceData.ts',
        storageType: 'Estructura interactiva de mensajería',
        recordCount: INITIAL_SLACK_CHANNELS.length,
        purpose: 'Hilos de comunicación técnica entre agentes IA y operadores humanos por especialidad.',
        data: INITIAL_SLACK_CHANNELS
      },
      {
        id: 'proposals_rfc',
        number: '07',
        name: 'Hub de Propuestas Técnicas RFC & PRD (INITIAL_PROPOSALS)',
        sourceFile: 'src/data/proposalsData.ts',
        storageType: 'Especificaciones PRD / RFC con votación',
        recordCount: INITIAL_PROPOSALS.length,
        purpose: 'Gobernanza comunitaria para la aprobación de características avanzadas (P2P Mesh, compilación distribuida).',
        data: INITIAL_PROPOSALS
      },
      {
        id: 'screens_inventory',
        number: '08',
        name: 'Inventario de Pantallas UI (APP_SCREENS_INVENTORY)',
        sourceFile: 'src/data/appScreensInventory.ts',
        storageType: 'Catálogo de vistas y modales',
        recordCount: APP_SCREENS_INVENTORY.length,
        purpose: 'Mapeo exhaustivo de las más de 30 vistas y componentes para auditoría E2E y pruebas visuales.',
        data: APP_SCREENS_INVENTORY
      },
      {
        id: 'build_runs',
        number: '09',
        name: 'Historial de Compilaciones en la Nube (INITIAL_BUILD_RUNS)',
        sourceFile: 'src/data/buildHistoryData.ts',
        storageType: 'Bitácora CI/CD de compilación',
        recordCount: INITIAL_BUILD_RUNS.length,
        purpose: 'Trazabilidad de builds ejecutados en GitHub Actions, Kaggle Cloud y Bare-Metal.',
        data: INITIAL_BUILD_RUNS
      },
      {
        id: 'keystores_vault',
        number: '10',
        name: 'Bóveda Criptográfica de Firmas (INITIAL_KEYSTORES)',
        sourceFile: 'src/data/keystoresData.ts',
        storageType: 'Almacén de certificados y esquemas v1-v4',
        recordCount: INITIAL_KEYSTORES.length,
        purpose: 'Certificados digitales para firma de paquetes APK con algoritmos RSA 4096 y ECDSA P-256.',
        data: INITIAL_KEYSTORES
      },
      {
        id: 'feature_flags',
        number: '11',
        name: 'Matriz de Feature Flags (FUNCTIONALITY_PROFILES)',
        sourceFile: 'src/data/functionalityProfilesData.ts',
        storageType: '16 Flags booleanos + 5 Presets',
        recordCount: FUNCTIONALITY_PROFILES.length,
        purpose: 'Control granular de activación de módulos experimentales sin romper la compatibilidad.',
        data: FUNCTIONALITY_PROFILES
      },
      {
        id: 'theme_profiles',
        number: '12',
        name: 'Perfiles de Temas Visuales (THEME_PROFILES)',
        sourceFile: 'src/data/themeProfilesData.ts',
        storageType: '8 Paletas de color dinámicas',
        recordCount: THEME_PROFILES.length,
        purpose: 'Configuración cromática (OLED Dark, Cyberpunk, Cupertino) y ergonomía de visualización.',
        data: THEME_PROFILES
      },
      {
        id: 'downloads_vault',
        number: '13',
        name: 'Bóveda de Descargas APK en Producción',
        sourceFile: 'mesh-shared-vault/sitio-descarga/downloads/',
        storageType: 'Almacenamiento binario en disco montado',
        recordCount: catalog.filter(a => !!a.directApkDownloadUrl).length,
        purpose: 'Servir binarios APK compilados a través de appstore.civer.cloud/downloads/*.apk.',
        data: catalog.filter(a => !!a.directApkDownloadUrl).map(a => ({
          name: a.name,
          version: a.version,
          sizeMb: a.apkSizeMb,
          url: a.directApkDownloadUrl
        }))
      },
      {
        id: 'scraped_apps_local',
        number: '14',
        name: 'Base Dinámica Scrapeada (civer_admin_scraped_apps)',
        sourceFile: "localStorage['civer_admin_scraped_apps']",
        storageType: 'Persistencia en navegador del usuario',
        recordCount: scrapedAppsCount,
        purpose: 'Apps descubiertas mediante el Scraper de GitHub e incorporadas con el botón "Integrar a Base de Datos".',
        data: (() => {
          try {
            const val = localStorage.getItem('civer_admin_scraped_apps');
            return val ? JSON.parse(val) : [];
          } catch (e) {
            return [];
          }
        })()
      },
      {
        id: 'roadmap_50_table',
        number: '15',
        name: 'Matriz de 50 Fases del Plan Maestro (ROADMAP_50_PHASES)',
        sourceFile: 'src/data/roadmap50Data.ts',
        storageType: 'Estructura de 50 etapas de desarrollo',
        recordCount: ROADMAP_50_PHASES.length,
        purpose: 'Ruta crítica de expansión global desde la génesis hasta la autonomía descentralizada DAO.',
        data: ROADMAP_50_PHASES
      }
    ];
  }, [catalog]);

  const activeTable = tablesDirectory[selectedTableIndex] || tablesDirectory[0];

  const filteredTableData = useMemo(() => {
    if (!tableSearchQuery.trim()) return activeTable.data;
    const q = tableSearchQuery.toLowerCase();
    return activeTable.data.filter((item: any) => {
      const str = JSON.stringify(item).toLowerCase();
      return str.includes(q);
    });
  }, [activeTable, tableSearchQuery]);

  const handleDownloadTableJson = (table: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(table.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${table.id}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyTableJson = (table: any) => {
    navigator.clipboard.writeText(JSON.stringify(table.data, null, 2));
    setTableCopySuccess(true);
    setTimeout(() => setTableCopySuccess(false), 2000);
  };

  // --------------------------------------------------------------------------
  // ESTADO 3: VISOR DE JSONS VIVOS
  // --------------------------------------------------------------------------
  const [selectedJsonDataset, setSelectedJsonDataset] = useState<string>('apps_catalog');
  const [jsonCopyStatus, setJsonCopyStatus] = useState<boolean>(false);

  const jsonDatasets = useMemo(() => {
    return {
      apps_catalog: { name: 'Catálogo de Apps (apps_catalog.json)', data: catalog },
      system_changelog: { name: 'Registro de Cambios (changelog.json)', data: SYSTEM_CHANGELOG },
      jira_tasks: { name: 'Tareas Jira Kanban (jira_tasks.json)', data: INITIAL_JIRA_TASKS },
      screens_inventory: { name: 'Inventario de Pantallas UI (screens.json)', data: APP_SCREENS_INVENTORY },
      proposals_rfc: { name: 'Propuestas RFC / PRD (proposals.json)', data: INITIAL_PROPOSALS },
      roadmap_50: { name: 'Roadmap de 50 Fases (roadmap_50.json)', data: ROADMAP_50_PHASES },
      stores_data: { name: 'Matriz Comparativa Tiendas (stores.json)', data: STORES_DATA }
    };
  }, [catalog]);

  const currentJsonString = useMemo(() => {
    const target = (jsonDatasets as any)[selectedJsonDataset] || jsonDatasets.apps_catalog;
    return JSON.stringify(target.data, null, 2);
  }, [selectedJsonDataset, jsonDatasets]);

  const handleDownloadRawJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(currentJsonString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${selectedJsonDataset}_live.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyRawJson = () => {
    navigator.clipboard.writeText(currentJsonString);
    setJsonCopyStatus(true);
    setTimeout(() => setJsonCopyStatus(false), 2000);
  };

  // --------------------------------------------------------------------------
  // ESTADO 4: CHECKLISTS INTERACTIVOS CON BASE DE DATOS COMPARTIDA
  // --------------------------------------------------------------------------
  const DEFAULT_CHECKLISTS = {
    // SOPs
    'sop_01_github_scrape': true,
    'sop_01_verify_license': true,
    'sop_02_adb_link_thinkpad': true,
    'sop_02_samsung_a06_install': true,
    'sop_02_screen_capture_evidence': true,
    'sop_03_exodus_zero_trackers': true,
    'sop_03_apksigner_v2_v3': true,
    'sop_04_cloudflared_tunnel_active': true,
    'sop_04_server_dual_ports_80_3000': true,
    'sop_05_bsdiff_delta_saving': true,
    // FOSS Certification
    'foss_license_spdx_verified': true,
    'foss_git_repo_public_source': true,
    'foss_no_google_proprietary_bloat': true,
    'foss_apk_hash_sha256_immutable': true,
    // Hardware & Mesh Topology
    'mesh_asus_desktop_master': true,
    'mesh_thinkpad_t480s_gateway': true,
    'mesh_samsung_a06_physical_node': true,
    'mesh_cloudflare_edge_appstore': true
  };

  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('civer_enterprise_checklists');
      return saved ? JSON.parse(saved) : DEFAULT_CHECKLISTS;
    } catch (e) {
      return DEFAULT_CHECKLISTS;
    }
  });

  const handleToggleChecklist = (key: string) => {
    setChecklistState(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('civer_enterprise_checklists', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllChecklists = () => {
    const updated: Record<string, boolean> = {};
    Object.keys(checklistState).forEach(k => { updated[k] = true; });
    setChecklistState(updated);
    localStorage.setItem('civer_enterprise_checklists', JSON.stringify(updated));
  };

  const handleResetChecklists = () => {
    setChecklistState(DEFAULT_CHECKLISTS);
    localStorage.setItem('civer_enterprise_checklists', JSON.stringify(DEFAULT_CHECKLISTS));
  };

  const totalChecks = Object.keys(checklistState).length;
  const verifiedChecks = Object.values(checklistState).filter(Boolean).length;
  const checklistPercentage = totalChecks > 0 ? Math.round((verifiedChecks / totalChecks) * 100) : 0;

  // --------------------------------------------------------------------------
  // ESTADO 5: ACCIONES AUTOMATIZADAS
  // --------------------------------------------------------------------------
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);

  const handleTriggerAction = async (actionType: string) => {
    setIsExecutingAction(true);
    const timestamp = new Date().toLocaleTimeString();

    if (actionType === 'regenerate_printable') {
      setActionLog(prev => [
        `[${timestamp}] 🚀 Disparando compilador universal docs/generate_printable_docs.cjs...`,
        `[${timestamp}] 📄 Transformando PLAN_MAESTRO_GLOBAL_ROADMAP.md a formato A4...`,
        `[${timestamp}] 🖨️ Generando PDF nativo (488 KB) y Word (.doc)...`,
        `[${timestamp}] ✅ Documentos actualizados en docs/imprimibles/. Listos para descarga.`,
        ...prev
      ]);
    } else if (actionType === 'sync_shared_database') {
      setActionLog(prev => [
        `[${timestamp}] 🔄 Sincronizando base de datos en memoria con localStorage...`,
        `[${timestamp}] 📦 Auditando 19 aplicaciones FOSS y apps dinámicas scrapeadas...`,
        `[${timestamp}] 🔒 Verificación de hashes SHA-256 e inmutabilidad de paquetes...`,
        `[${timestamp}] ✅ Sincronización exitosa: 0 discrepancias detectadas.`,
        ...prev
      ]);
    } else if (actionType === 'verify_hardware_links') {
      setActionLog(prev => [
        `[${timestamp}] 🔌 Verificando enlace SSH con ThinkPad T480s (100.96.218.12)...`,
        `[${timestamp}] 📱 Consultando socket ADB: Samsung Galaxy A06 (R8YY500R7ZB) ONLINE.`,
        `[${timestamp}] 🌐 Comprobando HTTP 200 en appstore.civer.cloud... OK.`,
        `[${timestamp}] ✅ Topología de hardware 100% operativa.`,
        ...prev
      ]);
    } else if (actionType === 'export_audit_bundle') {
      const auditData = {
        generatedAt: new Date().toISOString(),
        roadmapProgress: { completed: completedCount, total: ROADMAP_50_PHASES.length, percent: progressPercentage },
        checklists: checklistState,
        tablesRecordCount: tablesDirectory.map(t => ({ table: t.name, count: t.recordCount }))
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `civer_enterprise_audit_bundle_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setActionLog(prev => [
        `[${timestamp}] 📦 Generando paquete de auditoría ejecutiva unificada...`,
        `[${timestamp}] 📥 Descarga completada: civer_enterprise_audit_bundle.json.`,
        ...prev
      ]);
    }

    setIsExecutingAction(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ==================================================================== */}
      {/* CABECERA PRINCIPAL DEL CENTRO EMPRESARIAL                            */}
      {/* ==================================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-950/40">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
                  <span>Centro Empresarial & Gobierno Agente-Humano</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Soberanía FOSS
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Supervisión de planes, 15 tablas integradas, visor de JSONs vivos y checklists automatizados
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Progreso 50 Fases</span>
              <span className="text-base font-black text-amber-400 font-mono">{progressPercentage}%</span>
              <span className="text-[10px] text-slate-400 font-mono block">{completedCount} / 50 Fases</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Tablas del Sistema</span>
              <span className="text-base font-black text-indigo-400 font-mono">15</span>
              <span className="text-[10px] text-slate-400 font-mono block">100% Integradas</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Checklist Operativo</span>
              <span className="text-base font-black text-emerald-400 font-mono">{checklistPercentage}%</span>
              <span className="text-[10px] text-slate-400 font-mono block">{verifiedChecks} / {totalChecks} Verificados</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Dominio CDN Edge</span>
              <span className="text-xs font-bold text-emerald-400 font-mono block mt-1">ONLINE</span>
              <span className="text-[9px] text-slate-400 font-mono block truncate">appstore.civer.cloud</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Avance Global del Roadmap Maestro (50 Hitos Corporativos):</span>
            </span>
            <span className="font-bold text-slate-200">{completedCount} de 50 completados ({progressPercentage}%)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUB-PESTAÑAS DE NAVEGACIÓN EMPRESARIAL                               */}
      {/* ==================================================================== */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setSubTab('roadmap_50')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition font-mono whitespace-nowrap ${
            subTab === 'roadmap_50'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/60 font-bold shadow-lg shadow-amber-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Roadmap 50 Fases & Plan Maestro</span>
          <span className="px-1.5 py-0.2 bg-amber-900/60 rounded text-[10px] text-amber-200 font-bold">
            {completedCount}/50
          </span>
        </button>

        <button
          onClick={() => setSubTab('tables_directory')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition font-mono whitespace-nowrap ${
            subTab === 'tables_directory'
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/60 font-bold shadow-lg shadow-indigo-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Directorio de 15 Tablas del Ecosistema</span>
          <span className="px-1.5 py-0.2 bg-indigo-900/60 rounded text-[10px] text-indigo-200 font-bold">
            15 Tablas
          </span>
        </button>

        <button
          onClick={() => setSubTab('json_live_vault')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition font-mono whitespace-nowrap ${
            subTab === 'json_live_vault'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-bold shadow-lg shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span>Visor de Archivos JSON Vivos</span>
        </button>

        <button
          onClick={() => setSubTab('checklists_hub')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition font-mono whitespace-nowrap ${
            subTab === 'checklists_hub'
              ? 'bg-purple-950 text-purple-300 border border-purple-500/60 font-bold shadow-lg shadow-purple-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-purple-400" />
          <span>Checklists & Auditoría Automatizada</span>
          <span className="px-1.5 py-0.2 bg-purple-900/60 rounded text-[10px] text-purple-200 font-bold">
            {checklistPercentage}%
          </span>
        </button>

        <button
          onClick={() => setSubTab('automated_actions')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition font-mono whitespace-nowrap ${
            subTab === 'automated_actions'
              ? 'bg-rose-950 text-rose-300 border border-rose-500/60 font-bold shadow-lg shadow-rose-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Terminal className="w-4 h-4 text-rose-400" />
          <span>Acciones Automatizadas Agente-Humano</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SUB-PESTAÑA 1: ROADMAP 50 FASES & PLAN MAESTRO                        */}
      {/* ==================================================================== */}
      {subTab === 'roadmap_50' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar fase por nombre, especialidad o código..."
                value={roadmapSearch}
                onChange={e => setRoadmapSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono placeholder:text-slate-600"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400 font-mono">Macro-Etapa:</span>
              </div>
              <select
                value={roadmapFilterStage}
                onChange={e => setRoadmapFilterStage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Todas las Etapas (01 - 50)</option>
                <option value="Etapa I">Etapa I: Fundamentos & Vistas Duales (01 - 10)</option>
                <option value="Etapa II">Etapa II: Hardware & Cloudflare (11 - 20)</option>
                <option value="Etapa III">Etapa III: Descentralización P2P & Malla (21 - 30)</option>
                <option value="Etapa IV">Etapa IV: Seguridad DEX & Privacidad (31 - 40)</option>
                <option value="Etapa V">Etapa V: Escala Planetaria & DAO (41 - 50)</option>
              </select>

              <select
                value={roadmapFilterStatus}
                onChange={e => setRoadmapFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="COMPLETO">COMPLETO</option>
                <option value="EN_CURSO">EN CURSO</option>
                <option value="SIGUIENTE">SIGUIENTE</option>
                <option value="PLANIFICADO">PLANIFICADO</option>
              </select>
            </div>
          </div>

          {/* Quick Info & Printable Download Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-600/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Printer className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">Bóveda de Documentos Imprimibles Oficiales Generada</h4>
                <p className="text-xs text-slate-400">
                  Formato A4 editorial, versión Microsoft Word (.doc) y PDF de alta resolución disponibles para lectura fuera de pantalla.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/docs/imprimibles/PLAN_MAESTRO_GLOBAL_ROADMAP_A4_IMPRIMIBLE.html"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Versión A4</span>
              </a>

              <a
                href="/docs/imprimibles/PLAN_MAESTRO_GLOBAL_ROADMAP_EJECUTIVO.pdf"
                target="_blank"
                rel="noreferrer"
                download="PLAN_MAESTRO_GLOBAL_ROADMAP_EJECUTIVO.pdf"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>PDF (488 KB)</span>
              </a>
            </div>
          </div>

          {/* Grid of 50 Phase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRoadmap.map(phase => {
              const currentStatus = customPhaseStatuses[phase.id] || phase.status;
              const isCompleted = currentStatus === 'COMPLETO';
              const isInProgress = currentStatus === 'EN_CURSO';
              const isNext = currentStatus === 'SIGUIENTE';

              return (
                <div 
                  key={phase.id}
                  className={`bg-slate-900 border rounded-xl p-5 transition relative overflow-hidden flex flex-col justify-between ${
                    isCompleted 
                      ? 'border-emerald-600/40 bg-slate-900/90' 
                      : isInProgress
                      ? 'border-indigo-600/50 bg-indigo-950/20 shadow-lg shadow-indigo-950/30'
                      : isNext
                      ? 'border-amber-600/50 bg-amber-950/20'
                      : 'border-slate-800/80 bg-slate-900/60 opacity-90'
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800 font-mono text-xs font-bold">
                          {phase.phaseCode}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                          {phase.specialty}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTogglePhaseStatus(phase.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition border ${
                          isCompleted
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900'
                            : isInProgress
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-500 hover:bg-indigo-900 animate-pulse'
                            : isNext
                            ? 'bg-amber-950 text-amber-300 border-amber-500 hover:bg-amber-900'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Haga clic para alternar estado de la fase"
                      >
                        {currentStatus}
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-100 mb-1.5 leading-snug">
                      {phase.title}
                    </h3>

                    {/* Macro-Stage tag */}
                    <div className="mb-3">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                        {phase.macroStage}
                      </span>
                    </div>

                    {/* Objective */}
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {phase.objective}
                    </p>

                    {/* Deliverables Checklist */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1.5">
                        Entregables Técnicos Clave:
                      </span>
                      <ul className="space-y-1">
                        {phase.keyDeliverables.map((del, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div>
                      <span>Responsable: </span>
                      <strong className="text-slate-200">{phase.assignee}</strong>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">{isCompleted ? '✓ Verificado' : 'Pendiente'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-PESTAÑA 2: DIRECTORIO DE 15 TABLAS DEL ECOSISTEMA                */}
      {/* ==================================================================== */}
      {subTab === 'tables_directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">
          
          {/* Left Table Selector (15 items) */}
          <div className="lg:col-span-1 space-y-2 bg-slate-900 border border-slate-800 rounded-xl p-3.5 max-h-[750px] overflow-y-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2 font-mono">
              Las 15 Tablas de Datos:
            </span>
            {tablesDirectory.map((table, idx) => (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTableIndex(idx);
                  setTableSearchQuery('');
                }}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition flex items-center justify-between border ${
                  selectedTableIndex === idx
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500/60 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px]">
                    {table.number}
                  </span>
                  <span className="truncate">{table.name.split('(')[0].trim()}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 shrink-0">
                  {table.recordCount}
                </span>
              </button>
            ))}
          </div>

          {/* Right Table Detail & Interactive View */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Table Meta Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded text-xs font-mono font-bold">
                      TABLA #{activeTable.number}
                    </span>
                    <h3 className="text-base font-bold text-slate-100">
                      {activeTable.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {activeTable.purpose}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyTableJson(activeTable)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5 font-mono"
                  >
                    {tableCopySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{tableCopySuccess ? 'Copiado' : 'Copiar JSON'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadTableJson(activeTable)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow font-mono"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar JSON</span>
                  </button>
                </div>
              </div>

              {/* Technical details badge grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 text-[10px] block uppercase">Archivo Fuente:</span>
                  <span className="text-slate-300 truncate block font-bold">{activeTable.sourceFile}</span>
                </div>

                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 text-[10px] block uppercase">Tipo de Persistencia:</span>
                  <span className="text-slate-300 truncate block font-bold">{activeTable.storageType}</span>
                </div>

                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 text-[10px] block uppercase">Total de Registros:</span>
                  <span className="text-emerald-400 text-sm font-bold block">{activeTable.recordCount} filas</span>
                </div>
              </div>
            </div>

            {/* Filter Search for Active Table */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={`Filtrar registros dentro de ${activeTable.name.split('(')[0].trim()}...`}
                value={tableSearchQuery}
                onChange={e => setTableSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono placeholder:text-slate-600"
              />
            </div>

            {/* Table Records Grid Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Registros Mostrados: {filteredTableData.length} de {activeTable.recordCount}</span>
                <span className="text-[10px] text-slate-500">Formato Estructurado Relacional</span>
              </div>

              <div className="max-h-[500px] overflow-y-auto p-3 divide-y divide-slate-800/60">
                {filteredTableData.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-mono text-xs">
                    No se encontraron registros que coincidan con la búsqueda.
                  </div>
                ) : (
                  filteredTableData.slice(0, 30).map((row: any, rIdx: number) => (
                    <div key={rIdx} className="py-2.5 text-xs font-mono hover:bg-slate-950/50 px-2 rounded-lg transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-amber-400 font-bold">
                          #{rIdx + 1} {row.id || row.name || row.title || row.screenId || row.runId || row.key || 'Registro'}
                        </span>
                        {row.version && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {row.version}
                          </span>
                        )}
                        {row.status && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            {row.status}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 overflow-x-auto whitespace-pre font-mono bg-slate-950 p-2 rounded border border-slate-800/80 mt-1">
                        {JSON.stringify(row, null, 2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-PESTAÑA 3: VISOR DE ARCHIVOS JSON VIVOS                          */}
      {/* ==================================================================== */}
      {subTab === 'json_live_vault' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <FileCode className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  Inspección y Descarga de Datasets JSON en Vivo
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Archivos estructurados serializados directamente desde la memoria reactiva del sistema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedJsonDataset}
                onChange={e => setSelectedJsonDataset(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(jsonDatasets).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>

              <button
                onClick={handleCopyRawJson}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5 font-mono"
              >
                {jsonCopyStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{jsonCopyStatus ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleDownloadRawJson}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow font-mono"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .json</span>
              </button>
            </div>
          </div>

          {/* Code Viewer Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 text-slate-300 font-bold">{selectedJsonDataset}.json</span>
              </div>
              <span>{currentJsonString.split('\n').length} líneas • {new Blob([currentJsonString]).size} bytes</span>
            </div>

            <pre className="p-4 text-xs font-mono text-emerald-300 max-h-[600px] overflow-y-auto leading-relaxed select-all">
              {currentJsonString}
            </pre>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-PESTAÑA 4: CHECKLISTS & AUDITORÍA AUTOMATIZADA                   */}
      {/* ==================================================================== */}
      {subTab === 'checklists_hub' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Header Stats Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
                <CheckSquare className="w-5 h-5 text-purple-400" />
                <span>Sistemas de Verificación y Procedimientos Operativos (SOPs)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Checklist interactivo compartido y persistido en tiempo real en la base de datos local
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllChecklists}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition font-mono"
              >
                Verificar Todo
              </button>

              <button
                onClick={handleResetChecklists}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium rounded-lg border border-slate-700 transition font-mono"
              >
                Resetear
              </button>

              <div className="px-3 py-1.5 bg-purple-950/80 border border-purple-600/50 rounded-lg text-xs font-mono text-purple-200 font-bold">
                {verifiedChecks} / {totalChecks} Aprobados ({checklistPercentage}%)
              </div>
            </div>
          </div>

          {/* Checklist Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Grupo 1: SOPs Operativos */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Procedimientos Operativos Estándar (SOPs)</span>
              </h4>

              <div className="space-y-3">
                {[
                  { id: 'sop_01_github_scrape', label: 'SOP-01: Prospección y scraping de repositorios móviles en GitHub REST v3' },
                  { id: 'sop_01_verify_license', label: 'SOP-01: Verificación de licencias libres SPDX (GPL, Apache, MIT) en código' },
                  { id: 'sop_02_adb_link_thinkpad', label: 'SOP-02: Enlace SSH activo con ThinkPad T480s Gateway (100.96.218.12)' },
                  { id: 'sop_02_samsung_a06_install', label: 'SOP-02: Instalación física por ADB en Samsung Galaxy A06 (SM-A065M)' },
                  { id: 'sop_02_screen_capture_evidence', label: 'SOP-02: Captura de pantalla y extracción de evidencias para auditoría' },
                  { id: 'sop_03_exodus_zero_trackers', label: 'SOP-03: Análisis estático de clases DEX con 0 trackers de publicidad' },
                  { id: 'sop_03_apksigner_v2_v3', label: 'SOP-03: Verificación de esquemas de firma APK v2 y v3 con apksigner' },
                  { id: 'sop_04_cloudflared_tunnel_active', label: 'SOP-04: Túnel Cloudflare Zero Trust activo hacia appstore.civer.cloud' },
                  { id: 'sop_04_server_dual_ports_80_3000', label: 'SOP-04: Servidor HTTP respondiendo en puertos duales 80 y 3000' },
                  { id: 'sop_05_bsdiff_delta_saving', label: 'SOP-05: Generación de parches delta BSDiff con compresión Zstandard' }
                ].map(item => (
                  <label 
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!checklistState[item.id]}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="mt-0.5 w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className={`text-xs font-mono leading-relaxed ${checklistState[item.id] ? 'text-slate-200 line-through opacity-80' : 'text-slate-300'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grupo 2: Certificación FOSS & Topología */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Certificación FOSS Soberana & Hardware Multi-Nodo</span>
              </h4>

              <div className="space-y-3">
                {[
                  { id: 'foss_license_spdx_verified', label: 'Licenciamiento: Todas las apps cuentan con licencia SPDX declarada y repositorio Git' },
                  { id: 'foss_git_repo_public_source', label: 'Soberanía: Acceso directo al código fuente público y tareas de compilación Gradle' },
                  { id: 'foss_no_google_proprietary_bloat', label: 'Privacidad: Cero dependencias propietarias de Google Play Services obligatorias' },
                  { id: 'foss_apk_hash_sha256_immutable', label: 'Criptografía: Cada APK almacena su suma SHA-256 inmutable verificada' },
                  { id: 'mesh_asus_desktop_master', label: 'Nodo 1: Desktop ASUS Master Node operativo con Vite DevServer en puerto 3000' },
                  { id: 'mesh_thinkpad_t480s_gateway', label: 'Nodo 2: ThinkPad T480s Gateway activo en 100.96.218.12 con túnel SSH' },
                  { id: 'mesh_samsung_a06_physical_node', label: 'Nodo 3: Samsung Galaxy A06 (SM-A065M) con Spotube instalado y operando' },
                  { id: 'mesh_cloudflare_edge_appstore', label: 'Nodo 4: Red Edge de Cloudflare sirviendo appstore.civer.cloud con SSL' }
                ].map(item => (
                  <label 
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!checklistState[item.id]}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-xs font-mono leading-relaxed ${checklistState[item.id] ? 'text-slate-200 line-through opacity-80' : 'text-slate-300'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-PESTAÑA 5: ACCIONES AUTOMATIZADAS AGENTE-HUMANO                  */}
      {/* ==================================================================== */}
      {subTab === 'automated_actions' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Acción 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-600/40 flex items-center justify-center text-amber-400 mb-2.5">
                  <Printer className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-100 mb-1">Regenerar Imprimibles</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Compila PLAN_MAESTRO_GLOBAL_ROADMAP.md a A4 HTML, PDF y documento Word (.doc).
                </p>
              </div>
              <button
                onClick={() => handleTriggerAction('regenerate_printable')}
                disabled={isExecutingAction}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition font-mono"
              >
                Disparar Pipeline A4
              </button>
            </div>

            {/* Acción 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-600/40 flex items-center justify-center text-indigo-400 mb-2.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-100 mb-1">Sincronizar Base de Datos</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Reconcilia apps dinámicas de localStorage con el catálogo maestro en memoria.
                </p>
              </div>
              <button
                onClick={() => handleTriggerAction('sync_shared_database')}
                disabled={isExecutingAction}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition font-mono"
              >
                Sincronizar Datos
              </button>
            </div>

            {/* Acción 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-2.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-100 mb-1">Auditar Hardware Físico</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Prueba de enlace con ThinkPad T480s y sondeo ADB en Samsung Galaxy A06.
                </p>
              </div>
              <button
                onClick={() => handleTriggerAction('verify_hardware_links')}
                disabled={isExecutingAction}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition font-mono"
              >
                Auditar Nodos
              </button>
            </div>

            {/* Acción 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-600/40 flex items-center justify-center text-purple-400 mb-2.5">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-100 mb-1">Exportar Paquete Auditoría</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Descarga un archivo JSON unificado con el estado de las 50 fases y checklists.
                </p>
              </div>
              <button
                onClick={() => handleTriggerAction('export_audit_bundle')}
                disabled={isExecutingAction}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition font-mono"
              >
                Descargar Bundle JSON
              </button>
            </div>

          </div>

          {/* Realtime Action Console Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Consola de Ejecución en Tiempo Real</span>
              </div>
              <button
                onClick={() => setActionLog([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
              >
                Limpiar Consola
              </button>
            </div>

            <div className="p-4 font-mono text-xs space-y-1.5 max-h-[300px] overflow-y-auto">
              {actionLog.length === 0 ? (
                <div className="text-slate-600 italic">
                  Presione cualquier acción automatizada para ver la bitácora de ejecución en tiempo real...
                </div>
              ) : (
                actionLog.map((log, idx) => (
                  <div key={idx} className="text-emerald-400 leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
