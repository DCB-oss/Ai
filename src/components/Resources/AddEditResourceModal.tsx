import React, { useState, useEffect } from 'react';
import { X, Sparkles, Star, Heart, Link2, Image, Tag, Check, AlertCircle } from 'lucide-react';
import { ResourceItem, ResourceCategory } from '../../types/assistant';
import { RESOURCE_CATEGORIES, getSafeDomainInfo } from '../../services/resourceCategories';

interface AddEditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Partial<ResourceItem>) => void;
  initialData?: ResourceItem | null;
}

export const AddEditResourceModal: React.FC<AddEditResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('tools');
  const [creator, setCreator] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [userRating, setUserRating] = useState<number>(5);
  const [ratingScore, setRatingScore] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendationReason, setRecommendationReason] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'tools');
      setCreator(initialData.creator || '');
      setDescription(initialData.description || '');
      setTagsInput(initialData.tags?.join(', ') || '');
      setLink(initialData.link || '');
      setImageUrl(initialData.imageUrl || '');
      setUserRating(initialData.userRating || 5);
      setRatingScore(initialData.rating || '');
      setNotes(initialData.notes || '');
      setRecommendationReason(initialData.recommendationReason || initialData.reason || '');
      setIsFavorite(Boolean(initialData.isFavorite));
    } else {
      // Defaults for new item
      setTitle('');
      setCategory('tools');
      setCreator('');
      setDescription('');
      setTagsInput('');
      setLink('');
      setImageUrl('');
      setUserRating(5);
      setRatingScore('');
      setNotes('');
      setRecommendationReason('');
      setIsFavorite(false);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const safeLinkInfo = getSafeDomainInfo(link);

    onSave({
      id: initialData?.id,
      title: title.trim(),
      category,
      creator: creator.trim() || undefined,
      description: description.trim(),
      tags,
      link: safeLinkInfo.isValid ? safeLinkInfo.safeHref : link.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      userRating,
      rating: ratingScore.trim() || (userRating ? `${userRating}.0★` : undefined),
      notes: notes.trim() || undefined,
      recommendationReason: recommendationReason.trim() || undefined,
      isFavorite,
      saved: true,
      userStatus: 'saved',
      source: initialData?.source || 'user_added',
      dateAdded: initialData?.dateAdded || new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });

    onClose();
  };

  const domainCheck = getSafeDomainInfo(link);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl glass-panel border-cyan-500/40 shadow-[0_0_50px_rgba(0,242,255,0.2)] overflow-hidden bg-[#030712]/90">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {initialData ? 'Edit Resource' : 'Add to Resource Library'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Interstellar, Cyberpunk 2077, Obsidian"
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
            />
          </div>

          {/* Category & Creator Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Category <span className="text-cyan-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-white bg-[#0a0f1d] border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Creator / Studio / Author
              </label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="e.g. Christopher Nolan, CDPR"
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Description <span className="text-cyan-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this resource memorable or useful?"
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
            />
          </div>

          {/* User Star Rating & Favorite Row */}
          <div className="p-3 rounded-2xl glass-panel border-white/10 flex items-center justify-between gap-4">
            <div>
              <span className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1">
                Your Rating
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-1 hover:scale-125 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= userRating
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]'
                          : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all border ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'glass-panel text-white/50 border-white/10 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Sci-Fi, RPG, Productivity, Focus"
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
            />
          </div>

          {/* Source Link & Verification */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-white/80 font-bold uppercase tracking-wider text-[10px]">
                Source / Link URL
              </label>
              {domainCheck.isValid && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Safe Domain: {domainCheck.domain}
                </span>
              )}
            </div>
            <div className="relative">
              <Link2 className="w-4 h-4 absolute left-3 top-3 text-white/40" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl glass-panel text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
              />
            </div>
          </div>

          {/* Optional Thumbnail Image URL */}
          <div>
            <label className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Thumbnail / Cover Image URL (optional)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 absolute left-3 top-3 text-white/40" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl glass-panel text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
              />
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Personal Notes & Thoughts
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your takeaways, setup tips, or impressions..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
            />
          </div>

          {/* Recommendation Reason */}
          <div>
            <label className="block text-white/80 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Recommendation Reason / Why added
            </label>
            <input
              type="text"
              value={recommendationReason}
              onChange={(e) => setRecommendationReason(e.target.value)}
              placeholder="Why this was recommended or saved..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-panel text-white/70 hover:text-white border-white/10 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all"
            >
              {initialData ? 'Update Resource' : 'Save to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
