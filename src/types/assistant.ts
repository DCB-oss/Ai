export type OrbState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

export type AppScreen = 
  | 'home' 
  | 'chat' 
  | 'recommendations' 
  | 'memory' 
  | 'actions' 
  | 'settings' 
  | 'device-controls' 
  | 'device-capabilities' 
  | 'creator' 
  | 'email' 
  | 'controls' 
  | 'projects' 
  | 'characters' 
  | 'game-studio' 
  | 'writer';

export type ResourceCategory = 
  | 'movies'
  | 'shows_anime'
  | 'games'
  | 'apps'
  | 'videos'
  | 'books'
  | 'music'
  | 'tools'
  | 'websites'
  | 'creative'
  | 'learning'
  // Legacy backward-compatibility aliases
  | 'movie'
  | 'show'
  | 'game'
  | 'app'
  | 'book'
  | 'tool'
  | 'activity';

export type RecommendationCategory = ResourceCategory;

export type MemoryCategory = 
  | 'Movies' 
  | 'Gaming' 
  | 'Shows' 
  | 'Music' 
  | 'Books' 
  | 'Tools' 
  | 'Projects' 
  | 'Goals' 
  | 'Preferences' 
  | 'Directives' 
  | 'General';

export type FeedbackType = 'like' | 'dislike' | 'consumed' | 'saved' | 'more_like_this' | 'not_interested';

export type SocialPlatform =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'x'
  | 'reddit'
  | 'facebook'
  | 'linkedin'
  | 'pinterest'
  | 'snapchat'
  | 'twitch'
  | 'github'
  | 'spotify'
  | 'discord'
  | 'web';

export interface AlternativeSocialOption {
  platform: SocialPlatform;
  platformDisplayName: string;
  webUrl: string;
  appDeepLink?: string;
  handle?: string;
}

export interface SocialProfileCard {
  id: string;
  targetName: string;
  platform: SocialPlatform;
  platformDisplayName: string;
  profileTitle: string;
  handle?: string;
  description?: string;
  webUrl: string;
  appDeepLink?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  subscriberCount?: string;
  followersCount?: string;
  category?: string;
  searchQuery?: string;
  isSearchFallback?: boolean;
  directLaunchSuggested?: boolean;
  buttonLabel?: string;
  alternativeOptions?: AlternativeSocialOption[];
}

export type ActionType = 
  | 'timer' 
  | 'note' 
  | 'task' 
  | 'memory' 
  | 'recommendation' 
  | 'resource' 
  | 'navigation' 
  | 'setting' 
  | 'volume' 
  | 'speech_control' 
  | 'app_lock' 
  | 'device_control'
  | 'device_action'
  | 'device_status'
  | 'power_confirmation'
  | 'media_control'
  | 'audiomack_play'
  | 'image_generation'
  | 'generate_image'
  | 'weather'
  | 'time_query'
  | 'social_search'
  | 'open_link'
  | 'phone_call'
  | 'team_inquiry'
  | 'speech';

export interface GroundingSource {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  sourceType?: 'encyclopedia' | 'official_doc' | 'reputable_publication' | 'database' | 'search_grounding';
}

export type UserIntent =
  | 'GENERAL_KNOWLEDGE'
  | 'CURRENT_INFORMATION'
  | 'RECOMMENDATION'
  | 'SEARCH'
  | 'SOCIAL_SEARCH'
  | 'OPEN_LINK'
  | 'PHONE_CALL'
  | 'MEDIA_CONTROL'
  | 'AUDIOMACK_PLAY'
  | 'DEVICE_ACTION'
  | 'DEVICE_STATUS'
  | 'BATTERY_INFO'
  | 'STORAGE_INFO'
  | 'WEATHER'
  | 'TIME_QUERY'
  | 'EXPLANATION'
  | 'COMPARISON'
  | 'HOW_TO'
  | 'CREATIVE_REQUEST'
  | 'PERSONAL_MEMORY'
  | 'DEVICE_SETTING'
  | 'UTILITY_ACTION'
  | 'GENERAL_CONVERSATION';

// ==========================================
// Vox Permissions Dashboard & Feature Toggles
// ==========================================

export type FeaturePermissionKey =
  | 'contacts_calling'
  | 'microphone'
  | 'voice_assistant'
  | 'media_control'
  | 'audiomack_integration'
  | 'notifications'
  | 'device_information'
  | 'weather'
  | 'location'
  | 'voice_commands'
  | 'device_actions'
  | 'overlay_display'
  | 'memory'
  | 'camera_emotion';

export type FeatureCapabilityStatus = 'AVAILABLE' | 'ENABLED' | 'UNAVAILABLE';

export interface FeaturePermissionConfig {
  key: FeaturePermissionKey;
  name: string;
  category: 'phone' | 'media' | 'system' | 'privacy' | 'ai' | 'appearance';
  description: string;
  supportedOnWeb: boolean;
  requiresNativeAndroid: boolean;
  unavailableReason?: string;
}

export type VoxPermissionsMap = Record<FeaturePermissionKey, boolean>;

// ==========================================
// Media & Audiomack Control Types
// ==========================================

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationSeconds: number;
  coverUrl?: string;
  audiomackUrl?: string;
  deepLink?: string;
  isAudiomack?: boolean;
  genre?: string;
}

export interface MediaPlaybackState {
  isPlaying: boolean;
  currentTrack: MediaTrack | null;
  positionSeconds: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  service: 'audiomack' | 'system' | 'web';
  queue: MediaTrack[];
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
}

// ==========================================
// Weather & Time Types
// ==========================================

export interface WeatherData {
  city: string;
  region?: string;
  temperatureC: number;
  temperatureF: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeedKmh: number;
  chanceOfRain: number;
  icon: string;
  forecast: Array<{
    day: string;
    condition: string;
    highC: number;
    lowC: number;
    highF: number;
    lowF: number;
    chanceOfRain: number;
  }>;
  hourly: Array<{
    time: string;
    tempC: number;
    tempF: number;
    chanceOfRain: number;
    condition: string;
  }>;
  isLocationApproximate: boolean;
  retrievedAt: string;
}

export interface TimeZoneInfo {
  location: string;
  formattedTime: string;
  formattedDate: string;
  timeZone: string;
  offsetString: string;
  isLocal: boolean;
}

// ==========================================
// Device Status & Battery / Storage Types
// ==========================================

export interface BatteryStatusInfo {
  isSupported: boolean;
  level: number; // 0 to 100
  isCharging: boolean;
  chargingTime: number | null; // seconds
  dischargingTime: number | null; // seconds
  formattedRemainingEstimate: string;
  batterySaverActive: boolean;
}

export interface StorageStatusInfo {
  isSupported: boolean;
  usedBytes: number;
  quotaBytes: number;
  usedPercentage: number;
  formattedUsed: string;
  formattedTotal: string;
  formattedAvailable: string;
  isLowStorage: boolean;
}

export interface DeviceStatusReport {
  battery: BatteryStatusInfo;
  storage: StorageStatusInfo;
  isOnline: boolean;
  effectiveNetworkType: string;
  downlinkSpeedMbps: number | null;
  rttMs: number | null;
  bluetoothSupported: boolean;
  wifiSupported: boolean;
  microphonePermission: 'granted' | 'denied' | 'prompt' | 'unsupported';
  cameraPermission: 'granted' | 'denied' | 'prompt' | 'unsupported';
  locationPermission: 'granted' | 'denied' | 'prompt' | 'unsupported';
  notificationsPermission: 'granted' | 'denied' | 'default' | 'unsupported';
}

// ==========================================
// Phone Assistant & Contact Call Types
// ==========================================

export type SimSlot = 1 | 2;

export interface ContactPhoneNumber {
  id: string;
  number: string;
  label: 'Mobile' | 'Home' | 'Work' | 'Main' | 'Other';
  isDefault?: boolean;
}

export interface DeviceContact {
  id: string;
  name: string;
  relationship?: 'Mom' | 'Dad' | 'Brother' | 'Sister' | 'Spouse' | 'Friend' | 'Manager' | 'Colleague' | 'Other';
  phoneNumbers: ContactPhoneNumber[];
  email?: string;
  avatarColor?: string;
  isFavorite?: boolean;
}

export type CallState = 'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTED' | 'ENDED' | 'FAILED';

export interface ActiveCallSession {
  id: string;
  contactName: string;
  number: string;
  label?: string;
  simSlot: SimSlot;
  simCarrierName?: string;
  state: CallState;
  durationSeconds: number;
  startedAt: number;
  endedAt?: number;
  failureReason?: string;
  isMuted: boolean;
  isSpeaker: boolean;
}

export interface PhoneCallActionData {
  id: string;
  targetName: string;
  contact?: DeviceContact;
  selectedNumber?: string;
  selectedLabel?: string;
  selectedSim?: SimSlot;
  simCarrierName?: string;
  requiresNumberChoice?: boolean;
  requiresSimChoice?: boolean;
  requiresContactChoice?: boolean;
  matchingContacts?: DeviceContact[];
  status: 'ready_to_call' | 'need_clarification' | 'permission_required' | 'not_found';
  message: string;
  autoDirectCall?: boolean;
  dialUrl?: string;
}

export interface PhoneAssistantSettings {
  enabled: boolean;
  readContactsPermission: 'granted' | 'denied' | 'prompt';
  callPhonePermission: 'granted' | 'denied' | 'prompt';
  preferredSim: 'always_ask' | 'sim_1' | 'sim_2';
  sim1Carrier: string;
  sim2Carrier: string;
  dualSimEnabled: boolean;
  confirmCallsBeforePlacing: boolean;
  localMatchingOnly: boolean;
  allowRelationshipMatching: boolean;
}

export interface ActionPayload {
  type: ActionType;
  data: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: ActionPayload | null;
  provider?: 'gemini' | 'demo';
  sources?: GroundingSource[];
  intent?: UserIntent;
  searchQueries?: string[];
  isGroundingUsed?: boolean;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  key?: string;
  value: string;
  confidence?: number;
  source: 'user_explicit' | 'learned' | 'manual';
  timestamp: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  creator?: string;
  category: ResourceCategory;
  description: string;
  tags: string[];
  userRating?: number; // 1 to 5 stars
  rating?: string; // Critic/community score e.g. "9.4/10" or "4.9★"
  isFavorite?: boolean;
  saved?: boolean;
  dateAdded: string;
  timestamp: string;
  lastViewedAt?: string;
  imageUrl?: string;
  link?: string;
  notes?: string;
  recommendationReason?: string;
  reason?: string;
  userStatus?: 'none' | 'liked' | 'disliked' | 'consumed' | 'saved';
  source?: 'ai_recommendation' | 'user_added' | 'imported';
}

export type RecommendationItem = ResourceItem;

export type ResourceSortOption = 
  | 'recently_added' 
  | 'recently_viewed' 
  | 'highest_rated' 
  | 'title_asc' 
  | 'favorites_first';

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  createdAt: string;
  completed?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color?: string;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
}

export interface AssistantSettings {
  personaStyle: 'balanced' | 'concise' | 'creative' | 'technical' | 'chill';
  responseLength: 'compact' | 'adaptive' | 'comprehensive';
  temperature: number;
  customInstruction: string;
  
  // Advanced Voice Controls & Engine
  voiceURI?: string;
  defaultVoiceURI?: string;
  voicePersonality: 'classic' | 'deep' | 'gentle' | 'calm' | 'energetic' | 'professional' | 'bright' | 'friendly' | 'warm';
  speechRate: number;
  speechPitch: number;
  voiceVolume: number; // 0.0 to 1.0 specifically for speech synthesizer
  autoSpeak: boolean;
  voiceResponsesEnabled: boolean; // Voice responses on/off
  listeningSoundEnabled: boolean; // Listening sound on/off
  soundEffectsEnabled: boolean;
  selectedVoiceEngine: string; // e.g. 'web_speech_api'
  
  memoryEnabled: boolean;
  accentColor: string;
  hapticFeedback: boolean;
  
  // App & Device Settings Controls
  theme: 'dark' | 'light' | 'cyberpunk';
  fontSize: 'normal' | 'large' | 'compact';
  orbSpeed: number; // 0.5 to 2.0
  orbGlowIntensity: number; // 0.5 to 2.0
  assistantVolume: number; // 0.0 to 1.0
  isMuted: boolean;
  notificationsEnabled: boolean;
  
  // Overlay & Display Over Other Apps Settings
  displayOverOtherAppsRequested: boolean;
  floatingOrbEnabled: boolean;
  floatingOrbPosition: { x: number; y: number };
  
  // Security & Voice Access
  voiceLockEnabled: boolean;
  securityPin: string; // 4 digits
  isAppLocked: boolean;
  voiceTriggerPhrase: string; // e.g. "hey aura"
  requireAuthForSensitiveData: boolean;

  // Phone, SIM & Contact Assistant
  phoneAssistant?: PhoneAssistantSettings;

  // Microphone & Speech Input Controls
  selectedMicrophoneDeviceId?: string;
  micInputSensitivity?: number; // 0.5 to 3.0, default 1.2
  noiseReductionEnabled?: boolean; // default true
  echoCancellationEnabled?: boolean; // default true
  autoSpeechDetectionEnabled?: boolean; // default true
  silenceTimeoutMs?: number; // default 2200ms
  
  // Creator Workspace & Personalized State
  userName?: string;
  userId?: string;
  lastActiveProjectId?: string;
  lastActiveProjectTitle?: string;

  // Granular Vox Permissions & Feature Dashboard
  voxPermissions?: VoxPermissionsMap;
}

export const FEATURE_PERMISSION_CONFIGS: FeaturePermissionConfig[] = [
  {
    key: 'contacts_calling',
    name: 'Contacts & Calling',
    category: 'phone',
    description: 'Enables on-device address book lookup, SIM routing, and telephone calling through Android Telecom / tel: schemes.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'microphone',
    name: 'Microphone',
    category: 'privacy',
    description: 'Allows real-time voice speech recognition and hands-free spoken prompt listening.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'voice_assistant',
    name: 'Voice Assistant & TTS',
    category: 'ai',
    description: 'Enables spoken voice synthesis responses and natural conversation audio feedback.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'media_control',
    name: 'Media Control',
    category: 'media',
    description: 'Controls music playback (Play, Pause, Next, Prev, Volume) via Web MediaSession & Android Media APIs.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'audiomack_integration',
    name: 'Audiomack Integration',
    category: 'media',
    description: 'Enables voice-driven song and artist discovery with official Audiomack launches and deep links without passwords.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'notifications',
    name: 'Notifications',
    category: 'system',
    description: 'Sends system alerts, timer completions, and background reminders to your device.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'device_information',
    name: 'Device Information',
    category: 'system',
    description: 'Reads battery percentage, charging state, storage metrics, and network status via standard APIs.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'weather',
    name: 'Weather Forecast',
    category: 'system',
    description: 'Provides live meteorological conditions, precipitation probabilities, and forecasts.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'location',
    name: 'Location',
    category: 'privacy',
    description: 'Uses approximate GPS coordinates for localized weather and time information. Never tracked silently.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'voice_commands',
    name: 'Voice Commands',
    category: 'phone',
    description: 'Interprets device voice shortcuts like "open settings", "turn off screen", and "lock phone".',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'device_actions',
    name: 'Device Actions & Power Safety',
    category: 'phone',
    description: 'Handles system-level actions (Restart, Power confirmation modal, Wi-Fi/Bluetooth settings bridge).',
    supportedOnWeb: true,
    requiresNativeAndroid: true,
    unavailableReason: 'Physical OS hardware reboot/power management requires Android Device Owner / Root signature.',
  },
  {
    key: 'overlay_display',
    name: 'Overlay / Display Over Other Apps',
    category: 'appearance',
    description: 'Renders a floating movable Orb HUD over the desktop or Android home screen (SYSTEM_ALERT_WINDOW).',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'memory',
    name: 'User Memory & Preferences',
    category: 'ai',
    description: 'Stores personal preferences, saved facts, and conversational memories with full export and audit rights.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
  {
    key: 'camera_emotion',
    name: 'Camera & Optional Emotion Features',
    category: 'privacy',
    description: 'Optional camera access for emotion recognition and visual context input. Disabled by default.',
    supportedOnWeb: true,
    requiresNativeAndroid: false,
  },
];

export const DEFAULT_VOX_PERMISSIONS: VoxPermissionsMap = {
  contacts_calling: true,
  microphone: true,
  voice_assistant: true,
  media_control: true,
  audiomack_integration: true,
  notifications: true,
  device_information: true,
  weather: true,
  location: false, // Default off for privacy
  voice_commands: true,
  device_actions: false, // Default off for safety
  overlay_display: true,
  memory: true,
  camera_emotion: false, // Default off for privacy
};

// ==========================================
// USER SNAPSHOT, SYNC & SESSION DATA TYPES
// ==========================================

export type SyncState =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'retrying'
  | 'temporary_fallback'
  | 'offline'
  | 'error';

export interface UserSnapshotDiagnostics {
  retryCount: number;
  maxRetries: number;
  lastError?: string | null;
  lastAttemptAt?: string | null;
  isSafeTemporarySession: boolean;
  persistedLocally: boolean;
  networkLatencyMs?: number;
}

export interface UserSnapshot {
  snapshotId: string;
  userId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  sessionStatus: 'active' | 'temporary' | 'syncing' | 'synced' | 'offline';
  settings: Partial<AssistantSettings>;
  activeProjectId: string;
  recentProjectIds: string[];
  lastSyncAt: string;
  diagnostics: UserSnapshotDiagnostics;
  stats?: {
    totalConversationsCount: number;
    totalMemoriesCount: number;
    totalResourcesCount: number;
    totalTasksCount: number;
  };
}

export interface SyncStatus {
  state: SyncState;
  statusMessage: string;
  lastSynced: string | null;
  pendingChangesCount: number;
  retries: number;
  hasError: boolean;
  errorMsg: string | null;
  isOnline: boolean;
}

// ==========================================
// ANIVOX PROJECT CONTEXT DATA TYPES
// ==========================================

export interface ProjectCharacter {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string[];
  voiceProfile?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface ProjectConversationSummary {
  id: string;
  title: string;
  lastMessageSnippet: string;
  updatedAt: string;
  messageCount: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'script' | 'lore' | 'notes' | 'asset' | 'audio';
  size: string;
  updatedAt: string;
  summary?: string;
  content?: string;
  isLoaded: boolean;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedCharacterId?: string;
}

export interface ProjectMemoryItem {
  id: string;
  key: string;
  value: string;
  category: string;
  createdAt: string;
}

export interface ProjectContext {
  id: string;
  title: string;
  tagline: string;
  description: string;
  genre: string;
  coverUrl?: string;
  updatedAt: string;
  createdAt: string;
  activeCharacters: ProjectCharacter[];
  recentConversations: ProjectConversationSummary[];
  relevantFiles: ProjectFile[];
  currentTasks: ProjectTask[];
  savedMemories: ProjectMemoryItem[];
  metadata: {
    totalFilesCount: number;
    totalDialogueLines: number;
    isArchived?: boolean;
    isDefault?: boolean;
  };
}

