import React, { useState } from 'react';
import { Mic, MicOff, ShieldCheck, Sparkles, X, MessageSquare, Volume2 } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface MicPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unsupported';
  onRequestPermission: () => Promise<boolean>;
}

export const MicPermissionModal: React.FC<MicPermissionModalProps> = ({
  isOpen,
  onClose,
  permissionStatus,
  onRequestPermission,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleAllow = async () => {
    soundEffects.playTap();
    setIsRequesting(true);
    try {
      const granted = await onRequestPermission();
      if (granted) {
        localStorage.setItem('anivox_mic_permission_status', 'granted');
        onClose();
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNotNow = () => {
    soundEffects.playTap();
    // Remember user decision so we don't repeatedly badger them
    localStorage.setItem('anivox_mic_permission_prompt_dismissed', 'true');
    localStorage.setItem('anivox_mic_dismiss_timestamp', Date.now().toString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border-cyan-500/30 p-6 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.9)] space-y-5 bg-slate-950/95 text-center">
        {/* Close Button */}
        <button
          onClick={handleNotNow}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white glass-panel border-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center Glowing Mic Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-pulse">
          <Mic className="w-8 h-8" />
        </div>

        {/* Clean, Direct User Request Header */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
            ANIVOX needs microphone access to hear you.
          </h2>
          <p className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto">
            Enable your microphone to speak naturally with ANIVOX, give voice commands, narrate stories, and control your creator studio.
          </p>
        </div>

        {/* Privacy Assurance Feature Pill */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="text-[11px] text-white/70">
            <span className="font-bold text-white">Private & Local:</span> Audio is processed only when you actively tap the microphone.
          </div>
        </div>

        {/* Primary Action Buttons: [Allow Microphone] & [Not Now] */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={handleAllow}
            disabled={isRequesting}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4" />
            <span>{isRequesting ? 'Connecting...' : 'Allow Microphone'}</span>
          </button>

          <button
            onClick={handleNotNow}
            className="py-3 px-4 rounded-xl glass-panel-interactive border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};
