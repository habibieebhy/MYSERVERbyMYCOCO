// src/bots/telegramService.ts
// UPDATED: Now integrates an AI service for intelligent replies.

import TelegramBot from 'node-telegram-bot-api';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getAICompletion } from './aiService'; // 👈 1. Import the AI service function

export interface TelegramServiceConfig {
  token: string;
  useWebhook?: boolean;
  pollingIntervalMs?: number;
}

export interface WebToTelegramPayload {
  chatId: number;
  text: string;
  options?: any;
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

  public attachSocketIO(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  public async start(): Promise<void> {
    if (this.bot) return;

    this.bot = new TelegramBot(this.config.token, {
      polling: this.config.useWebhook ? false : {
        interval: this.config.pollingIntervalMs,
        autoStart: true,
        params: { timeout: 10 }
      }
    });

    // 👈 2. Pass the async version of the handler
    this.bot.on('message', (msg) => this.handleTelegramMessage(msg));
    this.bot.on('polling_error', (err) => console.error('Telegram polling error', err?.message || err));
    this.bot.on('error', (err) => console.error('Telegram bot error', err?.message || err));

    try {
      const me = await this.bot.getMe();
      console.log(`✅ TelegramService started as @${me.username} (${me.id})`);
    } catch (e) {
      console.warn('TelegramService started but getMe() failed.', e);
    }
  }

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
   * Internal: handle incoming telegram messages, get AI reply, and send it back.
   * Also forwards the original message to the webapp via socket.io.
   */
  // 👈 3. The message handler is now async to await the AI response
private async handleTelegramMessage(msg: TelegramBot.Message) {
    const text = (msg.text || msg.caption || '').trim();
    const chatId = msg.chat.id;

    // Ignore any non-text messages
    if (!text) {
        return;
    }

    // Handle a basic /start command for new users, but let the AI handle everything else
    if (text.toLowerCase() === '/start') {
        this.sendToTelegram(
            chatId,
            'Hello! I am an AI assistant powered by OpenRouter. Ask me anything.'
        );
        return; // Stop processing after sending the welcome message
    }

    // For ALL other messages, proceed directly to the AI
    try {
        console.log(`🧠 Processing AI request for chat ${chatId}: "${text}"`);
        // Let the user know the bot is thinking
        this.bot?.sendChatAction(chatId, 'typing');

        // Get the AI's response by calling the imported function
        const aiReply = await getAICompletion(text);

        // Send the AI's reply back to the user
        if (aiReply) {
            await this.sendToTelegram(chatId, aiReply);
        } else {
            await this.sendToTelegram(chatId, "Sorry, I couldn't come up with a response.");
        }

    } catch (error) {
        // Handle any errors during the AI call
        console.error(`💥 Failed to get AI response for chat ${chatId}:`, error);
        await this.sendToTelegram(chatId, "Sorry, I'm having trouble connecting to my brain right now. Please try again later.");
    }
}

  private setupSocketHandlers() {
    if (!this.io) return;
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);
      this.socketsSet.add(socket.id);

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

      socket.on('web:botStatus', (cb?: (res: any) => void) => {
        if (cb) cb({ running: !!this.bot });
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
        this.socketsSet.delete(socket.id);
      });
    });
  }
}

/**
 * Factory wrapper to set up the service.
 */
export default function setupTelegramService(
  app: any,
  config?: Partial<TelegramServiceConfig>
): TelegramService {
  const maybeIo: SocketIOServer | undefined =
    (typeof app?.get === 'function' && app.get('io')) ||
    (app?.locals && app.locals.io) ||
    (app && (app as any).io) ||
    undefined;

  const token = process.env.TELEGRAM_BOT_TOKEN || config?.token || '';
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not set and no token provided in config');
  }

  const svc = new TelegramService({ token, ...config });

  if (maybeIo) {
    try {
      svc.attachSocketIO(maybeIo);
      console.log('🔗 Attached Socket.IO to TelegramService');
    } catch (err) {
      console.warn('Failed to attach Socket.IO to TelegramService', err);
    }
  } else {
    console.warn('No Socket.IO instance found on app — webapp will not receive messages via socket.');
  }

  svc.start().catch((err) => {
    console.error('Failed to start TelegramService', err);
  });

  return svc;
};