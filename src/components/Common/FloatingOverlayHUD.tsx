import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MessageSquare,
  Sparkles,
  Search,
  X,
  Minimize2,
  Maximize2,
  Move,
  Volume2,
  Radio,
} from 'lucide-react';
import { AssistantSettings } from '../../types/assistant';
import { soundEffects } from '../../services/soundEffects';

interface FloatingOverlayHUDProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMic: () => void;
  onOpenChat: () => void;
  onOpenImageGen: () => void;
  isListening?: boolean;
  isSpeaking?: boolean;
}

export const FloatingOverlayHUD: React.FC<FloatingOverlayHUDProps> = ({
  isOpen,
  onClose,
  onOpenMic,
  onOpenChat,
  onOpenImageGen,
  isListening = false,
  isSpeaking = false,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 20,
    posY: 80,
  });

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 220, dragStartRef.current.posX + deltaX)),
      y: Math.max(10, Math.min(window.innerHeight - 100, dragStartRef.current.posY + deltaY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: 'none',
      }}
      className={`rounded-3xl glass-panel border-cyan-500/40 shadow-[0_0_30px_rgba(0,242,255,0.3)] transition-all ${
        isMinimized ? 'p-2' : 'p-3 w-56'
      }`}
    >
      {/* Drag Handle & Window Controls */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between cursor-move pb-2 mb-1 border-b border-white/10 select-none"
      >
        <div className="flex items-center gap-1.5 text-cyan-400">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : isListening ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">VOX HUD</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsMinimized(!isMinimized);
              soundEffects.playTap();
            }}
            className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => {
              onClose();
              soundEffects.playTap();
            }}
            className="p-1 rounded-md text-white/60 hover:text-rose-400 hover:bg-white/10"
            title="Close Overlay"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expanded Quick Actions */}
      {!isMinimized && (
        <div className="space-y-2">
          {/* Status Label */}
          <div className="text-center py-1">
            <span className="text-[11px] font-bold text-cyan-300">
              {isSpeaking ? '🔊 Vox Speaking...' : isListening ? '🎤 Listening...' : '⚡ Vox Standing By'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                onOpenMic();
                soundEffects.playTap();
              }}
              className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
              <span className="text-[9px] font-bold">Voice</span>
            </button>

            <button
              onClick={() => {
                onOpenChat();
                soundEffects.playTap();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex flex-col items-center justify-center gap-1 transition-all"
              title="Open Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[9px] font-bold">Chat</span>
            </button>

            <button
              onClick={() => {
                onOpenImageGen();
                soundEffects.playTap();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex flex-col items-center justify-center gap-1 transition-all"
              title="Generate Image"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-[9px] font-bold">Image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
