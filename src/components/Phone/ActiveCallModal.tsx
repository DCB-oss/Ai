import React, { useState, useEffect } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid,
  Smartphone,
  ShieldCheck,
  Minimize2,
  Radio,
} from 'lucide-react';
import { ActiveCallSession } from '../../types/assistant';
import { phoneCallAssistant } from '../../services/phoneCallAssistant';
import { soundEffects } from '../../services/soundEffects';

interface ActiveCallModalProps {
  call: ActiveCallSession | null;
  onEndCall?: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({ call, onEndCall }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [dialpadInput, setDialpadInput] = useState('');

  if (!call) return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    soundEffects.playTap();
    if (onEndCall) {
      onEndCall();
    } else {
      phoneCallAssistant.endCall('User hung up');
    }
  };

  const handleKeypadPress = (digit: string) => {
    soundEffects.playTap();
    setDialpadInput((prev) => prev + digit);
  };

  // Minimized floating banner in top-right
  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.35)] backdrop-blur-xl cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{call.contactName}</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {call.state === 'CONNECTED' ? formatDuration(call.durationSeconds) : call.state}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEndCall();
            }}
            className="w-7 h-7 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md ml-1"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col items-center text-center overflow-hidden">
        {/* Top Controls: Minimize & SIM Indicator */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300">
            <Smartphone className="w-3 h-3 text-cyan-400" />
            <span>SIM {call.simSlot}: {call.simCarrierName || 'Default'}</span>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
            title="Minimize call overlay"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ambient Ringing Waves / Pulsing Circle */}
        <div className="relative my-4 flex items-center justify-center">
          {call.state === 'CONNECTED' && (
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          )}
          {(call.state === 'DIALING' || call.state === 'RINGING') && (
            <div className="absolute -inset-4 rounded-full border border-cyan-400/40 animate-pulse" />
          )}

          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-300/40 z-10">
            {call.contactName.charAt(0)}
          </div>
        </div>

        {/* Contact Info & Call Status */}
        <div className="space-y-1 my-2">
          <h2 className="text-xl font-black tracking-wide text-white">
            {call.contactName}
          </h2>
          <div className="text-xs font-mono text-emerald-300">
            {call.number} {call.label ? `(${call.label})` : ''}
          </div>
          <div className="pt-2">
            {call.state === 'DIALING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30 animate-pulse">
                <Radio className="w-3 h-3 text-cyan-400" />
                Dialing via Android Telecom...
              </span>
            )}
            {call.state === 'RINGING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/30 animate-pulse">
                <Radio className="w-3 h-3 text-teal-400" />
                Ringing...
              </span>
            )}
            {call.state === 'CONNECTED' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-black text-sm border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {formatDuration(call.durationSeconds)}
              </span>
            )}
            {call.state === 'ENDED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                Call Ended
              </span>
            )}
          </div>
        </div>

        {/* Optional In-Call Keypad (DTMF Dialpad) */}
        {showKeypad && (
          <div className="w-full my-3 p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 animate-in zoom-in-95 duration-200">
            {dialpadInput && (
              <div className="text-sm font-mono text-cyan-300 tracking-widest text-center py-1">
                {dialpadInput}
              </div>
            )}
            <div className="grid grid-cols-3 gap-1.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeypadPress(digit)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white font-mono font-bold text-sm transition-colors"
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* In-Call Controls Row: Mute, Keypad, Speaker */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mt-4 mb-6">
          {/* Mute Button */}
          <button
            onClick={() => phoneCallAssistant.toggleMute()}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              call.isMuted
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'glass-panel border-white/10 text-white/70 hover:text-white hover:border-white/20'
            }`}
          >
            {call.isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] font-bold mt-1.5">
              {call.isMuted ? 'Muted' : 'Mute'}
            </span>
          </button>

          {/* Keypad Toggle */}
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              showKeypad
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                : 'glass-panel border-white/10 text-white/70 hover:text-white hover:border-white/20'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1.5">Keypad</span>
          </button>

          {/* Speakerphone Toggle */}
          <button
            onClick={() => phoneCallAssistant.toggleSpeaker()}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              call.isSpeaker
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'glass-panel border-white/10 text-white/70 hover:text-white hover:border-white/20'
            }`}
          >
            {call.isSpeaker ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px] font-bold mt-1.5">
              {call.isSpeaker ? 'Speaker On' : 'Speaker'}
            </span>
          </button>
        </div>

        {/* Big End Call / Hang Up Button */}
        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.6)] border-2 border-rose-400/40 transition-all cursor-pointer"
          title="Hang Up (End Call)"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Security / Privacy Footer */}
        <div className="flex items-center gap-1.5 text-[10px] text-white/40 mt-5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Native Android Telecom API Bridge Active</span>
        </div>
      </div>
    </div>
  );
};
