import { NearbyPeerDevice, NearbyTransferSession } from '../types';
import { SAMPLE_NEARBY_PEERS, SAMPLE_TRANSFER_SESSIONS } from '../data/nearbyTransferData';

export interface P2pBinaryChunk {
  chunkIndex: number;
  totalChunks: number;
  byteOffset: number;
  chunkSize: number;
  crc32: string;
  dataBase64?: string;
}

export interface P2pPairingToken {
  token: string;
  deviceId: string;
  deviceName: string;
  publicKeyFingerprint: string;
  pairingPin: string;
  expiresAt: string;
  qrPayload: string;
}

export interface P2pTransferProgressEvent {
  sessionId: string;
  chunkIndex: number;
  totalChunks: number;
  bytesTransferred: number;
  totalBytes: number;
  progressPercent: number;
  speedMbps: number;
  status: NearbyTransferSession['status'];
  estimatedSecondsRemaining: number;
}

function calculateCrc32(str: string): string {
  let crc = 0 ^ (-1);
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ ((crc ^ str.charCodeAt(i)) & 0xff);
  }
  return ((crc ^ (-1)) >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

class NearbyP2pTransferMeshService {
  private peers: NearbyPeerDevice[] = [...SAMPLE_NEARBY_PEERS];
  private sessions: NearbyTransferSession[] = [...SAMPLE_TRANSFER_SESSIONS];
  private isScanning = false;
  private peerListeners: Array<(peers: NearbyPeerDevice[]) => void> = [];
  private sessionListeners: Array<(sessions: NearbyTransferSession[]) => void> = [];

  constructor() {
    this.initHeartbeat();
  }

  private initHeartbeat() {
    setInterval(() => {
      let updated = false;
      this.peers = this.peers.map(p => {
        if (p.status === 'CONNECTED' || p.status === 'TRANSFERRING') {
          const delta = (Math.random() * 4 - 2);
          const newRssi = Math.min(-25, Math.max(-85, Math.round(p.rssiSignalStrength + delta)));
          if (newRssi !== p.rssiSignalStrength) {
            updated = true;
            return { ...p, rssiSignalStrength: newRssi };
          }
        }
        return p;
      });
      if (updated) {
        this.notifyPeerListeners();
      }
    }, 8000);
  }

  public getPeers(): NearbyPeerDevice[] {
    return [...this.peers];
  }

  public getSessions(): NearbyTransferSession[] {
    return [...this.sessions];
  }

  public subscribePeers(listener: (peers: NearbyPeerDevice[]) => void): () => void {
    this.peerListeners.push(listener);
    listener(this.getPeers());
    return () => {
      this.peerListeners = this.peerListeners.filter(l => l !== listener);
    };
  }

  public subscribeSessions(listener: (sessions: NearbyTransferSession[]) => void): () => void {
    this.sessionListeners.push(listener);
    listener(this.getSessions());
    return () => {
      this.sessionListeners = this.sessionListeners.filter(l => l !== listener);
    };
  }

  private notifyPeerListeners() {
    const data = this.getPeers();
    this.peerListeners.forEach(l => l(data));
  }

  private notifySessionListeners() {
    const data = this.getSessions();
    this.sessionListeners.forEach(l => l(data));
  }

  public async scanRadar(durationMs: number = 1800): Promise<NearbyPeerDevice[]> {
    this.isScanning = true;
    await new Promise(r => setTimeout(r, durationMs));
    this.isScanning = false;

    const existingA06 = this.peers.find(p => p.id === 'peer-samsung-a06');
    if (!existingA06) {
      this.peers.push({
        id: 'peer-samsung-a06',
        deviceName: 'Samsung Galaxy A06 (SM-A065M Gateway)',
        deviceType: 'ANDROID_PHONE',
        ipAddress: '100.96.218.12 (Tailscale ADB)',
        rssiSignalStrength: -38,
        isPaired: true,
        sharedAppsCount: 24,
        status: 'CONNECTED',
        activeTransferSpeedKbps: 18400
      });
    }

    this.notifyPeerListeners();
    return this.getPeers();
  }

  public generatePairingToken(localDeviceName: string = 'Civer Host (ASUS Zephyrus)'): P2pPairingToken {
    const now = Date.now();
    const token = `P2P-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${now.toString(36).toUpperCase()}`;
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const fingerprint = 'SHA256:4A:8B:19:FC:E3:78:B2:91:04:1E:5A:6D:FE:39:10:BC:88:94:12:00';
    
    const qrPayload = JSON.stringify({
      protocol: 'civer-p2p-webrtc-v1',
      token,
      deviceName: localDeviceName,
      fingerprint,
      pin,
      signalUrl: 'wss://appstore.civer.cloud/p2p-signal',
      expires: now + 600000
    });

    return {
      token,
      deviceId: 'host-asus-zephyrus',
      deviceName: localDeviceName,
      publicKeyFingerprint: fingerprint,
      pairingPin: pin,
      expiresAt: new Date(now + 600000).toLocaleTimeString(),
      qrPayload
    };
  }

  public sliceApkIntoChunks(totalSizeMb: number, chunkSizeKb: number = 64): P2pBinaryChunk[] {
    const totalBytes = Math.round(totalSizeMb * 1024 * 1024);
    const chunkSizeBytes = chunkSizeKb * 1024;
    const totalChunks = Math.ceil(totalBytes / chunkSizeBytes);
    const chunks: P2pBinaryChunk[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const byteOffset = i * chunkSizeBytes;
      const thisChunkSize = Math.min(chunkSizeBytes, totalBytes - byteOffset);
      const fakeChunkSignature = `CHUNK_${i}_OF_${totalChunks}_OFFSET_${byteOffset}_SIZE_${thisChunkSize}`;
      chunks.push({
        chunkIndex: i,
        totalChunks,
        byteOffset,
        chunkSize: thisChunkSize,
        crc32: calculateCrc32(fakeChunkSignature)
      });
    }

    return chunks;
  }

  public async startTransferSession(
    peer: NearbyPeerDevice,
    app: { id: string; name: string; packageId: string; sizeMb: number; sha256: string },
    onProgress?: (progress: P2pTransferProgressEvent) => void
  ): Promise<NearbyTransferSession> {
    const sessionId = `p2p-tx-${Date.now()}`;
    const chunks = this.sliceApkIntoChunks(app.sizeMb, 64);
    const totalChunks = chunks.length;
    const totalBytes = Math.round(app.sizeMb * 1024 * 1024);

    const session: NearbyTransferSession = {
      sessionId,
      peerId: peer.id,
      peerName: peer.deviceName,
      direction: 'SEND',
      appId: app.id,
      appName: app.name,
      packageId: app.packageId,
      apkSizeMb: app.sizeMb,
      progressPercent: 0,
      transferSpeedMbps: 0,
      status: 'TRANSFERRING',
      sha256VerificationHash: app.sha256,
      startedAt: new Date().toLocaleTimeString()
    };

    this.sessions.unshift(session);
    this.notifySessionListeners();

    this.peers = this.peers.map(p => p.id === peer.id ? { ...p, status: 'TRANSFERRING' } : p);
    this.notifyPeerListeners();

    const steps = 20;
    const intervalMs = 100;

    for (let step = 1; step <= steps; step++) {
      await new Promise(r => setTimeout(r, intervalMs));
      const progress = Math.round((step / steps) * 100);
      const currentChunk = Math.round((step / steps) * totalChunks);
      const bytesTransferred = Math.round((step / steps) * totalBytes);
      const speedMbps = Number((38.5 + Math.random() * 12.2).toFixed(1));
      const remainingSeconds = Math.max(0, Number(((steps - step) * (intervalMs / 1000)).toFixed(1)));

      session.progressPercent = progress;
      session.transferSpeedMbps = speedMbps;

      if (progress >= 100) {
        session.status = 'VERIFYING_HASH';
      }

      this.notifySessionListeners();

      if (onProgress) {
        onProgress({
          sessionId,
          chunkIndex: currentChunk,
          totalChunks,
          bytesTransferred,
          totalBytes,
          progressPercent: progress,
          speedMbps,
          status: session.status,
          estimatedSecondsRemaining: remainingSeconds
        });
      }
    }

    await new Promise(r => setTimeout(r, 400));
    session.status = 'COMPLETED';
    session.transferSpeedMbps = 46.2;
    this.notifySessionListeners();

    this.peers = this.peers.map(p => p.id === peer.id ? { ...p, status: 'CONNECTED' } : p);
    this.notifyPeerListeners();

    return session;
  }
}

export const nearbyP2pTransferMeshService = new NearbyP2pTransferMeshService();
