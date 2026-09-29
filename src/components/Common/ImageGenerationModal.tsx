import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import {
  imageGenerationService,
  GeneratedImageItem,
  ImageGenStatus,
} from '../../services/imageGenerationService';
import { soundEffects } from '../../services/soundEffects';

interface ImageGenerationModalProps {
  isOpen: boolean;
  initialPrompt?: string;
  onClose: () => void;
}

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  initialPrompt = '',
  onClose,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [activeItem, setActiveItem] = useState<GeneratedImageItem | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    const unsub = imageGenerationService.subscribe(setActiveItem);
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    soundEffects.playTap();

    try {
      await imageGenerationService.generateImage(prompt.trim(), aspectRatio);
      soundEffects.playSuccess();
    } catch (err) {
      soundEffects.playWarning();
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusStage = (status?: ImageGenStatus) => {
    switch (status) {
      case 'preparing':
        return { step: 1, label: '1. Preparing Neural Canvas & Styles...' };
      case 'generating':
        return { step: 2, label: '2. Synthesizing High-Fidelity Artwork...' };
      case 'finalizing':
        return { step: 3, label: '3. Finalizing Resolution & Grading...' };
      case 'complete':
        return { step: 4, label: '4. Generation Complete!' };
      case 'error':
        return { step: 0, label: 'Generation Encountered An Issue' };
      default:
        return { step: 0, label: 'Ready' };
    }
  };

  const stage = getStatusStage(activeItem?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="p-6 rounded-3xl glass-panel border-cyan-500/30 max-w-lg w-full space-y-4 shadow-[0_0_50px_rgba(0,242,255,0.2)] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-wider uppercase text-white">
              Neural Image Generation
            </h3>
            <p className="text-xs text-white/50">
              Universal visual synthesis powered by Vox
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="text-xs text-white/70 font-semibold mb-1 block">
              Image Description / Prompt
            </label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Futuristic Cyberpunk City with neon lights and flying vehicles..."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Aspect Ratio */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/60 font-semibold">Aspect:</span>
              {['1:1', '16:9', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    aspectRatio === ratio
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-black transition-all shadow-[0_0_15px_rgba(0,242,255,0.4)] flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress Progression Bar */}
        {activeItem && isGenerating && (
          <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/20 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-300 font-bold">{stage.label}</span>
              <span className="text-white/40 font-mono">Stage {stage.step}/4</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${(stage.step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Output Image Preview */}
        {activeItem && activeItem.status === 'complete' && activeItem.imageUrl && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black/60 aspect-square max-h-64 mx-auto flex items-center justify-center">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.prompt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70 truncate max-w-[240px]">
                "{activeItem.prompt}"
              </span>
              <a
                href={activeItem.imageUrl}
                download="vox-generated-artwork.png"
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
