import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppScreen,
  OrbState,
  ChatMessage,
  Conversation,
  MemoryItem,
  ResourceItem,
  TimerItem,
  TaskItem,
  NoteItem,
  AssistantSettings,
  FeedbackType,
  ActionPayload,
  ActiveCallSession,
} from './types/assistant';
import { useVoiceEngine } from './hooks/useVoiceEngine';
import { sendChatMessage, checkServerStatus, fetchRecommendations } from './services/geminiClient';
import { soundEffects } from './services/soundEffects';
import { INITIAL_RESOURCES, normalizeCategory } from './services/resourceCategories';
import { nativeAndroidBridge } from './services/nativeAndroidBridge';
import { VOICE_PERSONALITIES, VoicePersonality } from './services/voiceControls';
import { phoneCallAssistant } from './services/phoneCallAssistant';

import { UnifiedHeader } from './components/Navigation/UnifiedHeader';
import { AnivoxDrawerMenu } from './components/Navigation/AnivoxDrawerMenu';
import { UnifiedAssistantWorkspace } from './components/Chat/UnifiedAssistantWorkspace';
import { SubScreenHeader } from './components/Navigation/SubScreenHeader';
import { AnivoxHelpModal } from './components/Common/AnivoxHelpModal';
import { HomeScreen } from './components/Home/HomeScreen';
import { ChatScreen } from './components/Chat/ChatScreen';
import { RecommendationsScreen } from './components/Recommendations/RecommendationsScreen';
import { MemoryScreen } from './components/Memory/MemoryScreen';
import { ActionsScreen } from './components/Actions/ActionsScreen';
import { SettingsScreen } from './components/Settings/SettingsScreen';
import { DeviceControlsScreen } from './components/DeviceControls/DeviceControlsScreen';
import { DeviceCapabilitiesScreen } from './components/DeviceControls/DeviceCapabilitiesScreen';
import { CreatorDashboard } from './components/Creator/CreatorDashboard';
import { EmailAssistantScreen } from './components/Email/EmailAssistantScreen';
import { VoxControlCenter } from './components/ControlCenter/VoxControlCenter';
import { AppSplashScreen } from './components/Common/AppSplashScreen';
import { InstallAniVoxModal } from './components/PWA/InstallAniVoxModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { ImageGenerationModal } from './components/Common/ImageGenerationModal';
import { FloatingOrbOverlay } from './components/Orb/FloatingOrbOverlay';
import { AmbientWaveBackground } from './components/Orb/AmbientWaveBackground';
import { MicPermissionModal } from './components/Security/MicPermissionModal';
import { VoiceAccessModal } from './components/Security/VoiceAccessModal';
import { AppLockOverlay } from './components/Security/AppLockOverlay';
import { ActiveCallModal } from './components/Phone/ActiveCallModal';
import { ProjectsScreen } from './components/Creator/ProjectsScreen';
import { userSnapshotService } from './services/userSnapshotService';
import { projectContextService } from './services/projectContextService';
import { SyncStatus } from './types/assistant';
import { ShieldCheck, CloudOff, RefreshCw, Layers, Bookmark, Brain, Mail, Clapperboard, Sliders, Settings } from 'lucide-react';

// Default initial state data
const DEFAULT_SETTINGS: AssistantSettings = {
  personaStyle: 'balanced',
  responseLength: 'adaptive',
  temperature: 0.7,
  customInstruction: '',
  
  // Advanced Voice Controls & Engine
  voiceURI: '',
  defaultVoiceURI: '',
  voicePersonality: 'classic',
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceVolume: 1.0,
  autoSpeak: true,
  voiceResponsesEnabled: true,
  listeningSoundEnabled: true,
  soundEffectsEnabled: true,
  selectedVoiceEngine: 'web_speech_api',
  
  memoryEnabled: true,
  accentColor: '#06b6d4',
  hapticFeedback: true,
  
  // App & Device Settings
  theme: 'dark',
  fontSize: 'normal',
  orbSpeed: 1.0,
  orbGlowIntensity: 1.0,
  assistantVolume: 1.0,
  isMuted: false,
  notificationsEnabled: true,

  // Overlay & Display Over Other Apps Settings
  displayOverOtherAppsRequested: false,
  floatingOrbEnabled: false,
  floatingOrbPosition: { x: 24, y: 120 },

  // Security & Voice Access
  voiceLockEnabled: false,
  securityPin: '',
  isAppLocked: false,
  voiceTriggerPhrase: 'Hey Vox',
  requireAuthForSensitiveData: true,
};

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'Gaming',
    key: 'Preferred Genres',
    value: 'Enjoys fast-paced kinetic roguelikes, immersive sci-fi RPGs, and cyberpunk aesthetics.',
    source: 'manual',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    category: 'Movies',
    key: 'Favorite Themes',
    value: 'Prefers thought-provoking sci-fi, mind-bending mysteries, and rich atmospheric soundtracks.',
    source: 'manual',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    category: 'Music',
    key: 'Focus Audio',
    value: 'Loves synthwave, ambient lofi beats, and orchestral video game scores during work sprints.',
    source: 'manual',
    timestamp: new Date().toISOString(),
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [orbState, setOrbState] = useState<OrbState>('IDLE');
  const [isAiConnected, setIsAiConnected] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('aura-autonomous-brain');
  const [isRecsLoading, setIsRecsLoading] = useState<boolean>(false);
  const [lastReply, setLastReply] = useState<string>('');
  const [lastAction, setLastAction] = useState<ActionPayload | null>(null);

  // Modals & PWA
  const [showSplash, setShowSplash] = useState(true);
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isVoiceLockModalOpen, setIsVoiceLockModalOpen] = useState(false);
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const { isInstallable, isStandalone, triggerInstallPrompt } = usePWAInstall();

  // Persistent Settings
  const [settings, setSettings] = useState<AssistantSettings>(() => {
    try {
      const saved = localStorage.getItem('aura_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // User Snapshot & Sync Status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(userSnapshotService.getSyncStatus());

  // Persistent Memories
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_memories');
      return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  // Persistent Resource Library (supports 11 categories & rich metadata)
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try {
      const savedNew = localStorage.getItem('aura_resources');
      if (savedNew) return JSON.parse(savedNew);

      const savedOld = localStorage.getItem('aura_recommendations');
      if (savedOld) {
        const parsed = JSON.parse(savedOld);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            category: normalizeCategory(item.category),
            userRating: item.userRating || 5,
            isFavorite: Boolean(item.isFavorite || item.userStatus === 'saved'),
            dateAdded: item.dateAdded || item.timestamp || new Date().toISOString(),
          }));
        }
      }
      return INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  });

  // Persistent Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('aura_conversations');
      if (saved) return JSON.parse(saved);
    } catch {}

    const initialId = 'conv-init-' + Date.now();
    return [
      {
        id: initialId,
        title: 'Initial Welcome Briefing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content: `Greetings! I am **VOX**, your high-performance personal AI assistant and YouTube creator copilot created by AniVox.

I am equipped with:
- ⚡ **Autonomous Fast Brain & Grounded Search** (Instant answers for science, history, current events, and media)
- 🎙️ **Vox Voice Engine & Synthesizer** (Male voice profiles, real-time waveform visualizer, and custom pitch/rate)
- 🎬 **YouTube Creator Studio & DCB Universe** (Official channel @DCBUniverse-n, personal channel hub, analytics, and metadata generator)
- 📱 **Android Bridge & Device Capabilities** (Display over apps, battery/storage diagnostics, sound & media controls)
- 🎨 **Neural Image Synthesis** (Imagen 3 high-fidelity visual generation from any prompt)
- 🧠 **Transparent Long-Term Memory** (User-controlled preference retention)

Try asking: *"What is water?"*, *"Who was the first physician?"*, *"Generate an image of a cybernetic warrior"*, or *"Visit Our Channel"*!`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations[0]?.id || 'conv-1'
  );

  // Persistent Timers
  const [timers, setTimers] = useState<TimerItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_timers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Tasks
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_tasks');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'task-1',
              title: 'Explore AniVox voice assistant & device capability center',
              completed: false,
              priority: 'medium',
              createdAt: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  // Persistent Notes
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_notes');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'note-1',
              title: 'AniVox Assistant Project',
              content: 'Voice-first mobile personal assistant with animated orb, atmospheric resource library, device control architecture, and smart memory.',
              tags: ['Projects', 'AI', 'Voice'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('aura_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('aura_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('aura_resources', JSON.stringify(resources));
    localStorage.setItem('aura_recommendations', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('aura_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('aura_timers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aura_notes', JSON.stringify(notes));
  }, [notes]);

  // Active Phone Call Session State
  const [activeCall, setActiveCall] = useState<ActiveCallSession | null>(() =>
    phoneCallAssistant.getActiveCall()
  );

  useEffect(() => {
    const unsubscribe = phoneCallAssistant.subscribeCallState((call) => {
      setActiveCall(call);
    });
    return () => unsubscribe();
  }, []);

  // User Snapshot & Sync Initialization (Non-blocking & Asynchronous)
  useEffect(() => {
    const unsubStatus = userSnapshotService.subscribeStatus((status) => {
      setSyncStatus(status);
    });

    // Create / load user snapshot asynchronously with automatic retry and exponential backoff
    userSnapshotService.ensureUserSnapshot(settings.userId || 'user_default', {
      settings,
    });

    return () => {
      unsubStatus();
    };
  }, []);

  // Check server connection status on mount
  useEffect(() => {
    checkServerStatus().then((res) => {
      setIsAiConnected(res.connected);
      setModelName(res.model);
    });
  }, []);

  // Timer Tick Interval (1s)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        let changed = false;
        const nextTimers = prevTimers.map((timer) => {
          if (timer.isRunning && timer.remainingSeconds > 0) {
            changed = true;
            const newRemaining = timer.remainingSeconds - 1;
            if (newRemaining === 0) {
              soundEffects.playTimerAlarm();
              if (settings.hapticFeedback) nativeAndroidBridge.triggerHaptic(200);
            }
            return {
              ...timer,
              remainingSeconds: newRemaining,
              completed: newRemaining === 0,
              isRunning: newRemaining > 0,
            };
          }
          return timer;
        });
        return changed ? nextTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.hapticFeedback]);

  // Execute Structured Action
  const handleExecuteAction = useCallback((action: ActionPayload) => {
    if (!action || !action.type) return;

    if (action.type === 'setting' && action.data) {
      const { settingKey, value } = action.data;
      if (settingKey) {
        setSettings((prev) => {
          const next = { ...prev, [settingKey]: value };
          // If personality changed, sync rate and pitch modifier
          if (settingKey === 'voicePersonality' && typeof value === 'string') {
            const profile = VOICE_PERSONALITIES[value as VoicePersonality];
            if (profile) {
              next.speechRate = Number(Math.max(0.5, Math.min(2.0, (1.0 * profile.rateModifier))).toFixed(2));
              next.speechPitch = Number(Math.max(0.5, Math.min(1.5, profile.pitchModifier)).toFixed(2));
            }
          }
          return next;
        });
        soundEffects.playSuccess();
        if (settings.hapticFeedback) nativeAndroidBridge.triggerHaptic(35);
      }
    } else if (action.type === 'volume' && action.data) {
      const { action: volAction, value, step = 0.25 } = action.data;
      setSettings((prev) => {
        let currentVol = prev.assistantVolume ?? 1.0;
        let isMuted = prev.isMuted;

        if (volAction === 'mute') {
          isMuted = true;
        } else if (volAction === 'unmute') {
          isMuted = false;
          if (currentVol === 0) currentVol = 0.75;
        } else if (volAction === 'set' && typeof value === 'number') {
          currentVol = Math.max(0, Math.min(1.0, value));
          isMuted = currentVol === 0;
        } else if (volAction === 'increase') {
          isMuted = false;
          currentVol = Math.min(1.0, currentVol + step);
        } else if (volAction === 'decrease') {
          currentVol = Math.max(0, currentVol - step);
          if (currentVol === 0) isMuted = true;
        }

        return {
          ...prev,
          assistantVolume: currentVol,
          voiceVolume: currentVol,
          isMuted,
        };
      });
      soundEffects.playTap();
    } else if (action.type === 'speech_control' && action.data) {
      if (action.data.action === 'stop_speaking') {
        voiceEngine.stopSpeaking();
      } else if (action.data.action === 'start_listening') {
        voiceEngine.startListening();
      }
    } else if (action.type === 'app_lock') {
      if (action.data?.action === 'lock') {
        setSettings((prev) => ({ ...prev, isAppLocked: true }));
        soundEffects.playTap();
      } else if (action.data?.action === 'unlock') {
        setSettings((prev) => ({ ...prev, isAppLocked: false }));
        soundEffects.playSuccess();
      }
    } else if (action.type === 'timer' && action.data) {
      const seconds = Number(action.data.seconds) || 60;
      const label = action.data.label || `${Math.floor(seconds / 60)} Min Timer`;
      const newTimer: TimerItem = {
        id: 'timer-' + Date.now(),
        label,
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isRunning: true,
        createdAt: new Date().toISOString(),
      };
      setTimers((prev) => [newTimer, ...prev]);
      soundEffects.playTap();
    } else if (action.type === 'note' && action.data) {
      const newNote: NoteItem = {
        id: 'note-' + Date.now(),
        title: action.data.title || 'Quick Voice Note',
        content: action.data.content || '',
        tags: action.data.tags || ['Voice'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      soundEffects.playSuccess();
    } else if (action.type === 'task' && action.data) {
      const newTask: TaskItem = {
        id: 'task-' + Date.now(),
        title: action.data.title || 'New Task',
        priority: action.data.priority || 'medium',
        dueDate: action.data.dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      soundEffects.playSuccess();
    } else if (action.type === 'memory' && action.data && settings.memoryEnabled) {
      const newMem: MemoryItem = {
        id: 'mem-' + Date.now(),
        category: action.data.category || 'Preferences',
        key: action.data.key || 'User Preference',
        value: action.data.value || action.data.text || '',
        source: 'user_explicit',
        timestamp: new Date().toISOString(),
      };
      setMemories((prev) => [newMem, ...prev]);
      soundEffects.playSuccess();
    } else if ((action.type === 'recommendation' || action.type === 'resource') && action.data) {
      const normalizedCat = normalizeCategory(action.data.category || 'tools');
      const item: ResourceItem = {
        id: 'res-' + Date.now(),
        title: action.data.title,
        creator: action.data.creator,
        category: normalizedCat,
        description: action.data.description || action.data.reason || '',
        tags: action.data.tags || [],
        userRating: action.data.userRating || 5,
        rating: action.data.rating || '9.0/10',
        recommendationReason: action.data.reason || action.data.recommendationReason,
        link: action.data.link,
        imageUrl: action.data.imageUrl,
        notes: action.data.notes,
        isFavorite: Boolean(action.data.isFavorite),
        saved: true,
        userStatus: action.data.userStatus || 'none',
        source: 'ai_recommendation',
        dateAdded: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };

      setResources((prev) => {
        if (prev.some((r) => (r?.title || '').toLowerCase() === (item?.title || '').toLowerCase())) {
          return prev;
        }
        return [item, ...prev];
      });
    } else if (action.type === 'phone_call' && action.data) {
      const query = action.data.query || action.data.targetName || 'Mom';
      const resolved = phoneCallAssistant.processCallIntent(query);
      setLastAction({
        type: 'phone_call',
        data: resolved,
      });

      const phoneSettings = phoneCallAssistant.getSettings();
      // If ready to call and confirmation is not required (direct instant dial):
      if (
        resolved.status === 'ready_to_call' &&
        !phoneSettings.confirmCallsBeforePlacing &&
        resolved.selectedNumber
      ) {
        phoneCallAssistant.initiateCall({
          contactName: resolved.contact?.name || resolved.targetName,
          number: resolved.selectedNumber,
          label: resolved.selectedLabel,
          simSlot: resolved.selectedSim,
        });
      }
    } else if (action.type === 'navigation' && action.data?.screen) {
      setCurrentScreen(action.data.screen as AppScreen);
    } else if (action.type === 'image_generation' || action.type === 'generate_image') {
      const prompt = action.data?.prompt || action.data?.query || '';
      setImageGenPrompt(prompt);
      setIsImageGenOpen(true);
      soundEffects.playTap();
    }
  }, [settings.memoryEnabled, settings.hapticFeedback]);

  // Main Prompt Submission Handler
  const handleUserPrompt = async (promptText: string) => {
    if (!promptText || !promptText.trim()) return;

    // Check for voice hang-up when call is active
    const activeCurrentCall = phoneCallAssistant.getActiveCall();
    const cleanLower = promptText.trim().toLowerCase();
    if (
      activeCurrentCall &&
      (cleanLower === 'hang up' ||
        cleanLower === 'end call' ||
        cleanLower === 'end the call' ||
        cleanLower === 'disconnect' ||
        cleanLower.includes('hang up'))
    ) {
      phoneCallAssistant.endCall('Voice command: ' + promptText);
      soundEffects.playTap();
      setLastReply('Call ended.');
      return;
    }

    // Check if in locked state and matching unlock trigger phrase
    if (settings.isAppLocked) {
      const phrase = (settings.voiceTriggerPhrase || 'Hey Vox').toLowerCase();
      const pText = (promptText || '').toLowerCase();
      if (pText.includes(phrase) || pText.includes('unlock')) {
        setSettings((s) => ({ ...s, isAppLocked: false }));
        soundEffects.playSuccess();
        return;
      }
    }

    setOrbState('THINKING');

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date().toISOString(),
    };

    // Append to active conversation
    const currentConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
    const updatedMessages = [...(currentConv?.messages || []), userMessage];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === (currentConv?.id || activeConversationId)
          ? {
              ...c,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
              title: c.messages.length <= 1 ? promptText.slice(0, 30) : c.title,
            }
          : c
      )
    );

    try {
      const response = await sendChatMessage(updatedMessages, memories, settings, resources);

      setLastReply(response.reply);
      setLastAction(response.action || null);

      const assistantMessage: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        role: 'assistant',
        content: response.reply,
        action: response.action,
        provider: response.provider,
        sources: response.sources,
        intent: response.intent,
        searchQueries: response.searchQueries,
        isGroundingUsed: response.isGroundingUsed,
        error: response.error,
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === (currentConv?.id || activeConversationId)
            ? { ...c, messages: [...updatedMessages, assistantMessage], updatedAt: new Date().toISOString() }
            : c
        )
      );

      // Execute structured action if returned
      if (response.action) {
        handleExecuteAction(response.action);
      }

      // Play chime
      if (!response.error) {
        soundEffects.playResponseChime();
      }

      // Read aloud if auto-speak is enabled, voice responses enabled, and not muted
      const canSpeak = settings.autoSpeak && (settings.voiceResponsesEnabled ?? true) && !settings.isMuted && !response.error;
      if (canSpeak) {
        setOrbState('SPEAKING');
        voiceEngine.speakText(response.reply, () => {
          setOrbState('IDLE');
        });
      } else {
        setOrbState('IDLE');
      }
    } catch (err: any) {
      console.error('Failed to get chat response:', err);
      const errorMessage: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: "I couldn't connect to my AI service right now. Please try again.",
        error: err.message || 'AI_SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === (currentConv?.id || activeConversationId)
            ? { ...c, messages: [...updatedMessages, errorMessage], updatedAt: new Date().toISOString() }
            : c
        )
      );

      setOrbState('ERROR');
      setTimeout(() => setOrbState('IDLE'), 3000);
    }
  };

  // Voice Engine Hook
  const voiceEngine = useVoiceEngine({
    settings,
    onTranscriptReady: (transcript) => {
      if (transcript.trim()) {
        handleUserPrompt(transcript);
      }
    },
    onListeningStateChange: (listening) => {
      setOrbState(listening ? 'LISTENING' : 'IDLE');
    },
    onSpeakingStateChange: (speaking) => {
      if (speaking) {
        setOrbState('SPEAKING');
      } else if (orbState === 'SPEAKING') {
        setOrbState('IDLE');
      }
    },
  });

  // Polite non-repeating microphone access prompt
  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem('anivox_mic_permission_prompt_dismissed');
      const permStatus = localStorage.getItem('anivox_mic_permission_status');
      if (!isDismissed && permStatus !== 'granted' && voiceEngine.micPermission === 'prompt') {
        const timer = setTimeout(() => {
          setIsMicModalOpen(true);
        }, 1600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [voiceEngine.micPermission]);

  // Resource / Recommendation Feedback Handler
  const handleRecommendationFeedback = (itemId: string, type: FeedbackType) => {
    setResources((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          let newStatus = item.userStatus;
          let isFav = item.isFavorite;

          if (type === 'like') newStatus = item.userStatus === 'liked' ? 'none' : 'liked';
          else if (type === 'dislike' || type === 'not_interested') newStatus = item.userStatus === 'disliked' ? 'none' : 'disliked';
          else if (type === 'consumed') newStatus = item.userStatus === 'consumed' ? 'none' : 'consumed';
          else if (type === 'saved') {
            newStatus = item.userStatus === 'saved' ? 'none' : 'saved';
            isFav = !isFav;
          }
          return { ...item, userStatus: newStatus, isFavorite: isFav };
        }
        return item;
      })
    );

    const targetItem = resources.find((r) => r.id === itemId);
    if (!targetItem) return;

    soundEffects.playTap();

    if (settings.memoryEnabled) {
      if (type === 'like') {
        const memText = `Liked ${targetItem.category}: "${targetItem.title}" (${(targetItem.tags || []).join(', ')})`;
        if (!memories.some((m) => m.value.includes(targetItem.title))) {
          setMemories((prev) => [
            {
              id: 'mem-feedback-' + Date.now(),
              category: targetItem.category === 'games' ? 'Gaming' : targetItem.category === 'movies' ? 'Movies' : 'Preferences',
              key: 'Preference from Feedback',
              value: memText,
              source: 'learned',
              timestamp: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      } else if (type === 'dislike' || type === 'not_interested') {
        const memText = `Disliked / not interested in: "${targetItem.title}" (${targetItem.category})`;
        if (!memories.some((m) => m.value.includes(targetItem.title))) {
          setMemories((prev) => [
            {
              id: 'mem-dislike-' + Date.now(),
              category: 'Disliked Topics',
              key: 'Negative Preference',
              value: memText,
              source: 'learned',
              timestamp: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      } else if (type === 'more_like_this') {
        handleUserPrompt(`Give me more recommendations similar to ${targetItem.title} (${targetItem.category}) with tags: ${(targetItem.tags || []).join(', ')}.`);
        setCurrentScreen('chat');
      }
    }
  };

  const handleMoreLikeThis = (item: ResourceItem) => {
    handleUserPrompt(`Please find more resources like "${item.title}" in category "${item.category}". Context: ${item.description}`);
    setCurrentScreen('chat');
  };

  const handleNotInterested = (item: ResourceItem) => {
    handleRecommendationFeedback(item.id, 'not_interested');
  };

  // Refresh Recommendations from server
  const handleRefreshRecommendations = async (category?: string) => {
    setIsRecsLoading(true);
    try {
      const res = await fetchRecommendations(
        category || 'all',
        memories,
        settings,
        resources.map((r) => ({ title: r.title, status: r.userStatus })),
        resources
      );

      if (res.recommendations && res.recommendations.length > 0) {
        setResources((prev) => {
          const newItems = res.recommendations.filter(
            (n) => !prev.some((p) => (p?.title || '').toLowerCase() === (n?.title || '').toLowerCase())
          );
          return [...newItems, ...prev];
        });
        soundEffects.playSuccess();
      }
    } catch (err) {
      console.warn('Failed to refresh recommendations:', err);
    } finally {
      setIsRecsLoading(false);
    }
  };

  // Conversation Management Handlers
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    soundEffects.playTap();
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fallback: Conversation = {
          id: 'conv-' + Date.now(),
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        setActiveConversationId(fallback.id);
        return [fallback];
      }
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Timer Action Handlers
  const handleAddTimer = (seconds: number, label: string) => {
    const newTimer: TimerItem = {
      id: 'timer-' + Date.now(),
      label: label || `${Math.floor(seconds / 60)} Min Timer`,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      createdAt: new Date().toISOString(),
    };
    setTimers((prev) => [newTimer, ...prev]);
  };

  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const handleResetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false, completed: false } : t
      )
    );
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  // Task Handlers
  const handleAddTask = (task: Partial<TaskItem>) => {
    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      title: task.title || 'New Task',
      priority: task.priority || 'medium',
      dueDate: task.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Note Handlers
  const handleAddNote = (note: Partial<NoteItem>) => {
    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: note.title || 'Untitled Note',
      content: note.content || '',
      tags: note.tags || ['General'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Memory Handlers
  const handleAddMemory = (memory: Partial<MemoryItem>) => {
    const newMem: MemoryItem = {
      id: 'mem-' + Date.now(),
      category: memory.category || 'Preferences',
      key: memory.key,
      value: memory.value || '',
      source: 'manual',
      timestamp: new Date().toISOString(),
    };
    setMemories((prev) => [newMem, ...prev]);
    soundEffects.playSuccess();
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMemories = () => {
    if (confirm('Clear all stored long-term memories? This will reset voluntary preferences.')) {
      setMemories([]);
    }
  };

  const handleImportMemories = (imported: MemoryItem[]) => {
    setMemories(imported);
    soundEffects.playSuccess();
  };

  // Get theme root class & typography scaling
  const getThemeClass = () => {
    if (settings.theme === 'light') return 'theme-light bg-[#f8fafc] text-slate-900';
    if (settings.theme === 'cyberpunk') return 'theme-cyberpunk bg-[#050811] text-emerald-100';
    return 'theme-dark bg-[#020408] text-slate-100';
  };

  const getFontSizeClass = () => {
    if (settings.fontSize === 'compact') return 'text-[13px]';
    if (settings.fontSize === 'large') return 'text-[16px]';
    return 'text-[14px]';
  };

  return (
    <div className={`relative min-h-screen font-sans flex flex-col antialiased overflow-x-hidden transition-colors duration-300 ${getThemeClass()} ${getFontSizeClass()}`}>
      {/* Dynamic Ambient AI Background Atmosphere */}
      <AmbientWaveBackground state={orbState} audioLevel={voiceEngine.audioLevel} />

      {/* Background Atmosphere Layers */}
      <div className="fixed -top-28 -left-28 w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] orb-glow rounded-full pointer-events-none z-0 opacity-40 animate-pulse" />
      <div className="fixed -bottom-28 -right-28 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[#7000ff22] blur-[140px] rounded-full pointer-events-none z-0" />
      
      {/* Floating Ambient Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-cyan-400 rounded-full opacity-40 blur-[0.5px] animate-pulse" />
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-30 blur-[0.5px]" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-30" />
        <div className="absolute bottom-1/4 right-1/5 w-2 h-2 bg-cyan-300 rounded-full opacity-20 blur-[1px]" />
      </div>

      {/* Top Unified Header (ChatGPT-Style Clean Navigation) */}
      <UnifiedHeader
        onOpenMenu={() => setIsDrawerOpen(true)}
        onNewChat={() => {
          handleNewConversation();
          setCurrentScreen('chat');
        }}
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        orbState={orbState}
        isAiConnected={isAiConnected}
        soundEnabled={settings.soundEffectsEnabled && !settings.isMuted}
        onToggleSound={() =>
          setSettings((prev) => ({
            ...prev,
            isMuted: !prev.isMuted,
          }))
        }
        onOrbClick={voiceEngine.isSpeaking ? voiceEngine.stopSpeaking : voiceEngine.toggleListening}
      />

      {/* Slide-out / Expandable ANIVOX Menu */}
      <AnivoxDrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenImageGen={() => setIsImageGenOpen(true)}
        onOpenVoiceSettings={() => setCurrentScreen('settings')}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        settings={settings}
        memoryCount={memories.length}
        resourceCount={resources.length}
      />

      {/* Non-intrusive Connection & Safe Session Recovery Banner */}
      {(!syncStatus.isOnline || syncStatus.state === 'temporary_fallback' || syncStatus.state === 'retrying') && (
        <div className="relative z-20 w-full bg-cyan-950/80 border-b border-cyan-500/30 px-4 py-2 text-center text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 backdrop-blur-md animate-slide-down">
          {!syncStatus.isOnline ? (
            <>
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline mode active. Your work is safe locally and will sync when reconnected.</span>
            </>
          ) : syncStatus.state === 'temporary_fallback' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Safe session active. Workspace and project memory are preserved locally.</span>
              <button
                onClick={() => userSnapshotService.triggerBackgroundSync()}
                className="ml-2 underline font-bold hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Now</span>
              </button>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>{syncStatus.statusMessage || "Syncing project data..."}</span>
            </>
          )}
        </div>
      )}

      {/* Main Dynamic Viewport */}
      <main className="relative z-10 flex-1">
        {/* UNIFIED WORKSPACE (Home & Chat combined into one assistant experience) */}
        {(currentScreen === 'home' || currentScreen === 'chat') && (
          <UnifiedAssistantWorkspace
            conversations={conversations}
            activeConversationId={activeConversationId}
            isListening={voiceEngine.isListening}
            isSpeaking={voiceEngine.isSpeaking}
            audioLevel={voiceEngine.audioLevel}
            waveformBars={voiceEngine.waveformBars}
            micState={voiceEngine.micState}
            transcript={voiceEngine.transcript}
            interimTranscript={voiceEngine.interimTranscript}
            orbState={orbState}
            onSelectConversation={setActiveConversationId}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onRenameConversation={handleRenameConversation}
            onSubmitMessage={(msg) => handleUserPrompt(msg)}
            onRetryMessage={(msg) => handleUserPrompt(msg)}
            onToggleMic={voiceEngine.toggleListening}
            onSpeakMessage={(text) => {
              setOrbState('SPEAKING');
              voiceEngine.speakText(text, () => setOrbState('IDLE'));
            }}
            onStopSpeaking={voiceEngine.stopSpeaking}
            onFeedback={handleRecommendationFeedback}
            onExecuteTimer={(sec, lbl) => handleAddTimer(sec, lbl)}
            onNavigate={setCurrentScreen}
            onOpenImageGen={() => setIsImageGenOpen(true)}
            settings={settings}
          />
        )}

        {currentScreen === 'email' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Email Assistant"
              subtitle="Gmail Workspace & Smart Inbox"
              icon={Mail}
              iconColor="text-rose-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <EmailAssistantScreen onNavigate={setCurrentScreen} />
          </div>
        )}

        {currentScreen === 'projects' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Projects & Lore Workspace"
              subtitle="Cosmic Wrath & Creative Universes"
              icon={Layers}
              iconColor="text-amber-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <div className="max-w-5xl mx-auto px-3 sm:px-4">
              <ProjectsScreen
                onNavigateToChat={(title) => {
                  setActiveConversationId(conversations[0]?.id || 'conv-1');
                  setCurrentScreen('chat');
                }}
              />
            </div>
          </div>
        )}

        {currentScreen === 'controls' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Control Center"
              subtitle="Master Device & Audio HUD"
              icon={Sliders}
              iconColor="text-purple-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <VoxControlCenter
              onNavigate={setCurrentScreen}
              onOpenInstall={() => setIsInstallModalOpen(true)}
            />
          </div>
        )}

        {currentScreen === 'recommendations' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Library & Knowledge Vault"
              subtitle="Curated Tools, Media & Recommendations"
              icon={Bookmark}
              iconColor="text-indigo-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <RecommendationsScreen
              resources={resources}
              memories={memories}
              isLoading={isRecsLoading}
              onAddResource={(newRes) => {
                const item: ResourceItem = {
                  id: 'res-' + Date.now(),
                  title: newRes.title || 'Untitled Resource',
                  category: normalizeCategory(newRes.category || 'tools'),
                  creator: newRes.creator,
                  description: newRes.description || '',
                  tags: newRes.tags || [],
                  userRating: newRes.userRating || 5,
                  rating: newRes.rating || '5.0★',
                  isFavorite: Boolean(newRes.isFavorite),
                  saved: true,
                  userStatus: newRes.userStatus || 'saved',
                  link: newRes.link,
                  imageUrl: newRes.imageUrl,
                  notes: newRes.notes,
                  recommendationReason: newRes.recommendationReason || newRes.reason,
                  source: newRes.source || 'user_added',
                  dateAdded: new Date().toISOString(),
                  timestamp: new Date().toISOString(),
                };
                setResources((prev) => [item, ...prev]);
                soundEffects.playSuccess();
              }}
              onEditResource={(updated) => {
                if (!updated.id) return;
                setResources((prev) =>
                  prev.map((item) =>
                    item.id === updated.id
                      ? {
                          ...item,
                          ...updated,
                          category: normalizeCategory(updated.category || item.category),
                          timestamp: new Date().toISOString(),
                        }
                      : item
                  )
                );
                soundEffects.playTap();
              }}
              onDeleteResource={(id) => {
                setResources((prev) => prev.filter((r) => r.id !== id));
                soundEffects.playTap();
              }}
              onToggleFavorite={(id) => {
                setResources((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
                );
                soundEffects.playTap();
              }}
              onRateResource={(id, rating) => {
                setResources((prev) =>
                  prev.map((r) =>
                    r.id === id
                      ? {
                          ...r,
                          userRating: rating,
                          rating: `${rating}.0★`,
                        }
                      : r
                  )
                );
                soundEffects.playTap();
              }}
              onViewResource={(item) => {
                setResources((prev) =>
                  prev.map((r) =>
                    r.id === item.id ? { ...r, lastViewedAt: new Date().toISOString() } : r
                  )
                );
              }}
              onFeedback={handleRecommendationFeedback}
              onRefreshRecommendations={handleRefreshRecommendations}
              onMoreLikeThis={handleMoreLikeThis}
              onNotInterested={handleNotInterested}
              onNavigate={setCurrentScreen}
            />
          </div>
        )}

        {currentScreen === 'memory' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Transparent Memory"
              subtitle="User Preferences & Lore Context"
              icon={Brain}
              iconColor="text-purple-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <MemoryScreen
              memories={memories}
              memoryEnabled={settings.memoryEnabled}
              onToggleMemory={(enabled) => setSettings((s) => ({ ...s, memoryEnabled: enabled }))}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
              onClearAllMemories={handleClearAllMemories}
              onImportMemories={handleImportMemories}
            />
          </div>
        )}

        {currentScreen === 'actions' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Timers & Notes"
              subtitle="Active Reminders & Fast Notes"
              icon={Sliders}
              iconColor="text-teal-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <ActionsScreen
              timers={timers}
              tasks={tasks}
              notes={notes}
              onAddTimer={handleAddTimer}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onDeleteTimer={handleDeleteTimer}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        )}

        {currentScreen === 'device-controls' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Device Controls"
              subtitle="System Diagnostics & Volume"
              icon={Sliders}
              iconColor="text-cyan-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <DeviceControlsScreen
              settings={settings}
              onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
              onOpenMicModal={() => setIsMicModalOpen(true)}
              onOpenVoiceLockModal={() => setIsVoiceLockModalOpen(true)}
              onExecuteCommand={handleUserPrompt}
              onLockApp={() => setSettings((s) => ({ ...s, isAppLocked: true }))}
              onNavigate={setCurrentScreen}
            />
          </div>
        )}

        {currentScreen === 'device-capabilities' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Device Capabilities"
              subtitle="Display Over Apps & Bridge"
              icon={Sliders}
              iconColor="text-cyan-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <DeviceCapabilitiesScreen
              onNavigate={setCurrentScreen}
              onOpenMicModal={() => setIsMicModalOpen(true)}
            />
          </div>
        )}

        {currentScreen === 'creator' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Creator Studio"
              subtitle="YouTube Hub & Universe Architect"
              icon={Clapperboard}
              iconColor="text-emerald-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <CreatorDashboard />
          </div>
        )}

        {currentScreen === 'settings' && (
          <div className="min-h-[calc(100vh-65px)] pb-12">
            <SubScreenHeader
              title="Settings"
              subtitle="Voice, Audio, Security & Customization"
              icon={Settings}
              iconColor="text-cyan-400"
              onBackToChat={() => setCurrentScreen('chat')}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
            <SettingsScreen
              settings={settings}
              voices={voiceEngine.voices}
              isAiConnected={isAiConnected}
              modelName={modelName}
              onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
              onNavigate={setCurrentScreen}
              onOpenMicModal={() => setIsMicModalOpen(true)}
              onOpenVoiceLockModal={() => setIsVoiceLockModalOpen(true)}
              onTestVoice={(customPhrase) => {
                setOrbState('SPEAKING');
                voiceEngine.speakText(
                  customPhrase || 'Vox voice synthesis test. Audio frequency modulation and natural inflection verified.',
                  () => setOrbState('IDLE')
                );
              }}
              onStopSpeaking={voiceEngine.stopSpeaking}
              isSpeaking={voiceEngine.isSpeaking}
              availableMicrophones={voiceEngine.availableMicrophones}
              onRefreshDevices={voiceEngine.refreshAudioDevices}
              onTestMicStart={voiceEngine.startTestingMic}
              onTestMicStop={voiceEngine.stopTestingMic}
              isTestingMic={voiceEngine.isTestingMic}
              audioLevel={voiceEngine.audioLevel}
              decibels={voiceEngine.decibels}
              waveformBars={voiceEngine.waveformBars}
              micDiagnosticInfo={voiceEngine.micDiagnosticInfo}
              micPermission={voiceEngine.micPermission}
              onRequestMicPermission={voiceEngine.requestMicPermission}
              onResetDefaults={() => setSettings(DEFAULT_SETTINGS)}
              onClearAllData={() => {
                if (confirm('Erase all conversations, memories, timers, tasks, and notes?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Help Modal */}
      <AnivoxHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Floating Orb Overlay Widget (When enabled in settings) */}
      <FloatingOrbOverlay
        isVisible={Boolean(settings.floatingOrbEnabled)}
        orbState={orbState}
        isListening={voiceEngine.isListening}
        isSpeaking={voiceEngine.isSpeaking}
        onToggleMic={voiceEngine.toggleListening}
        onStopSpeaking={voiceEngine.stopSpeaking}
        onOpenAssistant={() => setCurrentScreen('chat')}
        onCloseOverlay={() => setSettings((s) => ({ ...s, floatingOrbEnabled: false }))}
        initialPosition={settings.floatingOrbPosition || { x: 24, y: 120 }}
        onPositionChange={(pos) => setSettings((s) => ({ ...s, floatingOrbPosition: pos }))}
      />

      {/* Microphone Permission Modal */}
      <MicPermissionModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        permissionStatus={voiceEngine.micPermission}
        onRequestPermission={voiceEngine.requestMicPermission}
      />

      {/* Voice Access & App Lock Setup Modal */}
      <VoiceAccessModal
        isOpen={isVoiceLockModalOpen}
        onClose={() => setIsVoiceLockModalOpen(false)}
        settings={settings}
        micPermission={voiceEngine.micPermission}
        onRequestMicPermission={voiceEngine.requestMicPermission}
        onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
      />

      {/* Active Phone Call Session Modal / Floating Overlay */}
      <ActiveCallModal
        call={activeCall}
        onEndCall={() => phoneCallAssistant.endCall('User pressed end call')}
      />

      {/* App Lock Overlay Screen */}
      <AppLockOverlay
        isLocked={settings.isAppLocked}
        securityPin={settings.securityPin}
        voiceTriggerPhrase={settings.voiceTriggerPhrase}
        isListening={voiceEngine.isListening}
        onUnlock={() => setSettings((s) => ({ ...s, isAppLocked: false }))}
        onToggleMic={voiceEngine.toggleListening}
      />

      {/* Image Generation Floating Modal */}
      <ImageGenerationModal
        isOpen={isImageGenOpen}
        initialPrompt={imageGenPrompt}
        onClose={() => setIsImageGenOpen(false)}
      />

      {/* PWA Install Modal */}
      <InstallAniVoxModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={async () => {
          await triggerInstallPrompt();
          setIsInstallModalOpen(false);
        }}
        isInstallable={isInstallable}
        isStandalone={isStandalone}
      />

      {/* Initial App Splash Screen */}
      {showSplash && (
        <AppSplashScreen
          onComplete={() => setShowSplash(false)}
          durationMs={1400}
        />
      )}
    </div>
  );
}
