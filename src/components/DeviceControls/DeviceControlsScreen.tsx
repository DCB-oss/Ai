import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  VolumeX,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Radio,
  Wifi,
  Bluetooth,
  Eye,
  Type,
  Bell,
  Fingerprint,
  Mic,
  ArrowRight,
  Info,
  Terminal,
  Activity,
  Layers,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { AssistantSettings, AppScreen } from '../../types/assistant';
import { DEVICE_CAPABILITIES, nativeAndroidBridge, DeviceCapability } from '../../services/nativeAndroidBridge';
import { soundEffects } from '../../services/soundEffects';
import { VolumeControlSlider } from '../VolumeControl/VolumeControlSlider';

interface DeviceControlsScreenProps {
  settings: AssistantSettings;
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
  onOpenMicModal: () => void;
  onOpenVoiceLockModal: () => void;
  onExecuteCommand: (prompt: string) => void;
  onLockApp: () => void;
  onNavigate?: (screen: AppScreen) => void;
}

export const DeviceControlsScreen: React.FC<DeviceControlsScreenProps> = ({
  settings,
  onUpdateSettings,
  onOpenMicModal,
  onOpenVoiceLockModal,
  onExecuteCommand,
  onLockApp,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'overlay' | 'native_android' | 'security' | 'cheatsheet'>('available');
  const [simulatedSystemVol, setSimulatedSystemVol] = useState(75);
  const [simulatedBrightness, setSimulatedBrightness] = useState(80);
  const [nativeNotice, setNativeNotice] = useState<string | null>(null);

  const bridgeState = nativeAndroidBridge.getState();

  const handleSimulateNativeAction = (capabilityId: string, paramVal?: any) => {
    const result = nativeAndroidBridge.executeDeviceAction(capabilityId, { value: paramVal });
    setNativeNotice(result.explanation);
    soundEffects.playTap();
    setTimeout(() => setNativeNotice(null), 7000);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] px-4 py-4 max-w-4xl mx-auto w-full space-y-5 pb-20">
      {/* Top Header */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)]">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider uppercase text-white">
                Device Capability Center
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                {bridgeState.platform.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-white/50">
              Control application settings, adjust volume, and view Native Android bridge capabilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('device-capabilities')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Status</span>
            </button>
          )}

          {/* Lock Assistant Quick Button */}
          <button
            onClick={onLockApp}
            className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(99,102,241,0.2)]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock App</span>
          </button>
        </div>
      </div>

      {/* Notice Banner if triggered */}
      {nativeNotice && (
        <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-start gap-3 animate-fade-in shadow-[0_0_20px_rgba(0,242,255,0.2)]">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block font-bold">Architecture Notice:</strong>
            <p className="text-[11px] leading-relaxed text-cyan-100/90">{nativeNotice}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl glass-panel border-white/10 p-1 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'available'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Available In App</span>
        </button>

        <button
          onClick={() => setActiveTab('overlay')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'overlay'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Display Over Apps</span>
        </button>

        <button
          onClick={() => setActiveTab('native_android')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'native_android'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Requires Native Android</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Security & OS Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'cheatsheet'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>Voice Commands</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AVAILABLE IN WEB APP (LIVE CONTROLS) */}
      {/* ========================================================================= */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Modern Smartphone Control Center Volume Slider */}
          <VolumeControlSlider
            volume={settings.assistantVolume ?? 1.0}
            isMuted={Boolean(settings.isMuted)}
            onChange={(newVol, newMuted) => {
              onUpdateSettings({
                assistantVolume: newVol,
                voiceVolume: newVol,
                isMuted: newMuted,
              });
            }}
            variant="large"
            showSystemVolumeNotice={true}
            showPresets={true}
            showSteppers={true}
            showTestButton={false}
          />

          {/* Theme & Visual Presentation */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Theme & Interface Styling</span>
            </div>

            {/* Theme Grid */}
            <div>
              <span className="block text-xs font-semibold text-white/70 mb-2">Color Atmosphere</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark', label: 'Dark OLED', icon: Moon },
                  { id: 'light', label: 'Crisp Light', icon: Sun },
                  { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: Zap },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = (settings.theme || 'dark') === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onUpdateSettings({ theme: t.id as any });
                        soundEffects.playTap();
                      }}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                          : 'glass-panel border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-300' : 'text-white/40'}`} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Scale */}
            <div>
              <span className="block text-xs font-semibold text-white/70 mb-2">Interface Font Size</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact', label: 'Compact', desc: 'Dense data' },
                  { id: 'normal', label: 'Standard', desc: 'Balanced' },
                  { id: 'large', label: 'Large Font', desc: 'High readability' },
                ].map((fs) => {
                  const isSelected = (settings.fontSize || 'normal') === fs.id;
                  return (
                    <button
                      key={fs.id}
                      onClick={() => {
                        onUpdateSettings({ fontSize: fs.id as any });
                        soundEffects.playTap();
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
                          : 'glass-panel border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <div>{fs.label}</div>
                      <div className="text-[10px] text-white/40">{fs.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orb Speed & Glow Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-white/80 mb-1.5">
                  <span>Orb Animation Speed</span>
                  <span className="font-mono text-cyan-400">{(settings.orbSpeed ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.orbSpeed ?? 1.0}
                  onChange={(e) => onUpdateSettings({ orbSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>Slow (0.5x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Fast (2.0x)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-white/80 mb-1.5">
                  <span>Orb Glow Intensity</span>
                  <span className="font-mono text-cyan-400">{(settings.orbGlowIntensity ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.orbGlowIntensity ?? 1.0}
                  onChange={(e) => onUpdateSettings({ orbGlowIntensity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>Subtle</span>
                  <span>Balanced</span>
                  <span>Vibrant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick System Toggles */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Core Application Switches</span>
            </div>

            <div className="space-y-2">
              {/* Voice Responses (AutoSpeak) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border-white/10">
                <div>
                  <div className="text-xs font-bold text-white">Voice Responses (Auto-Speak)</div>
                  <div className="text-[11px] text-white/50">Speak responses aloud using the voice synthesizer engine.</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    settings.autoSpeak
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                      : 'glass-panel border-white/10 text-white/40'
                  }`}
                >
                  {settings.autoSpeak ? 'On' : 'Off'}
                </button>
              </div>

              {/* Long-Term Memory */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border-white/10">
                <div>
                  <div className="text-xs font-bold text-white">Long-Term Memory Engine</div>
                  <div className="text-[11px] text-white/50">Allow AniVox to adapt to your tastes and recall preferences.</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ memoryEnabled: !settings.memoryEnabled })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    settings.memoryEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                      : 'glass-panel border-white/10 text-white/40'
                  }`}
                >
                  {settings.memoryEnabled ? 'On' : 'Off'}
                </button>
              </div>

              {/* In-App Notifications & Sound Effects */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border-white/10">
                <div>
                  <div className="text-xs font-bold text-white">In-App Sound Effects & Notifications</div>
                  <div className="text-[11px] text-white/50">Play futuristic synthetic chimes and timer countdown alarms.</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    settings.soundEffectsEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                      : 'glass-panel border-white/10 text-white/40'
                  }`}
                >
                  {settings.soundEffectsEnabled ? 'On' : 'Off'}
                </button>
              </div>

              {/* Haptics */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border-white/10">
                <div>
                  <div className="text-xs font-bold text-white">Tactile Haptic Feedback</div>
                  <div className="text-[11px] text-white/50">Vibrate on tap and timer triggers on supported devices.</div>
                </div>
                <button
                  onClick={() => {
                    const newHaptic = !settings.hapticFeedback;
                    onUpdateSettings({ hapticFeedback: newHaptic });
                    if (newHaptic) nativeAndroidBridge.triggerHaptic(40);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    settings.hapticFeedback
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                      : 'glass-panel border-white/10 text-white/40'
                  }`}
                >
                  {settings.hapticFeedback ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DISPLAY OVER OTHER APPS (SECTION 23 & 24) */}
      {/* ========================================================================= */}
      {activeTab === 'overlay' && (
        <div className="space-y-4">
          {/* Main Overlay Setting Card */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Display Over Other Apps</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                STATUS: REQUIRES ANDROID PERMISSION
              </span>
            </div>

            {/* Clear Explanation of Permission Requirement */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Why is the Android "Display over other apps" permission needed?</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                To provide seamless one-tap access to your assistant while using other applications, Android requires the <strong>Display over other apps</strong> permission (<code>SYSTEM_ALERT_WINDOW</code>). This permission allows AniVox to draw a small floating orb over your active screen, let you speak or tap to activate assistance at any time, and quickly dismiss or hide the overlay when not needed.
              </p>
            </div>

            {/* Web Version Notice vs Native Android */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs text-white/80">
              <div className="font-bold text-cyan-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>Web Version Status & Sandbox Notice</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Full OS-wide floating over third-party applications requires the <strong>Native Android implementation</strong>. Web browser security sandboxes strictly prevent websites from rendering floating windows outside the browser tab.
              </p>
              <p className="text-[11px] text-white/60 leading-relaxed">
                However, you can enable the <strong>In-App Floating Orb</strong> right now to experience the movable assistant orb and voice overlay within this web application!
              </p>
            </div>

            {/* In-App Floating Orb Toggle & Controls */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>In-App Floating Assistant Orb</span>
                    {settings.floatingOrbEnabled && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    Movable floating orb capsule with tap-to-expand, mic toggle, and voice indicator.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newVal = !settings.floatingOrbEnabled;
                      onUpdateSettings({ floatingOrbEnabled: newVal });
                      soundEffects.playTap();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      settings.floatingOrbEnabled
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'glass-panel border-white/10 text-white/40'
                    }`}
                  >
                    {settings.floatingOrbEnabled ? 'Disable Overlay' : 'Enable Overlay'}
                  </button>
                </div>
              </div>

              {settings.floatingOrbEnabled && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200 flex items-center justify-between">
                  <span>Orb Position: (X: {settings.floatingOrbPosition?.x ?? 24}px, Y: {settings.floatingOrbPosition?.y ?? 120}px)</span>
                  <button
                    onClick={() => onUpdateSettings({ floatingOrbPosition: { x: 24, y: 120 } })}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold"
                  >
                    Reset Position
                  </button>
                </div>
              )}
            </div>

            {/* Native Android Overlay Service Architecture (Section 23 Requirements) */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>Native Android Overlay Service Architecture</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-white/70">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-white block">1. Explicit User Intent & Consent</strong>
                  <p className="text-white/50">
                    AniVox directs user to <code>Settings.ACTION_MANAGE_OVERLAY_PERMISSION</code>. Never automatically grants or bypasses the permission.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-white block">2. Small Movable Assistant Orb</strong>
                  <p className="text-white/50">
                    Touch-drag listener updates <code>WindowManager.LayoutParams (x, y)</code> smoothly on screen edges.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-white block">3. Tap Orb to Open Assistant</strong>
                  <p className="text-white/50">
                    Single tap expands bottom sheet dialog or launches main activity intent over current app.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-white block">4. Lifecycle & Battery Respect</strong>
                  <p className="text-white/50">
                    Uses Android Foreground Service notification, releases audio focus, and pauses canvas loop when screen sleeps.
                  </p>
                </div>
              </div>
            </div>

            {/* OVERLAY PRIVACY & SECURITY RULES (SECTION 24) */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
              <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Overlay Privacy Safeguards & Non-Intrusive Design</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-white/70">
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>No Screen Recording:</strong> The overlay will NOT secretly capture screenshots or record the screen.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>No Password Snooping:</strong> The overlay will NOT capture passwords or read private fields in other apps.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>No Covert Monitoring:</strong> The overlay does NOT monitor or log what other apps you use.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>No Auto-Microphone:</strong> The overlay will NEVER automatically activate the microphone without explicit user tap.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>Visual Listening Indicator:</strong> High-visibility glowing pulse and status tag always show when the assistant is listening.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REQUIRES NATIVE ANDROID APPLICATION */}
      {/* ========================================================================= */}
      {activeTab === 'native_android' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200/90 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <Smartphone className="w-4 h-4" />
              <span>Native Android Architecture Interface</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              The controls below require the companion <strong>Native Android Application (Kotlin / Android SDK)</strong> because web browser sandboxes are strictly prohibited from manipulating physical smartphone hardware directly.
            </p>
          </div>

          {/* 1. Master System Volume */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>System-Wide Master Hardware Volume</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                    REQUIRES ANDROID MODIFY_AUDIO_SETTINGS
                  </span>
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">
                  Controls smartphone physical ringtone, alarm, and system-wide media speaker volume.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-white/70">
                <span>Hardware Master Level</span>
                <span className="font-mono text-cyan-400">{simulatedSystemVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simulatedSystemVol}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSimulatedSystemVol(val);
                  handleSimulateNativeAction('system_master_volume', val);
                }}
                className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-2.5"
              />
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-white/50 font-mono">
                API: android.media.AudioManager.setStreamVolume(STREAM_MUSIC, {Math.round(simulatedSystemVol / 6.6)}, 0)
              </div>
            </div>
          </div>

          {/* 2. Screen Hardware Brightness */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Hardware Screen Display Backlight</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                    REQUIRES ANDROID WRITE_SETTINGS
                  </span>
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">
                  Adjusts physical phone LCD/OLED panel backlight level.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-white/70">
                <span>Hardware Brightness</span>
                <span className="font-mono text-cyan-400">{simulatedBrightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simulatedBrightness}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSimulatedBrightness(val);
                  handleSimulateNativeAction('screen_hardware_brightness', val);
                }}
                className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-2.5"
              />
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-white/50 font-mono">
                API: Settings.System.putInt(contentResolver, SCREEN_BRIGHTNESS, {Math.round((simulatedBrightness / 100) * 255)})
              </div>
            </div>
          </div>

          {/* 3. Hardware Connectivity Radios */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Device Radios (Wi-Fi & Bluetooth)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                REQUIRES ANDROID INTENTS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleSimulateNativeAction('device_radios')}
                className="p-3.5 rounded-2xl glass-panel-interactive border-white/10 text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Wi-Fi Settings Bridge</div>
                    <div className="text-[10px] text-white/50">Settings.ACTION_WIFI_SETTINGS</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => handleSimulateNativeAction('device_radios')}
                className="p-3.5 rounded-2xl glass-panel-interactive border-white/10 text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Bluetooth className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Bluetooth Manager Bridge</div>
                    <div className="text-[10px] text-white/50">BluetoothAdapter.enable()</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* 4. Always-on Wake-word & Biometrics */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Low-Power DSP & Biometrics</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                REQUIRES NATIVE HARDWARE
              </span>
            </div>

            <div className="space-y-2 text-xs text-white/70">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
                <Mic className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Always-On Background Wake-Word ("Hey AniVox")</div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Requires Android <code>VoiceInteractionService</code> and hardware DSP listening chip to trigger while phone is locked without draining battery.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
                <Fingerprint className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Hardware Biometrics (Fingerprint / Face Unlock)</div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Requires <code>androidx.biometric.BiometricPrompt</code> with Android Keystore hardware-backed keys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECURITY & OS PRIVACY RULES */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5" />
              <span>AniVox Security, Privacy & Consent Architecture</span>
            </div>

            <div className="space-y-3 text-xs text-white/70">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Transparent Microphone Activity</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  AniVox NEVER records audio secretly or covertly in the background. The glowing Orb visualizer and top status bar always illuminate with a high-visibility pulsing indicator whenever the microphone is receiving sound.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
                <div className="font-bold text-indigo-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>2. Voice Is Not A Sole Biometric Factor</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Voice recognition alone is not used as a standalone bypass for device encryption or sensitive data wiping. Multi-factor protection via PIN / Passcode is required for all administrative actions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                <div className="font-bold text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>3. Sandboxed Execution</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  AniVox strictly refuses arbitrary code execution or unauthenticated system root modification. All assistant operations pass through typed schemas and structured actions.
                </p>
              </div>
            </div>

            {/* Permission Center Triggers */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={onOpenMicModal}
                className="flex-1 py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                <span>Microphone Permission Center</span>
              </button>

              <button
                onClick={onOpenVoiceLockModal}
                className="flex-1 py-3 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Configure Voice Access & PIN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: VOICE COMMAND CHEATSHEET */}
      {/* ========================================================================= */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>Natural Voice & Text Commands</span>
              </div>
              <span className="text-[11px] text-white/50">Tap any command to test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { title: 'Turn dark mode on', category: 'Theme', prompt: 'Turn dark mode on.' },
                { title: 'Turn voice responses off', category: 'Voice', prompt: 'Turn voice responses off.' },
                { title: 'Set voice to energetic', category: 'Voice Personality', prompt: 'Change voice personality to energetic.' },
                { title: 'Set voice to calm', category: 'Voice Personality', prompt: 'Change voice personality to calm.' },
                { title: 'Increase voice speed', category: 'Voice', prompt: 'Increase voice speech rate.' },
                { title: 'Make the orb animation faster', category: 'Visual', prompt: 'Make the orb animation faster.' },
                { title: 'Increase text size', category: 'Visual', prompt: 'Increase text size.' },
                { title: 'Turn memory on', category: 'Memory', prompt: 'Turn memory on.' },
                { title: 'Open voice controls', category: 'Navigation', prompt: 'Open voice controls.' },
                { title: 'Show device capabilities', category: 'Diagnostics', prompt: 'Show device capabilities status.' },
                { title: 'Show overlay settings', category: 'Overlay', prompt: 'Show display over other apps settings.' },
                { title: 'Turn notifications off', category: 'Alerts', prompt: 'Turn notifications off.' },
                { title: 'Increase the assistant volume', category: 'Volume', prompt: 'Increase the assistant volume.' },
                { title: 'Lower the assistant volume', category: 'Volume', prompt: 'Lower the assistant volume.' },
                { title: 'Mute the assistant', category: 'Volume', prompt: 'Mute the assistant.' },
                { title: 'Set assistant volume to 50 percent', category: 'Volume', prompt: 'Set assistant volume to 50 percent.' },
                { title: 'Stop speaking', category: 'Voice', prompt: 'Stop speaking.' },
                { title: 'Lock the assistant', category: 'Security', prompt: 'Lock the assistant.' },
              ].map((cmd) => (
                <button
                  key={cmd.title}
                  onClick={() => onExecuteCommand(cmd.prompt)}
                  className="p-3.5 rounded-2xl glass-panel-interactive border-white/10 text-left hover:border-cyan-500/40 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      "{cmd.title}"
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">{cmd.category}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
