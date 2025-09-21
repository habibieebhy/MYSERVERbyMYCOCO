// src/bots/aiService.ts
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from your .env file
dotenv.config();

// --- CONFIGURATION ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const YOUR_SITE_URL = process.env.YOUR_SITE_URL || 'https://myserverbymycoco.onrender.com';
const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || 'My-AI-Service';

// --- VALIDATION ---
if (!OPENROUTER_API_KEY) {
    console.error("❌ FATAL ERROR: OPENROUTER_API_KEY is not set in your .env file.");
    // In a real app, you might throw an error here
}

// 1. Initialize the OpenAI client to point to OpenRouter
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": YOUR_SITE_URL,
        "X-Title": YOUR_SITE_NAME,
    },
});

/**
 * A function to execute an AI chat completion request.
 * @param userMessage The message to send to the AI.
 * @returns The content of the AI's response message.
 */
async function getAICompletion(userMessage: string): Promise<string | null> {
    console.log(`🤖 Sending request to OpenRouter for: "${userMessage}"`);
    try {
        // 2. Create the chat completion request
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat-v3.1:free",
            messages: [
                {
                    "role": "user",
                    "content": userMessage
                }
            ],
        });

        // 3. Extract and return the response content
        const content = completion.choices[0]?.message?.content;
        console.log("✅ AI Response Received.");
        return content || null;

    } catch (error) {
        console.error("💥 An error occurred while fetching the AI completion:", error);
        throw error; // Re-throw the error so the calling function can handle it
    }
}

// 4. Export the function and the client for use in other files
export {
    getAICompletion,
    openai
};