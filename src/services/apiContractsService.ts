export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Civer App Store AI & Automation Gateway API",
    version: "2.4.0",
    description: "API de control, telemetría y gestión de compilaciones para la plataforma Civer App Store, permitiendo inspección, importación por lotes, control de CI/CD y análisis de fallos.",
    contact: {
      name: "Civer Core Architecture Team",
      url: "https://civer.app/dev"
    }
  },
  servers: [
    {
      url: "https://civer.app/api/v2",
      description: "Gateway Primario de Producción"
    },
    {
      url: "http://localhost:3000/api/v2",
      description: "Entorno Local / Sandbox de Desarrollo"
    }
  ],
  paths: {
    "/catalog/apps": {
      get: {
        summary: "Obtener catálogo completo de aplicaciones FOSS",
        operationId: "getCatalogApps",
        tags: ["Catalog"],
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por categoría (STORES, TOOLS, PRIVACY, etc.)"
          },
          {
            name: "minScore",
            in: "query",
            schema: { type: "integer", default: 0 },
            description: "Filtrar por puntaje mínimo de salud (0-100)"
          }
        ],
        responses: {
          "200": {
            description: "Lista de aplicaciones disponibles",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AppCatalogItem" }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Registrar o importar nueva aplicación al catálogo",
        operationId: "importAppToCatalog",
        tags: ["Catalog"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppImportRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Aplicación importada exitosamente"
          }
        }
      }
    },
    "/heuristics/analyze-repo": {
      post: {
        summary: "Ejecutar análisis heurístico y Health Score en repositorio Git",
        operationId: "analyzeRepoHealth",
        tags: ["Heuristics"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RepoAnalysisRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Métricas calculadas de salud del repositorio",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RepoHealthMetrics" }
              }
            }
          }
        }
      }
    },
    "/ci/queue": {
      get: {
        summary: "Consultar estado de la cola persistente de compilaciones",
        operationId: "getBuildQueue",
        tags: ["CI/CD Builds"],
        responses: {
          "200": {
            description: "Lista de builds en cola y en ejecución",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BuildQueueItem" }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Encolar nueva compilación de APK en GitHub Actions",
        operationId: "enqueueBuild",
        tags: ["CI/CD Builds"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EnqueueBuildRequest" }
            }
          }
        },
        responses: {
          "202": {
            description: "Build encolado correctamente"
          }
        }
      }
    },
    "/telemetry/faults": {
      get: {
        summary: "Consultar registro forense de fallos y telemetría IndexedDB",
        operationId: "getFaultTelemetry",
        tags: ["Telemetry"],
        responses: {
          "200": {
            description: "Registros de incidentes y fallos preventivos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/FaultRecord" }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      AppCatalogItem: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          packageName: { type: "string" },
          category: { type: "string" },
          rating: { type: "number" },
          version: { type: "string" },
          githubUrl: { type: "string" },
          apkSizeMb: { type: "number" }
        }
      },
      AppImportRequest: {
        type: "object",
        required: ["repoUrl", "name"],
        properties: {
          repoUrl: { type: "string" },
          name: { type: "string" },
          branch: { type: "string", default: "main" },
          category: { type: "string" }
        }
      },
      RepoAnalysisRequest: {
        type: "object",
        required: ["repoUrl"],
        properties: {
          repoUrl: { type: "string" },
          includeFiles: { type: "array", items: { type: "string" } }
        }
      },
      RepoHealthMetrics: {
        type: "object",
        properties: {
          overallScore: { type: "integer" },
          grade: { type: "string", enum: ["A+", "A", "B", "C", "D", "F"] },
          commitFrequencyScore: { type: "integer" },
          openIssuesScore: { type: "integer" },
          gradleBuildScore: { type: "integer" },
          recommendations: { type: "array", items: { type: "string" } }
        }
      },
      BuildQueueItem: {
        type: "object",
        properties: {
          id: { type: "string" },
          appName: { type: "string" },
          status: { type: "string", enum: ["QUEUED", "RUNNING", "RETRYING", "SUCCESS", "FAILED"] },
          priority: { type: "string" },
          progressPercent: { type: "integer" },
          retryCount: { type: "integer" },
          logs: { type: "array", items: { type: "string" } }
        }
      },
      EnqueueBuildRequest: {
        type: "object",
        required: ["appId", "appName", "githubUrl"],
        properties: {
          appId: { type: "string" },
          appName: { type: "string" },
          githubUrl: { type: "string" },
          gradleTask: { type: "string", default: "./gradlew assembleRelease" },
          priority: { type: "string", enum: ["CRITICAL", "HIGH", "NORMAL", "LOW"], default: "NORMAL" }
        }
      },
      FaultRecord: {
        type: "object",
        properties: {
          id: { type: "string" },
          category: { type: "string" },
          subsystem: { type: "string" },
          severity: { type: "string" },
          errorMessage: { type: "string" },
          timestamp: { type: "number" }
        }
      }
    }
  }
};

export const PROTOBUF_DEFINITION = `syntax = "proto3";

package civer.store.v1;

option go_package = "civer/store/v1;storev1";
option java_package = "org.civer.store.v1";

// Civer Store Unified Management Service
service CiverStoreService {
  rpc GetCatalog (GetCatalogRequest) returns (GetCatalogResponse);
  rpc AnalyzeRepoHealth (AnalyzeRepoHealthRequest) returns (RepoHealthResponse);
  rpc EnqueueBuild (EnqueueBuildRequest) returns (BuildJobStatusResponse);
  rpc StreamBuildLogs (StreamBuildLogsRequest) returns (stream BuildLogChunk);
  rpc GetFaultTelemetry (GetFaultTelemetryRequest) returns (FaultTelemetryResponse);
}

message GetCatalogRequest {
  string category = 1;
  int32 min_health_score = 2;
  int32 page_size = 3;
}

message GetCatalogResponse {
  repeated CatalogApp apps = 1;
  int32 total_count = 2;
}

message CatalogApp {
  string id = 1;
  string name = 2;
  string package_name = 3;
  string version = 4;
  string github_url = 5;
  int32 health_score = 6;
  string health_grade = 7;
  double apk_size_mb = 8;
}

message AnalyzeRepoHealthRequest {
  string repo_url = 1;
  string default_branch = 2;
}

message RepoHealthResponse {
  int32 overall_score = 1;
  string grade = 2;
  int32 commit_score = 3;
  int32 issues_score = 4;
  int32 gradle_score = 5;
  repeated string recommendations = 6;
}

message EnqueueBuildRequest {
  string app_id = 1;
  string app_name = 2;
  string github_url = 3;
  string gradle_task = 4;
  string priority = 5;
}

message BuildJobStatusResponse {
  string job_id = 1;
  string status = 2;
  int32 progress_percent = 3;
  int32 retry_count = 4;
}

message StreamBuildLogsRequest {
  string job_id = 1;
}

message BuildLogChunk {
  string timestamp = 1;
  string message = 2;
  string level = 3;
}

message GetFaultTelemetryRequest {
  int32 limit = 1;
  string category_filter = 2;
}

message FaultTelemetryResponse {
  int32 total_faults = 1;
  double risk_score = 2;
  repeated string recent_anomalies = 3;
}
`;
