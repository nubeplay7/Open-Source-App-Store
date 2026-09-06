import React, { useState } from 'react';
import {
  Network,
  Activity,
  Layers,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  Code,
  Shield,
  Cpu,
  Radio,
  HardDrive,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { ArchitectureNode, SettingsAuditLogItem } from '../types';
import { SYSTEM_ARCHITECTURE_NODES, SAMPLE_SETTINGS_AUDIT_LOGS } from '../data/architectureGraphData';

interface VisualDependencyGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const VisualDependencyGraphModal: React.FC<VisualDependencyGraphModalProps> = ({
  isOpen,
  onClose,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'GRAPH_CANVAS' | 'AUDIT_TRAIL'>('GRAPH_CANVAS');
  const [nodes] = useState<ArchitectureNode[]>(SYSTEM_ARCHITECTURE_NODES);
  const [auditLogs] = useState<SettingsAuditLogItem[]>(SAMPLE_SETTINGS_AUDIT_LOGS);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-ui-playstore');

  if (!isOpen) return null;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const getCategoryIcon = (cat: ArchitectureNode['category']) => {
    switch (cat) {
      case 'CI_CD':
        return <Cpu className="w-4 h-4 text-sky-400" />;
      case 'SECURITY':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'P2P_MESH':
        return <Radio className="w-4 h-4 text-cyan-400" />;
      case 'STORAGE':
        return <HardDrive className="w-4 h-4 text-amber-400" />;
      case 'KERNEL':
        return <Activity className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[88vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Mapa Interactivo de Arquitectura & Dependencias
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Full Stack Matrix
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Topología viva de los 11 subsistemas, latencias internas, cobertura de pruebas y bitácora de auditoría
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 gap-2">
          <button
            onClick={() => setActiveTab('GRAPH_CANVAS')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'GRAPH_CANVAS'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Grafo Topológico de Subsistemas</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
              {nodes.length} nodos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_TRAIL')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'AUDIT_TRAIL'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Bitácora de Auditoría de Configuración</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
              {auditLogs.length} eventos
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'GRAPH_CANVAS' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Topology Grid */}
              <div className="flex-1 bg-[#090e18] p-4 overflow-y-auto space-y-3">
                <div className="text-xs font-mono text-slate-400 mb-2">
                  Selecciona un subsistema para examinar sus conexiones y telemetría:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                        selectedNodeId === node.id
                          ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-800 rounded-lg">{getCategoryIcon(node.category)}</div>
                          <span className="font-bold text-xs">{node.label}</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {node.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                        <span>Latencia: {node.metrics.latencyMs}ms</span>
                        <span>Cobertura: {node.metrics.testCoverage}%</span>
                        <span>{node.connections.length} enlaces</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Detail Pane */}
              <div className="w-full md:w-80 bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">
                      Nodo Seleccionado
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">{selectedNode.label}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-1">ID: {selectedNode.id}</div>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Líneas de Código:</span>
                      <span className="text-white font-bold">{selectedNode.metrics.linesOfCode} LOC</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Test Coverage:</span>
                      <span className="text-emerald-400 font-bold">{selectedNode.metrics.testCoverage}%</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Latencia Interna:</span>
                      <span className="text-sky-400 font-bold">{selectedNode.metrics.latencyMs} ms</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-2">Conexiones Directas (Data Bus):</div>
                    <div className="space-y-1.5">
                      {selectedNode.connections.map((connId) => (
                        <div
                          key={connId}
                          className="px-2.5 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-300 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span>{connId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-xs text-indigo-200">
                  Total integración modular: Todas las dependencias son desacopladas y no destructivas.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AUDIT_TRAIL' && (
            <div className="flex-1 p-4 bg-slate-950 overflow-y-auto space-y-3">
              <div className="text-xs font-mono text-slate-400 mb-2">
                Historial inmutable de cambios de configuración, flags y certificados:
              </div>

              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold text-[10px]">{log.id}</span>
                      <span className="font-bold text-white">{log.changeSummary}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-400">
                      <div className="text-[9px] uppercase text-rose-400">Valor Anterior</div>
                      <div>{log.previousValue}</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                      <div className="text-[9px] uppercase text-emerald-400">Nuevo Valor</div>
                      <div>{log.newValue}</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">Modificado por: {log.actor}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Arquitectura modular de 5 áreas totalmente rastreable</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
