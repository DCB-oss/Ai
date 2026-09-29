import {
  Film,
  Tv,
  Gamepad2,
  Smartphone,
  Video,
  BookOpen,
  Music,
  Wrench,
  Globe,
  Palette,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { ResourceCategory, ResourceItem } from '../types/assistant';

export interface CategoryMeta {
  id: ResourceCategory;
  label: string;
  emoji: string;
  icon: any;
  colorClass: string;
  badgeClass: string;
  borderClass: string;
  description: string;
}

export const RESOURCE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'movies',
    label: 'Movies',
    emoji: '🎬',
    icon: Film,
    colorClass: 'text-rose-400',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    borderClass: 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    description: 'Feature films, cinema masterpieces, sci-fi epics, and documentaries.',
  },
  {
    id: 'shows_anime',
    label: 'TV Shows & Anime',
    emoji: '📺',
    icon: Tv,
    colorClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    borderClass: 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    description: 'Series, anime sagas, miniseries, and seasonal television.',
  },
  {
    id: 'games',
    label: 'Games',
    emoji: '🎮',
    icon: Gamepad2,
    colorClass: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    borderClass: 'border-cyan-500/30 shadow-[0_0_15px_rgba(0,242,255,0.15)]',
    description: 'Video games, indie roguelikes, RPGs, immersive simulators, and VR.',
  },
  {
    id: 'apps',
    label: 'Apps',
    emoji: '📱',
    icon: Smartphone,
    colorClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    borderClass: 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    description: 'Mobile applications, desktop productivity tools, and utilities.',
  },
  {
    id: 'videos',
    label: 'Videos',
    emoji: '🎥',
    icon: Video,
    colorClass: 'text-red-400',
    badgeClass: 'bg-red-500/15 text-red-300 border-red-500/30',
    borderClass: 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    description: 'Video essays, curated talks, technical keynotes, and walkthroughs.',
  },
  {
    id: 'books',
    label: 'Books',
    emoji: '📚',
    icon: BookOpen,
    colorClass: 'text-indigo-400',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    borderClass: 'border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
    description: 'Fiction, sci-fi novels, non-fiction, philosophy, and technical literature.',
  },
  {
    id: 'music',
    label: 'Music',
    emoji: '🎵',
    icon: Music,
    colorClass: 'text-pink-400',
    badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    borderClass: 'border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]',
    description: 'Albums, playlists, synthwave soundtracks, and focus audio.',
  },
  {
    id: 'tools',
    label: 'Tools',
    emoji: '🛠️',
    icon: Wrench,
    colorClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    borderClass: 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    description: 'Developer kits, workflow automations, CLI utilities, and hardware.',
  },
  {
    id: 'websites',
    label: 'Websites',
    emoji: '🌐',
    icon: Globe,
    colorClass: 'text-teal-400',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    borderClass: 'border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)]',
    description: 'Interactive web portals, digital archives, platforms, and aggregators.',
  },
  {
    id: 'creative',
    label: 'Creative Resources',
    emoji: '🎨',
    icon: Palette,
    colorClass: 'text-purple-400',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    borderClass: 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    description: 'Design systems, font foundries, 3D asset libraries, and shaders.',
  },
  {
    id: 'learning',
    label: 'Learning Resources',
    emoji: '📖',
    icon: GraduationCap,
    colorClass: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    borderClass: 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
    description: 'Interactive tutorials, academic papers, courses, and documentation.',
  },
];

export function normalizeCategory(category: string): ResourceCategory {
  if (!category || typeof category !== 'string') return 'tools';
  const c = category.toLowerCase().trim();
  if (c === 'movie' || c === 'movies') return 'movies';
  if (c === 'show' || c === 'shows' || c === 'anime' || c === 'shows_anime' || c === 'tv') return 'shows_anime';
  if (c === 'game' || c === 'games' || c === 'gaming') return 'games';
  if (c === 'app' || c === 'apps' || c === 'application') return 'apps';
  if (c === 'video' || c === 'videos' || c === 'youtube') return 'videos';
  if (c === 'book' || c === 'books' || c === 'reading') return 'books';
  if (c === 'music' || c === 'song' || c === 'album' || c === 'audio') return 'music';
  if (c === 'tool' || c === 'tools' || c === 'utility') return 'tools';
  if (c === 'website' || c === 'websites' || c === 'web' || c === 'site') return 'websites';
  if (c === 'creative' || c === 'art' || c === 'design') return 'creative';
  if (c === 'learning' || c === 'education' || c === 'course' || c === 'activity' || c === 'tutorial') return 'learning';
  
  // Return as-is if matches any valid category
  const match = RESOURCE_CATEGORIES.find((rc) => rc.id === c);
  return match ? match.id : 'tools';
}

export function getCategoryMeta(category: string): CategoryMeta {
  const normalized = normalizeCategory(category);
  return (
    RESOURCE_CATEGORIES.find((c) => c.id === normalized) || {
      id: 'tools',
      label: 'Tools',
      emoji: '🛠️',
      icon: Sparkles,
      colorClass: 'text-cyan-400',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      borderClass: 'border-cyan-500/30',
      description: 'Resources and tools.',
    }
  );
}

/**
 * Validates external link URL and extracts safe domain name
 */
export function getSafeDomainInfo(url?: string): {
  isValid: boolean;
  domain: string;
  safeHref: string;
} {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { isValid: false, domain: '', safeHref: '' };
  }

  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const validProtocols = ['http:', 'https:'];
    if (!validProtocols.includes(parsed.protocol)) {
      return { isValid: false, domain: '', safeHref: '' };
    }
    return {
      isValid: true,
      domain: parsed.hostname.replace(/^www\./, ''),
      safeHref: parsed.href,
    };
  } catch {
    return { isValid: false, domain: '', safeHref: '' };
  }
}

export const INITIAL_RESOURCE_LIBRARY: ResourceItem[] = [
  {
    id: 'res-movie-1',
    title: 'Interstellar',
    creator: 'Christopher Nolan',
    category: 'movies',
    description: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanity\'s survival.',
    tags: ['Sci-Fi', 'Space', 'Drama', 'Epic'],
    rating: '8.7/10',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-15T12:00:00.000Z',
    timestamp: '2026-08-15T12:00:00.000Z',
    lastViewedAt: '2026-08-20T18:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    link: 'https://www.imdb.com/title/tt0816692/',
    notes: 'Incredible Hans Zimmer organ score. Mind-bending physics and emotional core.',
    recommendationReason: 'Matches your taste for grand scale science fiction and philosophical depth.',
    source: 'user_added',
  },
  {
    id: 'res-show-1',
    title: 'Arcane: League of Legends',
    creator: 'Christian Linke & Alex Yee / Fortiche',
    category: 'shows_anime',
    description: 'Set in the utopian Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic champions.',
    tags: ['Animation', 'Sci-Fi', 'Fantasy', 'Cyberpunk'],
    rating: '9.0/10',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-16T14:30:00.000Z',
    timestamp: '2026-08-16T14:30:00.000Z',
    lastViewedAt: '2026-08-19T20:15:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    link: 'https://www.netflix.com/title/81435684',
    notes: 'Flawless art direction, lighting, and visceral combat choreography.',
    recommendationReason: 'Recommended for exceptional world-building and character dynamics.',
    source: 'ai_recommendation',
  },
  {
    id: 'res-game-1',
    title: 'Cyberpunk 2077: Phantom Liberty',
    creator: 'CD Projekt Red',
    category: 'games',
    description: 'A spy-thriller RPG adventure set in the treacherous walled district of Dogtown with Idris Elba.',
    tags: ['RPG', 'Cyberpunk', 'Open World', 'Action'],
    rating: '9.3/10',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-17T09:00:00.000Z',
    timestamp: '2026-08-17T09:00:00.000Z',
    lastViewedAt: '2026-08-20T19:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    link: 'https://store.steampowered.com/app/2138330/Cyberpunk_2077_Phantom_Liberty/',
    notes: 'Stunning ray tracing and rich branching storyline endings.',
    recommendationReason: 'Perfect match with your favorite cyberpunk aesthetic and fast-paced combat.',
    source: 'user_added',
  },
  {
    id: 'res-app-1',
    title: 'Raycast',
    creator: 'Raycast Community',
    category: 'apps',
    description: 'An ultra-fast, extensible launcher that lets you control your tools, run scripts, manage clipboard, and navigate in seconds.',
    tags: ['Productivity', 'Launcher', 'Automation', 'Workflow'],
    rating: '4.9★',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-14T10:00:00.000Z',
    timestamp: '2026-08-14T10:00:00.000Z',
    lastViewedAt: '2026-08-20T16:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    link: 'https://www.raycast.com',
    notes: 'Essential daily driver. Configured custom hotkeys for quick window management.',
    recommendationReason: 'Tailored for high-efficiency keyboard-centric power users.',
    source: 'user_added',
  },
  {
    id: 'res-video-1',
    title: 'The Beauty of Atmospheric Sci-Fi Cinematography',
    creator: 'Thomas Flight',
    category: 'videos',
    description: 'An insightful visual breakdown analyzing lighting, color grading, and scale in modern science fiction films.',
    tags: ['Video Essay', 'Cinematography', 'Film Analysis', 'Sci-Fi'],
    rating: '4.9★',
    userRating: 4,
    isFavorite: false,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-18T16:20:00.000Z',
    timestamp: '2026-08-18T16:20:00.000Z',
    lastViewedAt: '2026-08-19T11:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    link: 'https://www.youtube.com',
    notes: 'Great visual examples of anamorphic lenses and atmospheric haze.',
    recommendationReason: 'Matches your interest in futuristic cinematography and visual design.',
    source: 'ai_recommendation',
  },
  {
    id: 'res-book-1',
    title: 'Project Hail Mary',
    creator: 'Andy Weir',
    category: 'books',
    description: 'A lone astronaut must solve an extinction-level catastrophe using pure scientific reasoning and an unexpected cosmic friendship.',
    tags: ['Sci-Fi', 'Space', 'Hard Sci-Fi', 'Humor'],
    rating: '4.9★',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-13T11:00:00.000Z',
    timestamp: '2026-08-13T11:00:00.000Z',
    lastViewedAt: '2026-08-20T14:10:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    link: 'https://www.goodreads.com/book/show/54493401-project-hail-mary',
    notes: 'One of the best sci-fi audiobooks ever produced. Rocky is unforgettable.',
    recommendationReason: 'Recommended for optimistic problem-solving and thrilling physics puzzles.',
    source: 'user_added',
  },
  {
    id: 'res-music-1',
    title: 'Gunship - Unicorn',
    creator: 'GUNSHIP',
    category: 'music',
    description: 'A cinematic retro-futuristic synthwave album blending cyberpunk basslines, saxophones, and guest vocals.',
    tags: ['Synthwave', 'Cyberpunk', 'Electronic', 'Retrowave'],
    rating: '9.2/10',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-15T15:00:00.000Z',
    timestamp: '2026-08-15T15:00:00.000Z',
    lastViewedAt: '2026-08-20T17:45:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    link: 'https://gunshipmusic.bandcamp.com',
    notes: 'Top focus album for coding sessions and night drives.',
    recommendationReason: 'Directly aligns with your preference for electronic synthesizers and atmospheric focus audio.',
    source: 'user_added',
  },
  {
    id: 'res-tool-1',
    title: 'Obsidian Knowledge Vault',
    creator: 'Obsidian Team',
    category: 'tools',
    description: 'A private, extensible markdown second-brain with interactive graph relationships and offline canvas.',
    tags: ['Productivity', 'Markdown', 'Notes', 'Second Brain'],
    rating: '4.9★',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-12T08:00:00.000Z',
    timestamp: '2026-08-12T08:00:00.000Z',
    lastViewedAt: '2026-08-20T19:20:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
    link: 'https://obsidian.md',
    notes: 'Local-first files stored directly in plain markdown folders.',
    recommendationReason: 'Ideal for linking project notes, thoughts, and technical specifications.',
    source: 'user_added',
  },
  {
    id: 'res-web-1',
    title: 'WebGL Earth & Shader Art Showcase',
    creator: 'ShaderToy Community',
    category: 'websites',
    description: 'An interactive repository of real-time procedural GLSL fragment shaders, raymarching, and procedural audio.',
    tags: ['WebGL', 'GLSL', 'Shaders', 'Graphics', 'Creative Coding'],
    rating: '4.8★',
    userRating: 4,
    isFavorite: false,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-18T10:00:00.000Z',
    timestamp: '2026-08-18T10:00:00.000Z',
    lastViewedAt: '2026-08-19T14:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80',
    link: 'https://www.shadertoy.com',
    notes: 'Great reference for lighting equations and particle simulations.',
    recommendationReason: 'Inspiring visual resource for generative UI and shader effects.',
    source: 'ai_recommendation',
  },
  {
    id: 'res-creative-1',
    title: 'Lucide Icons Library',
    creator: 'Lucide Project',
    category: 'creative',
    description: 'Beautiful & consistent icon set made by the community. Open source, modular, and optimized for React.',
    tags: ['Design', 'Icons', 'UI/UX', 'Open Source', 'Vector'],
    rating: '5.0★',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-11T12:00:00.000Z',
    timestamp: '2026-08-11T12:00:00.000Z',
    lastViewedAt: '2026-08-20T15:30:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    link: 'https://lucide.dev',
    notes: 'Crisp stroke weight and seamless TypeScript integration.',
    recommendationReason: 'The standard icon library powering modern interface designs.',
    source: 'user_added',
  },
  {
    id: 'res-learning-1',
    title: 'Full-Stack Modern TypeScript & Web Standards',
    creator: 'MDN Web Docs & TC39',
    category: 'learning',
    description: 'Comprehensive, interactive documentation covering ECMAScript standards, Web APIs, and progressive web design.',
    tags: ['TypeScript', 'JavaScript', 'Web APIs', 'Documentation', 'Learning'],
    rating: '5.0★',
    userRating: 5,
    isFavorite: true,
    saved: true,
    userStatus: 'saved',
    dateAdded: '2026-08-10T10:00:00.000Z',
    timestamp: '2026-08-10T10:00:00.000Z',
    lastViewedAt: '2026-08-20T12:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    link: 'https://developer.mozilla.org',
    notes: 'Unrivaled standard for browser APIs, accessibility, and modern performance.',
    recommendationReason: 'Essential learning and reference guide for software engineering.',
    source: 'user_added',
  },
];

export const INITIAL_RESOURCES: ResourceItem[] = INITIAL_RESOURCE_LIBRARY;
