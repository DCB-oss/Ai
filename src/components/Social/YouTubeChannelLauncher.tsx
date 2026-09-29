import React, { useState } from 'react';
import {
  Youtube,
  ExternalLink,
  Smartphone,
  Globe,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { launchSmartLink } from '../../services/socialLinkLauncher';
import { soundEffects } from '../../services/soundEffects';

interface YouTubeChannelLauncherProps {
  userChannelUrl?: string;
  onConnectUserChannel?: () => void;
  className?: string;
}

export const YouTubeChannelLauncher: React.FC<YouTubeChannelLauncherProps> = ({
  userChannelUrl,
  onConnectUserChannel,
  className = '',
}) => {
  const [customUserUrl, setCustomUserUrl] = useState(userChannelUrl || '');
  const [isEditingUserChannel, setIsEditingUserChannel] = useState(false);
  const [userHandleInput, setUserHandleInput] = useState('');

  // Official AniVox / DCB YouTube Channel
  const OFFICIAL_CHANNEL = {
    title: 'AniVox & DCB Official Channel',
    handle: '@dcb-q2x7j',
    url: 'https://youtube.com/@dcb-q2x7j',
    appDeepLink: 'vnd.youtube://www.youtube.com/@dcb-q2x7j',
    description: 'Official YouTube home of AniVox and creator DCB (@dcb-q2x7j). Watch tutorials, release notes, AI agent demos, and guides.',
  };

  const handleOpenOurChannel = () => {
    soundEffects.playTap();
    launchSmartLink({
      webUrl: OFFICIAL_CHANNEL.url,
      appDeepLink: OFFICIAL_CHANNEL.appDeepLink,
      platform: 'youtube',
    });
  };

  const handleOpenYourChannel = () => {
    soundEffects.playTap();
    let targetWebUrl = customUserUrl.trim();
    let targetDeepLink: string | undefined;

    if (!targetWebUrl) {
      // Default to YouTube Channel Switcher or Studio
      targetWebUrl = 'https://www.youtube.com/channel_switcher';
      targetDeepLink = 'vnd.youtube://www.youtube.com/channel_switcher';
    } else {
      if (targetWebUrl.startsWith('@')) {
        const handleClean = targetWebUrl.replace(/^@/, '');
        targetWebUrl = `https://www.youtube.com/@${encodeURIComponent(handleClean)}`;
        targetDeepLink = `vnd.youtube://www.youtube.com/@${encodeURIComponent(handleClean)}`;
      } else if (!targetWebUrl.startsWith('http://') && !targetWebUrl.startsWith('https://')) {
        targetWebUrl = `https://${targetWebUrl}`;
      }
    }

    launchSmartLink({
      webUrl: targetWebUrl,
      appDeepLink: targetDeepLink,
      platform: 'youtube',
    });
  };

  const handleSaveUserChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (userHandleInput.trim()) {
      let formatted = userHandleInput.trim();
      if (!formatted.startsWith('http') && !formatted.startsWith('@')) {
        formatted = `@${formatted}`;
      }
      setCustomUserUrl(formatted);
      localStorage.setItem('anivox_user_yt_channel', formatted);
      soundEffects.playSuccess();
    }
    setIsEditingUserChannel(false);
  };

  return (
    <div className={`p-5 rounded-3xl glass-panel border-red-500/30 bg-slate-950/80 shadow-[0_0_40px_rgba(239,68,68,0.15)] space-y-5 ${className}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              <span>YouTube Channel Access</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-bold">
                Two Options
              </span>
            </h3>
            <p className="text-xs text-white/50">
              Access the official AniVox creator channel or manage your personal creator space
            </p>
          </div>
        </div>
      </div>

      {/* Two Separate Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OPTION 1: VISIT OUR CHANNEL */}
        <div className="p-4 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-black/50 to-slate-950/80 flex flex-col justify-between space-y-4 hover:border-red-500/50 transition-all group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-black uppercase tracking-wider">
                Official DCB & AniVox Channel
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <h4 className="text-base font-bold text-white group-hover:text-red-300 transition-colors">
              {OFFICIAL_CHANNEL.title}
            </h4>
            <p className="text-xs text-red-400 font-mono font-semibold">
              {OFFICIAL_CHANNEL.handle}
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              {OFFICIAL_CHANNEL.description}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleOpenOurChannel}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-102 active:scale-98"
            >
              <Youtube className="w-4 h-4" />
              <span>Visit Our Channel</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
            <p className="text-[10px] text-center text-white/40 mt-1.5">
              Opens @dcb-q2x7j in YouTube app or default browser
            </p>
          </div>
        </div>

        {/* OPTION 2: VISIT YOUR CHANNEL */}
        <div className="p-4 rounded-2xl border border-white/10 bg-black/40 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10 text-[10px] font-black uppercase tracking-wider">
                Personal Creator Channel
              </span>
              <User className="w-4 h-4 text-cyan-400" />
            </div>

            <h4 className="text-base font-bold text-white">
              Visit Your Channel
            </h4>
            <p className="text-xs text-cyan-400 font-mono font-semibold truncate">
              {customUserUrl || 'YouTube Studio & Channel Manager'}
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              Open your connected channel, playlists, and analytics directly. Authenticated securely via Google/YouTube without password storage.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {isEditingUserChannel ? (
              <form onSubmit={handleSaveUserChannel} className="space-y-2">
                <input
                  type="text"
                  value={userHandleInput}
                  onChange={(e) => setUserHandleInput(e.target.value)}
                  placeholder="Enter your @handle or URL"
                  className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500 text-black text-xs font-bold"
                  >
                    Save Handle
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingUserChannel(false)}
                    className="py-1.5 px-3 rounded-lg bg-white/10 text-white/60 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <button
                  onClick={handleOpenYourChannel}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/20 transition-all hover:scale-102 active:scale-98"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Visit Your Channel</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
                <div className="flex items-center justify-between text-[10px] text-white/40 pt-0.5 px-1">
                  <span>No password needed</span>
                  <button
                    onClick={() => {
                      setUserHandleInput(customUserUrl);
                      setIsEditingUserChannel(true);
                    }}
                    className="text-cyan-400 hover:underline"
                  >
                    Set Channel Handle
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
