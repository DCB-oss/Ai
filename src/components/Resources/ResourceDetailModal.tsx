import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Star,
  Heart,
  ExternalLink,
  Edit3,
  Trash2,
  Share2,
  Check,
  Calendar,
  Eye,
  ShieldCheck,
  Tag,
  RefreshCw,
  ThumbsDown,
} from 'lucide-react';
import { ResourceItem, FeedbackType } from '../../types/assistant';
import { getCategoryMeta, getSafeDomainInfo } from '../../services/resourceCategories';

interface ResourceDetailModalProps {
  item: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: ResourceItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onMoreLikeThis?: (item: ResourceItem) => void;
  onNotInterested?: (item: ResourceItem) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRate,
  onMoreLikeThis,
  onNotInterested,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !item) return null;

  const categoryMeta = getCategoryMeta(item.category);
  const CategoryIcon = categoryMeta.icon;
  const linkInfo = getSafeDomainInfo(item.link);

  const handleShare = () => {
    const shareText = item.link
      ? `${item.title} - ${item.link}`
      : `${item.title} (${categoryMeta.label}) - ${item.description}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl glass-panel border-cyan-500/40 shadow-[0_0_50px_rgba(0,242,255,0.25)] overflow-hidden bg-[#02050f]/95">
        {/* Banner / Cover Image */}
        {item.imageUrl && !imageError ? (
          <div className="relative w-full h-48 sm:h-56 overflow-hidden border-b border-white/10 bg-slate-950">
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02050f] via-black/40 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black text-white/70 hover:text-white backdrop-blur-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${categoryMeta.badgeClass}`}>
                <CategoryIcon className="w-3.5 h-3.5" />
                <span>{categoryMeta.label}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${categoryMeta.badgeClass}`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{categoryMeta.label}</span>
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Title & Creator Header */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-wide mb-1">
                  {item.title}
                </h1>
                {item.creator && (
                  <p className="text-xs sm:text-sm text-cyan-300/80 font-medium">
                    Created by {item.creator}
                  </p>
                )}
              </div>

              <button
                onClick={() => onToggleFavorite(item.id)}
                className={`p-2.5 rounded-2xl border transition-all ${
                  item.isFavorite
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'glass-panel text-white/40 hover:text-rose-400 border-white/10'
                }`}
                title={item.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
              >
                <Heart className={`w-5 h-5 ${item.isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* User Rating Bar */}
          <div className="p-3.5 rounded-2xl glass-panel border-white/10 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                User Rating:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRate(item.id, star)}
                    className="p-0.5 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= (item.userRating || 0)
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                          : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {item.rating && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
                Score: {item.rating}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Overview
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Why Recommended / Reason */}
          {(item.recommendationReason || item.reason) && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 shadow-[0_0_20px_rgba(0,242,255,0.08)]">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  AniVox Recommendation Insight
                </h4>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                {item.recommendationReason || item.reason}
              </p>
            </div>
          )}

          {/* Personal Notes */}
          {item.notes && (
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1.5">
                <span>📝</span> Personal Notes
              </h4>
              <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
                {item.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Categorization Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg glass-panel text-white/70 text-xs font-medium border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safe External Link Preview */}
          {linkInfo.isValid && (
            <div className="p-3.5 rounded-2xl glass-panel border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Verified Source</p>
                  <p className="text-xs text-white font-mono truncate">{linkInfo.domain}</p>
                </div>
              </div>

              <a
                href={linkInfo.safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)]"
              >
                <span>Visit Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Date & Metadata */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Added: {new Date(item.dateAdded || item.timestamp).toLocaleDateString()}
            </span>
            <span>Source: {item.source === 'ai_recommendation' ? 'AI Recommendation' : 'User Library'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap bg-[#030712]">
          <div className="flex items-center gap-2">
            {onMoreLikeThis && (
              <button
                onClick={() => {
                  onMoreLikeThis(item);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>More Like This</span>
              </button>
            )}

            {onNotInterested && (
              <button
                onClick={() => {
                  onNotInterested(item);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl glass-panel text-white/60 hover:text-rose-300 border-white/10 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Not Interested</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`p-2.5 rounded-xl transition-all ${
                copied ? 'bg-emerald-500/20 text-emerald-300' : 'glass-panel text-white/60 hover:text-white border-white/10'
              }`}
              title="Copy link / details"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                onEdit(item);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl glass-panel text-white/80 hover:text-white border-white/10 hover:border-white/20 text-xs font-semibold flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Remove "${item.title}" from your library?`)) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="p-2.5 rounded-xl glass-panel text-white/40 hover:text-rose-400 border-white/10 hover:border-rose-500/30 transition-colors"
              title="Delete from collection"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
