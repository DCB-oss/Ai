import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, Mic, ShieldAlert, Sparkles, Delete } from 'lucide-react';
import { OrbVisualizer } from '../Orb/OrbVisualizer';
import { soundEffects } from '../../services/soundEffects';

interface AppLockOverlayProps {
  isLocked: boolean;
  securityPin: string;
  voiceTriggerPhrase: string;
  isListening: boolean;
  onUnlock: () => void;
  onToggleMic: () => void;
}

export const AppLockOverlay: React.FC<AppLockOverlayProps> = ({
  isLocked,
  securityPin,
  voiceTriggerPhrase,
  isListening,
  onUnlock,
  onToggleMic,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    if (pinInput.length >= 4) return;
    soundEffects.playTap();
    const nextPin = pinInput + digit;
    setPinInput(nextPin);
    setError(false);

    if (nextPin.length === 4) {
      if (nextPin === (securityPin || '0000')) {
        soundEffects.playSuccess();
        setPinInput('');
        onUnlock();
      } else {
        soundEffects.playTimerAlarm();
        setError(true);
        setTimeout(() => {
          setPinInput('');
          setError(false);
        }, 800);
      }
    }
  };

  const handleDelete = () => {
    soundEffects.playTap();
    setPinInput((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#020408]/95 backdrop-blur-2xl animate-fade-in text-white selection:bg-cyan-500">
      <div className="w-full max-w-sm flex flex-col items-center space-y-6">
        {/* Animated Visualizer Orb */}
        <div className="relative cursor-pointer" onClick={onToggleMic}>
          <OrbVisualizer
            state={isListening ? 'LISTENING' : 'IDLE'}
            size="md"
            interactive={true}
          />
          <div className="absolute -bottom-2 inset-x-0 flex justify-center">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 tracking-wider">
              {isListening ? 'LISTENING FOR UNLOCK PHRASE' : 'TAP ORB TO SPEAK'}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-cyan-400">
            <Lock className="w-5 h-5" />
            <h1 className="text-lg font-black tracking-wider uppercase">
              Assistant Protected
            </h1>
          </div>
          <p className="text-xs text-white/50">
            Enter 4-digit PIN or speak "{voiceTriggerPhrase || 'Hey AniVox'}"
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)] scale-110'
                    : isFilled
                    ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_12px_rgba(0,242,255,0.8)] scale-110'
                    : 'border-white/30 bg-white/5'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-bold text-rose-400 animate-pulse">
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* PIN Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl glass-panel-interactive border-white/10 text-lg font-bold text-white hover:text-cyan-300 hover:border-cyan-500/30 flex items-center justify-center transition-all active:scale-95 shadow-md"
            >
              {num}
            </button>
          ))}

          {/* Voice Mic shortcut */}
          <button
            onClick={onToggleMic}
            className={`h-14 rounded-2xl border flex items-center justify-center transition-all active:scale-95 ${
              isListening
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                : 'glass-panel border-white/10 text-white/50 hover:text-white'
            }`}
            title="Voice Unlock"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Zero */}
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl glass-panel-interactive border-white/10 text-lg font-bold text-white hover:text-cyan-300 hover:border-cyan-500/30 flex items-center justify-center transition-all active:scale-95 shadow-md"
          >
            0
          </button>

          {/* Backspace Delete */}
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl glass-panel border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all active:scale-95"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Unlock / Default */}
        {!securityPin && (
          <button
            onClick={onUnlock}
            className="text-xs text-cyan-400/80 hover:text-cyan-300 underline font-medium"
          >
            No PIN configured — Tap to Unlock
          </button>
        )}
      </div>
    </div>
  );
};
