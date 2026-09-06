# CIVER FOSS APP STORE & AGENTIC WORKSTATION
## AI AGENT AUTONOMOUS DISCOVERY & CAPABILITY MANIFEST

> **Protocol Compatibility:** MCP v2024-11-05 | gRPC-web v1.0 | OpenAPI 3.1 | WebSocket Events v1.2  
> **Last Indexed Timestamp:** 2026-09-06T09:40:00.000Z  
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
- **Repository Heuristics Engine:** Automated Kotlin DSL Gradle analysis, commit cadence analysis, issue resolution velocity, and security health score grading (0-100%).
- **Delta Patching Engine:** Native C/C++ (.so) and Dalvik executable (.dex) differential live patching without full APK reinstallation.
- **Zero-Knowledge Encrypted Backups:** Client-side WebCrypto AES-GCM-256 backup bundles with scrypt key derivation.
- **WebADB Physical Flashing:** WebUSB-based Android Debug Bridge protocol for direct on-device APK installation and package management.
- **Wasm Sandboxed Plugins:** Extensible WebAssembly plugins for custom APK signature scanners and metadata extractors.
- **Multi-Agent Orchestration Hub:** Real-time gRPC-web and MCP bridge allowing external AI agents to query state, trigger builds, and mutate catalog items.

---

### 2. Model Context Protocol (MCP) Server Specifications

- **Protocol Version:** `2024-11-05`
- **Endpoint:** `/api/v1/mcp/jsonrpc` (JSON-RPC 2.0 over HTTP POST / In-Memory Channel)
- **Total Tools Available:** `10`
- **Total Live Resources:** `4`

#### 🛠️ Available MCP Tools:

1. `civer_browse_catalog`: Search and filter FOSS application catalog by query, category, and minimum Health Score.
2. `civer_get_app_details`: Inspect complete application manifest, APK signature, reproducible build status, and security metrics.
3. `civer_get_health_scores`: Retrieve real-time FOSS repository health scores, commit frequencies, and Kotlin DSL Gradle compatibility.
4. `civer_get_batch_import_candidates`: Inspect curated list of high-scoring FOSS repositories ready for auto-import.
5. `civer_batch_import_healthy_apps`: Autonomously import repositories scoring >= 80% directly into the active store catalog.
6. `civer_enqueue_build`: Enqueue reproducible Gradle compilation jobs with priority (CRITICAL, HIGH, NORMAL, LOW).
7. `civer_get_build_status`: Query active CI compilation queue, worker states, and build logs.
8. `civer_query_agent_telemetry`: Query IndexedDB GlobalAgentTelemetryBus audit trail and decision journals.
9. `civer_mutate_shared_context`: Mutate global multi-agent shared context buffer.
10. `civer_get_system_map`: Retrieve the complete System Map JSON hierarchy of all modules and state controllers.

#### 📦 Live MCP Resources:
- `civer://catalog/apps.json`: Complete active store catalog with metadata and hashes.
- `civer://health/leaderboard.json`: Top FOSS repository health scores and reproducibility grades.
- `civer://ci/queue.json`: Active CI compilation queue snapshot.
- `civer://telemetry/audit-trail.json`: Live IndexedDB agent decision journal.

---

### 3. gRPC-web Binary Protocol & Protobuf Definitions

- **Service:** `civer.store.v1.CiverTransportBridgeService`
- **Endpoint:** `/grpc-web/civer.store.v1.CiverTransportBridgeService`
- **Methods:** `TriggerBuild`, `GetAppStats`, `DeployPatch`, `SyncMirrors`, `StreamAgentEvents`

```protobuf
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
```

---

### 4. Real-Time WebSocket Event Bus Signatures

- **Format:** `AgentEventMessage { id: string, type: AgentEventType, payload: T, timestamp: string, emitter?: string }`
- **Events:** `BUILD_QUEUED`, `BUILD_COMPLETED`, `PATCH_DEPLOYED`, `REPO_SYNC_STATUS`, `TELEMETRY_LOG`, `USER_STATE_CHANGED`

---

### 5. OpenAPI 3.1 REST API Surface

- `GET /api/v1/apps` - List filtered catalog applications
- `GET /api/v1/apps/:id` - Complete app metadata
- `GET /api/v1/health-scores` - Heuristic Health Scores leaderboard
- `POST /api/v1/health-scores/batch-import` - Auto-import high-scoring apps
- `POST /api/v1/ci/build` - Enqueue Gradle build
- `GET /api/v1/ci/queue` - Active CI queue
- `GET /api/v1/telemetry/journal` - IndexedDB audit trail
- `POST /api/v1/mcp/jsonrpc` - MCP JSON-RPC 2.0 gateway

---

### 6. Persistence & State Controllers

- **IndexedDB:** `civer_agent_telemetry_db`
- **LocalStorage:** `civer_ci_queue_v1`
- **In-Memory Ring Buffer:** Multi-Agent event log & shared context

---

### 7. System Map Summary

- **Total Architectural Modules:** 16
- **Total Cross-Module Connections:** 38
- **Architectural Pattern:** Event-Driven Agentic Mesh with Decoupled Transport Bridges.
