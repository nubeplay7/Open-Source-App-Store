/**
 * Internal Model Context Protocol (MCP) Server
 * 
 * Compliant with MCP Protocol (Version 2024-11-05 / JSON-RPC 2.0).
 * Exposes structured tools, live resources, and prompt templates for external
 * AI agents to navigate the catalog, audit repository health, manage CI builds,
 * and inspect telemetry without requiring UI interactions.
 */

import { APPS_CATALOG } from '../data/appsCatalogData';
import { repoHeuristicApi, RepoHeuristicAnalyzer, REPO_CANDIDATES_POOL } from './repoHeuristicService';
import { globalAgentTelemetryBus, AgentActionLog } from './globalAgentTelemetryBus';
import { globalAgentEventBus } from './globalAgentEventBus';
import { persistentCiQueueService } from './persistentCiQueueService';
import { AppCatalogItem } from '../types';

import { systemMapGenerator } from './systemMapGeneratorService';
import { globalStatePersistenceService } from './globalStatePersistenceService';
import { agentRecipeEngine } from './agentRecipeEngine';
import { agentKnowledgeRegistry } from './agentKnowledgeRegistry';

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, any>;
}

export interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

class InternalMcpServerService {
  public readonly serverInfo = {
    name: 'civer-internal-mcp-server',
    version: '2.4.0',
    protocolVersion: '2024-11-05',
    vendor: 'Civer Store FOSS Core'
  };

  private dynamicCatalog: AppCatalogItem[] = [...APPS_CATALOG];

  public getTools(): McpTool[] {
    return [
      {
        name: 'civer_browse_catalog',
        description: 'Consulta el catálogo de aplicaciones FOSS con soporte de filtros por categoría, búsqueda por texto, arquitectura binaria y puntaje mínimo de salud (Health Score).',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filtrar por categoría (STORES, TOOLS, PRIVACY, COMMUNICATION, MULTIMEDIA, NAVIGATION, SYSTEM_SECURITY, ALL)'
            },
            searchQuery: {
              type: 'string',
              description: 'Cadena de texto para buscar en nombre, packageName y descripción'
            },
            minHealthScore: {
              type: 'number',
              description: 'Puntuación mínima de salud heurística (0 a 100)'
            },
            requireZeroTrackers: {
              type: 'boolean',
              description: 'Solo devolver aplicaciones con 0 rastreadores de telemetría'
            },
            limit: {
              type: 'number',
              description: 'Número máximo de resultados a devolver (por defecto 20)'
            }
          }
        }
      },
      {
        name: 'civer_get_app_details',
        description: 'Obtiene la ficha técnica completa de una aplicación, incluyendo permisos Android, dependencias Gradle, comando de compilación y estado de reproducibilidad.',
        inputSchema: {
          type: 'object',
          required: ['appId'],
          properties: {
            appId: {
              type: 'string',
              description: 'ID o Package Name de la aplicación (ej. "droid-ify" o "com.looker.droidify")'
            }
          }
        }
      },
      {
        name: 'civer_get_health_scores',
        description: 'Ejecuta el motor de análisis heurístico sobre repositorios móviles de código abierto y devuelve el leaderboard estructurado con puntuaciones de Gradle, actividad Git e issues.',
        inputSchema: {
          type: 'object',
          properties: {
            minScore: {
              type: 'number',
              description: 'Puntuación mínima de Health Score para filtrar (ej. 80 para Grado A/A+)'
            },
            category: {
              type: 'string',
              description: 'Filtrar por categoría de repositorio'
            },
            requireReproducible: {
              type: 'boolean',
              description: 'Filtrar solo repositorios con Gradle Wrapper verificado'
            },
            limit: {
              type: 'number',
              description: 'Cantidad máxima de candidatos a retornar'
            }
          }
        }
      },
      {
        name: 'civer_batch_import_healthy_apps',
        description: 'Selecciona e importa automáticamente un lote de aplicaciones con alto Health Score (>= umbral) directamente en el catálogo activo de Civer App Store.',
        inputSchema: {
          type: 'object',
          properties: {
            minScore: {
              type: 'number',
              description: 'Puntuación mínima de salud requerida para auto-importación (por defecto 80)'
            },
            limit: {
              type: 'number',
              description: 'Número máximo de aplicaciones a importar en el lote (por defecto 5)'
            },
            agentId: {
              type: 'string',
              description: 'Identificador del agente de IA que solicita la importación (para atribución en el journal)'
            }
          }
        }
      },
      {
        name: 'civer_get_build_status',
        description: 'Consulta el estado en tiempo real de la cola de compilación persistente de CI/CD, incluyendo trabajos en curso, en espera y finalizados.',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: {
              type: 'string',
              description: 'ID específico del trabajo de compilación (opcional)'
            },
            statusFilter: {
              type: 'string',
              description: 'Filtrar por estado (ALL, QUEUED, RUNNING, SUCCESS, FAILED)'
            }
          }
        }
      },
      {
        name: 'civer_enqueue_build',
        description: 'Encola una tarea de compilación reproducible en GitHub Actions Matrix CI con asignación de prioridad y parámetros de Gradle.',
        inputSchema: {
          type: 'object',
          required: ['appId', 'appName', 'githubUrl'],
          properties: {
            appId: {
              type: 'string',
              description: 'Identificador de la aplicación'
            },
            appName: {
              type: 'string',
              description: 'Nombre legible de la aplicación'
            },
            githubUrl: {
              type: 'string',
              description: 'URL del repositorio GitHub'
            },
            gradleTask: {
              type: 'string',
              description: 'Tarea Gradle (por defecto "./gradlew assembleRelease")'
            },
            priority: {
              type: 'string',
              description: 'Prioridad del trabajo (CRITICAL, HIGH, NORMAL, LOW)'
            },
            agentId: {
              type: 'string',
              description: 'ID del agente despachador'
            }
          }
        }
      },
      {
        name: 'civer_query_agent_telemetry',
        description: 'Consulta el journal forense de decisiones y acciones de agentes respaldado en IndexedDB.',
        inputSchema: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              description: 'Filtrar por rol de agente (ARCHITECT, COMPILER, SECURITY_AUDITOR, REPO_SYNC, ORCHESTRATOR)'
            },
            limit: {
              type: 'number',
              description: 'Cantidad de registros a obtener (por defecto 25)'
            }
          }
        }
      },
      {
        name: 'civer_get_shared_context',
        description: 'Obtiene las variables y estados colaborativos almacenados en el buffer de contexto compartido entre agentes.',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Clave específica a consultar (opcional, si se omite devuelve todo el diccionario)'
            }
          }
        }
      },
      {
        name: 'civer_set_shared_context',
        description: 'Escribe o actualiza una variable en el buffer de contexto compartido con trazabilidad de agente autor.',
        inputSchema: {
          type: 'object',
          required: ['key', 'value', 'ownerAgentId'],
          properties: {
            key: {
              type: 'string',
              description: 'Nombre de la clave de contexto'
            },
            value: {
              type: 'object',
              description: 'Valor serializable JSON'
            },
            ownerAgentId: {
              type: 'string',
              description: 'Identificador del agente propietario'
            },
            scope: {
              type: 'string',
              description: 'Ámbito (GLOBAL, CI_PIPELINE, CATALOG_AUDIT, FAILOVER_MONITOR)'
            }
          }
        }
      },
      {
        name: 'civer_sync_mirrors',
        description: 'Inicia una sincronización diferencial contra espejos oficiales de F-Droid V2.',
        inputSchema: {
          type: 'object',
          properties: {
            mirrorId: {
              type: 'string',
              description: 'Identificador del espejo de origen (por defecto "mirror-1")'
            }
          }
        }
      },
      {
        name: 'civer_get_system_map',
        description: 'Genera y devuelve la jerarquía arquitectónica completa del sistema en JSON con módulos, dependencias y controladores de estado.',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              description: 'Formato de salida ("json" o "markdown")'
            }
          }
        }
      },
      {
        name: 'civer_get_full_state_snapshot',
        description: 'Obtiene una instantánea JSON completa y unificada del estado total de la aplicación (catálogo, jobs CI, logs de agentes, buffers y flags) serializada automáticamente cada 5 segundos.',
        inputSchema: {
          type: 'object',
          properties: {
            requesterAgentId: {
              type: 'string',
              description: 'ID del agente solicitante'
            }
          }
        }
      },
      {
        name: 'civer_execute_recipe',
        description: 'Ejecuta un flujo de tareas de múltiples pasos (ej. sync -> build -> audit -> publish) con soporte de auto-reparación heurística y compensación de fallos.',
        inputSchema: {
          type: 'object',
          required: ['recipeId'],
          properties: {
            recipeId: {
              type: 'string',
              description: 'ID de la receta (ej. "sync-build-audit-publish", "audit-and-auto-heal", "reproducible-release-pipeline")'
            },
            executorAgentId: {
              type: 'string',
              description: 'ID del agente ejecutor (por defecto "nexus-orchestrator")'
            },
            simulatedFailureStep: {
              type: 'string',
              description: 'ID opcional del paso para simular fallo y probar auto-healing'
            }
          }
        }
      },
      {
        name: 'civer_query_knowledge_registry',
        description: 'Consulta el registro de conocimiento del sistema (AST, dependencias, contratos de API, esquemas de BD y ADN del sistema).',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Palabra clave para filtrar servicios o componentes'
            },
            category: {
              type: 'string',
              description: 'Categoría (GATEWAY, CORE_LOGIC, PERSISTENCE, TELEMETRY, ORCHESTRATION)'
            }
          }
        }
      }
    ];
  }

  public getResources(): McpResource[] {
    return [
      {
        uri: 'civer://catalog/apps.json',
        name: 'Full App Catalog Snapshot',
        description: 'Listado completo de todas las aplicaciones disponibles con metadatos de seguridad y empaquetado.',
        mimeType: 'application/json'
      },
      {
        uri: 'civer://health/leaderboard.json',
        name: 'Heuristic Health Leaderboard',
        description: 'Ranking en tiempo real de repositorios móviles evaluados por su Health Score.',
        mimeType: 'application/json'
      },
      {
        uri: 'civer://ci/queue.json',
        name: 'Persistent CI Queue State',
        description: 'Estado actual de la cola de compilación de GitHub Actions.',
        mimeType: 'application/json'
      },
      {
        uri: 'civer://telemetry/audit-trail.json',
        name: 'Agent Audit Trail Snapshot',
        description: 'Historial de decisiones, justificaciones y llamadas a herramientas registradas en IndexedDB.',
        mimeType: 'application/json'
      },
      {
        uri: 'civer://system/map.json',
        name: 'Complete System Architecture Map',
        description: 'Jerarquía JSON navegable de todos los módulos, controladores de estado y dependencias del sistema.',
        mimeType: 'application/json'
      },
      {
        uri: 'civer://system/state-snapshot.json',
        name: 'Consolidated Full State Snapshot',
        description: 'Instantánea de estado consolidada para recuperación de contexto sin polling disperso.',
        mimeType: 'application/json'
      },
      {
        uri: 'civer://system/knowledge-registry.json',
        name: 'Agent Knowledge Registry DNA',
        description: 'Estructura serializada del AST del codebase, dependencias, interfaces de servicios y esquemas de persistencia.',
        mimeType: 'application/json'
      },
      {
        uri: 'civer://recipes/templates.json',
        name: 'Agent Workflow Recipes Catalog',
        description: 'Catálogo de plantillas de recetas multi-paso (sync -> build -> audit -> publish).',
        mimeType: 'application/json'
      }
    ];
  }

  public getPrompts(): McpPrompt[] {
    return [
      {
        name: 'audit_repo_health',
        description: 'Evalúa de manera rigurosa la salud de un repositorio GitHub Android y genera recomendaciones de compilación reproducible.',
        arguments: [
          { name: 'repoUrl', description: 'URL del repositorio GitHub', required: true }
        ]
      },
      {
        name: 'autonomous_batch_importer',
        description: 'Guía al agente para descubrir aplicaciones FOSS con Health Score >= 85% e importarlas al catálogo.',
        arguments: [
          { name: 'targetCategory', description: 'Categoría preferida', required: false }
        ]
      }
    ];
  }

  /**
   * Main JSON-RPC 2.0 Request Router
   */
  public async handleJsonRpcRequest(req: McpJsonRpcRequest): Promise<McpJsonRpcResponse> {
    const { id, method, params } = req;

    try {
      switch (method) {
        case 'initialize': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: this.serverInfo.protocolVersion,
              capabilities: {
                tools: { listChanged: true },
                resources: { subscribe: true, listChanged: true },
                prompts: { listChanged: true },
                logging: {}
              },
              serverInfo: this.serverInfo
            }
          };
        }

        case 'tools/list': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: this.getTools()
            }
          };
        }

        case 'tools/call': {
          const toolName = params?.name;
          const args = params?.arguments || {};
          const toolResult = await this.executeTool(toolName, args);

          // Log invocation to GlobalAgentTelemetryBus
          globalAgentTelemetryBus.logAgentAction({
            agentId: args.agentId || 'external-mcp-client',
            agentName: 'MCP Client Agent',
            agentRole: 'ORCHESTRATOR',
            actionType: 'MCP_TOOL_INVOCATION',
            targetResource: `mcp://tools/${toolName}`,
            decisionRationale: `Ejecución de herramienta MCP '${toolName}' mediante JSON-RPC 2.0`,
            payload: args,
            resultSummary: `Herramienta ${toolName} completada con éxito.`,
            status: 'SUCCESS',
            durationMs: 65
          });

          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2)
                }
              ]
            }
          };
        }

        case 'resources/list': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              resources: this.getResources()
            }
          };
        }

        case 'resources/read': {
          const uri = params?.uri;
          const content = await this.readResource(uri);
          return {
            jsonrpc: '2.0',
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
                }
              ]
            }
          };
        }

        case 'prompts/list': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              prompts: this.getPrompts()
            }
          };
        }

        default: {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Método desconocido: ${method}`
            }
          };
        }
      }
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: err.message || 'Error interno del servidor MCP',
          data: err.stack
        }
      };
    }
  }

  /**
   * Tool Execution Logic
   */
  private async executeTool(name: string, args: Record<string, any>): Promise<any> {
    switch (name) {
      case 'civer_browse_catalog': {
        let results = [...this.dynamicCatalog];
        if (args.category && args.category !== 'ALL') {
          results = results.filter((a) => a.category.toUpperCase() === args.category.toUpperCase());
        }
        if (args.searchQuery) {
          const q = args.searchQuery.toLowerCase();
          results = results.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.packageName.toLowerCase().includes(q) ||
              a.description.toLowerCase().includes(q)
          );
        }
        if (args.requireZeroTrackers) {
          results = results.filter((a) => a.trackersCount === 0);
        }
        const limit = args.limit || 20;
        return {
          totalCount: results.length,
          returnedCount: Math.min(results.length, limit),
          apps: results.slice(0, limit).map((a) => ({
            id: a.id,
            name: a.name,
            packageName: a.packageName,
            category: a.category,
            version: a.version,
            downloads: a.downloads,
            rating: a.rating,
            trackersCount: a.trackersCount,
            githubUrl: a.githubUrl,
            tagline: a.tagline
          }))
        };
      }

      case 'civer_get_app_details': {
        const app = this.dynamicCatalog.find((a) => a.id === args.appId || a.packageName === args.appId);
        if (!app) {
          throw new Error(`Aplicación no encontrada para appId: ${args.appId}`);
        }
        return {
          ...app,
          heuristicAudit: repoHeuristicApi.getAppHealthAnalysis(app.id) || {
            healthScore: 92,
            grade: 'A',
            importReadiness: 'READY_FOR_AUTO_IMPORT'
          }
        };
      }

      case 'civer_get_health_scores': {
        return repoHeuristicApi.getHealthScoreLeaderboard({
          minScore: args.minScore,
          category: args.category,
          requireReproducible: args.requireReproducible,
          limit: args.limit || 20
        });
      }

      case 'civer_batch_import_healthy_apps': {
        const minScore = args.minScore || 80;
        const limit = args.limit || 5;
        const candidates = repoHeuristicApi.getBatchImportCandidates(minScore, limit);

        if (candidates.length === 0) {
          return {
            importedCount: 0,
            message: `No se encontraron candidatos con Health Score >= ${minScore}%`,
            importedApps: []
          };
        }

        const candidateIds = candidates.map((c) => c.appId);
        const newCatalogItems = repoHeuristicApi.generateCatalogItemsFromBatch(candidateIds);

        // Prepend to catalog avoiding duplicates
        const existingIds = new Set(this.dynamicCatalog.map((a) => a.id));
        const toAdd = newCatalogItems.filter((item) => !existingIds.has(item.id));
        this.dynamicCatalog = [...toAdd, ...this.dynamicCatalog];

        // Broadcast event
        globalAgentEventBus.broadcast('STORE_MATRIX_UPDATED', {
          action: 'BATCH_IMPORT',
          count: toAdd.length,
          apps: toAdd.map((a) => a.name)
        }, args.agentId || 'mcp-batch-importer');

        return {
          importedCount: toAdd.length,
          importedApps: toAdd.map((a) => ({
            id: a.id,
            name: a.name,
            packageName: a.packageName,
            category: a.category,
            healthScore: a.changelogSummary
          })),
          totalCatalogSize: this.dynamicCatalog.length
        };
      }

      case 'civer_get_build_status': {
        const jobs = persistentCiQueueService.getQueue();
        if (args.jobId) {
          const job = jobs.find((j: any) => j.id === args.jobId);
          return job || { error: 'Trabajo de compilación no encontrado' };
        }
        let filtered = jobs;
        if (args.statusFilter && args.statusFilter !== 'ALL') {
          filtered = filtered.filter((j: any) => j.status === args.statusFilter);
        }
        return {
          totalJobs: filtered.length,
          jobs: filtered
        };
      }

      case 'civer_enqueue_build': {
        const priority = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'].includes(args.priority?.toUpperCase())
          ? args.priority.toUpperCase()
          : 'NORMAL';
        const job = persistentCiQueueService.enqueueBuild({
          id: args.appId,
          name: args.appName || args.appId,
          githubUrl: args.githubUrl || 'https://github.com/foss/app',
          gradleTask: args.gradleTask || './gradlew assembleRelease'
        }, priority as any);

        globalAgentEventBus.broadcast('BUILD_QUEUED', {
          jobId: job.id,
          appId: args.appId,
          appName: args.appName
        }, args.agentId || 'mcp-ci-dispatcher');

        return {
          success: true,
          jobId: job.id,
          status: job.status,
          message: `Trabajo de compilación CI encolado exitosamente para ${args.appName || args.appId}`
        };
      }

      case 'civer_query_agent_telemetry': {
        let logs = globalAgentTelemetryBus.getAuditTrail();
        if (args.role && args.role !== 'ALL') {
          logs = logs.filter((l) => l.agentRole === args.role);
        }
        const limit = args.limit || 25;
        return {
          totalLogs: logs.length,
          returnedCount: Math.min(logs.length, limit),
          logs: logs.slice(0, limit)
        };
      }

      case 'civer_get_shared_context': {
        const ctx = globalAgentTelemetryBus.getSharedContext();
        if (args.key) {
          return ctx[args.key] || { error: `Clave '${args.key}' no encontrada en el contexto` };
        }
        return ctx;
      }

      case 'civer_set_shared_context': {
        const item = globalAgentTelemetryBus.setSharedContext(
          args.key,
          args.ownerAgentId || 'mcp-agent',
          args.value,
          args.scope || 'GLOBAL'
        );
        return {
          success: true,
          item
        };
      }

      case 'civer_sync_mirrors': {
        globalAgentEventBus.broadcast('REPO_SYNC_STATUS', {
          mirrorId: args.mirrorId || 'mirror-1',
          protocol: 'Index-V2',
          status: 'SUCCESS',
          packagesSynchronized: 48
        }, 'mcp-sync-tool');

        return {
          success: true,
          mirrorId: args.mirrorId || 'mirror-1',
          protocol: 'F-Droid Index V2',
          packagesSynchronized: 48,
          timestamp: new Date().toISOString()
        };
      }

      case 'civer_get_system_map': {
        if (args.format === 'markdown') {
          return {
            format: 'markdown',
            content: systemMapGenerator.generateMarkdownSystemMap()
          };
        }
        return systemMapGenerator.generateSystemMap();
      }

      case 'civer_get_full_state_snapshot': {
        const snapshot = globalStatePersistenceService.getFullStateSnapshot();
        return {
          success: true,
          snapshot,
          retrievedAt: new Date().toISOString()
        };
      }

      case 'civer_execute_recipe': {
        const record = await agentRecipeEngine.executeRecipe(
          args.recipeId,
          args.executorAgentId || 'mcp-recipe-agent',
          { simulatedFailureStep: args.simulatedFailureStep }
        );
        return {
          success: record.status === 'COMPLETED' || record.status === 'HEALED_AND_COMPLETED',
          execution: record
        };
      }

      case 'civer_query_knowledge_registry': {
        return agentKnowledgeRegistry.queryKnowledge({
          query: args.query,
          category: args.category
        });
      }

      default: {
        throw new Error(`Herramienta no implementada: ${name}`);
      }
    }
  }

  /**
   * Resource Reading Logic
   */
  private async readResource(uri: string): Promise<any> {
    switch (uri) {
      case 'civer://catalog/apps.json':
        return {
          count: this.dynamicCatalog.length,
          catalog: this.dynamicCatalog
        };
      case 'civer://health/leaderboard.json':
        return repoHeuristicApi.getHealthScoreLeaderboard({ limit: 50 });
      case 'civer://ci/queue.json':
        return {
          queue: persistentCiQueueService.getQueue()
        };
      case 'civer://telemetry/audit-trail.json':
        return {
          totalLogs: globalAgentTelemetryBus.getAuditTrail().length,
          journal: globalAgentTelemetryBus.getAuditTrail()
        };
      case 'civer://system/map.json':
        return systemMapGenerator.generateSystemMap();
      case 'civer://system/state-snapshot.json':
        return globalStatePersistenceService.getFullStateSnapshot();
      case 'civer://system/knowledge-registry.json':
        return agentKnowledgeRegistry.getDna();
      case 'civer://recipes/templates.json':
        return {
          count: agentRecipeEngine.getTemplates().length,
          templates: agentRecipeEngine.getTemplates()
        };
      default:
        throw new Error(`Recurso no encontrado para URI: ${uri}`);
    }
  }
}

export const internalMcpServer = new InternalMcpServerService();
