import React, { useState } from 'react';
import { Lock, Shield, KeyRound, Mic, CheckCircle2, AlertTriangle, X, ShieldAlert, Sparkles } from 'lucide-react';
import { AssistantSettings } from '../../types/assistant';
import { soundEffects } from '../../services/soundEffects';

interface VoiceAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssistantSettings;
  micPermission: 'granted' | 'denied' | 'prompt' | 'unsupported';
  onRequestMicPermission: () => Promise<boolean>;
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
}

export const VoiceAccessModal: React.FC<VoiceAccessModalProps> = ({
  isOpen,
  onClose,
  settings,
  micPermission,
  onRequestMicPermission,
  onUpdateSettings,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pinInput, setPinInput] = useState(settings.securityPin || '');
  const [confirmPin, setConfirmPin] = useState(settings.securityPin || '');
  const [pinError, setPinError] = useState('');
  const [triggerPhrase, setTriggerPhrase] = useState(settings.voiceTriggerPhrase || 'Hey Vox');

  if (!isOpen) return null;

  const handleSaveSecurity = () => {
    if (settings.voiceLockEnabled || step === 3) {
      if (pinInput.length < 4) {
        setPinError('PIN must be at least 4 numeric digits.');
        return;
      }
      if (pinInput !== confirmPin) {
        setPinError('PINs do not match. Please verify.');
        return;
      }
    }

    onUpdateSettings({
      voiceLockEnabled: true,
      securityPin: pinInput,
      voiceTriggerPhrase: triggerPhrase,
      requireAuthForSensitiveData: true,
    });

    soundEffects.playSuccess();
    onClose();
  };

  const handleDisableLock = () => {
    onUpdateSettings({
      voiceLockEnabled: false,
      isAppLocked: false,
      securityPin: '',
    });
    soundEffects.playTap();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border-white/20 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white glass-panel border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.2)]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider uppercase text-white">
              Voice Access & App Lock
            </h2>
            <p className="text-xs text-white/50">
              Hands-Free Assistant Access & Fallback PIN Protection
            </p>
          </div>
        </div>

        {/* Mandatory Security Disclosure Banner */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200/90 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Important Security Architecture Rule</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            <strong>Voice is not a standalone biometric security factor</strong> because voices can be recorded, imitated, or misrecognized.
          </p>
          <p className="text-[11px] text-amber-100/70 leading-relaxed">
            Voice Access enables hands-free speech queries while the app is active. Sensitive operations (wiping memories, exporting credentials, modifying security PINs) require verified <strong>PIN authentication</strong> or native OS biometrics.
          </p>
        </div>

        {/* Configuration Steps */}
        <div className="space-y-4">
          {/* Step 1: Microphone Permission */}
          <div className={`p-4 rounded-2xl border transition-all ${
            micPermission === 'granted'
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : 'glass-panel border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Mic className={`w-4 h-4 ${micPermission === 'granted' ? 'text-emerald-400' : 'text-cyan-400'}`} />
                <span>1. Microphone Access Status</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                micPermission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {micPermission}
              </span>
            </div>
            {micPermission !== 'granted' && (
              <button
                onClick={onRequestMicPermission}
                className="mt-3 w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Authorize Microphone Access</span>
              </button>
            )}
          </div>

          {/* Step 2: Voice Trigger Phrase */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-2">
            <label className="block text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>2. Voice Access Trigger Phrase</span>
            </label>
            <p className="text-[11px] text-white/50">
              When spoken while viewing the app, Vox will listen and process your command.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {['Hey Vox', 'Vox Assistant', 'Listen Vox', 'Activate'].map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => setTriggerPhrase(phrase)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    (triggerPhrase || '').toLowerCase() === phrase.toLowerCase()
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                      : 'glass-panel border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Secure Fallback PIN Setup */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-3">
            <label className="block text-xs font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>3. Backup Security PIN (4 Digits)</span>
            </label>
            <p className="text-[11px] text-white/50">
              Required to unlock the assistant interface or view protected long-term memories.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-white/60 block mb-1">Set 4-digit PIN</span>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                  placeholder="••••"
                  className="w-full text-center text-lg tracking-widest font-mono py-2 rounded-xl glass-panel text-white border-white/10 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] text-white/60 block mb-1">Confirm PIN</span>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                  placeholder="••••"
                  className="w-full text-center text-lg tracking-widest font-mono py-2 rounded-xl glass-panel text-white border-white/10 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>
            </div>

            {pinError && (
              <p className="text-xs font-semibold text-rose-400 animate-pulse">{pinError}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleSaveSecurity}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enable & Save Voice Lock</span>
          </button>

          {settings.voiceLockEnabled && (
            <button
              onClick={handleDisableLock}
              className="py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
            >
              Disable Lock
            </button>
          )}

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-2xl glass-panel border-white/10 text-white/60 hover:text-white text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
