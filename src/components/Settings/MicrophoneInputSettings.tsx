import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sliders,
  Volume2,
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  RefreshCw,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { AssistantSettings } from '../../types/assistant';
import { soundEffects } from '../../services/soundEffects';
import { AudioInputDeviceInfo } from '../../hooks/useVoiceEngine';

interface MicrophoneInputSettingsProps {
  settings: AssistantSettings;
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
  availableMicrophones?: AudioInputDeviceInfo[];
  onRefreshDevices?: () => void;
  onTestMicStart?: () => void;
  onTestMicStop?: () => void;
  isTestingMic?: boolean;
  audioLevel?: number;
  decibels?: number;
  waveformBars?: number[];
  micDiagnosticInfo?: string;
  micPermission?: 'granted' | 'denied' | 'prompt' | 'unsupported';
  onRequestPermission?: () => Promise<boolean>;
}

export const MicrophoneInputSettings: React.FC<MicrophoneInputSettingsProps> = ({
  settings,
  onUpdateSettings,
  availableMicrophones = [],
  onRefreshDevices,
  onTestMicStart,
  onTestMicStop,
  isTestingMic = false,
  audioLevel = 0,
  decibels = -60,
  waveformBars = [0, 0, 0, 0, 0, 0, 0, 0],
  micDiagnosticInfo,
  micPermission = 'prompt',
  onRequestPermission,
}) => {
  const [testActive, setTestActive] = useState(isTestingMic);

  useEffect(() => {
    setTestActive(isTestingMic);
  }, [isTestingMic]);

  const sensitivity = settings.micInputSensitivity ?? 1.2;
  const noiseReduction = settings.noiseReductionEnabled ?? true;
  const echoCancellation = settings.echoCancellationEnabled ?? true;
  const autoDetection = settings.autoSpeechDetectionEnabled ?? true;
  const silenceTimeout = settings.silenceTimeoutMs ?? 2200;

  const handleTestToggle = () => {
    soundEffects.playTap();
    if (testActive) {
      onTestMicStop?.();
      setTestActive(false);
    } else {
      if (micPermission !== 'granted' && onRequestPermission) {
        onRequestPermission().then((granted) => {
          if (granted) {
            onTestMicStart?.();
            setTestActive(true);
          }
        });
      } else {
        onTestMicStart?.();
        setTestActive(true);
      }
    }
  };

  const getSensitivityLabel = (val: number) => {
    if (val < 0.8) return 'Low Sensitivity (Loud environments)';
    if (val <= 1.3) return 'Balanced / Normal (Recommended)';
    if (val <= 2.0) return 'High Sensitivity (Quiet speech)';
    return 'Ultra Sensitivity (Whisper / Far field)';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Microphone & Voice Input Settings
            </h3>
            <p className="text-xs text-white/50">
              Fine-tune microphone sensitivity, speech detection thresholds, and noise isolation
            </p>
          </div>
        </div>

        {onRefreshDevices && (
          <button
            onClick={() => {
              soundEffects.playTap();
              onRefreshDevices();
            }}
            className="p-2 rounded-xl glass-panel text-white/60 hover:text-white border-white/10 hover:border-cyan-500/30 transition-colors"
            title="Refresh microphone devices"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 1. Microphone Device Selection */}
      <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-3 bg-slate-950/60">
        <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
          Selected Microphone
        </label>
        <div className="relative">
          <select
            value={settings.selectedMicrophoneDeviceId || ''}
            onChange={(e) => {
              soundEffects.playTap();
              onUpdateSettings({ selectedMicrophoneDeviceId: e.target.value || undefined });
            }}
            className="w-full bg-[#030712] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 appearance-none font-medium pr-8"
          >
            <option value="">Default System Microphone (Auto)</option>
            {availableMicrophones.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Microphone (${mic.deviceId.slice(0, 8)}...)`}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50 text-xs">
            ▼
          </div>
        </div>
        {availableMicrophones.length === 0 && (
          <p className="text-[11px] text-white/40 italic">
            Default audio capture active. Connect external mic or grant permission to list all audio inputs.
          </p>
        )}
      </div>

      {/* 2. Input Sensitivity Slider */}
      <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-3 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Input Sensitivity
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {sensitivity.toFixed(1)}x Gain
          </span>
        </div>

        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={sensitivity}
          onChange={(e) => {
            onUpdateSettings({ micInputSensitivity: parseFloat(e.target.value) });
          }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
          <span>0.5x (Quiet)</span>
          <span className="text-cyan-300/80">{getSensitivityLabel(sensitivity)}</span>
          <span>3.0x (Max)</span>
        </div>
      </div>

      {/* 3. Audio Processing Switches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Noise Reduction */}
        <div className="p-4 rounded-2xl glass-panel border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Noise Reduction</div>
            <div className="text-[11px] text-white/50">Filters background hum and AC rumble</div>
          </div>
          <button
            onClick={() => {
              soundEffects.playTap();
              onUpdateSettings({ noiseReductionEnabled: !noiseReduction });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              noiseReduction ? 'bg-cyan-500' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                noiseReduction ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Echo Cancellation */}
        <div className="p-4 rounded-2xl glass-panel border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Echo Cancellation</div>
            <div className="text-[11px] text-white/50">Prevents speaker feedback loop</div>
          </div>
          <button
            onClick={() => {
              soundEffects.playTap();
              onUpdateSettings({ echoCancellationEnabled: !echoCancellation });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              echoCancellation ? 'bg-cyan-500' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                echoCancellation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Automatic Speech Detection (VAD) */}
        <div className="p-4 rounded-2xl glass-panel border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Automatic Speech Detection</div>
            <div className="text-[11px] text-white/50">Distinguishes voice from quiet pauses</div>
          </div>
          <button
            onClick={() => {
              soundEffects.playTap();
              onUpdateSettings({ autoSpeechDetectionEnabled: !autoDetection });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              autoDetection ? 'bg-cyan-500' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                autoDetection ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Silence Timeout / Pause Tolerance */}
        <div className="p-4 rounded-2xl glass-panel border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Pause Tolerance</div>
            <div className="text-[11px] text-white/50">Time before auto-stopping speech</div>
          </div>
          <select
            value={silenceTimeout}
            onChange={(e) => {
              soundEffects.playTap();
              onUpdateSettings({ silenceTimeoutMs: parseInt(e.target.value, 10) });
            }}
            className="bg-[#030712] border border-white/20 rounded-xl px-2.5 py-1 text-xs text-cyan-300 font-bold focus:outline-none"
          >
            <option value={1500}>1.5s (Fast)</option>
            <option value={2200}>2.2s (Standard)</option>
            <option value={3000}>3.0s (Relaxed)</option>
            <option value={4000}>4.0s (Long pauses)</option>
          </select>
        </div>
      </div>

      {/* 4. Interactive "Test Microphone" Section */}
      <div className="p-4 rounded-2xl glass-panel border-cyan-500/30 bg-slate-950/80 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Microphone Diagnostic Meter
            </span>
          </div>

          <button
            onClick={handleTestToggle}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
              testActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            }`}
          >
            {testActive ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>Stop Test</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Test Microphone</span>
              </>
            )}
          </button>
        </div>

        {/* Live Audio Level Visualizer */}
        <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-white/60">Live Input Level:</span>
            <span
              className={`font-bold ${
                audioLevel > 0.08 ? 'text-emerald-400' : 'text-white/40'
              }`}
            >
              {testActive
                ? audioLevel > 0.08
                  ? `VOICE DETECTED (${decibels} dB)`
                  : `Ambient Silence (${decibels} dB)`
                : 'Test inactive — Tap "Test Microphone"'}
            </span>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                audioLevel > 0.4
                  ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-400'
                  : audioLevel > 0.08
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                  : 'bg-cyan-500/40'
              }`}
              style={{ width: `${testActive ? Math.min(100, Math.round(audioLevel * 100)) : 0}%` }}
            />
          </div>

          {/* Waveform Frequency Bars */}
          {testActive && (
            <div className="flex items-center justify-center gap-1.5 h-6 pt-1">
              {waveformBars.map((height, i) => (
                <span
                  key={i}
                  className={`w-2 rounded-full transition-all duration-75 ${
                    height > 10 ? 'bg-cyan-400' : 'bg-white/10'
                  }`}
                  style={{ height: `${Math.max(4, (height / 100) * 24)}px` }}
                />
              ))}
            </div>
          )}
        </div>

        {micDiagnosticInfo && (
          <p className="text-[11px] text-cyan-300/80 font-mono bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/20">
            {micDiagnosticInfo}
          </p>
        )}
      </div>
    </div>
  );
};
