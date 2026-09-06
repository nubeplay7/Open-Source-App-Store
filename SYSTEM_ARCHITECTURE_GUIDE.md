# Civer App Store — System Architecture & Agent Navigation Guide
*Document Version: 4.2.0 (Self-Documenting Agentic Operating System)*

---

## 1. Executive Directive for Autonomous AI Agents

> **RULE ZERO FOR ALL AGENTS**: 
> You are operating within an ultra-complete, production-grade application with zero placeholders. **Never re-invent or re-implement an existing module.** Always inspect the unified System Map, MCP Tool Registry, or gRPC-web Bridge and invoke existing services.

This guide provides a comprehensive mental model and explicit protocol mapping for AI agents, LLM tool-calling engines, and autonomous developers interacting with the **Civer FOSS App Store & CI/CD Orchestration Platform**.

---

## 2. High-Level Architectural Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    USER INTERFACE & ACTION LAYER                                   |
|  [Civer Store]  [App Store View]  [Matrix Pro]  [Dev Workspace]  [AppDetailModal]  [CommandPalette]|
+-----------------------------------+--------------------------------+-------------------------------+
                                    |                                |
                                    v                                v
+----------------------------------------------------------------------------------------------------+
|                                  COMMUNICATION GATEWAYS & BUSES                                    |
|   +--------------------------+  +-------------------------------+  +---------------------------+   |
|   | gRPC-web Bridge Gateway  |  |   Model Context Protocol V2   |  |   WebSocket / EventBus    |   |
|   | (civerTransportBridge.ts)|  |   (internalMcpServer.ts)      |  |   (civerWebSocketBus.ts)  |   |
|   +-------------+------------+  +---------------+---------------+  +-------------+-------------+   |
+-----------------|-------------------------------|--------------------------------|-----------------+
                  |                               |                                |
                  v                               v                                v
+----------------------------------------------------------------------------------------------------+
|                                      CORE SERVICES & CONTROLLERS                                   |
|  +--------------------------------+ +------------------------------+ +---------------------------+ |
|  | PersistentCiQueueService       | | RepoHeuristicService         | | GlobalStatePersistence    | |
|  | - Enqueue & retry CI jobs      | | - Android AST & Health Score | | - 5s Snapshot serializer  | |
|  +--------------------------------+ +------------------------------+ +---------------------------+ |
|  +--------------------------------+ +------------------------------+ +---------------------------+ |
|  | GlobalAgentTelemetryBus        | | NativeAssemblyService        | | FdroidMirrorService       | |
|  | - Immutable decision journal   | | - Delta patch & .so bytecode | | - Index-V2 differential   | |
|  +--------------------------------+ +------------------------------+ +---------------------------+ |
+-----------------------------------+--------------------------------+-------------------------------+
                                    |                                |
                                    v                                v
+----------------------------------------------------------------------------------------------------+
|                                   PERSISTENCE & STORAGE LAYER                                      |
|  +--------------------------------+ +------------------------------+ +---------------------------+ |
|  | IndexedDB: civer_agent_journal | | IndexedDB: civer_fault_logs  | | LocalStorage (CI Queue)   | |
|  +--------------------------------+ +------------------------------+ +---------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Communication Protocols & Remote Control Handlers

### 3.1. gRPC-web Service (`civer.store.v1.CiverTransportBridgeService`)

Exposed via `/src/services/civerTransportBridge.ts`:

| Method | Request Message | Response Message | Description |
| :--- | :--- | :--- | :--- |
| `TriggerBuild` | `TriggerBuildRequest` | `TriggerBuildResponse` | Enqueues a deterministic CI build job in GitHub Actions with priority |
| `GetFullStateSnapshot` | `GetFullStateSnapshotRequest` | `GetFullStateSnapshotResponse` | Returns the entire state of catalog, CI queue, telemetry, and health in 1 roundtrip |
| `DeployPatch` | `DeployPatchRequest` | `DeployPatchResponse` | Injects delta binary bytecode (.so patch) into target APK |
| `SyncMirrors` | `SyncMirrorsRequest` | `SyncMirrorsResponse` | Triggers differential F-Droid index-v2 synchronization |
| `GetAppStats` | `GetAppStatsRequest` | `GetAppStatsResponse` | Fetches install counts, active trackers, and reproducible build hashes |

#### Sample Invocations:
```typescript
import { civerTransportBridge, BuildPriority } from '@/services/civerTransportBridge';

// 1. Trigger remote CI build
const buildRes = await civerTransportBridge.triggerBuild({
  app_id: 'com.aurora.store',
  app_name: 'Aurora Store',
  github_url: 'https://github.com/whyorean/AuroraStore',
  gradle_task: './gradlew assembleRelease',
  priority: BuildPriority.BUILD_PRIORITY_HIGH,
  requester_agent_id: 'nexus-orchestrator'
});

// 2. Fetch full state snapshot
const snapshot = await civerTransportBridge.getFullStateSnapshot({
  requester_agent_id: 'agent-context-recovery'
});
```

---

### 3.2. Model Context Protocol (MCP) Server

Exposed via `/src/services/internalMcpServer.ts` (Compliant with MCP Protocol v2024-11-05):

#### Available Tools:
1. `civer_browse_catalog`: Search and filter apps by architecture (`ARM64`, `x86_64`), category, and reproducibility status.
2. `civer_analyze_repo_heuristics`: Compute static code health score (0-100%) and detect anti-features.
3. `civer_enqueue_ci_build`: Dispatch reproducible builds to GitHub Actions runners.
4. `civer_get_audit_trail`: Retrieve agent decision journal from IndexedDB.
5. `civer_sync_mirrors`: Sync external F-Droid / Obtainium mirrors.
6. `civer_get_full_state_snapshot`: Retrieve omniscient JSON application snapshot.
7. `civer_execute_workflow_recipe`: Run multi-step agent workflow recipes (e.g. `audit-and-build`).

#### Available URI Resources:
- `civer://catalog/apps.json`: Complete catalog metadata.
- `civer://system/state-snapshot.json`: Real-time 5s consolidated snapshot.
- `civer://telemetry/audit-trail.json`: IndexedDB audit log traces.
- `civer://system/architecture-blueprint.json`: Graph nodes and connection links.

---

### 3.3. WebSocket & Reactive EventBus

Subscribable via `/src/services/civerWebSocketBus.ts`:

- `BUILD_QUEUED`, `BUILD_STARTED`, `BUILD_COMPLETED`, `BUILD_FAILED`: Real-time build lifecycle streaming.
- `STATE_SNAPSHOT_UPDATED`: 5-second automatic state broadcasts.
- `AGENT_DECISION_RECORDED`: Live telemetry stream of actions executed by external AI agents.
- `MIRROR_SYNC_PROGRESS`: Progress indicators for mirror downloads.

---

## 4. Inspection & Debugging Modals in the UI

1. **Architecture Blueprint & API Discovery Map (`ArchitectureBlueprintModal.tsx`)**:
   - D3.js interactive force-directed graph with two views: General Module Topology & API Discovery Map.
   - Click any node to inspect protocol definitions, schemas, arguments, and trigger live test RPCs.

2. **Agent Communication Debugger & Wire Sniffer (`AgentCommunicationDebuggerModal.tsx`)**:
   - Live stream sniffer for gRPC-web, MCP JSON-RPC 2.0, and WebSocket frames.
   - Filter by Agent ID or Protocol with instant packet replay.

3. **Command Palette (`CommandPalette.tsx`)**:
   - Press `Ctrl+K` or `Cmd+K`.
   - Includes dedicated **gRPC Request Builder** to test raw Protobuf/JSON payloads with wire-compression metrics.

4. **Agent Academy & Action Playground (`AgentAcademyModal.tsx`)**:
   - Interactive recipe builder where agents can save and test multi-step workflows.

---

## 5. Directory Map of Key Services

| Path | Purpose |
| :--- | :--- |
| `/src/services/globalStatePersistenceService.ts` | 5-second full-state serializer with provider subscription |
| `/src/services/civerTransportBridge.ts` | gRPC-web client and method implementations |
| `/src/services/internalMcpServer.ts` | Model Context Protocol JSON-RPC router & handlers |
| `/src/services/persistentCiQueueService.ts` | Resilient compilation queue with retry logic |
| `/src/services/repoHeuristicService.ts` | Gradle AST parser and health calculation engine |
| `/src/services/globalAgentTelemetryBus.ts` | IndexedDB immutable journal recorder |
| `/src/services/mcpDiscoveryToolService.ts` | Auto-discovery and schema generation for MCP tools |
| `/src/services/systemMapGeneratorService.ts` | JSON/Markdown mental model generator |

---

*Authored for all AI Agents, Tool-Calling LLMs & Autonomous Orchestrators.*
