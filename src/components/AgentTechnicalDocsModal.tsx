import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Code2,
  Copy,
  Check,
  Cpu,
  Zap,
  Radio,
  Share2,
  Terminal,
  Layers,
  FileText,
  Workflow,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Server,
  Database
} from 'lucide-react';
import { internalMcpServer } from '../services/internalMcpServer';
import { repoHeuristicApi } from '../services/repoHeuristicService';

interface AgentTechnicalDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrchestrator?: () => void;
  onOpenBlueprint?: () => void;
  onOpenAcademy?: () => void;
}

export const AgentTechnicalDocsModal: React.FC<AgentTechnicalDocsModalProps> = ({
  isOpen,
  onClose,
  onOpenOrchestrator,
  onOpenBlueprint,
  onOpenAcademy
}) => {
  const [activeTab, setActiveTab] = useState<'WEBSOCKET' | 'GRPC' | 'MCP' | 'REST' | 'SYSTEM_PROMPT'>('WEBSOCKET');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const WEBSOCKET_SCHEMA = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AgentEventMessage",
  "description": "Standard payload broadcasted across WebSocket (/ws/agent-bus) and BroadcastChannel ('civer_global_agent_event_bus')",
  "type": "object",
  "required": ["id", "timestamp", "type", "payload", "sourceAgentId"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique UUIDv4 identifying the broadcasted event"
    },
    "timestamp": {
      "type": "integer",
      "description": "Epoch timestamp in milliseconds"
    },
    "type": {
      "type": "string",
      "enum": [
        "BUILD_QUEUED",
        "BUILD_STEP_UPDATE",
        "BUILD_COMPLETED",
        "REPO_SYNC_STATUS",
        "STORE_MATRIX_UPDATED",
        "AGENT_STATE_MUTATED",
        "AGENT_TELEMETRY_LOGGED",
        "SECURITY_AUDIT_REPORTED",
        "DELTA_PATCH_GENERATED",
        "CONTEXT_BUFFER_SYNCED"
      ]
    },
    "sourceAgentId": {
      "type": "string",
      "description": "Agent or system actor emitting the event"
    },
    "payload": {
      "type": "object",
      "description": "Event-specific structured data"
    }
  }
}`;

  const PROTOBUF_SPEC = `syntax = "proto3";

package civer.transport.bridge.v1;

option go_package = "github.com/civer-app-store/proto/v1;civerv1";

service CiverTransportBridge {
  // Dispatches a reproducible build task to the GitHub Actions CI Matrix
  rpc TriggerBuild (TriggerBuildRequest) returns (TriggerBuildResponse);

  // Retrieves real-time store metrics, active mirrors, and memory cache stats
  rpc GetAppStats (GetAppStatsRequest) returns (GetAppStatsResponse);

  // Injects an audited Delta Patch binary to update an existing application
  rpc DeployPatch (DeployPatchRequest) returns (DeployPatchResponse);

  // Computes heuristic health and Android compilation readiness for a Git repo
  rpc ExecuteHeuristicScan (HeuristicScanRequest) returns (HeuristicScanResponse);

  // Performs autonomous mass-import of healthy apps (Health Score >= threshold)
  rpc BatchImportApps (BatchImportAppsRequest) returns (BatchImportAppsResponse);

  // Streams real-time agent telemetry logs over gRPC-web
  rpc StreamTelemetry (StreamTelemetryRequest) returns (stream TelemetryLogEvent);
}

message TriggerBuildRequest {
  string app_id = 1;
  string app_name = 2;
  string github_url = 3;
  string gradle_task = 4;
  string priority = 5; // CRITICAL, HIGH, NORMAL, LOW
  string requested_by_agent_id = 6;
}

message TriggerBuildResponse {
  bool success = 1;
  string job_id = 2;
  string status = 3;
  int64 queued_timestamp = 4;
  string message = 5;
}

message HeuristicScanRequest {
  string repo_url = 1;
  int32 min_score_threshold = 2;
}

message HeuristicScanResponse {
  string app_id = 1;
  int32 health_score = 2;
  string grade = 3; // A+, A, B, C, D, F
  bool has_gradle_wrapper = 4;
  bool is_reproducible = 5;
  repeated string recommendations = 6;
}

message BatchImportAppsRequest {
  int32 min_health_score = 1; // e.g. 80
  int32 max_limit = 2;        // e.g. 10
  string requesting_agent_id = 3;
}

message BatchImportAppsResponse {
  int32 imported_count = 1;
  repeated string imported_app_names = 2;
  int32 total_catalog_size = 3;
}`;

  const CLAUDE_DESKTOP_CONFIG = `{
  "mcpServers": {
    "civer-store-core": {
      "command": "node",
      "args": ["./scripts/civer-mcp-bridge.js"],
      "env": {
        "CIVER_API_URL": "http://localhost:3000",
        "AGENT_ID": "claude-desktop-assistant",
        "AGENT_ROLE": "ORCHESTRATOR"
      }
    }
  }
}`;

  const SYSTEM_PROMPT_TEMPLATE = `# CIVER APP STORE: AGENT OPERATING DIRECTIVE & FULL SYSTEM PROTOCOL

You are an autonomous AI Agent operating within the Civer App Store ecosystem — a sovereign, decentralized, reproducible Android FOSS distribution platform.

## 1. CORE CAPABILITIES & PROTOCOLS
1. **Model Context Protocol (MCP)**: You have access to 10 structured tools via JSON-RPC 2.0 at \`/api/v1/mcp/jsonrpc\` (or via \`internalMcpServer\`):
   - \`civer_browse_catalog\`: Query applications with filtering by Category, Architecture, Trackers, and Health Score.
   - \`civer_get_app_details\`: Retrieve complete metadata, Android permissions, targetSdk, Gradle task, and reproducibility hash.
   - \`civer_get_health_scores\`: Compute heuristic health score leaderboard (Gradle 40%, Git commits 30%, Issue triage 30%).
   - \`civer_batch_import_healthy_apps\`: Execute mass-import of apps with Health Score >= 80% (Grade A/A+).
   - \`civer_get_build_status\` & \`civer_enqueue_build\`: Orchestrate reproducible container builds on GitHub Actions CI.
   - \`civer_query_agent_telemetry\`: Inspect forensic audit trail from IndexedDB.
   - \`civer_get_shared_context\` / \`civer_set_shared_context\`: Mutate multi-agent shared state buffer with mutex locking.
   - \`civer_sync_mirrors\`: Synchronize against official F-Droid Index-V2 repositories.

2. **EventBus Telemetry (WebSocket & BroadcastChannel)**:
   - Listen to \`/ws/agent-bus\` or \`civer_global_agent_event_bus\` for real-time \`BUILD_COMPLETED\`, \`STORE_MATRIX_UPDATED\`, and \`SECURITY_AUDIT_REPORTED\` events.

3. **High-Performance Transport (gRPC-web & Protobuf)**:
   - Protobuf services defined at \`/proto/civer_transport_bridge.proto\` for binary-efficient state synchronization.

## 2. REPOSITORY HEALTH HEURISTIC EQUATION
- **Gradle Structure Score (40%)**:
  - \`build.gradle\` (+35pts), \`settings.gradle\` (+20pts), \`gradlew\` wrapper (+25pts), \`AndroidManifest.xml\` (+20pts).
- **Commit Frequency & Freshness (30%)**:
  - Days since last commit: <=7d (+45pts), <=30d (+35pts), <=90d (+20pts).
  - Weekly intensity: >=10/wk (+55pts), >=5/wk (+45pts), >=2/wk (+30pts).
- **Issue Triage Resolution Ratio (30%)**:
  - Closed / Total Ratio: >=80% (+50pts), >=60% (+40pts), >=40% (+25pts).
  - Low open issue count: <15 open (+50pts), <50 open (+40pts).
- **Grading Scale**: A+ (>=90%), A (>=80%), B (>=70%), C (>=55%), D (>=40%), F (<40%).

## 3. AUTONOMOUS COLLABORATION DIRECTIVES
- Always log actions to \`globalAgentTelemetryBus\` with clear decision rationale before executing mutations.
- Prioritize Grade A/A+ repositories for automated catalog imports.
- Enforce 0 telemetry trackers and reproducible builds.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-700 text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Agent Technical Documentation & Schemas
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  v2.4 Agent-First
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Especificaciones completas de JSON Schemas, gRPC-web Protobuf, Model Context Protocol (MCP) y REST API para agentes de IA autónomos.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenOrchestrator && (
              <button
                onClick={onOpenOrchestrator}
                className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-mono font-bold border border-purple-800 flex items-center gap-1.5 transition"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Orchestrator Hub</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/50 flex space-x-1 overflow-x-auto py-2">
          {[
            { id: 'WEBSOCKET', label: 'WebSocket EventBus', icon: Radio },
            { id: 'GRPC', label: 'gRPC-web & Protobuf', icon: Workflow },
            { id: 'MCP', label: 'MCP Server & Tools', icon: Server },
            { id: 'REST', label: 'REST & Heuristic API', icon: Code2 },
            { id: 'SYSTEM_PROMPT', label: 'Autonomous Agent Prompt', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 whitespace-nowrap transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-300">
          {/* TAB 1: WEBSOCKET EVENTBUS */}
          {activeTab === 'WEBSOCKET' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>GlobalAgentEventBus: Streaming de Eventos Granulares</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Permite a los agentes externos mantener una réplica exacta y sincronizada en tiempo real del estado de Civer App Store. Soporta conexión directa WebSocket en <code className="text-purple-300 bg-slate-900 px-1.5 py-0.5 rounded">/ws/agent-bus</code> y sincronización inter-pestañas mediante <code className="text-purple-300 bg-slate-900 px-1.5 py-0.5 rounded">BroadcastChannel('civer_global_agent_event_bus')</code>.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-200">Esquema JSON de Evento (JSON Schema Draft 2020-12)</span>
                  <button
                    onClick={() => handleCopy(WEBSOCKET_SCHEMA, 'ws_schema')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition border border-slate-700"
                  >
                    {copiedSection === 'ws_schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'ws_schema' ? 'Copiado' : 'Copiar Esquema'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-72">
                  {WEBSOCKET_SCHEMA}
                </pre>
              </div>

              {/* Event catalog list */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Catálogo de 10 Eventos del Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {[
                    { name: 'BUILD_QUEUED', desc: 'Nueva solicitud de compilación reproducible agregada a la cola' },
                    { name: 'BUILD_STEP_UPDATE', desc: 'Progreso del contenedor (Gradle clean, lint, assemble, APK signing)' },
                    { name: 'BUILD_COMPLETED', desc: 'Compilación finalizada con hash SHA-256 generado e informe de reproducibilidad' },
                    { name: 'REPO_SYNC_STATUS', desc: 'Progreso y métricas de sincronización de espejos F-Droid Index-V2' },
                    { name: 'STORE_MATRIX_UPDATED', desc: 'Modificación del catálogo de aplicaciones o importación por lotes' },
                    { name: 'AGENT_STATE_MUTATED', desc: 'Actualización del estado o rol de un agente en el Orchestrator' },
                    { name: 'AGENT_TELEMETRY_LOGGED', desc: 'Nuevo registro forense emitido al journal de IndexedDB' },
                    { name: 'SECURITY_AUDIT_REPORTED', desc: 'Resultado de auditoría estática APK y escaneo de rastreadores' },
                    { name: 'DELTA_PATCH_GENERATED', desc: 'Nuevo parche diferencial VCDIFF binario generado' },
                    { name: 'CONTEXT_BUFFER_SYNCED', desc: 'Actualización de variable compartida en el buffer multi-agente' }
                  ].map((evt) => (
                    <div key={evt.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-xs font-mono font-bold text-purple-300">{evt.name}</span>
                      <p className="text-[11px] text-slate-400">{evt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GRPC-WEB & PROTOBUF */}
          {activeTab === 'GRPC' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-purple-400" />
                  <span>CiverTransportBridge: Definición Protobuf 3</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contrato de comunicación binaria de alto rendimiento a través de gRPC-web. Permite a los agentes invocar métodos remotos con serialización compacta y latencia mínima.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-200">/proto/civer_transport_bridge.proto</span>
                  <button
                    onClick={() => handleCopy(PROTOBUF_SPEC, 'proto_spec')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition border border-slate-700"
                  >
                    {copiedSection === 'proto_spec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'proto_spec' ? 'Copiado' : 'Copiar .proto'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-80">
                  {PROTOBUF_SPEC}
                </pre>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-300">Cabeceras Requeridas para Clientes gRPC-web</h4>
                <div className="space-y-1 text-xs font-mono text-slate-400">
                  <div><span className="text-cyan-300">Content-Type:</span> application/grpc-web+proto</div>
                  <div><span className="text-cyan-300">X-Grpc-Web:</span> 1</div>
                  <div><span className="text-cyan-300">X-User-Agent:</span> civer-agent-bridge/2.4.0</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MCP SERVER & TOOLS */}
          {activeTab === 'MCP' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Model Context Protocol (MCP) Server Integrado</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Servidor MCP nativo compatible con la especificación 2024-11-05 (JSON-RPC 2.0). Expone 10 herramientas y 4 recursos en vivo para que asistentes como Claude Desktop, Cursor o agentes autónomos operen sin UI.
                </p>
              </div>

              {/* Tools List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">10 Herramientas MCP Registradas</h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {internalMcpServer.getTools().map((t) => (
                    <div key={t.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300">{t.name}</span>
                        <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                          JSON-RPC 2.0
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claude Desktop Config Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-200">Configuración para Claude Desktop / Cursor (claude_desktop_config.json)</span>
                  <button
                    onClick={() => handleCopy(CLAUDE_DESKTOP_CONFIG, 'mcp_cfg')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition border border-slate-700"
                  >
                    {copiedSection === 'mcp_cfg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'mcp_cfg' ? 'Copiado' : 'Copiar Config'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto">
                  {CLAUDE_DESKTOP_CONFIG}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: REST & HEURISTIC API */}
          {activeTab === 'REST' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>Endpoints REST & Análisis Heurístico Público</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Endpoints estructurados para consultar resultados de Health Score, iniciar importaciones masivas automatizadas y consultar el registro forense.
                </p>
              </div>

              {/* Endpoints */}
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      GET
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-100">/api/v1/health-scores</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Devuelve el leaderboard de repositorios evaluados con puntuación compuesta (Gradle 40%, Git 30%, Issues 30%).
                  </p>
                  <pre className="p-2.5 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300">
                    curl -X GET "http://localhost:3000/api/v1/health-scores?minScore=80&limit=10"
                  </pre>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      GET
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-100">/api/v1/health-scores/batch-import-candidates</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Devuelve los repositorios calificados para auto-importación masiva con Grado A o A+ (Health Score &gt;= 80%).
                  </p>
                  <pre className="p-2.5 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300">
                    curl -X GET "http://localhost:3000/api/v1/health-scores/batch-import-candidates"
                  </pre>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      POST
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-100">/api/v1/mcp/jsonrpc</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Invoca herramientas de Model Context Protocol mediante JSON-RPC 2.0 estándar.
                  </p>
                  <pre className="p-2.5 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300">
                    {`curl -X POST "http://localhost:3000/api/v1/mcp/jsonrpc" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"civer_get_health_scores","arguments":{"minScore":80}}}'`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUTONOMOUS AGENT SYSTEM PROMPT */}
          {activeTab === 'SYSTEM_PROMPT' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 border border-purple-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Prompt Maestro para Agentes Externos de IA</span>
                  </h3>
                  <button
                    onClick={() => handleCopy(SYSTEM_PROMPT_TEMPLATE, 'sys_prompt')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-purple-950/50"
                  >
                    {copiedSection === 'sys_prompt' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSection === 'sys_prompt' ? '¡Prompt Copiado!' : 'Copiar System Prompt Completo'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Copia y pega este prompt unificado en tu agente de IA local (AutoGPT, CrewAI, LangChain, Cursor o Claude) para transferirle de inmediato todo el contexto de arquitectura, herramientas MCP, endpoints y directivas del ecosistema Civer.
                </p>
              </div>

              <div className="space-y-2">
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                  {SYSTEM_PROMPT_TEMPLATE}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OpenAPI 3.1 & Model Context Protocol 2024-11-05 Verificados</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Cerrar Documentación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
