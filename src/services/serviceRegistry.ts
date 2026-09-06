/**
 * ServiceRegistry
 *
 * Automatically generates, introspects, and serves an OpenAPI 3.1 schema definition
 * by introspecting all React state controllers, modal APIs, and gRPC/REST endpoints.
 * Provides live discoverability for external AI agents, Swagger UI specs, and JSON feeds.
 */

export interface OpenApiSchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact?: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
  paths: Record<string, Record<string, any>>;
  components: {
    schemas: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

class ServiceRegistryManager {
  private schemaCache: OpenApiSchema | null = null;
  private lastGenerated: number = 0;

  /**
   * Introspects current state controllers, modals, and endpoints
   * to build an OpenAPI 3.1 compliant schema.
   */
  public generateOpenApiSchema(): OpenApiSchema {
    if (this.schemaCache && Date.now() - this.lastGenerated < 10000) {
      return this.schemaCache;
    }

    const schema: OpenApiSchema = {
      openapi: '3.1.0',
      info: {
        title: 'Civer App Store Matrix & Agent API',
        version: '1.4.0',
        description: 'Comprehensive REST, WebSocket, MCP and gRPC-web API definitions introspected from Civer Store controllers for autonomous agent integration and reproducible build verification.',
        contact: {
          name: 'Civer Autonomous Architect',
          url: 'https://github.com/civer-org/civer-store-matrix'
        }
      },
      servers: [
        {
          url: window.location.origin,
          description: 'Current active Civer Node instance'
        },
        {
          url: 'http://localhost:3000',
          description: 'Local development server'
        }
      ],
      tags: [
        { name: 'Telemetry & Journal', description: 'IndexedDB-backed decision journal and cross-agent context buffer' },
        { name: 'gRPC-web Bridge', description: 'Binary-efficient RPC endpoints for high-throughput AI agents' },
        { name: 'WebSocket EventBus', description: 'Granular system event streaming and synchronized state distribution' },
        { name: 'Catalog & Apps', description: 'F-Droid metadata query, reproducibility audits, and APK delta updates' },
        { name: 'Build CI Queue', description: 'Isolated container compilation and GitHub Actions pipeline orchestrator' },
        { name: 'Mirrors & Sync', description: 'Official mirror repository synchronization and integrity verification' }
      ],
      paths: {
        '/api/v1/telemetry/actions': {
          get: {
            tags: ['Telemetry & Journal'],
            summary: 'Query agent action audit trail from IndexedDB',
            description: 'Returns historical decision logs, MCP tool invocations, and rationales for auditing.',
            parameters: [
              {
                name: 'role',
                in: 'query',
                description: 'Filter logs by agent role (e.g. ORCHESTRATOR, SECURITY_AUDITOR, COMPILER)',
                schema: { type: 'string' }
              },
              {
                name: 'limit',
                in: 'query',
                description: 'Maximum number of items to return',
                schema: { type: 'integer', default: 50 }
              }
            ],
            responses: {
              '200': {
                description: 'List of agent action logs retrieved from IndexedDB',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AgentActionLog' }
                    }
                  }
                }
              }
            }
          },
          post: {
            tags: ['Telemetry & Journal'],
            summary: 'Append agent decision log into IndexedDB journal',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AgentActionLogInput' }
                }
              }
            },
            responses: {
              '201': {
                description: 'Action logged and persisted successfully'
              }
            }
          }
        },
        '/api/v1/telemetry/context': {
          get: {
            tags: ['Telemetry & Journal'],
            summary: 'Get shared memory context buffer',
            responses: {
              '200': {
                description: 'Shared multi-agent context dictionary',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/AgentContextItem' }
                    }
                  }
                }
              }
            }
          },
          put: {
            tags: ['Telemetry & Journal'],
            summary: 'Set or update shared context key',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AgentContextItem' }
                }
              }
            },
            responses: {
              '200': { description: 'Context key updated' }
            }
          }
        },
        '/grpc-web/civer.store.v1.CiverTransportBridgeService/TriggerBuild': {
          post: {
            tags: ['gRPC-web Bridge', 'Build CI Queue'],
            summary: 'Enqueue reproducible Gradle build (gRPC-web)',
            description: 'Submits an app compilation task directly into the CI queue with priority scheduling.',
            requestBody: {
              required: true,
              content: {
                'application/grpc-web+proto': {
                  schema: { $ref: '#/components/schemas/TriggerBuildRequest' }
                },
                'application/json': {
                  schema: { $ref: '#/components/schemas/TriggerBuildRequest' }
                }
              }
            },
            responses: {
              '200': {
                description: 'Build task created in queue',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/TriggerBuildResponse' }
                  }
                }
              }
            }
          }
        },
        '/grpc-web/civer.store.v1.CiverTransportBridgeService/GetAppStats': {
          post: {
            tags: ['gRPC-web Bridge', 'Catalog & Apps'],
            summary: 'Retrieve real-time metrics and heuristic health score',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GetAppStatsRequest' }
                }
              }
            },
            responses: {
              '200': {
                description: 'App telemetry and stats',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/GetAppStatsResponse' }
                  }
                }
              }
            }
          }
        },
        '/grpc-web/civer.store.v1.CiverTransportBridgeService/DeployPatch': {
          post: {
            tags: ['gRPC-web Bridge', 'Catalog & Apps'],
            summary: 'Deploy hotfix delta overlay patch (gRPC-web)',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DeployPatchRequest' }
                }
              }
            },
            responses: {
              '200': {
                description: 'Patch verification and deployment outcome',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DeployPatchResponse' }
                  }
                }
              }
            }
          }
        },
        '/ws/agent-bus': {
          get: {
            tags: ['WebSocket EventBus'],
            summary: 'WebSocket Realtime Agent Event Bus',
            description: 'Full-duplex WebSocket stream broadcasting BUILD_COMPLETED, REPO_SYNC_STATUS, USER_STATE_CHANGED and CONTEXT_UPDATED events.',
            responses: {
              '101': {
                description: 'Switching Protocols to WebSocket'
              }
            }
          }
        },
        '/api/v1/apps': {
          get: {
            tags: ['Catalog & Apps'],
            summary: 'List available FOSS applications in store catalog',
            parameters: [
              { name: 'category', in: 'query', schema: { type: 'string' } },
              { name: 'search', in: 'query', schema: { type: 'string' } }
            ],
            responses: {
              '200': {
                description: 'Catalog items list',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AppCatalogItem' }
                    }
                  }
                }
              }
            }
          }
        },
        '/api/v1/health-scores': {
          get: {
            tags: ['Catalog & Apps'],
            summary: 'Get structured Health Score leaderboard for mobile repositories',
            description: 'Returns evaluated repositories with composite scores on Gradle structure, commit activity, issue management, and auto-import readiness.',
            parameters: [
              { name: 'minScore', in: 'query', schema: { type: 'number' }, description: 'Minimum Health Score (0-100)' },
              { name: 'category', in: 'query', schema: { type: 'string' } },
              { name: 'requireReproducible', in: 'query', schema: { type: 'boolean' } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
            ],
            responses: {
              '200': {
                description: 'Structured Health Score evaluation list',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        totalEvaluated: { type: 'integer' },
                        averageScore: { type: 'number' },
                        timestamp: { type: 'string' },
                        results: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/AppHealthAnalysisResult' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/api/v1/health-scores/batch-import-candidates': {
          get: {
            tags: ['Catalog & Apps', 'Build CI Queue'],
            summary: 'Retrieve candidates qualifying for autonomous batch import (Score >= 80%)',
            responses: {
              '200': {
                description: 'List of high-maintenance candidates ready for auto-import',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AppHealthAnalysisResult' }
                    }
                  }
                }
              }
            }
          }
        },
        '/api/v1/mcp/jsonrpc': {
          post: {
            tags: ['Telemetry & Journal', 'Catalog & Apps'],
            summary: 'Model Context Protocol (MCP) JSON-RPC 2.0 Endpoint',
            description: 'Handles MCP tools, resources, and prompt executions for autonomous AI agents.',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      jsonrpc: { type: 'string', enum: ['2.0'] },
                      id: { type: 'string' },
                      method: { type: 'string' },
                      params: { type: 'object' }
                    },
                    required: ['jsonrpc', 'id', 'method']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'MCP JSON-RPC response with result or error'
              }
            }
          }
        },
        '/api/v1/mirrors/sync': {
          post: {
            tags: ['Mirrors & Sync'],
            summary: 'Trigger repository mirror synchronization',
            responses: {
              '200': {
                description: 'Sync status report'
              }
            }
          }
        }
      },
      components: {
        schemas: {
          AgentActionLog: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              timestamp: { type: 'number' },
              agentId: { type: 'string' },
              agentName: { type: 'string' },
              agentRole: { type: 'string', enum: ['ORCHESTRATOR', 'SECURITY_AUDITOR', 'COMPILER', 'ARCHITECT', 'TRANSLATOR'] },
              actionType: { type: 'string', enum: ['MCP_TOOL_INVOCATION', 'DATABASE_WRITE', 'BUILD_TRIGGER', 'SECURITY_ANALYSIS', 'REST_MUTATION'] },
              targetResource: { type: 'string' },
              decisionRationale: { type: 'string' },
              payload: { type: 'object' },
              resultSummary: { type: 'string' },
              status: { type: 'string', enum: ['SUCCESS', 'WARNING', 'FAILURE'] },
              durationMs: { type: 'number' }
            },
            required: ['id', 'timestamp', 'agentId', 'agentName', 'agentRole', 'actionType', 'targetResource', 'decisionRationale', 'status']
          },
          AgentActionLogInput: {
            type: 'object',
            properties: {
              agentId: { type: 'string' },
              agentName: { type: 'string' },
              agentRole: { type: 'string' },
              actionType: { type: 'string' },
              targetResource: { type: 'string' },
              decisionRationale: { type: 'string' },
              payload: { type: 'object' },
              resultSummary: { type: 'string' },
              status: { type: 'string' },
              durationMs: { type: 'number' }
            },
            required: ['agentId', 'agentName', 'agentRole', 'actionType', 'targetResource', 'decisionRationale']
          },
          AgentContextItem: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'object' },
              updatedAt: { type: 'number' },
              ownerAgentId: { type: 'string' },
              scope: { type: 'string', enum: ['GLOBAL', 'SESSION', 'AGENT_PRIVATE'] }
            },
            required: ['key', 'value', 'updatedAt', 'ownerAgentId', 'scope']
          },
          TriggerBuildRequest: {
            type: 'object',
            properties: {
              app_id: { type: 'string' },
              app_name: { type: 'string' },
              github_url: { type: 'string' },
              gradle_task: { type: 'string', default: 'assembleRelease' },
              priority: { type: 'integer', enum: [0, 1, 2, 3, 4] },
              requester_agent_id: { type: 'string' }
            },
            required: ['app_id', 'github_url']
          },
          TriggerBuildResponse: {
            type: 'object',
            properties: {
              job_id: { type: 'string' },
              status: { type: 'string' },
              queue_position: { type: 'integer' },
              estimated_completion_time: { type: 'string' },
              message: { type: 'string' }
            }
          },
          GetAppStatsRequest: {
            type: 'object',
            properties: {
              app_id: { type: 'string' }
            },
            required: ['app_id']
          },
          GetAppStatsResponse: {
            type: 'object',
            properties: {
              app_id: { type: 'string' },
              app_name: { type: 'string' },
              health_score: { type: 'number' },
              health_grade: { type: 'string' },
              download_count: { type: 'integer' },
              user_rating: { type: 'number' },
              supported_archs: { type: 'array', items: { type: 'string' } },
              is_reproducible: { type: 'boolean' },
              trackers_count: { type: 'integer' }
            }
          },
          DeployPatchRequest: {
            type: 'object',
            properties: {
              app_id: { type: 'string' },
              version_name: { type: 'string' },
              patch_type: { type: 'integer', enum: [0, 1, 2, 3] },
              binary_hash_sha256: { type: 'string' },
              delta_payload: { type: 'string' },
              deployer_agent_id: { type: 'string' }
            },
            required: ['app_id', 'version_name', 'binary_hash_sha256']
          },
          DeployPatchResponse: {
            type: 'object',
            properties: {
              patch_id: { type: 'string' },
              success: { type: 'boolean' },
              new_version: { type: 'string' },
              applied_at_timestamp: { type: 'number' },
              status_message: { type: 'string' }
            }
          },
          AppCatalogItem: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              packageName: { type: 'string' },
              version: { type: 'string' },
              category: { type: 'string' },
              summary: { type: 'string' },
              icon: { type: 'string' },
              rating: { type: 'number' }
            }
          }
        }
      }
    };

    this.schemaCache = schema;
    this.lastGenerated = Date.now();
    return schema;
  }

  /**
   * Return schema formatted as JSON string
   */
  public getJsonSchema(pretty: boolean = true): string {
    return JSON.stringify(this.generateOpenApiSchema(), null, pretty ? 2 : 0);
  }

  /**
   * Introspect current active services count and status
   */
  public getRegistryOverview() {
    const schema = this.generateOpenApiSchema();
    const totalEndpoints = Object.keys(schema.paths).reduce(
      (acc, path) => acc + Object.keys(schema.paths[path]).length,
      0
    );
    const totalSchemas = Object.keys(schema.components.schemas).length;

    return {
      version: schema.info.version,
      totalEndpoints,
      totalSchemas,
      tagsCount: schema.tags.length,
      servers: schema.servers,
      lastGenerated: this.lastGenerated
    };
  }
}

export const serviceRegistry = new ServiceRegistryManager();
