import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Sparkles,
  TrendingUp,
  Award,
  Video,
  Eye,
  Clock,
  Users,
  Copy,
  Check,
  Lightbulb,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Edit3,
  HelpCircle,
  AlertCircle,
  User,
  Radio,
} from 'lucide-react';
import {
  creatorAssistant,
  YouTubeCreatorProfile,
  CreatorIdeaCard,
} from '../../services/creatorAssistant';
import { soundEffects } from '../../services/soundEffects';
import { YouTubeChannelLauncher } from '../Social/YouTubeChannelLauncher';

export const CreatorDashboard: React.FC = () => {
  const [profile, setProfile] = useState<YouTubeCreatorProfile>(creatorAssistant.getProfile());
  const [activeTab, setActiveTab] = useState<'overview' | 'ideas' | 'seo' | 'guidelines'>('overview');
  const [nicheInput, setNicheInput] = useState(profile.niche || 'Technology & AI');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.channelName);
  const [editHandle, setEditHandle] = useState(profile.channelHandle);
  const [editUrl, setEditUrl] = useState(profile.channelUrl);

  const [assistanceData, setAssistanceData] = useState(() =>
    creatorAssistant.generateCreatorAssistance(profile.niche)
  );

  useEffect(() => {
    const unsub = creatorAssistant.subscribe((p) => {
      setProfile(p);
      setEditName(p.channelName);
      setEditHandle(p.channelHandle);
      setEditUrl(p.channelUrl);
    });
    return unsub;
  }, []);

  const handleRegenerateIdeas = () => {
    soundEffects.playTap();
    const fresh = creatorAssistant.generateCreatorAssistance(nicheInput);
    setAssistanceData(fresh);
    creatorAssistant.updateProfile({ niche: nicheInput });
  };

  const handleCopy = (text: string, id: string) => {
    soundEffects.playTap();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playSuccess();
    creatorAssistant.updateProfile({
      channelName: editName.trim() || 'My YouTube Channel',
      channelHandle: editHandle.trim(),
      channelUrl: editUrl.trim(),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-red-500/30 bg-gradient-to-r from-red-950/30 via-slate-950/80 to-purple-950/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-white">
                YouTube Creator Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase">
                Creator Copilot
              </span>
            </div>
            <p className="text-xs text-white/50">
              Official DCB channel updates, creator ideation, title formulas, and personal channel management
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: 'Channels & Overview' },
            { id: 'ideas', label: 'AI Video Ideas' },
            { id: 'seo', label: 'Title & SEO' },
            { id: 'guidelines', label: 'YPP Policies' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playTap();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: CHANNELS & OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dual Channel Access Component */}
          <YouTubeChannelLauncher
            userChannelUrl={profile.channelUrl || profile.channelHandle}
            onConnectUserChannel={() => setIsEditing(true)}
          />

          {/* User's Personal Channel Management Box */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 bg-slate-950/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {profile.channelHandle ? profile.channelName : 'Personal Channel Configuration'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {profile.channelHandle ? profile.channelHandle : 'Set your channel handle to personalize creator tools'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playTap();
                  setIsEditing(!isEditing);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel' : 'Edit Channel'}</span>
              </button>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-white/60 block mb-1">Channel Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. David Tech Studio"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-white/60 block mb-1">Handle</label>
                    <input
                      type="text"
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      placeholder="e.g. @DavidTech"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/60 block mb-1">Custom Channel / Studio URL (Optional)</label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="https://youtube.com/@yourchannel or https://studio.youtube.com"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-white/70 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-md"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            )}

            {/* Statistics Status Notice (Never invent fake numbers) */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Live Channel Analytics</p>
                  <p className="text-[11px] text-white/50">
                    {profile.subscribers !== null
                      ? `Connected: ${profile.subscribers.toLocaleString()} subscribers`
                      : 'Channel statistics unavailable. Real metrics are retrieved only via authorized YouTube Data API.'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/50 font-mono">
                No Fake Metrics
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI VIDEO IDEAS */}
      {activeTab === 'ideas' && (
        <div className="space-y-5">
          {/* Niche Selector Header */}
          <div className="p-4 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                placeholder="Enter topic or niche (e.g. Gaming, AI, Anime)"
                className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/20 text-xs text-white focus:outline-none focus:border-red-400 w-full sm:w-64"
              />
            </div>
            <button
              onClick={handleRegenerateIdeas}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Fresh Video Ideas</span>
            </button>
          </div>

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assistanceData.ideas.map((idea) => (
              <div
                key={idea.id}
                className="p-5 rounded-3xl glass-panel border-white/10 flex flex-col justify-between space-y-4 hover:border-red-500/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black uppercase">
                      {idea.difficulty}
                    </span>
                    <button
                      onClick={() => handleCopy(`${idea.title}\n\nHook: ${idea.hook}\nConcept: ${idea.concept}`, idea.id)}
                      className="text-white/40 hover:text-white p-1"
                      title="Copy Idea"
                    >
                      {copiedId === idea.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                    {idea.title}
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-0.5">
                        ⚡ 5-Second Hook
                      </span>
                      <p className="text-white/70">{idea.hook}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                        🎨 Thumbnail Concept
                      </span>
                      <p className="text-white/70">{idea.thumbnailIdea}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {idea.suggestedTags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-white/50 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TITLE & SEO */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title Formulas */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-red-400">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>High-CTR Title Formulas</span>
            </div>

            <div className="space-y-2.5">
              {assistanceData.titleFormulas.map((formula, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 hover:border-red-500/30 transition-all"
                >
                  <p className="text-xs font-semibold text-white/90">{formula}</p>
                  <button
                    onClick={() => handleCopy(formula, `title-${idx}`)}
                    className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {copiedId === `title-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description & Timestamps Template */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-cyan-400">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Video Description Blueprint</span>
              </div>
              <button
                onClick={() => handleCopy(assistanceData.descriptionTemplate, 'desc-tmpl')}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5"
              >
                {copiedId === 'desc-tmpl' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Template</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-[11px] text-white/70 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
              {assistanceData.descriptionTemplate}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: YPP GUIDELINES & POLICIES */}
      {activeTab === 'guidelines' && (
        <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Official YouTube Partner Program (YPP) Guidelines
              </h2>
              <p className="text-xs text-white/50">
                Verified compliance and monetization eligibility requirements
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/80 leading-relaxed space-y-3">
            <p className="font-semibold text-white">
              {assistanceData.currentPolicyNote}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">Standard Long-Form Threshold</span>
                <p className="text-white/70 font-mono text-[11px]">1,000 Subscribers + 4,000 Public Watch Hours (Past 365 Days)</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Shorts-Specific Threshold</span>
                <p className="text-white/70 font-mono text-[11px]">1,000 Subscribers + 10 Million Public Shorts Views (Past 90 Days)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
