import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Cpu,
  Mic,
  Volume2,
  Database,
  Search,
  Image,
  Phone,
  PhoneCall,
  CreditCard,
  Music,
  Radio,
  Youtube,
  Mail,
  Video,
  Layers,
  CloudSun,
  Battery,
  HardDrive,
  Shield,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

export interface ControlCenterItem {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  color: string;
}

export interface VoxControlCenterProps {
  onNavigate?: (screen: string) => void;
  onOpenInstall?: () => void;
}

export const VoxControlCenter: React.FC<VoxControlCenterProps> = ({
  onNavigate,
  onOpenInstall,
}) => {
  // Load feature switches from localStorage
  const [switches, setSwitches] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('anivox_control_switches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      ai_brain: true,
      voice_synthesizer: true,
      microphone_recognition: true,
      long_term_memory: true,
      smart_grounded_search: true,
      image_generation: true,
      phone_assistant: true,
      phone_calling: true,
      sim_disambiguation: true,
      media_assistant: true,
      audiomack_integration: true,
      youtube_channel: true,
      gmail_assistant: true,
      creator_studio: true,
      overlay_floating_orb: true,
      live_weather: true,
      battery_telemetry: true,
      storage_diagnostics: true,
      transparent_privacy: true,
      pwa_installation: true,
    };
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    try {
      localStorage.setItem('anivox_control_switches', JSON.stringify(switches));
    } catch (e) {}
  }, [switches]);

  const toggleSwitch = (id: string) => {
    soundEffects.playTap();
    setSwitches((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const CONTROL_ITEMS: ControlCenterItem[] = [
    {
      id: 'ai_brain',
      category: 'AI & Intelligence',
      name: 'AI Fast Brain & Core Knowledge',
      description: 'Autonomous factual answering for water, physics, science, history, and definitions with zero latency.',
      icon: Cpu,
      enabled: switches['ai_brain'] ?? true,
      color: 'text-indigo-400',
    },
    {
      id: 'voice_synthesizer',
      category: 'Voice & Audio',
      name: 'Vox Voice Synthesizer',
      description: 'Dynamic male voice personas (Vox Classic, Deep, Gentle, Calm, Energetic, Professional).',
      icon: Volume2,
      enabled: switches['voice_synthesizer'] ?? true,
      color: 'text-cyan-400',
    },
    {
      id: 'microphone_recognition',
      category: 'Voice & Audio',
      name: 'Microphone & Live Speech Transcriber',
      description: 'Live audio detection with dynamic waveform HUD (silent ──── vs speech ▂▅▇█▆▃▅▇).',
      icon: Mic,
      enabled: switches['microphone_recognition'] ?? true,
      color: 'text-emerald-400',
    },
    {
      id: 'long_term_memory',
      category: 'Memory & Privacy',
      name: 'User-Controlled Long-Term Memory',
      description: 'Transparent preference storage. Fully viewable, editable, and deletable by user at any time.',
      icon: Database,
      enabled: switches['long_term_memory'] ?? true,
      color: 'text-purple-400',
    },
    {
      id: 'smart_grounded_search',
      category: 'Search & Grounding',
      name: 'Smart Grounded Web Search',
      description: 'Resilient live search with 10s timeout, retries, and honest fallback for current world events.',
      icon: Search,
      enabled: switches['smart_grounded_search'] ?? true,
      color: 'text-blue-400',
    },
    {
      id: 'image_generation',
      category: 'Creative AI',
      name: 'Neural Image Generation (Imagen 3)',
      description: 'Instant visual art synthesis directly from speech or prompt with inline progress tracking.',
      icon: Image,
      enabled: switches['image_generation'] ?? true,
      color: 'text-pink-400',
    },
    {
      id: 'phone_assistant',
      category: 'Phone & Device',
      name: 'Phone & Communication Assistant',
      description: 'Native contact calling, dialer launcher, and multi-number verification.',
      icon: Phone,
      enabled: switches['phone_assistant'] ?? true,
      color: 'text-green-400',
    },
    {
      id: 'phone_calling',
      category: 'Phone & Device',
      name: 'Direct Call Dispatcher',
      description: 'Launches native tel: intent with exact confirmed phone number.',
      icon: PhoneCall,
      enabled: switches['phone_calling'] ?? true,
      color: 'text-emerald-400',
    },
    {
      id: 'sim_disambiguation',
      category: 'Phone & Device',
      name: 'SIM Card Disambiguation',
      description: 'Prompts user for SIM preference (SIM 1 / SIM 2) when multiple carrier lines exist.',
      icon: CreditCard,
      enabled: switches['sim_disambiguation'] ?? true,
      color: 'text-amber-400',
    },
    {
      id: 'media_assistant',
      category: 'Media & Entertainment',
      name: 'Media Playback Assistant',
      description: 'Intelligent media routing for audio, video, and streaming platforms.',
      icon: Music,
      enabled: switches['media_assistant'] ?? true,
      color: 'text-orange-400',
    },
    {
      id: 'audiomack_integration',
      category: 'Media & Entertainment',
      name: 'Audiomack Music Player',
      description: 'Direct deep-linking and playback launcher for Afrobeats, Hip-Hop, and streaming tracks.',
      icon: Radio,
      enabled: switches['audiomack_integration'] ?? true,
      color: 'text-yellow-400',
    },
    {
      id: 'youtube_channel',
      category: 'YouTube & Creator',
      name: 'Official AniVox YouTube Channel (@dcb-q2x7j)',
      description: 'Instant direct launch to official channel and creator updates without guessing.',
      icon: Youtube,
      enabled: switches['youtube_channel'] ?? true,
      color: 'text-red-400',
    },
    {
      id: 'gmail_assistant',
      category: 'Productivity & Email',
      name: 'Gmail & Email Assistant',
      description: 'Summaries, employment detection, and protected draft-only replies via Google OAuth.',
      icon: Mail,
      enabled: switches['gmail_assistant'] ?? true,
      color: 'text-cyan-400',
    },
    {
      id: 'creator_studio',
      category: 'YouTube & Creator',
      name: 'YouTube Creator Studio & Copilot',
      description: 'AI video ideation, high-CTR title formulas, description templates, and YPP guidelines.',
      icon: Video,
      enabled: switches['creator_studio'] ?? true,
      color: 'text-rose-400',
    },
    {
      id: 'overlay_floating_orb',
      category: 'Display & Overlay',
      name: 'Display Over Other Apps (Overlay)',
      description: 'Movable floating assistant HUD preview and Android SYSTEM_ALERT_WINDOW integration status.',
      icon: Layers,
      enabled: switches['overlay_floating_orb'] ?? true,
      color: 'text-purple-400',
    },
    {
      id: 'live_weather',
      category: 'Sensors & Telemetry',
      name: 'Live Weather Telemetry',
      description: 'Real-time meteorological conditions, humidity, and temperature data.',
      icon: CloudSun,
      enabled: switches['live_weather'] ?? true,
      color: 'text-amber-300',
    },
    {
      id: 'battery_telemetry',
      category: 'Sensors & Telemetry',
      name: 'Device Battery Status',
      description: 'Real battery percentage and charging state via standard Navigator Battery API.',
      icon: Battery,
      enabled: switches['battery_telemetry'] ?? true,
      color: 'text-emerald-400',
    },
    {
      id: 'storage_diagnostics',
      category: 'Sensors & Telemetry',
      name: 'Storage Remaining Diagnostics',
      description: 'Storage quota estimation via StorageManager API without fake hardware numbers.',
      icon: HardDrive,
      enabled: switches['storage_diagnostics'] ?? true,
      color: 'text-blue-300',
    },
    {
      id: 'transparent_privacy',
      category: 'Memory & Privacy',
      name: 'Transparent Privacy Architecture',
      description: 'Strict security boundaries against covert recording and screen snooping.',
      icon: Shield,
      enabled: switches['transparent_privacy'] ?? true,
      color: 'text-teal-400',
    },
    {
      id: 'pwa_installation',
      category: 'App & System',
      name: 'Progressive Web App (PWA) Standalone Installation',
      description: 'Install AniVox as an independent desktop or mobile application with offline shell.',
      icon: Download,
      enabled: switches['pwa_installation'] ?? true,
      color: 'text-violet-400',
    },
  ];

  const categories = ['all', ...Array.from(new Set(CONTROL_ITEMS.map((i) => i.category)))];

  const filteredItems = CONTROL_ITEMS.filter((item) =>
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="p-6 rounded-3xl glass-panel border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-950/90 to-indigo-950/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-white">
                VOX CONTROL CENTER
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                Master Switches
              </span>
            </div>
            <p className="text-xs text-white/50">
              Individual ON/OFF controls for all 20 AniVox system features, modules, and integrations
            </p>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-white/10 text-xs font-mono text-white/70 self-start md:self-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {Object.values(switches).filter(Boolean).length} of {CONTROL_ITEMS.length} Modules Active
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundEffects.playTap();
              setActiveCategory(cat);
            }}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-black/30 text-white/60 hover:text-white border border-white/5'
            }`}
          >
            {cat === 'all' ? 'All Modules (20)' : cat}
          </button>
        ))}
      </div>

      {/* Grid of Control Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl glass-panel border transition-all flex items-start justify-between gap-4 ${
                item.enabled
                  ? 'border-white/15 bg-slate-950/70 hover:border-purple-500/40'
                  : 'border-white/5 bg-black/40 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Master ON/OFF Switch */}
              <button
                onClick={() => toggleSwitch(item.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.enabled ? 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]' : 'bg-white/20'
                }`}
                role="switch"
                aria-checked={item.enabled}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    item.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
