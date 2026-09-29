export type UserIntent =
  | 'GENERAL_KNOWLEDGE'
  | 'CURRENT_INFORMATION'
  | 'RECOMMENDATION'
  | 'SEARCH'
  | 'SOCIAL_SEARCH'
  | 'OPEN_LINK'
  | 'PHONE_CALL'
  | 'IMAGE_GENERATION'
  | 'MEDIA_CONTROL'
  | 'AUDIOMACK_PLAY'
  | 'DEVICE_STATUS'
  | 'BATTERY_INFO'
  | 'STORAGE_INFO'
  | 'WEATHER'
  | 'TIME_QUERY'
  | 'EXPLANATION'
  | 'COMPARISON'
  | 'HOW_TO'
  | 'CREATIVE_REQUEST'
  | 'PERSONAL_MEMORY'
  | 'DEVICE_SETTING'
  | 'UTILITY_ACTION'
  | 'GENERAL_CONVERSATION';

export interface IntentAnalysis {
  intent: UserIntent;
  confidence: number;
  requiresSearch: boolean;
  isFactualQuery: boolean;
  topic?: string;
  categoryHint?: string;
}

/**
 * Intelligent Intent Classifier for Vox Assistant
 * Evaluates queries to route to:
 * - Phone & Contact Calling (Native Android calling, SIM routing, local contact lookup)
 * - Image Generation (Immediate neural image synthesis)
 * - Audiomack Music Playback & Media controls
 * - Social Media Search & Smart Link Launching (YouTube @dcb-q2x7j, Grox, etc.)
 * - General Knowledge (direct instant AI answer without web search)
 * - Current Information / Search (search grounding required for live news/entities)
 * - Recommendation (media/tool/resource discovery)
 * - Weather & World Time queries
 * - Battery & Device status telemetry
 */
export function classifyIntent(query: string): IntentAnalysis {
  const text = (query || '').trim().toLowerCase();

  // 0a. AniVox Founders & Ownership ("Who founded AniVox?", "Who is the founder of AniVox?", "Who owns AniVox?")
  if (
    text.includes('who founded anivox') ||
    text.includes('founder of anivox') ||
    text.includes('who is the founder of anivox') ||
    text.includes('who owns anivox') ||
    text.includes('who created anivox') ||
    text.includes('who are the founders') ||
    text.includes('anivox founder') ||
    text.includes('who made anivox') ||
    text.includes('who built anivox')
  ) {
    return {
      intent: 'GENERAL_KNOWLEDGE',
      confidence: 1.0,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 0b. Join AniVox Team & Public Contact ("How can I join the AniVox team?", "How do I contact the founders?")
  if (
    text.includes('join the anivox team') ||
    text.includes('join anivox') ||
    text.includes('work with anivox') ||
    text.includes('contact the founders') ||
    text.includes('contact anivox team') ||
    text.includes('how can i join the anivox team') ||
    text.includes('how do i contact the founders') ||
    text.includes('how can i work with anivox')
  ) {
    return {
      intent: 'GENERAL_KNOWLEDGE',
      confidence: 1.0,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 0c. AniVox Team Payment & Compensation ("Do you pay team members?", "Can I get paid?", "Does AniVox pay?")
  if (
    text.includes('do you pay team members') ||
    text.includes('can i get paid') ||
    text.includes('does anivox pay') ||
    text.includes('is anivox paid') ||
    text.includes('are positions paid') ||
    text.includes('do you pay') ||
    text.includes('team salary') ||
    text.includes('payment for joining anivox')
  ) {
    return {
      intent: 'GENERAL_KNOWLEDGE',
      confidence: 1.0,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 0d. Verified Official Link Finder ("Give me the Xbox link", "Where can I find NovaVerse?", "Where is the game?", "Open the AniVox website")
  if (
    text.includes('xbox link') ||
    text.includes('where can i find xbox') ||
    text.includes('give me the xbox link') ||
    text.includes('where is the game') ||
    text.includes('where can i find novaverse') ||
    text.includes('novaverse link') ||
    text.includes('open the anivox website') ||
    text.includes('anivox website') ||
    text.includes('give me the official youtube channel')
  ) {
    return {
      intent: 'OPEN_LINK',
      confidence: 1.0,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 1. Image Generation ("Generate an image of a futuristic city", "Vox, generate an image of a dragon")
  if (
    text.startsWith('generate an image') ||
    text.startsWith('generate a picture') ||
    text.startsWith('create an image') ||
    text.startsWith('create a picture') ||
    text.startsWith('draw an image') ||
    text.startsWith('draw a picture') ||
    text.startsWith('make an image') ||
    text.startsWith('make a picture') ||
    text.startsWith('vox, generate an image') ||
    text.startsWith('vox generate an image') ||
    text.startsWith('vox draw') ||
    text.includes('generate an image of') ||
    text.includes('generate a picture of') ||
    text.includes('draw a picture of') ||
    text.includes('create an image of')
  ) {
    return {
      intent: 'IMAGE_GENERATION',
      confidence: 0.99,
      requiresSearch: false,
      isFactualQuery: false,
    };
  }

  // 2. Audiomack & Music Playback ("Play Burna Boy on Audiomack", "Play Wizkid on Audiomack")
  if (
    text.includes('audiomack') ||
    (text.startsWith('play ') && (text.includes('song') || text.includes('music') || text.includes('album') || text.includes('artist') || text.includes('track')))
  ) {
    return {
      intent: text.includes('audiomack') ? 'AUDIOMACK_PLAY' : 'MEDIA_CONTROL',
      confidence: 0.96,
      requiresSearch: false,
      isFactualQuery: false,
    };
  }

  // 3. Battery & Storage & Device Telemetry
  if (
    text.includes('battery') ||
    text.includes('storage') ||
    text.includes('storage space') ||
    text.includes('free space') ||
    text.includes('device status') ||
    text.includes('check battery')
  ) {
    return {
      intent: text.includes('battery') ? 'BATTERY_INFO' : 'STORAGE_INFO',
      confidence: 0.95,
      requiresSearch: false,
      isFactualQuery: false,
    };
  }

  // 4. Weather Queries ("Weather in Lagos", "What's the weather like in New York?")
  if (
    text.startsWith('weather') ||
    text.includes('what is the weather') ||
    text.includes("what's the weather") ||
    text.includes('weather in ') ||
    text.includes('weather for ') ||
    text.includes('is it raining') ||
    text.includes('forecast in ')
  ) {
    return {
      intent: 'WEATHER',
      confidence: 0.96,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 5. World Time Queries ("What time is it in Tokyo?", "Time in London")
  if (
    (text.includes('what time is it') || text.includes("what's the time") || text.includes('current time in ') || text.startsWith('time in ')) &&
    (text.includes(' in ') || text.includes(' at ') || text.includes('tokyo') || text.includes('london') || text.includes('new york') || text.includes('paris') || text.includes('lagos'))
  ) {
    return {
      intent: 'TIME_QUERY',
      confidence: 0.96,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 6. Phone Calling & Contact Calling (Top Priority for communication actions)
  const isCallCommand =
    text.startsWith('call ') ||
    text.startsWith('phone ') ||
    text.startsWith('dial ') ||
    text.startsWith('place a call to ') ||
    text.startsWith('ring ') ||
    text.startsWith('vox call ') ||
    text.startsWith('vox, call ') ||
    text.startsWith('hey vox, call ') ||
    text === 'call' ||
    text === 'hang up' ||
    text === 'end call' ||
    text === 'cancel call' ||
    text.includes('call mom') ||
    text.includes('call dad') ||
    text.includes('call my ') ||
    text.includes('on sim 1') ||
    text.includes('on sim 2') ||
    text.includes('using sim 1') ||
    text.includes('using sim 2');

  if (isCallCommand) {
    return {
      intent: 'PHONE_CALL',
      confidence: 0.98,
      requiresSearch: false,
      isFactualQuery: false,
    };
  }

  // 7. Official Channel / Social Media
  if (
    text.includes('visit our channel') ||
    text.includes('open our channel') ||
    text.includes('anivox channel') ||
    text.includes('dcb channel') ||
    text.includes('@dcb-q2x7j') ||
    text.includes('dcb-q2x7j')
  ) {
    return {
      intent: 'OPEN_LINK',
      confidence: 0.99,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 1. Social Media Search, Channel Finding & Public Profile Launching
  const isSocialQuery =
    text.includes('youtube') ||
    text.includes('yt channel') ||
    text.includes('on yt') ||
    text.includes('instagram') ||
    text.includes('insta') ||
    text.includes('on ig') ||
    text.includes('tiktok') ||
    text.includes('tik tok') ||
    text.includes('on x') ||
    text.includes('on twitter') ||
    text.includes('twitter') ||
    text.includes('reddit') ||
    text.includes('subreddit') ||
    text.includes('facebook') ||
    text.includes('linkedin') ||
    text.includes('pinterest') ||
    text.includes('snapchat') ||
    text.includes('twitch') ||
    text.includes('spotify') ||
    text.includes('discord');

  const isSocialAction =
    text.startsWith('who is ') ||
    text.startsWith('open ') ||
    text.startsWith('find ') ||
    text.startsWith('search for ') ||
    text.startsWith('show me ') ||
    text.startsWith('take me to ') ||
    text.startsWith('look up ') ||
    text.includes('channel') ||
    text.includes('profile') ||
    text.includes('creator') ||
    text.includes('account') ||
    text.includes('page');

  if (isSocialQuery && isSocialAction) {
    return {
      intent: 'SOCIAL_SEARCH',
      confidence: 0.95,
      requiresSearch: true,
      isFactualQuery: true,
    };
  }

  // 1b. General Web Links & Official Site opening
  if (
    text.startsWith('open the website') ||
    text.startsWith('open website') ||
    text.startsWith('open this website') ||
    text.startsWith('open official website') ||
    text.startsWith('find their official page') ||
    text.startsWith('take me to their official') ||
    text.startsWith('go to https://') ||
    text.startsWith('open https://') ||
    text.startsWith('visit ')
  ) {
    return {
      intent: 'OPEN_LINK',
      confidence: 0.95,
      requiresSearch: true,
      isFactualQuery: true,
    };
  }

  // 2. Device Controls & Settings
  if (
    text.includes('dark mode') ||
    text.includes('light mode') ||
    text.includes('cyberpunk') ||
    text.includes('voice responses') ||
    text.includes('auto speak') ||
    text.includes('orb speed') ||
    text.includes('text size') ||
    text.includes('font size') ||
    text.includes('mute') ||
    text.includes('unmute') ||
    text.includes('volume') ||
    text.includes('louder') ||
    text.includes('softer') ||
    text.includes('quieter') ||
    text.includes('turn it up') ||
    text.includes('turn it down') ||
    text.includes('lock the app') ||
    text.includes('lock assistant') ||
    text.includes('open settings') ||
    text.includes('device controls') ||
    text.includes('stop speaking')
  ) {
    return {
      intent: 'DEVICE_SETTING',
      confidence: 0.95,
      requiresSearch: false,
      isFactualQuery: false,
    };
  }

  // 2. Utility actions (Timers, Tasks, Notes)
  if (
    text.match(/(?:start|set|create)?\s*(?:a)?\s*timer\s*(?:for)?\s*\d+/i) ||
    text.match(/\d+\s*(?:minute|min|second|sec|hour|hr)s?\s*timer/i) ||
    text.startsWith('note:') ||
    text.includes('create a note') ||
    text.includes('take a note') ||
    text.includes('write down') ||
    text.includes('remind me to') ||
    text.includes('add task') ||
    text.includes('todo:')
  ) {
    return {
      intent: 'UTILITY_ACTION',
      confidence: 0.95,
      requiresSearch: false,
      isFactualQuery: false,
    };
  }

  // 3. Personal Memory - Only when stating personal preferences or explicit save requests
  // NOT when asking general questions like "What is anime?" or "What do you think of anime?"
  const isExplicitPreference =
    (text.startsWith('i love ') ||
      text.startsWith('i like ') ||
      text.startsWith('i prefer ') ||
      text.startsWith('i enjoy ') ||
      text.startsWith('my favorite ') ||
      text.includes('remember that i ') ||
      text.includes('remember my ') ||
      text.startsWith('please remember that ')) &&
    !text.startsWith('what ') &&
    !text.startsWith('why ') &&
    !text.startsWith('how ') &&
    !text.startsWith('who ') &&
    !text.startsWith('when ');

  if (isExplicitPreference) {
    return {
      intent: 'PERSONAL_MEMORY',
      confidence: 0.9,
      requiresSearch: false,
      isFactualQuery: false,
    };
  }

  // 4. Recommendations
  if (
    text.startsWith('recommend') ||
    text.includes('recommend me') ||
    text.includes('give me a recommendation') ||
    text.includes('suggestions for') ||
    text.includes('what should i watch') ||
    text.includes('what should i play') ||
    text.includes('what should i read') ||
    text.includes('best video editor') ||
    text.includes('best app for') ||
    text.includes('good free') ||
    text.includes('similar to') ||
    text.includes('more like this')
  ) {
    const isCurrent =
      text.includes('new ') ||
      text.includes('newest') ||
      text.includes('latest') ||
      text.includes('popular') ||
      text.includes('popular right now') ||
      text.includes('this week') ||
      text.includes('this month') ||
      text.includes('this year') ||
      text.includes('trending') ||
      text.includes('2024') ||
      text.includes('2025') ||
      text.includes('2026');

    return {
      intent: 'RECOMMENDATION',
      confidence: 0.9,
      requiresSearch: isCurrent,
      isFactualQuery: false,
    };
  }

  // 5. Current Information & Search (requires live grounding)
  if (
    text.includes('latest') ||
    text.includes('newest') ||
    text.includes('new release') ||
    text.includes('new games') ||
    text.includes('new movies') ||
    text.includes('new phones') ||
    text.includes('developments in') ||
    text.includes('popular right now') ||
    text.includes('trending right now') ||
    text.includes('latest version') ||
    text.includes('this week') ||
    text.includes('today') ||
    text.includes('right now') ||
    text.includes('recent news') ||
    text.includes('current price') ||
    text.includes('weather today') ||
    text.includes('came out this week') ||
    text.includes('upcoming movies') ||
    text.includes('who won the last') ||
    text.includes('stock price') ||
    text.includes('breaking news') ||
    text.includes('current events') ||
    text.includes('search the web') ||
    text.includes('look up online')
  ) {
    return {
      intent: 'CURRENT_INFORMATION',
      confidence: 0.92,
      requiresSearch: true,
      isFactualQuery: true,
    };
  }

  // 6. How-To / Step-by-Step Instructions
  if (
    text.startsWith('how do i ') ||
    text.startsWith('how to ') ||
    text.startsWith('how can i ') ||
    text.startsWith('steps to ') ||
    text.includes('guide on ') ||
    text.includes('how do you make')
  ) {
    return {
      intent: 'HOW_TO',
      confidence: 0.85,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 7. Comparison
  if (
    text.includes(' vs ') ||
    text.includes(' versus ') ||
    text.includes('difference between') ||
    text.includes('compare ')
  ) {
    return {
      intent: 'COMPARISON',
      confidence: 0.85,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 8. General Knowledge / Definitions / Explanations
  if (
    text.startsWith('what is ') ||
    text.startsWith('what are ') ||
    text.startsWith('what does ') ||
    text.startsWith('who is ') ||
    text.startsWith('who was ') ||
    text.startsWith('who invented ') ||
    text.startsWith('where is ') ||
    text.startsWith('why is ') ||
    text.startsWith('why does ') ||
    text.startsWith('how does ') ||
    text.startsWith('explain ') ||
    text.startsWith('define ') ||
    text.includes('meaning of') ||
    text.includes('capital of')
  ) {
    return {
      intent: 'GENERAL_KNOWLEDGE',
      confidence: 0.92,
      requiresSearch: false,
      isFactualQuery: true,
    };
  }

  // 9. Creative Requests
  if (
    text.startsWith('write a ') ||
    text.startsWith('generate a story') ||
    text.startsWith('compose ') ||
    text.startsWith('brainstorm ')
  ) {
    return {
      intent: 'CREATIVE_REQUEST',
      confidence: 0.85,
      requiresSearch: false,
      isFactualQuery: false,
    };
  }

  // Default fallback to general conversation
  return {
    intent: 'GENERAL_CONVERSATION',
    confidence: 0.7,
    requiresSearch: false,
    isFactualQuery: false,
  };
}
