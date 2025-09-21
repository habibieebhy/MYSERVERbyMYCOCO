// bots/aiService.ts
import { Express, Request, Response } from 'express';
import fetch from 'node-fetch';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// --- NEW: Add constants for optional headers from your .env file ---
const YOUR_SITE_URL = process.env.SITE_URL || "http://localhost:3000"; // Fallback for local dev
const YOUR_SITE_NAME = process.env.SITE_NAME || "CemTemChat AI";

export default function setupAiService(app: Express) {
  if (!OPENROUTER_API_KEY) {
    console.warn("⚠️ OPENROUTER_API_KEY is not set. The AI service endpoint will not work.");
    return;
  }

  console.log('🤖 Registering AI Service endpoint...');

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid "message" string is required.' });
    }

    try {
      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          // --- UPDATED HEADERS ---
          "HTTP-Referer": YOUR_SITE_URL, 
          "X-Title": YOUR_SITE_NAME,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // --- UPDATED MODEL ---
          "model": "deepseek/deepseek-chat-v3.1:free",
          "messages": [{ "role": "user", "content": message }]
        })
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("OpenRouter API Error:", errorText);
        throw new Error(`OpenRouter API responded with status ${aiResponse.status}`);
      }

      const data: any = await aiResponse.json();
      res.status(200).json({ success: true, reply: data.choices[0].message.content });

    } catch (error) {
      console.error("Error in AI Service:", error);
      res.status(500).json({ success: false, error: "Failed to get a response from the AI model." });
    }
  });
}