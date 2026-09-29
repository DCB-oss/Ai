import React, { useState, useEffect } from 'react';
import {
  Timer,
  CheckSquare,
  FileText,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Zap,
  Globe,
  Shuffle,
  Clock,
  Pin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
  Phone,
  PhoneCall,
  Smartphone,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TimerItem, TaskItem, NoteItem, SocialPlatform, SocialProfileCard, PhoneCallActionData, DeviceContact } from '../../types/assistant';
import { soundEffects } from '../../services/soundEffects';
import { SocialResultCard } from '../Social/SocialResultCard';
import { PhoneCallCard } from '../Phone/PhoneCallCard';
import { ContactManagerModal } from '../Phone/ContactManagerModal';
import { phoneCallAssistant } from '../../services/phoneCallAssistant';
import {
  PLATFORM_CONFIGS,
  VERIFIED_PUBLIC_CREATORS,
  resolveSocialProfile,
} from '../../services/socialLinkLauncher';

interface ActionsScreenProps {
  timers: TimerItem[];
  tasks: TaskItem[];
  notes: NoteItem[];
  onAddTimer: (seconds: number, label: string) => void;
  onToggleTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onDeleteTimer: (id: string) => void;
  onAddTask: (task: Partial<TaskItem>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddNote: (note: Partial<NoteItem>) => void;
  onDeleteNote: (id: string) => void;
}

export const ActionsScreen: React.FC<ActionsScreenProps> = ({
  timers,
  tasks,
  notes,
  onAddTimer,
  onToggleTimer,
  onResetTimer,
  onDeleteTimer,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'timers' | 'tasks' | 'notes' | 'phone_calls' | 'social_links' | 'utilities'>('timers');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Phone Assistant state
  const [phoneCallQuery, setPhoneCallQuery] = useState('');
  const [activeCallAction, setActiveCallAction] = useState<PhoneCallActionData | null>(() => {
    return phoneCallAssistant.processCallIntent('call Mom');
  });
  const [showContactManager, setShowContactManager] = useState(false);

  // Social Links state
  const [socialSearchQuery, setSocialSearchQuery] = useState('');
  const [selectedSocialPlatform, setSelectedSocialPlatform] = useState<SocialPlatform>('youtube');
  const [activeSocialCard, setActiveSocialCard] = useState<SocialProfileCard | null>(() => {
    return resolveSocialProfile('Grox', 'youtube');
  });

  // Forms
  const [customTimerLabel, setCustomTimerLabel] = useState('');
  const [customTimerMinutes, setCustomTimerMinutes] = useState(5);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('');

  // Utilities state
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [coinResult, setCoinResult] = useState<string | null>(null);
  const [tempC, setTempC] = useState<string>('20');
  const [tempF, setTempF] = useState<string>('68');

  // Trigger celebration on completed timer
  useEffect(() => {
    timers.forEach((t) => {
      if (t.remainingSeconds === 0 && t.completed) {
        soundEffects.playTimerAlarm();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    });
  }, [timers]);

  const handleQuickTimer = (mins: number, label: string) => {
    onAddTimer(mins * 60, label);
    soundEffects.playTap();
  };

  const handleCreateCustomTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTimerMinutes <= 0) return;
    onAddTimer(customTimerMinutes * 60, customTimerLabel.trim() || `${customTimerMinutes} Min Timer`);
    setCustomTimerLabel('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setNewTaskTitle('');
    soundEffects.playSuccess();
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    onAddNote({
      title: newNoteTitle.trim() || 'Untitled Note',
      content: newNoteContent.trim(),
      tags: newNoteTag.trim() ? [newNoteTag.trim()] : ['General'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTag('');
    soundEffects.playSuccess();
  };

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceResult(roll);
    soundEffects.playTap();
  };

  const flipCoin = () => {
    const flip = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
    setCoinResult(flip);
    soundEffects.playTap();
  };

  const handleConvertCtoF = (val: string) => {
    setTempC(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setTempF(((num * 9) / 5 + 32).toFixed(1));
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] px-4 py-4 max-w-4xl mx-auto w-full space-y-4">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)]">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black tracking-wider uppercase text-white">
              Action & Utilities Matrix
            </h1>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Control active countdown timers, tasks, notes, and assistant device utilities.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 glass-panel rounded-2xl border-white/10">
        <button
          onClick={() => setActiveTab('timers')}
          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'timers'
              ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.3)] font-bold'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Timers ({timers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.3)] font-bold'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Tasks ({tasks.filter((t) => !t.completed).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'notes'
              ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.3)] font-bold'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('phone_calls')}
          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'phone_calls'
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Phone & Calls</span>
        </button>

        <button
          onClick={() => setActiveTab('social_links')}
          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'social_links'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] font-bold'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Smart Links</span>
        </button>

        <button
          onClick={() => setActiveTab('utilities')}
          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'utilities'
              ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.3)] font-bold'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tools</span>
        </button>
      </div>

      {/* 1. TIMERS TAB */}
      {activeTab === 'timers' && (
        <div className="space-y-4">
          {/* Quick Preset Buttons */}
          <div className="p-4 rounded-2xl glass-panel border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2.5 block">
              Quick Timer Presets
            </span>
            <div className="grid grid-cols-5 gap-2">
              {[
                { m: 1, l: '1 Min' },
                { m: 3, l: '3 Min' },
                { m: 5, l: '5 Min' },
                { m: 15, l: '15 Min' },
                { m: 25, l: '25m Focus' },
              ].map((preset) => (
                <button
                  key={preset.m}
                  onClick={() => handleQuickTimer(preset.m, preset.l)}
                  className="py-2.5 px-1 rounded-xl glass-panel-interactive border-white/10 text-xs font-semibold text-white/80 hover:text-cyan-300 transition-all text-center"
                >
                  +{preset.l}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Timer Input */}
          <form onSubmit={handleCreateCustomTimer} className="flex gap-2">
            <input
              type="text"
              value={customTimerLabel}
              onChange={(e) => setCustomTimerLabel(e.target.value)}
              placeholder="Timer label (e.g. Baking, Meditation)"
              className="flex-1 px-3.5 py-2.5 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
            />
            <input
              type="number"
              min="1"
              max="180"
              value={customTimerMinutes}
              onChange={(e) => setCustomTimerMinutes(parseInt(e.target.value, 10) || 1)}
              className="w-20 px-3 py-2.5 rounded-xl glass-panel text-xs text-center text-white focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Active Timers List */}
          {timers.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl border-white/10 text-white/40 text-xs">
              No active timers. Tap a quick preset above or say "Set a 5 minute timer".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {timers.map((timer) => {
                const mins = Math.floor(timer.remainingSeconds / 60);
                const secs = timer.remainingSeconds % 60;
                const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                const progressPct =
                  timer.totalSeconds > 0
                    ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100
                    : 100;
                const isComplete = timer.remainingSeconds === 0;

                return (
                  <div
                    key={timer.id}
                    className={`p-4 rounded-2xl glass-panel border transition-all relative overflow-hidden ${
                      isComplete
                        ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                        : timer.isRunning
                        ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,255,0.15)]'
                        : 'border-white/10'
                    }`}
                  >
                    {/* Progress Bar background */}
                    <div
                      className="absolute bottom-0 left-0 top-0 bg-cyan-500/10 transition-all duration-1000 -z-0"
                      style={{ width: `${progressPct}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-0.5">
                          {timer.label}
                        </span>
                        <div
                          className={`text-2xl font-mono font-black ${
                            isComplete
                              ? 'text-rose-400 animate-pulse'
                              : timer.isRunning
                              ? 'text-cyan-300'
                              : 'text-white/40'
                          }`}
                        >
                          {formatted}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isComplete && (
                          <button
                            onClick={() => onToggleTimer(timer.id)}
                            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                              timer.isRunning
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                            }`}
                            title={timer.isRunning ? 'Pause' : 'Start'}
                          >
                            {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}

                        <button
                          onClick={() => onResetTimer(timer.id)}
                          className="p-2 rounded-xl glass-panel text-white/70 hover:text-white border-white/10 text-xs"
                          title="Reset"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteTimer(timer.id)}
                          className="p-2 rounded-xl glass-panel text-white/40 hover:text-rose-400 border-white/10 text-xs"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task / todo item..."
              className="flex-1 px-3.5 py-2.5 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl glass-panel border-white/10 text-xs text-white focus:outline-none bg-black/80"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {tasks.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl border-white/10 text-white/40 text-xs">
              No tasks currently registered. Add tasks above or tell AniVox "Remind me to finish my project".
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((t) => {
                const priorityStyles = {
                  high: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
                  medium: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
                  low: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
                }[t.priority];

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl glass-panel-interactive border flex items-center justify-between gap-3 transition-all ${
                      t.completed
                        ? 'opacity-60 border-white/5'
                        : 'border-white/10'
                    }`}
                  >
                    <div
                      onClick={() => onToggleTask(t.id)}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          t.completed
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : 'border-white/30 hover:border-cyan-400'
                        }`}
                      >
                        {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <div
                          className={`text-xs font-semibold ${
                            t.completed ? 'line-through text-white/40' : 'text-white'
                          }`}
                        >
                          {t.title}
                        </div>
                        {t.dueDate && (
                          <div className="text-[10px] text-white/40">Due: {t.dueDate}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${priorityStyles}`}
                      >
                        {t.priority}
                      </span>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-1 text-white/40 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateNote} className="space-y-2.5 p-4 rounded-2xl glass-panel border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note Title (Optional)"
                className="flex-1 px-3.5 py-2 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              />
              <input
                type="text"
                value={newNoteTag}
                onChange={(e) => setNewNoteTag(e.target.value)}
                placeholder="Tag (e.g. Ideas, Work)"
                className="w-32 px-3 py-2 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note or ask AniVox to jot down thoughts..."
              rows={2}
              required
              className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {notes.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl border-white/10 text-white/40 text-xs">
              No notes saved. Add one above or tell AniVox "Take a note about my game project".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl glass-panel-interactive border-white/10 transition-all shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-xs font-bold text-white">{note.title}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyNote(note.id, `${note.title}\n${note.content}`)}
                          className="p-1 text-white/40 hover:text-cyan-300 transition-colors"
                          title="Copy Note"
                        >
                          {copiedNoteId === note.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 text-white/40 hover:text-rose-400 transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded glass-panel text-white/50 text-[10px] font-medium border-white/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-white/40">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PHONE & CALLS ASSISTANT TAB */}
      {activeTab === 'phone_calls' && (
        <div className="space-y-4">
          {/* Privacy & Zero-Cloud Sync Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-emerald-300 block">
                Native Android Phone Assistant & Local Contact Privacy
              </span>
              <p className="text-white/70 leading-relaxed">
                AniVox performs contact lookups locally on-device. Contacts, phone numbers, and call logs are <strong>never sent to external AI servers</strong>.
              </p>
            </div>
          </div>

          {/* Quick Voice Command / Dial Input */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block">
                Call Contact or Dial Number
              </span>
              <button
                onClick={() => setShowContactManager(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Address Book ({phoneCallAssistant.getContacts().length})</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!phoneCallQuery.trim()) return;
                soundEffects.playTap();
                setActiveCallAction(phoneCallAssistant.processCallIntent(phoneCallQuery.trim()));
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
                <input
                  type="text"
                  value={phoneCallQuery}
                  onChange={(e) => {
                    setPhoneCallQuery(e.target.value);
                    if (e.target.value.trim()) {
                      setActiveCallAction(phoneCallAssistant.processCallIntent(e.target.value.trim()));
                    }
                  }}
                  placeholder="e.g. Call Mom, Call Dad on SIM 2, Call my brother, or dial digits..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
              >
                Call
              </button>
            </form>

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-white/40 mr-1">Presets:</span>
              {[
                { label: 'Mom (Mobile)', cmd: 'call Mom' },
                { label: "Mom's Home", cmd: "call Mom's home number" },
                { label: 'Dad (SIM 1)', cmd: 'call Dad on SIM 1' },
                { label: 'Brother', cmd: 'call my brother' },
                { label: 'Sarah (SIM 2)', cmd: 'call Sarah on SIM 2' },
                { label: 'John (Disambiguation)', cmd: 'call John' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPhoneCallQuery(p.cmd);
                    setActiveCallAction(phoneCallAssistant.processCallIntent(p.cmd));
                    soundEffects.playTap();
                  }}
                  className="px-2.5 py-1 rounded-lg glass-panel-interactive border-white/10 text-[11px] text-white/80 hover:text-emerald-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Call Action Preview Card */}
          {activeCallAction && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block">
                Call Resolution & Dispatch
              </span>
              <PhoneCallCard
                actionData={activeCallAction}
                onInitiateCall={(data) => {
                  phoneCallAssistant.initiateCall(data);
                }}
              />
            </div>
          )}

          {/* Voice Calling Patterns Reference */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Voice Calling Patterns</span>
            </div>
            <p className="text-xs text-white/70">
              Speak naturally to Vox using any of these voice formats:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                '"Vox, call Mom."',
                '"Call Dad."',
                '"Call my brother."',
                '"Call Sarah."',
                '"Call Mom\'s first number."',
                '"Call Mom\'s mobile number."',
                '"Call Sarah using SIM 2."',
                '"Call John." (Prompts disambiguation)',
              ].map((cmd, idx) => (
                <div key={idx} className="p-2.5 rounded-xl glass-panel border-white/5 text-emerald-300">
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SOCIAL MEDIA SMART LINKS TAB */}
      {activeTab === 'social_links' && (
        <div className="space-y-4">
          {/* Privacy & Zero-Credential Guarantee Banner */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-cyan-300 block">Public Links & Zero-Credential Privacy Policy</span>
              <p className="text-white/70 leading-relaxed">
                AniVox finds and opens verified public profiles, channels, and pages. AniVox never asks for your passwords, cookies, tokens, or private messages.
              </p>
            </div>
          </div>

          {/* Social Platform & Creator Search Bar */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block">
              Search Creator or Public Channel
            </span>

            {/* Platform Selector Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {(['youtube', 'instagram', 'tiktok', 'x', 'reddit', 'facebook', 'linkedin', 'twitch', 'spotify', 'web'] as SocialPlatform[]).map((p) => {
                const conf = PLATFORM_CONFIGS[p];
                const isSelected = selectedSocialPlatform === p;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedSocialPlatform(p);
                      soundEffects.playTap();
                      const target = socialSearchQuery.trim() || 'Grox';
                      setActiveSocialCard(resolveSocialProfile(target, p));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : 'glass-panel text-white/70 border-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {conf.displayName}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!socialSearchQuery.trim()) return;
                soundEffects.playTap();
                setActiveSocialCard(resolveSocialProfile(socialSearchQuery.trim(), selectedSocialPlatform));
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
                <input
                  type="text"
                  value={socialSearchQuery}
                  onChange={(e) => {
                    setSocialSearchQuery(e.target.value);
                    if (e.target.value.trim()) {
                      setActiveSocialCard(resolveSocialProfile(e.target.value.trim(), selectedSocialPlatform));
                    }
                  }}
                  placeholder="Enter creator name, handle, or channel (e.g. Grox, MrBeast)..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all"
              >
                Find
              </button>
            </form>

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-white/40 mr-1">Popular:</span>
              {['Grox', 'MrBeast', 'MKBHD', 'Veritasium', 'Kurzgesagt'].map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSocialSearchQuery(name);
                    setSelectedSocialPlatform('youtube');
                    setActiveSocialCard(resolveSocialProfile(name, 'youtube'));
                    soundEffects.playTap();
                  }}
                  className="px-2.5 py-1 rounded-lg glass-panel-interactive border-white/10 text-[11px] text-white/80 hover:text-cyan-300 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Rendered Live Social Card */}
          {activeSocialCard && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block">
                Validated Public Result Card
              </span>
              <SocialResultCard card={activeSocialCard} />
            </div>
          )}

          {/* Voice Command Reference Guide */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Voice Commands Understood by Vox</span>
            </div>
            <p className="text-xs text-white/70">
              You can speak naturally to Vox using any of these patterns:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                '"Who is Grox on YouTube?"',
                '"Open Grox\'s YouTube channel."',
                '"Find Grox on YouTube."',
                '"Open MrBeast on YouTube."',
                '"Find this person on Instagram."',
                '"Open this TikTok profile."',
                '"Find this creator on X."',
                '"Open this Reddit profile."',
              ].map((cmd, idx) => (
                <div key={idx} className="p-2.5 rounded-xl glass-panel border-white/5 text-cyan-300">
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. UTILITIES TAB */}
      {activeTab === 'utilities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Randomizer Card */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Shuffle className="w-4 h-4" />
              <span>Decision Tools</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={rollDice}
                className="p-3.5 rounded-xl glass-panel-interactive border-white/10 text-center transition-all"
              >
                <div className="text-[11px] text-white/50">Roll D6 Dice</div>
                <div className="text-xl font-mono font-black text-cyan-300 mt-1">
                  {diceResult !== null ? `🎲 ${diceResult}` : 'Roll'}
                </div>
              </button>

              <button
                onClick={flipCoin}
                className="p-3.5 rounded-xl glass-panel-interactive border-white/10 text-center transition-all"
              >
                <div className="text-[11px] text-white/50">Flip Coin</div>
                <div className="text-xl font-mono font-black text-amber-300 mt-1">
                  {coinResult !== null ? `🪙 ${coinResult}` : 'Flip'}
                </div>
              </button>
            </div>
          </div>

          {/* Unit Converter Card */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Temperature Converter</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1">
                <label className="text-[10px] text-white/50 block mb-1">Celsius (°C)</label>
                <input
                  type="number"
                  value={tempC}
                  onChange={(e) => handleConvertCtoF(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-panel text-xs text-white"
                />
              </div>
              <span className="text-white/40 mt-4">=</span>
              <div className="flex-1">
                <label className="text-[10px] text-white/50 block mb-1">Fahrenheit (°F)</label>
                <div className="px-3 py-2 rounded-xl glass-panel text-xs text-cyan-300 font-mono font-bold">
                  {tempF} °F
                </div>
              </div>
            </div>
          </div>

          {/* World Clocks Card */}
          <div className="sm:col-span-2 p-4 rounded-2xl glass-panel border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>Atmospheric Global Clocks</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { city: 'London', tz: 'Europe/London' },
                { city: 'Tokyo', tz: 'Asia/Tokyo' },
                { city: 'New York', tz: 'America/New_York' },
                { city: 'San Francisco', tz: 'America/Los_Angeles' },
              ].map((c) => {
                const timeStr = new Date().toLocaleTimeString('en-US', {
                  timeZone: c.tz,
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div key={c.city} className="p-3 rounded-xl glass-panel border-white/5">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">{c.city}</div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">{timeStr}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Address Book Contact Manager Modal */}
      <ContactManagerModal
        isOpen={showContactManager}
        onClose={() => setShowContactManager(false)}
      />
    </div>
  );
};
