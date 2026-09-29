import React from 'react';
import {
  HelpCircle,
  X,
  Sparkles,
  Mic,
  Clapperboard,
  Search,
  Brain,
  Mail,
  FolderGit2,
  Tv,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface AnivoxHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnivoxHelpModal: React.FC<AnivoxHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helpTopics = [
    {
      icon: Mic,
      title: 'Voice & Microphone',
      desc: 'Tap the mic icon at the bottom of the workspace to speak naturally. Adjust sensitivity and noise reduction in Settings > Voice & Microphone.',
    },
    {
      icon: FolderGit2,
      title: 'Projects & Cosmic Wrath',
      desc: 'Work on your universe projects like Cosmic Wrath: The Lost Titans. Keep characters, lore, notes, tasks, and script files synced in one workspace.',
    },
    {
      icon: Clapperboard,
      title: 'Creator Studio & DCB Universe',
      desc: 'Access YouTube creator tools, generate video metadata, and jump straight to the official @DCBUniverse-n channel.',
    },
    {
      icon: Search,
      title: 'Live Grounded Intelligence',
      desc: 'Ask about current events, scientific facts, release schedules, or tutorials. ANIVOX grounds responses with live search citations.',
    },
    {
      icon: Mail,
      title: 'Gmail & Email Assistant',
      desc: 'Compose, summarize, search, and manage emails securely using client-side OAuth.',
    },
    {
      icon: Brain,
      title: 'Transparent Memory',
      desc: 'ANIVOX automatically remembers your creative preferences, projects, and custom instructions. View or delete memories anytime from the menu.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border-cyan-500/30 p-6 bg-slate-950/95 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white glass-panel border-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              ANIVOX AI Assistant Guide
            </h2>
            <p className="text-xs text-white/50">
              Everything you need to create, brainstorm, and control your workspace
            </p>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="space-y-2.5 pt-2">
          {helpTopics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{topic.title}</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed pl-6">
                  {topic.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundEffects.playTap();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
