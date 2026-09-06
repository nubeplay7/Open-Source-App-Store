import { KeystoreEntry } from '../types';

export const INITIAL_KEYSTORES: KeystoreEntry[] = [
  {
    id: 'key-global-release',
    name: 'Llave Maestra Civer App Store (Release Master)',
    alias: 'civer-release-key',
    algorithm: 'RSA 4096-bit',
    validUntil: '2051-12-31',
    sha256Fingerprint: 'A4:9F:88:21:CD:04:77:9B:EE:12:33:45:90:AB:EF:66:31:88:99:FF:77:44:11:00:22:33:AA:BB:CC:DD:EE:FF',
    sha1Fingerprint: '3B:7D:91:EE:54:21:88:76:99:A1:00:32:11:FF:88:77:66:55:44:33',
    isGlobalDefault: true,
    assignedAppIds: ['droid-ify', 'aurora-store', 'neo-store', 'revanced-manager'],
    createdDate: '2025-01-15',
    schemeV4Supported: true
  },
  {
    id: 'key-termux-dev',
    name: 'Termux FOSS Dedicated Signing Keystore',
    alias: 'termux-build-key',
    algorithm: 'ECDSA P-256',
    validUntil: '2049-06-30',
    sha256Fingerprint: 'F8:12:9A:BC:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:01',
    sha1Fingerprint: '8A:99:22:11:55:44:33:22:11:00:AA:BB:CC:DD:EE:FF:11:22:33:44',
    isGlobalDefault: false,
    assignedAppIds: ['termux'],
    createdDate: '2025-06-20',
    schemeV4Supported: true
  },
  {
    id: 'key-obtainium-sync',
    name: 'Obtainium GitHub Continuous Key',
    alias: 'obtainium-ci-v3',
    algorithm: 'RSA 4096-bit',
    validUntil: '2050-08-15',
    sha256Fingerprint: '99:88:77:66:55:44:33:22:11:00:AA:BB:CC:DD:EE:FF:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0',
    sha1Fingerprint: '12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12:34:56:78',
    isGlobalDefault: false,
    assignedAppIds: ['obtainium'],
    createdDate: '2025-09-01',
    schemeV4Supported: true
  }
];
