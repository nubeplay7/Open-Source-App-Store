export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  outputSchema?: {
    type: string;
    properties: Record<string, any>;
  };
}

export interface McpServerManifest {
  name: string;
  version: string;
  protocolVersion: string;
  description: string;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
    logging: boolean;
  };
  tools: McpToolDefinition[];
  resources: {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
  }[];
}

export const MCP_SERVER_MANIFEST: McpServerManifest = {
  name: "civer-app-store-mcp-server",
  version: "2.4.0",
  protocolVersion: "2024-11-05",
  description: "Servidor Model Context Protocol (MCP) para Civer App Store. Expone herramientas para consulta de catálogo FOSS, análisis heurístico de repositorios móviles, gestión de colas de compilación CI/CD y telemetría de resiliencia.",
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
    logging: true
  },
  tools: [
    {
      name: "list_catalog_apps",
      description: "Obtiene la lista de aplicaciones FOSS en el catálogo de Civer App Store con soporte de filtrado por categoría, puntaje de salud y arquitectura.",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Categoría de la app (STORES, TOOLS, PRIVACY, COMMUNICATION, MULTIMEDIA, CUSTOMIZATION, SYSTEM_SECURITY)"
          },
          minHealthScore: {
            type: "number",
            description: "Puntuación mínima de salud del repositorio (0 a 100)"
          },
          searchQuery: {
            type: "string",
            description: "Texto de búsqueda en nombre, paquete o descripción"
          },
          arch: {
            type: "string",
            description: "Arquitectura binaria requerida (arm64-v8a, armeabi-v7a, x86_64, universal)"
          }
        }
      }
    },
    {
      name: "analyze_repo_heuristics",
      description: "Ejecuta un diagnóstico heurístico automatizado sobre un repositorio de GitHub para evaluar su compatibilidad de compilación Android y asignar un Health Score (0-100%).",
      inputSchema: {
        type: "object",
        required: ["repoUrl"],
        properties: {
          repoUrl: {
            type: "string",
            description: "URL completa del repositorio GitHub (ej. https://github.com/whyorean/AuroraStore)"
          },
          branch: {
            type: "string",
            description: "Rama de análisis (por defecto: main/master)"
          },
          filesList: {
            type: "array",
            items: { type: "string" },
            description: "Lista de rutas de archivos clave para auditar presencia de Gradle y manifiesto"
          }
        }
      }
    },
    {
      name: "enqueue_ci_build",
      description: "Encola un trabajo de compilación en GitHub Actions CI con soporte de reintentos automáticos y persistencia local.",
      inputSchema: {
        type: "object",
        required: ["appId", "appName", "githubUrl"],
        properties: {
          appId: {
            type: "string",
            description: "Identificador único de la aplicación"
          },
          appName: {
            type: "string",
            description: "Nombre legible de la aplicación"
          },
          githubUrl: {
            type: "string",
            description: "URL del repositorio GitHub"
          },
          gradleTask: {
            type: "string",
            description: "Comando o tarea Gradle a ejecutar (por defecto: ./gradlew assembleRelease)"
          },
          priority: {
            type: "string",
            enum: ["CRITICAL", "HIGH", "NORMAL", "LOW"],
            description: "Nivel de prioridad en la cola persistente"
          }
        }
      }
    },
    {
      name: "get_ci_queue_status",
      description: "Consulta el estado actual de la cola de compilaciones persistente, incluyendo trabajos en curso, pendientes y completados.",
      inputSchema: {
        type: "object",
        properties: {
          statusFilter: {
            type: "string",
            enum: ["ALL", "QUEUED", "RUNNING", "RETRYING", "SUCCESS", "FAILED"]
          }
        }
      }
    },
    {
      name: "get_fault_telemetry",
      description: "Obtiene registros forenses de fallos e incidentes almacenados en la base de datos IndexedDB local (errores de red, caídas de UI, fallos Gradle).",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["ALL", "CONNECTION_ERROR", "COMPILATION_ERROR", "UI_FREEZE", "SANDBOX_BREACH"]
          },
          limit: {
            type: "number",
            description: "Número máximo de registros a recuperar"
          }
        }
      }
    },
    {
      name: "sync_fdroid_mirrors",
      description: "Inicia la sincronización diferencial con espejos oficiales de F-Droid utilizando el protocolo Index V2 (entry.json).",
      inputSchema: {
        type: "object",
        properties: {
          mirrorId: {
            type: "string",
            description: "ID del espejo a sincronizar (ej. mirror-1, mirror-2)"
          }
        }
      }
    },
    {
      name: "get_full_state_snapshot",
      description: "Recupera una instantánea JSON unificada y completa de todo el estado de la aplicación (catálogo, cola CI, telemetría de agentes, flags y estado reactivo) generada en intervalos de 5 segundos.",
      inputSchema: {
        type: "object",
        properties: {
          includeDetails: {
            type: "boolean",
            description: "Incluir desglose granular de logs y paquetes"
          }
        }
      }
    }
  ],
  resources: [
    {
      uri: "civer://catalog/apps.json",
      name: "App Catalog Resource",
      description: "Listado completo de aplicaciones FOSS indexadas con metadatos técnicos y de seguridad.",
      mimeType: "application/json"
    },
    {
      uri: "civer://telemetry/fault-log.json",
      name: "Fault Telemetry DB Snapshot",
      description: "Volcado de telemetría de fallos e incidentes registrados en IndexedDB.",
      mimeType: "application/json"
    },
    {
      uri: "civer://ci/queue.json",
      name: "Persistent CI Build Queue",
      description: "Estado en tiempo real de la cola de compilaciones de GitHub Actions.",
      mimeType: "application/json"
    },
    {
      uri: "civer://system/state-snapshot.json",
      name: "Consolidated Full State Snapshot",
      description: "Instantánea consolidada del estado total del sistema para análisis contextual inmediato y recuperación sin multi-polling.",
      mimeType: "application/json"
    }
  ]
};
