import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Youtube,
  ExternalLink,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Download,
  Smartphone,
  Globe,
  HeartHandshake,
  DollarSign,
  Send,
  Edit3,
  Check,
  Copy,
} from 'lucide-react';
import {
  ANIVOX_FOUNDER,
  getAniVoxTeamEmail,
  setAniVoxTeamEmail,
  DEFAULT_ANIVOX_TEAM_EMAIL,
  ANIVOX_OFFICIAL_YOUTUBE_URL,
  ANIVOX_TEAM_PAYMENT_POLICY,
} from '../../config/anivoxCompany';
import { VERIFIED_LINKS, findVerifiedLink } from '../../services/verifiedLinksRegistry';
import { soundEffects } from '../../services/soundEffects';

interface AboutAniVoxSectionProps {
  initialSubTab?: 'founders' | 'team' | 'links' | 'install';
  onNavigateTab?: (tab: string) => void;
}

export const AboutAniVoxSection: React.FC<AboutAniVoxSectionProps> = ({
  initialSubTab = 'founders',
}) => {
  const [subTab, setSubTab] = useState<'founders' | 'team' | 'links' | 'install'>(initialSubTab);
  const [teamEmail, setTeamEmail] = useState<string>(getAniVoxTeamEmail());
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(teamEmail);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Check standalone PWA mode
  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleSaveEmail = () => {
    const clean = emailInput.trim();
    if (clean) {
      setAniVoxTeamEmail(clean);
      setTeamEmail(clean);
      setIsEditingEmail(false);
      soundEffects.playSuccess();
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(teamEmail);
    setCopiedEmail(true);
    soundEffects.playTap();
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleTriggerInstall = async () => {
    soundEffects.playTap();
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setInstallPromptEvent(null);
    } else {
      // Fallback instruction for browsers where prompt cannot be triggered programmatically
      alert('To install AniVox on your device, tap the browser menu (⋮ or Share icon) and select "Add to Home screen" or "Install AniVox".');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
        {[
          { id: 'founders', label: 'Founders', icon: User },
          { id: 'team', label: 'Join the Team', icon: HeartHandshake },
          { id: 'links', label: 'Verified Links', icon: Globe },
          { id: 'install', label: 'Install AniVox', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSubTab(tab.id as any);
                soundEffects.playTap();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap ${
                isSel
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: FOUNDERS */}
      {subTab === 'founders' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Founder Card */}
          <div className="p-6 rounded-3xl glass-panel border-cyan-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.15)]">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(0,242,255,0.4)] shrink-0">
                SD
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider">
                    {ANIVOX_FOUNDER.role}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Verified Executive Record
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {ANIVOX_FOUNDER.name}
                </h2>
                <p className="text-xs text-cyan-400 font-mono mt-0.5">
                  Founder & Architect of AniVox AI Systems
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed mt-4 relative z-10">
              {ANIVOX_FOUNDER.bio}
            </p>

            <div className="mt-6 pt-5 border-t border-white/10 relative z-10 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Core Engineering Principles</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ANIVOX_FOUNDER.principles.map((principle, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70 leading-relaxed">{principle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Voice FAQ Notice */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Ask Vox directly</p>
                <p className="text-[11px] text-white/50">
                  Try asking: "Who founded AniVox?" or "Who created AniVox?"
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-white/60">
              Voice Verified
            </span>
          </div>
        </div>
      )}

      {/* SUBTAB 2: JOIN THE TEAM */}
      {subTab === 'team' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Public Team Contact Email Panel */}
          <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Official Team Contact</h3>
                  <p className="text-xs text-white/50">
                    Configurable public communication address for inquiries & collaborations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditingEmail(!isEditingEmail);
                  setEmailInput(teamEmail);
                }}
                className="p-2 rounded-xl glass-panel border-white/10 text-white/70 hover:text-white text-xs flex items-center gap-1.5"
                title="Configure official team email"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Configure</span>
              </button>
            </div>

            {/* Email Display / Edit Field */}
            {isEditingEmail ? (
              <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/40 space-y-3">
                <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
                  Update Official Team Email Address:
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="[ENTER OFFICIAL TEAM EMAIL HERE]"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditingEmail(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEmail}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-[0_0_12px_rgba(0,242,255,0.4)]"
                  >
                    Save Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                    Public Contact Inquiries:
                  </span>
                  <p className="text-sm font-mono font-bold text-white selection:bg-cyan-500">
                    {teamEmail}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyEmail}
                    className="px-3.5 py-2 rounded-xl glass-panel-interactive border-white/10 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                  </button>
                  {teamEmail !== DEFAULT_ANIVOX_TEAM_EMAIL && (
                    <a
                      href={`mailto:${teamEmail}?subject=AniVox%20Team%20Inquiry`}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,255,0.4)]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Email</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Protection Notice */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                <strong>Privacy & Security Protection:</strong> Private developer credentials, personal Gmail accounts, OAuth tokens, and system keys are strictly isolated and never exposed in assistant responses.
              </p>
            </div>
          </div>

          {/* Official Team Payment & Compensation Policy */}
          <div className="p-6 rounded-3xl glass-panel border-amber-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Team Compensation Policy</h3>
                <p className="text-xs text-amber-300/80">
                  Transparent disclosure on voluntary collaboration
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                "{ANIVOX_TEAM_PAYMENT_POLICY.statement}"
              </p>
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-cyan-300">
                  {ANIVOX_TEAM_PAYMENT_POLICY.promptFollowUp}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (teamEmail !== DEFAULT_ANIVOX_TEAM_EMAIL) {
                        window.location.href = `mailto:${teamEmail}?subject=Volunteer%20Collaboration%20Application`;
                      } else {
                        alert(`Please reach out to the official public email: ${teamEmail}`);
                      }
                      soundEffects.playTap();
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  >
                    Yes, I want to collaborate
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playTap();
                      alert('Thank you for checking! Let us know if you need anything else.');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: VERIFIED LINKS DIRECTORY */}
      {subTab === 'links' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Official YouTube Channel Spotlight */}
          <div className="p-6 rounded-3xl glass-panel border-red-500/40 relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase">
                      Official Channel
                    </span>
                    <span className="text-xs font-mono text-white/60">@dcb-q2x7j</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    AniVox & DCB Official Channel
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/70 mt-3 leading-relaxed">
              The only verified YouTube channel for AniVox product announcements, assistant demonstrations, developer updates, and tutorials.
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-white/40 font-mono">
                youtube.com/@dcb-q2x7j
              </span>
              <a
                href={ANIVOX_OFFICIAL_YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEffects.playTap()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Our Channel</span>
              </a>
            </div>
          </div>

          {/* Curated Verified Links Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Verified Official Destinations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VERIFIED_LINKS.filter((l) => l.id !== 'link-anivox-yt').map((link) => (
                <div
                  key={link.id}
                  className="p-4 rounded-2xl glass-panel border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-white">{link.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${link.badgeColor || 'bg-white/10 text-white/70'}`}>
                        {link.category}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">
                      {link.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40">{link.domain}</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundEffects.playTap()}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <span>{link.buttonLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: INSTALL ANIVOX */}
      {subTab === 'install' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl glass-panel border-cyan-500/30 space-y-4 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.3)] shrink-0">
                <Download className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Install AniVox Application</h3>
                <p className="text-xs text-white/50">
                  Full Progressive Web App (PWA) with offline app shell, zero-latency caching, and standalone window experience.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Application Display Mode:</span>
                <span className={`font-mono font-bold ${isStandalone ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {isStandalone ? 'Standalone App Mode (Active)' : 'Browser Window'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Service Worker Caching:</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleTriggerInstall}
                className="w-full py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,255,0.4)] transition-all transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>INSTALL ANIVOX</span>
              </button>
            </div>
          </div>

          {/* Genuine Android APK / Native Companion Info */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-widest text-white">
                Genuine Android APK / AAB Companion
              </h4>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              When using AniVox in standard browser mode, system hardware access (such as permanent background microphone listening and global OS volume override) is protected by browser sandbox boundaries. For 24/7 background wake-word support and native phone calling with multi-SIM selection, use the AniVox Native Android Companion APK.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
