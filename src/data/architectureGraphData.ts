import { ArchitectureNode, SettingsAuditLogItem } from '../types';

export const SYSTEM_ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'node-ui-playstore',
    label: 'Civer App Store Frontend (PlayStoreView)',
    category: 'FRONTEND',
    status: 'PRODUCTION',
    connections: ['node-fdroid-index', 'node-dex-decompiler', 'node-nearby-p2p'],
    metrics: { latencyMs: 12, testCoverage: 96, linesOfCode: 1060 }
  },
  {
    id: 'node-workspace-jira',
    label: 'Civer Dev Workspace (Jira/Obsidian/Slack)',
    category: 'FRONTEND',
    status: 'PRODUCTION',
    connections: ['node-git-diff-patch', 'node-architecture-ledger'],
    metrics: { latencyMs: 16, testCoverage: 94, linesOfCode: 720 }
  },
  {
    id: 'node-ci-compiler',
    label: 'GitHub Actions CI Cloud Engine',
    category: 'CI_CD',
    status: 'PRODUCTION',
    connections: ['node-keystore-vault', 'node-git-diff-patch', 'node-dex-decompiler'],
    metrics: { latencyMs: 240, testCoverage: 98, linesOfCode: 430 }
  },
  {
    id: 'node-keystore-vault',
    label: 'Bóveda Criptográfica (V1-V4 + Ed25519)',
    category: 'SECURITY',
    status: 'PRODUCTION',
    connections: ['node-ci-compiler', 'node-anti-tampering'],
    metrics: { latencyMs: 8, testCoverage: 99, linesOfCode: 380 }
  },
  {
    id: 'node-dex-decompiler',
    label: 'Motor WebAssembly DEX/Smali Decompiler',
    category: 'CI_CD',
    status: 'PRODUCTION',
    connections: ['node-anti-tampering', 'node-runtime-sandbox'],
    metrics: { latencyMs: 45, testCoverage: 92, linesOfCode: 520 }
  },
  {
    id: 'node-anti-tampering',
    label: 'Auditor Anti-Tampering & CRL Certs',
    category: 'SECURITY',
    status: 'PRODUCTION',
    connections: ['node-runtime-sandbox', 'node-fdroid-index'],
    metrics: { latencyMs: 22, testCoverage: 95, linesOfCode: 340 }
  },
  {
    id: 'node-runtime-sandbox',
    label: 'Runtime Sandbox & Permission Analyzer',
    category: 'SECURITY',
    status: 'PRODUCTION',
    connections: ['node-shizuku-binder'],
    metrics: { latencyMs: 14, testCoverage: 91, linesOfCode: 410 }
  },
  {
    id: 'node-nearby-p2p',
    label: 'P2P Mesh & WebRTC Nearby Transfer',
    category: 'P2P_MESH',
    status: 'PRODUCTION',
    connections: ['node-ui-playstore', 'node-anti-tampering'],
    metrics: { latencyMs: 18, testCoverage: 89, linesOfCode: 460 }
  },
  {
    id: 'node-shizuku-binder',
    label: 'Shizuku Privileged Binder Bridge',
    category: 'KERNEL',
    status: 'PRODUCTION',
    connections: ['node-ui-playstore'],
    metrics: { latencyMs: 6, testCoverage: 97, linesOfCode: 310 }
  },
  {
    id: 'node-architecture-ledger',
    label: 'Registro de Cambios & Audit Trail Ledger',
    category: 'STORAGE',
    status: 'PRODUCTION',
    connections: ['node-workspace-jira', 'node-design-studio'],
    metrics: { latencyMs: 5, testCoverage: 100, linesOfCode: 650 }
  },
  {
    id: 'node-design-studio',
    label: 'Theme Studio & Monet Palette Engine',
    category: 'FRONTEND',
    status: 'PRODUCTION',
    connections: ['node-ui-playstore', 'node-workspace-jira'],
    metrics: { latencyMs: 10, testCoverage: 96, linesOfCode: 480 }
  }
];

export const SAMPLE_SETTINGS_AUDIT_LOGS: SettingsAuditLogItem[] = [
  {
    id: 'audit-001',
    timestamp: '2026-08-31 04:40:12',
    actor: 'Usuario (nubeplay7@gmail.com)',
    category: 'FEATURE_FLAG',
    changeSummary: 'Activación del Preset FULL_POWER_DEV (16 Feature Flags simultáneos)',
    previousValue: 'Preset CUSTOM (12 flags)',
    newValue: 'Preset FULL_POWER_DEV (16 flags activos)'
  },
  {
    id: 'audit-002',
    timestamp: '2026-08-31 04:35:00',
    actor: 'Sistema Automatizado de Paletas',
    category: 'DESIGN',
    changeSummary: 'Aplicación de Paleta Dark Titanium con Densidad Equilibrada y Radio Suave (12px)',
    previousValue: 'Default Slate Theme',
    newValue: 'dark_titanium + BALANCED + MODERN_12PX'
  },
  {
    id: 'audit-003',
    timestamp: '2026-08-31 04:15:22',
    actor: 'Usuario (nubeplay7@gmail.com)',
    category: 'KEYSTORE',
    changeSummary: 'Generación de certificado RSA-4096 con esquema v1 + v2 + v3 + v4',
    previousValue: 'Sin certificado activo',
    newValue: 'Certificado [Civer App Store Release Key 2026] activo en bóveda'
  }
];
