import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Users,
  FileText,
  CheckSquare,
  Brain,
  Plus,
  ChevronRight,
  Folder,
  RefreshCw,
  Eye,
  Check,
  Clock,
  Shield,
  Volume2,
  Download,
  BookOpen,
} from 'lucide-react';
import {
  ProjectContext,
  ProjectCharacter,
  ProjectFile,
  ProjectTask,
  ProjectMemoryItem,
} from '../../types/assistant';
import { projectContextService } from '../../services/projectContextService';
import { userSnapshotService } from '../../services/userSnapshotService';
import { soundEffects } from '../../services/soundEffects';

interface ProjectsScreenProps {
  onNavigateToChat?: (conversationTitle?: string) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  onNavigateToChat,
}) => {
  const [activeProject, setActiveProject] = useState<ProjectContext>(
    projectContextService.getActiveProject()
  );
  const [allProjects, setAllProjects] = useState<ProjectContext[]>(
    projectContextService.getAllProjects()
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'files' | 'tasks' | 'memory'>('overview');
  
  // Selected file for lazy viewing
  const [viewingFile, setViewingFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // New item modal states
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [newMemKey, setNewMemKey] = useState('');
  const [newMemVal, setNewMemVal] = useState('');

  useEffect(() => {
    const unsubProject = projectContextService.subscribe((p) => {
      setActiveProject(p);
    });
    const unsubList = projectContextService.subscribeList((list) => {
      setAllProjects(list);
    });
    return () => {
      unsubProject();
      unsubList();
    };
  }, []);

  const handleSwitchProject = (projectId: string) => {
    soundEffects.playTap();
    const switched = projectContextService.selectProject(projectId);
    userSnapshotService.updateActiveProject(projectId);
    setActiveProject(switched);
  };

  const handleOpenFile = async (file: ProjectFile) => {
    soundEffects.playTap();
    setViewingFile(file);
    setIsLoadingFile(true);
    try {
      const content = await projectContextService.loadProjectFileContent(activeProject.id, file.id);
      setFileContent(content);
    } catch (e) {
      setFileContent('Error loading file content.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;
    soundEffects.playSuccess();
    projectContextService.addCharacter({
      name: newCharName.trim(),
      role: newCharRole.trim() || 'Character',
      description: newCharDesc.trim() || 'Project character',
      traits: ['Dynamic', 'Voice-Assisted'],
      isActive: true,
    });
    setNewCharName('');
    setNewCharRole('');
    setNewCharDesc('');
    setIsAddingCharacter(false);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    soundEffects.playSuccess();
    projectContextService.addTask({
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: newTaskPriority,
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemKey.trim() || !newMemVal.trim()) return;
    soundEffects.playSuccess();
    projectContextService.addProjectMemory(newMemKey.trim(), newMemVal.trim(), 'Project Lore');
    setNewMemKey('');
    setNewMemVal('');
    setIsAddingMemory(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Project Selector & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-950/80 to-purple-950/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider">
                Active AniVox Project
              </span>
              <span className="text-xs text-white/40 font-mono">
                {activeProject.genre}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {activeProject.title}
            </h1>
            <p className="text-xs text-white/60 line-clamp-1 max-w-xl">
              {activeProject.tagline}
            </p>
          </div>
        </div>

        {/* Project Switcher Dropdown / Pills */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
          {allProjects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => handleSwitchProject(proj.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeProject.id === proj.id
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{proj.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto">
        {[
          { id: 'overview', label: 'Manifest & Overview', icon: BookOpen },
          { id: 'characters', label: `Active Characters (${activeProject.activeCharacters.length})`, icon: Users },
          { id: 'files', label: `Relevant Files (${activeProject.relevantFiles.length})`, icon: FileText },
          { id: 'tasks', label: `Current Tasks (${activeProject.currentTasks.length})`, icon: CheckSquare },
          { id: 'memory', label: `Project Memory (${activeProject.savedMemories.length})`, icon: Brain },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playTap();
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            <div className="p-5 rounded-3xl glass-panel border-white/10 bg-slate-950/60 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Project Synopsis & Lore
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeProject.description}
              </p>
            </div>

            {/* Recent Conversations */}
            <div className="p-5 rounded-3xl glass-panel border-white/10 bg-slate-950/60 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Recent Storyline Sessions
                </h2>
                {onNavigateToChat && (
                  <button
                    onClick={() => {
                      soundEffects.playTap();
                      onNavigateToChat('Cosmic Wrath Discussion');
                    }}
                    className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
                  >
                    <span>Open in Vox Chat</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {activeProject.recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{conv.title}</h4>
                      <p className="text-[11px] text-white/50">{conv.lastMessageSnippet}</p>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      {conv.messageCount} msgs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Fast Actions */}
          <div className="space-y-5">
            <div className="p-5 rounded-3xl glass-panel border-white/10 bg-slate-950/60 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/60 font-bold">
                Project Manifest Metrics
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-xl font-black text-cyan-400 block font-mono">
                    {activeProject.activeCharacters.length}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase font-semibold">
                    Characters
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-xl font-black text-purple-400 block font-mono">
                    {activeProject.relevantFiles.length}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase font-semibold">
                    Relevant Files
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-xl font-black text-emerald-400 block font-mono">
                    {activeProject.currentTasks.filter((t) => t.status === 'completed').length}/
                    {activeProject.currentTasks.length}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase font-semibold">
                    Tasks Done
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-xl font-black text-amber-400 block font-mono">
                    {activeProject.savedMemories.length}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase font-semibold">
                    Lore Memories
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE CHARACTERS */}
      {activeTab === 'characters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60">
              Active characters loaded for narrative generation, voice dialogue, and context.
            </p>
            <button
              onClick={() => {
                soundEffects.playTap();
                setIsAddingCharacter(!isAddingCharacter);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Character</span>
            </button>
          </div>

          {isAddingCharacter && (
            <form onSubmit={handleSaveCharacter} className="p-5 rounded-3xl glass-panel border-cyan-500/40 bg-cyan-950/30 space-y-3 animate-slide-down">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">New Character</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Character Name (e.g. Atlas-Prime)"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Ancient Titan Guardian)"
                  value={newCharRole}
                  onChange={(e) => setNewCharRole(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <textarea
                placeholder="Description & Traits..."
                value={newCharDesc}
                onChange={(e) => setNewCharDesc(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCharacter(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-white/60 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black"
                >
                  Save Character
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeProject.activeCharacters.map((char) => (
              <div
                key={char.id}
                className="p-5 rounded-3xl glass-panel border-white/10 bg-slate-950/60 space-y-3 hover:border-cyan-500/40 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-black text-sm">
                      {char.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{char.name}</h3>
                      <span className="text-[11px] text-purple-300/80 font-medium">
                        {char.role}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {char.description}
                </p>

                {char.voiceProfile && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-white/50">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Voice Profile: <strong className="text-cyan-300">{char.voiceProfile}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RELEVANT FILES */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <p className="text-xs text-white/60">
            Files relevant to "{activeProject.title}". Content loads lazily to maintain instant startup speed.
          </p>

          <div className="space-y-3">
            {activeProject.relevantFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-2xl glass-panel border-white/10 bg-slate-950/60 flex items-center justify-between gap-3 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{file.name}</h4>
                    <p className="text-[11px] text-white/50">{file.summary || 'Project document'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/40 font-mono hidden sm:inline">
                    {file.size}
                  </span>
                  <button
                    onClick={() => handleOpenFile(file)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Content</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Inline Preview for Lazy Loaded File */}
          {viewingFile && (
            <div className="p-5 rounded-3xl glass-panel border-cyan-500/30 bg-slate-950/90 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-cyan-300">
                  <FileText className="w-4 h-4" />
                  <span>{viewingFile.name}</span>
                </div>
                <button
                  onClick={() => setViewingFile(null)}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Close Preview
                </button>
              </div>
              {isLoadingFile ? (
                <div className="py-8 text-center text-xs text-cyan-300 font-mono animate-pulse">
                  Loading file content...
                </div>
              ) : (
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto p-3 bg-black/40 rounded-xl border border-white/5">
                  {fileContent}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60">
              Active milestones and production tasks for this project universe.
            </p>
            <button
              onClick={() => {
                soundEffects.playTap();
                setIsAddingTask(!isAddingTask);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {isAddingTask && (
            <form onSubmit={handleSaveTask} className="p-5 rounded-3xl glass-panel border-emerald-500/40 bg-emerald-950/30 space-y-3 animate-slide-down">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">New Project Task</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  required
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-white/60 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {activeProject.currentTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  soundEffects.playTap();
                  projectContextService.toggleTaskStatus(task.id);
                }}
                className={`p-4 rounded-2xl glass-panel border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  task.status === 'completed'
                    ? 'border-white/5 bg-white/5 opacity-60'
                    : 'border-white/10 bg-slate-950/60 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-white/30'
                    }`}
                  >
                    {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      task.status === 'completed' ? 'line-through text-white/50' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    task.priority === 'high'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROJECT MEMORY */}
      {activeTab === 'memory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60">
              Canon facts, plot constraints, and universe rules preserved for Vox generation.
            </p>
            <button
              onClick={() => {
                soundEffects.playTap();
                setIsAddingMemory(!isAddingMemory);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-500/30 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
          </div>

          {isAddingMemory && (
            <form onSubmit={handleSaveMemory} className="p-5 rounded-3xl glass-panel border-purple-500/40 bg-purple-950/30 space-y-3 animate-slide-down">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">New Project Memory</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Key (e.g. Titan Energy Source)"
                  value={newMemKey}
                  onChange={(e) => setNewMemKey(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Canon Rule / Detail..."
                  value={newMemVal}
                  onChange={(e) => setNewMemVal(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMemory(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-white/60 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-500 text-white text-xs font-black"
                >
                  Save Lore Memory
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeProject.savedMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-5 rounded-3xl glass-panel border-white/10 bg-slate-950/60 space-y-2 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 font-mono">
                    {mem.key}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {mem.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {mem.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
