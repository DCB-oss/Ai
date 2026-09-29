import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Globe,
  Compass,
} from 'lucide-react';
import { SocialProfileCard } from '../../types/assistant';
import {
  PLATFORM_CONFIGS,
  launchSmartLink,
  copyLinkToClipboard,
  shareSocialLink,
} from '../../services/socialLinkLauncher';
import { soundEffects } from '../../services/soundEffects';

interface SocialResultCardProps {
  card: SocialProfileCard;
  autoLaunch?: boolean;
  onOpen?: (url: string) => void;
  className?: string;
}

export const SocialResultCard: React.FC<SocialResultCardProps> = ({
  card,
  autoLaunch = false,
  onOpen,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const config = PLATFORM_CONFIGS[card.platform] || PLATFORM_CONFIGS.web;

  const handleLaunch = async (overrideUrl?: string, overrideDeepLink?: string) => {
    setIsLaunching(true);
    soundEffects.playTap();

    const targetWebUrl = overrideUrl || card.webUrl;
    const targetDeepLink = overrideDeepLink || card.appDeepLink;

    if (onOpen) {
      onOpen(targetWebUrl);
    }

    const result = await launchSmartLink({
      webUrl: targetWebUrl,
      appDeepLink: targetDeepLink,
      platform: card.platform,
      onNotice: (msg) => {
        setLaunchStatus(msg);
      },
    });

    setTimeout(() => {
      setIsLaunching(false);
      setLaunchStatus(result.message);
      setTimeout(() => setLaunchStatus(null), 4000);
    }, 800);
  };

  const handleCopy = async () => {
    soundEffects.playTap();
    const success = await copyLinkToClipboard(card.webUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    soundEffects.playTap();
    const result = await shareSocialLink({
      title: `${card.profileTitle} on ${config.displayName}`,
      text: card.description || `Public ${config.displayName} profile for ${card.profileTitle}`,
      url: card.webUrl,
    });

    if (result.shared) {
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  // Render platform specific icon
  const renderPlatformBadge = () => {
    switch (card.platform) {
      case 'youtube':
        return (
          <div className="w-9 h-9 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'instagram':
        return (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0 shadow-[0_0_12px_rgba(236,72,153,0.25)]">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 shadow-[0_0_12px_rgba(20,184,166,0.25)]">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </div>
        );
      case 'x':
        return (
          <div className="w-9 h-9 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        );
      case 'reddit':
        return (
          <div className="w-9 h-9 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.25)]">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
          </div>
        );
      case 'web':
      default:
        return (
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_12px_rgba(0,242,255,0.25)]">
            <Globe className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div
      className={`rounded-3xl glass-panel border ${config.borderColor} p-4 sm:p-5 relative overflow-hidden transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.4)] ${className}`}
    >
      {/* Background ambient gradient glow */}
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${config.gradient} blur-[50px] rounded-full pointer-events-none opacity-60`}
      />

      {/* Header with platform badge & verification */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {renderPlatformBadge()}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${config.textColor}`}>
                {config.displayName} {card.category ? `• ${card.category}` : ''}
              </span>
              {card.isVerified && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Verified
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              {card.profileTitle}
            </h3>
            {card.handle && (
              <p className="text-xs font-mono text-white/60">{card.handle}</p>
            )}
          </div>
        </div>

        {card.subscriberCount && (
          <div className="px-2.5 py-1 rounded-xl glass-panel border-white/10 text-[10px] font-medium text-white/70 shrink-0 hidden sm:block">
            {card.subscriberCount}
          </div>
        )}
      </div>

      {/* Profile Description */}
      {card.description && (
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed mt-3 mb-4 relative z-10 font-normal">
          {card.description}
        </p>
      )}

      {/* Status Notice (e.g. Smart App fallback notice) */}
      {launchStatus && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-fadeIn relative z-10">
          <Smartphone className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{launchStatus}</span>
        </div>
      )}

      {/* Smart Launcher Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 relative z-10">
        {/* Main Primary Launch Button */}
        <button
          onClick={() => handleLaunch()}
          disabled={isLaunching}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-md ${
            card.platform === 'youtube'
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
              : card.platform === 'instagram'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : card.platform === 'tiktok'
              ? 'bg-teal-500 hover:bg-teal-400 text-black font-extrabold shadow-[0_0_15px_rgba(20,184,166,0.4)]'
              : card.platform === 'x'
              ? 'bg-sky-500 hover:bg-sky-400 text-black font-extrabold shadow-[0_0_15px_rgba(56,189,248,0.4)]'
              : 'bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold shadow-[0_0_15px_rgba(0,242,255,0.4)]'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>{card.buttonLabel || `Open in ${config.displayName}`}</span>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'glass-panel border-white/10 text-white/70 hover:text-white hover:border-white/20'
          }`}
          title="Copy public link"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            shared
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'glass-panel border-white/10 text-white/70 hover:text-white hover:border-white/20'
          }`}
          title="Share profile"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">{shared ? 'Shared' : 'Share'}</span>
        </button>
      </div>

      {/* Alternative Cross-Platform Links */}
      {card.alternativeOptions && card.alternativeOptions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap text-xs text-white/60 relative z-10">
          <span className="flex items-center gap-1 text-[11px] text-white/40">
            <Compass className="w-3 h-3" />
            Also on:
          </span>
          {card.alternativeOptions.map((alt, idx) => (
            <button
              key={idx}
              onClick={() => handleLaunch(alt.webUrl, alt.appDeepLink)}
              className="px-2.5 py-1 rounded-lg glass-panel-interactive border-white/10 text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-all"
            >
              <span>{alt.platformDisplayName}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
