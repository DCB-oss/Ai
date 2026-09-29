import React, { useState, useEffect } from 'react';
import {
  Mail,
  ShieldCheck,
  AlertTriangle,
  Send,
  Edit3,
  X,
  CheckCircle2,
  Clock,
  Briefcase,
  HelpCircle,
  Sparkles,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Inbox,
  Filter,
  Check,
  RefreshCw,
  LogOut,
  UserCheck,
} from 'lucide-react';
import {
  emailAssistant,
  EmailMessage,
  EmailAssistantSettings,
  EmailAutoReplyMode,
} from '../../services/emailAssistant';
import { soundEffects } from '../../services/soundEffects';

export const EmailAssistantScreen: React.FC = () => {
  const [settings, setSettings] = useState<EmailAssistantSettings>(emailAssistant.getSettings());
  const [emails, setEmails] = useState<EmailMessage[]>(emailAssistant.getEmails());
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(emails[0] || null);
  const [filterMode, setFilterMode] = useState<'all' | 'employment' | 'action_required' | 'drafts'>('all');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [authEmailInput, setAuthEmailInput] = useState('');

  useEffect(() => {
    const unsub = emailAssistant.subscribe(() => {
      setSettings(emailAssistant.getSettings());
      setEmails(emailAssistant.getEmails());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (selectedEmail) {
      setDraftContent(selectedEmail.suggestedDraftReply || '');
      setIsEditingDraft(false);
    }
  }, [selectedEmail?.id]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmailInput.trim()) {
      soundEffects.playSuccess();
      emailAssistant.connectGmail(authEmailInput.trim());
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    soundEffects.playTap();
    emailAssistant.disconnectGmail();
  };

  const handleModeChange = (mode: EmailAutoReplyMode) => {
    soundEffects.playTap();
    emailAssistant.setAutoReplyMode(mode);
  };

  const handleSendDraft = (emailId: string) => {
    soundEffects.playSuccess();
    const result = emailAssistant.sendEmailReply(emailId);
    if (result.success && selectedEmail) {
      setSelectedEmail({
        ...selectedEmail,
        draftStatus: 'SENT',
        sentAt: new Date().toISOString(),
      });
    }
  };

  const handleSaveDraft = (emailId: string) => {
    soundEffects.playTap();
    emailAssistant.updateDraftReply(emailId, draftContent);
    setIsEditingDraft(false);
  };

  const filteredEmails = emails.filter((em) => {
    if (filterMode === 'employment') return em.isEmploymentOpportunity;
    if (filterMode === 'action_required') return em.requiresReview || (em.detectedQuestions && em.detectedQuestions.length > 0);
    if (filterMode === 'drafts') return em.draftStatus === 'DRAFTED' || em.draftStatus === 'WAITING_FOR_APPROVAL';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-950/80 to-blue-950/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-white">
                Gmail & Email Assistant
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                settings.isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/10 text-white/50 border-white/10'
              }`}>
                {settings.isConnected ? 'Connected' : 'OAuth Ready'}
              </span>
            </div>
            <p className="text-xs text-white/50">
              Summaries, questions detection, employment opportunities, and protected draft replies
            </p>
          </div>
        </div>

        {/* Connection Controls */}
        <div className="flex items-center gap-2">
          {settings.isConnected ? (
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-xs text-cyan-300 font-mono px-2 truncate max-w-[180px]">
                {settings.accountEmail}
              </span>
              <button
                onClick={handleDisconnect}
                className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold transition-colors"
                title="Disconnect Account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConnecting(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Connect Gmail (OAuth)</span>
            </button>
          )}
        </div>
      </div>

      {/* OAuth Connection Modal */}
      {isConnecting && (
        <div className="p-5 rounded-3xl glass-panel border-cyan-500/40 bg-slate-950/90 space-y-4 animate-scale-up">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Google / Gmail OAuth Authorization</span>
            </h3>
            <button onClick={() => setIsConnecting(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Connect your Google account securely. Vox never requests or stores your Google password. Authorization provides read and draft compose access with user verification required for sending.
          </p>
          <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={authEmailInput}
              onChange={(e) => setAuthEmailInput(e.target.value)}
              placeholder="Enter your Gmail address (e.g. david@gmail.com)"
              className="flex-1 px-4 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
              required
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
            >
              Authorize & Connect
            </button>
          </form>
        </div>
      )}

      {/* 3 Auto-Reply Modes Switcher (OFF / DRAFT ONLY / AUTO-REPLY) */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email Assistance & Reply Mode</span>
            </h3>
            <p className="text-[11px] text-white/50">
              Default is <strong className="text-cyan-300">DRAFT ONLY</strong>. High-impact emails are always safeguarded.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10">
            {(['OFF', 'DRAFT_ONLY', 'AUTO_REPLY'] as EmailAutoReplyMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  settings.autoReplyMode === mode
                    ? mode === 'AUTO_REPLY'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-cyan-500 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {mode === 'DRAFT_ONLY' ? 'DRAFT ONLY (DEFAULT)' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Strict Protection Warning */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200/90 leading-relaxed">
            <strong>Important Email Protection Active:</strong> Contracts, job offers, salary terms, banking/financial transactions, legal notices, medical matters, and password security codes are <span className="underline font-bold">never automatically sent</span>. Vox prepares a draft and requires your manual approval.
          </div>
        </div>
      </div>

      {/* Main Inbox & Reader Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto text-[11px]">
            {[
              { id: 'all', label: 'All Emails' },
              { id: 'employment', label: 'Jobs & Roles' },
              { id: 'action_required', label: 'Action Required' },
              { id: 'drafts', label: 'Drafts' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundEffects.playTap();
                  setFilterMode(f.id as any);
                }}
                className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                  filterMode === f.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Email Items List */}
          <div className="space-y-3">
            {filteredEmails.length === 0 ? (
              <div className="p-8 rounded-3xl glass-panel border-white/10 text-center space-y-2">
                <Inbox className="w-8 h-8 text-white/30 mx-auto" />
                <p className="text-xs text-white/50 font-bold">No emails match this filter.</p>
              </div>
            ) : (
              filteredEmails.map((em) => (
                <div
                  key={em.id}
                  onClick={() => {
                    soundEffects.playTap();
                    setSelectedEmail(em);
                    emailAssistant.markAsRead(em.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedEmail?.id === em.id
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">
                      {em.fromName}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {new Date(em.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white/90 truncate">{em.subject}</h4>
                  <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">{em.snippet}</p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {em.isEmploymentOpportunity && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold flex items-center gap-1">
                        <Briefcase className="w-2.5 h-2.5" />
                        <span>Employment Opportunity</span>
                      </span>
                    )}

                    {em.draftStatus && (
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                        em.draftStatus === 'SENT'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : em.draftStatus === 'WAITING_FOR_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {em.draftStatus.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Selected Email Viewer & Draft Actions */}
        <div className="lg:col-span-7 space-y-4">
          {selectedEmail ? (
            <div className="p-6 rounded-3xl glass-panel border-white/10 bg-slate-950/70 space-y-5">
              {/* Header */}
              <div className="space-y-2 border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">From: <strong className="text-white">{selectedEmail.fromName}</strong> ({selectedEmail.from})</span>
                  <span className="text-[11px] text-white/40 font-mono">{new Date(selectedEmail.receivedAt).toLocaleString()}</span>
                </div>
                <h2 className="text-base font-bold text-white">{selectedEmail.subject}</h2>
              </div>

              {/* Employment Breakdown Box (Strictly factual) */}
              {selectedEmail.isEmploymentOpportunity && selectedEmail.employmentDetails && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <span>Detected Employment Opportunity</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div><span className="text-white/40">Company:</span> <strong className="text-white">{selectedEmail.employmentDetails.company}</strong></div>
                    <div><span className="text-white/40">Position:</span> <strong className="text-white">{selectedEmail.employmentDetails.position}</strong></div>
                    <div><span className="text-white/40">Location:</span> <span className="text-white/80">{selectedEmail.employmentDetails.location}</span></div>
                    <div><span className="text-white/40">Deadline:</span> <span className="text-white/80">{selectedEmail.employmentDetails.deadline}</span></div>
                  </div>
                  {selectedEmail.employmentDetails.importantInfo && (
                    <p className="text-[11px] text-purple-200/90 pt-1 border-t border-purple-500/20">
                      <strong>Important:</strong> {selectedEmail.employmentDetails.importantInfo}
                    </p>
                  )}
                </div>
              )}

              {/* Email Body */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-white/80 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-sans">
                {selectedEmail.body}
              </div>

              {/* Question Detection */}
              {selectedEmail.detectedQuestions && selectedEmail.detectedQuestions.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                    Detected Question Requiring Response
                  </span>
                  {selectedEmail.detectedQuestions.map((q, idx) => (
                    <p key={idx} className="text-xs text-cyan-100 font-medium">
                      • {q}
                    </p>
                  ))}
                </div>
              )}

              {/* Draft Reply Area */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Vox Prepared Response</span>
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedEmail.draftStatus === 'SENT'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : selectedEmail.draftStatus === 'WAITING_FOR_APPROVAL'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    Status: {selectedEmail.draftStatus ? selectedEmail.draftStatus.replace(/_/g, ' ') : 'DRAFTED'}
                  </span>
                </div>

                {/* Draft Content View or Edit */}
                {isEditingDraft ? (
                  <div className="space-y-2">
                    <textarea
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      rows={5}
                      className="w-full p-3.5 rounded-2xl bg-black/60 border border-cyan-500/40 text-xs text-white focus:outline-none leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingDraft(false)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 text-white/70 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveDraft(selectedEmail.id)}
                        className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
                      >
                        Save Draft
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                    {selectedEmail.suggestedDraftReply || 'No draft generated yet.'}
                  </div>
                )}

                {/* Action Buttons: [ EDIT ], [ SEND ], [ CANCEL ] */}
                {selectedEmail.draftStatus !== 'SENT' && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingDraft(!isEditingDraft)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Response</span>
                    </button>

                    <button
                      onClick={() => handleSendDraft(selectedEmail.id)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Response</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl glass-panel border-white/10 text-center space-y-2">
              <Mail className="w-10 h-10 text-white/20 mx-auto" />
              <p className="text-sm font-bold text-white/50">Select an email to view details & reply drafts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
