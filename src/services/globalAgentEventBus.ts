/**
 * GlobalAgentEventBus
 *
 * Real-time event broadcasting mechanism for AI agents and system components.
 * Supports WebSocket connection with automatic simulation fallback and
 * broadcast channel synchronization across browser contexts.
 */

export type AgentEventType =
  | 'BUILD_COMPLETED'
  | 'BUILD_QUEUED'
  | 'BUILD_FAILED'
  | 'REPO_SYNC_STATUS'
  | 'USER_STATE_CHANGED'
  | 'SECURITY_AUDIT_TRIGGERED'
  | 'PATCH_DEPLOYED'
  | 'STORE_MATRIX_UPDATED'
  | 'MCP_TOOL_INVOKED'
  | 'CONTEXT_UPDATED'
  | 'AGENT_TASK_ASSIGNED';

export interface AgentEventMessage<T = any> {
  id: string;
  type: AgentEventType;
  source: string;
  timestamp: number;
  payload: T;
  version: string;
}

export type AgentEventListener<T = any> = (event: AgentEventMessage<T>) => void;
export type AgentEvent<T = any> = AgentEventMessage<T>;

class GlobalAgentEventBusService {
  private listeners: Map<AgentEventType | '*', Set<AgentEventListener>> = new Map();
  private history: AgentEventMessage[] = [];
  private readonly MAX_HISTORY = 200;
  private ws: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private isConnected: boolean = false;
  private reconnectTimer: any = null;

  constructor() {
    this.initBroadcastChannel();
    this.initWebSocketConnection();
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('civer_agent_event_bus_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type) {
            this.dispatchLocal(event.data, false);
          }
        };
      }
    } catch (e) {
      console.warn('[GlobalAgentEventBus] BroadcastChannel not supported:', e);
    }
  }

  private initWebSocketConnection() {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/agent-bus`;

      // Mock WebSocket or actual server endpoint
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[GlobalAgentEventBus] WebSocket connection established.');
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.dispatchLocal(parsed, false);
        } catch (err) {
          console.warn('[GlobalAgentEventBus] Failed to parse incoming WS event:', err);
        }
      };

      this.ws.onerror = () => {
        // Fallback gracefully without throwing
        this.isConnected = false;
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        // Periodic retry
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.initWebSocketConnection();
        }, 15000);
      };
    } catch {
      // In sandbox preview where backend WS might not be running on custom port
      this.isConnected = false;
    }
  }

  /**
   * Broadcast an event to all subscribers, BroadcastChannel, and WebSocket
   */
  public broadcast<T = any>(type: AgentEventType, payload: T, source: string = 'client-orchestrator'): AgentEventMessage<T> {
    const event: AgentEventMessage<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      source,
      timestamp: Date.now(),
      payload,
      version: '1.0.0'
    };

    // Store in history
    this.history.unshift(event);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.pop();
    }

    // Dispatch locally
    this.dispatchLocal(event, true);

    return event;
  }

  private dispatchLocal(event: AgentEventMessage, propagateExternal: boolean = true) {
    // Notify specific type listeners
    const specificListeners = this.listeners.get(event.type);
    if (specificListeners) {
      specificListeners.forEach((fn) => {
        try {
          fn(event);
        } catch (err) {
          console.error('[GlobalAgentEventBus] Listener error:', err);
        }
      });
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((fn) => {
        try {
          fn(event);
        } catch (err) {
          console.error('[GlobalAgentEventBus] Wildcard listener error:', err);
        }
      });
    }

    // Propagate to BroadcastChannel and WebSocket if local dispatch
    if (propagateExternal) {
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage(event);
        } catch (e) {
          console.warn('[GlobalAgentEventBus] BroadcastChannel post error:', e);
        }
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(event));
        } catch (e) {
          console.warn('[GlobalAgentEventBus] WS send error:', e);
        }
      }
    }
  }

  /**
   * Subscribe to specific event types or '*' for all
   */
  public subscribe<T = any>(type: AgentEventType | '*', listener: AgentEventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener as any);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(listener as any);
        if (set.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  /**
   * Get the event history
   */
  public getHistory(): AgentEventMessage[] {
    return [...this.history];
  }

  /**
   * Get connection status
   */
  public getStatus() {
    return {
      isConnected: this.isConnected,
      listenersCount: Array.from(this.listeners.values()).reduce((acc, set) => acc + set.size, 0),
      historyLength: this.history.length,
      hasBroadcastChannel: !!this.broadcastChannel
    };
  }

  /**
   * Clear in-memory history
   */
  public clearHistory() {
    this.history = [];
  }
}

export const globalAgentEventBus = new GlobalAgentEventBusService();
