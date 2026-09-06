import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Radio,
  Search,
  RotateCcw,
  Play,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Terminal,
  Layers,
  Copy,
  Check,
  Zap,
  Activity,
  Trash2,
  Download
} from 'lucide-react';
import { civerWebSocketBus, CiverEvent } from '../services/civerWebSocketBus';
import { globalAgentEventBus, AgentEvent } from '../services/globalAgentEventBus';
import { globalAgentTelemetryBus, AgentActionLog } from '../services/globalAgentTelemetryBus';
import { civerTransportBridge } from '../services/civerTransportBridge';
import { internalMcpServer } from '../services/internalMcpServer';

export interface WirePacket {
  id: string;
  timestamp: string;
  unixMs: number;
  protocol: 'gRPC-web' | 'WebSocket' | 'MCP JSON-RPC' | 'Internal EventBus';
  direction: 'INBOUND' | 'OUTBOUND' | 'BROADCAST';
  agentId: string;
  agentRole: string;
  methodOrEvent: string;
  statusCode: number | string;
  durationMs: number;
  bytesTransferred: number;
  requestPayload: any;
  responsePayload?: any;
  headersOrMetadata?: Record<string, string>;
}

interface AgentCommunicationDebuggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (toast: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }) => void;
}

export const AgentCommunicationDebuggerModal: React.FC<AgentCommunicationDebuggerModalProps> = ({
  isOpen,
  onClose,
  onAddToast
}) => {
  const [packets, setPackets] = useState<WirePacket[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<WirePacket | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('ALL');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('ALL');
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayProgress, setReplayProgress] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial mock packet generation & real-time subscriber
  useEffect(() => {
    if (!isOpen) return;

    // Seed historical wire packets from telemetry audit trail
    const auditLogs = globalAgentTelemetryBus.getAuditTrail();
    const seededPackets: WirePacket[] = auditLogs.slice(0, 30).map((log, idx) => ({
      id: `pkt_${log.id}`,
      timestamp: log.timestamp,
      unixMs: new Date(log.timestamp).getTime() || (Date.now() - idx * 4000),
      protocol: log.targetResource.includes('grpc') ? 'gRPC-web' : log.actionType === 'MCP_TOOL_INVOCATION' ? 'MCP JSON-RPC' : 'WebSocket',
      direction: log.actionType === 'STATE_MUTATION' ? 'INBOUND' : 'OUTBOUND',
      agentId: log.agentId,
      agentRole: log.agentRole,
      methodOrEvent: log.targetResource.split('/').pop() || log.actionType,
      statusCode: log.status === 'SUCCESS' ? 200 : 500,
      durationMs: log.durationMs,
      bytesTransferred: Math.floor(Math.random() * 850) + 120,
      requestPayload: log.payload || { action: log.actionType, target: log.targetResource },
      responsePayload: { result: log.resultSummary, status: log.status },
      headersOrMetadata: {
        'content-type': log.targetResource.includes('grpc') ? 'application/grpc-web+proto' : 'application/json',
        'x-agent-identity': log.agentId,
        'x-trace-id': `trace-${log.id.slice(-6)}`
      }
    }));

    if (seededPackets.length === 0) {
      // Create baseline packets if empty
      const baseline: WirePacket[] = [
        {
          id: 'pkt_init_1',
          timestamp: new Date(Date.now() - 15000).toISOString(),
          unixMs: Date.now() - 15000,
          protocol: 'gRPC-web',
          direction: 'INBOUND',
          agentId: 'nexus-orchestrator-01',
          agentRole: 'ORCHESTRATOR',
          methodOrEvent: 'civer.store.v1.GetFullStateSnapshot',
          statusCode: 200,
          durationMs: 42,
          bytesTransferred: 3420,
          requestPayload: { requester_agent_id: 'nexus-orchestrator-01', include_catalog_details: true },
          responsePayload: { snapshot_id: 'snap_base_001', health_score: 98.4, status: 'CONSISTENT' },
          headersOrMetadata: { 'content-type': 'application/grpc-web+proto', 'x-grpc-web': '1' }
        },
        {
          id: 'pkt_init_2',
          timestamp: new Date(Date.now() - 8000).toISOString(),
          unixMs: Date.now() - 8000,
          protocol: 'MCP JSON-RPC',
          direction: 'INBOUND',
          agentId: 'gradle-auditor-02',
          agentRole: 'SECURITY_AUDITOR',
          methodOrEvent: 'civer_browse_catalog',
          statusCode: 200,
          durationMs: 28,
          bytesTransferred: 1840,
          requestPayload: { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'civer_browse_catalog', arguments: { minHealthScore: 90 } } },
          responsePayload: { jsonrpc: '2.0', id: 4, result: { totalMatches: 14 } },
          headersOrMetadata: { 'content-type': 'application/json' }
        }
      ];
      setPackets(baseline);
      setSelectedPacket(baseline[0]);
    } else {
      setPackets(seededPackets);
      setSelectedPacket(seededPackets[0]);
    }

    // Subscribe to EventBus and Telemetry
    const unsubscribeBus = globalAgentEventBus.subscribe('*', (evt: AgentEvent) => {
      if (!isLiveStreaming) return;
      const newPkt: WirePacket = {
        id: `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        unixMs: Date.now(),
        protocol: 'Internal EventBus',
        direction: 'BROADCAST',
        agentId: evt.source || 'system_bus',
        agentRole: (evt as any).metadata?.role || 'EVENT_BUS',
        methodOrEvent: evt.type,
        statusCode: 200,
        durationMs: 12,
        bytesTransferred: JSON.stringify(evt.payload || {}).length + 64,
        requestPayload: evt.payload,
        headersOrMetadata: { 'x-event-type': evt.type, 'x-source': evt.source }
      };
      setPackets(prev => [newPkt, ...prev.slice(0, 99)]);
    });

    const unsubscribeWs = civerWebSocketBus.subscribe('*', (evt: CiverEvent) => {
      if (!isLiveStreaming) return;
      const newPkt: WirePacket = {
        id: `pkt_ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date(evt.timestamp).toISOString(),
        unixMs: evt.timestamp,
        protocol: 'WebSocket',
        direction: 'BROADCAST',
        agentId: 'ws_gateway_core',
        agentRole: 'GATEWAY',
        methodOrEvent: evt.type,
        statusCode: 200,
        durationMs: 8,
        bytesTransferred: JSON.stringify(evt.payload || {}).length + 48,
        requestPayload: evt.payload,
        headersOrMetadata: { 'x-ws-event': evt.type }
      };
      setPackets(prev => [newPkt, ...prev.slice(0, 99)]);
    });

    return () => {
      unsubscribeBus();
      unsubscribeWs();
    };
  }, [isOpen, isLiveStreaming]);

  // Unique Agent IDs for filter
  const uniqueAgentIds = useMemo(() => {
    const set = new Set<string>();
    packets.forEach(p => set.add(p.agentId));
    return Array.from(set);
  }, [packets]);

  // Filtered packets list
  const filteredPackets = useMemo(() => {
    return packets.filter(p => {
      if (selectedProtocol !== 'ALL' && p.protocol !== selectedProtocol) return false;
      if (selectedAgentId !== 'ALL' && p.agentId !== selectedAgentId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMethod = p.methodOrEvent.toLowerCase().includes(q);
        const matchAgent = p.agentId.toLowerCase().includes(q);
        const matchPayload = JSON.stringify(p.requestPayload || {}).toLowerCase().includes(q);
        return matchMethod || matchAgent || matchPayload;
      }
      return true;
    });
  }, [packets, selectedProtocol, selectedAgentId, searchQuery]);

  // Replay captured sequence
  const handleReplaySequence = async () => {
    if (filteredPackets.length === 0 || isReplaying) return;
    setIsReplaying(true);
    setReplayProgress(0);

    const sequenceToReplay = [...filteredPackets].slice(0, 8).reverse();

    onAddToast?.({
      title: 'Iniciando Replay de Tráfico',
      message: `Re-ejecutando secuencia de ${sequenceToReplay.length} paquetes capturados...`,
      type: 'info'
    });

    for (let i = 0; i < sequenceToReplay.length; i++) {
      const pkt = sequenceToReplay[i];
      setReplayProgress(Math.round(((i + 1) / sequenceToReplay.length) * 100));
      setSelectedPacket(pkt);

      // Re-trigger action based on protocol
      try {
        if (pkt.protocol === 'gRPC-web' && pkt.methodOrEvent.includes('TriggerBuild')) {
          await civerTransportBridge.triggerBuild({
            app_id: pkt.requestPayload?.app_id || 'com.aurora.store',
            app_name: pkt.requestPayload?.app_name || 'Aurora Store',
            github_url: pkt.requestPayload?.github_url || 'https://github.com/whyorean/AuroraStore',
            gradle_task: './gradlew assembleRelease',
            priority: 2,
            requester_agent_id: `replay_${pkt.agentId}`
          });
        } else if (pkt.protocol === 'gRPC-web' && pkt.methodOrEvent.includes('GetFullStateSnapshot')) {
          await civerTransportBridge.getFullStateSnapshot({
            requester_agent_id: `replay_${pkt.agentId}`
          });
        } else if (pkt.protocol === 'MCP JSON-RPC') {
          await internalMcpServer.handleJsonRpcRequest({
            jsonrpc: '2.0',
            id: `replay_${Date.now()}`,
            method: 'tools/call',
            params: { name: 'civer_browse_catalog', arguments: { minHealthScore: 85 } }
          });
        }
      } catch (err) {
        console.warn('Replay step warning:', err);
      }

      await new Promise(r => setTimeout(r, 600));
    }

    setIsReplaying(false);
    onAddToast?.({
      title: 'Replay Finalizado',
      message: `Se re-ejecutó exitosamente la secuencia de comandos. Verifique los registros del bus.`,
      type: 'success'
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportWireLog = () => {
    const data = {
      title: 'Civer Agent Communication Raw Packet Log',
      exportedAt: new Date().toISOString(),
      totalPackets: packets.length,
      packets: packets
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civer-wire-traffic-${Date.now()}.json`;
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-950 border border-purple-800 rounded-xl">
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  Agent Communication Debugger & Wire Inspector
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Raw Protocol Sniffer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Captura, filtrado y reproducción de paquetes binarios gRPC-web, JSON-RPC MCP y WebSocket en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Replay Sequence Button */}
            <button
              onClick={handleReplaySequence}
              disabled={isReplaying || filteredPackets.length === 0}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md transition border border-emerald-400/30"
              title="Re-ejecuta la secuencia de paquetes filtrados para reproducir fallos y verificar respuestas"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
              <span>{isReplaying ? `Replaying (${replayProgress}%)` : '⚡ Replay Secuencia'}</span>
            </button>

            {/* Live Streaming Toggle */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                isLiveStreaming
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>{isLiveStreaming ? 'Sniffer Activo' : 'Pausado'}</span>
            </button>

            <button
              onClick={handleExportWireLog}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
              title="Exportar archivo de paquetes JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPackets([])}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition border border-slate-700"
              title="Limpiar paquetes capturados"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar método, agente o payload..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Protocol Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-400 font-medium">Protocolo:</span>
              <select
                value={selectedProtocol}
                onChange={(e) => setSelectedProtocol(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-600"
              >
                <option value="ALL">Todos los Protocolos</option>
                <option value="gRPC-web">gRPC-web (Protobuf)</option>
                <option value="MCP JSON-RPC">MCP JSON-RPC 2.0</option>
                <option value="WebSocket">WebSocket (EventBus)</option>
                <option value="Internal EventBus">Internal EventBus</option>
              </select>
            </div>

            {/* Agent ID Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-400 font-medium">Agente:</span>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-600 max-w-[180px]"
              >
                <option value="ALL">Todos los Agentes ({uniqueAgentIds.length})</option>
                {uniqueAgentIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span>Paquetes Capturados: <strong className="text-purple-300">{filteredPackets.length}</strong> / {packets.length}</span>
          </div>
        </div>

        {/* Main Content Area: Split View (Packet Table + Inspector) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left: Packets Stream Table */}
          <div className="flex-1 overflow-y-auto border-r border-slate-800 divide-y divide-slate-800/60 bg-slate-950/20">
            {filteredPackets.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Activity className="w-8 h-8 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">No se encontraron paquetes con los filtros seleccionados</p>
                <p className="text-[11px] text-slate-500">Prueba ajustando el término de búsqueda o cambiando el filtro de protocolo.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 sticky top-0 z-10 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-2">Protocolo</th>
                    <th className="py-2.5 px-2">Dir</th>
                    <th className="py-2.5 px-3">Agente / Source</th>
                    <th className="py-2.5 px-3">Método / Evento</th>
                    <th className="py-2.5 px-2 text-right">Latencia</th>
                    <th className="py-2.5 px-2 text-right">Tamaño</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredPackets.map((pkt) => {
                    const isSelected = selectedPacket?.id === pkt.id;
                    const timeStr = new Date(pkt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    
                    return (
                      <tr
                        key={pkt.id}
                        onClick={() => setSelectedPacket(pkt)}
                        className={`cursor-pointer transition hover:bg-purple-950/20 ${
                          isSelected ? 'bg-purple-950/40 border-l-2 border-purple-500' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{timeStr}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pkt.protocol === 'gRPC-web'
                                ? 'bg-purple-900/60 text-purple-300'
                                : pkt.protocol === 'MCP JSON-RPC'
                                ? 'bg-pink-900/60 text-pink-300'
                                : 'bg-cyan-900/60 text-cyan-300'
                            }`}
                          >
                            {pkt.protocol}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          {pkt.direction === 'INBOUND' ? (
                            <span className="flex items-center text-emerald-400 text-[10px]">
                              <ArrowDownLeft className="w-3 h-3 mr-0.5" /> IN
                            </span>
                          ) : pkt.direction === 'OUTBOUND' ? (
                            <span className="flex items-center text-cyan-400 text-[10px]">
                              <ArrowUpRight className="w-3 h-3 mr-0.5" /> OUT
                            </span>
                          ) : (
                            <span className="flex items-center text-amber-400 text-[10px]">
                              <Zap className="w-3 h-3 mr-0.5" /> BCAST
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-200 font-semibold truncate max-w-[140px]" title={pkt.agentId}>
                          {pkt.agentId}
                        </td>
                        <td className="py-2 px-3 text-slate-300 font-semibold truncate max-w-[200px]" title={pkt.methodOrEvent}>
                          {pkt.methodOrEvent}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-400">
                          {pkt.durationMs}ms
                        </td>
                        <td className="py-2 px-2 text-right text-slate-400">
                          {pkt.bytesTransferred} B
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            pkt.statusCode === 200
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {pkt.statusCode}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Right: Packet Deep Inspector */}
          <div className="w-full lg:w-[460px] bg-slate-950/80 p-4 overflow-y-auto space-y-4 shrink-0 flex flex-col">
            {selectedPacket ? (
              <div className="space-y-4 flex-1">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {selectedPacket.protocol}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(selectedPacket.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 font-mono mt-1 break-all">
                      {selectedPacket.methodOrEvent}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedPacket, null, 2), 'packet_raw')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                    title="Copiar JSON completo del paquete"
                  >
                    {copiedId === 'packet_raw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                </div>

                {/* Packet Overview KPIs */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Agent Caller</span>
                    <p className="text-xs font-mono font-bold text-slate-200 truncate mt-0.5">{selectedPacket.agentId}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Latencia</span>
                    <p className="text-xs font-mono font-bold text-cyan-400 mt-0.5">{selectedPacket.durationMs} ms</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Wire Payload</span>
                    <p className="text-xs font-mono font-bold text-purple-400 mt-0.5">{selectedPacket.bytesTransferred} Bytes</p>
                  </div>
                </div>

                {/* Wire Headers / Metadata */}
                {selectedPacket.headersOrMetadata && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Protocol Headers & Transport Metadata
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                      {Object.entries(selectedPacket.headersOrMetadata).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-purple-300 font-semibold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Payload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Request Payload (Decoded Wire Frame)
                    </span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedPacket.requestPayload, null, 2), 'req_payload')}
                      className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      {copiedId === 'req_payload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(selectedPacket.requestPayload, null, 2)}
                  </pre>
                </div>

                {/* Response Payload if available */}
                {selectedPacket.responsePayload && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Response Payload (Server Result)
                      </span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(selectedPacket.responsePayload, null, 2), 'res_payload')}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        {copiedId === 'res_payload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48 leading-relaxed">
                      {JSON.stringify(selectedPacket.responsePayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Layers className="w-8 h-8 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Selecciona un paquete para inspeccionar</p>
                <p className="text-[11px] text-slate-500">
                  Explora los headers binarios, payloads descodificados y respuestas del servidor en tiempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
