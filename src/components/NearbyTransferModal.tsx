import React, { useState, useEffect } from 'react';
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
  QrCode,
  Layers,
  Cpu,
  RefreshCw,
  Hash,
  Activity,
  Zap
} from 'lucide-react';
import { NearbyPeerDevice, NearbyTransferSession } from '../types';
import { nearbyP2pTransferMeshService, P2pBinaryChunk, P2pPairingToken, P2pTransferProgressEvent } from '../services/nearbyP2pTransferMesh';

interface NearbyTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  defaultAppToSend?: {
    id: string;
    name: string;
    packageId: string;
    sizeMb: number;
    sha256: string;
  };
}

export const NearbyTransferModal: React.FC<NearbyTransferModalProps> = ({
  isOpen,
  onClose,
  onAddToast,
  defaultAppToSend
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'streaming' | 'pairing_qr'>('radar');
  const [peers, setPeers] = useState<NearbyPeerDevice[]>([]);
  const [sessions, setSessions] = useState<NearbyTransferSession[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [pairingToken, setPairingToken] = useState<P2pPairingToken | null>(null);
  const [sampleChunks, setSampleChunks] = useState<P2pBinaryChunk[]>([]);
  const [activeStreamEvent, setActiveStreamEvent] = useState<P2pTransferProgressEvent | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Suscripción al servicio P2P reactivo
    const unsubPeers = nearbyP2pTransferMeshService.subscribePeers((latestPeers) => {
      setPeers(latestPeers);
    });

    const unsubSessions = nearbyP2pTransferMeshService.subscribeSessions((latestSessions) => {
      setSessions(latestSessions);
    });

    // Generar token QR
    const token = nearbyP2pTransferMeshService.generatePairingToken('Civer Master Node (ASUS ROG)');
    setPairingToken(token);

    // Muestra de chunks
    const chunks = nearbyP2pTransferMeshService.sliceApkIntoChunks(14.8, 64);
    setSampleChunks(chunks.slice(0, 16));

    return () => {
      unsubPeers();
      unsubSessions();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanRadar = async () => {
    setIsScanning(true);
    if (onAddToast) {
      onAddToast('Radar P2P Escaneando', 'Sondeando frecuencias Wi-Fi Direct y balizas mDNS en la red local...', 'info');
    }
    const updated = await nearbyP2pTransferMeshService.scanRadar(1600);
    setIsScanning(false);
    if (onAddToast) {
      onAddToast('Radar P2P Actualizado', `${updated.length} nodos activos encontrados (incluyendo Samsung Galaxy A06 Gateway)`, 'success');
    }
  };

  const handleStartSend = async (peer: NearbyPeerDevice) => {
    const appToTransfer = defaultAppToSend || {
      id: 'app-spotube',
      name: 'Spotube Music FOSS Client',
      packageId: 'oss.krtirtho.spotube',
      sizeMb: 19.4,
      sha256: '9f83a21c45d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e'
    };

    setActiveTab('streaming');
    if (onAddToast) {
      onAddToast('Iniciando WebRTC P2P', `Segmentando ${appToTransfer.name} en bloques de 64KB hacia ${peer.deviceName}`, 'info');
    }

    try {
      await nearbyP2pTransferMeshService.startTransferSession(peer, appToTransfer, (progress) => {
        setActiveStreamEvent(progress);
      });
      if (onAddToast) {
        onAddToast('Transferencia Completada', `${appToTransfer.name} enviado a ${peer.deviceName}. Hash SHA-256 verificado en buffer.`, 'success');
      }
    } catch (err: any) {
      if (onAddToast) {
        onAddToast('Error de Streaming P2P', err.message || 'Fallo de canal de datos WebRTC', 'error');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[88vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-700/60 rounded-xl text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  Protocolo Nearby P2P & WebRTC DataChannels Mesh
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Zero Data Usage
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Chunks 64 KB • CRC32
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Distribución local de APKs y parches diferenciales sin conexión a Internet vía Wi-Fi Direct
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScanRadar}
              disabled={isScanning}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isScanning ? 'Escaneando Malla...' : 'Escanear Radar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'radar'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Radar de Nodos Locales ({peers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('streaming')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'streaming'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Streaming de Chunks & Transferencias ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pairing_qr')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'pairing_qr'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Emparejamiento QR & Handshake Efímero</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 space-y-4">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Modo Transceiver Activo: <strong>WebRTC DataChannels + UDP Port 51820 Bridge</strong></span>
                </div>
                <div className="text-[11px] font-mono text-cyan-400">
                  Cifrado: TLS 1.3 DTLS-SRTP • Zero-Logs
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="p-4 bg-slate-900 border border-slate-800/90 hover:border-cyan-700/80 rounded-xl transition flex flex-col justify-between space-y-3 shadow-lg"
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
                              : peer.status === 'TRANSFERRING'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {peer.status}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Señal: <span className="text-slate-300 font-bold">{peer.rssiSignalStrength} dBm</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {peer.sharedAppsCount} apps en caché local
                      </span>
                      <button
                        onClick={() => handleStartSend(peer)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition text-xs shadow-md shadow-cyan-900/30"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Transmitir APK</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: STREAMING & CHUNKS */}
          {activeTab === 'streaming' && (
            <div className="space-y-4">
              {/* Active Transfers */}
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Sesiones P2P Activas en Malla ({sessions.length})</span>
                    <span className="text-slate-500">Tasa de Transferencia Agregada</span>
                  </div>

                  {sessions.map((sess) => (
                    <div key={sess.sessionId} className="p-4 bg-slate-900 border border-cyan-800/70 rounded-xl space-y-3 shadow-xl">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-white text-sm">{sess.appName}</span>
                          <span className="text-slate-400 text-xs">➔ {sess.peerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                            {sess.status}
                          </span>
                          <div className="font-mono text-cyan-300 font-bold text-sm">{sess.transferSpeedMbps} MB/s</div>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-cyan-400/50"
                          style={{ width: `${sess.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>
                          {((sess.apkSizeMb * sess.progressPercent) / 100).toFixed(1)} MB de {sess.apkSizeMb} MB ({sess.progressPercent}%)
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Hash className="w-3 h-3 text-cyan-400" />
                          Digest: {sess.sha256VerificationHash.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs font-mono bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                  No hay transferencias activas. Selecciona un nodo en la pestaña Radar para iniciar streaming de APK.
                </div>
              )}

              {/* Chunks Inspector Grid */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Matriz de Chunks Atómicos (Segmentación 64 KB con Checksum CRC32)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Muestra de 16 bloques en pipeline</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {sampleChunks.map((chunk) => (
                    <div
                      key={chunk.chunkIndex}
                      className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-center font-mono space-y-0.5"
                    >
                      <div className="text-[10px] text-cyan-400 font-bold">Chunk #{chunk.chunkIndex}</div>
                      <div className="text-[9px] text-slate-500">64 KB</div>
                      <div className="text-[9px] text-emerald-400 font-semibold">{chunk.crc32}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAIRING QR */}
          {activeTab === 'pairing_qr' && pairingToken && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl mx-auto space-y-5 text-center">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Emparejamiento Rápido de Hardware Android</h4>
                <p className="text-xs text-slate-400">
                  Escanea este código desde la app Civer Store en tu teléfono para vincular el nodo WebRTC sin escribir IPs.
                </p>
              </div>

              {/* QR Mockup Canvas */}
              <div className="inline-block p-4 bg-white rounded-2xl shadow-2xl border-4 border-cyan-500/50">
                <div className="w-48 h-48 bg-slate-950 flex flex-col items-center justify-center p-3 rounded-xl text-cyan-400 font-mono text-[9px] break-all leading-tight">
                  <QrCode className="w-20 h-20 text-cyan-400 mb-2" />
                  <span className="text-white font-bold text-[10px] mb-1">CIVER P2P MESH</span>
                  <span className="text-slate-400">{pairingToken.token}</span>
                </div>
              </div>

              {/* Pairing Metadata */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500">PIN de Autorización</div>
                  <div className="text-lg font-mono font-bold text-cyan-400 tracking-widest">{pairingToken.pairingPin}</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500">Expira En</div>
                  <div className="text-xs font-mono font-bold text-slate-200">{pairingToken.expiresAt}</div>
                </div>
                <div className="col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-[10px]">
                  <div className="text-slate-500 uppercase">Huella de Clave Pública (Fingerprint)</div>
                  <div className="text-emerald-400 break-all">{pairingToken.publicKeyFingerprint}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Cifrado Punto a Punto DTLS/SCTP con Reensamblado SHA-256
          </span>
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
