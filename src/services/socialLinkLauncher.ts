// AniVox Social Media Search & Smart Link System
// Handles natural language parsing, platform normalization, verified profile lookups,
// secure link validation, and Smart App Launcher with Universal Web Fallback.

import type { SocialPlatform, SocialProfileCard, AlternativeSocialOption } from '../types/assistant.ts';

export interface PlatformConfig {
  id: SocialPlatform;
  displayName: string;
  shortName: string;
  category: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  gradient: string;
  officialDomains: string[];
  androidPackage?: string;
  buildWebProfileUrl: (identifier: string) => string;
  buildAppDeepLink?: (identifier: string) => string;
  buildWebSearchUrl: (query: string) => string;
  buildAppSearchLink?: (query: string) => string;
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    displayName: 'YouTube',
    shortName: 'YT',
    category: 'Video & Channels',
    badgeColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    gradient: 'from-red-600/30 to-rose-900/30',
    officialDomains: ['youtube.com', 'youtu.be', 'm.youtube.com'],
    androidPackage: 'com.google.android.youtube',
    buildWebProfileUrl: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `https://www.youtube.com/@${encodeURIComponent(clean)}`;
    },
    buildAppDeepLink: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `vnd.youtube://www.youtube.com/@${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`,
    buildAppSearchLink: (query: string) => `vnd.youtube://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`,
  },
  instagram: {
    id: 'instagram',
    displayName: 'Instagram',
    shortName: 'IG',
    category: 'Photos & Stories',
    badgeColor: 'bg-pink-500/20',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    gradient: 'from-pink-600/30 via-purple-600/20 to-amber-600/20',
    officialDomains: ['instagram.com', 'instagr.am'],
    androidPackage: 'com.instagram.android',
    buildWebProfileUrl: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `https://www.instagram.com/${encodeURIComponent(clean)}/`;
    },
    buildAppDeepLink: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `instagram://user?username=${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query: string) => `https://www.instagram.com/explore/tags/${encodeURIComponent(query.trim().replace(/\s+/g, ''))}/`,
  },
  tiktok: {
    id: 'tiktok',
    displayName: 'TikTok',
    shortName: 'TT',
    category: 'Short Videos & Trends',
    badgeColor: 'bg-teal-500/20',
    textColor: 'text-teal-300',
    borderColor: 'border-teal-500/30',
    gradient: 'from-cyan-600/30 to-pink-600/20',
    officialDomains: ['tiktok.com', 'vm.tiktok.com'],
    androidPackage: 'com.zhiliaoapp.musically',
    buildWebProfileUrl: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `https://www.tiktok.com/@${encodeURIComponent(clean)}`;
    },
    buildAppDeepLink: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `snssdk1233://user/profile/@${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query: string) => `https://www.tiktok.com/search?q=${encodeURIComponent(query.trim())}`,
  },
  x: {
    id: 'x',
    displayName: 'X (Twitter)',
    shortName: 'X',
    category: 'Microblogging & News',
    badgeColor: 'bg-sky-500/20',
    textColor: 'text-sky-300',
    borderColor: 'border-sky-500/30',
    gradient: 'from-sky-600/30 to-blue-900/30',
    officialDomains: ['x.com', 'twitter.com', 'mobile.twitter.com'],
    androidPackage: 'com.twitter.android',
    buildWebProfileUrl: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `https://x.com/${encodeURIComponent(clean)}`;
    },
    buildAppDeepLink: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `twitter://user?screen_name=${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query: string) => `https://x.com/search?q=${encodeURIComponent(query.trim())}`,
    buildAppSearchLink: (query: string) => `twitter://search?query=${encodeURIComponent(query.trim())}`,
  },
  reddit: {
    id: 'reddit',
    displayName: 'Reddit',
    shortName: 'Reddit',
    category: 'Communities & Discussions',
    badgeColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    gradient: 'from-orange-600/30 to-red-900/30',
    officialDomains: ['reddit.com', 'old.reddit.com'],
    androidPackage: 'com.reddit.frontpage',
    buildWebProfileUrl: (id: string) => {
      const clean = id.trim().replace(/^u\//, '').replace(/^r\//, '');
      if (id.trim().startsWith('r/')) {
        return `https://www.reddit.com/r/${encodeURIComponent(clean)}/`;
      }
      return `https://www.reddit.com/user/${encodeURIComponent(clean)}/`;
    },
    buildAppDeepLink: (id: string) => {
      const clean = id.trim().replace(/^u\//, '').replace(/^r\//, '');
      return `reddit://user/${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query: string) => `https://www.reddit.com/search/?q=${encodeURIComponent(query.trim())}`,
  },
  facebook: {
    id: 'facebook',
    displayName: 'Facebook',
    shortName: 'FB',
    category: 'Social Network & Pages',
    badgeColor: 'bg-blue-600/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-700/30 to-indigo-900/30',
    officialDomains: ['facebook.com', 'fb.com', 'm.facebook.com'],
    androidPackage: 'com.facebook.katana',
    buildWebProfileUrl: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `https://www.facebook.com/${encodeURIComponent(clean)}`;
    },
    buildAppDeepLink: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `fb://facewebmodal/f?href=https://www.facebook.com/${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query: string) => `https://www.facebook.com/search/top?q=${encodeURIComponent(query.trim())}`,
  },
  linkedin: {
    id: 'linkedin',
    displayName: 'LinkedIn',
    shortName: 'LinkedIn',
    category: 'Professional Network',
    badgeColor: 'bg-blue-500/20',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-600/30 to-cyan-900/30',
    officialDomains: ['linkedin.com'],
    androidPackage: 'com.linkedin.android',
    buildWebProfileUrl: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `https://www.linkedin.com/in/${encodeURIComponent(clean)}/`;
    },
    buildAppDeepLink: (id: string) => {
      const clean = id.trim().replace(/^@/, '');
      return `linkedin://profile/${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query: string) => `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query.trim())}`,
  },
  pinterest: {
    id: 'pinterest',
    displayName: 'Pinterest',
    shortName: 'Pinterest',
    category: 'Visual Discovery & Boards',
    badgeColor: 'bg-red-600/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-600/30',
    gradient: 'from-red-700/30 to-rose-950/30',
    officialDomains: ['pinterest.com', 'pin.it'],
    androidPackage: 'com.pinterest',
    buildWebProfileUrl: (id: string) => `https://www.pinterest.com/${encodeURIComponent(id.trim().replace(/^@/, ''))}/`,
    buildAppDeepLink: (id: string) => `pinterest://user/${encodeURIComponent(id.trim().replace(/^@/, ''))}`,
    buildWebSearchUrl: (query: string) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query.trim())}`,
  },
  snapchat: {
    id: 'snapchat',
    displayName: 'Snapchat',
    shortName: 'Snap',
    category: 'Camera & Stories',
    badgeColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-500/30',
    gradient: 'from-yellow-500/30 to-amber-900/30',
    officialDomains: ['snapchat.com', 'story.snapchat.com'],
    androidPackage: 'com.snapchat.android',
    buildWebProfileUrl: (id: string) => `https://www.snapchat.com/add/${encodeURIComponent(id.trim().replace(/^@/, ''))}`,
    buildAppDeepLink: (id: string) => `snapchat://add/${encodeURIComponent(id.trim().replace(/^@/, ''))}`,
    buildWebSearchUrl: (query: string) => `https://www.snapchat.com/add/${encodeURIComponent(query.trim().replace(/^@/, ''))}`,
  },
  twitch: {
    id: 'twitch',
    displayName: 'Twitch',
    shortName: 'Twitch',
    category: 'Live Streaming & Gaming',
    badgeColor: 'bg-purple-500/20',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500/30',
    gradient: 'from-purple-600/30 to-violet-900/30',
    officialDomains: ['twitch.tv'],
    androidPackage: 'tv.twitch.android.app',
    buildWebProfileUrl: (id: string) => `https://www.twitch.tv/${encodeURIComponent(id.trim().replace(/^@/, ''))}`,
    buildAppDeepLink: (id: string) => `twitch://stream/${encodeURIComponent(id.trim().replace(/^@/, ''))}`,
    buildWebSearchUrl: (query: string) => `https://www.twitch.tv/search?term=${encodeURIComponent(query.trim())}`,
  },
  github: {
    id: 'github',
    displayName: 'GitHub',
    shortName: 'GitHub',
    category: 'Open Source & Code',
    badgeColor: 'bg-zinc-600/20',
    textColor: 'text-zinc-300',
    borderColor: 'border-zinc-500/30',
    gradient: 'from-zinc-700/30 to-slate-900/30',
    officialDomains: ['github.com'],
    androidPackage: 'com.github.android',
    buildWebProfileUrl: (id: string) => `https://github.com/${encodeURIComponent(id.trim().replace(/^@/, ''))}`,
    buildWebSearchUrl: (query: string) => `https://github.com/search?q=${encodeURIComponent(query.trim())}`,
  },
  spotify: {
    id: 'spotify',
    displayName: 'Spotify',
    shortName: 'Spotify',
    category: 'Music & Podcasts',
    badgeColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    gradient: 'from-green-600/30 to-emerald-950/30',
    officialDomains: ['spotify.com', 'open.spotify.com'],
    androidPackage: 'com.spotify.music',
    buildWebProfileUrl: (id: string) => `https://open.spotify.com/search/${encodeURIComponent(queryWithoutQuotes(id))}`,
    buildAppDeepLink: (id: string) => `spotify:search:${encodeURIComponent(queryWithoutQuotes(id))}`,
    buildWebSearchUrl: (query: string) => `https://open.spotify.com/search/${encodeURIComponent(query.trim())}`,
  },
  discord: {
    id: 'discord',
    displayName: 'Discord',
    shortName: 'Discord',
    category: 'Community Voice & Chat',
    badgeColor: 'bg-indigo-500/20',
    textColor: 'text-indigo-300',
    borderColor: 'border-indigo-500/30',
    gradient: 'from-indigo-600/30 to-purple-900/30',
    officialDomains: ['discord.com', 'discord.gg'],
    androidPackage: 'com.discord',
    buildWebProfileUrl: (id: string) => `https://discord.gg/${encodeURIComponent(id.trim().replace(/^@/, ''))}`,
    buildAppDeepLink: (id: string) => `discord://invite/${encodeURIComponent(id.trim().replace(/^@/, ''))}`,
    buildWebSearchUrl: (query: string) => `https://discord.com/servers?query=${encodeURIComponent(query.trim())}`,
  },
  web: {
    id: 'web',
    displayName: 'Official Website',
    shortName: 'Web',
    category: 'Verified Web Source',
    badgeColor: 'bg-cyan-500/20',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-500/30',
    gradient: 'from-cyan-600/30 to-blue-900/30',
    officialDomains: [],
    buildWebProfileUrl: (urlOrQuery: string) => {
      if (urlOrQuery.startsWith('http://') || urlOrQuery.startsWith('https://')) {
        return urlOrQuery;
      }
      return `https://${urlOrQuery.replace(/^[a-z]+:\/\//i, '')}`;
    },
    buildWebSearchUrl: (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`,
  },
};

function queryWithoutQuotes(str: string): string {
  return str.replace(/['"]/g, '').trim();
}

export const OFFICIAL_ANIVOX_CHANNEL = {
  url: 'https://youtube.com/@dcb-q2x7j',
  handle: '@dcb-q2x7j',
  appDeepLink: 'vnd.youtube://www.youtube.com/@dcb-q2x7j',
  title: 'AniVox & DCB Official Channel',
  description: 'Official YouTube Channel of AniVox & creator DCB (@dcb-q2x7j). Watch creator guides, assistant updates, tutorials, and innovations.',
};

/**
 * Curated Database of high-profile public creators, channels, and pages
 * to ensure instant, reliable, zero-latency public information without scraping.
 */
export const VERIFIED_PUBLIC_CREATORS: Record<string, Partial<SocialProfileCard>> = {
  anivox: {
    targetName: 'AniVox Official',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'AniVox & DCB Official Channel',
    handle: '@dcb-q2x7j',
    description: 'The official YouTube channel of AniVox and creator DCB (@dcb-q2x7j). Watch product announcements, tutorials, assistant updates, and engineering deep dives.',
    webUrl: 'https://youtube.com/@dcb-q2x7j',
    appDeepLink: 'vnd.youtube://www.youtube.com/@dcb-q2x7j',
    isVerified: true,
    subscriberCount: 'Official Creator Channel',
    category: 'Technology & AI',
  },
  dcb: {
    targetName: 'DCB (@dcb-q2x7j)',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'AniVox & DCB Official Channel',
    handle: '@dcb-q2x7j',
    description: 'The official YouTube channel of AniVox creator DCB (@dcb-q2x7j). Watch tutorials, updates, and creator guides.',
    webUrl: 'https://youtube.com/@dcb-q2x7j',
    appDeepLink: 'vnd.youtube://www.youtube.com/@dcb-q2x7j',
    isVerified: true,
    subscriberCount: 'Official Creator Channel',
    category: 'Technology & AI',
  },
  dcbq2x7j: {
    targetName: 'DCB (@dcb-q2x7j)',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'AniVox & DCB Official Channel',
    handle: '@dcb-q2x7j',
    description: 'The official YouTube channel of AniVox creator DCB (@dcb-q2x7j). Watch tutorials, updates, and creator guides.',
    webUrl: 'https://youtube.com/@dcb-q2x7j',
    appDeepLink: 'vnd.youtube://www.youtube.com/@dcb-q2x7j',
    isVerified: true,
    subscriberCount: 'Official Creator Channel',
    category: 'Technology & AI',
  },
  ourchannel: {
    targetName: 'AniVox / DCB Official Channel',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'AniVox & DCB Official Channel',
    handle: '@dcb-q2x7j',
    description: 'The official YouTube channel of AniVox and creator DCB (@dcb-q2x7j).',
    webUrl: 'https://youtube.com/@dcb-q2x7j',
    appDeepLink: 'vnd.youtube://www.youtube.com/@dcb-q2x7j',
    isVerified: true,
    subscriberCount: 'Official Creator Channel',
    category: 'Technology & AI',
  },
  grox: {
    targetName: 'Grox',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'Grox',
    handle: '@Grox',
    description: 'Popular Minecraft and gaming creator known for engaging speedruns, world building, and entertaining challenge videos.',
    webUrl: 'https://www.youtube.com/@Grox',
    appDeepLink: 'vnd.youtube://www.youtube.com/@Grox',
    isVerified: true,
    subscriberCount: '1.2M+ subscribers',
    category: 'Gaming & Entertainment',
    alternativeOptions: [
      {
        platform: 'x',
        platformDisplayName: 'X (Twitter)',
        webUrl: 'https://x.com/Grox',
        handle: '@Grox',
      },
      {
        platform: 'twitch',
        platformDisplayName: 'Twitch',
        webUrl: 'https://www.twitch.tv/grox',
        handle: 'grox',
      },
    ],
  },
  mrbeast: {
    targetName: 'MrBeast',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'MrBeast (Jimmy Donaldson)',
    handle: '@MrBeast',
    description: 'World-renowned creator, philanthropist, and entrepreneur known for large-scale challenges and generous giveaways.',
    webUrl: 'https://www.youtube.com/@MrBeast',
    appDeepLink: 'vnd.youtube://www.youtube.com/@MrBeast',
    isVerified: true,
    subscriberCount: '300M+ subscribers',
    category: 'Entertainment & Philanthropy',
    alternativeOptions: [
      {
        platform: 'x',
        platformDisplayName: 'X (Twitter)',
        webUrl: 'https://x.com/MrBeast',
        handle: '@MrBeast',
      },
      {
        platform: 'instagram',
        platformDisplayName: 'Instagram',
        webUrl: 'https://www.instagram.com/mrbeast/',
        handle: '@mrbeast',
      },
      {
        platform: 'tiktok',
        platformDisplayName: 'TikTok',
        webUrl: 'https://www.tiktok.com/@mrbeast',
        handle: '@mrbeast',
      },
    ],
  },
  mkbhd: {
    targetName: 'MKBHD (Marques Brownlee)',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'Marques Brownlee',
    handle: '@mkbhd',
    description: 'Leading consumer technology reviewer covering smartphones, computers, electric vehicles, and future tech.',
    webUrl: 'https://www.youtube.com/@mkbhd',
    appDeepLink: 'vnd.youtube://www.youtube.com/@mkbhd',
    isVerified: true,
    subscriberCount: '19M+ subscribers',
    category: 'Technology & Hardware',
    alternativeOptions: [
      {
        platform: 'x',
        platformDisplayName: 'X (Twitter)',
        webUrl: 'https://x.com/MKBHD',
        handle: '@MKBHD',
      },
      {
        platform: 'instagram',
        platformDisplayName: 'Instagram',
        webUrl: 'https://www.instagram.com/mkbhd/',
        handle: '@mkbhd',
      },
    ],
  },
  veritasium: {
    targetName: 'Veritasium (Derek Muller)',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'Veritasium',
    handle: '@veritasium',
    description: 'Science, education, and physics channel exploring counter-intuitive scientific concepts, engineering feats, and expert interviews.',
    webUrl: 'https://www.youtube.com/@veritasium',
    appDeepLink: 'vnd.youtube://www.youtube.com/@veritasium',
    isVerified: true,
    subscriberCount: '16M+ subscribers',
    category: 'Science & Education',
  },
  kurzgesagt: {
    targetName: 'Kurzgesagt – In a Nutshell',
    platform: 'youtube',
    platformDisplayName: 'YouTube',
    profileTitle: 'Kurzgesagt – In a Nutshell',
    handle: '@inanutshell',
    description: 'Munich-based animation studio creating beautiful, scientifically grounded videos explaining science, philosophy, and humanity.',
    webUrl: 'https://www.youtube.com/@inanutshell',
    appDeepLink: 'vnd.youtube://www.youtube.com/@inanutshell',
    isVerified: true,
    subscriberCount: '22M+ subscribers',
    category: 'Science & Animation',
  },
};

/**
 * Detects social platform from natural language input
 */
export function detectSocialPlatform(query: string): SocialPlatform | null {
  const q = (query || '').toLowerCase();

  if (q.includes('youtube') || q.includes('yt channel') || q.includes('on yt') || q.includes('yt video')) return 'youtube';
  if (q.includes('instagram') || q.includes('insta') || q.includes(' ig ') || q.endsWith(' ig') || q.includes('on ig')) return 'instagram';
  if (q.includes('tiktok') || q.includes('tik tok') || q.includes(' tt ') || q.endsWith(' tt')) return 'tiktok';
  if (q.includes('twitter') || q.includes(' on x') || q.includes('creator on x') || q.includes('page on x') || q.includes('profile on x') || q.includes('account on x')) return 'x';
  if (q.includes('reddit') || q.includes('subreddit') || q.includes(' r/')) return 'reddit';
  if (q.includes('facebook') || q.includes('fb page') || q.includes('on fb') || q.includes('facebook page')) return 'facebook';
  if (q.includes('linkedin') || q.includes('linked in')) return 'linkedin';
  if (q.includes('pinterest') || q.includes('pin page')) return 'pinterest';
  if (q.includes('snapchat') || q.includes('snap chat') || q.includes('snap profile')) return 'snapchat';
  if (q.includes('twitch') || q.includes('twitch stream')) return 'twitch';
  if (q.includes('github') || q.includes('git repo') || q.includes('git profile')) return 'github';
  if (q.includes('spotify') || q.includes('on spotify')) return 'spotify';
  if (q.includes('discord') || q.includes('discord server')) return 'discord';
  if (q.includes('website') || q.includes('official site') || q.includes('official page') || q.includes('homepage') || q.includes('web page') || q.includes('.com') || q.includes('.org') || q.includes('.net') || q.includes('.io')) return 'web';

  return null;
}

export interface ParsedSocialQuery {
  targetName: string;
  platform: SocialPlatform;
  action: 'open' | 'find' | 'search' | 'info';
  isDirectLaunch: boolean;
  rawQuery: string;
}

/**
 * Natural language parser for social requests:
 * "Who is Grox on YouTube?", "Open Grox's YouTube channel.", "Find Grox on YouTube."
 */
export function parseSocialQuery(query: string): ParsedSocialQuery | null {
  if (!query || typeof query !== 'string') return null;
  const q = query.trim();
  const lower = q.toLowerCase();

  const detectedPlatform = detectSocialPlatform(lower);
  if (!detectedPlatform) return null;

  // Determine intent action
  const isOpen = lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('take me to ') || lower.startsWith('go to ') || lower.startsWith('visit ');
  const isFind = lower.startsWith('find ') || lower.startsWith('search ') || lower.startsWith('look up ') || lower.startsWith('show me ');
  const isWhoIs = lower.startsWith('who is ') || lower.startsWith('who are ') || lower.startsWith('what is ');

  const action: 'open' | 'find' | 'search' | 'info' = isOpen ? 'open' : isFind ? 'find' : isWhoIs ? 'info' : 'search';
  const isDirectLaunch = isOpen;

  // Extract target name by stripping standard request prefixes and platform words
  let cleanName = q
    .replace(/^who\s+(is|are|was)\s+/i, '')
    .replace(/^(open|find|search\s+for|look\s+up|show\s+me|take\s+me\s+to|visit|go\s+to)\s+/i, '')
    .replace(/^(the\s+)?(official\s+)?(channel|profile|account|page|handle|video|stream|subreddit)\s+of\s+/i, '')
    .replace(/^(this\s+person|this\s+creator|this\s+user|this\s+channel|this\s+page)\s+/i, '')
    .replace(/\s+(on|in|at|for|from)\s+(youtube|yt|instagram|ig|insta|tiktok|tt|x|twitter|reddit|facebook|fb|linkedin|pinterest|snapchat|twitch|github|spotify|discord|web|google)\b.*/i, '')
    .replace(/['’]s\s+(youtube|yt|instagram|ig|insta|tiktok|tt|x|twitter|reddit|facebook|fb|linkedin|pinterest|snapchat|twitch|github|spotify|discord|channel|profile|account|page|stream).*/i, '')
    .replace(/\s+(youtube|yt|instagram|ig|insta|tiktok|tt|x|twitter|reddit|facebook|fb|linkedin|pinterest|snapchat|twitch|github|spotify|discord|channel|profile|account|page)\b.*$/i, '')
    .replace(/[?.,!]+$/, '')
    .trim();

  // If extraction resulted in empty string (e.g. "Open YouTube" without a person), default to platform home
  if (!cleanName || cleanName.toLowerCase() === detectedPlatform || cleanName.toLowerCase() === 'official website') {
    cleanName = PLATFORM_CONFIGS[detectedPlatform].displayName;
  }

  return {
    targetName: cleanName,
    platform: detectedPlatform,
    action,
    isDirectLaunch,
    rawQuery: query,
  };
}

/**
 * Resolves or constructs a validated Public Social Profile Card for any creator / platform
 */
export function resolveSocialProfile(
  targetName: string,
  platform: SocialPlatform,
  options?: {
    customDescription?: string;
    isVerified?: boolean;
    handle?: string;
    avatarUrl?: string;
    directLaunch?: boolean;
  }
): SocialProfileCard {
  const normKey = targetName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const known = VERIFIED_PUBLIC_CREATORS[normKey];
  const config = PLATFORM_CONFIGS[platform];

  // If we have a verified known creator matching the exact platform or cross-platform
  if (known && (known.platform === platform || !platform)) {
    const activePlatform = known.platform || platform;
    const activeConfig = PLATFORM_CONFIGS[activePlatform];
    return {
      id: `social-${normKey}-${activePlatform}`,
      targetName: known.targetName || targetName,
      platform: activePlatform,
      platformDisplayName: activeConfig.displayName,
      profileTitle: known.profileTitle || `${targetName} on ${activeConfig.displayName}`,
      handle: known.handle || `@${targetName.replace(/\s+/g, '')}`,
      description: options?.customDescription || known.description || `Public ${activeConfig.displayName} channel & profile for ${targetName}.`,
      webUrl: known.webUrl || activeConfig.buildWebProfileUrl(targetName),
      appDeepLink: known.appDeepLink || (activeConfig.buildAppDeepLink ? activeConfig.buildAppDeepLink(targetName) : undefined),
      avatarUrl: known.avatarUrl || options?.avatarUrl,
      isVerified: known.isVerified !== undefined ? known.isVerified : false,
      subscriberCount: known.subscriberCount,
      followersCount: known.followersCount,
      category: known.category || activeConfig.category,
      directLaunchSuggested: options?.directLaunch ?? false,
      alternativeOptions: known.alternativeOptions,
    };
  }

  // Dynamic public resolution for any requested creator/topic
  const cleanHandle = (options?.handle || targetName)
    .trim()
    .replace(/^@/, '')
    .replace(/\s+/g, '_');

  const webUrl = config.buildWebProfileUrl(cleanHandle);
  const appDeepLink = config.buildAppDeepLink ? config.buildAppDeepLink(cleanHandle) : undefined;

  // Generate alternative cross-platform search suggestions
  const alternativeOptions: AlternativeSocialOption[] = [];
  if (platform !== 'youtube') {
    alternativeOptions.push({
      platform: 'youtube',
      platformDisplayName: 'YouTube',
      webUrl: PLATFORM_CONFIGS.youtube.buildWebProfileUrl(targetName),
      appDeepLink: PLATFORM_CONFIGS.youtube.buildAppDeepLink?.(targetName),
      handle: `@${targetName.replace(/\s+/g, '')}`,
    });
  }
  if (platform !== 'x') {
    alternativeOptions.push({
      platform: 'x',
      platformDisplayName: 'X (Twitter)',
      webUrl: PLATFORM_CONFIGS.x.buildWebProfileUrl(targetName),
      appDeepLink: PLATFORM_CONFIGS.x.buildAppDeepLink?.(targetName),
      handle: `@${targetName.replace(/\s+/g, '')}`,
    });
  }
  if (platform !== 'instagram') {
    alternativeOptions.push({
      platform: 'instagram',
      platformDisplayName: 'Instagram',
      webUrl: PLATFORM_CONFIGS.instagram.buildWebProfileUrl(targetName),
      appDeepLink: PLATFORM_CONFIGS.instagram.buildAppDeepLink?.(targetName),
      handle: `@${targetName.replace(/\s+/g, '')}`,
    });
  }

  return {
    id: `social-${Date.now()}-${platform}`,
    targetName: targetName,
    platform: platform,
    platformDisplayName: config.displayName,
    profileTitle: `${targetName}`,
    handle: `@${cleanHandle}`,
    description: options?.customDescription || `Public ${config.displayName} profile and content for "${targetName}". Open in app or browser.`,
    webUrl: webUrl,
    appDeepLink: appDeepLink,
    avatarUrl: options?.avatarUrl,
    isVerified: options?.isVerified || false,
    category: config.category,
    searchQuery: targetName,
    directLaunchSuggested: options?.directLaunch ?? false,
    alternativeOptions: alternativeOptions.slice(0, 2),
  };
}

/**
 * Validates whether a URL is safe and points to a legitimate official domain
 */
export function isSafeUrl(url: string, expectedPlatform?: SocialPlatform): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    // Check if valid URL or supported custom scheme
    if (url.startsWith('vnd.youtube:') || url.startsWith('instagram:') || url.startsWith('twitter:') || url.startsWith('snssdk1233:') || url.startsWith('tiktok:') || url.startsWith('fb:') || url.startsWith('reddit:') || url.startsWith('spotify:')) {
      return true;
    }

    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    if (expectedPlatform && expectedPlatform !== 'web') {
      const config = PLATFORM_CONFIGS[expectedPlatform];
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      return config.officialDomains.some((d) => host === d || host.endsWith(`.${d}`));
    }

    return true;
  } catch {
    return false;
  }
}

export interface SmartLaunchResult {
  launchedVia: 'app' | 'web';
  success: boolean;
  message: string;
}

/**
 * Smart App Launcher with Universal Web Fallback
 * 1. Checks if running on Android / Mobile browser
 * 2. Attempts native App Link / custom deep link scheme
 * 3. Safely falls back to official web destination in standard browser window
 */
export async function launchSmartLink(options: {
  webUrl: string;
  appDeepLink?: string;
  platform: SocialPlatform;
  onNotice?: (message: string) => void;
}): Promise<SmartLaunchResult> {
  const { webUrl, appDeepLink, platform, onNotice } = options;
  const config = PLATFORM_CONFIGS[platform];

  // Validate security of target destination
  if (!isSafeUrl(webUrl, platform)) {
    const errorMsg = 'Blocked opening destination: URL failed security validation.';
    if (onNotice) onNotice(errorMsg);
    return { launchedVia: 'web', success: false, message: errorMsg };
  }

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // If on Android/Mobile and a deep link exists, attempt smart app launch
  if (isMobile && appDeepLink) {
    if (onNotice) {
      onNotice(`Launching ${config.displayName} application...`);
    }

    let appOpened = false;
    const startTime = Date.now();

    // Listen for blur or pagehide (indicates native app opened)
    const onVisibilityChange = () => {
      if (document.hidden || Date.now() - startTime > 1500) {
        appOpened = true;
      }
    };
    window.addEventListener('visibilitychange', onVisibilityChange, { once: true });

    try {
      if (isAndroid && config.androidPackage && webUrl.startsWith('https://')) {
        // Standard Android App Link intent
        window.location.href = appDeepLink;
      } else {
        // Custom URI scheme fallback
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appDeepLink;
        document.body.appendChild(iframe);
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1000);
      }
    } catch {
      // Ignore initial deep link scheme failure
    }

    // Wait short interval to verify if app took over
    await new Promise((r) => setTimeout(r, 600));
    window.removeEventListener('visibilitychange', onVisibilityChange);

    if (!appOpened && !document.hidden) {
      if (onNotice) {
        onNotice(`${config.displayName} app not detected. Opening official webpage in browser...`);
      }
      window.open(webUrl, '_blank', 'noopener,noreferrer');
      return {
        launchedVia: 'web',
        success: true,
        message: `Opened official ${config.displayName} web page.`,
      };
    }

    return {
      launchedVia: 'app',
      success: true,
      message: `Launched ${config.displayName} application.`,
    };
  }

  // Standard Web Navigation (Desktop or browser fallback)
  if (onNotice) {
    onNotice(`Opening official ${config.displayName} page...`);
  }
  
  try {
    const win = window.open(webUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      // If popup blocker intervened, do top navigation
      window.location.href = webUrl;
    }
    return {
      launchedVia: 'web',
      success: true,
      message: `Navigated to official ${config.displayName} page.`,
    };
  } catch (err) {
    return {
      launchedVia: 'web',
      success: false,
      message: `Failed to open destination: ${err}`,
    };
  }
}

/**
 * Copies a link to the clipboard with visual confirmation
 */
export async function copyLinkToClipboard(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Shares a link via native Web Share API or falls back to copy
 */
export async function shareSocialLink(data: {
  title: string;
  text?: string;
  url: string;
}): Promise<{ shared: boolean; method: 'native_share' | 'clipboard' }> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text || `Check out ${data.title} found via AniVox`,
        url: data.url,
      });
      return { shared: true, method: 'native_share' };
    } catch {
      // User cancelled or share failed, continue to fallback
    }
  }

  const copied = await copyLinkToClipboard(data.url);
  return { shared: copied, method: 'clipboard' };
}
