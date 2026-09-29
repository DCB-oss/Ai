import React from 'react';
import {
  Menu,
  Sparkles,
  Plus,
  Volume2,
  VolumeX,
  Layers,
  Tv,
  ExternalLink,
  Cpu,
  Radio,
  FolderGit2,
} from 'lucide-react';
import { OrbState, AppScreen } from '../../types/assistant';
import { AmbientVoxVisualizer } from '../Orb/AmbientVoxVisualizer';
import { soundEffects } from '../../services/soundEffects';
import { ANIVOX_OFFICIAL_YOUTUBE_URL } from '../../config/anivoxCompany';
import { projectContextService } from '../../services/projectContextService';

interface UnifiedHeaderProps {
  onOpenMenu: () => void;
  onNewChat: () => void;
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  orbState: OrbState;
  isAiConnected: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOrbClick?: () => void;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  onOpenMenu,
  onNewChat,
  currentScreen,
  onNavigate,
  orbState,
  isAiConnected,
  soundEnabled,
  onToggleSound,
  onOrbClick,
}) => {
  const activeProject = projectContextService.getActiveProject();

  const handleOpenDCB = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playTap();
    window.open(ANIVOX_OFFICIAL_YOUTUBE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 bg-[#020408]/90 backdrop-blur-2xl px-3 sm:px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Hamburger Menu Button + Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundEffects.playTap();
              onOpenMenu();
            }}
            className="p-2 rounded-xl glass-panel-interactive border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-white transition-colors"
            title="Open ANIVOX Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>

          <div
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-2 cursor-pointer select-none group"
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
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-[0.16em] uppercase bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  ANIVOX
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  ✦
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">Online & Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Active Project Pill (if on chat) or Screen Title */}
        <div className="hidden md:flex items-center gap-2">
          {activeProject && (
            <button
              onClick={() => onNavigate('projects')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all max-w-[220px] truncate"
              title={`Active Project: ${activeProject.title}`}
            >
              <FolderGit2 className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{activeProject.title}</span>
            </button>
          )}
        </div>

        {/* Right: Quick DCB Link, Sound Toggle & New Chat Button */}
        <div className="flex items-center gap-1.5">
          {/* DCB Universe Quick Link */}
          <button
            onClick={handleOpenDCB}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-bold transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)]"
            title="Open DCB Universe (@DCBUniverse-n)"
          >
            <Tv className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">DCB</span>
          </button>

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

          {/* New Chat Button */}
          <button
            onClick={() => {
              soundEffects.playTap();
              onNewChat();
              onNavigate('chat');
            }}
            className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            title="New Chat"
            aria-label="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
