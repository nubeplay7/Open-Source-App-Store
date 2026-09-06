import { AppCatalogItem, GitHubBuildRun } from '../types';

export interface PersistentBuildQueueItem {
  id: string;
  appId: string;
  appName: string;
  githubUrl: string;
  gradleTask: string;
  status: 'QUEUED' | 'RUNNING' | 'RETRYING' | 'SUCCESS' | 'FAILED';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  createdAt: number;
  updatedAt: number;
  retryCount: number;
  maxRetries: number;
  currentStepIndex: number;
  progressPercent: number;
  errorMessage?: string;
  lastRunId?: string;
  logs: string[];
}

const STORAGE_KEY = 'civer_persistent_build_queue_v1';

class PersistentCiQueueService {
  private queue: PersistentBuildQueueItem[] = [];
  private isProcessing = false;
  private listeners: ((queue: PersistentBuildQueueItem[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
      } else {
        // Initial sample queue items for immediate visual feedback
        this.queue = [
          {
            id: 'job-q-101',
            appId: 'aurora-store',
            appName: 'Aurora Store v4.6.1',
            githubUrl: 'https://github.com/whyorean/AuroraStore',
            gradleTask: './gradlew assembleRelease',
            status: 'SUCCESS',
            priority: 'HIGH',
            createdAt: Date.now() - 3600000,
            updatedAt: Date.now() - 3500000,
            retryCount: 0,
            maxRetries: 3,
            currentStepIndex: 7,
            progressPercent: 100,
            lastRunId: 'run-882194',
            logs: [
              '[00:01] Runner provisioned: ubuntu-latest (4 vCPU)',
              '[00:15] JDK 17 & Android SDK 35 configured',
              '[00:48] Task :app:assembleRelease SUCCEEDED',
              '[01:05] APK Signed with Scheme v2/v3/v4'
            ]
          }
        ];
        this.saveToStorage();
      }
    } catch {
      this.queue = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      this.notify();
    } catch (e) {
      console.warn('Storage quota warning', e);
    }
  }

  public subscribe(listener: (queue: PersistentBuildQueueItem[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.queue]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.queue]));
  }

  public getQueue(): PersistentBuildQueueItem[] {
    return [...this.queue];
  }

  public enqueueBuild(app: { id: string; name: string; githubUrl: string; gradleTask?: string }, priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL'): PersistentBuildQueueItem {
    const newItem: PersistentBuildQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      appId: app.id,
      appName: app.name,
      githubUrl: app.githubUrl,
      gradleTask: app.gradleTask || './gradlew assembleRelease',
      status: 'QUEUED',
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      currentStepIndex: 0,
      progressPercent: 0,
      logs: [`[${new Date().toLocaleTimeString()}] Encolado con prioridad ${priority}. Esperando runner disponible...`]
    };

    this.queue.unshift(newItem);
    this.saveToStorage();
    this.processNext();
    return newItem;
  }

  public retryBuild(itemId: string) {
    const item = this.queue.find(i => i.id === itemId);
    if (!item) return;

    item.status = 'QUEUED';
    item.retryCount = 0;
    item.progressPercent = 0;
    item.errorMessage = undefined;
    item.updatedAt = Date.now();
    item.logs.push(`[${new Date().toLocaleTimeString()}] Reintento manual solicitado.`);
    this.saveToStorage();
    this.processNext();
  }

  public cancelBuild(itemId: string) {
    this.queue = this.queue.filter(i => i.id !== itemId);
    this.saveToStorage();
  }

  public clearCompleted() {
    this.queue = this.queue.filter(i => i.status === 'QUEUED' || i.status === 'RUNNING' || i.status === 'RETRYING');
    this.saveToStorage();
  }

  private async processNext() {
    if (this.isProcessing) return;
    
    // Find next queued or retrying item sorted by priority
    const priorityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
    const pendingItems = this.queue.filter(i => i.status === 'QUEUED' || i.status === 'RETRYING');
    
    if (pendingItems.length === 0) return;

    pendingItems.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    const current = pendingItems[0];
    
    this.isProcessing = true;
    current.status = 'RUNNING';
    current.updatedAt = Date.now();
    current.logs.push(`[${new Date().toLocaleTimeString()}] Inicializando GitHub Runner virtual...`);
    this.saveToStorage();

    const steps = [
      { progress: 15, name: 'Clonando repositorio Git y submódulos' },
      { progress: 35, name: 'Configurando Java JDK 17 y Android SDK Build-Tools 35.0.0' },
      { progress: 60, name: 'Ejecutando Gradle Daemon: compileReleaseKotlin' },
      { progress: 85, name: 'Optimizando DEX con R8 y firmando artefactos APK v4' },
      { progress: 100, name: 'Artefacto binario generado con éxito' }
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 900));
        current.progressPercent = steps[i].progress;
        current.currentStepIndex = i + 1;
        current.updatedAt = Date.now();
        current.logs.push(`[${new Date().toLocaleTimeString()}] ${steps[i].name}`);
        this.saveToStorage();
      }

      current.status = 'SUCCESS';
      current.lastRunId = `run-${Math.floor(100000 + Math.random() * 900000)}`;
      current.logs.push(`[${new Date().toLocaleTimeString()}] ✅ Build completado exitosamente. Artefacto listo.`);
      this.saveToStorage();
    } catch (err: any) {
      if (current.retryCount < current.maxRetries) {
        current.retryCount += 1;
        current.status = 'RETRYING';
        current.errorMessage = `Error de red transitorio. Reintentando (${current.retryCount}/${current.maxRetries})...`;
        current.logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ Fallo temporal de red: ${err?.message || 'Socket timeout'}. Encolando reintento.`);
      } else {
        current.status = 'FAILED';
        current.errorMessage = 'Límite de reintentos alcanzado. Fallo en pipeline CI.';
        current.logs.push(`[${new Date().toLocaleTimeString()}] ❌ Build fallido.`);
      }
      this.saveToStorage();
    } finally {
      this.isProcessing = false;
      // Trigger subsequent jobs
      setTimeout(() => this.processNext(), 500);
    }
  }
}

export const persistentCiQueueService = new PersistentCiQueueService();
