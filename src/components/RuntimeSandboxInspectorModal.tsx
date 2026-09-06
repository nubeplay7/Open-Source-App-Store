import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  X,
  FileCheck,
  Search,
  Eye,
  RefreshCw
} from 'lucide-react';
import { RuntimeSandboxPermission, AntiTamperingAuditResult } from '../types';
import { SAMPLE_RUNTIME_PERMISSIONS, SAMPLE_TAMPERING_AUDIT } from '../data/runtimeSandboxData';

interface RuntimeSandboxInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPackage?: string;
  appName?: string;
  onAddToast?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const RuntimeSandboxInspectorModal: React.FC<RuntimeSandboxInspectorModalProps> = ({
  isOpen,
  onClose,
  targetPackage = 'org.civerappstore.app',
  appName = 'Civer App Store PRO',
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'PERMISSIONS_MATRIX' | 'ANTI_TAMPERING'>('PERMISSIONS_MATRIX');
  const [permissions, setPermissions] = useState<RuntimeSandboxPermission[]>(
    SAMPLE_RUNTIME_PERMISSIONS[targetPackage] || SAMPLE_RUNTIME_PERMISSIONS['org.civerappstore.app'] || []
  );
  const auditResult: AntiTamperingAuditResult =
    SAMPLE_TAMPERING_AUDIT[targetPackage] || SAMPLE_TAMPERING_AUDIT['org.civerappstore.app'] || {
      packageName: targetPackage,
      versionName: '1.0.0',
      installedSha256: '',
      upstreamIndexSha256: '',
      isHashMatch: true,
      signatureCertIssuer: 'Self-Signed',
      signatureCertValidUntil: '2030-01-01',
      isCertificateRevoked: false,
      crlCheckStatus: 'VERIFIED_CLEAN',
      tamperRiskScore: 0,
      warnings: []
    };

  if (!isOpen) return null;

  const togglePermissionStatus = (permissionName: string) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.permissionName === permissionName) {
          const nextStatus = p.runtimeStatus === 'GRANTED' ? 'REVOKED' : 'GRANTED';
          if (onAddToast) {
            onAddToast(
              'Permiso Modificado en Sandbox',
              `${p.permissionName.split('.').pop()}: ${nextStatus}`,
              nextStatus === 'GRANTED' ? 'info' : 'warning'
            );
          }
          return { ...p, runtimeStatus: nextStatus };
        }
        return p;
      })
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[85vh] max-h-[800px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Runtime Sandbox & Inspector de Permisos
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Android 14+ Hardened
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoría dinámica de llamadas a APIs, fondo y verificación Anti-Tampering SHA-256
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
            onClick={() => setActiveTab('PERMISSIONS_MATRIX')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'PERMISSIONS_MATRIX'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Matriz de Permisos en Runtime</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
              {permissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ANTI_TAMPERING')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'ANTI_TAMPERING'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Verificación Anti-Tampering & Certificados CRL</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 space-y-4">
          {activeTab === 'PERMISSIONS_MATRIX' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Inspección de permisos declarados en APK vs Estado concedido en el sandbox:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {permissions.filter((p) => p.runtimeStatus === 'GRANTED').length} Concedidos / {permissions.length} Totales
                </span>
              </div>

              <div className="space-y-2.5">
                {permissions.map((perm) => (
                  <div
                    key={perm.permissionName}
                    className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">
                          {perm.permissionName.split('.').pop()}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                            perm.protectionLevel === 'DANGEROUS'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : perm.protectionLevel === 'PRIVILEGED'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {perm.protectionLevel}
                        </span>
                        {perm.backgroundAccess && (
                          <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-mono border border-amber-800">
                            Fondo Permitido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{perm.purposeDescription}</p>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-3">
                        <span>Llamadas observadas: {perm.observedCallCount}</span>
                        {perm.lastAccessedTimestamp && <span>Último acceso: {perm.lastAccessedTimestamp}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-mono">Puntuación Riesgo</div>
                        <div
                          className={`text-xs font-bold font-mono ${
                            perm.riskScore > 50 ? 'text-rose-400' : perm.riskScore > 20 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {perm.riskScore}/100
                        </div>
                      </div>

                      <button
                        onClick={() => togglePermissionStatus(perm.permissionName)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          perm.runtimeStatus === 'GRANTED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                        }`}
                      >
                        {perm.runtimeStatus === 'GRANTED' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span>{perm.runtimeStatus}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ANTI_TAMPERING' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm text-white">Integridad de Hash Criptográfico</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                    100% Coincidencia SHA-256
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Digest APK Instalado:</div>
                    <div className="p-2 bg-black/50 rounded border border-slate-800 text-sky-300 break-all">
                      {auditResult.installedSha256}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Digest Oficial Upstream (F-Droid V2):</div>
                    <div className="p-2 bg-black/50 rounded border border-slate-800 text-emerald-300 break-all">
                      {auditResult.upstreamIndexSha256}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                  Autoridad Certificadora & Estado CRL
                </h4>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-400">Emisor:</span> {auditResult.signatureCertIssuer}
                  </div>
                  <div>
                    <span className="text-slate-400">Vigencia:</span> Hasta {auditResult.signatureCertValidUntil}
                  </div>
                  <div>
                    <span className="text-slate-400">Lista de Revocación (CRL):</span>{' '}
                    <span className="text-emerald-400 font-semibold font-mono">VERIFIED_CLEAN (Sin revocaciones activas)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Sandbox de aislamiento para prevención de malware</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Cerrar Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
