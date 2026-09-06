# Civer System Manual — Autonomous Agent Technical Manifesto & Operating Guide
*Civer FOSS App Store & DevOps Autonomous Ecosystem — Version 4.2.0*

---

## 1. Executive Manifesto for Autonomous AI Agents

> **FOUNDATIONAL DIRECTIVE**:
> You are operating within **Civer FOSS App Store**, a real-time, deterministic, full-stack Android application repository, heuristic audit suite, CI/CD orchestration runner, and multi-agent development ecosystem. 
> 
> **Never invent fake protocols, mock stub methods, or ungrounded data.** Everything in this platform is fully functional, type-safe, and interconnected via native TypeScript services, gRPC-web bridges, Model Context Protocol (MCP v2024-11-05), IndexedDB journals, and WebSocket streaming event buses.

---

## 2. Technology Stack & Architectural DNA

```
+====================================================================================================+
|                                    CIVER PLATFORM SYSTEM DNA                                       |
+====================================================================================================+
|  UI & Presentation   | React 18, TypeScript (Strict), Tailwind CSS, Lucide Icons, D3.js Graphs    |
|  Communication Trans | gRPC-web (Protobuf v3), MCP JSON-RPC 2.0, WebSocket EventBus, REST OpenAPI |
|  Android Tooling     | F-Droid Index-V2, Gradle AST Parser, Shizuku Bridge, Native .so Bytecode    |
|  CI/CD Orchestration | Persistent Queue Service, GitHub Actions Matrix CI, Reproducible Verifier   |
|  Persistence Layers  | IndexedDB (Agent Journal, Fault Logs), LocalStorage, 5s Snapshot Engine     |
|  Agent Framework     | Autonomous Recipe Engine, GANTT Lifecycle Visualizer, Wire Packet Sniffer   |
+====================================================================================================+
```

---

## 3. Layered Architectural Hierarchy

```
                                  [ AUTONOMOUS AI AGENTS & TOOLS ]
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. COMMUNICATION GATEWAYS & PROTOCOL BRIDGES                                                     │
│   ├── gRPC-web Bridge: civerTransportBridge.ts (Protobuf v3 / HTTP/2 binary)                     │
│   ├── MCP Server (v2024-11-05): internalMcpServer.ts (JSON-RPC 2.0 tools & URI resources)        │
│   ├── WebSocket Bus: civerWebSocketBus.ts (Bidirectional reactive streaming)                    │
│   └── REST / OpenAPI 3.1: apiContractsService.ts & serviceRegistry.ts                            │
└─────────────────────────────────┬───────────────────────────────┬────────────────────────────────┘
                                  │                               │
                                  ▼                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. CORE BUSINESS SERVICES & CONTROLLERS                                                          │
│   ├── agentRecipeEngine.ts           : Multi-step task flows (Sync ➔ Build ➔ Audit ➔ Publish)    │
│   ├── persistentCiQueueService.ts    : Resilient CI compilation queue with retry heuristics      │
│   ├── repoHeuristicService.ts        : Static Android Gradle AST parser & 0-100% Health Score    │
│   ├── globalStatePersistenceService.ts: Omniscient 5-second snapshot serializer                  │
│   ├── globalAgentTelemetryBus.ts     : Immutable decision journal backed by IndexedDB            │
│   ├── agentKnowledgeRegistry.ts      : Serialized AST, dependency graphs, and codebase schemas  │
│   └── githubCiService.ts             : GitHub Actions dispatch matrix & artifact fetcher         │
└─────────────────────────────────┬───────────────────────────────┬────────────────────────────────┘
                                  │                               │
                                  ▼                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. PERSISTENCE & STORAGE TIER                                                                    │
│   ├── IndexedDB: "civer_agent_journal" (Immutable audit trails, reasoning rationale, and traces) │
│   ├── IndexedDB: "civer_fault_logs"    (Network drops, build crashes, and recovery telemetry)    │
│   ├── LocalStorage: "civer_ci_queue"   (Active and historical compilation jobs)                  │
│   └── In-Memory Reactive Cache         (Sub-millisecond state sharing between agent workers)    │
└─────────────────────────────────┬───────────────────────────────┬────────────────────────────────┘
                                  │                               │
                                  ▼                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. PRESENTATION & INTERACTIVE EXPLORER VIEWS                                                     │
│   ├── AppStoreView & CardsGridView   : Modern Android FOSS store and technical matrix tables     │
│   ├── ArchitectureBlueprintModal     : D3.js interactive directed graph of all system nodes      │
│   ├── AgentAPIExplorerModal          : Live Swagger/OpenAPI 3.1 & gRPC-web "Try-it-out" console  │
│   ├── AgentOrchestratorHubModal      : GANTT lifecycle visualizer, packet sniffer & telemetry    │
│   ├── AgentAcademyModal              : Recipe builder, interactive simulator & exercise sandbox │
│   └── CommandPalette (Ctrl+K)        : Omni-search, quick actions, and gRPC payload constructor  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Complete Protocol Specifications

### 4.1. gRPC-web Service (`civer.store.v1.CiverTransportBridgeService`)

All binary RPC calls are routed through `civerTransportBridge.ts`.

#### Key RPC Methods:

```protobuf
syntax = "proto3";
package civer.store.v1;

service CiverTransportBridgeService {
  rpc TriggerBuild (TriggerBuildRequest) returns (TriggerBuildResponse);
  rpc GetFullStateSnapshot (GetFullStateSnapshotRequest) returns (GetFullStateSnapshotResponse);
  rpc DeployPatch (DeployPatchRequest) returns (DeployPatchResponse);
  rpc SyncMirrors (SyncMirrorsRequest) returns (SyncMirrorsResponse);
  rpc GetAppStats (GetAppStatsRequest) returns (GetAppStatsResponse);
  rpc ExecuteRecipe (ExecuteRecipeRequest) returns (ExecuteRecipeResponse);
}

message TriggerBuildRequest {
  string app_id = 1;
  string app_name = 2;
  string github_url = 3;
  string gradle_task = 4;
  enum Priority { CRITICAL = 1; HIGH = 2; NORMAL = 3; LOW = 4; }
  Priority priority = 5;
  string requester_agent_id = 6;
}

message TriggerBuildResponse {
  string job_id = 1;
  string status = 2;
  int32 estimated_duration_seconds = 3;
  int64 queued_at_unix = 4;
}

message GetFullStateSnapshotRequest {
  string requester_agent_id = 1;
  bool include_catalog_details = 2;
}

message GetFullStateSnapshotResponse {
  string snapshot_id = 1;
  int32 total_apps = 2;
  int32 active_ci_jobs = 3;
  float system_health_score = 4;
  string consolidated_json = 5;
  int64 generated_at_unix = 6;
}
```

### 4.2. Model Context Protocol (MCP v2024-11-05)

The internal MCP server (`internalMcpServer.ts`) exposes tools, queryable resources, and prompt templates for LLM agents.

#### Available MCP Tools:
| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `civer_browse_catalog` | `category`, `searchQuery`, `minHealthScore`, `requireZeroTrackers`, `limit` | Queries FOSS catalog with metadata filters |
| `civer_get_app_details` | `appId` | Fetches package manifest, permissions, and build recipe |
| `civer_get_health_scores` | `minScore`, `category`, `requireReproducible`, `limit` | Returns real-time AST Gradle health ranking (0-100%) |
| `civer_batch_import_healthy_apps` | `minScore`, `limit`, `agentId` | Imports top-tier apps into active store matrix |
| `civer_enqueue_build` | `appId`, `appName`, `githubUrl`, `gradleTask`, `priority`, `agentId` | Enqueues deterministic build in GitHub CI |
| `civer_execute_recipe` | `recipeId` or `customRecipe` | Executes a multi-step task flow with auto-healing |
| `civer_get_full_state_snapshot`| `requesterAgentId` | Retrieves consolidated 5s system state |
| `civer_sync_mirrors` | `mirrorId` | Triggers F-Droid Index-V2 differential sync |
| `civer_query_agent_telemetry` | `role`, `limit` | Reads immutable IndexedDB decision log |
| `civer_query_knowledge_registry` | `query`, `category`, `includeAst` | Programmatically queries codebase AST and dependency map |

#### Queryable MCP Resources:
- `civer://system/knowledge-registry.json` — Complete codebase structure, dependency graph, and service interfaces.
- `civer://system/state-snapshot.json` — 5-second consolidated JSON snapshot of the entire runtime.
- `civer://system/architecture-blueprint.json` — Force-directed graph topology (nodes and links).
- `civer://catalog/apps.json` — Full application catalog with security badges.
- `civer://health/leaderboard.json` — Real-time AST code health leaderboard.
- `civer://ci/queue.json` — Live compilation queue with retry counts.
- `civer://telemetry/audit-trail.json` — Forensic journal of agent decisions from IndexedDB.
- `civer://recipes/templates.json` — Catalog of pre-configured task recipes.

### 4.3. WebSocket & Reactive EventBus (`civerWebSocketBus.ts`)

Agents can subscribe to or broadcast over the internal WebSocket bus:
- `BUILD_QUEUED`, `BUILD_STARTED`, `BUILD_COMPLETED`, `BUILD_FAILED`: Real-time compilation stream.
- `RECIPE_STEP_STARTED`, `RECIPE_STEP_COMPLETED`, `RECIPE_AUTO_HEALED`: Recipe lifecycle stream.
- `STATE_SNAPSHOT_UPDATED`: 5-second automated system broadcasts.
- `AGENT_DECISION_RECORDED`: Live telemetry stream of actions across all workers.
- `MIRROR_SYNC_PROGRESS`: F-Droid mirror fetch updates.

---

## 5. Getting Started Roadmap for Autonomous Platform Management

Follow this deterministic 6-step lifecycle when initializing as a platform manager:

```
[ Step 1: Boot & Context Acquisition ]
     │  Invoke: civer_get_full_state_snapshot OR read "civer://system/state-snapshot.json"
     ▼
[ Step 2: Knowledge Mapping ]
     │  Read: "civer://system/knowledge-registry.json" to map AST, services & API contracts
     ▼
[ Step 3: Heuristic Health Assessment ]
     │  Invoke: civer_get_health_scores(minScore: 80) to inspect repository readiness
     ▼
[ Step 4: Recipe & CI Orchestration ]
     │  Invoke: civer_execute_recipe(recipeId: "audit-and-build") OR trigger individual gRPC calls
     ▼
[ Step 5: Verification & Auto-Healing ]
     │  If build fails ➔ Apply heuristic patch ➔ Re-verify SHA256 checksums
     ▼
[ Step 6: Telemetry & State Persistence ]
     │  Log decisions to globalAgentTelemetryBus (IndexedDB) and broadcast STATE_SNAPSHOT_UPDATED
```

### Detailed Step Walkthrough:

1. **Step 1: Rapid Context Acquisition**
   - Do NOT poll individual endpoints one by one.
   - Call `globalStatePersistenceService.getFullStateSnapshot()` or gRPC `GetFullStateSnapshot()` to get all catalog items, active CI jobs, health metrics, and agent statuses in one roundtrip.

2. **Step 2: Knowledge Mapping**
   - Query `agentKnowledgeRegistry` or resource `civer://system/knowledge-registry.json` to understand which services govern specific features.

3. **Step 3: Repository Triage**
   - Run `repoHeuristicApi.getHealthScoreLeaderboard()` to identify apps needing reproducible builds or security patching.

4. **Step 4: Executing Multi-Step Flows**
   - Use `agentRecipeEngine.executeRecipe('reproducible_release_pipeline')` to run atomic pipelines (`sync -> audit -> build -> verify -> publish`).

5. **Step 5: Autonomous Diagnostics & Self-Healing**
   - When encountering a Gradle failure or dirty git tree, the `agentRecipeEngine` automatically runs diagnostic heuristics (adjusting JVM target, applying `.so` delta patch, or rolling back).

6. **Step 6: Forensic Logging**
   - Always record every action via `globalAgentTelemetryBus.logAgentAction({ agentId, agentRole, actionType, targetResource, decisionRationale, status })`.

---

## 6. Anti-Patterns & Safety Rules for AI Agents

1. ❌ **No Mock Data / No Fake Handlers**: Every API endpoint and RPC bridge connects to real application state. Never inject mock placeholders.
2. ❌ **No Stale Polling**: Use the reactive `globalAgentEventBus` and `globalStatePersistenceService` instead of high-frequency tight loops.
3. ❌ **No Unlogged Mutations**: Never modify catalog items or dispatch builds without writing to the IndexedDB telemetry journal.
4. ✅ **Respect Dependency Topologies**: Ensure all imports match the service registry hierarchy and types defined in `/src/types.ts`.
5. ✅ **Automatic Rollback on Failure**: Always register compensation handlers for destructive or stateful pipeline steps.

---

*Authored by Civer Autonomous Core Engineering Team.*
