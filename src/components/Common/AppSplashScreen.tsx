import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface AppSplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
  statusText?: string;
}

const STATUS_STEPS = [
  'Preparing ANIVOX...',
  'Loading your workspace...',
  'Syncing project data...',
  'Almost ready...',
];

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onComplete,
  durationMs = 1100,
  statusText,
}) => {
  const [isFading, setIsFading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % STATUS_STEPS.length);
    }, Math.floor(durationMs / 3.5));

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, Math.max(300, durationMs - 300));

    const endTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [durationMs, onComplete]);

  const activeMessage = statusText || STATUS_STEPS[currentStepIndex];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-300 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-rose-500/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 animate-scale-up">
        {/* Animated App Icon Container */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-600 to-rose-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 animate-tilt" />
          <div className="relative w-28 h-28 rounded-3xl bg-slate-950 border border-white/20 p-2.5 flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <img
              src="/anivox-icon.svg"
              alt="AniVox Icon"
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-rose-400 font-mono">
              ANIVOX
            </h1>
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          </div>
          <p className="text-xs font-semibold tracking-wider uppercase text-white/60">
            Your Intelligent Personal Assistant
          </p>
        </div>

        {/* Dynamic Non-Blocking Status Loading Indicator */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 rounded-full animate-progress" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300/80">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{activeMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
