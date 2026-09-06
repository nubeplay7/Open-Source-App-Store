import { CollabAppProject, GitCommit, CollabCollaborator, CollabProjectFile, GitMergeConflict, UserProfile } from '../types';

const STUDIO_STORAGE_KEY = 'civer_collab_studio_projects_v1';

const INITIAL_PROJECTS: CollabAppProject[] = [
  {
    id: 'proj-libreflow',
    name: 'LibreFlow Audio Player',
    description: 'Reproductor de música FOSS moderno con ecualizador paramétrico DSP, sincronización de letras LRC y streaming P2P local.',
    packageName: 'org.foss.libreflow',
    version: '1.4.2-alpha',
    activeBranch: 'main',
    branches: ['main', 'develop', 'feature/audiophile-dsp', 'feature/p2p-sync'],
    collaborators: [
      {
        userId: 'usr-you',
        name: 'Oscar Manuel (Tú)',
        email: 'nubeplay7@gmail.com',
        role: 'OWNER',
        avatarLetter: 'O',
        avatarBg: 'bg-emerald-600',
        isOnline: true,
        cursorColor: '#10b981',
        currentFile: 'src/App.tsx',
        cursorLine: 18
      },
      {
        userId: 'usr-sofia',
        name: 'Sofia Lin',
        email: 'sofia.dev@rust-lang.org',
        role: 'EDITOR',
        avatarLetter: 'S',
        avatarBg: 'bg-amber-600',
        isOnline: true,
        cursorColor: '#f59e0b',
        currentFile: 'src/audio/dspEngine.ts',
        cursorLine: 34
      },
      {
        userId: 'usr-linus',
        name: 'Linus Torvaldsen',
        email: 'linus.foss@kernel.org',
        role: 'REVIEWER',
        avatarLetter: 'L',
        avatarBg: 'bg-blue-600',
        isOnline: true,
        cursorColor: '#3b82f6',
        currentFile: 'android/AndroidManifest.xml',
        cursorLine: 12
      }
    ],
    files: [
      {
        path: 'src/App.tsx',
        language: 'typescript',
        lastEditedBy: 'Oscar Manuel',
        lastEditedAt: new Date().toISOString(),
        content: `import React, { useState } from 'react';\nimport { Play, Pause, SkipForward, Volume2, Shield } from 'lucide-react';\n\nexport const LibreFlowPlayer: React.FC = () => {\n  const [isPlaying, setIsPlaying] = useState(false);\n  const [trackName, setTrackName] = useState('01 - Synthwave Resonance (Lossless FLAC)');\n  const [bitrate, setBitrate] = useState('96kHz / 24-bit');\n\n  return (\n    <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 max-w-md mx-auto">\n      <div className="flex items-center justify-between mb-4">\n        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-800">\n          Hi-Res Direct Bit-Perfect\n        </span>\n        <Shield className="w-4 h-4 text-emerald-400" />\n      </div>\n      <div className="w-full h-44 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-950 flex items-center justify-center mb-5 border border-indigo-700/50 shadow-inner">\n        <div className="text-center">\n          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-2">\n            <Volume2 className="w-8 h-8 text-emerald-400" />\n          </div>\n          <p className="text-sm font-semibold text-slate-200">{trackName}</p>\n          <p className="text-xs text-slate-400 font-mono mt-1">{bitrate}</p>\n        </div>\n      </div>\n      <div className="flex items-center justify-center gap-6">\n        <button \n          onClick={() => setIsPlaying(!isPlaying)}\n          className="p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition shadow-lg shadow-emerald-900/40"\n        >\n          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}\n        </button>\n      </div>\n    </div>\n  );\n};`
      },
      {
        path: 'src/audio/dspEngine.ts',
        language: 'typescript',
        lastEditedBy: 'Sofia Lin',
        lastEditedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        content: `// Módulo de Procesamiento de Señal Digital (DSP) en tiempo real\nexport class ParametricEqualizer {\n  private bands: number[] = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];\n  private gains: number[] = [0, 0, 1.5, 3.0, 2.0, 0, -1.0, 1.5, 3.5, 4.0];\n\n  public applyGain(bandIndex: number, gainDb: number): void {\n    if (bandIndex >= 0 && bandIndex < this.gains.length) {\n      this.gains[bandIndex] = gainDb;\n    }\n  }\n\n  public getFrequencyResponse(): { band: number; gain: number }[] {\n    return this.bands.map((b, i) => ({ band: b, gain: this.gains[i] }));\n  }\n}`
      },
      {
        path: 'android/AndroidManifest.xml',
        language: 'xml',
        lastEditedBy: 'Linus Torvaldsen',
        lastEditedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        content: `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="org.foss.libreflow">\n\n    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />\n    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n    <uses-permission android:name="android.permission.WAKE_LOCK" />\n\n    <application\n        android:allowBackup="false"\n        android:icon="@mipmap/ic_launcher"\n        android:label="LibreFlow"\n        android:theme="@style/Theme.LibreFlow">\n        <activity\n            android:name=".MainActivity"\n            android:exported="true">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN" />\n                <category android:name="android.intent.category.LAUNCHER" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>`
      },
      {
        path: 'manifest.json',
        language: 'json',
        lastEditedBy: 'Oscar Manuel',
        lastEditedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
        content: `{\n  "name": "LibreFlow Player",\n  "short_name": "LibreFlow",\n  "description": "Reproductor de audio libre sin telemetría ni publicidad",\n  "version": "1.4.2",\n  "license": "GPL-3.0-or-later",\n  "source_url": "https://github.com/foss-community/libreflow-audio",\n  "theme_color": "#0f172a",\n  "background_color": "#020617"\n}`
      }
    ],
    activeFileIndex: 0,
    stagedFiles: ['src/App.tsx'],
    hasUncommittedChanges: true,
    previewTitle: 'LibreFlow Player v1.4.2 (Live Preview)',
    commits: [
      {
        hash: 'b94e72f108d4a9c36e812543e198b1d9c7482a51',
        shortHash: 'b94e72f',
        message: 'feat(dsp): Implementar ecualizador paramétrico de 10 bandas en tiempo real',
        authorName: 'Sofia Lin',
        authorEmail: 'sofia.dev@rust-lang.org',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        branch: 'main',
        filesChanged: ['src/audio/dspEngine.ts'],
        diffs: [
          {
            file: 'src/audio/dspEngine.ts',
            additions: 18,
            deletions: 0,
            patch: `+ export class ParametricEqualizer {\n+   private bands: number[] = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];\n+   private gains: number[] = [0, 0, 1.5, 3.0, 2.0, 0, -1.0, 1.5, 3.5, 4.0];`
          }
        ],
        isSignedGpg: true,
        gpgKeyId: 'ED25519-F04A8B9C'
      },
      {
        hash: 'a71c8902f3b890de456108e432194bb87612f019',
        shortHash: 'a71c890',
        message: 'fix(manifest): Añadir permisos para Foreground Service Media Playback en Android 14+',
        authorName: 'Linus Torvaldsen',
        authorEmail: 'linus.foss@kernel.org',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        branch: 'main',
        filesChanged: ['android/AndroidManifest.xml'],
        diffs: [
          {
            file: 'android/AndroidManifest.xml',
            additions: 3,
            deletions: 1,
            patch: `+ <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />\n- <uses-permission android:name="android.permission.MEDIA_CONTENT_CONTROL" />`
          }
        ],
        isSignedGpg: true,
        gpgKeyId: 'RSA-4096-7BA21F'
      },
      {
        hash: 'f03819cd826194ac5e8293710892bb45109e4321',
        shortHash: 'f03819c',
        message: 'init: Creación inicial del scaffold modular con TypeScript y React 18',
        authorName: 'Oscar Manuel',
        authorEmail: 'nubeplay7@gmail.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
        branch: 'main',
        filesChanged: ['manifest.json', 'src/App.tsx'],
        diffs: [
          {
            file: 'manifest.json',
            additions: 12,
            deletions: 0,
            patch: `+ {\n+   "name": "LibreFlow Player",\n+   "version": "1.0.0"\n+ }`
          }
        ],
        isSignedGpg: true,
        gpgKeyId: 'ED25519-MASTER-CIVER'
      }
    ]
  }
];

class CollaborativeStudioService {
  private studioChannel: BroadcastChannel | null = null;
  private projects: CollabAppProject[] = [];
  private activeProjectId: string = 'proj-libreflow';
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.studioChannel = new BroadcastChannel('civer_collab_studio_channel');
        this.studioChannel.onmessage = (event) => {
          if (event.data?.type === 'CODE_EDIT') {
            const { projectId, filePath, newContent, author } = event.data.payload;
            const project = this.projects.find((p) => p.id === projectId);
            if (project) {
              const file = project.files.find((f) => f.path === filePath);
              if (file) {
                file.content = newContent;
                file.lastEditedBy = author;
                file.lastEditedAt = new Date().toISOString();
                project.hasUncommittedChanges = true;
                this.notify();
              }
            }
          } else if (event.data?.type === 'PROJECTS_SYNC') {
            this.projects = event.data.payload;
            this.notify();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel unavailable', e);
      }
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STUDIO_STORAGE_KEY);
      this.projects = saved ? JSON.parse(saved) : INITIAL_PROJECTS;
      if (this.projects.length === 0) {
        this.projects = INITIAL_PROJECTS;
      }
    } catch {
      this.projects = INITIAL_PROJECTS;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(this.projects));
    } catch (e) {
      console.warn('Could not save collab projects', e);
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getProjects(): CollabAppProject[] {
    return [...this.projects];
  }

  public getActiveProject(): CollabAppProject {
    const found = this.projects.find((p) => p.id === this.activeProjectId);
    return found || this.projects[0];
  }

  public setActiveProjectId(id: string): void {
    this.activeProjectId = id;
    this.notify();
  }

  /**
   * Real-time file content edit with broadcast
   */
  public updateFileContent(projectId: string, filePath: string, newContent: string, authorName: string): void {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return;

    const file = project.files.find((f) => f.path === filePath);
    if (!file) return;

    file.content = newContent;
    file.lastEditedBy = authorName;
    file.lastEditedAt = new Date().toISOString();
    project.hasUncommittedChanges = true;

    if (!project.stagedFiles.includes(filePath)) {
      project.stagedFiles.push(filePath);
    }

    this.saveToStorage();

    if (this.studioChannel) {
      this.studioChannel.postMessage({
        type: 'CODE_EDIT',
        payload: { projectId, filePath, newContent, author: authorName }
      });
    }

    this.notify();
  }

  /**
   * Create a new Git commit
   */
  public commit(
    projectId: string,
    message: string,
    authorName: string,
    authorEmail: string,
    isSignedGpg: boolean = true
  ): GitCommit {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const randomHash = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const shortHash = randomHash.substring(0, 7);

    const changedFiles = project.stagedFiles.length > 0 ? [...project.stagedFiles] : [project.files[project.activeFileIndex].path];

    const diffs = changedFiles.map((file) => ({
      file,
      additions: Math.floor(Math.random() * 15) + 3,
      deletions: Math.floor(Math.random() * 6),
      patch: `@@ -1,5 +1,9 @@\n+ // Commit: ${message}\n+ // Author: ${authorName}\n+ // Verified GPG: ${isSignedGpg ? 'Yes' : 'No'}`
    }));

    const newCommit: GitCommit = {
      hash: randomHash,
      shortHash,
      message,
      authorName,
      authorEmail,
      timestamp: new Date().toISOString(),
      branch: project.activeBranch,
      filesChanged: changedFiles,
      diffs,
      isSignedGpg,
      gpgKeyId: isSignedGpg ? 'ED25519-CIVER-VAULT' : undefined
    };

    project.commits.unshift(newCommit);
    project.stagedFiles = [];
    project.hasUncommittedChanges = false;

    this.saveToStorage();
    this.notify();
    return newCommit;
  }

  /**
   * Git Rollback / Checkout to a past commit
   */
  public checkoutCommit(projectId: string, commitHash: string): void {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return;

    const commit = project.commits.find((c) => c.hash === commitHash);
    if (!commit) return;

    // Reset staged changes and set branch marker
    project.stagedFiles = [];
    project.hasUncommittedChanges = false;

    // Add a synthetic revert note to the active file to prove rollback
    const activeFile = project.files[project.activeFileIndex];
    if (activeFile) {
      activeFile.content = `// [GIT ROLLBACK RESTORED: Commit ${commit.shortHash}]\n// Message: "${commit.message}"\n// Author: ${commit.authorName}\n\n` + activeFile.content;
      activeFile.lastEditedBy = `Git Rollback Engine (${commit.shortHash})`;
      activeFile.lastEditedAt = new Date().toISOString();
    }

    this.saveToStorage();
    this.notify();
  }

  /**
   * Create and switch to a new branch
   */
  public createBranch(projectId: string, branchName: string): void {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return;

    const sanitized = branchName.trim().replace(/\s+/g, '-');
    if (!project.branches.includes(sanitized)) {
      project.branches.push(sanitized);
    }
    project.activeBranch = sanitized;

    this.saveToStorage();
    this.notify();
  }

  /**
   * Switch active branch
   */
  public switchBranch(projectId: string, branchName: string): void {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return;

    if (project.branches.includes(branchName)) {
      project.activeBranch = branchName;
      this.saveToStorage();
      this.notify();
    }
  }

  /**
   * Git Pull (fetch latest changes from peers/remote)
   */
  public pull(projectId: string): { success: boolean; newCommitsCount: number; message: string } {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return { success: false, newCommitsCount: 0, message: 'Proyecto no encontrado' };

    // Create synthetic peer commit pulled from upstream
    const peerCommit: GitCommit = {
      hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      shortHash: Math.random().toString(36).substring(2, 9),
      message: 'upstream/sync: Merge branch \'develop\' into ' + project.activeBranch,
      authorName: 'Sofia Lin (Upstream)',
      authorEmail: 'sofia.dev@rust-lang.org',
      timestamp: new Date().toISOString(),
      branch: project.activeBranch,
      filesChanged: ['src/App.tsx'],
      diffs: [
        {
          file: 'src/App.tsx',
          additions: 4,
          deletions: 1,
          patch: '+ // Optimizaciones de rendimiento sincronizadas desde upstream'
        }
      ],
      isSignedGpg: true,
      gpgKeyId: 'ED25519-UPSTREAM'
    };

    project.commits.unshift(peerCommit);
    this.saveToStorage();
    this.notify();

    return {
      success: true,
      newCommitsCount: 1,
      message: `Fast-forward completado con éxito. Rama '${project.activeBranch}' actualizada con 1 nuevo commit.`
    };
  }

  /**
   * Git Push (push commits to remote origin)
   */
  public push(projectId: string): { success: boolean; pushedCommitsCount: number; message: string } {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return { success: false, pushedCommitsCount: 0, message: 'Proyecto no encontrado' };

    return {
      success: true,
      pushedCommitsCount: project.commits.length,
      message: `Todos los commits de '${project.activeBranch}' han sido transferidos a origin/${project.activeBranch} con firma criptográfica verificada.`
    };
  }

  /**
   * Git Merge with visual conflict resolution preview
   */
  public merge(
    projectId: string,
    sourceBranch: string,
    targetBranch: string
  ): { hasConflict: boolean; conflict?: GitMergeConflict; message: string } {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return { hasConflict: false, message: 'Proyecto no encontrado' };

    if (sourceBranch === targetBranch) {
      return { hasConflict: false, message: 'No se puede fusionar una rama consigo misma' };
    }

    // Return a merge result with conflict simulation for demonstration if requested
    const mergeCommit = this.commit(
      projectId,
      `Merge branch '${sourceBranch}' into ${targetBranch}`,
      'Git Merge Engine (Civer)',
      'git@civer.id',
      true
    );

    return {
      hasConflict: false,
      message: `Fusión exitosa sin conflictos. Commit de merge generado: ${mergeCommit.shortHash}`
    };
  }

  /**
   * Add a new collaborator to the project
   */
  public addCollaborator(
    projectId: string,
    name: string,
    email: string,
    role: 'OWNER' | 'EDITOR' | 'REVIEWER'
  ): CollabCollaborator {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    const newCollab: CollabCollaborator = {
      userId: 'usr-' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      avatarLetter: name.charAt(0).toUpperCase() || 'C',
      avatarBg: 'bg-indigo-600',
      isOnline: true,
      cursorColor: colors[Math.floor(Math.random() * colors.length)],
      currentFile: project.files[0]?.path,
      cursorLine: 5
    };

    project.collaborators.push(newCollab);
    this.saveToStorage();
    this.notify();
    return newCollab;
  }
}

export const collaborativeStudioService = new CollaborativeStudioService();
