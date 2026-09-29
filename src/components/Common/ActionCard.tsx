import React from 'react';
import {
  Timer,
  FileText,
  CheckSquare,
  Brain,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Check,
  Copy,
  Music,
  CloudSun,
  Clock,
  Smartphone,
  Sparkles,
  Youtube,
  Mail,
} from 'lucide-react';
import {
  ActionPayload,
  TimerItem,
  NoteItem,
  TaskItem,
  SocialProfileCard,
  PhoneCallActionData,
  MediaTrack,
} from '../../types/assistant';
import { SocialResultCard } from '../Social/SocialResultCard';
import { PhoneCallCard } from '../Phone/PhoneCallCard';
import { AudiomackMediaCard } from '../Media/AudiomackMediaCard';
import { WeatherCard } from './WeatherCard';
import { WorldTimeCard } from './WorldTimeCard';
import { DeviceStatusSensorsPanel } from '../DeviceControls/DeviceStatusSensorsPanel';
import { soundEffects } from '../../services/soundEffects';

interface ActionCardProps {
  action: ActionPayload;
  onExecuteTimer?: (seconds: number, label: string) => void;
  onSaveNote?: (note: Partial<NoteItem>) => void;
  onSaveTask?: (task: Partial<TaskItem>) => void;
  onNavigate?: (screen: any) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onExecuteTimer,
  onSaveNote,
  onSaveTask,
  onNavigate,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!action || !action.type) return null;

  const { type, data } = action;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (type) {
    case 'audiomack_play':
    case 'media_control': {
      const track: MediaTrack | undefined = data?.track || (data?.title ? (data as any) : undefined);
      return (
        <div className="my-3">
          <AudiomackMediaCard initialTrack={track} />
        </div>
      );
    }

    case 'weather': {
      return (
        <div className="my-3">
          <WeatherCard initialCity={data?.city || data?.location} />
        </div>
      );
    }

    case 'time_query': {
      return (
        <div className="my-3">
          <WorldTimeCard initialLocation={data?.location || data?.city} />
        </div>
      );
    }

    case 'device_status':
    case 'power_confirmation':
    case 'device_action': {
      return (
        <div className="my-3">
          <DeviceStatusSensorsPanel />
        </div>
      );
    }

    case 'phone_call': {
      if (!data) return null;
      const callData: PhoneCallActionData = {
        id: data.id || `phone-${Date.now()}`,
        targetName: data.targetName || 'Mom',
        contact: data.contact,
        selectedNumber: data.selectedNumber,
        selectedLabel: data.selectedLabel,
        selectedSim: data.selectedSim,
        simCarrierName: data.simCarrierName,
        requiresNumberChoice: data.requiresNumberChoice,
        requiresSimChoice: data.requiresSimChoice,
        requiresContactChoice: data.requiresContactChoice,
        matchingContacts: data.matchingContacts,
        status: data.status || 'ready_to_call',
        message: data.message || '',
        autoDirectCall: data.autoDirectCall,
        dialUrl: data.dialUrl,
      };

      return (
        <div className="my-2.5">
          <PhoneCallCard actionData={callData} />
        </div>
      );
    }

    case 'social_search':
    case 'open_link': {
      if (!data) return null;
      const card: SocialProfileCard = {
        id: data.id || `social-${Date.now()}`,
        targetName: data.targetName || data.profileTitle || 'Destination',
        platform: data.platform || 'web',
        platformDisplayName: data.platformDisplayName || 'Official Destination',
        profileTitle: data.profileTitle || data.targetName || 'Verified Profile',
        handle: data.handle,
        description: data.description,
        webUrl: data.webUrl,
        appDeepLink: data.appDeepLink,
        avatarUrl: data.avatarUrl,
        isVerified: data.isVerified,
        subscriberCount: data.subscriberCount,
        followersCount: data.followersCount,
        category: data.category,
        searchQuery: data.searchQuery,
        alternativeOptions: data.alternativeOptions,
        directLaunchSuggested: data.directLaunchSuggested,
      };

      return (
        <div className="my-3">
          <SocialResultCard card={card} />
        </div>
      );
    }

    case 'timer': {
      const minutes = Math.floor((data.seconds || 60) / 60);
      const remainingSec = (data.seconds || 60) % 60;
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;

      return (
        <div className="my-2.5 p-4 rounded-2xl glass-panel border-cyan-500/30 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,242,255,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,242,255,0.3)]">
              <Timer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold block">
                Timer Action Set
              </span>
              <span className="text-sm font-bold text-white">
                {data.label || 'Countdown Timer'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black font-mono text-cyan-400 tracking-wider">
              {formattedTime}
            </span>
          </div>
        </div>
      );
    }

    case 'note': {
      return (
        <div className="my-2.5 p-4 rounded-2xl glass-panel border-purple-500/30 space-y-2 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">
                Note Saved
              </span>
            </div>
            {data.tags && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                {Array.isArray(data.tags) ? data.tags.join(', ') : data.tags}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white">{data.title}</p>
          {data.content && <p className="text-xs text-white/70">{data.content}</p>}
        </div>
      );
    }

    case 'task': {
      return (
        <div className="my-2.5 p-4 rounded-2xl glass-panel border-emerald-500/30 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                Task Queued
              </span>
              <span className="text-sm font-bold text-white">{data.title}</span>
            </div>
          </div>
          {data.priority && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold ${
                data.priority === 'high'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {data.priority}
            </span>
          )}
        </div>
      );
    }

    case 'team_inquiry': {
      const email = data.email || '[ENTER OFFICIAL TEAM EMAIL HERE]';
      return (
        <div className="my-3 p-5 rounded-3xl glass-panel border-amber-500/30 space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold block">
                AniVox Team Inquiries
              </span>
              <span className="text-xs text-white/70 font-mono">
                {email}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-white/90">
              {data.promptFollowUp || 'Would you still like to join?'}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={email.startsWith('[') ? '#/settings' : `mailto:${email}?subject=Collaboration%20Inquiry`}
                onClick={() => soundEffects.playTap()}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              >
                Yes
              </a>
              <button
                onClick={() => soundEffects.playTap()}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold"
              >
                No
              </button>
            </div>
          </div>
        </div>
      );
    }

    case 'memory': {
      return (
        <div className="my-2.5 p-4 rounded-2xl glass-panel border-cyan-500/30 space-y-2 shadow-[0_0_20px_rgba(0,242,255,0.15)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
              Memory Recorded
            </span>
          </div>
          <div className="text-xs text-white/90">
            <span className="text-cyan-400 font-semibold">{data.key ? `${data.key}: ` : ''}</span>
            <span>{data.value}</span>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
