import React from 'react';
import { User, MessageSquare, Bookmark, Brain, Zap, Settings, Sliders } from 'lucide-react';
import { AppScreen } from '../../types/assistant';

interface BottomBarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  activeTimersCount?: number;
  memoryCount?: number;
  resourceCount?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentScreen,
  onNavigate,
  activeTimersCount = 0,
  memoryCount = 0,
  resourceCount = 0,
}) => {
  const tabs = [
    { id: 'home' as AppScreen, label: 'Vox', icon: User },
    { id: 'chat' as AppScreen, label: 'Chat', icon: MessageSquare },
    { id: 'email' as AppScreen, label: 'Email', icon: Zap },
    { id: 'recommendations' as AppScreen, label: 'Library', icon: Bookmark, badge: resourceCount > 0 ? resourceCount : null },
    { id: 'memory' as AppScreen, label: 'Memory', icon: Brain, badge: memoryCount > 0 ? memoryCount : null },
    { id: 'controls' as AppScreen, label: 'Controls', icon: Sliders },
    { id: 'settings' as AppScreen, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 bg-[#020408]/85 backdrop-blur-2xl px-1.5 py-1.5 pb-safe">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 sm:px-3 rounded-2xl transition-all select-none ${
                isActive
                  ? 'text-cyan-300 font-semibold'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {/* Active glow pill */}
              {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,255,0.2)]" />
              )}

              <div className="relative z-10">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110 text-cyan-300' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-cyan-400 text-[9px] font-extrabold text-slate-950 flex items-center justify-center leading-none shadow-[0_0_8px_rgba(0,242,255,0.8)]">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-medium mt-0.5 z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
