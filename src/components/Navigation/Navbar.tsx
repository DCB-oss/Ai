import React from 'react';
import { Sparkles, Mic, Volume2, VolumeX, Cpu, Radio, Settings, Smartphone, Youtube, Mail, Sliders, Layers } from 'lucide-react';
import { OrbState, AppScreen } from '../../types/assistant';
import { AmbientVoxVisualizer } from '../Orb/AmbientVoxVisualizer';

interface NavbarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  orbState: OrbState;
  isAiConnected: boolean;
  modelName: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOrbClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  orbState,
  isAiConnected,
  modelName,
  soundEnabled,
  onToggleSound,
  onOrbClick,
}) => {
  const getStatusBadge = () => {
    if (isAiConnected) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold tracking-wide shadow-sm shadow-emerald-950/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>AI CONNECTED</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-semibold tracking-wide shadow-sm shadow-amber-950/50">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <Radio className="w-3 h-3 text-amber-400" />
        <span>KNOWLEDGE ENGINE</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-[#020408]/80 backdrop-blur-2xl px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand + Ambient Mini Visualizer */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="relative">
            <AmbientVoxVisualizer
              state={orbState}
              size="sm"
              interactive={true}
              onClick={onOrbClick}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-[0.18em] uppercase bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                VOX
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 tracking-widest">
                AniVox
              </span>
            </div>
            <p className="text-[10px] text-white/50 tracking-wider hidden sm:block">
              PERSONAL AI ASSISTANT
            </p>
          </div>
        </div>

        {/* Center: AI Status Pill */}
        <div className="hidden xs:flex items-center gap-2">
          {getStatusBadge()}
        </div>

        {/* Right: Quick Navigation & Audio Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'glass-panel text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'glass-panel text-white/40 border-white/10 hover:text-white/70'
            }`}
            title={soundEnabled ? 'Mute Interface Sounds' : 'Unmute Interface Sounds'}
            aria-label="Toggle Interface Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* AniVox Projects (Cosmic Wrath & Universes) */}
          <button
            onClick={() => onNavigate('projects')}
            className={`p-2 rounded-xl border transition-all ${
              currentScreen === 'projects'
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'glass-panel border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
            title="AniVox Projects & Lore Hub"
            aria-label="Open AniVox Projects"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Email Assistant Shortcut */}
          <button
            onClick={() => onNavigate('email')}
            className={`p-2 rounded-xl border transition-all ${
              currentScreen === 'email'
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'glass-panel border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
            title="Gmail & Email Assistant"
            aria-label="Open Email Assistant"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Creator Studio Shortcut */}
          <button
            onClick={() => onNavigate('creator')}
            className={`p-2 rounded-xl border transition-all ${
              currentScreen === 'creator'
                ? 'bg-red-500/20 border-red-500/40 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                : 'glass-panel border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
            title="YouTube Creator Hub"
            aria-label="Open Creator Studio"
          >
            <Youtube className="w-4 h-4" />
          </button>

          {/* Master Control Center */}
          <button
            onClick={() => onNavigate('controls')}
            className={`p-2 rounded-xl border transition-all ${
              currentScreen === 'controls'
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'glass-panel border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
            title="AniVox Control Center"
            aria-label="Open Control Center"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Settings Shortcut */}
          <button
            onClick={() => onNavigate('settings')}
            className={`p-2 rounded-xl border transition-all ${
              currentScreen === 'settings'
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'glass-panel border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
            title="AniVox Settings"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

