/**
 * McpDiscoveryToolService
 *
 * Automated discovery tool that introspects and periodically exports a comprehensive
 * Markdown & JSON catalog mapping all available application features, OpenAPI REST endpoints,
 * gRPC methods, Model Context Protocol (MCP v2024-11-05) tools/resources, and real-time
 * WebSocket event signatures for external AI agents to download, parse, and index autonomously.
 */

import { internalMcpServer } from './internalMcpServer';
import { civerTransportBridge } from './civerTransportBridge';
import { globalAgentEventBus } from './globalAgentEventBus';
import { systemMapGenerator } from './systemMapGeneratorService';

export interface DiscoverySnapshot {
  generatedAt: string;
  version: string;
  endpointsCount: number;
  mcpToolsCount: number;
  mcpResourcesCount: number;
  grpcMethodsCount: number;
  websocketEventsCount: number;
  markdownContent: string;
}

class McpDiscoveryToolService {
  private static instance: McpDiscoveryToolService;
  private autoUpdateInterval: any = null;
  private lastGeneratedSnapshot: DiscoverySnapshot | null = null;

  private constructor() {
    this.startPeriodicGenerator();
  }

  public static getInstance(): McpDiscoveryToolService {
    if (!McpDiscoveryToolService.instance) {
      McpDiscoveryToolService.instance = new McpDiscoveryToolService();
    }
    return McpDiscoveryToolService.instance;
  }

  private startPeriodicGenerator() {
    if (typeof window === 'undefined') return;
    // Generate initial snapshot
    this.generateDiscoveryMarkdown();

    // Re-generate periodically every 2 minutes
    this.autoUpdateInterval = setInterval(() => {
      this.generateDiscoveryMarkdown();
    }, 120000);
  }

  /**
   * Introspects the entire application and produces the comprehensive Markdown Discovery file
   */
  public generateDiscoveryMarkdown(): string {
    const now = new Date().toISOString();
    const mcpTools = internalMcpServer.getTools();
    const mcpResources = internalMcpServer.getResources();
    const grpcDesc = civerTransportBridge.getProtoDescriptor();
    const systemMap = systemMapGenerator.generateSystemMap();

    let md = `# CIVER FOSS APP STORE & AGENTIC WORKSTATION
## AI AGENT AUTONOMOUS DISCOVERY & CAPABILITY MANIFEST

> **Protocol Compatibility:** MCP v2024-11-05 | gRPC-web v1.0 | OpenAPI 3.1 | WebSocket Events v1.2  
> **Last Indexed Timestamp:** \`${now}\`  
> **Host Environment:** Browser Sandbox (Vite + React + WebAssembly + IndexedDB)  
> **Target Audience:** Autonomous Coding Agents, LLM Orchestrators, CI Dispatchers, Security Auditors  

---

### Table of Contents
1. [Platform Capabilities Overview](#1-platform-capabilities-overview)
2. [Model Context Protocol (MCP) Server Specifications](#2-model-context-protocol-mcp-server-specifications)
3. [gRPC-web Binary Protocol & Protobuf Definitions](#3-grpc-web-binary-protocol--protobuf-definitions)
4. [Real-Time WebSocket Event Bus Signatures](#4-real-time-websocket-event-bus-signatures)
5. [OpenAPI 3.1 REST API Surface](#5-openapi-31-rest-api-surface)
6. [State Management Controllers & Persistence Layer](#6-state-management-controllers--persistence-layer)
7. [System Map & Dependency Graph](#7-system-map--dependency-graph)

---

### 1. Platform Capabilities Overview

The Civer FOSS Store platform offers a modern open-source Android app ecosystem with:
- **Reproducible Build Verification:** Deterministic build pipelines validating APK checksums against official upstream releases.
- **Repository Heuristics Engine:** Automated Kotlin DSL Gradle analysis, commit cadence analysis, issue resolution velocity, and security health score grading ($0-100\%$).
- **Delta Patching Engine:** Native C/C++ (\`.so\`) and Dalvik executable (\`.dex\`) differential live patching without full APK reinstallation.
- **Zero-Knowledge Encrypted Backups:** Client-side WebCrypto AES-GCM-256 backup bundles with scrypt key derivation.
- **WebADB Physical Flashing:** WebUSB-based Android Debug Bridge protocol for direct on-device APK installation and package management.
- **Wasm Sandboxed Plugins:** Extensible WebAssembly plugins for custom APK signature scanners and metadata extractors.
- **Multi-Agent Orchestration Hub:** Real-time gRPC-web and MCP bridge allowing external AI agents to query state, trigger builds, and mutate catalog items.

---

### 2. Model Context Protocol (MCP) Server Specifications

- **Protocol Version:** \`2024-11-05\`
- **Endpoint:** \`/api/v1/mcp/jsonrpc\` (JSON-RPC 2.0 over HTTP POST / In-Memory Channel)
- **Total Tools Available:** \`${mcpTools.length}\`
- **Total Live Resources:** \`${mcpResources.length}\`

#### 🛠️ Available MCP Tools:

`;

    mcpTools.forEach((tool, index) => {
      md += `#### 2.${index + 1} \`${tool.name}\`\n`;
      md += `**Description:** ${tool.description}  \n`;
      md += `**JSON Schema Parameters:**\n\`\`\`json\n${JSON.stringify(tool.inputSchema, null, 2)}\n\`\`\`\n\n`;
    });

    md += `#### 📦 Live MCP Resources:\n\n`;
    mcpResources.forEach((res, index) => {
      md += `#### 2.R${index + 1} \`${res.uri}\`\n`;
      md += `- **Name:** ${res.name}\n`;
      md += `- **MIME Type:** \`${res.mimeType}\`\n`;
      md += `- **Description:** ${res.description}\n\n`;
    });

    md += `---

### 3. gRPC-web Binary Protocol & Protobuf Definitions

- **Service:** \`${grpcDesc.service}\`
- **Proto File:** \`${grpcDesc.protoFile}\`
- **Supported Encodings:** \`${grpcDesc.supportedEncodings.join('`, `')}\`
- **Endpoint:** \`/grpc-web/civer.store.v1.CiverTransportBridgeService\`

#### Available gRPC RPC Methods:
`;

    grpcDesc.methods.forEach((m) => {
      md += `- **\`rpc ${m.name}(${m.inputType}) returns (${m.outputType})\`**\n`;
    });

    md += `\n\`\`\`protobuf
syntax = "proto3";

package civer.store.v1;

service CiverTransportBridgeService {
  rpc TriggerBuild(TriggerBuildRequest) returns (TriggerBuildResponse);
  rpc GetAppStats(GetAppStatsRequest) returns (GetAppStatsResponse);
  rpc DeployPatch(DeployPatchRequest) returns (DeployPatchResponse);
  rpc SyncMirrors(SyncMirrorsRequest) returns (SyncMirrorsResponse);
  rpc StreamAgentEvents(StreamAgentEventsRequest) returns (stream AgentEvent);
}

enum BuildPriority {
  BUILD_PRIORITY_UNSPECIFIED = 0;
  BUILD_PRIORITY_LOW = 1;
  BUILD_PRIORITY_NORMAL = 2;
  BUILD_PRIORITY_HIGH = 3;
  BUILD_PRIORITY_CRITICAL = 4;
}

enum PatchType {
  PATCH_TYPE_UNSPECIFIED = 0;
  PATCH_TYPE_DELTA_SO = 1;
  PATCH_TYPE_DEX_OVERLAY = 2;
  PATCH_TYPE_HOT_FIX = 3;
}

message TriggerBuildRequest {
  string app_id = 1;
  string app_name = 2;
  string github_url = 3;
  string gradle_task = 4;
  BuildPriority priority = 5;
  string requester_agent_id = 6;
}

message TriggerBuildResponse {
  string job_id = 1;
  string status = 2;
  int32 queue_position = 3;
  string estimated_completion_time = 4;
  string message = 5;
}

message GetAppStatsRequest {
  string app_id = 1;
}

message GetAppStatsResponse {
  string app_id = 1;
  string app_name = 2;
  int32 health_score = 3;
  string health_grade = 4;
  int64 download_count = 5;
  float user_rating = 6;
  repeated string supported_archs = 7;
  bool is_reproducible = 8;
  int32 trackers_count = 9;
}
\`\`\`

---

### 4. Real-Time WebSocket Event Bus Signatures

- **Transport:** Standard Browser WebSocket / Shared Broadcast Channel
- **Event Envelope Format:**
\`\`\`typescript
interface AgentEventMessage<T = any> {
  id: string;             // Unique UUID v4
  type: AgentEventType;   // Standardized event enum
  payload: T;             // Event data payload
  timestamp: string;      // ISO-8601 string
  emitter?: string;       // Originating agent ID
}
\`\`\`

#### Recognized Event Types & Payload Signatures:

1. **\`BUILD_QUEUED\`**:
   \`\`\`json
   { "jobId": "job-101", "appId": "org.torproject.android", "appName": "Tor Browser", "priority": "HIGH" }
   \`\`\`
2. **\`BUILD_COMPLETED\`**:
   \`\`\`json
   { "jobId": "job-101", "appId": "org.torproject.android", "status": "SUCCESS", "artifactSha256": "3a8c..." }
   \`\`\`
3. **\`PATCH_DEPLOYED\`**:
   \`\`\`json
   { "patchId": "patch_89a", "appId": "com.aurora.store", "version": "4.6.1-patch.89a" }
   \`\`\`
4. **\`REPO_SYNC_STATUS\`**:
   \`\`\`json
   { "mirrorId": "mirror-f-droid-01", "updatedPackages": 42, "status": "COMPLETE" }
   \`\`\`
5. **\`TELEMETRY_LOG\`**:
   \`\`\`json
   { "agentId": "agent-orchestrator-01", "actionType": "MCP_TOOL_INVOCATION", "durationMs": 45 }
   \`\`\`
6. **\`USER_STATE_CHANGED\`**:
   \`\`\`json
   { "appId": "junkfood.clover.seal", "installed": true, "version": "1.12.0" }
   \`\`\`

---

### 5. OpenAPI 3.1 REST API Surface

- **Base URL:** \`/api/v1\`
- **Authentication:** \`Bearer <AGENT_API_TOKEN>\` / Public for read endpoints

| Method | Route | Description | Auth Required |
|---|---|---|---|
| \`GET\` | \`/api/v1/apps\` | List filtered catalog applications | No |
| \`GET\` | \`/api/v1/apps/:id\` | Get complete app metadata, APK hashes, dependencies | No |
| \`GET\` | \`/api/v1/health-scores\` | Top FOSS repository health scores leaderboard | No |
| \`POST\` | \`/api/v1/health-scores/batch-import\` | Import high-scoring candidates ($\ge 80\%$) directly to catalog | Yes |
| \`POST\` | \`/api/v1/ci/build\` | Enqueue reproducible Gradle compilation job | Yes |
| \`GET\` | \`/api/v1/ci/queue\` | Query active CI queue status & build logs | No |
| \`GET\` | \`/api/v1/telemetry/journal\` | Inspect GlobalAgentTelemetryBus audit trail (IndexedDB) | Yes |
| \`POST\` | \`/api/v1/mcp/jsonrpc\` | MCP JSON-RPC 2.0 gateway endpoint | Yes |

---

### 6. State Management Controllers & Persistence Layer

- **IndexedDB Database:** \`civer_agent_telemetry_db\` (Stores \`agent_actions_journal\` and \`agent_context_buffer\`).
- **LocalStorage:** \`civer_ci_queue_v1\` (Persistent queue for build runners).
- **In-Memory Ring Buffer:** Multi-Agent event log & shared context synchronization.

---

### 7. System Map & Dependency Graph Summary

- **Total Architectural Modules:** \`${systemMap.systemIdentity.totalModulesCount}\`
- **Total Cross-Module Connections:** \`${systemMap.systemIdentity.totalConnectionsCount}\`
- **Architectural Pattern:** Event-Driven Agentic Mesh with Decoupled Transport Bridges.

*Generated automatically by McpDiscoveryToolService on ${now}*
`;

    const snapshot: DiscoverySnapshot = {
      generatedAt: now,
      version: 'v2026.09-Discovery',
      endpointsCount: 12,
      mcpToolsCount: mcpTools.length,
      mcpResourcesCount: mcpResources.length,
      grpcMethodsCount: grpcDesc.methods.length,
      websocketEventsCount: 6,
      markdownContent: md
    };

    this.lastGeneratedSnapshot = snapshot;
    return md;
  }

  public getDiscoverySnapshot(): DiscoverySnapshot {
    if (!this.lastGeneratedSnapshot) {
      this.generateDiscoveryMarkdown();
    }
    return this.lastGeneratedSnapshot!;
  }

  /**
   * Exports and triggers browser download of civer-mcp-agent-discovery.md
   */
  public downloadDiscoveryMarkdown(): void {
    const md = this.generateDiscoveryMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer-mcp-agent-discovery.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const mcpDiscoveryTool = McpDiscoveryToolService.getInstance();
