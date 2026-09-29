import React, { useState } from 'react';
import {
  Volume2,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  Sliders,
  Radio,
  Mic,
  Activity,
} from 'lucide-react';
import {
  VOICE_PERSONALITIES,
  VoicePersonality,
  SUPPORTED_VOICE_PROVIDERS,
} from '../../services/voiceControls';
import { AssistantSettings } from '../../types/assistant';
import { soundEffects } from '../../services/soundEffects';

interface VoicePersonalitySelectorProps {
  settings: AssistantSettings;
  voices: SpeechSynthesisVoice[];
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
  onTestVoice: (previewPhrase?: string) => void;
  onStopSpeaking: () => void;
  isSpeaking: boolean;
}

export const VoicePersonalitySelector: React.FC<VoicePersonalitySelectorProps> = ({
  settings,
  voices,
  onUpdateSettings,
  onTestVoice,
  onStopSpeaking,
  isSpeaking,
}) => {
  const [activePreview, setActivePreview] = useState<VoicePersonality | null>(null);

  const currentPersonality = settings.voicePersonality || 'classic';

  const handleSelectPersonality = (pId: VoicePersonality) => {
    const profile = VOICE_PERSONALITIES[pId];
    if (!profile) return;

    const newRate = Number(Math.max(0.5, Math.min(2.0, (1.0 * profile.rateModifier))).toFixed(2));
    const newPitch = Number(Math.max(0.5, Math.min(1.5, profile.pitchModifier)).toFixed(2));

    onUpdateSettings({
      voicePersonality: pId,
      speechRate: newRate,
      speechPitch: newPitch,
    });

    soundEffects.playTap();
  };

  const handlePreview = (pId: VoicePersonality, e: React.MouseEvent) => {
    e.stopPropagation();
    const profile = VOICE_PERSONALITIES[pId];
    if (!profile) return;

    if (activePreview === pId && isSpeaking) {
      onStopSpeaking();
      setActivePreview(null);
      return;
    }

    setActivePreview(pId);
    onTestVoice(profile.previewPhrase);
    setTimeout(() => {
      setActivePreview(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)] shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wider uppercase text-white">
                Vox Voice Synthesizer & Personalities
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-widest">
                Male Voice Core
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Select Vox's speech profile, acoustic resonance, cadence, and test output aloud.
            </p>
          </div>
        </div>
      </div>

      {/* Personality Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {(Object.keys(VOICE_PERSONALITIES) as VoicePersonality[]).map((pId) => {
          const profile = VOICE_PERSONALITIES[pId];
          const isSelected = currentPersonality === pId;
          const isPreviewing = activePreview === pId && isSpeaking;

          return (
            <div
              key={pId}
              onClick={() => handleSelectPersonality(pId)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'glass-panel border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_25px_rgba(0,242,255,0.15)] ring-1 ring-cyan-500/30'
                  : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {profile.name}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Audio Preview Button */}
                  <button
                    type="button"
                    onClick={(e) => handlePreview(pId, e)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isPreviewing
                        ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    {isPreviewing ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-cyan-300 font-semibold mb-1">
                  {profile.tagline}
                </p>
                <p className="text-xs text-white/50 leading-relaxed">
                  {profile.description}
                </p>
              </div>

              {/* Acoustic Metrics */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3 text-[11px] text-white/40">
                <span>Speed: {profile.rateModifier}x</span>
                <span>Pitch: {profile.pitchModifier}</span>
                <span className="text-white/60">Tap to Select</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fine-Tuning Sliders */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black tracking-widest uppercase text-white">
              Acoustic Fine-Tuning
            </h3>
          </div>
          <button
            onClick={() => {
              onUpdateSettings({ speechRate: 1.0, speechPitch: 1.0 });
              soundEffects.playTap();
            }}
            className="text-[11px] text-white/40 hover:text-cyan-300 transition-colors"
          >
            Reset to 1.0x
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Speech Rate */}
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-white/70 font-semibold">Speech Rate</span>
              <span className="text-cyan-400 font-bold font-mono">
                {settings.speechRate?.toFixed(2) || '1.00'}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.75"
              step="0.05"
              value={settings.speechRate || 1.0}
              onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Speech Pitch */}
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-white/70 font-semibold">Vocal Pitch</span>
              <span className="text-cyan-400 font-bold font-mono">
                {settings.speechPitch?.toFixed(2) || '1.00'}
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.05"
              value={settings.speechPitch || 1.0}
              onChange={(e) => onUpdateSettings({ speechPitch: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
