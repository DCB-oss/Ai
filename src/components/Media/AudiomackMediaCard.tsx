import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ExternalLink,
  Radio,
  Disc3,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { MediaTrack, MediaPlaybackState } from '../../types/assistant';
import { mediaAssistant } from '../../services/mediaAssistant';
import { soundEffects } from '../../services/soundEffects';

interface AudiomackMediaCardProps {
  initialTrack?: MediaTrack | null;
  onClose?: () => void;
}

export const AudiomackMediaCard: React.FC<AudiomackMediaCardProps> = ({
  initialTrack,
  onClose,
}) => {
  const [playbackState, setPlaybackState] = useState<MediaPlaybackState>(mediaAssistant.getPlaybackState());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const unsubscribe = mediaAssistant.subscribe(setPlaybackState);
    if (initialTrack) {
      mediaAssistant.playTrack(initialTrack);
    }
    return () => unsubscribe();
  }, [initialTrack]);

  const currentTrack = playbackState.currentTrack;

  const handleTogglePlay = () => {
    mediaAssistant.togglePlayPause();
    soundEffects.playTap();
  };

  const handleNext = () => {
    mediaAssistant.nextTrack();
    soundEffects.playTap();
  };

  const handlePrev = () => {
    mediaAssistant.previousTrack();
    soundEffects.playTap();
  };

  const handleVolume = (newVol: number) => {
    mediaAssistant.setVolume(newVol);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = mediaAssistant.searchAudiomack(searchQuery.trim());
    setSearchResults(results);
    setIsSearching(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-5 rounded-3xl glass-panel border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,255,0.15)] max-w-xl mx-auto w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase text-white flex items-center gap-2">
              <span>Audiomack & Media Controller</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px]">
                Official Deep-Link Ready
              </span>
            </h3>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-white/40 hover:text-white px-2 py-1 rounded-lg bg-white/5"
          >
            Close
          </button>
        )}
      </div>

      {/* Active Track Banner */}
      {currentTrack ? (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
          {/* Cover Art */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/60 shrink-0 border border-white/10 shadow-lg">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${playbackState.isPlaying ? 'animate-pulse' : ''}`}
            />
            {playbackState.isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Disc3 className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            )}
          </div>

          {/* Details & Controls */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="text-base font-bold text-white truncate">
                {currentTrack.title}
              </h4>
              {currentTrack.genre && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  {currentTrack.genre}
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 truncate mt-0.5">
              {currentTrack.artist} • {currentTrack.album || 'Single'}
            </p>

            {/* Direct Official Audiomack Link */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <a
                href={currentTrack.audiomackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in Audiomack</span>
              </a>
              <span className="text-[10px] text-white/40">
                Direct safe link
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center">
          <Disc3 className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/60">No track currently loaded.</p>
          <p className="text-[11px] text-white/40 mt-1">
            Ask: "Vox, play Burna Boy on Audiomack" or search below.
          </p>
        </div>
      )}

      {/* Progress & Duration */}
      {currentTrack && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-mono">
            <span>{formatTime(playbackState.currentTime)}</span>
            <span>{formatTime(playbackState.duration || currentTrack.durationSeconds || 180)}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-300"
              style={{
                width: `${
                  ((playbackState.currentTime || 0) /
                    (playbackState.duration || currentTrack.durationSeconds || 180)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Main Playback Bar Controls */}
      <div className="flex items-center justify-between gap-4 pt-1">
        {/* Previous / Play / Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="w-12 h-12 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)]"
            title={playbackState.isPlaying ? 'Pause' : 'Play'}
          >
            {playbackState.isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 min-w-[120px]">
          {playbackState.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-white/40" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={playbackState.volume}
            onChange={(e) => handleVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Quick Search on Audiomack */}
      <form onSubmit={handleSearch} className="flex gap-2 pt-2 border-t border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search song or artist on Audiomack..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shrink-0"
        >
          Search
        </button>
      </form>

      {/* Search Results list if any */}
      {searchResults.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
            Search Results ({searchResults.length})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {searchResults.map((tr) => (
              <div
                key={tr.id}
                onClick={() => {
                  mediaAssistant.playTrack(tr);
                  soundEffects.playTap();
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={tr.coverUrl}
                    alt={tr.title}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                      {tr.title}
                    </p>
                    <p className="text-[10px] text-white/50 truncate">
                      {tr.artist}
                    </p>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
