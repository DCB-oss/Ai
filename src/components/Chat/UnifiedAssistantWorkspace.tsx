import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Plus,
  Trash2,
  Volume2,
  Copy,
  Check,
  Search,
  MessageSquare,
  Sparkles,
  User,
  Square,
  Edit2,
  Globe,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Phone,
  Paperclip,
  X,
  Clapperboard,
  FolderGit2,
  Image as ImageIcon,
  Tv,
  ArrowRight,
  ChevronRight,
  Bot,
  Gamepad2,
  PenTool,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  ChatMessage,
  Conversation,
  ActionPayload,
  FeedbackType,
  OrbState,
  AppScreen,
  AssistantSettings,
} from '../../types/assistant';
import { ActionCard } from '../Common/ActionCard';
import { RecommendationCard } from '../Common/RecommendationCard';
import { AmbientVoxVisualizer } from '../Orb/AmbientVoxVisualizer';
import { AttachmentMenu, AttachedFileItem } from './AttachmentMenu';
import { soundEffects } from '../../services/soundEffects';
import { projectContextService } from '../../services/projectContextService';
import { ANIVOX_OFFICIAL_YOUTUBE_URL } from '../../config/anivoxCompany';

interface UnifiedAssistantWorkspaceProps {
  conversations: Conversation[];
  activeConversationId: string;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
  waveformBars?: number[];
  micState?: 'idle' | 'listening' | 'voice_detected' | 'transcribing' | 'speaking' | 'error';
  transcript?: string;
  interimTranscript?: string;
  orbState: OrbState;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onSubmitMessage: (content: string, attachments?: AttachedFileItem[]) => void;
  onRetryMessage?: (content: string) => void;
  onToggleMic: () => void;
  onSpeakMessage: (text: string) => void;
  onStopSpeaking: () => void;
  onFeedback?: (itemId: string, type: FeedbackType) => void;
  onExecuteTimer?: (seconds: number, label: string) => void;
  onNavigate: (screen: AppScreen) => void;
  onOpenImageGen: () => void;
  settings: AssistantSettings;
}

export const UnifiedAssistantWorkspace: React.FC<UnifiedAssistantWorkspaceProps> = ({
  conversations,
  activeConversationId,
  isListening,
  isSpeaking,
  audioLevel = 0,
  waveformBars = [0, 0, 0, 0, 0, 0, 0, 0],
  micState = 'idle',
  transcript = '',
  interimTranscript = '',
  orbState,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onSubmitMessage,
  onRetryMessage,
  onToggleMic,
  onSpeakMessage,
  onStopSpeaking,
  onFeedback,
  onExecuteTimer,
  onNavigate,
  onOpenImageGen,
  settings,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const activeProject = projectContextService.getActiveProject();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, orbState, isListening]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && attachedFiles.length === 0) return;

    let finalPrompt = input.trim();
    if (attachedFiles.length > 0) {
      const attachmentsDesc = attachedFiles
        .map((f) => `[Attached ${f.type.toUpperCase()}: "${f.name}"]${f.textContent ? `\n\nContent:\n${f.textContent.slice(0, 800)}` : ''}`)
        .join('\n\n');
      finalPrompt = finalPrompt ? `${finalPrompt}\n\n${attachmentsDesc}` : attachmentsDesc;
    }

    onSubmitMessage(finalPrompt, attachedFiles);
    setInput('');
    setAttachedFiles([]);
    setIsAttachmentOpen(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundEffects.playSuccess();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAttachFile = (file: AttachedFileItem) => {
    setAttachedFiles((prev) => [...prev, file]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleOpenDCBUniverse = () => {
    soundEffects.playTap();
    window.open(ANIVOX_OFFICIAL_YOUTUBE_URL, '_blank', 'noopener,noreferrer');
  };

  const hasMessages = currentConversation && currentConversation.messages.length > 0;

  // Format inline helper
  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">$1</code>');
  };

  const renderMessageContent = (content: string) => {
    const cleanContent = content.replace(/```action[\s\S]*?```/g, '').trim();
    const paragraphs = cleanContent.split('\n\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-200">
        {paragraphs.map((para, i) => {
          if (para.startsWith('```')) {
            const code = para.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '');
            return (
              <pre
                key={i}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto my-2 shadow-inner"
              >
                <code>{code}</code>
              </pre>
            );
          }

          if (para.includes('\n- ') || para.startsWith('- ')) {
            const items = para.split('\n- ').map((item) => item.replace(/^- /, ''));
            return (
              <ul key={i} className="list-disc list-inside space-y-1.5 my-1 text-slate-300">
                {items.map((it, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(it) }} />
                ))}
              </ul>
            );
          }

          return (
            <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(para) }} />
          );
        })}
      </div>
    );
  };

  // Quick Action cards for empty/welcome state
  const quickActions = [
    {
      id: 'ask',
      label: 'Ask ANIVOX',
      icon: Bot,
      prompt: 'Ask ANIVOX: How can you help me today?',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 hover:border-cyan-400',
    },
    {
      id: 'create',
      label: 'Create',
      icon: Clapperboard,
      prompt: 'Help me plan and create the next episode in the Cosmic Wrath universe.',
      color: 'from-rose-500/20 to-purple-500/20 text-rose-300 border-rose-500/40 hover:border-rose-400',
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      prompt: 'Search the latest news, sci-fi lore, and creative releases today.',
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/40 hover:border-teal-400',
    },
    {
      id: 'projects',
      label: 'My Projects',
      icon: FolderGit2,
      action: () => onNavigate('projects'),
      color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 hover:border-amber-400',
    },
    {
      id: 'create-image',
      label: 'Create Image',
      icon: ImageIcon,
      action: onOpenImageGen,
      color: 'from-pink-500/20 to-fuchsia-500/20 text-pink-300 border-pink-500/40 hover:border-pink-400',
    },
    {
      id: 'creator-studio',
      label: 'Creator Studio',
      icon: Gamepad2,
      action: () => onNavigate('creator'),
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40 hover:border-purple-400',
    },
  ];

  return (
    <div className="relative flex flex-col h-[calc(100vh-65px)] max-w-4xl mx-auto w-full px-2 sm:px-4">
      {/* Messages / Welcome View Scrollable Area */}
      <div className="flex-1 overflow-y-auto pt-3 pb-24 space-y-4 pr-1">
        {!hasMessages ? (
          /* UNIFIED CLEAN WELCOME SCREEN */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-3 py-6 animate-fade-in">
            {/* Ambient Glowing Visualizer */}
            <div className="relative flex items-center justify-center">
              <AmbientVoxVisualizer
                state={orbState}
                audioLevel={audioLevel}
                size="medium"
                interactive={true}
                onClick={isSpeaking ? onStopSpeaking : onToggleMic}
              />
            </div>

            {/* Header: ANIVOX + Status */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 tracking-wider">
                  ANIVOX
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                  ✦
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online & Ready</span>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Welcome, Creator.
              </h2>
              <p className="text-xs sm:text-sm text-cyan-300/80 font-medium tracking-wide uppercase">
                What do you want to do today?
              </p>
            </div>

            {/* Returning Active Project Card */}
            {activeProject && (
              <div className="w-full max-w-lg p-4 rounded-3xl glass-panel border-cyan-500/40 bg-gradient-to-br from-slate-950/90 via-cyan-950/30 to-purple-950/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-center space-y-2.5">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-cyan-200 font-medium">
                    Continue working on <strong className="text-white underline decoration-cyan-400">{activeProject.title}</strong>?
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      soundEffects.playTap();
                      onSubmitMessage(`Continue working on ${activeProject.title}. Show current active tasks, lore, and characters.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-102 transition-all flex items-center gap-1.5"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('projects')}
                    className="px-3.5 py-2 rounded-xl glass-panel-interactive border-white/10 text-white/70 hover:text-white font-bold text-xs transition-all"
                  >
                    Choose another project
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action Buttons Grid */}
            <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      soundEffects.playTap();
                      if (action.action) {
                        action.action();
                      } else if (action.prompt) {
                        onSubmitMessage(action.prompt);
                      }
                    }}
                    className={`p-3 rounded-2xl glass-panel bg-gradient-to-r ${action.color} border flex items-center gap-2.5 transition-all hover:scale-102 active:scale-98 text-left shadow-sm group`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* CONVERSATION MESSAGE STREAM */
          currentConversation.messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {!isUser && (
                  <div className="shrink-0 pt-0.5">
                    <AmbientVoxVisualizer
                      size="sm"
                      state={isSpeaking ? 'SPEAKING' : 'IDLE'}
                      interactive={false}
                    />
                  </div>
                )}

                <div className="max-w-[88%] sm:max-w-[78%] space-y-2">
                  <div
                    className={`p-4 rounded-2xl ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-[0_0_18px_rgba(6,182,212,0.3)] border border-cyan-400/30'
                        : 'glass-panel text-white/90 rounded-bl-none shadow-lg border-white/10 bg-slate-950/70'
                    }`}
                  >
                    {/* Header intent badge if applicable */}
                    {!isUser && (msg.isGroundingUsed || msg.sources?.length || msg.intent) && (
                      <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/10 text-[11px] flex-wrap">
                        {msg.intent === 'PHONE_CALL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            Phone Assistant
                          </span>
                        ) : msg.intent === 'SOCIAL_SEARCH' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                            <Globe className="w-3 h-3 text-rose-400" />
                            Public Social Media Link
                          </span>
                        ) : msg.intent === 'OPEN_LINK' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                            <ExternalLink className="w-3 h-3 text-cyan-400" />
                            Verified Link
                          </span>
                        ) : msg.isGroundingUsed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                            <Globe className="w-3 h-3 text-cyan-400 animate-pulse" />
                            Live Search Grounded
                          </span>
                        ) : null}

                        {msg.searchQueries && msg.searchQueries.length > 0 && (
                          <span className="text-[10px] text-white/40 truncate max-w-[200px]">
                            Query: "{msg.searchQueries[0]}"
                          </span>
                        )}
                      </div>
                    )}

                    {renderMessageContent(msg.content)}

                    {/* Citations / Sources */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 tracking-wide uppercase">
                          <BookOpen className="w-3 h-3" />
                          <span>Sources & References:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 hover:bg-black text-[11px] text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-colors"
                            >
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              <span className="truncate max-w-[150px]">{src.title || src.url}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Payload Cards (e.g. timers, recommendations) */}
                    {msg.action && (
                      <div className="mt-3">
                        <ActionCard
                          action={msg.action}
                          onFeedback={onFeedback}
                          onExecuteTimer={onExecuteTimer}
                          onNavigate={onNavigate}
                        />
                      </div>
                    )}

                    {msg.recommendation && (
                      <div className="mt-3">
                        <RecommendationCard
                          item={msg.recommendation}
                          onFeedback={onFeedback}
                          onSave={() => {}}
                        />
                      </div>
                    )}
                  </div>

                  {/* Message Meta: Time, Copy, Speak, Retry */}
                  <div className="flex items-center gap-2 px-1 text-[10px] text-white/40">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!isUser && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-white flex items-center gap-1 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => onSpeakMessage(msg.content)}
                          className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                          title="Read aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Speak</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Thinking Pulse */}
        {orbState === 'THINKING' && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border-purple-500/30 rounded-bl-none text-xs text-purple-200 flex items-center gap-2.5 bg-slate-950/70 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="tracking-wide">ANIVOX is processing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* FIXED UNIFIED BOTTOM INPUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-3 bg-gradient-to-t from-[#020408] via-[#020408]/95 to-transparent pb-safe">
        <div className="max-w-4xl mx-auto relative">
          {/* Attachment Menu Popup */}
          <AttachmentMenu
            isOpen={isAttachmentOpen}
            onClose={() => setIsAttachmentOpen(false)}
            onAttachFile={handleAttachFile}
            onOpenImageGen={onOpenImageGen}
            onOpenProjects={() => onNavigate('projects')}
          />

          {/* Attached Files Preview Chips */}
          {attachedFiles.length > 0 && (
            <div className="flex items-center gap-2 mb-2 px-2 overflow-x-auto">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-md shrink-0"
                >
                  <Paperclip className="w-3 h-3 text-cyan-400" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    onClick={() => handleRemoveAttachment(file.id)}
                    className="p-0.5 rounded hover:bg-white/20 text-white/60 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Live Waveform or Voice Status indicator bar when listening */}
          {isListening && (
            <div className="flex items-center justify-between px-4 py-1.5 mb-1.5 rounded-2xl bg-black/80 border border-cyan-500/40 text-xs text-cyan-300 animate-fade-in shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-[11px] font-bold">
                  {interimTranscript ? `"${interimTranscript}"` : 'Listening for your voice...'}
                </span>
              </div>
              <div className="flex items-center gap-1 h-3 font-mono text-cyan-400">
                {waveformBars.map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, (h / 100) * 14)}px` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Speaking Indicator & Stop Button */}
          {isSpeaking && (
            <div className="flex items-center justify-between px-4 py-1.5 mb-1.5 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-xs text-purple-300 animate-fade-in shadow-md">
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                <span className="font-medium text-[11px]">ANIVOX is speaking...</span>
              </div>
              <button
                onClick={onStopSpeaking}
                className="px-2.5 py-0.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 border border-rose-500/40 font-bold text-[10px] flex items-center gap-1"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* Main Input Form: [ + ] Ask ANIVOX anything... [🎙] [Send] */}
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl glass-panel border-cyan-500/30 focus-within:border-cyan-400 bg-[#030712]/95 shadow-[0_0_35px_rgba(0,0,0,0.85)] transition-all"
          >
            {/* Attachment Button [ + ] */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playTap();
                setIsAttachmentOpen(!isAttachmentOpen);
              }}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                isAttachmentOpen
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'glass-panel text-white/70 hover:text-white border-white/10 hover:border-cyan-500/40'
              }`}
              title="Add attachment, photo, file, or image creator"
              aria-label="Add Attachment"
            >
              <Plus className={`w-4 h-4 transition-transform ${isAttachmentOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Text Input: Ask ANIVOX anything... */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : 'Ask ANIVOX anything, build stories, or speak commands...'
              }
              className="flex-1 bg-transparent px-2 text-sm text-white placeholder-white/40 focus:outline-none"
            />

            {/* Microphone Button [🎙] */}
            <button
              type="button"
              onClick={onToggleMic}
              className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse'
                  : 'glass-panel text-cyan-400 hover:text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              }`}
              title={isListening ? 'Stop voice listening' : 'Speak to ANIVOX'}
              aria-label="Toggle Microphone"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button (shows when input or attached file exists) */}
            {(input.trim() || attachedFiles.length > 0) && (
              <button
                type="submit"
                className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all animate-in fade-in zoom-in-95"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
