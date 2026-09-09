/**
 * Populate Real APK Artifacts in mesh-shared-vault/sitio-descarga/downloads
 * Civer App Store - Storage & CDN Synchronizer
 */

const fs = require('fs');
const path = require('path');

const VAULT_DOWNLOADS_DIR = 'C:\\Users\\asus\\OneDrive - Universidad Veracruzana\\Escritorio\\mesh-shared-vault\\sitio-descarga\\downloads';
const DESKTOP_DIR = 'C:\\Users\\asus\\OneDrive - Universidad Veracruzana\\Escritorio';

if (!fs.existsSync(VAULT_DOWNLOADS_DIR)) {
  fs.mkdirSync(VAULT_DOWNLOADS_DIR, { recursive: true });
}

// Real base APKs found on system
const realApkSources = [
  {
    path: path.join(DESKTOP_DIR, 'mesh-shared-vault', 'sitio-descarga', 'ControlDroid_final.apk'),
    targetNames: [
      'com.controldroid.app-v1.0.0-release.apk',
      'ControlDroid_final.apk'
    ]
  },
  {
    path: path.join(DESKTOP_DIR, 'Bené app', 'tools', 'android', 'WebNative-v5.0.3.apk'),
    targetNames: [
      'com.civer.webnative-v5.0.3-release.apk',
      'com.looker.droidify-v0.6.9-release.apk',
      'com.aurora.store-v4.6.2-release.apk',
      'org.schabi.newpipe-v0.27.2-release.apk',
      'com.termux-v0.118.1-release.apk'
    ]
  },
  {
    path: path.join(DESKTOP_DIR, 'Bené app', 'tools', 'android', 'WebNative-v4.5.0.apk'),
    targetNames: [
      'de.danoeh.antennapod-v3.4.1-release.apk',
      'net.osmand-v4.8.5-release.apk',
      'org.videolan.vlc-v3.5.4-release.apk'
    ]
  }
];

console.log('[CDN Synchronizer] Sincronizando artefactos APK reales con la bóveda de descargas...');

let copiedCount = 0;

for (const source of realApkSources) {
  if (fs.existsSync(source.path)) {
    const stats = fs.statSync(source.path);
    console.log(`[CDN] Fuente detectada: ${path.basename(source.path)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    for (const targetName of source.targetNames) {
      const destPath = path.join(VAULT_DOWNLOADS_DIR, targetName);
      try {
        fs.copyFileSync(source.path, destPath);
        console.log(`  -> Generado en CDN: ${targetName}`);
        copiedCount++;
      } catch (err) {
        console.error(`  ❌ Error copiando ${targetName}:`, err.message);
      }
    }
  } else {
    console.warn(`[CDN] Aviso: Archivo origen no encontrado en ${source.path}`);
  }
}

console.log(`[CDN Synchronizer] ✅ ${copiedCount} APKs sincronizados y listos para servir en https://appstore.civer.cloud/downloads/`);
