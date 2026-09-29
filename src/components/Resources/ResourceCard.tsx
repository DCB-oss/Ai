import React, { useState } from 'react';
import {
  Star,
  Heart,
  ExternalLink,
  Edit3,
  Trash2,
  Share2,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Tag,
  AlertCircle,
  ThumbsDown,
} from 'lucide-react';
import { ResourceItem, FeedbackType } from '../../types/assistant';
import { getCategoryMeta, getSafeDomainInfo } from '../../services/resourceCategories';

interface ResourceCardProps {
  item: ResourceItem;
  onView?: (item: ResourceItem) => void;
  onEdit?: (item: ResourceItem) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  onFeedback?: (id: string, type: FeedbackType) => void;
  onMoreLikeThis?: (item: ResourceItem) => void;
  onNotInterested?: (item: ResourceItem) => void;
  compact?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  item,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRate,
  onFeedback,
  onMoreLikeThis,
  onNotInterested,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const categoryMeta = getCategoryMeta(item.category);
  const CategoryIcon = categoryMeta.icon;
  const linkInfo = getSafeDomainInfo(item.link);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = item.link
      ? `${item.title} - ${item.link}`
      : `${item.title} (${categoryMeta.label}) - ${item.description}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardClick = () => {
    if (onView) {
      onView(item);
    }
  };

  const handleStarClick = (e: React.MouseEvent, starIndex: number) => {
    e.stopPropagation();
    if (onRate) {
      onRate(item.id, starIndex);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-2xl glass-panel-interactive border transition-all duration-300 overflow-hidden cursor-pointer ${
        item.isFavorite
          ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.12)]'
          : 'border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(0,242,255,0.12)]'
      } ${compact ? 'p-3.5' : 'p-4'}`}
    >
      {/* Top Banner / Image (if present) */}
      {item.imageUrl && !imageError && (
        <div className="relative w-full h-32 -mt-4 -mx-4 mb-3.5 overflow-hidden border-b border-white/10 bg-slate-900/60 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-black/30" />
          
          {/* Category overlay pill */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${categoryMeta.badgeClass}`}>
              <CategoryIcon className="w-3 h-3" />
              <span>{categoryMeta.label}</span>
            </span>
          </div>

          {/* Quick Favorite Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(item.id);
            }}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all ${
              item.isFavorite
                ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                : 'bg-black/50 text-white/60 hover:text-rose-400 hover:bg-black/70'
            }`}
            title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle Favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div>
        {/* Category Header (if no top image) */}
        {(!item.imageUrl || imageError) && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryMeta.badgeClass}`}
              >
                <CategoryIcon className="w-3 h-3" />
                <span>{categoryMeta.label}</span>
              </span>
              {item.creator && (
                <span className="text-[11px] text-white/50 truncate max-w-[140px]">
                  by {item.creator}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(item.id);
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  item.isFavorite
                    ? 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
                    : 'text-white/40 hover:text-rose-400'
                }`}
                title={item.isFavorite ? 'Favorited' : 'Favorite'}
              >
                <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-400' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-white/70 leading-relaxed line-clamp-2 mb-2.5">
          {item.description}
        </p>

        {/* Notes (if provided) */}
        {item.notes && (
          <div className="mb-2.5 p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200/90 leading-snug flex items-start gap-1.5">
            <span className="text-purple-400 font-bold shrink-0">📝</span>
            <span className="line-clamp-2">
              <strong className="text-purple-300 font-semibold">Note:</strong> {item.notes}
            </span>
          </div>
        )}

        {/* Recommendation Reason */}
        {(item.recommendationReason || item.reason) && (
          <div className="mb-2.5 p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200/90 leading-snug flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              <strong className="text-cyan-300 font-semibold uppercase text-[9px] tracking-wider">Why for you:</strong>{' '}
              {item.recommendationReason || item.reason}
            </span>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-[10px] font-medium border border-white/5"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="text-[10px] text-white/30 self-center">
                +{item.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls: Ratings, Safe Link, Actions */}
      <div className="pt-2.5 border-t border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* User Star Rating */}
          <div className="flex items-center gap-1" title="Rate this resource">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={(e) => handleStarClick(e, star)}
                className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                aria-label={`Rate ${star} star`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    star <= (item.userRating || 0)
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                      : 'text-white/20 hover:text-amber-300/60'
                  }`}
                />
              </button>
            ))}
            {item.rating && (
              <span className="text-[10px] font-mono text-amber-300/80 ml-1">
                ({item.rating})
              </span>
            )}
          </div>

          {/* Safe External Link (if present) */}
          {linkInfo.isValid ? (
            <a
              href={linkInfo.safeHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition-all max-w-[130px] truncate"
              title={`Visit verified source: ${linkInfo.domain}`}
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{linkInfo.domain}</span>
            </a>
          ) : (
            <span className="text-[10px] text-white/30 font-mono">
              {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Saved'}
            </span>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5 text-xs text-white/40">
          <div className="flex items-center gap-1">
            {/* More Like This Button */}
            {onMoreLikeThis && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreLikeThis(item);
                }}
                className="p-1.5 rounded-lg hover:text-cyan-300 hover:bg-cyan-500/10 transition-all flex items-center gap-1 text-[11px]"
                title="Find more resources like this"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="hidden xs:inline">Similar</span>
              </button>
            )}

            {/* Not Interested / Dismiss */}
            {onNotInterested && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNotInterested(item);
                }}
                className="p-1.5 rounded-lg hover:text-rose-300 hover:bg-rose-500/10 transition-all flex items-center gap-1 text-[11px]"
                title="Not interested (tune AI taste profile)"
              >
                <ThumbsDown className="w-3 h-3" />
                <span className="hidden xs:inline">Dismiss</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Share / Copy link */}
            <button
              type="button"
              onClick={handleShare}
              className={`p-1.5 rounded-lg transition-all ${
                copied
                  ? 'text-emerald-300 bg-emerald-500/20'
                  : 'hover:text-cyan-300 hover:bg-cyan-500/10'
              }`}
              title={copied ? 'Copied to clipboard!' : 'Copy link or info'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            {/* Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-1.5 rounded-lg hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
                title="Edit resource"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Remove "${item.title}" from your collection?`)) {
                    onDelete(item.id);
                  }
                }}
                className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Delete from collection"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
