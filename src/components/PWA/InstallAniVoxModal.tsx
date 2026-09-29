import React from 'react';
import {
  Download,
  X,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Share2,
  PlusSquare,
  ShieldCheck,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface InstallAniVoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<void>;
  isInstallable: boolean;
  isStandalone: boolean;
}

export const InstallAniVoxModal: React.FC<InstallAniVoxModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isStandalone,
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    soundEffects.playTap();
    await onInstall();
  };

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border-purple-500/40 bg-slate-950/95 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-6 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with App Icon */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-purple-500/30 p-2 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <img
              src="/anivox-icon.svg"
              alt="AniVox"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>INSTALL ANIVOX</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-xs text-white/50">
              Install AniVox on your device for a faster app-like experience.
            </p>
          </div>
        </div>

        {/* Benefits list */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs text-white/80">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Full-screen standalone interface without browser address bar</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Instant launch from home screen and app launcher</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Fast response with local caching and offline shell</span>
          </div>
        </div>

        {/* Action based on support */}
        {isStandalone ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>AniVox is already installed and running in Standalone App Mode.</span>
          </div>
        ) : isInstallable ? (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              NOT NOW
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>INSTALL</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="p-4 rounded-2xl bg-black/50 border border-cyan-500/30 space-y-2 text-xs text-white/80">
            <p className="font-bold text-cyan-300">To install on iOS / Safari:</p>
            <ol className="space-y-1 text-[11px] list-decimal list-inside text-white/70">
              <li>Tap the <Share2 className="w-3.5 h-3.5 inline text-cyan-400 mx-1" /> <strong>Share</strong> button in Safari</li>
              <li>Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline text-purple-400 mx-1" /> <strong>Add to Home Screen</strong></li>
              <li>Tap <strong>Add</strong> in the top right</li>
            </ol>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs text-white/70">
            <p className="font-bold text-white">Install as an app isn't available in this browser.</p>
            <p className="text-[11px] text-white/50 leading-relaxed">
              You can still bookmark AniVox or use your browser's menu to select <strong>Add to Home Screen</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
