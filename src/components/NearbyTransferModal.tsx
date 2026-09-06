import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Share2,
  Download,
  Upload,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  Loader2,
  X,
  Shield,
  ArrowRightLeft,
  QrCode
} from 'lucide-react';
import { NearbyPeerDevice, NearbyTransferSession } from '../types';
import { SAMPLE_NEARBY_PEERS, SAMPLE_TRANSFER_SESSIONS } from '../data/nearbyTransferData';

interface NearbyTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const NearbyTransferModal: React.FC<NearbyTransferModalProps> = ({
  isOpen,
  onClose,
  onAddToast
}) => {
  const [peers, setPeers] = useState<NearbyPeerDevice[]>(SAMPLE_NEARBY_PEERS);
  const [sessions, setSessions] = useState<NearbyTransferSession[]>(SAMPLE_TRANSFER_SESSIONS);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleScanPeers = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (onAddToast) {
        onAddToast('Radar P2P Actualizado', '3 dispositivos descubiertos en la red local Wi-Fi Direct', 'info');
      }
    }, 1500);
  };

  const handleStartSend = (peer: NearbyPeerDevice) => {
    const newSession: NearbyTransferSession = {
      sessionId: `session-${Date.now()}`,
      peerId: peer.id,
      peerName: peer.deviceName,
      direction: 'SEND',
      appId: 'civer-app-store-pro',
      appName: 'Civer App Store PRO APK',
      packageId: 'org.civerappstore.app',
      apkSizeMb: 14.8,
      progressPercent: 10,
      transferSpeedMbps: 38.2,
      status: 'TRANSFERRING',
      sha256VerificationHash: 'a9f87123bc45e67890123456789abcdef0123456789abcdef0123456789abcde',
      startedAt: new Date().toLocaleTimeString()
    };
    setSessions((prev) => [newSession, ...prev]);
    if (onAddToast) {
      onAddToast('Transferencia Iniciada', `Enviando Civer App Store PRO a ${peer.deviceName} vía WebRTC P2P`, 'success');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[85vh] max-h-[780px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-700/60 rounded-xl text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Compartición P2P Wi-Fi Direct & WebRTC Mesh
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Zero Data Usage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transfiere APKs y deltas entre dispositivos cercanos sin conexión a Internet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScanPeers}
              disabled={isScanning}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
              <span>{isScanning ? 'Buscando Pares...' : 'Escanear Radar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Layout */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 space-y-5">
          {/* Active Sessions */}
          {sessions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Transferencias Activas en Vuelo
              </div>
              {sessions.map((sess) => (
                <div key={sess.sessionId} className="p-3.5 bg-slate-900 border border-cyan-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white">{sess.appName}</span>
                      <span className="text-slate-400">hacia {sess.peerName}</span>
                    </div>
                    <div className="font-mono text-cyan-300 font-bold">{sess.transferSpeedMbps} MB/s</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-cyan-400/50"
                      style={{ width: `${sess.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {((sess.apkSizeMb * sess.progressPercent) / 100).toFixed(1)} MB de {sess.apkSizeMb} MB
                    </span>
                    <span>Hash SHA-256 Validado en Buffer</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discovered Peers List */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Dispositivos en el Radar Local ({peers.length})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {peers.map((peer) => (
                <div
                  key={peer.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-800/80 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-800 rounded-xl text-cyan-400 border border-slate-700">
                        {peer.deviceType === 'ANDROID_PHONE' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : peer.deviceType === 'DESKTOP_LINUX' ? (
                          <Laptop className="w-5 h-5" />
                        ) : (
                          <Tablet className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{peer.deviceName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{peer.ipAddress}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                          peer.status === 'CONNECTED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {peer.status}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Señal: {peer.rssiSignalStrength} dBm</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400">{peer.sharedAppsCount} apps sincronizables</span>
                    <button
                      onClick={() => handleStartSend(peer)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition text-xs shadow-lg shadow-cyan-600/30"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Enviar APK</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>WebRTC DataChannels con cifrado TLS 1.3 de extremo a extremo</span>
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
