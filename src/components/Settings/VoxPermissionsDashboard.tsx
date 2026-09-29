import React, { useState } from 'react';
import {
  Shield,
  Phone,
  Mic,
  Volume2,
  Music,
  Radio,
  Bell,
  Cpu,
  CloudSun,
  MapPin,
  Sparkles,
  Smartphone,
  Layers,
  Brain,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  VoxPermissionsMap,
  FeaturePermissionKey,
  FEATURE_PERMISSION_CONFIGS,
  FeaturePermissionConfig,
} from '../../types/assistant';
import { soundEffects } from '../../services/soundEffects';

interface VoxPermissionsDashboardProps {
  permissions: VoxPermissionsMap;
  onTogglePermission: (key: FeaturePermissionKey, value: boolean) => void;
  onEnableAllSafe: () => void;
  onDisableAll: () => void;
}

type PermissionCategory = 'phone' | 'media' | 'system' | 'privacy' | 'ai' | 'appearance';

const CATEGORY_INFO: Record<PermissionCategory, { label: string; icon: any; color: string; desc: string }> = {
  ai: {
    label: 'AI & SPEECH',
    icon: Sparkles,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    desc: 'Voice assistant generation, speech feedback, audio level indicators, and long-term memory.',
  },
  phone: {
    label: 'PHONE & COMMANDS',
    icon: Smartphone,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    desc: 'Contact calling, SIM selection, device power safeguards, and voice shortcuts.',
  },
  media: {
    label: 'MEDIA & AUDIOMACK',
    icon: Music,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    desc: 'Audiomack direct playback, web media sessions, queue control, and artist links.',
  },
  system: {
    label: 'SYSTEM & SENSORS',
    icon: Cpu,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    desc: 'Battery level, storage space, network status, weather forecasts, and OS notifications.',
  },
  privacy: {
    label: 'PRIVACY & HARDWARE',
    icon: Shield,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    desc: 'Microphone speech capture, approximate location, and camera emotion recognition.',
  },
  appearance: {
    label: 'OVERLAYS & UI',
    icon: Layers,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    desc: 'Floating orb HUD, display over other apps, and interactive visual atmosphere.',
  },
};

export const VoxPermissionsDashboard: React.FC<VoxPermissionsDashboardProps> = ({
  permissions,
  onTogglePermission,
  onEnableAllSafe,
  onDisableAll,
}) => {
  const [activeFilter, setActiveFilter] = useState<PermissionCategory | 'all'>('all');
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);

  const getIcon = (key: FeaturePermissionKey) => {
    switch (key) {
      case 'contacts_calling': return Phone;
      case 'microphone': return Mic;
      case 'voice_assistant': return Volume2;
      case 'media_control': return Radio;
      case 'audiomack_integration': return Music;
      case 'notifications': return Bell;
      case 'device_information': return Cpu;
      case 'weather': return CloudSun;
      case 'location': return MapPin;
      case 'voice_commands': return Sparkles;
      case 'device_actions': return Smartphone;
      case 'overlay_display': return Layers;
      case 'memory': return Brain;
      case 'camera_emotion': return Camera;
      default: return Shield;
    }
  };

  const filteredConfigs = FEATURE_PERMISSION_CONFIGS.filter(
    (cfg) => activeFilter === 'all' || cfg.category === activeFilter
  );

  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const totalCount = FEATURE_PERMISSION_CONFIGS.length;

  const handleToggle = (key: FeaturePermissionKey) => {
    const nextVal = !permissions[key];
    onTogglePermission(key, nextVal);
    soundEffects.playToggle(nextVal);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.25)] shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wider uppercase text-white">
                  Vox Permissions & Features
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-widest">
                  {enabledCount} / {totalCount} Active
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1 max-w-xl">
                Every Vox capability has its own explicit ON/OFF switch. Vox never enables features silently. You choose what Vox can use.
              </p>
            </div>
          </div>

          {/* Bulk Controls */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onEnableAllSafe}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,242,255,0.2)] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Enable Recommended</span>
            </button>
            <button
              onClick={onDisableAll}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 text-xs font-bold transition-all hover:text-white"
            >
              <span>Disable All</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 border-t border-white/10 mt-4 no-scrollbar">
          <button
            onClick={() => {
              setActiveFilter('all');
              soundEffects.playTap();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            All Features ({totalCount})
          </button>
          {(Object.keys(CATEGORY_INFO) as PermissionCategory[]).map((cat) => {
            const info = CATEGORY_INFO[cat];
            const isSel = activeFilter === cat;
            const count = FEATURE_PERMISSION_CONFIGS.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveFilter(cat);
                  soundEffects.playTap();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <span>{info.label.split(' ')[0]}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredConfigs.map((cfg) => {
          const isEnabled = Boolean(permissions[cfg.key]);
          const IconComp = getIcon(cfg.key);
          const catInfo = CATEGORY_INFO[cfg.category as PermissionCategory] || CATEGORY_INFO.ai;
          const isNoticeOpen = expandedNotice === cfg.key;

          return (
            <div
              key={cfg.key}
              className={`p-4 rounded-2xl transition-all border ${
                isEnabled
                  ? 'glass-panel border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,255,0.06)]'
                  : 'bg-black/30 border-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isEnabled ? catInfo.color : 'bg-white/5 text-white/30 border-white/10'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide">
                        {cfg.name}
                      </span>
                      
                      {/* Availability Tag */}
                      {cfg.requiresNativeAndroid ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                          Native Android Bridge
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                          Web & Android Ready
                        </span>
                      )}

                      {/* State badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isEnabled
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }`}
                      >
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      {cfg.description}
                    </p>

                    {/* Notice for Native requirement */}
                    {cfg.unavailableReason && (
                      <div className="mt-2 text-[11px] text-amber-300/80 bg-amber-950/30 border border-amber-500/20 p-2 rounded-lg flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{cfg.unavailableReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ON / OFF Toggle Switch */}
                <div className="flex items-center shrink-0 pt-0.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => handleToggle(cfg.key)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(0,242,255,0.6)]' : 'bg-white/15'
                    }`}
                  >
                    <span className="sr-only">Toggle {cfg.name}</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                        isEnabled ? 'translate-x-7 bg-black text-cyan-400' : 'translate-x-0 bg-white/70 text-black'
                      }`}
                    >
                      <span className="text-[9px] font-black">{isEnabled ? 'ON' : 'OFF'}</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
