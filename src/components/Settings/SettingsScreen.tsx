import React, { useState } from 'react';
import {
  Settings,
  Mic,
  Volume2,
  VolumeX,
  Brain,
  Cpu,
  Sliders,
  RotateCcw,
  Sparkles,
  Shield,
  Radio,
  Play,
  Square,
  Smartphone,
  Lock,
  Sun,
  Moon,
  Zap,
  Layers,
  Activity,
  CheckCircle2,
  Info,
  ExternalLink,
  User,
  Music,
  Youtube,
  CloudSun,
} from 'lucide-react';
import { AssistantSettings, AppScreen, VoxPermissionsMap } from '../../types/assistant';
import {
  VOICE_PERSONALITIES,
  VoicePersonality,
  SUPPORTED_VOICE_PROVIDERS,
} from '../../services/voiceControls';
import { soundEffects } from '../../services/soundEffects';
import { VolumeControlSlider } from '../VolumeControl/VolumeControlSlider';
import { AmbientVoxVisualizer } from '../Orb/AmbientVoxVisualizer';
import { PhoneAssistantSettingsSection } from '../Phone/PhoneAssistantSettingsSection';
import { VoxPermissionsDashboard } from './VoxPermissionsDashboard';
import { VoicePersonalitySelector } from './VoicePersonalitySelector';
import { MicrophoneInputSettings } from './MicrophoneInputSettings';
import { AboutAniVoxSection } from './AboutAniVoxSection';
import { AudioInputDeviceInfo } from '../../hooks/useVoiceEngine';

interface SettingsScreenProps {
  settings: AssistantSettings;
  voices: SpeechSynthesisVoice[];
  isAiConnected: boolean;
  modelName: string;
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
  onNavigate: (screen: AppScreen) => void;
  onOpenMicModal: () => void;
  onOpenVoiceLockModal: () => void;
  onTestVoice: (previewText?: string) => void;
  onStopSpeaking: () => void;
  isSpeaking?: boolean;
  onResetDefaults: () => void;
  onClearAllData: () => void;
  initialTab?: 'permissions' | 'voice' | 'general' | 'phone' | 'security' | 'about';
  initialAboutSubTab?: 'founders' | 'team' | 'links' | 'install';
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
  onRequestMicPermission?: () => Promise<boolean>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  voices,
  isAiConnected,
  modelName,
  onUpdateSettings,
  onNavigate,
  onOpenMicModal,
  onOpenVoiceLockModal,
  onTestVoice,
  onStopSpeaking,
  isSpeaking = false,
  onResetDefaults,
  onClearAllData,
  initialTab = 'permissions',
  initialAboutSubTab = 'founders',
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
  onRequestMicPermission,
}) => {
  const [activeTab, setActiveTab] = useState<'permissions' | 'voice' | 'general' | 'phone' | 'security' | 'about'>(initialTab);
  const [voiceSubTab, setVoiceSubTab] = useState<'microphone' | 'personality'>('microphone');
  const [aboutSubTab, setAboutSubTab] = useState<'founders' | 'team' | 'links' | 'install'>(initialAboutSubTab);

  // Vox Permissions map derived from assistant settings
  const permissions: VoxPermissionsMap = {
    contacts_calling: settings.contactsCallingEnabled ?? true,
    microphone: settings.microphoneAccessEnabled ?? true,
    voice_assistant: settings.voiceAssistantEnabled ?? true,
    media_control: settings.mediaControlEnabled ?? true,
    audiomack_integration: settings.audiomackIntegrationEnabled ?? true,
    notifications: settings.notificationsEnabled ?? true,
    device_information: settings.deviceInfoAccessEnabled ?? true,
    weather: settings.weatherAccessEnabled ?? true,
    location: settings.locationAccessEnabled ?? false, // Defaults to off for privacy
    voice_commands: settings.universalVoiceCommandsEnabled ?? true,
    device_actions: settings.safeDeviceActionsEnabled ?? false,
    overlay_display: settings.displayOverOtherAppsRequested ?? false,
    memory: settings.memoryEnabled ?? true,
    camera_emotion: settings.cameraEmotionEnabled ?? false,
  };

  const handleTogglePermission = (key: keyof VoxPermissionsMap, value: boolean) => {
    switch (key) {
      case 'contacts_calling':
        onUpdateSettings({ contactsCallingEnabled: value });
        break;
      case 'microphone':
        onUpdateSettings({ microphoneAccessEnabled: value });
        break;
      case 'voice_assistant':
        onUpdateSettings({ voiceAssistantEnabled: value, voiceResponsesEnabled: value });
        break;
      case 'media_control':
        onUpdateSettings({ mediaControlEnabled: value });
        break;
      case 'audiomack_integration':
        onUpdateSettings({ audiomackIntegrationEnabled: value });
        break;
      case 'notifications':
        onUpdateSettings({ notificationsEnabled: value });
        break;
      case 'device_information':
        onUpdateSettings({ deviceInfoAccessEnabled: value });
        break;
      case 'weather':
        onUpdateSettings({ weatherAccessEnabled: value });
        break;
      case 'location':
        onUpdateSettings({ locationAccessEnabled: value });
        break;
      case 'voice_commands':
        onUpdateSettings({ universalVoiceCommandsEnabled: value });
        break;
      case 'device_actions':
        onUpdateSettings({ safeDeviceActionsEnabled: value });
        break;
      case 'overlay_display':
        onUpdateSettings({ displayOverOtherAppsRequested: value, floatingOrbEnabled: value });
        break;
      case 'memory':
        onUpdateSettings({ memoryEnabled: value });
        break;
      case 'camera_emotion':
        onUpdateSettings({ cameraEmotionEnabled: value });
        break;
    }
  };

  const handleEnableAllSafe = () => {
    onUpdateSettings({
      contactsCallingEnabled: true,
      microphoneAccessEnabled: true,
      voiceAssistantEnabled: true,
      voiceResponsesEnabled: true,
      mediaControlEnabled: true,
      audiomackIntegrationEnabled: true,
      notificationsEnabled: true,
      deviceInfoAccessEnabled: true,
      weatherAccessEnabled: true,
      universalVoiceCommandsEnabled: true,
      safeDeviceActionsEnabled: true,
      memoryEnabled: true,
    });
    soundEffects.playSuccess();
  };

  const handleDisableAll = () => {
    onUpdateSettings({
      contactsCallingEnabled: false,
      microphoneAccessEnabled: false,
      voiceAssistantEnabled: false,
      voiceResponsesEnabled: false,
      mediaControlEnabled: false,
      audiomackIntegrationEnabled: false,
      notificationsEnabled: false,
      deviceInfoAccessEnabled: false,
      weatherAccessEnabled: false,
      locationAccessEnabled: false,
      universalVoiceCommandsEnabled: false,
      safeDeviceActionsEnabled: false,
      displayOverOtherAppsRequested: false,
      floatingOrbEnabled: false,
      memoryEnabled: false,
      cameraEmotionEnabled: false,
    });
    soundEffects.playWarning();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] px-4 py-4 max-w-4xl mx-auto w-full space-y-6 pb-24">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase text-white">
              Vox Control Center & Settings
            </h1>
            <p className="text-xs text-white/50">
              Configure granular permission toggles, male voice profiles, audio levels, and companion capabilities.
            </p>
          </div>
        </div>

        {/* Quick Diagnostics & Capabilities Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('device-capabilities')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Capability Status</span>
          </button>

          <button
            onClick={() => onNavigate('device-controls')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,242,255,0.2)]"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device Sensors</span>
          </button>
        </div>
      </div>

      {/* Primary Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
        <button
          onClick={() => {
            setActiveTab('permissions');
            soundEffects.playTap();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'permissions'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Permissions & Features</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('voice');
            soundEffects.playTap();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'voice'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice & Personalities</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('phone');
            soundEffects.playTap();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'phone'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Phone & Calling</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('general');
            soundEffects.playTap();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'general'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Audio & Appearance</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('security');
            soundEffects.playTap();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security & Voice Lock</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('about');
            soundEffects.playTap();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'about'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>About AniVox</span>
        </button>
      </div>

      {/* TAB 1: PERMISSIONS & FEATURES (USER SPECIFIED SWITCHES) */}
      {activeTab === 'permissions' && (
        <VoxPermissionsDashboard
          permissions={permissions}
          onTogglePermission={handleTogglePermission}
          onEnableAllSafe={handleEnableAllSafe}
          onDisableAll={handleDisableAll}
        />
      )}

      {/* TAB 2: VOICE & MICROPHONE CONTROLS */}
      {activeTab === 'voice' && (
        <div className="space-y-5 animate-fade-in">
          {/* Subtabs for Voice Hub */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/40 border border-white/10 w-fit">
            <button
              onClick={() => {
                soundEffects.playTap();
                setVoiceSubTab('microphone');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                voiceSubTab === 'microphone'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Microphone & Speech Input</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playTap();
                setVoiceSubTab('personality');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                voiceSubTab === 'personality'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Output & Personality</span>
            </button>
          </div>

          {voiceSubTab === 'microphone' ? (
            <MicrophoneInputSettings
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              availableMicrophones={availableMicrophones}
              onRefreshDevices={onRefreshDevices}
              onTestMicStart={onTestMicStart}
              onTestMicStop={onTestMicStop}
              isTestingMic={isTestingMic}
              audioLevel={audioLevel}
              decibels={decibels}
              waveformBars={waveformBars}
              micDiagnosticInfo={micDiagnosticInfo}
              micPermission={micPermission}
              onRequestPermission={onRequestMicPermission}
            />
          ) : (
            <VoicePersonalitySelector
              settings={settings}
              voices={voices}
              onUpdateSettings={onUpdateSettings}
              onTestVoice={onTestVoice}
              onStopSpeaking={onStopSpeaking}
              isSpeaking={isSpeaking}
            />
          )}
        </div>
      )}

      {/* TAB 3: PHONE & CALLING CONFIGURATION */}
      {activeTab === 'phone' && (
        <PhoneAssistantSettingsSection
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onNavigate={onNavigate}
        />
      )}

      {/* TAB 4: GENERAL AUDIO, THEMES, AND VISUALS */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Assistant Volume Control */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-black tracking-widest uppercase text-white">
                Assistant Speech & Playback Volume
              </h3>
            </div>

            <VolumeControlSlider
              volume={settings.assistantVolume ?? 1.0}
              isMuted={Boolean(settings.isMuted)}
              onChange={(newVol, newMuted) =>
                onUpdateSettings({
                  assistantVolume: newVol,
                  voiceVolume: newVol,
                  isMuted: newMuted,
                })
              }
              onTestVoice={() => onTestVoice('Testing assistant volume output.')}
              onStopSpeaking={onStopSpeaking}
              isSpeaking={isSpeaking}
            />
          </div>

          {/* Theme & Display Options */}
          <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
            <h3 className="text-xs font-black tracking-widest uppercase text-white">
              Interface Atmosphere & Typography
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'dark', label: 'Obsidian Dark', icon: Moon, desc: 'Deep cyber black' },
                { id: 'light', label: 'Daylight Clean', icon: Sun, desc: 'High contrast light' },
                { id: 'cyberpunk', label: 'Neon Cyberpunk', icon: Zap, desc: 'Vibrant matrix glow' },
              ].map((themeOpt) => {
                const Icon = themeOpt.icon;
                const isSel = settings.theme === themeOpt.id;
                return (
                  <button
                    key={themeOpt.id}
                    onClick={() => {
                      onUpdateSettings({ theme: themeOpt.id as any });
                      soundEffects.playTap();
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      isSel
                        ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_20px_rgba(0,242,255,0.2)]'
                        : 'bg-black/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 ${isSel ? 'text-cyan-400' : 'text-white/40'}`} />
                    <div>
                      <p className="text-xs font-bold text-white">{themeOpt.label}</p>
                      <p className="text-[11px] text-white/50">{themeOpt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & VOICE LOCK */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl glass-panel border-cyan-500/30 space-y-4 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Voice Access & Security Lock</h3>
                <p className="text-xs text-white/50">
                  Protect sensitive assistant memory, calls, and device tools with a voice passphrase or numeric PIN.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
              <div>
                <p className="text-sm font-bold text-white">Voice Security Lock</p>
                <p className="text-xs text-white/50">
                  Requires phrase "{settings.voiceTriggerPhrase || 'Hey Vox'}" or PIN to unlock assistant.
                </p>
              </div>
              <button
                onClick={onOpenVoiceLockModal}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-[0_0_15px_rgba(0,242,255,0.4)]"
              >
                Configure Lock
              </button>
            </div>
          </div>

          {/* Reset All Settings */}
          <div className="p-5 rounded-3xl glass-panel border-rose-500/30 space-y-3">
            <h3 className="text-xs font-black tracking-widest uppercase text-rose-400">
              Danger Zone
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-white/60">
                Reset all configuration settings or wipe local assistant data.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onResetDefaults}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold"
                >
                  Reset Settings
                </button>
                <button
                  onClick={onClearAllData}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold"
                >
                  Wipe All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ABOUT ANIVOX (FOUNDERS, JOIN THE TEAM, VERIFIED LINKS, APP INSTALL) */}
      {activeTab === 'about' && (
        <AboutAniVoxSection
          initialSubTab={aboutSubTab}
          onNavigateTab={(st) => setAboutSubTab(st as any)}
        />
      )}
    </div>
  );
};
