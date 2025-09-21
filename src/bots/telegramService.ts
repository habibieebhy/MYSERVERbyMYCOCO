// telegramService.ts
// Minimal Telegram <-> Webapp bridge using node-telegram-bot-api + socket.io
// Responsibilities:
// 1) forward incoming telegram messages to webapp via socket.io: event 'telegram:message'
// 2) send messages coming from webapp to telegram: listen socket event 'web:sendMessage'

import TelegramBot from 'node-telegram-bot-api';
import { Server as SocketIOServer, Socket } from 'socket.io';

export interface TelegramServiceConfig {
  token: string;
  useWebhook?: boolean; // default false (we'll use polling)
  pollingIntervalMs?: number; // default 300
}

export interface WebToTelegramPayload {
  chatId: number;          // telegram chat id (must be known to webapp)
  text: string;            // message to send
  options?: any;           // optional telegram sendMessage options
}

export interface TelegramIncoming {
  chatId: number;
  text: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  raw?: any;
}

export class TelegramService {
  private bot: TelegramBot | null = null;
  private io: SocketIOServer | null = null;
  private config: Required<TelegramServiceConfig>;
  private socketsSet = new Set<string>();

  constructor(config: TelegramServiceConfig) {
    if (!config.token) throw new Error('Telegram token required');
    this.config = {
      useWebhook: false,
      pollingIntervalMs: 300,
      ...config
    };
  }

  /**
   * Attach (or reattach) socket.io server so the service can emit and listen to web events.
   * Call this from your server where you have created the Socket.IO Server instance.
   */
  public attachSocketIO(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
    // no return — we keep it intentionally simple
  }

  /**
   * Start the Telegram bot (polling unless useWebhook true).
   */
  public async start(): Promise<void> {
    if (this.bot) return;

    this.bot = new TelegramBot(this.config.token, {
      polling: this.config.useWebhook ? false : {
        interval: this.config.pollingIntervalMs,
        autoStart: true,
        params: { timeout: 10 }
      }
    });

    this.bot.on('message', (msg) => this.handleTelegramMessage(msg));
    this.bot.on('polling_error', (err) => console.error('Telegram polling error', err?.message || err));
    this.bot.on('error', (err) => console.error('Telegram bot error', err?.message || err));

    // quick sanity log
    try {
      const me = await this.bot.getMe();
      console.log(`TelegramService started as @${me.username} (${me.id})`);
    } catch (e) {
      console.warn('TelegramService started but getMe() failed (bot may still work).', e);
    }
  }

  /**
   * Stop the bot gracefully.
   */
  public async stop(): Promise<void> {
    if (!this.bot) return;
    try {
      if ((this.bot as any).isPolling && this.bot.isPolling()) {
        await this.bot.stopPolling();
      }
    } catch (e) {
      console.error('Error while stopping Telegram bot', e);
    } finally {
      this.bot = null;
    }
  }

  /**
   * Send message to a Telegram chat id.
   */
  public async sendToTelegram(chatId: number, text: string, options?: any): Promise<void> {
    if (!this.bot) throw new Error('Telegram bot not started');
    try {
      await this.bot.sendMessage(chatId, text, options);
    } catch (err) {
      console.error(`Failed to send message to ${chatId}`, err);
      throw err;
    }
  }

  /**
   * Internal: handle incoming telegram messages and forward to webapp.
   */
  private handleTelegramMessage(msg: TelegramBot.Message) {
    if (!this.io) {
      // If no socket server attached, still log. Webapp won't receive messages.
      console.warn('Telegram message received but socket.io not attached. Dropping message.');
      return;
    }

    // ignore non-text messages for simplicity
    const text = (msg.text || msg.caption || '').trim();
    if (!text) return;

    const incoming: TelegramIncoming = {
      chatId: msg.chat.id,
      text,
      username: (msg.from && (msg.from.username)) || undefined,
      firstName: msg.from?.first_name,
      lastName: msg.from?.last_name,
      raw: msg
    };

    // Emit to all connected web clients; webapp can filter by chatId.
    this.io.emit('telegram:message', incoming);
  }

  /**
   * Internal: set up minimal socket handlers for send/receive.
   * - listens for 'web:sendMessage' to route to Telegram
   * - optional: 'web:subscribe' to register socket for logs (keeps it simple)
   */
  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);
      this.socketsSet.add(socket.id);

      // Webapp -> Telegram (required payload: { chatId, text, options? })
      socket.on('web:sendMessage', async (payload: WebToTelegramPayload, ack?: (res: any) => void) => {
        try {
          if (!payload || typeof payload.chatId !== 'number' || !payload.text) {
            const err = { ok: false, error: 'invalid_payload' };
            if (ack) ack(err);
            return;
          }

          await this.sendToTelegram(payload.chatId, payload.text, payload.options);
          if (ack) ack({ ok: true });
        } catch (err) {
          console.error('Error sending message from web to telegram', err);
          if (ack) ack({ ok: false, error: (err as any)?.message || 'send_failed' });
        }
      });

      // optional helper: web client can ask server whether bot is ready
      socket.on('web:botStatus', (cb?: (res: any) => void) => {
        if (cb) cb({ running: !!this.bot });
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        this.socketsSet.delete(socket.id);
      });
    });
  }
}

/**
 * Factory wrapper so your `index.ts` can keep calling `setupTelegramService(app)`
 *
 * Usage (keeps your existing pattern):
 * import setupTelegramService from './src/bots/telegramService';
 * setupTelegramService(app);
 *
 * The function will attempt to find a Socket.IO instance on the `app` in common places:
 * - app.get('io')
 * - app.locals.io
 * - (app as any).io
 *
 * If no token is supplied via env or config, this will throw.
 */
export default function setupTelegramService(
  app: any,
  config?: Partial<TelegramServiceConfig>
): TelegramService {
  // find io from common app storage patterns
  const maybeIo: SocketIOServer | undefined =
    (typeof app?.get === 'function' && app.get('io')) ||
    (app?.locals && app.locals.io) ||
    (app && (app as any).io) ||
    undefined;

  const token = process.env.TELEGRAM_BOT_TOKEN || config?.token || '';
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not set and no token provided in config');
  }

  const svc = new TelegramService({
    token,
    useWebhook: config?.useWebhook ?? false,
    pollingIntervalMs: config?.pollingIntervalMs ?? 300,
  });

  if (maybeIo) {
    try {
      svc.attachSocketIO(maybeIo);
      console.log('✅ Attached Socket.IO to TelegramService');
    } catch (err) {
      console.warn('Failed to attach Socket.IO to TelegramService', err);
    }
  } else {
    console.warn('No Socket.IO instance found on app — TelegramService will work but webapp will not receive messages via socket.');
  }

  svc.start().catch((err) => {
    console.error('Failed to start TelegramService', err);
  });

  // return the instance in case the caller wants to keep it
  return svc;
};