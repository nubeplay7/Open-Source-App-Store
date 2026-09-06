import { ConnectedDevice, CrossDeviceSyncState, RemoteInstallQueueItem, AppCatalogItem, UserProfile, DeviceType } from '../types';

const FLEET_STORAGE_KEY = 'civer_device_fleet_v1';
const SYNC_STATE_KEY = 'civer_cross_device_sync_v1';

const INITIAL_DEVICES: ConnectedDevice[] = [
  {
    id: 'dev-pixel9-pro',
    name: 'Google Pixel 9 Pro',
    model: 'Pixel 9 Pro (G2Y1X)',
    deviceType: 'PHONE',
    osVersion: 'Android 15 (Vanilla Ice Cream - API 35)',
    batteryPercent: 88,
    isCharging: false,
    storageAvailableGb: 142.5,
    storageTotalGb: 256,
    isCurrentDevice: true,
    isOnline: true,
    lastSyncedAt: new Date().toISOString(),
    installedAppIds: ['store-fdroid', 'store-aurora', 'app-newpipe', 'app-bitwarden', 'app-k9mail', 'app-signal'],
    pendingRemoteInstalls: []
  },
  {
    id: 'dev-galaxy-tab-s9',
    name: 'Samsung Galaxy Tab S9 Ultra',
    model: 'SM-X910 (One UI 6.1)',
    deviceType: 'TABLET',
    osVersion: 'Android 14 (Upside Down Cake - API 34)',
    batteryPercent: 64,
    isCharging: true,
    storageAvailableGb: 310.8,
    storageTotalGb: 512,
    isCurrentDevice: false,
    isOnline: true,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    installedAppIds: ['store-fdroid', 'app-newpipe', 'app-vlc', 'app-obsidian', 'app-termux'],
    pendingRemoteInstalls: []
  },
  {
    id: 'dev-thinkpad-p16',
    name: 'Lenovo ThinkPad P16s (Linux)',
    model: 'ThinkPad P16s Gen 2 (Wayland)',
    deviceType: 'DESKTOP',
    osVersion: 'Fedora Silverblue 41 (Waydroid Subsystem)',
    batteryPercent: 95,
    isCharging: true,
    storageAvailableGb: 680.2,
    storageTotalGb: 1024,
    isCurrentDevice: false,
    isOnline: true,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    installedAppIds: ['store-fdroid', 'app-bitwarden', 'app-termux', 'app-keepassdx'],
    pendingRemoteInstalls: []
  },
  {
    id: 'dev-xiaomi-14u',
    name: 'Xiaomi 14 Ultra (HyperOS)',
    model: '24030PN60G (HyperOS 2.0 Global)',
    deviceType: 'PHONE',
    osVersion: 'Android 15 (API 35)',
    batteryPercent: 42,
    isCharging: false,
    storageAvailableGb: 284.1,
    storageTotalGb: 512,
    isCurrentDevice: false,
    isOnline: false,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    installedAppIds: ['store-aurora', 'app-newpipe', 'app-organicmaps'],
    pendingRemoteInstalls: []
  },
  {
    id: 'dev-bravia-tv',
    name: 'Sony Bravia 4K XR (Android TV)',
    model: 'XR-65A80L (Google TV UI)',
    deviceType: 'TV',
    osVersion: 'Android TV 12 (API 31)',
    batteryPercent: 100,
    isCharging: true,
    storageAvailableGb: 18.4,
    storageTotalGb: 32,
    isCurrentDevice: false,
    isOnline: true,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    installedAppIds: ['app-smarttube', 'app-vlc', 'app-kodi'],
    pendingRemoteInstalls: []
  }
];

class DeviceFleetSyncService {
  private syncChannel: BroadcastChannel | null = null;
  private listeners: ((state: CrossDeviceSyncState) => void)[] = [];
  private state: CrossDeviceSyncState;

  constructor() {
    this.state = this.loadState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.syncChannel = new BroadcastChannel('civer_device_sync_channel');
        this.syncChannel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_STATE_UPDATE') {
            this.state = event.data.payload;
            this.notifyListeners();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this iframe context', e);
      }
    }
  }

  private loadState(): CrossDeviceSyncState {
    try {
      const savedFleet = localStorage.getItem(FLEET_STORAGE_KEY);
      const savedSync = localStorage.getItem(SYNC_STATE_KEY);

      const fleet: ConnectedDevice[] = savedFleet ? JSON.parse(savedFleet) : INITIAL_DEVICES;
      const defaultSync: CrossDeviceSyncState = {
        lastSyncTimestamp: new Date().toISOString(),
        syncToken: 'SYNC-FOSS-SHA256-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        isSyncing: false,
        autoSyncEnabled: true,
        syncedItemsCount: 48,
        activeFleet: fleet,
        preferences: {
          syncInstalledApps: true,
          syncWishlist: true,
          syncCustomRepos: true,
          syncThemesAndConfig: true,
          syncPlayPoints: true
        }
      };

      if (savedSync) {
        const parsed = JSON.parse(savedSync);
        return {
          ...defaultSync,
          ...parsed,
          activeFleet: fleet
        };
      }

      return defaultSync;
    } catch {
      return {
        lastSyncTimestamp: new Date().toISOString(),
        syncToken: 'SYNC-FOSS-SHA256-INIT99',
        isSyncing: false,
        autoSyncEnabled: true,
        syncedItemsCount: 32,
        activeFleet: INITIAL_DEVICES,
        preferences: {
          syncInstalledApps: true,
          syncWishlist: true,
          syncCustomRepos: true,
          syncThemesAndConfig: true,
          syncPlayPoints: true
        }
      };
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(this.state.activeFleet));
      localStorage.setItem(SYNC_STATE_KEY, JSON.stringify({
        lastSyncTimestamp: this.state.lastSyncTimestamp,
        syncToken: this.state.syncToken,
        autoSyncEnabled: this.state.autoSyncEnabled,
        syncedItemsCount: this.state.syncedItemsCount,
        preferences: this.state.preferences
      }));

      if (this.syncChannel) {
        this.syncChannel.postMessage({
          type: 'SYNC_STATE_UPDATE',
          payload: this.state
        });
      }
    } catch (err) {
      console.warn('Could not persist device sync state', err);
    }
  }

  public getState(): CrossDeviceSyncState {
    return { ...this.state };
  }

  public subscribe(listener: (state: CrossDeviceSyncState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach((l) => l(currentState));
  }

  /**
   * Synchronizes all data (apps, wishlist, tokens, repos) across connected devices
   */
  public async performFullSync(
    userProfile: UserProfile,
    onStepUpdate?: (msg: string) => void
  ): Promise<CrossDeviceSyncState> {
    this.state.isSyncing = true;
    this.notifyListeners();

    if (onStepUpdate) onStepUpdate('Validando credenciales criptográficas y Civer ID...');
    await new Promise((r) => setTimeout(r, 450));

    if (onStepUpdate) onStepUpdate('Escaneando catálogo y bibliotecas de 5 dispositivos...');
    await new Promise((r) => setTimeout(r, 550));

    // Consolidate current device apps with userProfile
    const currentDevice = this.state.activeFleet.find((d) => d.isCurrentDevice);
    if (currentDevice) {
      const mergedApps = Array.from(new Set([...currentDevice.installedAppIds, ...userProfile.installedAppIds]));
      currentDevice.installedAppIds = mergedApps;
      currentDevice.lastSyncedAt = new Date().toISOString();
    }

    if (onStepUpdate) onStepUpdate('Resolviendo deltas de repositorios y listas de deseos...');
    await new Promise((r) => setTimeout(r, 400));

    // Update sync stats
    this.state.lastSyncTimestamp = new Date().toISOString();
    this.state.syncToken = 'SYNC-ED25519-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    this.state.isSyncing = false;
    this.state.syncedItemsCount = (userProfile.installedAppIds?.length || 0) + (userProfile.wishlist?.length || 0) + 24;

    this.saveState();
    this.notifyListeners();
    return this.getState();
  }

  /**
   * Google Play / App Store style "Instalar en más dispositivos"
   * Remotely queues an app installation on a target device
   */
  public triggerRemoteInstall(
    targetDeviceId: string,
    app: AppCatalogItem,
    onStatusChange?: (status: RemoteInstallQueueItem) => void
  ): void {
    const target = this.state.activeFleet.find((d) => d.id === targetDeviceId);
    if (!target) return;

    // Check if already installed
    if (target.installedAppIds.includes(app.id)) {
      return;
    }

    const newItem: RemoteInstallQueueItem = {
      appId: app.id,
      appName: app.name,
      packageName: app.packageName,
      requestedAt: new Date().toISOString(),
      status: 'QUEUED',
      progressPercent: 5
    };

    target.pendingRemoteInstalls = [
      newItem,
      ...target.pendingRemoteInstalls.filter((item) => item.appId !== app.id)
    ];

    this.saveState();
    this.notifyListeners();
    if (onStatusChange) onStatusChange({ ...newItem });

    // Simulate realistic remote push dispatch progression
    setTimeout(() => {
      const dev = this.state.activeFleet.find((d) => d.id === targetDeviceId);
      const pending = dev?.pendingRemoteInstalls.find((p) => p.appId === app.id);
      if (pending) {
        pending.status = 'DOWNLOADING';
        pending.progressPercent = 45;
        this.saveState();
        this.notifyListeners();
        if (onStatusChange) onStatusChange({ ...pending });
      }
    }, 1200);

    setTimeout(() => {
      const dev = this.state.activeFleet.find((d) => d.id === targetDeviceId);
      const pending = dev?.pendingRemoteInstalls.find((p) => p.appId === app.id);
      if (pending && dev) {
        pending.status = 'INSTALLED';
        pending.progressPercent = 100;
        if (!dev.installedAppIds.includes(app.id)) {
          dev.installedAppIds.push(app.id);
        }
        this.saveState();
        this.notifyListeners();
        if (onStatusChange) onStatusChange({ ...pending });
      }
    }, 3200);
  }

  /**
   * Pair a new device via OTP code or scanned QR token
   */
  public pairNewDevice(deviceName: string, model: string, type: DeviceType): ConnectedDevice {
    const newDev: ConnectedDevice = {
      id: 'dev-' + Math.random().toString(36).substring(2, 9),
      name: deviceName,
      model: model || 'Genérico Compatible',
      deviceType: type,
      osVersion: 'Android 15 (Civer Ready)',
      batteryPercent: 100,
      isCharging: false,
      storageAvailableGb: 180,
      storageTotalGb: 256,
      isCurrentDevice: false,
      isOnline: true,
      lastSyncedAt: new Date().toISOString(),
      installedAppIds: ['store-fdroid', 'app-newpipe'],
      pendingRemoteInstalls: []
    };

    this.state.activeFleet.push(newDev);
    this.saveState();
    this.notifyListeners();
    return newDev;
  }

  /**
   * Unlink / Remove a device from the account
   */
  public unlinkDevice(deviceId: string): void {
    this.state.activeFleet = this.state.activeFleet.filter((d) => d.id !== deviceId);
    this.saveState();
    this.notifyListeners();
  }

  public updatePreferences(prefs: Partial<CrossDeviceSyncState['preferences']>): void {
    this.state.preferences = {
      ...this.state.preferences,
      ...prefs
    };
    this.saveState();
    this.notifyListeners();
  }

  public toggleAutoSync(enabled: boolean): void {
    this.state.autoSyncEnabled = enabled;
    this.saveState();
    this.notifyListeners();
  }
}

export const deviceFleetSyncService = new DeviceFleetSyncService();
