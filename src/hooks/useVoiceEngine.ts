import { useState, useEffect, useRef, useCallback } from 'react';
import { AssistantSettings } from '../types/assistant';
import { soundEffects } from '../services/soundEffects';

export type MicState = 'idle' | 'listening' | 'voice_detected' | 'transcribing' | 'speaking' | 'error';

export interface AudioInputDeviceInfo {
  deviceId: string;
  label: string;
  groupId?: string;
}

interface UseVoiceEngineProps {
  settings: AssistantSettings;
  onTranscriptReady: (transcript: string) => void;
  onListeningStateChange?: (isListening: boolean) => void;
  onSpeakingStateChange?: (isSpeaking: boolean) => void;
}

export function useVoiceEngine({
  settings,
  onTranscriptReady,
  onListeningStateChange,
  onSpeakingStateChange,
}: UseVoiceEngineProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micState, setMicState] = useState<MicState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt');
  const [micDiagnosticInfo, setMicDiagnosticInfo] = useState<string>('');
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [decibels, setDecibels] = useState<number>(-60);
  const [waveformBars, setWaveformBars] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [availableMicrophones, setAvailableMicrophones] = useState<AudioInputDeviceInfo[]>([]);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const maxListeningTimerRef = useRef<any>(null);
  const hasDetectedSpeechRef = useRef<boolean>(false);
  const currentInterimRef = useRef<string>('');
  const restartAttemptsRef = useRef<number>(0);

  // Monitor network online/offline status for speech recognition resilience
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMicDiagnosticInfo('');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setMicDiagnosticInfo('Internet connection offline. Voice recognition requires network connectivity. Text input is active.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enumerate audio input devices
  const refreshAudioDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs: AudioInputDeviceInfo[] = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${index + 1} (${d.deviceId.slice(0, 5)}...)`,
          groupId: d.groupId,
        }));
      setAvailableMicrophones(audioInputs);
    } catch {
      // Non-critical device enumeration error
    }
  }, []);

  // Check initial permission status via Permissions API if available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((permissionStatus) => {
          setMicPermission(permissionStatus.state as any);
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state as any);
            if (permissionStatus.state === 'granted') {
              refreshAudioDevices();
            }
          };
        })
        .catch(() => {});
    }
    refreshAudioDevices();
  }, [refreshAudioDevices]);

  // Initialize Speech Synthesis and check Recognition Support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        setMicPermission('unsupported');
        setMicDiagnosticInfo('Web Speech Recognition is not supported in this browser. Text input is active as full fallback.');
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        const updateVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          setVoices(availableVoices);
        };
        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      stopListening();
      stopSpeaking();
      stopAudioVisualizer();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (maxListeningTimerRef.current) clearTimeout(maxListeningTimerRef.current);
    };
  }, []);

  // Sync sound effects setting and volume
  useEffect(() => {
    soundEffects.setEnabled(settings.soundEffectsEnabled && !settings.isMuted);
    soundEffects.setVolume(settings.isMuted ? 0 : (settings.assistantVolume ?? 1.0));
  }, [settings.soundEffectsEnabled, settings.assistantVolume, settings.isMuted]);

  // Explicit permission request method
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicPermission('unsupported');
      setMicDiagnosticInfo('MediaDevices API not available in current security context.');
      return false;
    }
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: settings.echoCancellationEnabled ?? true,
          noiseSuppression: settings.noiseReductionEnabled ?? true,
          autoGainControl: true,
          deviceId: settings.selectedMicrophoneDeviceId ? { exact: settings.selectedMicrophoneDeviceId } : undefined,
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMicPermission('granted');
      setMicDiagnosticInfo('Microphone access verified and active.');
      stream.getTracks().forEach((track) => track.stop());
      refreshAudioDevices();
      return true;
    } catch (err: any) {
      console.warn('Microphone permission request error:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      setMicPermission(isDenied ? 'denied' : 'unsupported');
      setMicDiagnosticInfo(
        err.name === 'SecurityError' || err.name === 'NotAllowedError'
          ? 'Microphone access is restricted by preview sandbox or site permissions. Seamless text input fallback is active.'
          : `Microphone status: ${err.message || err.name}`
      );
      return false;
    }
  }, [refreshAudioDevices, settings.echoCancellationEnabled, settings.noiseReductionEnabled, settings.selectedMicrophoneDeviceId]);

  // Advanced Web Audio pipeline: Noise high-pass/low-pass filter + Dynamic Compressor + Sensitivity Gain
  const startAudioVisualizer = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: settings.echoCancellationEnabled ?? true,
          noiseSuppression: settings.noiseReductionEnabled ?? true,
          autoGainControl: true,
          deviceId: settings.selectedMicrophoneDeviceId ? { exact: settings.selectedMicrophoneDeviceId } : undefined,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      // Highpass Filter (85 Hz) - cuts low rumble, AC hum, wind
      const highPassFilter = audioCtx.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.setValueAtTime(85, audioCtx.currentTime);

      // Lowpass Filter (7500 Hz) - cuts high-frequency electrical hiss
      const lowPassFilter = audioCtx.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.setValueAtTime(7500, audioCtx.currentTime);

      // Dynamic Range Compressor - levels quiet whispers and limits loud sounds
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-45, audioCtx.currentTime);
      compressor.knee.setValueAtTime(20, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.005, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.1, audioCtx.currentTime);

      // Sensitivity Gain Node (scaled according to user setting 0.5x to 3.0x)
      const gainNode = audioCtx.createGain();
      const sensitivityMultiplier = settings.micInputSensitivity ?? 1.2;
      gainNode.gain.setValueAtTime(sensitivityMultiplier, audioCtx.currentTime);
      gainNodeRef.current = gainNode;

      // Analyser Node for FFT frequency data & Decibel measurement
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      // Connect pipeline: source -> highpass -> lowpass -> gain -> compressor -> analyser
      source.connect(highPassFilter);
      highPassFilter.connect(lowPassFilter);
      lowPassFilter.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        const bars: number[] = [];

        // Sample 8 frequency bands
        const step = Math.floor(dataArray.length / 8);
        for (let b = 0; b < 8; b++) {
          const val = dataArray[b * step] || 0;
          bars.push(Math.min(100, Math.round((val / 255) * 100)));
        }
        setWaveformBars(bars);

        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1.0, (avg / 128) * (settings.micInputSensitivity ?? 1.2));
        setAudioLevel(normalized);

        // Approximate decibel estimation (-60dB to 0dB)
        const computedDb = avg > 0 ? Math.round(20 * Math.log10(avg / 255)) : -60;
        setDecibels(computedDb);

        // Smart Voice Activity Detection threshold
        const speechThreshold = (settings.autoSpeechDetectionEnabled ?? true) ? 0.06 : 0.12;
        if (normalized > speechThreshold && !hasDetectedSpeechRef.current) {
          hasDetectedSpeechRef.current = true;
          setMicState('voice_detected');
        }

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch {
      // Audio level visualizer is optional enhancement
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setAudioLevel(0);
    setDecibels(-60);
    setWaveformBars([0, 0, 0, 0, 0, 0, 0, 0]);
  };

  // Test Microphone Function with interactive visualizer
  const startTestingMic = async () => {
    setIsTestingMic(true);
    await startAudioVisualizer();
  };

  const stopTestingMic = () => {
    setIsTestingMic(false);
    stopAudioVisualizer();
  };

  // Start Voice Recognition with smart pause handling & configurable silence threshold
  const startListening = useCallback(() => {
    if (!navigator.onLine) {
      setMicDiagnosticInfo('Internet connection is offline. Speech recognition needs connectivity.');
      setMicState('error');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicDiagnosticInfo('Speech Recognition is unavailable in this environment. Text input is ready.');
      setMicState('error');
      return;
    }

    // Stop speaking if currently speaking
    stopSpeaking();

    // Clear previous timers
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxListeningTimerRef.current) clearTimeout(maxListeningTimerRef.current);
    hasDetectedSpeechRef.current = false;
    currentInterimRef.current = '';
    restartAttemptsRef.current = 0;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      // Continuous allows longer sentences without abrupt cuts
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      const silenceTimeout = settings.silenceTimeoutMs || 2200;

      const resetSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          // If we have some interim words or final candidate, finalize them
          if (currentInterimRef.current && currentInterimRef.current.trim()) {
            const captured = currentInterimRef.current.trim();
            stopListening();
            if (settings.listeningSoundEnabled ?? true) {
              soundEffects.playListenStop();
            }
            onTranscriptReady(captured);
          } else {
            stopListening();
          }
        }, silenceTimeout);
      };

      recognition.onstart = () => {
        setIsListening(true);
        setMicState('listening');
        setMicPermission('granted');
        setInterimTranscript('');
        setTranscript('');
        onListeningStateChange?.(true);
        if (settings.listeningSoundEnabled ?? true) {
          soundEffects.playListenStart();
        }
        startAudioVisualizer();

        // Max listening safety window (12 seconds max if no speech heard at all)
        maxListeningTimerRef.current = setTimeout(() => {
          if (!hasDetectedSpeechRef.current) {
            setMicDiagnosticInfo("Didn't hear anything. Tap mic to try again.");
            stopListening();
          }
        }, 12000);
      };

      recognition.onresult = (event: any) => {
        hasDetectedSpeechRef.current = true;
        setMicState('transcribing');
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const activeWords = (transcript + ' ' + (final || interim)).trim();
        currentInterimRef.current = activeWords;
        setInterimTranscript(interim);

        // Reset silence pause timer on active speech
        resetSilenceTimer();

        if (final && final.trim()) {
          setTranscript((prev) => (prev ? `${prev} ${final.trim()}` : final.trim()));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermission('denied');
          setMicDiagnosticInfo('Microphone permission blocked. Please enable it in browser settings or use text chat.');
        } else if (event.error === 'audio-capture') {
          setMicDiagnosticInfo('No audio capture device found.');
        } else if (event.error === 'no-speech') {
          setMicDiagnosticInfo("Didn't hear speech. Tap mic when you're ready.");
        } else if (event.error === 'network') {
          setMicDiagnosticInfo('Network issue with speech recognition service. Text input is ready.');
        }
        setMicState('error');
        setIsListening(false);
        onListeningStateChange?.(false);
        stopAudioVisualizer();
      };

      recognition.onend = () => {
        // If recognition closed but we captured speech, dispatch it
        if (currentInterimRef.current && currentInterimRef.current.trim() && isListening) {
          const finalCandidate = currentInterimRef.current.trim();
          onTranscriptReady(finalCandidate);
        }
        setIsListening(false);
        setMicState('idle');
        onListeningStateChange?.(false);
        stopAudioVisualizer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Error starting speech recognition:', err);
      setMicDiagnosticInfo('Could not initialize speech recognition. Use text chat.');
      setMicState('error');
      setIsListening(false);
      onListeningStateChange?.(false);
      stopAudioVisualizer();
    }
  }, [
    isListening,
    onListeningStateChange,
    onTranscriptReady,
    settings.autoSpeechDetectionEnabled,
    settings.listeningSoundEnabled,
    settings.micInputSensitivity,
    settings.silenceTimeoutMs,
    transcript,
  ]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxListeningTimerRef.current) clearTimeout(maxListeningTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setMicState('idle');
    onListeningStateChange?.(false);
    stopAudioVisualizer();
  }, [onListeningStateChange]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clean Markdown & Code for smooth spoken TTS output
  const sanitizeTextForSpeech = (text: string): string => {
    return text
      .replace(/```action[\s\S]*?```/g, '')
      .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_~#>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Text-To-Speech Output: Male Vox profile prioritized
  const speakText = useCallback(
    (textToSpeak: string, onEndCallback?: () => void) => {
      if (!synthRef.current || !textToSpeak) return;

      synthRef.current.cancel();

      // Check if voice responses are disabled globally or muted
      const isVoiceDisabled =
        settings.voiceResponsesEnabled === false || settings.isMuted || settings.assistantVolume === 0;
      if (isVoiceDisabled) {
        onEndCallback?.();
        return;
      }

      const cleanText = sanitizeTextForSpeech(textToSpeak);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      const effectiveVol = settings.voiceVolume ?? settings.assistantVolume ?? 1.0;
      utterance.volume = Math.max(0, Math.min(1, effectiveVol));

      // Apply voice selection
      if (settings.voiceURI) {
        const selectedVoice = voices.find((v) => v.voiceURI === settings.voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        const maleVoice =
          voices.find(
            (v) =>
              Boolean(v.lang && typeof v.lang === 'string' && v.lang.startsWith('en')) &&
              Boolean(
                v.name &&
                  typeof v.name === 'string' &&
                  (v.name.toLowerCase().includes('male') ||
                    v.name.toLowerCase().includes('daniel') ||
                    v.name.toLowerCase().includes('david') ||
                    v.name.toLowerCase().includes('george') ||
                    v.name.toLowerCase().includes('alex') ||
                    v.name.toLowerCase().includes('oliver') ||
                    v.name.toLowerCase().includes('guy'))
              )
          ) ||
          voices.find(
            (v) =>
              Boolean(v.lang && v.lang.startsWith('en')) &&
              Boolean(v.name && (v.name.includes('Google') || v.name.includes('Natural')))
          ) ||
          voices[0];

        if (maleVoice) utterance.voice = maleVoice;
      }

      utterance.rate = Math.max(0.5, Math.min(2.0, settings.speechRate || 1.0));
      utterance.pitch = Math.max(0.5, Math.min(1.5, settings.speechPitch || 1.0));

      utterance.onstart = () => {
        setIsSpeaking(true);
        setMicState('speaking');
        onSpeakingStateChange?.(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setMicState('idle');
        onSpeakingStateChange?.(false);
        onEndCallback?.();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        setIsSpeaking(false);
        setMicState('idle');
        onSpeakingStateChange?.(false);
      };

      synthRef.current.speak(utterance);
    },
    [settings, voices, onSpeakingStateChange]
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setMicState('idle');
    onSpeakingStateChange?.(false);
  }, [onSpeakingStateChange]);

  return {
    isListening,
    isSpeaking,
    micState,
    transcript,
    interimTranscript,
    micPermission,
    micDiagnosticInfo,
    isSupported,
    isOnline,
    voices,
    audioLevel,
    decibels,
    waveformBars,
    availableMicrophones,
    isTestingMic,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    stopSpeaking,
    requestMicPermission,
    refreshAudioDevices,
    startTestingMic,
    stopTestingMic,
  };
}
