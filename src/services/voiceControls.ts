// Voice Controls, Engine Adapters, and Voice Personalities for VOX by AniVox
// Vox is permanently a MALE digital companion. Voice synthesis reflects genuine male acoustics.

export type VoicePersonality =
  | 'classic'
  | 'deep'
  | 'gentle'
  | 'calm'
  | 'energetic'
  | 'professional'
  | 'bright';

export interface VoicePersonalityProfile {
  id: VoicePersonality;
  name: string;
  tagline: string;
  description: string;
  rateModifier: number; // multiplier e.g. 0.9x or 1.15x
  pitchModifier: number; // pitch offset e.g. 0.85 or 1.2
  recommendedVoiceKeywords: string[];
  previewPhrase: string;
  badgeColor: string;
}

export const VOICE_PERSONALITIES: Record<VoicePersonality, VoicePersonalityProfile> = {
  classic: {
    id: 'classic',
    name: 'Vox Classic',
    tagline: 'Warm, balanced, and conversational male companion',
    description: 'Natural balanced tempo with classic friendly inflection for daily productivity, questions, and ideas.',
    rateModifier: 1.0,
    pitchModifier: 0.98,
    recommendedVoiceKeywords: ['male', 'daniel', 'david', 'george', 'google', 'alex', 'oliver', 'natural'],
    previewPhrase: 'Hey there! Vox here from AniVox. Ready to assist you with anything you need.',
    badgeColor: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
  },
  deep: {
    id: 'deep',
    name: 'Vox Deep',
    tagline: 'Calm, deeper, confident, and authoritative resonance',
    description: 'Lower pitch spectrum with deliberate measured delivery for a commanding, grounded tone.',
    rateModifier: 0.92,
    pitchModifier: 0.78,
    recommendedVoiceKeywords: ['male', 'daniel', 'david', 'george', 'alex', 'fred', 'rishi'],
    previewPhrase: 'Calm, deeper and confident. Audio telemetry confirmed. Standing by for your directive.',
    badgeColor: 'from-purple-500/20 to-indigo-900/40 border-purple-500/40 text-purple-300',
  },
  gentle: {
    id: 'gentle',
    name: 'Vox Gentle',
    tagline: 'Comforting, grounded, and supportive',
    description: 'Comforting resonance with steady tempo designed for supportive check-ins and quiet environments.',
    rateModifier: 0.94,
    pitchModifier: 0.88,
    recommendedVoiceKeywords: ['male', 'david', 'daniel', 'alex', 'natural'],
    previewPhrase: 'You are making steady progress today. Whenever you need assistance, I am right here.',
    badgeColor: 'from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-300',
  },
  calm: {
    id: 'calm',
    name: 'Vox Calm',
    tagline: 'Measured, relaxed, and focused male cadence',
    description: 'Slightly slower speech rate with smooth, level pitch for focused study sessions and deep work.',
    rateModifier: 0.88,
    pitchModifier: 0.92,
    recommendedVoiceKeywords: ['male', 'soft', 'natural', 'daniel', 'george', 'david'],
    previewPhrase: 'All systems are serene and steady. Take your time, I am focused on your workflow.',
    badgeColor: 'from-teal-500/20 to-cyan-500/20 border-teal-500/40 text-teal-300',
  },
  energetic: {
    id: 'energetic',
    name: 'Vox Energetic',
    tagline: 'Fast-paced, vibrant, and enthusiastic',
    description: 'Elevated rate and brighter inflection for rapid brainstorming, gaming, and workouts.',
    rateModifier: 1.16,
    pitchModifier: 1.05,
    recommendedVoiceKeywords: ['male', 'fast', 'google', 'alex', 'daniel'],
    previewPhrase: 'Let us get right into gear! High velocity mode engaged, ready to build and explore!',
    badgeColor: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
  },
  professional: {
    id: 'professional',
    name: 'Vox Professional',
    tagline: 'Structured, articulate, and clear',
    description: 'Crisp articulation designed for scientific overviews, factual breakdowns, and research.',
    rateModifier: 1.02,
    pitchModifier: 0.95,
    recommendedVoiceKeywords: ['male', 'daniel', 'oliver', 'david', 'google', 'george'],
    previewPhrase: 'Factual analysis verified. Delivering structured architectural and technical recommendations.',
    badgeColor: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300',
  },
  bright: {
    id: 'bright',
    name: 'Vox Bright',
    tagline: 'Light, friendly, and high-clarity male voice',
    description: 'Clear mid-range with crisp treble emphasis for crystal clear speech in noisy environments.',
    rateModifier: 1.06,
    pitchModifier: 1.02,
    recommendedVoiceKeywords: ['male', 'google', 'daniel', 'alex'],
    previewPhrase: 'Crystal clear transmission active! Every word is tuned for maximum fidelity.',
    badgeColor: 'from-cyan-400/20 to-sky-500/20 border-cyan-400/40 text-cyan-200',
  },
};

export const SUPPORTED_VOICE_PROVIDERS = [
  {
    id: 'web_speech',
    name: 'Browser Web Speech API',
    description: 'Standard W3C SpeechSynthesis engine using local operating system voices with zero cloud latency.',
    isAvailable: typeof window !== 'undefined' && 'speechSynthesis' in window,
    latency: '<10ms (Instant)',
    requiresNetwork: false,
    privacyScore: '100% On-Device',
  },
  {
    id: 'android_native_tts',
    name: 'Android TextToSpeech Engine',
    description: 'Native Android OS Speech service (Google TTS / Samsung TTS) via JavaScript Interface Bridge.',
    isAvailable: typeof window !== 'undefined' && Boolean((window as any).AndroidVoiceBridge),
    latency: '<20ms (Native)',
    requiresNetwork: false,
    privacyScore: '100% On-Device',
  },
  {
    id: 'gemini_tts',
    name: 'Google Gemini Neural Speech',
    description: 'Cloud Neural voice synthesis using Google GenAI multimodal acoustic embeddings.',
    isAvailable: true,
    latency: '~250ms (Cloud)',
    requiresNetwork: true,
    privacyScore: 'Encrypted Transit',
  },
];
