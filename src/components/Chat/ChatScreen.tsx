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
} from 'lucide-react';
import {
  ChatMessage,
  Conversation,
  ActionPayload,
  FeedbackType,
  OrbState,
} from '../../types/assistant';
import { ActionCard } from '../Common/ActionCard';
import { RecommendationCard } from '../Common/RecommendationCard';
import { AmbientVoxVisualizer } from '../Orb/AmbientVoxVisualizer';

interface ChatScreenProps {
  conversations: Conversation[];
  activeConversationId: string;
  isListening: boolean;
  isSpeaking: boolean;
  orbState: OrbState;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onSubmitMessage: (content: string) => void;
  onRetryMessage?: (content: string) => void;
  onToggleMic: () => void;
  onSpeakMessage: (text: string) => void;
  onStopSpeaking: () => void;
  onFeedback?: (itemId: string, type: FeedbackType) => void;
  onExecuteTimer?: (seconds: number, label: string) => void;
  onNavigate?: (screen: any) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversations,
  activeConversationId,
  isListening,
  isSpeaking,
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
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, orbState]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    onSubmitMessage(input.trim());
    setInput('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartRename = (conv: Conversation) => {
    setEditingTitleId(conv.id);
    setEditTitleText(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitleText.trim()) {
      onRenameConversation(id, editTitleText.trim());
    }
    setEditingTitleId(null);
  };

  // Render markdown helper
  const renderMessageContent = (content: string) => {
    // Clean raw action block from visible message
    const cleanContent = content.replace(/```action[\s\S]*?```/g, '').trim();

    // Split paragraphs
    const paragraphs = cleanContent.split('\n\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-200">
        {paragraphs.map((para, i) => {
          // Check for code blocks
          if (para.startsWith('```')) {
            const code = para.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '');
            return (
              <pre
                key={i}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto my-2"
              >
                <code>{code}</code>
              </pre>
            );
          }

          // Check for bullet lists
          if (para.includes('\n- ') || para.startsWith('- ')) {
            const items = para.split('\n- ').map((item) => item.replace(/^- /, ''));
            return (
              <ul key={i} className="list-disc list-inside space-y-1 my-1 text-slate-300">
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

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">$1</code>');
  };

  const filteredConversations = conversations.filter((c) =>
    (c?.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-4xl mx-auto w-full">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 glass-panel border-b border-white/10">
        <button
          onClick={() => setShowSessionDrawer(!showSessionDrawer)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel-interactive border-white/10 text-xs font-semibold text-white transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate max-w-[150px] sm:max-w-[250px]">
            {currentConversation?.title || 'Current Conversation'}
          </span>
          <span className="text-[10px] text-cyan-400/80 font-mono">
            ({conversations.length})
          </span>
        </button>

        <button
          onClick={onNewConversation}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all shadow-[0_0_12px_rgba(0,242,255,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      {/* Slide-down / Dropdown Session Drawer */}
      {showSessionDrawer && (
        <div className="p-3.5 glass-panel border-b border-white/10 shadow-2xl animate-in slide-in-from-top-2 z-20">
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                  conv.id === activeConversationId
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
                    : 'glass-panel text-white/70 hover:text-white border-white/5'
                }`}
              >
                {editingTitleId === conv.id ? (
                  <input
                    type="text"
                    value={editTitleText}
                    onChange={(e) => setEditTitleText(e.target.value)}
                    onBlur={() => handleSaveRename(conv.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                    autoFocus
                    className="flex-1 bg-black/60 px-2 py-0.5 rounded text-xs text-white border border-cyan-500 focus:outline-none"
                  />
                ) : (
                  <div
                    onClick={() => {
                      onSelectConversation(conv.id);
                      setShowSessionDrawer(false);
                    }}
                    className="flex-1 cursor-pointer truncate mr-2 font-medium"
                  >
                    {conv.title}
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartRename(conv)}
                    className="p-1 text-white/40 hover:text-cyan-300"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {conversations.length > 1 && (
                    <button
                      onClick={() => onDeleteConversation(conv.id)}
                      className="p-1 text-white/40 hover:text-rose-400"
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
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {currentConversation?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-white/40">
            <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-cyan-400 mb-3 border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,255,0.2)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 tracking-wide">
              Atmospheric Dialogue Terminal
            </h3>
            <p className="text-xs text-white/50 max-w-sm">
              Ask any question, brainstorm creative projects, ask for media recommendations, or set timers and notes by voice or text.
            </p>
          </div>
        ) : (
          currentConversation?.messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="shrink-0 pt-0.5">
                    <AmbientVoxVisualizer size="sm" state={isSpeaking ? 'SPEAKING' : 'IDLE'} interactive={false} />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/30'
                        : 'glass-panel text-white/90 rounded-bl-none shadow-lg border-white/10'
                    }`}
                  >
                    {/* Header intent badge if applicable */}
                    {!isUser && (msg.isGroundingUsed || msg.sources?.length || msg.intent) && (
                      <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/10 text-[11px] flex-wrap">
                        {msg.intent === 'PHONE_CALL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            Android Phone Assistant
                          </span>
                        ) : msg.intent === 'SOCIAL_SEARCH' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                            <Globe className="w-3 h-3 text-rose-400" />
                            Public Social Media Link
                          </span>
                        ) : msg.intent === 'OPEN_LINK' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                            <ExternalLink className="w-3 h-3 text-cyan-400" />
                            Verified Web Launcher
                          </span>
                        ) : msg.isGroundingUsed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                            <Globe className="w-3 h-3 text-cyan-400 animate-pulse" />
                            Live Search Grounded
                          </span>
                        ) : msg.intent === 'GENERAL_KNOWLEDGE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                            <BookOpen className="w-3 h-3 text-indigo-400" />
                            Verified Knowledge Base
                          </span>
                        ) : msg.intent === 'HOW_TO' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Step-by-Step Architecture
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

                    {/* Sources & Citations Section */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400/90 tracking-wide uppercase">
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          <span>Sources & Citations</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 text-xs border border-white/10 hover:border-cyan-500/40 transition-all group"
                              title={source.title}
                            >
                              <Globe className="w-3 h-3 text-white/40 group-hover:text-cyan-400 shrink-0" />
                              <span className="truncate max-w-[180px] font-medium">{source.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inline Action Card if present */}
                    {msg.action && msg.action.type !== 'recommendation' && msg.action.type !== 'resource' && (
                      <ActionCard
                        action={msg.action}
                        onExecuteTimer={onExecuteTimer}
                        onNavigate={onNavigate}
                      />
                    )}

                    {/* Inline Recommendation / Resource Card if action type is recommendation or resource */}
                    {(msg.action?.type === 'recommendation' || msg.action?.type === 'resource') && msg.action.data && (
                      <div className="mt-2.5">
                        <RecommendationCard
                          item={msg.action.data}
                          onFeedback={onFeedback}
                          onView={(item) => onNavigate && onNavigate('recommendations')}
                        />
                      </div>
                    )}
                    {/* Error Banner & Retry Button if msg.error */}
                    {msg.error && (
                      <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3">
                        <div className="text-xs text-rose-300">
                          {msg.error === 'AI_SERVICE_UNAVAILABLE' || msg.error === 'Network error'
                            ? "I couldn't connect to my AI service right now. Please try again."
                            : msg.error}
                        </div>
                        {onRetryMessage && (
                          <button
                            onClick={() => {
                              const prevUserMsg = currentConversation?.messages
                                .slice(0, currentConversation.messages.indexOf(msg))
                                .reverse()
                                .find((m) => m.role === 'user');
                              if (prevUserMsg) {
                                onRetryMessage(prevUserMsg.content);
                              }
                            }}
                            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold shrink-0 transition-colors"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Meta & Action Tools */}
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
                  <div className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center text-white/80 shrink-0 border-white/20">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Thinking Indicator */}
        {orbState === 'THINKING' && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border-purple-500/30 rounded-bl-none text-xs text-purple-200 flex items-center gap-2.5 shadow-[0_0_20px_rgba(112,0,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="tracking-wide">Vox is synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 glass-panel border-t border-white/10">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 p-1.5 rounded-2xl glass-panel border-white/10 focus-within:border-cyan-500/50 transition-colors shadow-lg"
        >
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                : 'glass-panel text-white/60 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
            title={isListening ? 'Stop recording' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening to speech...' : 'Type a message or command...'}
            className="flex-1 bg-transparent px-2 text-sm text-white placeholder-white/30 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold disabled:opacity-30 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
