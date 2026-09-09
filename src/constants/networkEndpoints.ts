/**
 * Network Endpoints & Domain Topology Configuration
 * Civer App Store - High Availability Network Infrastructure
 */

export const NETWORK_ENDPOINTS = {
  // Official Domain (Cloudflare DNS: civer.cloud)
  PRIMARY_DOMAIN: 'https://appstore.civer.cloud',
  FALLBACK_DOMAIN: 'https://civer.cloud',
  CLOUDFLARE_TUNNEL_URL: 'https://deaf-folder-estimated-circumstances.trycloudflare.com',
  LOCAL_DEV_SERVER: 'http://127.0.0.1:3000',
  VITE_DEV_SERVER: 'http://localhost:5173',

  // Nodes in Mesh
  THINKPAD_TAILSCALE_IP: '100.96.218.12',
  THINKPAD_SDK_PORT: 8080,
  HIVE_GATEWAY_PORT: 3002,

  // Telegram Distribution Bot
  TELEGRAM_BOT_USERNAME: 'EnviodeApkCompiladaBot',
  TELEGRAM_BOT_URL: 'https://t.me/EnviodeApkCompiladaBot',

  // Kaggle Cloud Engine
  KAGGLE_API_BASE: 'https://www.kaggle.com/api/v1',
  KAGGLE_KERNEL_SLUG_PREFIX: 'civer-omnibuild',

  // CDN & Storage Paths
  DOWNLOADS_PATH: '/downloads',
  API_DOWNLOADS_ENDPOINT: '/api/v1/downloads',
  OTA_MANIFEST_ENDPOINT: '/api/v1/ota/manifest.json'
};

/**
 * Generates the canonical download URL for a compiled APK binary
 * based on the official civer.cloud domain and package identifier.
 */
export function getApkCanonicalUrl(
  packageName: string, 
  version: string, 
  preferDomain: 'cloud' | 'play' | 'local' | 'tunnel' = 'cloud'
): string {
  const base = preferDomain === 'tunnel'
    ? NETWORK_ENDPOINTS.CLOUDFLARE_TUNNEL_URL
    : (preferDomain === 'cloud' || preferDomain === 'play')
      ? NETWORK_ENDPOINTS.PRIMARY_DOMAIN 
      : NETWORK_ENDPOINTS.LOCAL_DEV_SERVER;

  const sanitizedPkg = encodeURIComponent(packageName.replace(/[^a-zA-Z0-9._-]/g, ''));
  const sanitizedVer = encodeURIComponent(version.replace(/[^a-zA-Z0-9._-]/g, ''));
  return `${base}${NETWORK_ENDPOINTS.DOWNLOADS_PATH}/${sanitizedPkg}-${sanitizedVer}-release.apk`;
}

/**
 * Generates direct link to trigger bot delivery via deep linking
 */
export function getTelegramDeepLinkForApk(appId: string, buildId: string): string {
  return `${NETWORK_ENDPOINTS.TELEGRAM_BOT_URL}?start=dl_${encodeURIComponent(appId)}_${encodeURIComponent(buildId)}`;
}
