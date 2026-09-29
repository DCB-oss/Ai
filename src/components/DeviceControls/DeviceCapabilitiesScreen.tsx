import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Mic,
  Bell,
  Layers,
  Volume2,
  Sliders,
  Sparkles,
  Lock,
  Cpu,
  RefreshCw,
  ArrowRight,
  Info,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { AppScreen } from '../../types/assistant';
import { soundEffects } from '../../services/soundEffects';

interface DeviceCapabilitiesScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onOpenMicModal: () => void;
  onRequestDisplayOverlay?: () => void;
}

export const DeviceCapabilitiesScreen: React.FC<DeviceCapabilitiesScreenProps> = ({
  onNavigate,
  onOpenMicModal,
}) => {
  const [micState, setMicState] = useState<'granted' | 'prompt' | 'denied' | 'unsupported'>('prompt');
  const [notifState, setNotifState] = useState<'granted' | 'default' | 'denied' | 'unsupported'>('default');
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState<boolean>(true);
  const [voicesCount, setVoicesCount] = useState<number>(0);
  const [isAndroidUserAgent, setIsAndroidUserAgent] = useState<boolean>(false);
  const [isNativeBridgeDetected, setIsNativeBridgeDetected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const detectCapabilities = () => {
    setIsRefreshing(true);

    // 1. Detect Microphone Permission via Permissions API
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((perm) => {
          setMicState(perm.state as any);
        })
        .catch(() => {
          setMicState('prompt');
        });
    }

    // 2. Detect Notifications Permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifState(Notification.permission as any);
    } else {
      setNotifState('unsupported');
    }

    // 3. Detect Web Speech Synthesis & Count actual available platform voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesisAvailable(true);
      const v = window.speechSynthesis.getVoices();
      setVoicesCount(v.length);
    } else {
      setSpeechSynthesisAvailable(false);
      setVoicesCount(0);
    }

    // 4. Detect Environment
    if (typeof navigator !== 'undefined') {
      setIsAndroidUserAgent(/Android/i.test(navigator.userAgent));
    }
    if (typeof window !== 'undefined') {
      setIsNativeBridgeDetected(Boolean((window as any).AniVoxAndroidBridge || (window as any).AuraAndroidBridge || (window as any).Android));
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  useEffect(() => {
    detectCapabilities();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        const v = window.speechSynthesis.getVoices();
        setVoicesCount(v.length);
      };
    }
  }, []);

  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setNotifState(result as any);
        soundEffects.playSuccess();
      } catch (err) {
        console.warn('Notification permission request error:', err);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] px-4 py-4 max-w-4xl mx-auto w-full space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider uppercase text-white">
                Device Capabilities & Permissions
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                DIAGNOSTIC STATUS
              </span>
            </div>
            <p className="text-xs text-white/50">
              Live hardware introspection, sandbox permissions, and Native Android architecture status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={detectCapabilities}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl glass-panel hover:bg-white/10 text-white/80 border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Re-Check</span>
          </button>

          <button
            onClick={() => onNavigate('device-controls')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,242,255,0.2)]"
          >
            <span>Device Controls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION 1: EXECUTION RUNTIME & HOST INTROSPECTION */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Current Execution Environment</span>
          </div>
          <span className="text-[10px] font-mono text-white/40">
            Introspection ID: {navigator.userAgent.slice(0, 30)}...
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-[10px] font-mono uppercase text-white/40">Host Platform</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isAndroidUserAgent ? 'Android Browser / WebView' : 'Desktop / Web Platform'}</span>
            </div>
            <div className="text-[10px] text-white/50">
              {isAndroidUserAgent ? 'Mobile Web Sandbox' : 'Standard Web Environment'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-[10px] font-mono uppercase text-white/40">Native Bridge State</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {isNativeBridgeDetected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300">Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-300">Web Sandbox (Unbridged)</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-white/50">
              {isNativeBridgeDetected
                ? 'AniVox Companion App Bridge Active'
                : 'Isolated in Browser Security Boundary'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-[10px] font-mono uppercase text-white/40">Synthesizer Voices</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-300 font-mono">{voicesCount}</span>
              <span className="text-xs text-white/70">Voices Detected</span>
            </div>
            <div className="text-[10px] text-white/50">
              {speechSynthesisAvailable ? 'Local OS Speech Engine Ready' : 'Speech Engine Unavailable'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WEB BROWSER PERMISSIONS & HARDWARE ACCESS */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Web Platform Permissions</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            USER CONTROLLED
          </span>
        </div>

        <div className="space-y-3">
          {/* Microphone */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30 shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Microphone & Speech Recognition</span>
                  {micState === 'granted' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                      ACTIVE & GRANTED
                    </span>
                  ) : micState === 'denied' ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/30">
                      BLOCKED / DENIED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                      REQUIRES PROMPT
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Allows AniVox to convert spoken voice commands into text. Never records secretly; status indicator lights during use.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenMicModal}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold whitespace-nowrap transition-all self-start sm:self-center shadow-[0_0_10px_rgba(0,242,255,0.15)]"
            >
              {micState === 'granted' ? 'Manage Permission' : 'Request Permission'}
            </button>
          </div>

          {/* Notifications */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">System Notifications & Timer Alarms</span>
                  {notifState === 'granted' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                      GRANTED
                    </span>
                  ) : notifState === 'denied' ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/30">
                      BLOCKED / DENIED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                      REQUIRES PROMPT
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Sends proactive alerts when focus timers expire or when background scheduled tasks complete.
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestNotification}
              disabled={notifState === 'granted'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all self-start sm:self-center ${
                notifState === 'granted'
                  ? 'bg-emerald-500/10 text-emerald-300/80 border border-emerald-500/20 cursor-default'
                  : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              }`}
            >
              {notifState === 'granted' ? 'Enabled' : 'Enable Notifications'}
            </button>
          </div>

          {/* Display Over Other Apps */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Display Over Other Apps (Overlay Permission)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                    REQUIRES ANDROID PERMISSION
                  </span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Allows drawing a small floating assistant orb over other applications on Android.
                </p>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-white/50 space-y-1">
                  <div><strong>Status:</strong> Requires native Android permission (<code>android.permission.SYSTEM_ALERT_WINDOW</code>).</div>
                  <div><strong>Web Sandbox Note:</strong> Standard web browsers cannot draw over external native applications. An in-app floating orb preview is provided within this web application.</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('device-controls')}
              className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold whitespace-nowrap transition-all self-start sm:self-center shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            >
              View Overlay Architecture →
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: REQUIRES NATIVE ANDROID APPLICATION */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Requires Native Android Companion App</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
            OS LEVEL BRIDGES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* System-Wide Volume */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>System-Wide Master Hardware Volume</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Adjusts physical phone speaker hardware output (ringtone, system, media). Requires Android <code>AudioManager.setStreamVolume()</code>.
            </p>
          </div>

          {/* Full Overlay Service */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Full OS-Wide Overlay Service</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Runs an Android <code>ForegroundService</code> attaching a movable Floating Assistant Window via <code>WindowManager</code>.
            </p>
          </div>

          {/* Low-Power DSP Wake-Word */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Low-Power Background Wake-Word</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Always-on wake-word detection when screen is turned off using hardware DSP chips without draining battery. Requires <code>VoiceInteractionService</code>.
            </p>
          </div>

          {/* Protected Hardware Device Controls */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Protected Hardware Radios (Wi-Fi / BT)</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Directly toggling hardware radios or screen backlight requires Android <code>Settings.System</code> & <code>WifiManager</code> intents.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: UNAVAILABLE & SECURITY BOUNDARIES */}
      <div className="p-5 rounded-3xl glass-panel border-rose-500/20 bg-rose-950/10 space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
          <Lock className="w-4 h-4 text-rose-400" />
          <span>Security & OS Privacy Boundaries (Strictly Prohibited)</span>
        </div>

        <div className="space-y-2.5 text-[11px] text-white/70">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <div>
              <strong className="text-white">Covert / Silent Microphone Recording:</strong>
              <p className="text-white/50 mt-0.5">
                AniVox will never record audio secretly in the background. The glowing visualizer HUD and status bar illuminate whenever listening.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <div>
              <strong className="text-white">Screen Snooping & Password Harvesting:</strong>
              <p className="text-white/50 mt-0.5">
                The overlay service does not capture screenshots, record passwords, or inspect private contents of other open applications.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <div>
              <strong className="text-white">Arbitrary Code Execution / OS Lock Bypass:</strong>
              <p className="text-white/50 mt-0.5">
                Voice alone is not a sole biometric bypass for device root encryption or system passcode removal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
