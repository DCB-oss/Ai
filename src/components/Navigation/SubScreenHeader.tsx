import React from 'react';
import { ArrowLeft, Menu, Sparkles, FolderGit2 } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { AppScreen } from '../../types/assistant';

interface SubScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  onBackToChat: () => void;
  onOpenMenu: () => void;
  rightAction?: React.ReactNode;
}

export const SubScreenHeader: React.FC<SubScreenHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-cyan-400',
  onBackToChat,
  onOpenMenu,
  rightAction,
}) => {
  return (
    <div className="sticky top-0 z-20 w-full glass-panel border-b border-white/10 bg-[#020408]/90 backdrop-blur-2xl px-3 sm:px-4 py-2.5 mb-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundEffects.playTap();
              onBackToChat();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-interactive border-white/10 hover:border-cyan-500/40 text-xs font-bold text-white transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden xs:inline">Back to Chat</span>
          </button>

          <div className="flex items-center gap-2">
            {Icon && (
              <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[10px] text-white/50 tracking-wide hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Custom Action or Menu Button */}
        <div className="flex items-center gap-2">
          {rightAction}

          <button
            onClick={() => {
              soundEffects.playTap();
              onOpenMenu();
            }}
            className="p-2 rounded-xl glass-panel-interactive border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-white transition-colors"
            title="Open Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
