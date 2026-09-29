import React, { useState } from 'react';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Bookmark,
  RefreshCw,
  Star,
  ExternalLink,
  Share2,
  Check,
  Heart,
} from 'lucide-react';
import { ResourceItem, FeedbackType } from '../../types/assistant';
import { getCategoryMeta, getSafeDomainInfo } from '../../services/resourceCategories';

interface RecommendationCardProps {
  item: ResourceItem;
  onFeedback?: (itemId: string, type: FeedbackType) => void;
  onView?: (item: ResourceItem) => void;
  compact?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onFeedback,
  onView,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
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

  return (
    <div
      onClick={() => onView && onView(item)}
      className="relative group p-4 rounded-2xl glass-panel-interactive border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg hover:shadow-[0_0_25px_rgba(0,242,255,0.12)] text-left"
    >
      {/* Header with Title & Category */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryMeta.badgeClass}`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{categoryMeta.emoji} {categoryMeta.label}</span>
            </span>
            {item.creator && (
              <span className="text-[11px] text-white/50 font-normal">by {item.creator}</span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
            {item.title}
          </h3>
        </div>

        {item.rating && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            <Star className="w-3 h-3 fill-amber-300" />
            <span>{item.rating}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-white/70 leading-relaxed mb-3">{item.description}</p>

      {/* Why Recommended Reason */}
      {(item.recommendationReason || item.reason) && (
        <div className="mb-3 p-2.5 rounded-xl glass-panel border-cyan-500/30 text-[11px] text-cyan-200/90 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-cyan-300 font-semibold uppercase tracking-wider text-[10px]">Why for you:</strong>{' '}
            {item.recommendationReason || item.reason}
          </span>
        </div>
      )}

      {/* Tags & Safe Domain Link */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md glass-panel text-white/50 text-[10px] font-medium border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {linkInfo.isValid && (
          <a
            href={linkInfo.safeHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 underline font-mono"
            title={`Open ${linkInfo.domain}`}
          >
            <ExternalLink className="w-3 h-3" />
            <span>{linkInfo.domain}</span>
          </a>
        )}
      </div>

      {/* Interactive Feedback & Action Buttons */}
      {onFeedback && (
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(item.id, 'like');
              }}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                item.userStatus === 'liked'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-white/40 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
              title="Like - Tailor future recommendations"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="text-[11px]">Like</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(item.id, 'not_interested');
              }}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                item.userStatus === 'disliked'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'text-white/40 hover:text-rose-300 hover:bg-rose-500/10'
              }`}
              title="Not interested"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span className="text-[11px]">Dismiss</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(item.id, 'consumed');
              }}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                item.userStatus === 'consumed'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,255,0.3)]'
                  : 'text-white/40 hover:text-cyan-300 hover:bg-cyan-500/10'
              }`}
              title="Already watched / played / read"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[11px]">Done</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(item.id, 'saved');
              }}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                item.userStatus === 'saved' || item.isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-white/40 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
              title="Save to My Resource Library"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="text-[11px]">Save</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(item.id, 'more_like_this');
              }}
              className="p-1.5 rounded-lg text-xs text-white/40 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all flex items-center gap-1"
              title="Find more like this"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Similar</span>
            </button>

            <button
              onClick={handleShare}
              className={`p-1.5 rounded-lg transition-all ${
                copied ? 'text-emerald-300 bg-emerald-500/20' : 'text-white/40 hover:text-white'
              }`}
              title="Share"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
