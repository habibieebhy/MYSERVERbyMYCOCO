// server/src/bots/telegramBot.ts
import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// --- CONFIGURATION ---
// Replace with your actual keys and URLs in the .env file
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const FASTMCP_URL = process.env.FASTMCP_URL || 'https://brixta-mycoco-mcp.fastmcp.app/mcp';

// Optional: For OpenRouter ranking
const YOUR_SITE_URL = process.env.YOUR_SITE_URL || 'https://';
const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || 'My-Telegram-Bot';


// --- VALIDATE CONFIGURATION ---
if (!TELEGRAM_BOT_TOKEN) {
    console.error("Error: TELEGRAM_BOT_TOKEN is not set. Please add it to your .env file.");
    process.exit(1);
}
if (!OPENROUTER_API_KEY) {
    console.error("Error: OPENROUTER_API_KEY is not set. Please add it to your .env file.");
    process.exit(1);
}


// --- INITIALIZE TELEGRAM BOT ---
console.log("Starting bot...");
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
console.log("Bot started and listening for messages.");


// --- HELPER FUNCTIONS ---

/**
 * A generic helper to make authenticated requests to the FastMCP service.
 * This function translates the logic from the `fastmcp` Python library.
 * @param endpoint The API endpoint to hit (e.g., '/ping', '/tools').
 * @param options The fetch options (method, body, etc.).
 * @returns The JSON response from the server.
 */
async function callFastMcp(endpoint: string, options: any = {}): Promise<any> {
    const url = `${FASTMCP_URL}${endpoint}`;
    console.log(`Calling FastMCP: ${options.method || 'GET'} ${url}`);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`FastMCP API error! Status: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error calling FastMCP endpoint ${endpoint}:`, error);
        throw error; // Re-throw to be caught by command handlers
    }
}

/**
 * Calls the OpenRouter API to get a chat completion.
 * @param userMessage The content of the user's message.
 * @returns The text content of the model's response.
 */
async function getOpenRouterCompletion(userMessage: string): Promise<string> {
    console.log(`Calling OpenRouter for prompt: "${userMessage}"`);
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": YOUR_SITE_URL,
                "X-Title": YOUR_SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "mistralai/mistral-7b-instruct:free", // Using a popular free model
                "messages": [
                    { "role": "user", "content": userMessage }
                ]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenRouter API error! Status: ${response.status}. Body: ${errorBody}`);
        }

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Error calling OpenRouter API:", error);
        throw error;
    }
}


// --- BOT COMMAND HANDLERS ---

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome! I'm a bot integrated with OpenRouter and a FastMCP service. Use /help to see what I can do.");
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
Here are the available commands:

*OpenRouter Commands:*
/ask \`<question>\` - Ask the AI model a question.

*FastMCP Commands:*
/mcp_ping - Check if the FastMCP service is online.
/mcp_tools - List available tools from the service.
/mcp_resources - List available resources.
/mcp_prompts - List available prompts.
/mcp_call \`<tool_name>\` \`<json_payload>\` - Execute a tool.
  _Example:_ \`/mcp_call your_tool {"param":"value"}\`
    `;
    bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

// --- OpenRouter Commands ---

bot.onText(/\/ask (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const question = match ? match[1] : '';

    if (!question) {
        bot.sendMessage(chatId, "Please provide a question after the /ask command.");
        return;
    }

    try {
        await bot.sendChatAction(chatId, 'typing');
        const response = await getOpenRouterCompletion(question);
        bot.sendMessage(chatId, response);
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't get a response from the AI. Please try again later.");
    }
});

// --- FastMCP Commands ---

bot.onText(/\/mcp_ping/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.sendChatAction(chatId, 'typing');
        // The Python client sends a POST for ping, we'll replicate that.
        await callFastMcp('/ping', { method: 'POST' });
        bot.sendMessage(chatId, "✅ FastMCP service is reachable.");
    } catch (error) {
        bot.sendMessage(chatId, "❌ Failed to ping FastMCP service.");
    }
});

bot.onText(/\/mcp_tools/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.sendChatAction(chatId, 'typing');
        const tools = await callFastMcp('/tools');
        bot.sendMessage(chatId, `*Available Tools:*\n\`\`\`json\n${JSON.stringify(tools, null, 2)}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, "❌ Could not fetch the list of tools.");
    }
});

bot.onText(/\/mcp_resources/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.sendChatAction(chatId, 'typing');
        const resources = await callFastMcp('/resources');
        bot.sendMessage(chatId, `*Available Resources:*\n\`\`\`json\n${JSON.stringify(resources, null, 2)}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, "❌ Could not fetch the list of resources.");
    }
});

bot.onText(/\/mcp_prompts/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.sendChatAction(chatId, 'typing');
        const prompts = await callFastMcp('/prompts');
        bot.sendMessage(chatId, `*Available Prompts:*\n\`\`\`json\n${JSON.stringify(prompts, null, 2)}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, "❌ Could not fetch the list of prompts.");
    }
});

bot.onText(/\/mcp_call (\S+) (.+)/s, async (msg, match) => {
    const chatId = msg.chat.id;
    const toolName = match ? match[1] : '';
    const jsonPayloadString = match ? match[2] : '';

    if (!toolName || !jsonPayloadString) {
        bot.sendMessage(chatId, "Usage: /mcp_call <tool_name> <json_payload>");
        return;
    }

    let payload;
    try {
        payload = JSON.parse(jsonPayloadString);
    } catch (e) {
        bot.sendMessage(chatId, "Error: The payload is not valid JSON. Please check your syntax.");
        return;
    }

    try {
        await bot.sendChatAction(chatId, 'typing');
        // Assuming the endpoint is /tools/{tool_name}
        const result = await callFastMcp(`/tools/${toolName}`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        bot.sendMessage(chatId, `*Tool Result:*\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, `❌ Failed to execute tool '${toolName}'.`);
    }
});


// --- ERROR HANDLING ---
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.message}`);
});
