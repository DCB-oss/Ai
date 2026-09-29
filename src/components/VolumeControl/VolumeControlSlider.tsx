import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Volume2,
  Volume1,
  VolumeX,
  Volume,
  Plus,
  Minus,
  Play,
  Square,
  Smartphone,
  Info,
  ShieldCheck,
  Check,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { nativeAndroidBridge } from '../../services/nativeAndroidBridge';
import { soundEffects } from '../../services/soundEffects';

export interface VolumeControlProps {
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  onChange: (volume: number, isMuted: boolean) => void;
  onTestVoice?: () => void;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
  variant?: 'large' | 'compact' | 'pill' | 'card';
  showSystemVolumeNotice?: boolean;
  showPresets?: boolean;
  showSteppers?: boolean;
  showTestButton?: boolean;
  className?: string;
}

export function VolumeControlSlider({
  volume,
  isMuted,
  onChange,
  onTestVoice,
  isSpeaking = false,
  onStopSpeaking,
  variant = 'large',
  showSystemVolumeNotice = true,
  showPresets = true,
  showSteppers = true,
  showTestButton = true,
  className = '',
}: VolumeControlProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [lastNonZeroVolume, setLastNonZeroVolume] = useState(volume > 0 ? volume : 0.75);
  const [showAndroidDetails, setShowAndroidDetails] = useState(false);
  const [dragYPercent, setDragYPercent] = useState<number | null>(null);

  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const lastHapticStepRef = useRef<number>(Math.round(volume * 10));

  // Keep track of last non-zero volume for smooth unmuting
  useEffect(() => {
    if (volume > 0 && !isMuted) {
      setLastNonZeroVolume(volume);
    }
  }, [volume, isMuted]);

  const effectiveVolume = isMuted ? 0 : volume;
  const currentPercentage = Math.round(effectiveVolume * 100);

  // Qualitative volume description based on user requirements
  const getVolumeDescriptor = (pct: number, muted: boolean) => {
    if (muted || pct === 0) return { label: 'Muted', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    if (pct <= 30) return { label: 'Quiet', color: 'text-cyan-300', badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30' };
    if (pct <= 70) return { label: 'Medium', color: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    if (pct < 100) return { label: 'High', color: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    return { label: 'Maximum available volume', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  const descriptor = getVolumeDescriptor(currentPercentage, isMuted);

  // Dynamic Speaker Icon with animated audio state
  const renderSpeakerIcon = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    if (isMuted || effectiveVolume === 0) {
      return <VolumeX className={`${sizeClass} text-rose-400 transition-colors`} />;
    }
    if (effectiveVolume <= 0.3) {
      return <Volume className={`${sizeClass} text-cyan-300 transition-colors`} />;
    }
    if (effectiveVolume <= 0.7) {
      return <Volume1 className={`${sizeClass} text-cyan-400 transition-colors`} />;
    }
    return <Volume2 className={`${sizeClass} text-cyan-300 animate-pulse transition-colors`} />;
  };

  // Trigger tactile haptic pulse on step changes
  const triggerVolumeHaptic = (newPct: number) => {
    const step = Math.round(newPct / 10);
    if (step !== lastHapticStepRef.current) {
      lastHapticStepRef.current = step;
      nativeAndroidBridge.triggerHaptic(newPct === 0 || newPct === 100 ? 35 : 15);
    }
  };

  // Convert client coordinate inside slider track to volume (0.0 to 1.0)
  const calculateVolumeFromPointer = useCallback((clientY: number) => {
    if (!sliderTrackRef.current) return 0;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const height = rect.height;
    if (height <= 0) return 0;

    // In a vertical slider, top is 100% and bottom is 0%
    const relativeY = clientY - rect.top;
    const clampedY = Math.max(0, Math.min(height, relativeY));
    const normalized = 1 - (clampedY / height);

    // Snap to exact 0.0 or 1.0 at thresholds
    if (normalized < 0.02) return 0;
    if (normalized > 0.98) return 1.0;
    return Number(normalized.toFixed(2));
  }, []);

  // Pointer event handlers for silky smooth one-finger dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const newVol = calculateVolumeFromPointer(e.clientY);
    const newPct = Math.round(newVol * 100);
    setDragYPercent(newPct);
    triggerVolumeHaptic(newPct);

    const mutedState = newVol === 0;
    onChange(newVol, mutedState);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const newVol = calculateVolumeFromPointer(e.clientY);
    const newPct = Math.round(newVol * 100);
    setDragYPercent(newPct);
    triggerVolumeHaptic(newPct);

    const mutedState = newVol === 0;
    onChange(newVol, mutedState);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragYPercent(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const newVol = calculateVolumeFromPointer(e.clientY);
    const mutedState = newVol === 0;
    onChange(newVol, mutedState);
    soundEffects.playTap();
    nativeAndroidBridge.triggerHaptic(20);
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragYPercent(null);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') delta = 0.05;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') delta = -0.05;
    else if (e.key === 'PageUp') delta = 0.2;
    else if (e.key === 'PageDown') delta = -0.2;
    else if (e.key === 'Home') {
      onChange(0, true);
      nativeAndroidBridge.triggerHaptic(30);
      return;
    } else if (e.key === 'End') {
      onChange(1.0, false);
      nativeAndroidBridge.triggerHaptic(30);
      return;
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMute();
      return;
    }

    if (delta !== 0) {
      e.preventDefault();
      const current = isMuted ? 0 : volume;
      const nextVol = Math.max(0, Math.min(1.0, Number((current + delta).toFixed(2))));
      onChange(nextVol, nextVol === 0);
      nativeAndroidBridge.triggerHaptic(15);
    }
  };

  // Mute / Unmute Toggle
  const toggleMute = () => {
    if (isMuted || volume === 0) {
      // Unmute: restore last non-zero volume or 0.75
      const restoreVol = lastNonZeroVolume > 0 ? lastNonZeroVolume : 0.75;
      onChange(restoreVol, false);
      soundEffects.playSuccess();
      nativeAndroidBridge.triggerHaptic(25);
    } else {
      // Mute
      onChange(volume, true);
      soundEffects.playTap();
      nativeAndroidBridge.triggerHaptic(35);
    }
  };

  // Stepper increment/decrement
  const stepVolume = (amount: number) => {
    const current = isMuted ? 0 : volume;
    const nextVol = Math.max(0, Math.min(1.0, Number((current + amount).toFixed(2))));
    const newMuted = nextVol === 0;
    onChange(nextVol, newMuted);
    soundEffects.playTap();
    nativeAndroidBridge.triggerHaptic(20);
  };

  // Set explicit preset
  const applyPreset = (presetVal: number) => {
    const isZero = presetVal === 0;
    onChange(presetVal, isZero);
    soundEffects.playTap();
    nativeAndroidBridge.triggerHaptic(25);
  };

  // =========================================================================
  // COMPACT VARIANT: Sleek HUD Pill / Slider for Home & Top Bar
  // =========================================================================
  if (variant === 'compact' || variant === 'pill') {
    return (
      <div className={`flex items-center gap-3 p-2.5 rounded-2xl glass-panel border-cyan-500/20 bg-slate-950/70 shadow-lg ${className}`}>
        {/* Mute/Icon Button */}
        <button
          onClick={toggleMute}
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            isMuted
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20'
          }`}
          title={isMuted ? 'Unmute Assistant' : 'Mute Assistant'}
          aria-label={isMuted ? 'Unmute Assistant' : 'Mute Assistant'}
        >
          {renderSpeakerIcon('sm')}
        </button>

        {/* Horizontal Mini Draggable Bar */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-white/80">Volume</span>
            <span className={`font-mono font-bold ${descriptor.color}`}>
              {currentPercentage}% ({descriptor.label})
            </span>
          </div>
          <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-75"
              style={{ width: `${currentPercentage}%` }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effectiveVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChange(val, val === 0);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Assistant Voice Volume"
            />
          </div>
        </div>

        {/* Quick Steppers */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => stepVolume(-0.1)}
            disabled={effectiveVolume <= 0}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Decrease volume"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => stepVolume(0.1)}
            disabled={effectiveVolume >= 1.0}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Increase volume"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LARGE VARIANT: Modern Smartphone Control Center Vertical Slider
  // =========================================================================
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header Card with Dynamic Indicator */}
      <div className="p-5 rounded-3xl glass-panel border-cyan-500/20 bg-slate-950/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Assistant Voice Volume</h3>
                <p className="text-[11px] text-white/50">
                  Real-time audio gain for speech synthesis and sound effects
                </p>
              </div>
            </div>
          </div>

          {/* Qualitative Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${descriptor.badge}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            <span>{descriptor.label}</span>
          </div>
        </div>

        {/* Central Stage: Large Vertical Control Center Cylinder */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-2">
          {/* Left Column / Main Vertical Slider Pillar */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center">
            <div className="relative flex flex-col items-center">
              {/* Floating Live Percent Tag above slider while dragging */}
              <div
                className={`transition-all duration-200 mb-2 px-3 py-1 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,242,255,0.3)] flex items-center gap-1.5 ${
                  isDragging ? 'scale-110 opacity-100' : 'opacity-80 scale-100'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{currentPercentage}% Volume</span>
              </div>

              {/* Futuristic Vertical Slider Track (Control Center Pillar) */}
              <div
                ref={sliderTrackRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="slider"
                aria-label="Assistant Volume Slider"
                aria-valuenow={currentPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${currentPercentage}% - ${descriptor.label}`}
                className={`relative w-24 h-64 sm:w-28 sm:h-72 rounded-[32px] p-2 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 transition-all cursor-ns-resize select-none touch-none flex flex-col justify-end overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-400/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)] ${
                  isDragging
                    ? 'border-cyan-400 ring-4 ring-cyan-500/20 shadow-[0_0_30px_rgba(0,242,255,0.35)]'
                    : isMuted
                    ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : 'border-white/15 hover:border-cyan-500/40'
                }`}
              >
                {/* Background Grid / Level Marker Tick Lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-6 px-3 pointer-events-none opacity-20 z-0">
                  {[100, 75, 50, 25, 0].map((level) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="w-2 h-[1px] bg-white" />
                      <span className="text-[9px] font-mono text-white/80">{level}%</span>
                      <span className="w-2 h-[1px] bg-white" />
                    </div>
                  ))}
                </div>

                {/* Fluid Liquid Neon Volume Fill Level */}
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-[28px] transition-all duration-75 ease-out z-10 flex flex-col justify-between p-3 overflow-hidden ${
                    isMuted
                      ? 'bg-gradient-to-t from-rose-600/40 via-rose-500/20 to-transparent'
                      : 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-blue-400 shadow-[0_0_25px_rgba(0,242,255,0.5)]'
                  }`}
                  style={{
                    height: `${Math.max(8, currentPercentage)}%`,
                  }}
                >
                  {/* Fluid Surface Shimmer Glow */}
                  <div className="w-full h-2 bg-white/40 blur-[2px] rounded-full shrink-0 animate-pulse" />

                  {/* Reactive Soundwave visualizer bars inside liquid */}
                  {currentPercentage > 15 && !isMuted && (
                    <div className="flex items-center justify-center gap-1 my-auto opacity-75">
                      <div className="w-1 h-3 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-5 bg-white/90 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-7 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      <div className="w-1 h-5 bg-white/90 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                      <div className="w-1 h-3 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
                    </div>
                  )}

                  <div />
                </div>

                {/* Bottom Icon Anchor inside Pillar */}
                <div className="relative z-20 w-full flex flex-col items-center justify-center pb-2 pointer-events-none">
                  <div className="p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
                    {renderSpeakerIcon('lg')}
                  </div>
                  <span className="font-mono font-extrabold text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1.5">
                    {currentPercentage}%
                  </span>
                </div>
              </div>

              {/* Drag instruction helper */}
              <span className="text-[10px] text-white/40 mt-2 font-medium tracking-wide">
                Drag vertically or tap to set
              </span>
            </div>
          </div>

          {/* Right Column: Controls, Steppers, Mute & Presets */}
          <div className="sm:col-span-7 space-y-4">
            {/* Quick Actions Row: Mute Toggle + Steppers */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="text-xs font-bold text-white/80 flex items-center justify-between">
                <span>Quick Adjustment</span>
                <span className="text-[10px] font-mono text-cyan-400">Step: ±10%</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mute/Unmute Primary Button */}
                <button
                  onClick={toggleMute}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border shadow-sm ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'Unmute Assistant' : 'Mute Assistant'}</span>
                </button>

                {/* Decrease Button */}
                {showSteppers && (
                  <button
                    onClick={() => stepVolume(-0.1)}
                    disabled={effectiveVolume <= 0}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 transition-all flex items-center justify-center"
                    title="Decrease Volume (-10%)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}

                {/* Increase Button */}
                {showSteppers && (
                  <button
                    onClick={() => stepVolume(0.1)}
                    disabled={effectiveVolume >= 1.0}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 transition-all flex items-center justify-center"
                    title="Increase Volume (+10%)"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Presets Grid */}
            {showPresets && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">
                  Volume Presets
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: 'Mute', pct: 0, sub: '0%' },
                    { label: 'Quiet', pct: 20, sub: '20%' },
                    { label: 'Medium', pct: 50, sub: '50%' },
                    { label: 'High', pct: 80, sub: '80%' },
                    { label: 'Max', pct: 100, sub: '100%' },
                  ].map((preset) => {
                    const isSelected =
                      (preset.pct === 0 && (isMuted || effectiveVolume === 0)) ||
                      (!isMuted && Math.abs(currentPercentage - preset.pct) <= 2);

                    return (
                      <button
                        key={preset.pct}
                        onClick={() => applyPreset(preset.pct / 100)}
                        className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,242,255,0.3)] ring-1 ring-cyan-400/50'
                            : 'glass-panel border-white/10 text-white/70 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="text-[11px] font-bold leading-none">{preset.label}</span>
                        <span className="text-[9px] font-mono text-white/50 mt-1">{preset.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Test Voice / Speech Playback Button */}
            {showTestButton && onTestVoice && (
              <div className="pt-1">
                {isSpeaking ? (
                  <button
                    onClick={onStopSpeaking}
                    className="w-full py-2.5 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(244,63,94,0.25)] animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Speech Playback</span>
                  </button>
                ) : (
                  <button
                    onClick={onTestVoice}
                    className="w-full py-2.5 px-4 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(0,242,255,0.2)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Assistant Speech & Audio Level</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEPARATE PLATFORM CONTROL: ASSISTANT VOLUME vs SYSTEM/DEVICE VOLUME */}
      {/* ========================================================================= */}
      {showSystemVolumeNotice && (
        <div className="p-4 rounded-3xl glass-panel border-white/10 bg-slate-950/60 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">System / Device Master Volume</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Platform Notice
                  </span>
                </div>
                {/* MANDATORY PLATFORM LIMITATION STATEMENT */}
                <p className="text-xs text-amber-200/90 font-medium mt-1 leading-relaxed">
                  Assistant volume is available. System volume control requires the Android version of the app.
                </p>
                <p className="text-[11px] text-white/50 mt-1">
                  The slider above controls the assistant’s internal speech synthesizer and audio effects within the web sandbox. Physical phone hardware master audio streams are governed by Android OS policies.
                </p>
              </div>
            </div>

            {/* Architecture Details Toggle */}
            <button
              onClick={() => setShowAndroidDetails(!showAndroidDetails)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all shrink-0"
              title="Toggle Native Android Architecture Details"
            >
              {showAndroidDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Native Android Architecture Details */}
          {showAndroidDetails && (
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Native Android Integration Architecture</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                In the native Android build, AniVox binds to the Android <code className="text-cyan-300">AudioManager</code> to adjust <code className="text-cyan-300">STREAM_MUSIC</code>, <code className="text-cyan-300">STREAM_VOICE_CALL</code>, and <code className="text-cyan-300">STREAM_NOTIFICATION</code>.
              </p>
              <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-[10px] text-cyan-200/90 overflow-x-auto space-y-1">
                <div className="text-white/40">// Kotlin Native Android Bridge Example</div>
                <div>val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager</div>
                <div>audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, AudioManager.FLAG_SHOW_UI)</div>
                <div className="text-emerald-400/80 mt-1">// Permission: &lt;uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" /&gt;</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
