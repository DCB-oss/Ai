import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Mic,
  Image as ImageIcon,
  FolderGit2,
  FileText,
  Bookmark,
  Brain,
  Mail,
  Clapperboard,
  Tv,
  Settings,
  HelpCircle,
  X,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Trash2,
  Edit2,
  Gamepad2,
  Layers,
  Cpu,
  User,
} from 'lucide-react';
import { Conversation, AppScreen, AssistantSettings } from '../../types/assistant';
import { soundEffects } from '../../services/soundEffects';
import { ANIVOX_OFFICIAL_YOUTUBE_URL } from '../../config/anivoxCompany';
import { projectContextService } from '../../services/projectContextService';

interface AnivoxDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenImageGen: () => void;
  onOpenVoiceSettings: () => void;
  onOpenHelp: () => void;
  settings: AssistantSettings;
  memoryCount?: number;
  resourceCount?: number;
}

export const AnivoxDrawerMenu: React.FC<AnivoxDrawerMenuProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  currentScreen,
  onNavigate,
  onOpenImageGen,
  onOpenVoiceSettings,
  onOpenHelp,
  settings,
  memoryCount = 0,
  resourceCount = 0,
}) => {
  const [chatSearch, setChatSearch] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const activeProject = projectContextService.getActiveProject();

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingConvId(null);
  };

  const filteredConversations = conversations.filter((c) =>
    (c?.title || '').toLowerCase().includes(chatSearch.toLowerCase())
  );

  const handleNavClick = (screen: AppScreen) => {
    soundEffects.playTap();
    onNavigate(screen);
    onClose();
  };

  const handleOpenDCB = () => {
    soundEffects.playTap();
    window.open(ANIVOX_OFFICIAL_YOUTUBE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside className="relative z-10 w-[85vw] max-w-[340px] h-full bg-[#030712] border-r border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden animate-slide-right">
        {/* Top Header & New Chat Action */}
        <div className="p-4 border-b border-white/10 space-y-3 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-white tracking-widest uppercase">
                    ANIVOX
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    ✦
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online & Ready</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:text-white glass-panel border-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Primary Button */}
          <button
            onClick={() => {
              soundEffects.playTap();
              onNewConversation();
              onNavigate('chat');
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Scrollable Navigation List & Chats */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Quick Menu Items */}
          <div className="space-y-1">
            {/* Search */}
            <button
              onClick={() => {
                soundEffects.playTap();
                onNavigate('chat');
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Search</span>
              </div>
            </button>

            {/* Voice */}
            <button
              onClick={() => {
                soundEffects.playTap();
                onOpenVoiceSettings();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mic className="w-4 h-4 text-teal-400" />
                <span>Voice & Speech</span>
              </div>
            </button>

            {/* Create Image */}
            <button
              onClick={() => {
                soundEffects.playTap();
                onOpenImageGen();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>Create Image</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                AI
              </span>
            </button>

            {/* Projects */}
            <button
              onClick={() => handleNavClick('projects')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                currentScreen === 'projects'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-4 h-4 text-amber-400" />
                <span>Projects</span>
              </div>
              {activeProject && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate max-w-[90px]">
                  {activeProject.title}
                </span>
              )}
            </button>

            {/* Files */}
            <button
              onClick={() => handleNavClick('projects')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Files & Documents</span>
              </div>
            </button>

            {/* Library / Recommendations */}
            <button
              onClick={() => handleNavClick('recommendations')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                currentScreen === 'recommendations'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-indigo-400" />
                <span>Library</span>
              </div>
              {resourceCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {resourceCount}
                </span>
              )}
            </button>

            {/* Memory */}
            <button
              onClick={() => handleNavClick('memory')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                currentScreen === 'memory'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Memory</span>
              </div>
              {memoryCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {memoryCount}
                </span>
              )}
            </button>

            {/* Email Assistant */}
            <button
              onClick={() => handleNavClick('email')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                currentScreen === 'email'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-rose-400" />
                <span>Email & Gmail</span>
              </div>
            </button>

            {/* Creator Studio */}
            <button
              onClick={() => handleNavClick('creator')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                currentScreen === 'creator'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clapperboard className="w-4 h-4 text-emerald-400" />
                <span>Creator Studio</span>
              </div>
            </button>

            {/* DCB Universe */}
            <button
              onClick={handleOpenDCB}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 transition-all shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            >
              <div className="flex items-center gap-3">
                <Tv className="w-4 h-4 text-red-400" />
                <span>DCB Universe</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          {/* Chats Section with Search & History */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                Recent Chats
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {conversations.length}
              </span>
            </div>

            {/* Search Chat Input */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-white/40" />
              <input
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Chat List */}
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    soundEffects.playTap();
                    onSelectConversation(conv.id);
                    onNavigate('chat');
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                    conv.id === activeConversationId && currentScreen === 'chat'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {editingConvId === conv.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveRename(conv.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="flex-1 bg-black px-2 py-0.5 rounded text-xs text-white border border-cyan-400 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 truncate mr-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                      <span className="truncate">{conv.title || 'Conversation'}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(conv, e)}
                      className="p-1 hover:text-cyan-300"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {conversations.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="p-1 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Settings & User Profile Footer */}
        <div className="p-3 border-t border-white/10 space-y-1 bg-slate-950/90">
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentScreen === 'settings'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Settings</span>
            </div>
          </button>

          <button
            onClick={() => {
              soundEffects.playTap();
              onOpenHelp();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Help & Capabilities</span>
            </div>
          </button>

          {/* User Profile Bar */}
          <div className="pt-2 flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-slate-950 font-black text-xs shrink-0">
              C
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">Creator</div>
              <div className="text-[10px] text-white/40 truncate font-mono">
                {settings.userId || 'efe932595@gmail.com'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
