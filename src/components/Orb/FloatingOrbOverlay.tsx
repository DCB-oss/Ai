import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Lock,
  Eye,
  Shield,
  Layers,
  Info,
  Radio,
  CheckCircle2,
  Move,
} from 'lucide-react';
import { OrbState } from '../../types/assistant';
import { OrbVisualizer } from '../Orb/OrbVisualizer';
import { soundEffects } from '../../services/soundEffects';

interface FloatingOrbOverlayProps {
  isVisible: boolean;
  orbState: OrbState;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  onOpenAssistant: () => void;
  onCloseOverlay: () => void;
  initialPosition?: { x: number; y: number };
  onPositionChange?: (pos: { x: number; y: number }) => void;
}

export const FloatingOrbOverlay: React.FC<FloatingOrbOverlayProps> = ({
  isVisible,
  orbState,
  isListening,
  isSpeaking,
  onToggleMic,
  onStopSpeaking,
  onOpenAssistant,
  onCloseOverlay,
  initialPosition = { x: 24, y: 120 },
  onPositionChange,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Sync initial position if changes from outside
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from handle or orb container
    setIsDragging(true);
    const rect = overlayRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;
    const newX = Math.max(10, Math.min(maxX, e.clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(maxY, e.clientY - dragOffset.y));
    const newPos = { x: newX, y: newY };
    setPosition(newPos);
    onPositionChange?.(newPos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-50 select-none touch-none transition-shadow duration-300 ${
        isDragging ? 'cursor-grabbing opacity-95 scale-105' : 'cursor-grab'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="relative group">
        {/* Main Floating Orb Capsule */}
        <div
          className={`relative p-2.5 rounded-full glass-panel border transition-all duration-300 flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ${
            isListening
              ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_25px_rgba(0,242,255,0.4)] ring-2 ring-cyan-400/50 animate-pulse'
              : isSpeaking
              ? 'border-indigo-400 bg-indigo-950/80 shadow-[0_0_25px_rgba(99,102,241,0.4)]'
              : 'border-white/20 bg-[#020408]/90 hover:border-cyan-500/50'
          }`}
        >
          {/* Orb Visualizer Tap to Open Assistant */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playTap();
              onOpenAssistant();
            }}
            className="cursor-pointer relative"
            title="Tap to open Vox Assistant"
          >
            <OrbVisualizer
              state={orbState}
              size="sm"
              interactive={true}
              onClick={onOpenAssistant}
            />

            {/* Listening Privacy Shield Indicator */}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 animate-ping" />
            )}
          </div>

          {/* Quick Action Tray (Reveals on hover/touch or expanded) */}
          <div className="flex items-center gap-1.5 pr-1">
            {/* Mic Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isSpeaking) {
                  onStopSpeaking();
                } else {
                  onToggleMic();
                }
              }}
              className={`p-2 rounded-full border text-xs transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                  : isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 hover:bg-cyan-500/20 text-white/80 hover:text-cyan-300 border-white/10'
              }`}
              title={isListening ? 'Stop Listening' : isSpeaking ? 'Stop Speaking' : 'Activate Voice Assistant'}
            >
              {isListening ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Expand / Open App Fullscreen */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEffects.playTap();
                onOpenAssistant();
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-white/80 hover:text-cyan-300 border border-white/10 text-xs transition-all"
              title="Open Vox Assistant Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close Overlay */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEffects.playTap();
                onCloseOverlay();
              }}
              className="p-1.5 rounded-full hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition-colors"
              title="Dismiss Floating Orb"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Listening Privacy Notification Banner */}
        {isListening && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-[10px] font-bold text-cyan-300 whitespace-nowrap shadow-[0_0_15px_rgba(0,242,255,0.4)] flex items-center gap-1.5 animate-bounce">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Vox is listening...</span>
          </div>
        )}
      </div>
    </div>
  );
};
