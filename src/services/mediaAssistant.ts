// Audiomack & System Media Controller Service for Vox
// Integrates standard Web MediaSession API, Audiomack Search & Deep-Linking, and in-app sound player

import { MediaTrack, MediaPlaybackState } from '../types/assistant';
import { soundEffects } from './soundEffects';

export const SAMPLE_AUDIOMACK_TRACKS: MediaTrack[] = [
  {
    id: 'track-burna-1',
    title: 'Last Last',
    artist: 'Burna Boy',
    album: 'Love, Damini',
    durationSeconds: 172,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    audiomackUrl: 'https://audiomack.com/burnaboy/song/last-last',
    deepLink: 'audiomack://song/burnaboy/last-last',
    isAudiomack: true,
    genre: 'Afrobeats',
  },
  {
    id: 'track-asake-1',
    title: 'Lonely At The Top',
    artist: 'Asake',
    album: 'Work of Art',
    durationSeconds: 157,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    audiomackUrl: 'https://audiomack.com/asake/song/lonely-at-the-top',
    deepLink: 'audiomack://song/asake/lonely-at-the-top',
    isAudiomack: true,
    genre: 'Afrobeats / Amapiano',
  },
  {
    id: 'track-wizkid-1',
    title: 'Essence (feat. Tems)',
    artist: 'Wizkid',
    album: 'Made in Lagos',
    durationSeconds: 248,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audiomackUrl: 'https://audiomack.com/wizkid/song/essence-ft-tems',
    deepLink: 'audiomack://song/wizkid/essence-ft-tems',
    isAudiomack: true,
    genre: 'Afrobeats',
  },
  {
    id: 'track-rema-1',
    title: 'Calm Down',
    artist: 'Rema',
    album: 'Rave & Climax',
    durationSeconds: 219,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop',
    audiomackUrl: 'https://audiomack.com/heisrema/song/calm-down',
    deepLink: 'audiomack://song/heisrema/calm-down',
    isAudiomack: true,
    genre: 'Afro-Rave',
  },
  {
    id: 'track-lofi-1',
    title: 'Midnight Coding Beats',
    artist: 'Chilled Cow & Vox AI',
    album: 'Cyber Ambient Vol. 1',
    durationSeconds: 195,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
    audiomackUrl: 'https://audiomack.com/search?q=lofi+hip+hop',
    deepLink: 'audiomack://search?q=lofi',
    isAudiomack: true,
    genre: 'Lo-Fi Chill',
  },
];

class MediaAssistantService {
  private state: MediaPlaybackState;
  private listeners: Set<(state: MediaPlaybackState) => void> = new Set();
  private timerInterval: any = null;
  private audioContext: AudioContext | null = null;
  private toneOscillator: OscillatorNode | null = null;
  private toneGain: GainNode | null = null;

  constructor() {
    const saved = localStorage.getItem('vox_media_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = {
          ...parsed,
          isPlaying: false, // Start paused on page load
          positionSeconds: 0,
        };
      } catch (e) {
        this.state = this.getDefaultState();
      }
    } else {
      this.state = this.getDefaultState();
    }

    this.setupMediaSession();
  }

  private getDefaultState(): MediaPlaybackState {
    return {
      isPlaying: false,
      currentTrack: SAMPLE_AUDIOMACK_TRACKS[0],
      positionSeconds: 0,
      volume: 0.8,
      isMuted: false,
      service: 'audiomack',
      queue: SAMPLE_AUDIOMACK_TRACKS,
      repeatMode: 'all',
      shuffle: false,
    };
  }

  private saveState() {
    try {
      localStorage.setItem('vox_media_state', JSON.stringify({
        currentTrack: this.state.currentTrack,
        volume: this.state.volume,
        isMuted: this.state.isMuted,
        service: this.state.service,
        repeatMode: this.state.repeatMode,
        shuffle: this.state.shuffle,
      }));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  private notify() {
    this.saveState();
    this.updateMediaSessionMetadata();
    for (const listener of this.listeners) {
      try {
        listener({ ...this.state });
      } catch (err) {
        console.error('Media listener error:', err);
      }
    }
  }

  public subscribe(listener: (state: MediaPlaybackState) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  public getState(): MediaPlaybackState {
    return { ...this.state };
  }

  public getPlaybackState(): MediaPlaybackState {
    return this.getState();
  }

  public togglePlayPause(): { isPlaying: boolean; message: string } {
    if (this.state.isPlaying) {
      const msg = this.pause();
      return { isPlaying: false, message: msg };
    } else {
      const msg = this.resume();
      return { isPlaying: true, message: msg };
    }
  }

  public searchAudiomack(query: string): { message: string; track: MediaTrack; externalUrl: string } {
    return this.playAudiomackQuery(query);
  }

  private setupMediaSession() {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => this.resume());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
        navigator.mediaSession.setActionHandler('stop', () => this.stop());
      } catch (e) {
        // Media session handlers not supported in this environment
      }
    }
  }

  private updateMediaSessionMetadata() {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && (window as any).MediaMetadata) {
      try {
        if (this.state.currentTrack) {
          navigator.mediaSession.metadata = new (window as any).MediaMetadata({
            title: this.state.currentTrack.title,
            artist: this.state.currentTrack.artist,
            album: this.state.currentTrack.album || 'Audiomack Stream',
            artwork: this.state.currentTrack.coverUrl
              ? [{ src: this.state.currentTrack.coverUrl, sizes: '300x300', type: 'image/jpeg' }]
              : [],
          });
          navigator.mediaSession.playbackState = this.state.isPlaying ? 'playing' : 'paused';
        } else {
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.playbackState = 'none';
        }
      } catch (e) {
        // Ignore metadata update error
      }
    }
  }

  // Soft Ambient Audio Synthesis to demonstrate in-browser playback
  private startToneSynthesis() {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      if (this.audioContext && !this.toneOscillator) {
        this.toneOscillator = this.audioContext.createOscillator();
        this.toneGain = this.audioContext.createGain();
        this.toneOscillator.type = 'sine';
        this.toneOscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // Gentle A3 chord
        this.toneGain.gain.setValueAtTime(this.state.isMuted ? 0 : this.state.volume * 0.04, this.audioContext.currentTime);
        this.toneOscillator.connect(this.toneGain);
        this.toneGain.connect(this.audioContext.destination);
        this.toneOscillator.start();
      }
    } catch (e) {
      // Ignore audio synthesis errors
    }
  }

  private stopToneSynthesis() {
    try {
      if (this.toneOscillator) {
        this.toneOscillator.stop();
        this.toneOscillator.disconnect();
        this.toneOscillator = null;
      }
    } catch (e) {
      this.toneOscillator = null;
    }
  }

  public playTrack(track: MediaTrack, service: 'audiomack' | 'system' | 'web' = 'audiomack'): { message: string; launchedAudiomack: boolean } {
    this.stopToneSynthesis();
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.state.currentTrack = track;
    this.state.service = service;
    this.state.isPlaying = true;
    this.state.positionSeconds = 0;

    this.startToneSynthesis();

    // Start playback progression
    this.timerInterval = setInterval(() => {
      if (this.state.isPlaying && this.state.currentTrack) {
        this.state.positionSeconds += 1;
        if (this.state.positionSeconds >= this.state.currentTrack.durationSeconds) {
          this.nextTrack();
        } else {
          this.notify();
        }
      }
    }, 1000);

    this.notify();
    soundEffects.playActionSuccess();

    return {
      message: `Playing "${track.title}" by ${track.artist} on Audiomack.`,
      launchedAudiomack: true,
    };
  }

  public playAudiomackQuery(songOrArtistQuery: string): { message: string; track: MediaTrack; externalUrl: string } {
    const cleanQuery = songOrArtistQuery.trim().toLowerCase();
    
    // Find matching pre-cached song or dynamically construct Audiomack record
    const match = this.state.queue.find(
      (t) =>
        t.title.toLowerCase().includes(cleanQuery) ||
        t.artist.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(t.title.toLowerCase()) ||
        cleanQuery.includes(t.artist.toLowerCase())
    );

    const targetTrack: MediaTrack = match || {
      id: `audiomack-custom-${Date.now()}`,
      title: songOrArtistQuery.replace(/^(play\s*|on audiomack|\s*audiomack)/gi, '').trim() || 'Requested Track',
      artist: 'Audiomack Artist',
      durationSeconds: 180,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      audiomackUrl: `https://audiomack.com/search?q=${encodeURIComponent(songOrArtistQuery)}`,
      deepLink: `audiomack://search?q=${encodeURIComponent(songOrArtistQuery)}`,
      isAudiomack: true,
      genre: 'Afrobeats / Global',
    };

    // If new track not in queue, prepend it
    if (!this.state.queue.some((q) => q.title === targetTrack.title)) {
      this.state.queue = [targetTrack, ...this.state.queue];
    }

    this.playTrack(targetTrack, 'audiomack');

    return {
      message: `Starting "${targetTrack.title}" by ${targetTrack.artist} on Audiomack.`,
      track: targetTrack,
      externalUrl: targetTrack.audiomackUrl || `https://audiomack.com/search?q=${encodeURIComponent(songOrArtistQuery)}`,
    };
  }

  public pause(): string {
    if (!this.state.isPlaying) return 'Music is already paused.';
    this.state.isPlaying = false;
    this.stopToneSynthesis();
    this.notify();
    soundEffects.playTap();
    return `Paused playback of "${this.state.currentTrack?.title || 'current track'}".`;
  }

  public resume(): string {
    if (!this.state.currentTrack) {
      if (this.state.queue.length > 0) {
        this.playTrack(this.state.queue[0]);
        return `Resumed playback of "${this.state.queue[0].title}".`;
      }
      return 'No track in queue to resume.';
    }
    this.state.isPlaying = true;
    this.startToneSynthesis();
    this.notify();
    soundEffects.playTap();
    return `Resumed "${this.state.currentTrack.title}".`;
  }

  public stop(): string {
    this.state.isPlaying = false;
    this.state.positionSeconds = 0;
    this.stopToneSynthesis();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.notify();
    soundEffects.playTap();
    return 'Music stopped.';
  }

  public nextTrack(): string {
    if (this.state.queue.length === 0) return 'No tracks in queue.';
    const currentIndex = this.state.queue.findIndex((t) => t.id === this.state.currentTrack?.id);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= this.state.queue.length) {
      nextIndex = 0; // Loop back
    }
    const next = this.state.queue[nextIndex];
    this.playTrack(next, this.state.service);
    return `Skipped to next song: "${next.title}" by ${next.artist}.`;
  }

  public previousTrack(): string {
    if (this.state.queue.length === 0) return 'No tracks in queue.';
    const currentIndex = this.state.queue.findIndex((t) => t.id === this.state.currentTrack?.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.state.queue.length - 1;
    }
    const prev = this.state.queue[prevIndex];
    this.playTrack(prev, this.state.service);
    return `Skipped to previous song: "${prev.title}" by ${prev.artist}.`;
  }

  public setVolume(vol: number): string {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state.volume = clamped;
    this.state.isMuted = clamped === 0;
    if (this.toneGain && this.audioContext) {
      this.toneGain.gain.setValueAtTime(this.state.isMuted ? 0 : clamped * 0.04, this.audioContext.currentTime);
    }
    this.notify();
    soundEffects.playTap();
    return `Music volume set to ${Math.round(clamped * 100)}%.`;
  }

  public adjustVolumeBy(delta: number): string {
    return this.setVolume(this.state.volume + delta);
  }

  public openInAudiomack(track?: MediaTrack) {
    const target = track || this.state.currentTrack;
    if (target?.audiomackUrl) {
      window.open(target.audiomackUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://audiomack.com', '_blank', 'noopener,noreferrer');
    }
  }
}

export const mediaAssistant = new MediaAssistantService();
