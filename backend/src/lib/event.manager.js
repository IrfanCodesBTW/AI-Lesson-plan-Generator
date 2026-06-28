import { getLogger } from './logger.js';
export class EventManager {
  static instance;
  clients = new Map(); // userId -> Client[]
  constructor() {
    // Send periodic pings to keep connections open
    const interval = setInterval(() => {
      this.sendPingToAll();
    }, 30_000);
    // Unref if in Node environment to not prevent process exit in tests
    if (typeof interval.unref === 'function') {
      interval.unref();
    }
  }
  static getInstance() {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }
  addClient(userId, clientId, res) {
    const userClients = this.clients.get(userId) || [];
    userClients.push({ id: clientId, res });
    this.clients.set(userId, userClients);
    getLogger().info({ userId, clientId }, 'SSE client connected');
  }
  removeClient(userId, clientId) {
    const userClients = this.clients.get(userId) || [];
    const filtered = userClients.filter((c) => c.id !== clientId);
    if (filtered.length === 0) {
      this.clients.delete(userId);
    } else {
      this.clients.set(userId, filtered);
    }
    getLogger().info({ userId, clientId }, 'SSE client disconnected');
  }
  broadcast(userId, eventType, data) {
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
  sendPingToAll() {
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
