export type CiverEventType = 
  | 'CATALOG_UPDATED' 
  | 'BUILD_QUEUED' 
  | 'BUILD_PROGRESS' 
  | 'BUILD_COMPLETED' 
  | 'BUILD_FAILED' 
  | 'FAULT_RECORDED'
  | 'HEURISTIC_ANALYSIS_COMPLETED';

export interface CiverEvent<T = any> {
  id: string;
  type: CiverEventType;
  timestamp: number;
  payload: T;
}

type EventCallback = (event: CiverEvent) => void;

class CiverWebSocketEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private eventHistory: CiverEvent[] = [];
  private isConnected: boolean = true;

  constructor() {
    // Initial connection heartbeat simulation
    setInterval(() => {
      this.emit('FAULT_RECORDED', {
        heartbeat: true,
        healthyRunners: 4,
        timestamp: Date.now()
      });
    }, 15000);
  }

  public subscribe(eventType: CiverEventType | '*', callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public emit<T = any>(type: CiverEventType, payload: T): CiverEvent<T> {
    const event: CiverEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: Date.now(),
      payload
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 100) {
      this.eventHistory.pop();
    }

    // Notify specific type listeners
    this.listeners.get(type)?.forEach(cb => {
      try { cb(event); } catch (e) { console.error(e); }
    });

    // Notify wildcard listeners
    this.listeners.get('*')?.forEach(cb => {
      try { cb(event); } catch (e) { console.error(e); }
    });

    return event;
  }

  public getHistory(): CiverEvent[] {
    return [...this.eventHistory];
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      activeSubscriptions: Array.from(this.listeners.keys()).length,
      historyCount: this.eventHistory.length
    };
  }
}

export const civerWebSocketBus = new CiverWebSocketEventBus();
