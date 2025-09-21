// src/bots/aiService.ts
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openai: OpenAI | null = null;

// 👉 1. DEFINE THE AI'S PERSONALITY
// This system prompt gives the AI its instructions and character.
const systemPrompt = "You are a helpful and friendly AI assistant. Your name is CemTemChat AI. Keep your responses concise, friendly, and easy to understand. Do not mention that you are an AI unless it is directly relevant to the conversation.";

/**
 * Executes an AI chat completion request using the global OpenAI client.
 */
async function getAICompletion(userMessage: string): Promise<string | null> {
  if (!openai) {
    throw new Error("AI service not initialized. Did you forget to call setupAiService(app)?");
  }

  console.log(`🤖 Sending request to OpenRouter for: "${userMessage}"`);
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      // 👉 2. SEND THE PROMPT WITH THE MESSAGE
      // The 'messages' array now includes the system prompt before the user's message.
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    console.log("✅ AI Response Received.");
    return content || null;
  } catch (error) {
    console.error("💥 An error occurred while fetching the AI completion:", error);
    throw error;
  }
}

/**
 * Setup function so index.ts can just call setupAiService(app).
 * Attaches the OpenAI client + helpers to the app for later usage.
 */
export default function setupAiService(app: any) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
  const YOUR_SITE_URL = process.env.YOUR_SITE_URL || 'https://myserverbymycoco.onrender.com';
  const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || 'My-AI-Service';

  if (!OPENROUTER_API_KEY) {
    console.error("❌ FATAL ERROR: OPENROUTER_API_KEY is not set in your .env file.");
    throw new Error("OPENROUTER_API_KEY missing");
  }

  // Initialize OpenAI client only once
  if (!openai) {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": YOUR_SITE_URL,
        "X-Title": YOUR_SITE_NAME,
      },
    });
    console.log("✅ OpenAI client initialized via OpenRouter");
  }

  // Attach helpers to app for global access if needed
  if (app) {
    app.locals = app.locals || {};
    app.locals.openai = openai;
    app.locals.getAICompletion = getAICompletion;
  }

  return { openai, getAICompletion };
}

// Also export helpers directly in case someone imports them manually
export { getAICompletion };