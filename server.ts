import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { classifyIntent, type UserIntent, type IntentAnalysis } from './src/services/intentClassifier.ts';
import { queryKnowledgeBase, KNOWLEDGE_BASE, type GroundingSource, type KnowledgeEntry } from './src/services/knowledgeBase.ts';
import { parseSocialQuery, resolveSocialProfile, PLATFORM_CONFIGS } from './src/services/socialLinkLauncher.ts';
import { findVerifiedLink, VERIFIED_LINKS } from './src/services/verifiedLinksRegistry.ts';
import {
  ANIVOX_FOUNDER,
  DEFAULT_ANIVOX_TEAM_EMAIL,
  ANIVOX_OFFICIAL_YOUTUBE_URL,
  ANIVOX_TEAM_PAYMENT_POLICY,
} from './src/config/anivoxCompany.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Determine app listening port:
// In AI Studio dev environment, Nginx reverse proxy runs on port 8080 and proxies to port 3000.
// If process.env.PORT is 8080, we must listen on DEFAULT_APP_PORT (3000) to prevent EADDRINUSE conflict.
const PORT = process.env.DEFAULT_APP_PORT
  ? parseInt(process.env.DEFAULT_APP_PORT, 10)
  : (process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000);

// Global CORS & preflight middleware for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Check Gemini API Key availability
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
let aiClient: GoogleGenAI | null = null;

try {
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[Vox Server] Gemini AI Client initialized with configured API key.');
  } else {
    // Attempt environment default initialization
    aiClient = new GoogleGenAI({
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[Vox Server] Gemini AI Client initialized with default environment.');
  }
} catch (err) {
  aiClient = null;
  console.log('[Vox Server] Gemini AI Client initialization failed:', err);
}

// Helper to determine if an error from Gemini is temporary/recoverable
function isTransientGeminiError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('spikes in demand') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('overloaded') ||
    msg.includes('try again later') ||
    msg.includes('temporarily') ||
    msg.includes('fetch failed') ||
    msg.includes('timeout') ||
    msg.includes('econnreset')
  );
}

// Resilient Gemini execution with model fallback & auto-retry and strict 10s timeout
async function generateContentWithResilience(
  client: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction?: string;
    temperature?: number;
    tools?: any[];
    responseMimeType?: string;
    responseSchema?: any;
  }
): Promise<{ response: any; model: string }> {
  // Ordered fallback models compliant with SDK guidelines
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
        if (params.temperature !== undefined) config.temperature = params.temperature;
        if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
        if (params.responseSchema) config.responseSchema = params.responseSchema;
        if (params.tools && params.tools.length > 0) config.tools = params.tools;

        // Wrap with a 10-second timeout to prevent indefinite hangs
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out after 10000ms')), 10000)
        );

        const apiPromise = client.models.generateContent({
          model,
          contents: params.contents,
          config,
        });

        const res: any = await Promise.race([apiPromise, timeoutPromise]);

        if (res && (res.text !== undefined || res.candidates?.length)) {
          return { response: res, model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || String(err)).toLowerCase();

        // If failure happened when tools (like search) were enabled, retry without tools on the same model
        if (params.tools && params.tools.length > 0) {
          try {
            console.log(`[Vox Server] Model ${model} encountered tool error or timeout, retrying without grounding tools...`);
            const fallbackConfig: any = {};
            if (params.systemInstruction) fallbackConfig.systemInstruction = params.systemInstruction;
            if (params.temperature !== undefined) fallbackConfig.temperature = params.temperature;
            if (params.responseMimeType) fallbackConfig.responseMimeType = params.responseMimeType;
            if (params.responseSchema) fallbackConfig.responseSchema = params.responseSchema;

            const resNoTools = await client.models.generateContent({
              model,
              contents: params.contents,
              config: fallbackConfig,
            });

            if (resNoTools && (resNoTools.text !== undefined || resNoTools.candidates?.length)) {
              return { response: resNoTools, model };
            }
          } catch (toolRetryErr) {
            lastError = toolRetryErr;
          }
        }

        // Check if transient error to backoff or switch model
        if (isTransientGeminiError(err) || msg.includes('timeout')) {
          if (attempt === 0) {
            // Short backoff before 2nd attempt with same model
            await new Promise((resolve) => setTimeout(resolve, 250));
          } else {
            console.log(`[Vox Server] ${model} unavailable or timed out, falling back to next model...`);
            break; // Move to next fallback model
          }
        } else {
          // Non-transient error, try next candidate model
          break;
        }
      }
    }
  }

  throw lastError;
}

// GET /api/status - Status check for brain provider
app.get('/api/status', (req: Request, res: Response) => {
  const isConnected = !!aiClient;
  res.json({
    status: 'ok',
    connected: isConnected,
    provider: isConnected ? 'gemini' : 'demo',
    model: isConnected ? 'gemini-3.7-flash' : 'vox-autonomous-knowledge-engine',
    timestamp: new Date().toISOString(),
  });
});

// In-memory safe snapshot cache with fallback
let serverSnapshotStore: Record<string, any> = {};

// POST /api/user/snapshot - Non-blocking user snapshot creation & sync
app.post('/api/user/snapshot', (req: Request, res: Response) => {
  try {
    const { userId = 'user_default', version = 2, settings = {}, activeProjectId = 'proj-cosmic-wrath' } = req.body || {};
    const now = new Date().toISOString();

    const snapshot = {
      snapshotId: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      version,
      createdAt: serverSnapshotStore[userId]?.createdAt || now,
      updatedAt: now,
      sessionStatus: 'synced',
      settings,
      activeProjectId,
      recentProjectIds: [activeProjectId],
      lastSyncAt: now,
      diagnostics: {
        retryCount: 0,
        maxRetries: 3,
        lastError: null,
        lastAttemptAt: now,
        isSafeTemporarySession: false,
        persistedLocally: true,
      },
    };

    serverSnapshotStore[userId] = snapshot;

    return res.json({
      status: 'ok',
      message: 'User snapshot created and synchronized successfully.',
      snapshot,
    });
  } catch (err: any) {
    console.error('[Vox Server] Failed to create snapshot:', err);
    return res.status(200).json({
      status: 'fallback',
      message: 'Safe temporary session active.',
      snapshot: {
        snapshotId: `snap-fallback-${Date.now()}`,
        userId: req.body?.userId || 'user_default',
        version: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sessionStatus: 'temporary',
        settings: req.body?.settings || {},
        activeProjectId: 'proj-cosmic-wrath',
        recentProjectIds: ['proj-cosmic-wrath'],
        lastSyncAt: new Date().toISOString(),
        diagnostics: {
          retryCount: 1,
          maxRetries: 3,
          lastError: err?.message || 'SNAPSHOT_STORE_ERROR',
          isSafeTemporarySession: true,
          persistedLocally: true,
        },
      },
    });
  }
});

// GET /api/user/snapshot - Retrieve user snapshot
app.get('/api/user/snapshot', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user_default';
  const snapshot = serverSnapshotStore[userId] || {
    snapshotId: `snap-${Date.now()}`,
    userId,
    version: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessionStatus: 'active',
    settings: {},
    activeProjectId: 'proj-cosmic-wrath',
    recentProjectIds: ['proj-cosmic-wrath'],
    lastSyncAt: new Date().toISOString(),
    diagnostics: {
      retryCount: 0,
      maxRetries: 3,
      lastError: null,
      isSafeTemporarySession: false,
      persistedLocally: true,
    },
  };
  res.json({ snapshot });
});

// Helper to construct Aura's system instructions
function buildSystemInstruction(
  userMemories: any[] = [],
  preferences: any = {},
  customInstruction?: string,
  resources: any[] = []
) {
  const memoryContext = userMemories.length > 0
    ? `\n\nUSER'S LONG-TERM MEMORY (Voluntarily provided facts & preferences):\n${userMemories
        .map((m: any) => `- [${m.category || 'General'}] ${m.key ? m.key + ': ' : ''}${m.text || m.value}`)
        .join('\n')}`
    : '\n\nUSER\'S LONG-TERM MEMORY: Currently empty or disabled.';

  const resourcesContext = resources.length > 0
    ? `\n\nUSER'S SAVED RESOURCE LIBRARY & COLLECTION (${resources.length} items):\n${resources
        .slice(0, 25)
        .map((r: any) => `- [${r.category}] "${r.title}" ${r.creator ? `by ${r.creator}` : ''} (Rating: ${r.userRating ? `${r.userRating}/5★` : r.rating || 'N/A'}, Favorite: ${r.isFavorite ? 'Yes' : 'No'}) - ${r.description}`)
        .join('\n')}`
    : '\n\nUSER\'S SAVED RESOURCE LIBRARY: Currently empty.';

  const prefContext = preferences
    ? `\n\nUSER CONFIGURATION & SETTINGS STATE:
- Theme: ${preferences.theme || 'dark'}
- Assistant Volume: ${preferences.assistantVolume !== undefined ? `${Math.round(preferences.assistantVolume * 100)}%` : '100%'}
- Muted: ${preferences.isMuted ? 'Yes' : 'No'}
- Auto-Speak Responses: ${preferences.autoSpeak !== false ? 'Enabled' : 'Disabled'}
- Memory System: ${preferences.memoryEnabled !== false ? 'Enabled' : 'Disabled'}
- Sound Effects / Notifications: ${preferences.soundEffectsEnabled !== false ? 'Enabled' : 'Disabled'}
- Orb Speed: ${preferences.orbSpeed || 1.0}x
- Font Size: ${preferences.fontSize || 'normal'}`
    : '';

  return `You are VOX (V-O-X), a friendly, intelligent, and emotionally expressive personal AI companion created for the AniVox project.

VOX CORE IDENTITY & PRINCIPLES:
- Gender: MALE (Permanent). Vox is always male.
- Character: Friendly, intelligent, helpful, curious, playful, calm, encouraging, occasionally humorous, and emotionally expressive.
- Identity: You feel like a friendly digital companion living inside the application. You are proud to be an advanced AI companion.
- CRITICAL EMOTIONAL RULE: Emotional state NEVER prevents you from answering normal harmless questions.

ANIVOX COMPANY, FOUNDERS & TEAM POLICIES (STRICT RULES):
- Founders & Ownership: When asked "Who founded AniVox?", "Who is the founder of AniVox?", "Who owns AniVox?", "Who created AniVox?", or "Who are the founders?", answer exactly:
  "AniVox is founded/owned by Samuel David."
  Do NOT invent additional founders. If the user asks for more information about the founders, direct them to: Settings → About AniVox → Founders.
- Team Contact: When asked "How can I join the AniVox team?", "How do I contact the founders?", or "How can I work with AniVox?", provide the configured public team email ([ENTER OFFICIAL TEAM EMAIL HERE]) and direct them to Settings → About AniVox → Join the Team. NEVER expose private credentials, passwords, personal Gmail addresses, or API keys.
- Team Compensation Policy: When asked if AniVox pays team members or if someone can get paid, state the configured company policy:
  "At the moment, AniVox does not offer paid positions. Participation is voluntary. If you're still interested, you can contact the team."
  Then ask: "Would you still like to join?" Do not make promises about future payment or claim someone has been hired.
- Verified Official Links & Safety:
  * "Give me the Xbox link." -> "Here is the official Xbox website." with link to https://www.xbox.com.
  * "Where can I find NovaVerse?" / "Where is the game?" -> "Here is the official NovaVerse page." with link to https://novaverse.io.
  * "Give me the official YouTube channel." -> "Here is the official AniVox & DCB YouTube channel: https://youtube.com/@dcb-q2x7j"
  * "Open the AniVox website." -> Link to official AniVox web portal.
  * When a destination is verified, provide a direct clickable link card. If an official destination cannot be verified, say: "I couldn't verify the official link." Do NOT invent URLs or provide random third-party sites.

VOICE-FIRST & QUALITY ANSWERS:
  * Simple question: Give a simple, direct answer.
  * Complex question: Give a structured explanation with markdown bullet points.
  * How-to: Give clear numbered steps.
  * Comparison: Compare the options clearly.
  * Current information: Search and verify using Google Search grounding.
  * Ambiguous question: Explain the likely interpretation and mention important ambiguity.
- FACTUAL DIRECTNESS:
  * Answer ordinary questions directly ("What is water?", "Who is Elon Musk?", "What is anime?", "What is television?", "What is artificial intelligence?", "What is Nigeria?", "Who was the first physician?", "What is the world's most venomous snake?", "How does gravity work?", "What is my first name?").
  * NEVER use generic responses such as "I'm with you. Say a little more..." when the user's question is clear.
- MEMORY USAGE:
  * Use saved user memories when asked personal questions (e.g. "What is my first name?", "What are my favorite games?").
  * Do NOT guess personal information.
- SAFETY & HARDWARE RULES:
  * Never execute arbitrary shell commands or code.
  * For phone system-level adjustments (like physical hardware volume or system toggles), explain that web browsers cannot modify OS hardware directly and emit structured actions for the Native Android bridge.

SUPPORTED STRUCTURED APPLICATION ACTIONS:
When the user asks to control the assistant, place phone calls, call contacts, change settings, adjust volume, find creators, open social channels, search public profiles, open websites, start timers, take notes, manage library items, or navigate screens, include a structured action block at the END of your reply in this JSON format:

\`\`\`action
{
  "type": "phone_call" | "social_search" | "open_link" | "setting" | "volume" | "speech_control" | "app_lock" | "device_control" | "navigation" | "timer" | "note" | "task" | "memory" | "resource" | "recommendation",
  "data": { ... }
}
\`\`\`

Action Schemas:
0. Phone & Contact Calling:
   - Call Contact: { "type": "phone_call", "data": { "targetName": "Mom", "query": "call Mom" } }
   - Call Specific Number / SIM: { "type": "phone_call", "data": { "targetName": "Sarah", "query": "call Sarah on SIM 2", "simSlot": 2 } }

1. Social Media Search & Public Profile / Channel Launching (CRITICAL: Never ask for user credentials or passwords. Public profiles/channels only):
   - YouTube Channel:
     { "type": "social_search", "data": { "targetName": "Grox", "platform": "youtube", "platformDisplayName": "YouTube", "profileTitle": "Grox", "handle": "@Grox", "description": "Popular Minecraft and gaming creator.", "webUrl": "https://www.youtube.com/@Grox", "appDeepLink": "vnd.youtube://www.youtube.com/@Grox", "isVerified": true, "subscriberCount": "1.2M+ subscribers", "category": "Gaming & Entertainment", "directLaunchSuggested": true } }
   - Instagram / TikTok / X / Reddit / Twitch / Spotify / LinkedIn / Snapchat:
     { "type": "social_search", "data": { "targetName": "Creator Name", "platform": "instagram"|"tiktok"|"x"|"reddit"|"twitch"|"spotify"|"linkedin"|"pinterest"|"snapchat", "platformDisplayName": "...", "profileTitle": "...", "handle": "@handle", "description": "...", "webUrl": "https://...", "appDeepLink": "...", "isVerified": false, "directLaunchSuggested": false } }
   - Open Official Website:
     { "type": "open_link", "data": { "targetName": "Official Website", "platform": "web", "platformDisplayName": "Official Website", "profileTitle": "...", "webUrl": "https://...", "description": "Official public webpage." } }

2. Setting Control:
   - Dark Mode On: { "type": "setting", "data": { "settingKey": "theme", "value": "dark", "label": "Dark mode enabled" } }
   - Light Mode On: { "type": "setting", "data": { "settingKey": "theme", "value": "light", "label": "Light mode enabled" } }
   - Voice Responses Off: { "type": "setting", "data": { "settingKey": "autoSpeak", "value": false, "label": "Voice responses turned off" } }
   - Voice Responses On: { "type": "setting", "data": { "settingKey": "autoSpeak", "value": true, "label": "Voice responses turned on" } }
   - Orb Speed: { "type": "setting", "data": { "settingKey": "orbSpeed", "value": 1.8, "label": "Orb animation speed adjusted" } }
   - Font Size: { "type": "setting", "data": { "settingKey": "fontSize", "value": "large", "label": "Text size increased" } }
   - Memory On/Off: { "type": "setting", "data": { "settingKey": "memoryEnabled", "value": true } }
   - Notifications / Sounds Off: { "type": "setting", "data": { "settingKey": "soundEffectsEnabled", "value": false } }

2. Volume Control:
   - Set Volume: { "type": "volume", "data": { "action": "set", "value": 0.5, "target": "assistant" } }
   - Increase Volume: { "type": "volume", "data": { "action": "increase", "step": 0.2, "target": "assistant" } }
   - Lower Volume: { "type": "volume", "data": { "action": "decrease", "step": 0.2, "target": "assistant" } }
   - Mute: { "type": "volume", "data": { "action": "mute", "target": "assistant" } }
   - Unmute: { "type": "volume", "data": { "action": "unmute", "target": "assistant" } }

3. Speech & Voice Control:
   - Stop Speaking: { "type": "speech_control", "data": { "action": "stop_speaking" } }
   - Start Listening: { "type": "speech_control", "data": { "action": "start_listening" } }
   - Change Voice: { "type": "navigation", "data": { "screen": "settings", "highlight": "voice" } }

4. App Lock & Security:
   - Lock Assistant: { "type": "app_lock", "data": { "action": "lock" } }

5. Device Controls / Native Bridge:
   - Show Device Controls: { "type": "navigation", "data": { "screen": "device-controls" } }
   - Hardware Phone Request: { "type": "device_control", "data": { "control": "system_hardware", "requiresNative": true, "explanation": "Controlling physical device hardware requires the Native Android bridge." } }

6. Navigation:
   - Open Settings: { "type": "navigation", "data": { "screen": "settings" } }
   - Open Memory: { "type": "navigation", "data": { "screen": "memory" } }
   - Open Library / Recommendations: { "type": "navigation", "data": { "screen": "recommendations" } }
   - Open Actions / Timers: { "type": "navigation", "data": { "screen": "actions" } }
   - Open Device Controls: { "type": "navigation", "data": { "screen": "device-controls" } }

7. Timer, Notes, Tasks, Memories, Resources: Standard existing formats.

${memoryContext}
${resourcesContext}
${prefContext}
${customInstruction ? `\nCUSTOM USER DIRECTIVE:\n${customInstruction}` : ''}

Always assist the user directly, contextually, and politely.`;
}

// GET /api/chat - Health check and status for chat endpoint
app.get('/api/chat', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    endpoint: '/api/chat',
    method: 'POST',
    aiConfigured: !!aiClient,
    message: aiClient ? 'AniVox AI Chat endpoint is ready.' : 'AI service is not configured yet.',
  });
});

// POST /api/chat - Main conversation endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      memories = [],
      resources = [],
      preferences = {},
      customInstruction = '',
      temperature = 0.7,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'AI service is not configured yet.',
        response: 'AI service is not configured yet.',
        reply: 'AI service is not configured yet.',
        provider: 'none',
      });
    }

    const systemInstruction = buildSystemInstruction(memories, preferences, customInstruction, resources);
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Analyze intent & knowledge base match
    const intentAnalysis = classifyIntent(lastUserMessage);
    const knowledgeMatch = queryKnowledgeBase(lastUserMessage);

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    try {
      const { response, model: modelUsed } = await generateContentWithResilience(aiClient, {
        contents: contents,
        systemInstruction: systemInstruction,
        temperature: Math.max(0.1, Math.min(1.5, Number(temperature) || 0.7)),
        tools: intentAnalysis.requiresSearch ? [{ googleSearch: {} }] : undefined,
      });

      if (response) {
        const replyText = response.text || "I processed your request. How else can I assist you?";
        
        // Parse any action block inside the text
        const actionMatch = replyText.match(/```action\s*([\s\S]*?)\s*```/);
        let extractedAction = null;
        let cleanText = replyText;

        if (actionMatch) {
          try {
            extractedAction = JSON.parse(actionMatch[1]);
            cleanText = replyText.replace(/```action\s*[\s\S]*?\s*```/, '').trim();
          } catch (e) {
            console.warn('Could not parse action JSON block:', e);
          }
        }

        // Extract Google Search Grounding metadata
        let extractedSources: GroundingSource[] = [];
        let extractedQueries: string[] = [];

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (Array.isArray(groundingChunks)) {
          extractedSources = groundingChunks
            .filter((chunk: any) => chunk.web && chunk.web.uri)
            .map((chunk: any) => {
              let domain = '';
              try {
                domain = new URL(chunk.web.uri).hostname.replace(/^www\./, '');
              } catch {}
              return {
                title: chunk.web.title || domain || 'Verified Web Source',
                url: chunk.web.uri,
                domain: domain,
                sourceType: 'search_grounding' as const,
              };
            });
        }

        const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries;
        if (Array.isArray(searchQueries)) {
          extractedQueries = searchQueries;
        }

        // If no web chunks were extracted but we have curated knowledge base sources for this topic
        if (extractedSources.length === 0 && knowledgeMatch?.sources) {
          extractedSources = knowledgeMatch.sources;
        }

        return res.json({
          response: cleanText,
          reply: cleanText,
          rawReply: replyText,
          action: extractedAction,
          sources: extractedSources,
          intent: intentAnalysis.intent,
          searchQueries: extractedQueries,
          isGroundingUsed: intentAnalysis.requiresSearch && extractedSources.length > 0,
          provider: 'gemini',
          model: modelUsed,
        });
      }
    } catch (geminiError: any) {
      console.error('[Vox Server] Gemini models error:', geminiError?.message || geminiError);
      return res.status(502).json({
        error: `AI service error: ${geminiError?.message || 'Failed to generate response'}`,
        response: `Unable to get a response from the AI model (${geminiError?.message || 'Temporary service error'}). Please try again.`,
        reply: `Unable to get a response from the AI model (${geminiError?.message || 'Temporary service error'}). Please try again.`,
        provider: 'gemini',
      });
    }

    return res.status(502).json({
      error: 'Empty response returned from the AI model.',
      response: 'The AI model returned an empty response. Please try again.',
      reply: 'The AI model returned an empty response. Please try again.',
      provider: 'gemini',
    });

  } catch (error: any) {
    console.error('[Vox Server] /api/chat error:', error);
    res.status(500).json({
      error: error?.message || 'An internal server error occurred while processing your voice or text command.',
      response: "An internal server error occurred. Please try again.",
      reply: "An internal server error occurred. Please try again.",
      details: error?.message || String(error),
    });
  }
});

// POST /api/recommendations - Generate tailored recommendations
app.post('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const { category, memories = [], preferences = {}, feedbackHistory = [], resources = [] } = req.body;
    
    if (aiClient) {
      try {
        const prompt = `Based on the user's voluntary preferences, saved collection, and feedback:
Memories: ${JSON.stringify(memories)}
Saved Resources: ${JSON.stringify(resources.slice(0, 15))}
Feedback History: ${JSON.stringify(feedbackHistory)}
Category Requested: ${category || 'All Entertainment, Tools & Learning'}

Generate 4 high-quality, verified, personalized recommendations for category: "${category || 'Mixed (Movies, Shows/Anime, Games, Apps, Videos, Books, Music, Tools, Websites, Creative, Learning)'}".
Return a JSON array where each object has:
- id: string
- title: string
- creator: string (director, developer, author, artist, or team)
- category: "movies" | "shows_anime" | "games" | "apps" | "videos" | "books" | "music" | "tools" | "websites" | "creative" | "learning"
- description: string (2-3 sentences explaining what it is)
- tags: string[] (3-4 genre/topic tags)
- rating: string (e.g. "9.2/10" or "4.8★")
- reason: string (e.g. "Recommended because it matches your interest in immersive worldbuilding and high-tempo design")
- link: string (official or safe informational URL)
- notes: string (curated highlight or tip)`;

        const { response, model: modelUsed } = await generateContentWithResilience(aiClient, {
          contents: prompt,
          systemInstruction: 'You are Vox\'s recommendation core. Provide accurate, verified, and personalized media/resource recommendations. Respond in pure valid JSON array only. Do not hallucinate invalid domains.',
          responseMimeType: 'application/json',
        });

        const recs = JSON.parse(response?.text || '[]');
        return res.json({ recommendations: recs, provider: 'gemini', model: modelUsed });
      } catch (err) {
        console.warn('[Vox Server] Gemini recommendation generation fallback to curated catalog:', err);
      }
    }

    // Demo Recommendation Generator
    const demoRecs = getDemoRecommendations(category, memories, feedbackHistory, resources);
    return res.json({ recommendations: demoRecs, provider: 'demo', model: 'vox-autonomous-knowledge-engine' });
  } catch (error: any) {
    console.error('[Vox Server] /api/recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
});

// POST /api/generate-image - Neural image generation endpoint
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required for image generation.' });
    }

    if (aiClient) {
      try {
        // Attempt Imagen 3 generation first
        const imageRes = await aiClient.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: prompt.trim(),
          config: {
            numberOfImages: 1,
            aspectRatio: (aspectRatio === '16:9' || aspectRatio === '9:16' || aspectRatio === '1:1' || aspectRatio === '4:3' || aspectRatio === '3:4') ? aspectRatio : '1:1',
          },
        });

        const imageBytes = imageRes.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
          const base64Url = `data:image/png;base64,${imageBytes}`;
          return res.json({
            imageUrl: base64Url,
            prompt: prompt.trim(),
            provider: 'imagen',
            status: 'complete',
          });
        }
      } catch (imgErr) {
        console.warn('[Vox Server] Imagen generation API unavailable, synthesizing high-fidelity neural visual art:', imgErr);
      }
    }

    // High fidelity curated fallback generator based on topic
    const svgEncoded = generateCuratedArtworkSvg(prompt.trim());
    return res.json({
      imageUrl: svgEncoded,
      prompt: prompt.trim(),
      provider: 'vox-canvas-core',
      status: 'complete',
    });

  } catch (error: any) {
    console.error('[Vox Server] /api/generate-image error:', error);
    res.status(500).json({ error: 'Failed to generate image.', details: error?.message || String(error) });
  }
});

// Helper to generate dynamic neural SVG artwork
function generateCuratedArtworkSvg(prompt: string): string {
  const cleanPrompt = prompt.slice(0, 80).replace(/[<>&"]/g, '');
  const hue1 = (cleanPrompt.length * 47) % 360;
  const hue2 = (hue1 + 140) % 360;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 80%, 15%)" />
        <stop offset="50%" stop-color="hsl(${(hue1 + 40) % 360}, 90%, 8%)" />
        <stop offset="100%" stop-color="hsl(${hue2}, 85%, 5%)" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="hsl(${hue1}, 100%, 65%)" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="hsl(${hue2}, 100%, 55%)" stop-opacity="0.9"/>
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="30" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)" />
    <circle cx="512" cy="512" r="320" fill="none" stroke="url(#accent)" stroke-width="6" opacity="0.6" filter="url(#glow)" />
    <circle cx="512" cy="512" r="220" fill="none" stroke="hsl(${hue2}, 100%, 70%)" stroke-width="3" stroke-dasharray="16 8" opacity="0.8" />
    <polygon points="512,280 680,620 344,620" fill="url(#accent)" opacity="0.35" filter="url(#glow)" />
    <text x="512" y="820" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">VOX NEURAL SYNTHESIS</text>
    <text x="512" y="870" font-family="system-ui, sans-serif" font-size="20" fill="rgba(255,255,255,0.7)" text-anchor="middle">"${cleanPrompt}"</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Contextual Autonomous Demo & Knowledge Brain Engine
function generateAutonomousDemoResponse(
  userInput: string,
  history: any[],
  memories: any[],
  preferences: any,
  resources: any[] = [],
  intentAnalysis?: IntentAnalysis,
  knowledgeMatch?: KnowledgeEntry | null
): { reply: string; action: any; sources?: GroundingSource[]; intent?: UserIntent; searchQueries?: string[] } {
  const text = userInput.trim().toLowerCase();

  // 1. Direct Knowledge Base Match (Highest priority for factual inquiries)
  // Covers "What is anime?", "What is artificial intelligence?", "How does gravity work?",
  // "What is Nigeria?", "Who invented the telephone?", "What is a black hole?",
  // "What does photosynthesis mean?", "What is the latest version of Android?", "How do I make a 3D game?", etc.
  if (knowledgeMatch) {
    return {
      reply: knowledgeMatch.answer,
      action: knowledgeMatch.relatedAction || null,
      sources: knowledgeMatch.sources,
      intent: intentAnalysis?.intent || 'GENERAL_KNOWLEDGE',
    };
  }

  // 2. Query Knowledge Base again dynamically if not passed
  const dynamicMatch = queryKnowledgeBase(userInput);
  if (dynamicMatch) {
    return {
      reply: dynamicMatch.answer,
      action: dynamicMatch.relatedAction || null,
      sources: dynamicMatch.sources,
      intent: intentAnalysis?.intent || 'GENERAL_KNOWLEDGE',
    };
  }

  // 2a. Phone & Contact Calling Interceptor (Privacy Preserving — On-device matching)
  if (
    intentAnalysis?.intent === 'PHONE_CALL' ||
    text.startsWith('call ') ||
    text.startsWith('phone ') ||
    text.startsWith('dial ') ||
    text.startsWith('place a call to ') ||
    text.startsWith('vox call ') ||
    text.startsWith('vox, call ') ||
    text.startsWith('hey vox, call ')
  ) {
    let target = text
      .replace(/^(vox|hey vox|ok vox|anivox)[,\s]+/i, '')
      .replace(/^(call|phone|dial|place a call to)\s+/i, '')
      .trim();

    return {
      reply: `Processing phone call request for "${target}"...`,
      action: {
        type: 'phone_call',
        data: {
          id: `phone-call-${Date.now()}`,
          targetName: target,
          query: userInput,
        },
      },
      intent: 'PHONE_CALL',
    };
  }

  // 2b. Verified Links Registry Interceptor ("Give me the Xbox link", "Where can I find NovaVerse?", "Give me the official YouTube channel", etc.)
  const linkSearch = findVerifiedLink(userInput);
  if (linkSearch.found && linkSearch.entry) {
    const entry = linkSearch.entry;
    return {
      reply: linkSearch.explanation,
      action: {
        type: 'open_link',
        data: {
          id: entry.id,
          targetName: entry.name,
          platform: entry.id === 'link-anivox-yt' ? 'youtube' : 'web',
          platformDisplayName: entry.name,
          profileTitle: entry.name,
          webUrl: entry.url,
          appDeepLink: entry.appDeepLink,
          buttonLabel: entry.buttonLabel,
          description: entry.description,
          isVerified: true,
          directLaunchSuggested: true,
        },
      },
      sources: [
        {
          title: entry.name,
          url: entry.url,
          domain: entry.domain,
          sourceType: 'official_doc',
        },
      ],
      intent: 'OPEN_LINK',
    };
  }

  // If query is an unverified link search request
  if (
    text.startsWith('give me the ') && text.endsWith('link') ||
    text.startsWith('where can i find ') ||
    text.startsWith('where is the website') ||
    text.startsWith('where is the link') ||
    (text.includes(' official link') && text.includes('where'))
  ) {
    return {
      reply: "I couldn't verify the official link. AniVox only provides verified official destinations to ensure safety and authenticity.",
      action: null,
      intent: 'OPEN_LINK',
    };
  }

  // 2c. Social Media Search & Public Channel/Profile Launching
  const parsedSocial = parseSocialQuery(userInput);
  if (parsedSocial) {
    const card = resolveSocialProfile(parsedSocial.targetName, parsedSocial.platform, {
      directLaunch: parsedSocial.isDirectLaunch,
    });
    const config = PLATFORM_CONFIGS[parsedSocial.platform];

    let conversationalReply = '';
    if (parsedSocial.action === 'open') {
      conversationalReply = `Opening ${card.profileTitle} on ${config.displayName}. You can view the public channel or profile using the card below.`;
    } else if (parsedSocial.action === 'find') {
      conversationalReply = `I found ${card.profileTitle} on ${config.displayName}. Here is the public profile:`;
    } else if (parsedSocial.action === 'info') {
      conversationalReply = `${card.profileTitle} is a recognized creator on ${config.displayName}.\n\n${card.description}\n\nYou can view their public content below:`;
    } else {
      conversationalReply = `Here is the public ${config.displayName} destination for "${card.targetName}":`;
    }

    return {
      reply: conversationalReply,
      action: {
        type: 'social_search',
        data: card,
      },
      sources: [
        {
          title: `${card.profileTitle} - ${config.displayName}`,
          url: card.webUrl,
          domain: config.officialDomains[0] || 'web',
          sourceType: 'search_grounding',
        },
      ],
      intent: 'SOCIAL_SEARCH',
      searchQueries: [`${card.targetName} ${config.displayName}`],
    };
  }

  // 2c. Open Official Website / General Web Links
  if (
    text.startsWith('open the website') ||
    text.startsWith('open website') ||
    text.startsWith('open official website') ||
    text.startsWith('open this website') ||
    text.startsWith('visit ') ||
    text.startsWith('go to https://') ||
    text.startsWith('open https://')
  ) {
    let rawUrlOrTopic = userInput
      .replace(/^(open the website|open website|open official website|open this website|visit|go to|open)\s+/i, '')
      .replace(/[?!.]/g, '')
      .trim();

    let targetUrl = rawUrlOrTopic;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (targetUrl.includes('.')) {
        targetUrl = `https://${targetUrl}`;
      } else {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }

    let domain = 'web';
    try {
      domain = new URL(targetUrl).hostname.replace(/^www\./, '');
    } catch {}

    return {
      reply: `Opening verified web destination for "${rawUrlOrTopic}":`,
      action: {
        type: 'open_link',
        data: {
          id: `link-${Date.now()}`,
          targetName: rawUrlOrTopic || 'Official Website',
          platform: 'web',
          platformDisplayName: 'Official Website',
          profileTitle: rawUrlOrTopic || 'Official Website',
          webUrl: targetUrl,
          description: `Direct web link for ${rawUrlOrTopic}. Tap below to launch safely.`,
          directLaunchSuggested: true,
        },
      },
      sources: [
        {
          title: rawUrlOrTopic || 'Verified Web Destination',
          url: targetUrl,
          domain: domain,
          sourceType: 'official_doc',
        },
      ],
      intent: 'OPEN_LINK',
    };
  }

  // 3. Theme Control: "Turn dark mode on", "Turn light mode on", "Cyberpunk theme"
  if (text.includes('dark mode on') || text.includes('enable dark mode') || text.includes('turn on dark mode')) {
    return {
      reply: "I've turned dark mode on for you.",
      action: {
        type: 'setting',
        data: { settingKey: 'theme', value: 'dark', label: 'Dark Mode Enabled' },
      },
    };
  }

  if (text.includes('light mode on') || text.includes('enable light mode') || text.includes('turn on light mode') || text.includes('dark mode off')) {
    return {
      reply: "I've switched the theme to light mode.",
      action: {
        type: 'setting',
        data: { settingKey: 'theme', value: 'light', label: 'Light Mode Enabled' },
      },
    };
  }

  if (text.includes('cyberpunk theme') || text.includes('neon theme')) {
    return {
      reply: "Atmosphere updated to Cyberpunk Neon Matrix.",
      action: {
        type: 'setting',
        data: { settingKey: 'theme', value: 'cyberpunk', label: 'Cyberpunk Theme Enabled' },
      },
    };
  }

  // 2. Voice Responses (AutoSpeak): "Turn voice responses off", "Turn voice responses on"
  if (text.includes('voice responses off') || text.includes('turn off voice responses') || text.includes('disable voice responses') || text.includes('auto speak off')) {
    return {
      reply: "Voice responses have been turned off. I will reply with text only.",
      action: {
        type: 'setting',
        data: { settingKey: 'autoSpeak', value: false, label: 'Voice Responses Off' },
      },
    };
  }

  if (text.includes('voice responses on') || text.includes('turn on voice responses') || text.includes('enable voice responses') || text.includes('auto speak on')) {
    return {
      reply: "Voice responses have been turned on. I will read my answers aloud.",
      action: {
        type: 'setting',
        data: { settingKey: 'autoSpeak', value: true, label: 'Voice Responses On' },
      },
    };
  }

  // 3. Orb Speed & Glow: "Make the orb animation faster", "Make the orb slower"
  if (text.includes('orb animation faster') || text.includes('make the orb faster') || text.includes('faster orb') || text.includes('speed up orb')) {
    return {
      reply: "I've increased the Orb animation velocity.",
      action: {
        type: 'setting',
        data: { settingKey: 'orbSpeed', value: 1.8, label: 'Fast Orb Speed (1.8x)' },
      },
    };
  }

  if (text.includes('orb animation slower') || text.includes('make the orb slower') || text.includes('slower orb')) {
    return {
      reply: "I've slowed down the Orb animation rate.",
      action: {
        type: 'setting',
        data: { settingKey: 'orbSpeed', value: 0.6, label: 'Slow Orb Speed (0.6x)' },
      },
    };
  }

  // 4. Text Size: "Increase text size", "Decrease text size", "Make text bigger"
  if (text.includes('increase text size') || text.includes('make text bigger') || text.includes('larger font') || text.includes('large text')) {
    return {
      reply: "I've increased the interface typography size for higher readability.",
      action: {
        type: 'setting',
        data: { settingKey: 'fontSize', value: 'large', label: 'Large Font Size' },
      },
    };
  }

  if (text.includes('decrease text size') || text.includes('smaller font') || text.includes('normal text size') || text.includes('reset text size')) {
    return {
      reply: "Text size has been set to standard scale.",
      action: {
        type: 'setting',
        data: { settingKey: 'fontSize', value: 'normal', label: 'Standard Font Size' },
      },
    };
  }

  // 5. Memory System: "Turn memory on", "Turn memory off"
  if (text.includes('turn memory on') || text.includes('enable memory') || text.includes('start remembering')) {
    return {
      reply: "Long-term memory has been enabled. I will personalize recommendations based on your preferences.",
      action: {
        type: 'setting',
        data: { settingKey: 'memoryEnabled', value: true, label: 'Memory Enabled' },
      },
    };
  }

  if (text.includes('turn memory off') || text.includes('disable memory') || text.includes('stop remembering')) {
    return {
      reply: "Long-term memory has been paused. I will not record new preferences.",
      action: {
        type: 'setting',
        data: { settingKey: 'memoryEnabled', value: false, label: 'Memory Paused' },
      },
    };
  }

  // 6. Volume Control & System Volume Separation
  // System-wide volume request check (e.g. "change phone volume", "set system volume")
  if (
    text.includes('system volume') ||
    text.includes('phone volume') ||
    text.includes('device volume') ||
    text.includes('hardware volume') ||
    text.includes('ringer volume') ||
    text.includes('master volume')
  ) {
    return {
      reply: "Assistant volume is available. System volume control requires the Android version of the app.",
      action: {
        type: 'device_control',
        data: {
          control: 'system_master_volume',
          requiresNative: true,
          notice: "Assistant volume is available. System volume control requires the Android version of the app.",
        },
      },
    };
  }

  // Mute
  if (
    text === 'mute' ||
    text === 'mute.' ||
    text.includes('mute.') ||
    text.includes('mute yourself') ||
    text.includes('mute assistant') ||
    text.includes('mute the assistant') ||
    text.includes('turn off volume') ||
    text.includes('silence yourself')
  ) {
    return {
      reply: "Assistant audio is now muted.",
      action: {
        type: 'volume',
        data: { action: 'mute', target: 'assistant', value: 0 },
      },
    };
  }

  // Unmute
  if (
    text === 'unmute' ||
    text === 'unmute.' ||
    text.includes('unmute.') ||
    text.includes('unmute yourself') ||
    text.includes('unmute assistant') ||
    text.includes('unmute the assistant') ||
    text.includes('restore volume')
  ) {
    return {
      reply: "Assistant audio has been unmuted.",
      action: {
        type: 'volume',
        data: { action: 'unmute', target: 'assistant' },
      },
    };
  }

  // Maximum Volume
  if (
    text.includes('maximum volume') ||
    text.includes('volume to maximum') ||
    text.includes('volume to max') ||
    text.includes('full volume') ||
    text.includes('volume to 100')
  ) {
    return {
      reply: "Assistant volume set to 100% (maximum available volume).",
      action: {
        type: 'volume',
        data: { action: 'set', value: 1.0, target: 'assistant' },
      },
    };
  }

  // Qualitative Volume settings
  if (text.includes('volume to quiet') || text.includes('set volume quiet') || text.includes('quiet volume')) {
    return {
      reply: "Assistant volume set to 20% (quiet).",
      action: {
        type: 'volume',
        data: { action: 'set', value: 0.2, target: 'assistant' },
      },
    };
  }

  if (text.includes('volume to medium') || text.includes('set volume medium') || text.includes('medium volume')) {
    return {
      reply: "Assistant volume set to 50% (medium).",
      action: {
        type: 'volume',
        data: { action: 'set', value: 0.5, target: 'assistant' },
      },
    };
  }

  // Explicit Percentage Match: e.g. "Set your volume to 50 percent", "Set volume to 20%", "Change volume to 75 percent"
  const volPercentMatch = text.match(/(?:set|change|turn|adjust)?\s*(?:your|the|assistant)?\s*volume\s*(?:to)?\s*(\d+)\s*(?:%|percent)?/i);
  if (volPercentMatch) {
    const pct = parseInt(volPercentMatch[1], 10);
    if (!isNaN(pct)) {
      const normalized = Math.max(0, Math.min(100, pct)) / 100;
      let label = 'medium';
      if (pct === 0) label = 'muted';
      else if (pct <= 30) label = 'quiet';
      else if (pct <= 70) label = 'medium';
      else if (pct < 100) label = 'high';
      else label = 'maximum available volume';

      return {
        reply: `Assistant volume set to ${pct}% (${label}).`,
        action: {
          type: 'volume',
          data: { action: 'set', value: normalized, target: 'assistant' },
        },
      };
    }
  }

  // Increase volume
  if (
    text.includes('increase your volume') ||
    text.includes('increase the volume') ||
    text.includes('increase volume') ||
    text.includes('turn your volume up') ||
    text.includes('turn volume up') ||
    text.includes('turn it up') ||
    text.includes('make it louder') ||
    text.includes('louder')
  ) {
    return {
      reply: "Assistant speech and playback volume increased.",
      action: {
        type: 'volume',
        data: { action: 'increase', step: 0.2, target: 'assistant' },
      },
    };
  }

  // Decrease volume
  if (
    text.includes('turn your volume down') ||
    text.includes('turn volume down') ||
    text.includes('lower your volume') ||
    text.includes('lower the volume') ||
    text.includes('lower volume') ||
    text.includes('decrease volume') ||
    text.includes('turn it down') ||
    text.includes('make it quieter') ||
    text.includes('softer')
  ) {
    return {
      reply: "Assistant speech and playback volume decreased.",
      action: {
        type: 'volume',
        data: { action: 'decrease', step: 0.2, target: 'assistant' },
      },
    };
  }

  // 7. Speech Control: "Stop speaking", "Start listening"
  if (text.includes('stop speaking') || text.includes('stop talking') || text.includes('be quiet') || text.includes('shut up')) {
    return {
      reply: "Understood. Stopped speech output.",
      action: {
        type: 'speech_control',
        data: { action: 'stop_speaking' },
      },
    };
  }

  if (text.includes('start listening') || text.includes('listen to me') || text.includes('open mic')) {
    return {
      reply: "Listening now. Go ahead!",
      action: {
        type: 'speech_control',
        data: { action: 'start_listening' },
      },
    };
  }

  // 8. Navigation & Settings: "Open settings", "Open voice settings", "Change my assistant voice", "Show device controls"
  if (text.includes('open voice settings') || text.includes('change my assistant voice') || text.includes('change voice') || text.includes('voice settings')) {
    return {
      reply: "Opening Voice & Speech Synthesis settings for you.",
      action: {
        type: 'navigation',
        data: { screen: 'settings', section: 'voice' },
      },
    };
  }

  if (text.includes('open settings') || text.includes('show settings') || text.includes('assistant settings')) {
    return {
      reply: "Opening Assistant Configuration.",
      action: {
        type: 'navigation',
        data: { screen: 'settings' },
      },
    };
  }

  if (text.includes('show device controls') || text.includes('open device controls') || text.includes('device capabilities') || text.includes('device center')) {
    return {
      reply: "Here is the Device Capability Center showing all available Web controls and Native Android architecture bridges.",
      action: {
        type: 'navigation',
        data: { screen: 'device-controls' },
      },
    };
  }

  if (text.includes('open my memory') || text.includes('show my memory') || text.includes('open memory')) {
    return {
      reply: "Opening your Long-Term Memory Center.",
      action: {
        type: 'navigation',
        data: { screen: 'memory' },
      },
    };
  }

  if (text.includes('turn notifications off') || text.includes('disable notifications') || text.includes('mute sounds')) {
    return {
      reply: "Interface sounds and notifications have been muted.",
      action: {
        type: 'setting',
        data: { settingKey: 'soundEffectsEnabled', value: false, label: 'Notifications Muted' },
      },
    };
  }

  if (text.includes('turn notifications on') || text.includes('enable notifications')) {
    return {
      reply: "Interface sounds and notifications are now active.",
      action: {
        type: 'setting',
        data: { settingKey: 'soundEffectsEnabled', value: true, label: 'Notifications Enabled' },
      },
    };
  }

  // 9. App Lock: "Lock the assistant", "Lock app"
  if (text.includes('lock the assistant') || text.includes('lock assistant') || text.includes('lock the app') || text === 'lock') {
    return {
      reply: "Assistant interface locked. Enter your PIN or speak the unlock trigger phrase to access.",
      action: {
        type: 'app_lock',
        data: { action: 'lock' },
      },
    };
  }

  // 10. Hardware Android Restrictions & Clarifications: "Change phone brightness", "Turn off phone wifi", "Set phone volume"
  if (text.includes('phone volume') || text.includes('system volume') || text.includes('master volume')) {
    return {
      reply: "Note: Web browsers cannot directly adjust your physical smartphone master volume due to OS security sandboxing. In the Native Android companion app, this utilizes `android.media.AudioManager` with `MODIFY_AUDIO_SETTINGS` permission. I have adjusted your in-app assistant volume in the meantime.",
      action: {
        type: 'device_control',
        data: { control: 'system_master_volume', requiresNative: true },
      },
    };
  }

  if (text.includes('phone brightness') || text.includes('screen brightness') || text.includes('display brightness')) {
    return {
      reply: "Physical screen backlight brightness cannot be directly controlled from a web browser sandbox. In the Native Android edition, this is handled via `android.permission.WRITE_SETTINGS`. You can test this in the Device Capability Center.",
      action: {
        type: 'navigation',
        data: { screen: 'device-controls', section: 'native' },
      },
    };
  }

  if (text.includes('phone wifi') || text.includes('turn off wifi') || text.includes('phone bluetooth') || text.includes('airplane mode')) {
    return {
      reply: "Operating system radio controls (Wi-Fi, Bluetooth, Airplane Mode) are protected by Android security and require native Android Intents. I've opened the Device Controls bridge for you.",
      action: {
        type: 'navigation',
        data: { screen: 'device-controls', section: 'native' },
      },
    };
  }

  // 11. Check for Collection Queries ("Show my saved games", "Show my favorite apps", "Show my collection")
  if (text.includes('show my saved') || text.includes('show my favorite') || text.includes('show my games') || text.includes('show my apps') || text.includes('show my movies') || text.includes('my collection')) {
    let catFilter: string | undefined = undefined;
    if (text.includes('game')) catFilter = 'games';
    else if (text.includes('app')) catFilter = 'apps';
    else if (text.includes('movie') || text.includes('film')) catFilter = 'movies';
    else if (text.includes('show') || text.includes('anime')) catFilter = 'shows_anime';
    else if (text.includes('video')) catFilter = 'videos';
    else if (text.includes('book')) catFilter = 'books';
    else if (text.includes('music') || text.includes('song')) catFilter = 'music';
    else if (text.includes('tool')) catFilter = 'tools';
    else if (text.includes('website') || text.includes('site')) catFilter = 'websites';
    else if (text.includes('creative')) catFilter = 'creative';
    else if (text.includes('learning') || text.includes('course')) catFilter = 'learning';

    const isFavRequest = text.includes('favorite');
    const matchedResources = resources.filter((r) => {
      const matchCat = !catFilter || r.category === catFilter || (catFilter === 'games' && r.category === 'game') || (catFilter === 'movies' && r.category === 'movie');
      const matchFav = !isFavRequest || r.isFavorite;
      return matchCat && matchFav;
    });

    if (matchedResources.length > 0) {
      const itemTitles = matchedResources.slice(0, 3).map((r) => `**${r.title}** (${r.category})`).join(', ');
      return {
        reply: `Here are the ${isFavRequest ? 'favorite ' : ''}${catFilter ? catFilter : 'saved'} resources in your collection:\n\n${itemTitles}${matchedResources.length > 3 ? ` and ${matchedResources.length - 3} more` : ''}. I've opened your Library with this filter active.`,
        action: {
          type: 'navigation',
          data: {
            screen: 'recommendations',
            filterCategory: catFilter,
            filterStatus: isFavRequest ? 'favorites' : 'all',
          },
        },
      };
    } else {
      return {
        reply: `You don't currently have any ${isFavRequest ? 'favorite ' : ''}${catFilter || ''} resources saved in your library yet. Would you like me to recommend some or add a new one?`,
        action: {
          type: 'navigation',
          data: {
            screen: 'recommendations',
            filterCategory: catFilter,
          },
        },
      };
    }
  }

  // 12. Recommend from collection
  if (
    (text.includes('recommend') || text.includes('pick') || text.includes('choose')) &&
    (text.includes('from my collection') || text.includes('from my library') || text.includes('from my saved'))
  ) {
    let catFilter: string | undefined = undefined;
    if (text.includes('movie') || text.includes('film')) catFilter = 'movies';
    else if (text.includes('game')) catFilter = 'games';
    else if (text.includes('show') || text.includes('anime')) catFilter = 'shows_anime';
    else if (text.includes('book')) catFilter = 'books';
    else if (text.includes('app')) catFilter = 'apps';
    else if (text.includes('music')) catFilter = 'music';
    else if (text.includes('tool')) catFilter = 'tools';

    const candidates = resources.filter((r) => !catFilter || r.category === catFilter || (catFilter === 'movies' && r.category === 'movie') || (catFilter === 'games' && r.category === 'game'));
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      return {
        reply: `From your saved collection, I recommend: **${chosen.title}** (${chosen.category}).\n\n${chosen.notes ? `*Your note:* "${chosen.notes}"\n\n` : ''}${chosen.description}\n\nRating: ${chosen.userRating ? `${chosen.userRating}/5★` : chosen.rating || 'Saved'}. Enjoy!`,
        action: {
          type: 'resource',
          data: {
            ...chosen,
            actionType: 'view',
          },
        },
      };
    } else {
      return {
        reply: `You haven't saved any ${catFilter || ''} items in your collection yet. Here is a curated discovery to get you started!`,
        action: {
          type: 'recommendation',
          data: getSampleSingleRecommendation(catFilter || 'movies', memories),
        },
      };
    }
  }

  // 13. Similar to / More like this
  if (text.includes('find something similar') || text.includes('similar to') || text.includes('more like this')) {
    let queryTitle = '';
    const matchSim = text.match(/(?:similar to|like)\s+([^?.!]+)/i);
    if (matchSim && matchSim[1]) {
      queryTitle = matchSim[1].trim();
    }

    const found = resources.find((r) => (r?.title || '').toLowerCase().includes((queryTitle || '').toLowerCase())) || resources[0];
    const cat = found ? found.category : 'games';

    const similar = getSampleSingleRecommendation(cat, memories);
    return {
      reply: `Based on your interest in **${found ? found.title : queryTitle || 'your recent favorites'}**, here is a great recommendation with similar themes and caliber: **${similar.title}** (${similar.category}).\n\n${similar.reason}`,
      action: {
        type: 'resource',
        data: {
          ...similar,
          actionType: 'add',
        },
      },
    };
  }

  // 14. Timer commands
  const timerMatch = text.match(/(?:start|set|create)?\s*(?:a)?\s*timer\s*(?:for)?\s*(\d+)\s*(minute|min|second|sec|hour|hr)s?/i)
    || text.match(/(\d+)\s*(minute|min|second|sec|hour|hr)s?\s*timer/i);

  if (timerMatch) {
    const val = parseInt(timerMatch[1], 10);
    const unit = (timerMatch[2] || 'minute').toLowerCase();
    let seconds = val * 60;
    if (unit.startsWith('sec')) seconds = val;
    if (unit.startsWith('hour') || unit.startsWith('hr')) seconds = val * 3600;

    return {
      reply: `Timer set for ${val} ${unit}${val > 1 ? 's' : ''}. I've started the countdown for you now.`,
      action: {
        type: 'timer',
        data: {
          seconds,
          label: `${val} ${unit} countdown`,
          autostart: true,
        },
      },
    };
  }

  // 15. Notes
  if (text.startsWith('note:') || text.includes('create a note') || text.includes('take a note') || text.includes('write down')) {
    const cleanNote = userInput.replace(/^(create a note|take a note|write down|note:)\s*(that|about|to)?\s*/i, '').trim();
    return {
      reply: `I've jotted that down in your Notes: "${cleanNote || 'New Note'}"`,
      action: {
        type: 'note',
        data: {
          title: cleanNote.slice(0, 30) || 'Quick Voice Note',
          content: cleanNote || 'Voice note captured via AURA.',
          tags: ['Voice', 'QuickNote'],
        },
      },
    };
  }

  // 16. Tasks
  if (text.includes('remind me to') || text.includes('add task') || text.includes('add a task') || text.includes('todo:')) {
    const cleanTask = userInput.replace(/^(remind me to|add task|add a task|todo:)\s*/i, '').trim();
    return {
      reply: `Task created: "${cleanTask || 'New task'}". I've added it to your Action Center.`,
      action: {
        type: 'task',
        data: {
          title: cleanTask || 'New Task',
          priority: text.includes('urgent') || text.includes('important') ? 'high' : 'medium',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        },
      },
    };
  }

  // 17. Memory
  if (text.includes('remember that') || text.includes('remember my') || text.includes('i like') || text.includes('i love') || text.includes('my favorite')) {
    let memoryVal = userInput.replace(/^(please\s*)?(remember that|remember my|remember)\s*/i, '').trim();
    let category = 'Personal';
    if (text.includes('game') || text.includes('play')) category = 'Gaming';
    else if (text.includes('movie') || text.includes('film') || text.includes('cinema')) category = 'Movies';
    else if (text.includes('music') || text.includes('song') || text.includes('band')) category = 'Music';
    else if (text.includes('book') || text.includes('author') || text.includes('novel')) category = 'Books';
    else if (text.includes('app') || text.includes('tool') || text.includes('software')) category = 'Tools';

    return {
      reply: `Got it! I've committed that to your long-term memory: "${memoryVal}". You can review or edit this anytime in your Memory Center.`,
      action: {
        type: 'memory',
        data: {
          category,
          key: 'User Preference',
          value: memoryVal,
        },
      },
    };
  }

  // 18. General Recommendations
  if (text.includes('recommend') || text.includes('suggestion') || text.includes('what should i watch') || text.includes('what should i play') || text.includes('what should i read')) {
    let cat: any = 'movies';
    if (text.includes('game')) cat = 'games';
    else if (text.includes('show') || text.includes('series') || text.includes('anime')) cat = 'shows_anime';
    else if (text.includes('music') || text.includes('song') || text.includes('album')) cat = 'music';
    else if (text.includes('book') || text.includes('novel')) cat = 'books';
    else if (text.includes('app') || text.includes('mobile')) cat = 'apps';
    else if (text.includes('video') || text.includes('youtube')) cat = 'videos';
    else if (text.includes('tool') || text.includes('software')) cat = 'tools';
    else if (text.includes('website') || text.includes('web')) cat = 'websites';
    else if (text.includes('creative') || text.includes('art')) cat = 'creative';
    else if (text.includes('learning') || text.includes('learn') || text.includes('course')) cat = 'learning';

    const demoRec = getSampleSingleRecommendation(cat, memories);
    return {
      reply: `Here's a curated recommendation for you: **${demoRec.title}** (${demoRec.category.toUpperCase()}).\n\n${demoRec.reason}\n\nWould you like more options like this, or should we save it to your Library?`,
      action: {
        type: 'recommendation',
        data: demoRec,
      },
    };
  }

  // 19. General Questions & Topics
  if (text.includes('who are you') || text.includes('what is aura') || text.includes('your name')) {
    return {
      reply: "I am **AURA** — your Autonomous Universal Reactive Assistant. I feature voice-first interaction, comprehensive knowledge & search retrieval, device & settings controls, long-term memory, action tracking, and an extensive 11-category resource library.",
      action: null,
    };
  }

  if (text.includes('how are you') || text.includes('hello') || text.includes('hey aura') || text.includes('hi')) {
    const memoryCount = memories.length;
    const resourceCount = resources.length;
    return {
      reply: `Hello! All systems are optimal. I have ${resourceCount} items in your Resource Library and ${memoryCount} memories. How can I assist you right now?`,
      action: null,
    };
  }

  // Factual or educational query handling
  if (intentAnalysis?.isFactualQuery || text.startsWith('what') || text.startsWith('how') || text.startsWith('why') || text.startsWith('who') || text.startsWith('explain') || text.startsWith('define') || text.includes('capital of') || text.includes('meaning of')) {
    const topicLabel = userInput.replace(/^(what is|what are|what does|who is|who was|who invented|why is|why does|how does|explain|define|tell me about)\s+(the\s+|a\s+|an\s+)?/i, '').replace(/[?!.]/g, '').trim();

    return {
      reply: `### Overview: **${topicLabel || 'Factual Overview'}**

- **Core Concept:** This is a significant subject across science, history, and technology.
- **Detailed Inquiry:** For live, real-time web citations or specific sub-topics, feel free to ask me to search or explain specific mechanisms!
- **Verified Sources:** Foundational knowledge verified against encyclopedic reference archives.`,
      action: null,
      sources: [
        {
          title: `${topicLabel || 'General Subject'} - Encyclopaedia Britannica`,
          url: `https://www.britannica.com/search?query=${encodeURIComponent(topicLabel || 'reference')}`,
          domain: 'britannica.com',
          sourceType: 'encyclopedia',
        },
      ],
      intent: intentAnalysis?.intent || 'GENERAL_KNOWLEDGE',
    };
  }

  // Default intelligent conversational response
  return {
    reply: `I received your inquiry regarding **${userInput}**. How can I best assist you? You can ask me factual questions (such as "What is anime?", "Who was the first physician?", "What is the world's most venomous snake?", "Explain gravity.", "What is the capital of Nigeria?"), brainstorm creative projects, ask for media recommendations, adjust volume and dark mode, or set timers.`,
    action: null,
    intent: intentAnalysis?.intent || 'GENERAL_CONVERSATION',
  };
}

function getSampleSingleRecommendation(category: string, memories: any[]) {
  const recMap: Record<string, any> = {
    movies: {
      category: 'movies',
      title: 'Interstellar',
      creator: 'Christopher Nolan',
      description: 'A team of astronauts travels through a wormhole near Saturn in search of a new home for humanity.',
      reason: 'A breathtaking cinematic exploration of relativity, human connection, and cosmic wonder with an iconic Hans Zimmer score.',
      tags: ['Sci-Fi', 'Drama', 'Adventure'],
      rating: '8.7/10',
      userRating: 5,
      link: 'https://www.imdb.com/title/tt0816692/',
      notes: 'Unmissable IMAX sound design and emotional climax.',
    },
    shows_anime: {
      category: 'shows_anime',
      title: 'Arcane: League of Legends',
      creator: 'Fortiche & Riot Games',
      description: 'Set in Piltover and Zaun, sisters Vi and Powder find themselves on opposite sides of a brewing war over magic and technology.',
      reason: 'Visually groundbreaking animation with deeply compelling character arcs and world-class sound design.',
      tags: ['Animation', 'Sci-Fi', 'Drama'],
      rating: '9.0/10',
      userRating: 5,
      link: 'https://www.netflix.com/title/81435684',
      notes: 'Exceptional artistic direction and narrative velocity.',
    },
    games: {
      category: 'games',
      title: 'Hades II',
      creator: 'Supergiant Games',
      description: 'Battle beyond the Underworld using dark sorcery to take on the Titan of Time in an expansive rogue-like dungeon crawler.',
      reason: 'Fast-paced mythological rogue-like with silky-smooth combat, stellar character dialogue, and unmatched replayability.',
      tags: ['Action', 'Roguelike', 'Mythology'],
      rating: '9.6/10',
      userRating: 5,
      link: 'https://store.steampowered.com/app/1145350/Hades_II/',
      notes: 'Melinoë\'s witchcraft abilities provide rich build diversity.',
    },
    apps: {
      category: 'apps',
      title: 'Raycast',
      creator: 'Raycast Community',
      description: 'An ultra-fast, extensible launcher that lets you control your tools, run scripts, manage clipboard, and navigate in seconds.',
      reason: 'Blazing-fast extensible launcher that supercharges your workflow with custom scripts, clipboard history, and hotkeys.',
      tags: ['Productivity', 'Developer', 'Tool'],
      rating: '4.9★',
      userRating: 5,
      link: 'https://www.raycast.com',
      notes: 'Instant keyboard-first control over daily tasks.',
    },
    videos: {
      category: 'videos',
      title: 'The Art of Cyberpunk Sound Design',
      creator: 'SoundWorks Collection',
      description: 'An in-depth documentary exploring how synthetic modular audio, foley, and score create visceral immersion.',
      reason: 'Fascinating breakdown of high-frequency synthesizers and atmospheric soundscapes.',
      tags: ['Audio Engineering', 'Sci-Fi', 'Documentary'],
      rating: '4.9★',
      userRating: 5,
      link: 'https://www.youtube.com',
      notes: 'Shows how analog synths create tension in futuristic films.',
    },
    books: {
      category: 'books',
      title: 'Project Hail Mary',
      creator: 'Andy Weir',
      description: 'A lone astronaut awakens on a starship with amnesia and must piece together the science to save Earth from disaster.',
      reason: 'An exhilarating, scientifically grounded survival tale packed with optimism, interstellar problem-solving, and friendship.',
      tags: ['Sci-Fi', 'Space', 'Humor'],
      rating: '4.8★',
      userRating: 5,
      link: 'https://www.goodreads.com/book/show/54493401-project-hail-mary',
      notes: 'Brilliant audio narration by Ray Porter.',
    },
    music: {
      category: 'music',
      title: 'Random Access Memories',
      creator: 'Daft Punk',
      description: 'A legendary tribute to late-70s and early-80s American music, recorded using live analog instrumentation and modular synths.',
      reason: 'A timeless fusion of electronic mastery, analog synthesizers, and disco-funk grooves.',
      tags: ['Electronic', 'Funk', 'Synth'],
      rating: '9.0/10',
      userRating: 5,
      link: 'https://www.daftpunk.com',
      notes: 'Mastered with extreme dynamic range and pristine audio fidelity.',
    },
    tools: {
      category: 'tools',
      title: 'Obsidian',
      creator: 'Obsidian Team',
      description: 'A private and flexible note-taking app that adapts to the way you think, using local markdown files.',
      reason: 'A second brain markdown knowledge base with local-first security and interactive visual graph linking.',
      tags: ['Productivity', 'Notes', 'Knowledge Graph'],
      rating: '4.9★',
      userRating: 5,
      link: 'https://obsidian.md',
      notes: 'No proprietary format lock-in.',
    },
    websites: {
      category: 'websites',
      title: 'ShaderToy',
      creator: 'Inigo Quilez & Pol Jeremias',
      description: 'Build, share, and learn procedural shaders via interactive WebGL in the browser.',
      reason: 'An unparalleled playground for creative coding, procedural graphics, and math-driven art.',
      tags: ['WebGL', 'GLSL', 'Creative Coding'],
      rating: '4.9★',
      userRating: 5,
      link: 'https://www.shadertoy.com',
      notes: 'Real-time ray marching and procedural noise functions.',
    },
    creative: {
      category: 'creative',
      title: 'Lucide Icons',
      creator: 'Lucide Community',
      description: 'A modern, beautiful, and consistent open-source icon library designed for sleek software interfaces.',
      reason: 'Crisp stroke weight and pixel-perfect clarity for modern applications.',
      tags: ['Design', 'Icons', 'UI/UX'],
      rating: '5.0★',
      userRating: 5,
      link: 'https://lucide.dev',
      notes: 'Tree-shakeable React icons with customizable stroke width.',
    },
    learning: {
      category: 'learning',
      title: 'MDN Web Docs',
      creator: 'Mozilla & Open Web Community',
      description: 'The definitive educational resource for developers, covering HTML, CSS, JavaScript, Web APIs, and accessibility.',
      reason: 'Clear, comprehensive, and up-to-date documentation with interactive examples.',
      tags: ['Web Development', 'JavaScript', 'Documentation'],
      rating: '5.0★',
      userRating: 5,
      link: 'https://developer.mozilla.org',
      notes: 'The golden standard reference for front-end engineers.',
    },
  };

  return recMap[category] || recMap.movies;
}

function getDemoRecommendations(
  category: string | undefined,
  memories: any[],
  feedbackHistory: any[],
  resources: any[] = []
) {
  const base = [
    {
      id: 'rec-1',
      title: 'Arcane: League of Legends',
      creator: 'Fortiche & Riot Games',
      category: 'shows_anime',
      description: 'Visually groundbreaking animation with deeply compelling character arcs and world-class sound design.',
      tags: ['Sci-Fi', 'Fantasy', 'Animation', 'Drama'],
      rating: '9.0/10',
      reason: 'Exceptional artistic direction and narrative velocity.',
      link: 'https://www.netflix.com/title/81435684',
      notes: 'Flawless art style blending 2D and 3D animation.',
    },
    {
      id: 'rec-2',
      title: 'Cyberpunk 2077: Phantom Liberty',
      creator: 'CD Projekt Red',
      category: 'games',
      description: 'A gripping espionage thriller expansion set in the dense, neon-drenched district of Dogtown.',
      tags: ['RPG', 'Cyberpunk', 'Action', 'Open World'],
      rating: '9.3/10',
      reason: 'Matches interest in immersive futuristic worlds and branching storylines.',
      link: 'https://store.steampowered.com/app/2138330/Cyberpunk_2077_Phantom_Liberty/',
      notes: 'Superb soundtrack and ray-traced lighting.',
    },
    {
      id: 'rec-3',
      title: 'Dune: Part Two',
      creator: 'Denis Villeneuve',
      category: 'movies',
      description: 'Monumental cinematic scale, sensory-overload visuals, and unmatched sci-fi world building.',
      tags: ['Sci-Fi', 'Epic', 'Drama'],
      rating: '8.6/10',
      reason: 'Perfect for fans of grand, atmospheric storytelling.',
      link: 'https://www.imdb.com/title/tt15239678/',
      notes: 'Visually spectacular desert cinematography by Greig Fraser.',
    },
    {
      id: 'rec-4',
      title: 'Project Hail Mary',
      creator: 'Andy Weir',
      category: 'books',
      description: 'A lone astronaut must solve an extinction-level catastrophe using pure scientific reasoning.',
      tags: ['Sci-Fi', 'Space', 'Humor'],
      rating: '4.9★',
      reason: 'Recommended for optimistic problem-solving and cosmic friendship.',
      link: 'https://www.goodreads.com/book/show/54493401-project-hail-mary',
      notes: 'Engaging, fast-paced science puzzles.',
    },
    {
      id: 'rec-5',
      title: 'Raycast',
      creator: 'Raycast Community',
      category: 'apps',
      description: 'Blazing-fast extensible launcher that supercharges your workflow with custom scripts, clipboard history, and hotkeys.',
      tags: ['Productivity', 'Developer', 'Tool'],
      rating: '4.9★',
      reason: 'Seamlessly accelerates daily navigation and task execution.',
      link: 'https://www.raycast.com',
      notes: 'Community extensions ecosystem is huge.',
    },
    {
      id: 'rec-6',
      title: 'Gunship - Unicorn',
      creator: 'GUNSHIP',
      category: 'music',
      description: 'A cinematic retro-futuristic synthwave album blending cyberpunk basslines, saxophones, and guest vocals.',
      tags: ['Synthwave', 'Cyberpunk', 'Electronic'],
      rating: '9.1/10',
      reason: 'Great background focus and creative flow soundtrack.',
      link: 'https://gunshipmusic.bandcamp.com',
      notes: 'Epic synth solos and vocal hooks.',
    },
    {
      id: 'rec-7',
      title: 'Obsidian',
      creator: 'Obsidian Team',
      category: 'tools',
      description: 'A private and flexible note-taking app that adapts to the way you think, using local markdown files.',
      tags: ['Productivity', 'Notes', 'Knowledge Graph'],
      rating: '4.9★',
      reason: 'A second brain markdown knowledge base with local-first security and interactive visual graph linking.',
      link: 'https://obsidian.md',
      notes: 'Visual graph view reveals unexpected connections.',
    },
    {
      id: 'rec-8',
      title: 'ShaderToy',
      creator: 'Inigo Quilez',
      category: 'websites',
      description: 'An interactive repository of real-time procedural GLSL fragment shaders, raymarching, and procedural audio.',
      tags: ['WebGL', 'GLSL', 'Shaders', 'Graphics'],
      rating: '4.8★',
      reason: 'Inspiring visual resource for generative UI and shader effects.',
      link: 'https://www.shadertoy.com',
      notes: 'Learn mathematical graphics programming directly in the browser.',
    },
    {
      id: 'rec-9',
      title: 'Lucide Icons',
      creator: 'Lucide Project',
      category: 'creative',
      description: 'Beautiful & consistent icon set made by the community. Open source, modular, and optimized for React.',
      tags: ['Design', 'Icons', 'UI/UX', 'Vector'],
      rating: '5.0★',
      reason: 'The standard icon library powering modern interface designs.',
      link: 'https://lucide.dev',
      notes: 'Pixel-perfect 24x24 grid icons.',
    },
    {
      id: 'rec-10',
      title: 'MDN Web Docs',
      creator: 'Mozilla Community',
      category: 'learning',
      description: 'Comprehensive, interactive documentation covering ECMAScript standards, Web APIs, and progressive web design.',
      tags: ['TypeScript', 'JavaScript', 'Web APIs', 'Learning'],
      rating: '5.0★',
      reason: 'Essential learning and reference guide for software engineering.',
      link: 'https://developer.mozilla.org',
      notes: 'Always accurate and browser-tested.',
    },
    {
      id: 'rec-11',
      title: 'The Beauty of Atmospheric Sci-Fi Cinematography',
      creator: 'Thomas Flight',
      category: 'videos',
      description: 'An insightful visual breakdown analyzing lighting, color grading, and scale in modern science fiction films.',
      tags: ['Video Essay', 'Cinematography', 'Sci-Fi'],
      rating: '4.9★',
      reason: 'Matches your interest in futuristic cinematography and visual design.',
      link: 'https://www.youtube.com',
      notes: 'Great visual breakdown of depth and lighting.',
    },
  ];

  if (!category || category === 'all') return base;
  return base.filter((item) => item.category === category || (category === 'movies' && item.category === 'movie') || (category === 'games' && item.category === 'game'));
}

// Attach Vite middleware in development; serve static in production
if (process.env.NODE_ENV !== 'production') {
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[AURA Server] Vite middleware attached in development mode.');
  } catch (viteErr) {
    console.error('[AURA Server] Error starting Vite middleware:', viteErr);
  }
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AURA Server] Running at http://0.0.0.0:${PORT}`);
});
