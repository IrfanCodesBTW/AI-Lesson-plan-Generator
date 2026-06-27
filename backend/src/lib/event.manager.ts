import { Response } from 'express';
import { getLogger } from './logger';

interface Client {
  id: string;
  res: Response;
}

export class EventManager {
  private static instance: EventManager;
  private clients: Map<string, Client[]> = new Map(); // userId -> Client[]

  private constructor() {
    // Send periodic pings to keep connections open
    const interval = setInterval(() => {
      this.sendPingToAll();
    }, 30_000);
    // Unref if in Node environment to not prevent process exit in tests
    if (typeof interval.unref === 'function') {
      interval.unref();
    }
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  public addClient(userId: string, clientId: string, res: Response): void {
    const userClients = this.clients.get(userId) || [];
    userClients.push({ id: clientId, res });
    this.clients.set(userId, userClients);
    getLogger().info({ userId, clientId }, 'SSE client connected');
  }

  public removeClient(userId: string, clientId: string): void {
    const userClients = this.clients.get(userId) || [];
    const filtered = userClients.filter((c) => c.id !== clientId);
    if (filtered.length === 0) {
      this.clients.delete(userId);
    } else {
      this.clients.set(userId, filtered);
    }
    getLogger().info({ userId, clientId }, 'SSE client disconnected');
  }

  public broadcast(userId: string, eventType: string, data?: unknown): void {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.length === 0) return;

    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data || {})}\n\n`;
    userClients.forEach((client) => {
      try {
        client.res.write(payload);
      } catch (err) {
        getLogger().warn({ userId, clientId: client.id, err }, 'Failed to write to SSE client');
      }
    });
  }

  private sendPingToAll(): void {
    const payload = ': ping\n\n';
    this.clients.forEach((userClients) => {
      userClients.forEach((client) => {
        try {
          client.res.write(payload);
        } catch {
          // ignore
        }
      });
    });
  }
}
