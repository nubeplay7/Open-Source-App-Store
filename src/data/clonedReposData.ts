import { ClonedAppRepo } from '../types';

export const INITIAL_CLONED_REPOS: Record<string, ClonedAppRepo> = {
  'droid-ify': {
    appId: 'droid-ify',
    appName: 'Droid-ify',
    packageName: 'com.looker.droidify',
    repoUrl: 'https://github.com/Droid-ify/client',
    branch: 'main',
    commitHash: '7f9a2c1',
    clonedAt: '2026-08-28 14:22',
    lastSyncedAt: 'Hoy, 08:15',
    localPath: '/storage/emulated/0/CiberDev/src/droid-ify',
    sizeMb: 24.8,
    filesCount: 342,
    syncStatus: 'synced',
    uncommittedChangesCount: 0,
    networkPreference: 'WIFI_ONLY'
  },
  'obtainium': {
    appId: 'obtainium',
    appName: 'Obtainium',
    packageName: 'dev.imranr.obtainium',
    repoUrl: 'https://github.com/ImranR98/Obtainium',
    branch: 'main',
    commitHash: 'e4b1088',
    clonedAt: '2026-08-29 19:40',
    lastSyncedAt: 'Hoy, 09:30',
    localPath: '/storage/emulated/0/CiberDev/src/obtainium',
    sizeMb: 31.4,
    filesCount: 489,
    syncStatus: 'synced',
    uncommittedChangesCount: 2,
    networkPreference: 'CELLULAR_AND_WIFI'
  }
};
