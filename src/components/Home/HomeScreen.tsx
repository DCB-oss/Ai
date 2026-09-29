import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Square,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  FolderGit2,
  Users,
  Gamepad2,
  Clapperboard,
  PenTool,
  Bot,
  Tv,
  Image as ImageIcon,
  ArrowRight,
  Radio,
  Clock,
  Zap,
} from 'lucide-react';
import {
  OrbState,
  TimerItem,
  ActionPayload,
  MemoryItem,
  AssistantSettings,
  AppScreen,
} from '../../types/assistant';
import { AmbientVoxVisualizer } from '../Orb/AmbientVoxVisualizer';
import { VolumeControlSlider } from '../VolumeControl/VolumeControlSlider';
import { SocialResultCard } from '../Social/SocialResultCard';
import { soundEffects } from '../../services/soundEffects';
import { ANIVOX_OFFICIAL_YOUTUBE_URL } from '../../config/anivoxCompany';
import { projectContextService } from '../../services/projectContextService';

interface HomeScreenProps {
  orbState: OrbState;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  waveformBars?: number[];
  micState?: 'idle' | 'listening' | 'voice_detected' | 'transcribing' | 'speaking' | 'error';
  transcript: string;
  interimTranscript: string;
  lastReply: string;
  lastAction?: ActionPayload | null;
  activeTimers: TimerItem[];
  memories: MemoryItem[];
  isAiConnected: boolean;
  settings: AssistantSettings;
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  onSubmitPrompt: (text: string) => void;
  onNavigate: (screen: AppScreen) => void;
  onTestVoice?: () => void;
  onOpenImageGen?: () => void;
  onOpenInstallModal?: () => void;
  isInstallable?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  orbState,
  isListening,
  isSpeaking,
  audioLevel = 0,
  waveformBars = [0, 0, 0, 0, 0, 0, 0, 0],
  micState = 'idle',
  transcript,
  interimTranscript,
  lastReply,
  lastAction,
  activeTimers,
  memories,
  isAiConnected,
  settings,
  onUpdateSettings,
  onToggleMic,
  onStopSpeaking,
  onSubmitPrompt,
  onNavigate,
  onTestVoice,
  onOpenImageGen,
  onOpenInstallModal,
  isInstallable,
}) => {
  const [inputText, setInputText] = useState('');
  const [showVolumePanel, setShowVolumePanel] = useState(false);

  // Active Project Memory
  const [activeProject, setActiveProject] = useState(() => {
    const defaultProj = projectContextService.getActiveProject();
    return defaultProj;
  });

  useEffect(() => {
    const current = projectContextService.getActiveProject();
    if (current) {
      setActiveProject(current);
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitPrompt(inputText.trim());
    setInputText('');
  };

  const handleOpenDCBUniverse = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playTap();
    // Safely open in new tab/window without navigating away or replacing ANIVOX
    window.open(ANIVOX_OFFICIAL_YOUTUBE_URL, '_blank', 'noopener,noreferrer');
  };

  // Continue working on active project
  const handleContinueProject = () => {
    soundEffects.playTap();
    const proj = activeProject || projectContextService.getActiveProject();
    onSubmitPrompt(`Continue working on ${proj.title}. Show current active tasks and characters.`);
    onNavigate('chat');
  };

  // Choose another project
  const handleChooseAnotherProject = () => {
    soundEffects.playTap();
    onNavigate('projects');
  };

  // Action Buttons List
  const creatorActions = [
    {
      id: 'ask-anivox',
      label: 'Ask ANIVOX',
      icon: Bot,
      emoji: '🤖',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 hover:border-cyan-400',
      badgeColor: 'bg-cyan-500 text-black',
      onClick: () => {
        soundEffects.playTap();
        onNavigate('chat');
      },
    },
    {
      id: 'create',
      label: 'Create',
      icon: Clapperboard,
      emoji: '🎬',
      color: 'from-rose-500/20 to-purple-500/20 text-rose-300 border-rose-500/40 hover:border-rose-400',
      badgeColor: 'bg-rose-500 text-white',
      onClick: () => {
        soundEffects.playTap();
        onNavigate('creator');
      },
    },
    {
      id: 'game-studio',
      label: 'Game Studio',
      icon: Gamepad2,
      emoji: '🎮',
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40 hover:border-purple-400',
      badgeColor: 'bg-purple-500 text-white',
      onClick: () => {
        soundEffects.playTap();
        onSubmitPrompt('Open Game Studio: build lore, boss mechanics, and interactive universe systems.');
        onNavigate('chat');
      },
    },
    {
      id: 'create-image',
      label: 'Create Image',
      icon: ImageIcon,
      emoji: '🎨',
      color: 'from-pink-500/20 to-fuchsia-500/20 text-pink-300 border-pink-500/40 hover:border-pink-400',
      badgeColor: 'bg-pink-500 text-white',
      onClick: () => {
        soundEffects.playTap();
        if (onOpenImageGen) onOpenImageGen();
        else onSubmitPrompt('Generate an image concept for Cosmic Wrath: The Lost Titans');
      },
    },
    {
      id: 'write',
      label: 'Write',
      icon: PenTool,
      emoji: '✍️',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400',
      badgeColor: 'bg-emerald-500 text-black',
      onClick: () => {
        soundEffects.playTap();
        onSubmitPrompt('Open Writer: Let’s draft the next scene script and dialogue.');
        onNavigate('chat');
      },
    },
    {
      id: 'my-projects',
      label: 'My Projects',
      icon: FolderGit2,
      emoji: '📁',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 hover:border-amber-400',
      badgeColor: 'bg-amber-500 text-black',
      onClick: () => {
        soundEffects.playTap();
        onNavigate('projects');
      },
    },
    {
      id: 'characters',
      label: 'Characters',
      icon: Users,
      emoji: '👤',
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40 hover:border-blue-400',
      badgeColor: 'bg-blue-500 text-white',
      onClick: () => {
        soundEffects.playTap();
        onSubmitPrompt('List all active characters, Atlas-Prime, Kronos, Nova-7, and character lore.');
        onNavigate('chat');
      },
    },
    {
      id: 'voice',
      label: 'Voice',
      icon: Mic,
      emoji: '🎙️',
      color: 'from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-500/40 hover:border-teal-400',
      badgeColor: 'bg-teal-500 text-black',
      onClick: () => {
        soundEffects.playTap();
        onNavigate('settings');
      },
    },
    {
      id: 'dcb-universe',
      label: 'DCB Universe',
      icon: Tv,
      emoji: '📺',
      color: 'from-red-500/20 to-rose-600/20 text-red-300 border-red-500/50 hover:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
      badgeColor: 'bg-red-500 text-white',
      onClick: handleOpenDCBUniverse,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-130px)] px-3 sm:px-6 py-4 max-w-4xl mx-auto w-full space-y-6 animate-fade-in">
      {/* Top Brand & Utility Header */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-panel border-cyan-500/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-black text-xs tracking-wider">ANIVOX ✦</span>
          </div>

          <button
            onClick={handleOpenDCBUniverse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            title="Open DCB Universe (@DCBUniverse-n)"
          >
            <Tv className="w-3.5 h-3.5 text-red-400" />
            <span className="truncate">DCB Universe</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2">
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
            >
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={() => setShowVolumePanel(!showVolumePanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              showVolumePanel
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'glass-panel text-white/70 hover:text-white border-white/10'
            }`}
            title="Adjust Voice Volume"
          >
            {settings.isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {Math.round((settings.assistantVolume ?? 1) * 100)}%
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Volume Drawer */}
      {showVolumePanel && (
        <div className="w-full p-4 rounded-3xl glass-panel border-cyan-500/30 bg-slate-950/95 shadow-[0_12px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Voice & Assistant Volume</span>
            </span>
            <button
              onClick={() => setShowVolumePanel(false)}
              className="text-[11px] font-semibold text-white/50 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <VolumeControlSlider
            volume={settings.assistantVolume ?? 1.0}
            isMuted={Boolean(settings.isMuted)}
            onChange={(newVol, newMuted) => {
              onUpdateSettings({
                assistantVolume: newVol,
                voiceVolume: newVol,
                isMuted: newMuted,
              });
            }}
            onTestVoice={onTestVoice}
            isSpeaking={isSpeaking}
            onStopSpeaking={onStopSpeaking}
            variant="compact"
          />
        </div>
      )}

      {/* Personalized Welcome Card / Returning Creator Experience */}
      {activeProject ? (
        <div className="w-full max-w-xl p-4 sm:p-5 rounded-3xl glass-panel border-cyan-500/40 bg-gradient-to-br from-slate-950/90 via-cyan-950/30 to-purple-950/40 shadow-[0_0_35px_rgba(6,182,212,0.15)] text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Welcome back, Creator.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-cyan-200 font-medium">
            Continue working on <span className="font-bold text-white underline underline-offset-4 decoration-cyan-400">{activeProject.title}</span>?
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={handleContinueProject}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 hover:scale-102"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleChooseAnotherProject}
              className="px-4 py-2.5 rounded-xl glass-panel-interactive border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-white font-bold text-xs transition-all"
            >
              Choose another project
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-300 tracking-wide">
            Welcome, Creator.
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-cyan-300/80 uppercase">
            What do you want to do today?
          </p>
        </div>
      )}

      {/* Main Center Area: Interactive Orb & Visualizer */}
      <div className="w-full flex flex-col items-center justify-center text-center space-y-3 py-1">
        <div className="relative flex items-center justify-center">
          <AmbientVoxVisualizer
            state={orbState}
            audioLevel={audioLevel}
            size="medium"
            interactive={true}
            onClick={isSpeaking ? onStopSpeaking : onToggleMic}
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Live Waveform Activity or Transcript */}
        {isListening && (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1 h-5 px-4 py-1 rounded-full bg-black/70 border border-cyan-500/40">
              {audioLevel > 0.05 ? (
                <div className="flex items-center gap-1 font-mono text-cyan-400 text-xs">
                  {waveformBars.map((height, i) => (
                    <span
                      key={i}
                      className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, (height / 100) * 16)}px` }}
                    />
                  ))}
                </div>
              ) : (
                <span className="font-mono text-cyan-300/60 text-[10px] tracking-widest animate-pulse">
                  LISTENING FOR VOICE...
                </span>
              )}
            </div>
            {interimTranscript && (
              <p className="text-xs font-medium text-cyan-300 italic max-w-sm px-4">
                "{interimTranscript}"
              </p>
            )}
          </div>
        )}

        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="px-4 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Speaking</span>
          </button>
        )}
      </div>

      {/* CLEAN WELCOME SCREEN ACTIONS GRID (Large, touch-friendly on phone) */}
      <div className="w-full max-w-2xl space-y-2.5">
        <div className="text-center pb-1">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">
            What do you want to do today?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {creatorActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`p-3.5 sm:p-4 rounded-2xl glass-panel bg-gradient-to-r ${action.color} border flex items-center gap-3 transition-all hover:scale-102 active:scale-98 shadow-md text-left group`}
              >
                <div className="text-xl sm:text-2xl shrink-0 p-1 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center w-10 h-10">
                  {action.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    <span>{action.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Bottom Voice & Text Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="w-full relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl glass-panel border-cyan-500/30 focus-within:border-cyan-400 bg-[#020408]/95 shadow-[0_0_35px_rgba(0,0,0,0.7)] transition-all"
      >
        {/* [ Microphone ] Button */}
        <button
          type="button"
          onClick={onToggleMic}
          className={`p-3.5 rounded-xl flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.7)] animate-pulse'
              : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:scale-105'
          }`}
          title={isListening ? 'Stop Listening' : 'Voice Input (Press to speak)'}
          aria-label="Toggle Microphone"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* [ Text Input ] */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to voice...'
              : 'Ask ANIVOX anything, build stories, or speak commands...'
          }
          className="flex-1 bg-transparent px-3 text-sm text-white placeholder-white/40 focus:outline-none"
        />

        {/* [ Send ] Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-25 disabled:pointer-events-none hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5"
          title="Send prompt"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
