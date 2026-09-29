import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Heart,
  Bookmark,
  Clock,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Compass,
  AlertCircle,
} from 'lucide-react';
import {
  ResourceItem,
  ResourceCategory,
  ResourceSortOption,
  FeedbackType,
  MemoryItem,
} from '../../types/assistant';
import { RESOURCE_CATEGORIES, normalizeCategory, getCategoryMeta } from '../../services/resourceCategories';
import { ResourceCard } from '../Resources/ResourceCard';
import { AddEditResourceModal } from '../Resources/AddEditResourceModal';
import { ResourceDetailModal } from '../Resources/ResourceDetailModal';
import { AmbientVoxVisualizer } from '../Orb/AmbientVoxVisualizer';

interface RecommendationsScreenProps {
  resources: ResourceItem[];
  memories: MemoryItem[];
  isLoading: boolean;
  onAddResource: (resource: Partial<ResourceItem>) => void;
  onEditResource: (resource: Partial<ResourceItem>) => void;
  onDeleteResource: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRateResource: (id: string, rating: number) => void;
  onViewResource: (item: ResourceItem) => void;
  onFeedback: (itemId: string, type: FeedbackType) => void;
  onRefreshRecommendations: (category?: string) => void;
  onMoreLikeThis: (item: ResourceItem) => void;
  onNotInterested: (item: ResourceItem) => void;
  onNavigate: (screen: any) => void;
  initialCategoryFilter?: string;
  initialStatusFilter?: string;
}

export const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({
  resources,
  memories,
  isLoading,
  onAddResource,
  onEditResource,
  onDeleteResource,
  onToggleFavorite,
  onRateResource,
  onViewResource,
  onFeedback,
  onRefreshRecommendations,
  onMoreLikeThis,
  onNotInterested,
  onNavigate,
  initialCategoryFilter = 'all',
  initialStatusFilter = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter);
  const [statusTab, setStatusTab] = useState<'all' | 'favorites' | 'saved' | 'recent_added' | 'recent_viewed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ResourceSortOption>('recently_added');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ResourceItem | null>(null);

  // Filter and sort items
  const filteredAndSortedResources = useMemo(() => {
    let list = resources.filter((item) => {
      // 1. Category filter
      if (selectedCategory !== 'all') {
        const itemCat = normalizeCategory(item.category);
        const filterCat = normalizeCategory(selectedCategory);
        if (itemCat !== filterCat) return false;
      }

      // 2. Status Tab Filter
      if (statusTab === 'favorites' && !item.isFavorite) return false;
      if (statusTab === 'saved' && !(item.saved || item.userStatus === 'saved' || item.isFavorite)) return false;
      if (statusTab === 'recent_viewed' && !item.lastViewedAt) return false;

      // 3. Search Query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title && typeof item.title === 'string' && item.title.toLowerCase().includes(q);
        const matchesDesc = item.description && typeof item.description === 'string' && item.description.toLowerCase().includes(q);
        const matchesCreator = item.creator && typeof item.creator === 'string' && item.creator.toLowerCase().includes(q);
        const matchesNotes = item.notes && typeof item.notes === 'string' && item.notes.toLowerCase().includes(q);
        const matchesReason = (item.recommendationReason || item.reason) && typeof (item.recommendationReason || item.reason) === 'string' && (item.recommendationReason || item.reason)!.toLowerCase().includes(q);
        const matchesTags = item.tags && Array.isArray(item.tags) && item.tags.some((t) => t && typeof t === 'string' && t.toLowerCase().includes(q));
        const matchesCat = item.category && typeof item.category === 'string' && item.category.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesCreator && !matchesNotes && !matchesReason && !matchesTags && !matchesCat) {
          return false;
        }
      }

      return true;
    });

    // Sort items
    list = [...list].sort((a, b) => {
      if (sortBy === 'favorites_first') {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
      }

      if (sortBy === 'highest_rated') {
        const rateA = a.userRating || 0;
        const rateB = b.userRating || 0;
        if (rateB !== rateA) return rateB - rateA;
      }

      if (sortBy === 'recently_viewed') {
        const timeA = a.lastViewedAt ? new Date(a.lastViewedAt).getTime() : 0;
        const timeB = b.lastViewedAt ? new Date(b.lastViewedAt).getTime() : 0;
        return timeB - timeA;
      }

      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }

      // Default: recently_added
      const dateA = new Date(a.dateAdded || a.timestamp || 0).getTime();
      const dateB = new Date(b.dateAdded || b.timestamp || 0).getTime();
      return dateB - dateA;
    });

    return list;
  }, [resources, selectedCategory, statusTab, searchQuery, sortBy]);

  // Counts
  const totalCount = resources.length;
  const favoritesCount = resources.filter((r) => r.isFavorite).length;
  const categoriesCount = new Set(resources.map((r) => normalizeCategory(r.category))).size;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: ResourceItem) => {
    setEditingItem(item);
    setIsAddEditOpen(true);
  };

  const handleSaveModal = (data: Partial<ResourceItem>) => {
    if (editingItem) {
      onEditResource({ ...editingItem, ...data });
    } else {
      onAddResource(data);
    }
  };

  const handleViewDetail = (item: ResourceItem) => {
    onViewResource(item);
    setSelectedDetailItem(item);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] px-4 py-4 max-w-5xl mx-auto w-full space-y-4">
      {/* Header Banner with Atmospheric Theme */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_35px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <AmbientVoxVisualizer size="sm" state="IDLE" interactive={false} />
            <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              Resource Collection & Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-xl">
            Smart, organized media and knowledge library interconnected with Vox's AI recommendation and memory systems.
          </p>

          {/* Quick Stats Pill Strip */}
          <div className="flex items-center gap-3 mt-3 text-[11px] text-white/50 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <strong>{totalCount}</strong> Resources Saved
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300">
              <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
              <strong>{favoritesCount}</strong> Favorites
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <strong>{categoriesCount}</strong> Active Categories
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,242,255,0.15)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>

          <button
            onClick={() => onRefreshRecommendations(selectedCategory === 'all' ? undefined : selectedCategory)}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'AI Discoveries'}</span>
          </button>
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across title, tags, description, notes, links..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl glass-panel text-xs text-white placeholder-white/30 border-white/10 focus:outline-none focus:border-cyan-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 p-1 rounded-full text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 text-white/40 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ResourceSortOption)}
              className="pl-8 pr-7 py-2.5 rounded-2xl glass-panel text-xs text-white bg-[#030712] border-white/10 focus:outline-none focus:border-cyan-500/50 appearance-none font-medium cursor-pointer"
            >
              <option value="recently_added">Sort: Recently Added</option>
              <option value="recently_viewed">Sort: Recently Viewed</option>
              <option value="highest_rated">Sort: Highest Rated</option>
              <option value="title_asc">Sort: Title (A - Z)</option>
              <option value="favorites_first">Sort: Favorites First</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl glass-panel border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/40 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/40 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar (All, Favorites, Saved, Recent Added, Recent Viewed) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStatusTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            statusTab === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
              : 'glass-panel border-white/10 text-white/50 hover:text-white'
          }`}
        >
          All ({resources.length})
        </button>

        <button
          onClick={() => setStatusTab('favorites')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            statusTab === 'favorites'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
              : 'glass-panel border-white/10 text-white/50 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Favorites ({favoritesCount})</span>
        </button>

        <button
          onClick={() => setStatusTab('saved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            statusTab === 'saved'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'glass-panel border-white/10 text-white/50 hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => setStatusTab('recent_added')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            statusTab === 'recent_added'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'glass-panel border-white/10 text-white/50 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recently Added</span>
        </button>

        <button
          onClick={() => setStatusTab('recent_viewed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            statusTab === 'recent_viewed'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              : 'glass-panel border-white/10 text-white/50 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          <span>Recently Viewed</span>
        </button>
      </div>

      {/* 11 Categories Slider */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* All Discoveries pill */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_15px_rgba(0,242,255,0.35)]'
              : 'glass-panel text-white/60 hover:text-white border-white/10 hover:border-white/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </button>

        {/* 11 specific categories */}
        {RESOURCE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count = resources.filter((r) => normalizeCategory(r.category) === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_15px_rgba(0,242,255,0.35)]'
                  : 'glass-panel text-white/60 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-black/30 text-slate-950 font-extrabold' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Resource Items Grid or List */}
      {filteredAndSortedResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-3xl border-white/10 my-4">
          <Sparkles className="w-10 h-10 text-cyan-400 mb-3 opacity-60 animate-pulse" />
          <h3 className="text-base font-bold text-white mb-1.5">
            No resources match your current filters
          </h3>
          <p className="text-xs text-white/50 mb-5 max-w-sm leading-relaxed">
            {searchQuery
              ? `No results found for "${searchQuery}". Try a different search term or clear the filter.`
              : 'Add a new resource manually or ask AniVox to synthesize personalized discoveries for this category.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setStatusTab('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl glass-panel text-white/70 hover:text-white border-white/10 text-xs font-semibold"
            >
              Reset Filters
            </button>
            <button
              onClick={() => onRefreshRecommendations(selectedCategory === 'all' ? undefined : selectedCategory)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AniVox for Picks</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {filteredAndSortedResources.map((item) => (
            <ResourceCard
              key={item.id}
              item={item}
              onView={handleViewDetail}
              onEdit={handleOpenEdit}
              onDelete={onDeleteResource}
              onToggleFavorite={onToggleFavorite}
              onRate={onRateResource}
              onFeedback={onFeedback}
              onMoreLikeThis={onMoreLikeThis}
              onNotInterested={onNotInterested}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddEditResourceModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItem}
      />

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        item={selectedDetailItem}
        isOpen={Boolean(selectedDetailItem)}
        onClose={() => setSelectedDetailItem(null)}
        onEdit={handleOpenEdit}
        onDelete={onDeleteResource}
        onToggleFavorite={onToggleFavorite}
        onRate={onRateResource}
        onMoreLikeThis={onMoreLikeThis}
        onNotInterested={onNotInterested}
      />
    </div>
  );
};
