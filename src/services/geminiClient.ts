import {
  ChatMessage,
  MemoryItem,
  AssistantSettings,
  ResourceItem,
  GroundingSource,
  UserIntent,
} from '../types/assistant';

export interface ChatResponse {
  reply: string;
  rawReply?: string;
  action?: any;
  provider: 'gemini' | 'demo';
  model: string;
  sources?: GroundingSource[];
  intent?: UserIntent;
  searchQueries?: string[];
  isGroundingUsed?: boolean;
  error?: string;
}

export interface StatusResponse {
  status: string;
  connected: boolean;
  provider: 'gemini' | 'demo';
  model: string;
  timestamp: string;
}

// Request deduplication cache
const inFlightChatRequests = new Map<string, Promise<ChatResponse>>();
const recommendationsCache = new Map<string, { data: ResourceItem[]; timestamp: number }>();
const CACHE_TTL_MS = 60000; // 1 minute cache for recommendations

export async function checkServerStatus(): Promise<StatusResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/status', { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      connected: false,
      provider: 'demo',
      model: 'vox-autonomous-knowledge-engine',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function sendChatMessage(
  messages: ChatMessage[],
  memories: MemoryItem[],
  settings: AssistantSettings,
  resources: ResourceItem[] = [],
  signal?: AbortSignal
): Promise<ChatResponse> {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const dedupeKey = `${lastMsg}_${messages.length}`;

  // If identical request is currently in-flight, reuse the pending promise
  if (inFlightChatRequests.has(dedupeKey)) {
    return inFlightChatRequests.get(dedupeKey)!;
  }

  const promise = (async () => {
    // Retry loop with max 2 attempts for transient connection issues
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        // Link with optional external signal
        if (signal) {
          signal.addEventListener('abort', () => controller.abort());
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            memories: settings.memoryEnabled ? memories : [],
            resources: resources.slice(0, 20), // Send only necessary active resources
            preferences: {
              personaStyle: settings.personaStyle,
              responseLength: settings.responseLength,
              assistantVolume: settings.assistantVolume,
              theme: settings.theme,
            },
            customInstruction: settings.customInstruction,
            temperature: settings.temperature,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errMsg = errorData.error || (response.status === 404
            ? 'Chat endpoint (/api/chat) returned 404 Not Found. Backend server may be restarting.'
            : `Server responded with ${response.status}`);
          throw new Error(errMsg);
        }

        const data = await response.json();
        const reply = data.response || data.reply || data.text || '';
        return {
          ...data,
          reply,
        };
      } catch (error: any) {
        if (attempt === 0 && !signal?.aborted && !error.message?.includes('404') && !error.message?.includes('not configured')) {
          // Short backoff before retry
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        console.warn('[Vox Client] Chat error:', error);
        const isNotConfigured = error.message?.includes('not configured');
        const replyText = isNotConfigured
          ? 'AI service is not configured yet.'
          : (error.message || "Couldn't connect to AI service. Please try again.");

        return {
          reply: replyText,
          provider: 'none',
          error: error.message || 'CONNECTION_FAILED',
        };
      }
    }

    return {
      reply: 'Request timed out waiting for the AI response. Please try again.',
      provider: 'none',
      error: 'TIMEOUT',
    };
  })();

  inFlightChatRequests.set(dedupeKey, promise);

  try {
    return await promise;
  } finally {
    inFlightChatRequests.delete(dedupeKey);
  }
}

export async function fetchRecommendations(
  category: string,
  memories: MemoryItem[],
  settings: AssistantSettings,
  feedbackHistory: any[],
  resources: ResourceItem[] = []
): Promise<{ recommendations: ResourceItem[]; provider: 'gemini' | 'demo' }> {
  const cacheKey = `${category || 'all'}_${memories.length}_${resources.length}`;
  const cached = recommendationsCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      recommendations: cached.data,
      provider: 'demo',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        memories: settings.memoryEnabled ? memories : [],
        resources: resources.slice(0, 15),
        preferences: { personaStyle: settings.personaStyle },
        feedbackHistory,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error('Failed to fetch recommendations');
    const data = await res.json();

    if (Array.isArray(data.recommendations)) {
      recommendationsCache.set(cacheKey, {
        data: data.recommendations,
        timestamp: Date.now(),
      });
    }

    return data;
  } catch (err) {
    return {
      recommendations: [],
      provider: 'demo',
    };
  }
}
