import { RuntimeSandboxPermission, AntiTamperingAuditResult } from '../types';

export const SAMPLE_RUNTIME_PERMISSIONS: Record<string, RuntimeSandboxPermission[]> = {
  'org.civerappstore.app': [
    {
      permissionName: 'android.permission.INTERNET',
      protectionLevel: 'NORMAL',
      riskScore: 5,
      runtimeStatus: 'GRANTED',
      backgroundAccess: true,
      purposeDescription: 'Sincronización de índices F-Droid y llamadas al compilador GitHub Actions.',
      observedCallCount: 1420,
      lastAccessedTimestamp: '2026-08-31 04:42:10'
    },
    {
      permissionName: 'android.permission.REQUEST_INSTALL_PACKAGES',
      protectionLevel: 'DANGEROUS',
      riskScore: 45,
      runtimeStatus: 'GRANTED',
      backgroundAccess: false,
      purposeDescription: 'Instalación de paquetes APK aprobados por el usuario a través del SessionInstaller del sistema.',
      observedCallCount: 14,
      lastAccessedTimestamp: '2026-08-31 02:18:00'
    },
    {
      permissionName: 'moe.shizuku.manager.permission.API_V23',
      protectionLevel: 'PRIVILEGED',
      riskScore: 20,
      runtimeStatus: 'GRANTED',
      backgroundAccess: true,
      purposeDescription: 'Instalación y actualización silenciosa de paquetes sin requerir Root convencional.',
      observedCallCount: 38,
      lastAccessedTimestamp: '2026-08-31 04:30:15'
    },
    {
      permissionName: 'android.permission.NEARBY_WIFI_DEVICES',
      protectionLevel: 'NORMAL',
      riskScore: 10,
      runtimeStatus: 'PROMPTED_ON_USE',
      backgroundAccess: false,
      purposeDescription: 'Descubrimiento de pares locales para transferencia de APKs mediante Wi-Fi Direct P2P.',
      observedCallCount: 6,
      lastAccessedTimestamp: '2026-08-30 19:12:00'
    },
    {
      permissionName: 'android.permission.ACCESS_FINE_LOCATION',
      protectionLevel: 'DANGEROUS',
      riskScore: 85,
      runtimeStatus: 'DENIED',
      backgroundAccess: false,
      purposeDescription: 'Acceso a ubicación geográfica exacta (bloqueado por directiva de privacidad Civer App Store).',
      observedCallCount: 0
    }
  ]
};

SAMPLE_RUNTIME_PERMISSIONS['org.ciberstore.app'] = SAMPLE_RUNTIME_PERMISSIONS['org.civerappstore.app'];

export const SAMPLE_TAMPERING_AUDIT: Record<string, AntiTamperingAuditResult> = {
  'org.civerappstore.app': {
    packageName: 'org.civerappstore.app',
    versionName: '6.0.0-PRO',
    installedSha256: 'a9f87123bc45e67890123456789abcdef0123456789abcdef0123456789abcde',
    upstreamIndexSha256: 'a9f87123bc45e67890123456789abcdef0123456789abcdef0123456789abcde',
    isHashMatch: true,
    signatureCertIssuer: 'CN=Civer App Store Release Authority, OU=Security Engineering, O=Nubeplay FOSS, C=ES',
    signatureCertValidUntil: '2051-12-31',
    isCertificateRevoked: false,
    crlCheckStatus: 'VERIFIED_CLEAN',
    tamperRiskScore: 0,
    warnings: []
  },
  'com.aurora.store': {
    packageName: 'com.aurora.store',
    versionName: '4.6.1',
    installedSha256: 'd14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f',
    upstreamIndexSha256: 'd14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f',
    isHashMatch: true,
    signatureCertIssuer: 'CN=Rahul Patel, OU=Aurora OSS, O=Aurora Project',
    signatureCertValidUntil: '2045-06-15',
    isCertificateRevoked: false,
    crlCheckStatus: 'VERIFIED_CLEAN',
    tamperRiskScore: 2,
    warnings: ['Firma v2 + v3 válida. Algoritmo RSA-4096 verificado contra F-Droid V2 Index.']
  }
};

SAMPLE_TAMPERING_AUDIT['org.ciberstore.app'] = SAMPLE_TAMPERING_AUDIT['org.civerappstore.app'];
