import { NearbyPeerDevice, NearbyTransferSession } from '../types';

export const SAMPLE_NEARBY_PEERS: NearbyPeerDevice[] = [
  {
    id: 'peer-pixel-8-pro',
    deviceName: 'Pixel 8 Pro (GrapheneOS)',
    deviceType: 'ANDROID_PHONE',
    ipAddress: '192.168.1.145',
    rssiSignalStrength: -42,
    isPaired: true,
    sharedAppsCount: 18,
    status: 'CONNECTED',
    activeTransferSpeedKbps: 4200
  },
  {
    id: 'peer-thinkpad-arch',
    deviceName: 'ThinkPad T14 (Arch Linux Build Host)',
    deviceType: 'DESKTOP_LINUX',
    ipAddress: '192.168.1.102',
    rssiSignalStrength: -35,
    isPaired: true,
    sharedAppsCount: 45,
    status: 'CONNECTED',
    activeTransferSpeedKbps: 12800
  },
  {
    id: 'peer-galaxy-tab',
    deviceName: 'Galaxy Tab S9 (LineageOS 21)',
    deviceType: 'ANDROID_TABLET',
    ipAddress: '192.168.1.178',
    rssiSignalStrength: -68,
    isPaired: false,
    sharedAppsCount: 8,
    status: 'DISCOVERED'
  }
];

export const SAMPLE_TRANSFER_SESSIONS: NearbyTransferSession[] = [
  {
    sessionId: 'session-p2p-091',
    peerId: 'peer-pixel-8-pro',
    peerName: 'Pixel 8 Pro (GrapheneOS)',
    direction: 'SEND',
    appId: 'app-civer-app-store',
    appName: 'Civer App Store PRO',
    packageId: 'org.civerappstore.app',
    apkSizeMb: 14.8,
    progressPercent: 78,
    transferSpeedMbps: 48.5,
    status: 'TRANSFERRING',
    sha256VerificationHash: 'a9f87123bc45e67890123456789abcdef0123456789abcdef0123456789abcde',
    startedAt: '2026-08-31 04:41:20'
  }
];
