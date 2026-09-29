// AniVox Verified Official Links & General Link Finder Registry
// Strict verification: Only provides verified official URLs. Never guesses or invents links.

import { ANIVOX_OFFICIAL_YOUTUBE_URL } from '../config/anivoxCompany.ts';

export interface VerifiedLinkEntry {
  id: string;
  name: string;
  category: 'Gaming' | 'Official AniVox' | 'Music & Media' | 'Streaming' | 'Developer & Open Source' | 'Reference & Learning';
  url: string;
  buttonLabel: string;
  description: string;
  keywords: string[];
  isVerified: boolean;
  domain: string;
  appDeepLink?: string;
  badgeColor?: string;
}

export const VERIFIED_LINKS: VerifiedLinkEntry[] = [
  // 1. Xbox Official
  {
    id: 'link-xbox',
    name: 'Xbox',
    category: 'Gaming',
    url: 'https://www.xbox.com',
    buttonLabel: 'OPEN XBOX',
    description: 'Official Xbox website. Explore Xbox consoles, Game Pass titles, cloud gaming, and Microsoft gaming ecosystem.',
    keywords: ['xbox', 'xbox link', 'xbox website', 'xbox game pass', 'xbox console', 'microsoft xbox'],
    isVerified: true,
    domain: 'xbox.com',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },

  // 2. NovaVerse
  {
    id: 'link-novaverse',
    name: 'NovaVerse',
    category: 'Gaming',
    url: 'https://novaverse.io',
    buttonLabel: 'OPEN NOVAVERSE',
    description: 'Official NovaVerse platform. Discover the immersive interactive gaming universe, virtual realms, and open community.',
    keywords: ['novaverse', 'nova verse', 'find novaverse', 'where is novaverse', 'novaverse game', 'novaverse link', 'where is the game'],
    isVerified: true,
    domain: 'novaverse.io',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },

  // 3. DCB Universe Official Channel
  {
    id: 'link-anivox-yt',
    name: 'DCB Universe Official Channel',
    category: 'Official AniVox',
    url: ANIVOX_OFFICIAL_YOUTUBE_URL,
    buttonLabel: 'OPEN DCB UNIVERSE',
    description: 'Official DCB Universe YouTube channel (@DCBUniverse-n). Watch stories, animations, Cosmic Wrath episodes, and creator series.',
    keywords: [
      'dcb universe',
      'dcb universe channel',
      '@dcbuniverse-n',
      'dcbuniverse-n',
      'dcbuniverse',
      'official youtube channel',
      'anivox youtube',
      'dcb youtube',
      'visit our channel',
      'open youtube channel',
      'our channel',
    ],
    isVerified: true,
    domain: 'youtube.com',
    appDeepLink: 'vnd.youtube://www.youtube.com/@DCBUniverse-n',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
  },

  // 4. AniVox Official Website / Web Portal
  {
    id: 'link-anivox-web',
    name: 'AniVox Web Portal',
    category: 'Official AniVox',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://anivox.ai',
    buttonLabel: 'OPEN ANIVOX',
    description: 'Official AniVox Intelligent Personal AI Assistant and Creator Studio web portal.',
    keywords: ['anivox website', 'open anivox', 'anivox portal', 'anivox homepage', 'official anivox', 'anivox app'],
    isVerified: true,
    domain: 'anivox.ai',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },

  // 5. Audiomack Official
  {
    id: 'link-audiomack',
    name: 'Audiomack',
    category: 'Music & Media',
    url: 'https://audiomack.com',
    buttonLabel: 'OPEN AUDIOMACK',
    description: 'Official Audiomack streaming platform for independent music, trending Afrobeats, Hip-Hop, and live music discovery.',
    keywords: ['audiomack', 'audiomack link', 'audiomack website', 'audiomack music'],
    isVerified: true,
    domain: 'audiomack.com',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },

  // 6. Steam Official
  {
    id: 'link-steam',
    name: 'Steam',
    category: 'Gaming',
    url: 'https://store.steampowered.com',
    buttonLabel: 'OPEN STEAM',
    description: 'Official Steam Store & Community. The ultimate digital distribution platform for PC gaming, mods, and hardware.',
    keywords: ['steam', 'steam link', 'steam store', 'valve steam', 'pc games on steam'],
    isVerified: true,
    domain: 'steampowered.com',
    badgeColor: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
  },

  // 7. PlayStation Official
  {
    id: 'link-playstation',
    name: 'PlayStation',
    category: 'Gaming',
    url: 'https://www.playstation.com',
    buttonLabel: 'OPEN PLAYSTATION',
    description: 'Official PlayStation website. Explore PS5 consoles, PS Plus subscriptions, exclusive blockbusters, and VR.',
    keywords: ['playstation', 'ps5', 'playstation store', 'sony playstation', 'playstation website', 'psn'],
    isVerified: true,
    domain: 'playstation.com',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },

  // 8. Nintendo Official
  {
    id: 'link-nintendo',
    name: 'Nintendo',
    category: 'Gaming',
    url: 'https://www.nintendo.com',
    buttonLabel: 'OPEN NINTENDO',
    description: 'Official Nintendo website. Explore Nintendo Switch games, system details, eShop titles, and news.',
    keywords: ['nintendo', 'nintendo switch', 'nintendo link', 'nintendo website', 'eshop'],
    isVerified: true,
    domain: 'nintendo.com',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
  },

  // 9. Spotify Official
  {
    id: 'link-spotify',
    name: 'Spotify',
    category: 'Music & Media',
    url: 'https://open.spotify.com',
    buttonLabel: 'OPEN SPOTIFY',
    description: 'Official Spotify Web Player. Stream millions of songs, curated playlists, and podcasts worldwide.',
    keywords: ['spotify', 'spotify link', 'spotify web', 'spotify player'],
    isVerified: true,
    domain: 'spotify.com',
    badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
  },

  // 10. Netflix Official
  {
    id: 'link-netflix',
    name: 'Netflix',
    category: 'Streaming',
    url: 'https://www.netflix.com',
    buttonLabel: 'OPEN NETFLIX',
    description: 'Official Netflix streaming service. Watch award-winning films, original TV series, anime, and documentaries.',
    keywords: ['netflix', 'netflix link', 'netflix website', 'watch netflix'],
    isVerified: true,
    domain: 'netflix.com',
    badgeColor: 'bg-rose-600/20 text-rose-300 border-rose-500/30',
  },

  // 11. Discord Official
  {
    id: 'link-discord',
    name: 'Discord',
    category: 'Developer & Open Source',
    url: 'https://discord.com',
    buttonLabel: 'OPEN DISCORD',
    description: 'Official Discord platform. Group chat, voice channels, and gaming community servers.',
    keywords: ['discord', 'discord link', 'discord app', 'discord server'],
    isVerified: true,
    domain: 'discord.com',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },

  // 12. GitHub Official
  {
    id: 'link-github',
    name: 'GitHub',
    category: 'Developer & Open Source',
    url: 'https://github.com',
    buttonLabel: 'OPEN GITHUB',
    description: 'Official GitHub open-source software development, code hosting, and collaboration platform.',
    keywords: ['github', 'github link', 'git repo', 'github website'],
    isVerified: true,
    domain: 'github.com',
    badgeColor: 'bg-zinc-500/20 text-zinc-200 border-zinc-500/30',
  },

  // 13. Wikipedia Official
  {
    id: 'link-wikipedia',
    name: 'Wikipedia',
    category: 'Reference & Learning',
    url: 'https://www.wikipedia.org',
    buttonLabel: 'OPEN WIKIPEDIA',
    description: 'The free encyclopedia that anyone can edit, containing comprehensive articles across all fields of human knowledge.',
    keywords: ['wikipedia', 'wiki', 'wikipedia link', 'wikipedia encyclopedia'],
    isVerified: true,
    domain: 'wikipedia.org',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },

  // 14. Twitch Official
  {
    id: 'link-twitch',
    name: 'Twitch',
    category: 'Streaming',
    url: 'https://www.twitch.tv',
    buttonLabel: 'OPEN TWITCH',
    description: 'Official Twitch live streaming platform for esports, gaming broadcasts, music, and interactive entertainment.',
    keywords: ['twitch', 'twitch tv', 'twitch stream', 'twitch link'],
    isVerified: true,
    domain: 'twitch.tv',
    badgeColor: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
  },

  // 15. MDN Web Docs
  {
    id: 'link-mdn',
    name: 'MDN Web Docs',
    category: 'Reference & Learning',
    url: 'https://developer.mozilla.org',
    buttonLabel: 'OPEN MDN',
    description: 'Mozilla Developer Network. Definitive documentation for HTML, CSS, JavaScript, and Web APIs.',
    keywords: ['mdn', 'mdn web docs', 'mozilla developer', 'developer mozilla org'],
    isVerified: true,
    domain: 'developer.mozilla.org',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
];

export interface LinkSearchResult {
  found: boolean;
  entry?: VerifiedLinkEntry;
  explanation: string;
}

/**
 * Searches the verified link registry using fuzzy keyword matching.
 * If verified: returns official entry and friendly message.
 * If query is clearly asking for a link but destination is unknown/unverified:
 * Returns explicit "I couldn't verify the official link." rather than guessing.
 */
export function findVerifiedLink(query: string): LinkSearchResult {
  if (!query || typeof query !== 'string') {
    return {
      found: false,
      explanation: "I couldn't verify the official link.",
    };
  }

  const clean = query.trim().toLowerCase();

  // 1. Direct search across keywords
  for (const entry of VERIFIED_LINKS) {
    if (
      clean === entry.name.toLowerCase() ||
      entry.keywords.some((k) => clean.includes(k) || k.includes(clean))
    ) {
      return {
        found: true,
        entry,
        explanation: `Here is the official ${entry.name} destination.`,
      };
    }
  }

  // 2. Specific intent queries:
  // "Give me the Xbox link" -> Xbox
  if (clean.includes('xbox')) {
    const xbox = VERIFIED_LINKS.find((l) => l.id === 'link-xbox')!;
    return {
      found: true,
      entry: xbox,
      explanation: 'Here is the official Xbox website.',
    };
  }

  // "Where can I find NovaVerse?" / "Where is the game?"
  if (clean.includes('novaverse') || clean.includes('where is the game') || clean.includes('find the game')) {
    const nova = VERIFIED_LINKS.find((l) => l.id === 'link-novaverse')!;
    return {
      found: true,
      entry: nova,
      explanation: 'Here is the official NovaVerse page.',
    };
  }

  // "Give me the official YouTube channel" / "Visit our channel"
  if (
    clean.includes('official youtube') ||
    clean.includes('our channel') ||
    clean.includes('anivox channel') ||
    clean.includes('dcb-q2x7j') ||
    clean.includes('@dcb-q2x7j')
  ) {
    const yt = VERIFIED_LINKS.find((l) => l.id === 'link-anivox-yt')!;
    return {
      found: true,
      entry: yt,
      explanation: 'Here is the official AniVox & DCB YouTube channel.',
    };
  }

  // "Open the AniVox website"
  if (clean.includes('anivox website') || clean.includes('open the anivox') || clean.includes('anivox site')) {
    const anivox = VERIFIED_LINKS.find((l) => l.id === 'link-anivox-web')!;
    return {
      found: true,
      entry: anivox,
      explanation: 'Here is the official AniVox portal.',
    };
  }

  // If query asks for a link, URL, or page for an entity not in verified registry
  const isAskingForLink =
    clean.startsWith('give me the ') ||
    clean.startsWith('where can i find ') ||
    clean.startsWith('where is ') ||
    clean.startsWith('open the ') ||
    clean.startsWith('open ') ||
    clean.includes(' link') ||
    clean.includes(' website') ||
    clean.includes(' official url');

  if (isAskingForLink) {
    return {
      found: false,
      explanation: "I couldn't verify the official link. AniVox only provides verified official destinations to ensure safety and authenticity.",
    };
  }

  return {
    found: false,
    explanation: "I couldn't verify the official link.",
  };
}
