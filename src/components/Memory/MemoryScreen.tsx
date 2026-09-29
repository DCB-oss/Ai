import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  Download,
  Upload,
  Tag,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';
import { MemoryItem, MemoryCategory } from '../../types/assistant';
import { AmbientVoxVisualizer } from '../Orb/AmbientVoxVisualizer';

interface MemoryScreenProps {
  memories: MemoryItem[];
  memoryEnabled: boolean;
  onToggleMemory: (enabled: boolean) => void;
  onAddMemory: (memory: Partial<MemoryItem>) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
  onImportMemories: (memories: MemoryItem[]) => void;
}

export const MemoryScreen: React.FC<MemoryScreenProps> = ({
  memories,
  memoryEnabled,
  onToggleMemory,
  onAddMemory,
  onDeleteMemory,
  onClearAllMemories,
  onImportMemories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory form state
  const [newCategory, setNewCategory] = useState<MemoryCategory>('Preferences');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const categories: MemoryCategory[] = [
    'Preferences',
    'Gaming',
    'Movies',
    'Shows',
    'Music',
    'Books',
    'Tools',
    'Projects',
    'Goals',
    'Directives',
    'General',
  ];

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    onAddMemory({
      category: newCategory,
      key: newKey.trim() || undefined,
      value: newValue.trim(),
      source: 'manual',
      timestamp: new Date().toISOString(),
    });

    setNewKey('');
    setNewValue('');
    setShowAddModal(false);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aura_memories_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportMemories(parsed);
          }
        } catch {
          alert('Invalid JSON memory backup file.');
        }
      };
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch =
      !q ||
      (m?.value || '').toLowerCase().includes(q) ||
      (m?.key && typeof m.key === 'string' && m.key.toLowerCase().includes(q)) ||
      (m?.category || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] px-4 py-4 max-w-4xl mx-auto w-full space-y-4">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <AmbientVoxVisualizer size="sm" state="THINKING" interactive={false} />
            <h1 className="text-lg font-black tracking-wider uppercase text-white">
              Memory & Knowledge Core
            </h1>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            User-controlled long-term memory. Vox references these voluntarily shared facts to tailor responses.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleMemory(!memoryEnabled)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              memoryEnabled
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(112,0,255,0.3)]'
                : 'glass-panel border-white/10 text-white/40'
            }`}
          >
            {memoryEnabled ? (
              <>
                <ToggleRight className="w-4 h-4 text-purple-400" />
                <span>Memory ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-white/40" />
                <span>Memory OFF</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(112,0,255,0.4)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fact</span>
          </button>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-3.5 rounded-2xl glass-panel border-white/10 flex items-start gap-3 text-xs text-white/60">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">100% Transparent & Private: </span>
          Vox only remembers facts you explicitly provide (e.g. "Remember that I like action games") or add manually here. You can view, modify, or delete any record at any time.
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search remembered facts..."
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={memories.length === 0}
            className="px-3.5 py-2.5 rounded-xl glass-panel border-white/10 text-xs text-white/70 hover:text-white flex items-center gap-1.5 disabled:opacity-40"
            title="Export Backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <label className="px-3.5 py-2.5 rounded-xl glass-panel border-white/10 text-xs text-white/70 hover:text-white flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          {memories.length > 0 && (
            <button
              onClick={onClearAllMemories}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs flex items-center gap-1"
              title="Clear All"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
            selectedCategory === 'all'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(112,0,255,0.2)]'
              : 'glass-panel border-white/10 text-white/50 hover:text-white'
          }`}
        >
          All ({memories.length})
        </button>
        {categories.map((cat) => {
          const count = memories.filter((m) => m.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(112,0,255,0.2)]'
                  : 'glass-panel border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {cat} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Memories List */}
      {filteredMemories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-3xl border-white/10">
          <Brain className="w-9 h-9 text-purple-400 mb-2 opacity-60 animate-pulse" />
          <h3 className="text-sm font-bold text-white mb-1">
            No memories stored yet
          </h3>
          <p className="text-xs text-white/50 mb-4 max-w-sm">
            Tell AniVox in conversation (e.g. "Remember that I like sci-fi books"), or click below to add facts manually.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            Add First Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl glass-panel-interactive transition-all shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                    {m.category}
                  </span>
                  <button
                    onClick={() => onDeleteMemory(m.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-rose-400 transition-opacity"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {m.key && (
                  <div className="text-xs font-semibold text-purple-300/90 mb-1">
                    {m.key}
                  </div>
                )}
                <div className="text-sm font-medium text-white leading-relaxed">
                  {m.value}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                <span className="capitalize">Source: {m.source.replace('_', ' ')}</span>
                <span>{new Date(m.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border-white/20 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 bg-[#020408]/95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Add Long-Term Memory
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">
                  Label / Key (Optional)
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. Favorite Sci-Fi Director, Coding Language"
                  className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">
                  Fact / Preference Detail *
                </label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. Prefers open-world cyberpunk RPGs and dark synthwave music."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-white/70 text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg"
                >
                  Save Fact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
