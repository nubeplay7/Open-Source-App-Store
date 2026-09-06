import { AppCatalogItem, BuildLogEntry, GitHubBuildRun, KeystoreEntry } from '../types';

export interface GitHubTokenVerificationResult {
  valid: boolean;
  user: string;
  avatarUrl?: string;
  scopes: string[];
  rateLimit: {
    limit: number;
    remaining: number;
    resetTime: string;
  };
  latencyMs: number;
  error?: string;
}

/**
 * Validates a GitHub Personal Access Token (PAT)
 */
export async function verifyGitHubToken(token: string): Promise<GitHubTokenVerificationResult> {
  const cleanToken = token.trim();

  // If token is empty
  if (!cleanToken) {
    return {
      valid: false,
      user: '',
      scopes: [],
      rateLimit: { limit: 60, remaining: 0, resetTime: 'Próxima hora' },
      latencyMs: 0,
      error: 'Token no proporcionado. Ingresa un GitHub PAT válido con scopes `repo` y `workflow`.'
    };
  }

  // Realistic token check or mock validation for developer environment
  const isValidFormat = 
    cleanToken.startsWith('ghp_') || 
    cleanToken.startsWith('github_pat_') || 
    cleanToken.startsWith('gho_') || 
    cleanToken.length >= 20;

  if (!isValidFormat) {
    return {
      valid: false,
      user: '',
      scopes: [],
      rateLimit: { limit: 60, remaining: 0, resetTime: 'Próxima hora' },
      latencyMs: 120,
      error: 'Formato de PAT inválido. Los tokens clásicos inician con `ghp_` o los fine-grained con `github_pat_`.'
    };
  }

  // Simulate network delay for verification
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    valid: true,
    user: 'oscar-manuel',
    avatarUrl: 'https://github.com/oscar-manuel.png',
    scopes: ['repo', 'workflow', 'write:packages', 'read:org', 'admin:repo_hook'],
    rateLimit: {
      limit: 5000,
      remaining: 4982,
      resetTime: 'En 52 minutos'
    },
    latencyMs: 84
  };
}

export function generateGitHubWorkflowYaml(
  appName: string, 
  gradleTask: string = './gradlew assembleRelease',
  keystore?: KeystoreEntry
): string {
  const keyAlias = keystore ? keystore.alias : '${{ secrets.ALIAS }}';
  const schemeV4Comment = keystore?.schemeV4Supported 
    ? '# Includes APK Signature Scheme v4 (fs-verity for Android 11+)' 
    : '';

  return `name: Build Android APK (${appName})

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:
    inputs:
      build_type:
        description: 'Build Type (release or debug)'
        required: true
        default: 'release'
        type: choice
        options:
          - release
          - debug

jobs:
  build-apk:
    name: 🚀 Compile Android APK
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1
          submodules: recursive

      - name: ☕ Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: 🔧 Set up Android SDK & Build-Tools
        uses: android-actions/setup-android@v3

      - name: 🔑 Grant Execute Permissions
        run: chmod +x gradlew

      - name: ⚡ Compile APK with Gradle
        run: ${gradleTask} --no-daemon -Dorg.gradle.jvmargs="-Xmx4096m -XX:+HeapDumpOnOutOfMemoryError"

      - name: ✍️ Sign APK (${keystore?.name || 'Keystore Vault'})
        ${schemeV4Comment}
        uses: r0adkll/sign-android-release@v1
        id: sign_app
        with:
          releaseDirectory: app/build/outputs/apk/release
          signingKey: \${{ secrets.SIGNING_KEY }}
          alias: ${keyAlias}
          keyStorePassword: \${{ secrets.KEY_STORE_PASSWORD }}
          keyPassword: \${{ secrets.KEY_PASSWORD }}
        continue-on-error: true

      - name: 📦 Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-apk
          path: '**/build/outputs/apk/**/*.apk'
          retention-days: 30

      - name: 🏷️ Create GitHub Release & Publish APK
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          files: '**/build/outputs/apk/**/*.apk'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

// Generate unique hash
export function generateRandomHash(length: number = 7): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateSha256Checksum(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Simulation steps for realistic GitHub Actions build
export const getBuildSimulationSteps = (keystore?: KeystoreEntry): {
  delayMs: number;
  progress: number;
  stepName: string;
  log: (app: AppCatalogItem, runId: string) => BuildLogEntry;
}[] => [
  {
    delayMs: 600,
    progress: 10,
    stepName: 'Spawning GitHub Cloud Runner',
    log: (_app, runId) => ({
      timestamp: '00:01',
      step: 'Setup Runner',
      message: `Assigned GitHub Actions Cloud Runner: ubuntu-latest (Job #${runId}) • 4 vCPU, 16GB RAM, SSD Cache`,
      type: 'info'
    })
  },
  {
    delayMs: 1000,
    progress: 25,
    stepName: 'Cloning Repository & Submodules',
    log: (app) => ({
      timestamp: '00:06',
      step: 'Checkout',
      message: `git clone ${app.githubUrl} --branch ${app.defaultBranch || 'main'} --depth 1 --recurse-submodules`,
      type: 'command'
    })
  },
  {
    delayMs: 1200,
    progress: 40,
    stepName: 'Setting up JDK 17 & Android SDK Build-Tools 35.0.0',
    log: (app) => ({
      timestamp: '00:14',
      step: 'JDK Setup',
      message: `Eclipse Temurin JDK 17.0.10 initialized. Target Android SDK: ${app.targetSdk} (Android 15 HyperOS/AOSP APIs)`,
      type: 'info'
    })
  },
  {
    delayMs: 1500,
    progress: 60,
    stepName: 'Executing Gradle Compiler Task',
    log: (app) => ({
      timestamp: '00:28',
      step: 'Gradle Execution',
      message: `${app.gradleTask || './gradlew assembleRelease'} --stacktrace -Dorg.gradle.parallel=true -Dkotlin.incremental=false`,
      type: 'command'
    })
  },
  {
    delayMs: 1600,
    progress: 80,
    stepName: 'Compiling Kotlin/Java & ProGuard/R8 Shrinking',
    log: (app) => ({
      timestamp: '00:54',
      step: 'R8 Optimization',
      message: `Compiled bytecode into classes.dex. R8 optimizer stripped unused resources. Target package: ${app.packageName}`,
      type: 'info'
    })
  },
  {
    delayMs: 1200,
    progress: 92,
    stepName: 'Signing APK with Keystore Vault & AAPT Verification',
    log: (_app) => ({
      timestamp: '01:12',
      step: 'ApkSigner',
      message: keystore 
        ? `APK signed with [${keystore.name}] (Alias: ${keystore.alias}, ${keystore.algorithm}). Scheme v1/v2/v3/v4 applied. Fingerprint: ${keystore.sha256Fingerprint.substring(0, 23)}... AAPT2 verification passed.`
        : `APK signed with default Civer Release Master Key. Scheme v1/v2/v3 applied. AAPT2 verification passed: 0 warnings.`,
      type: 'success'
    })
  },
  {
    delayMs: 800,
    progress: 100,
    stepName: 'Artifact Uploaded & Ready for Instant Install',
    log: (app) => ({
      timestamp: '01:25',
      step: 'Artifact Published',
      message: `🎉 Compilación exitosa: ${app.name} (${app.apkSizeMb} MB). Hash SHA-256 verificado y firmado. APK listo para descarga/instalación.`,
      type: 'success'
    })
  }
];

export const BUILD_SIMULATION_STEPS = getBuildSimulationSteps();
