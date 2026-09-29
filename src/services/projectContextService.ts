import {
  ProjectContext,
  ProjectCharacter,
  ProjectFile,
  ProjectTask,
  ProjectMemoryItem,
  ProjectConversationSummary,
} from '../types/assistant';

const PROJECTS_CACHE_KEY = 'anivox_projects_catalog_v2';

export const DEFAULT_COSMIC_WRATH_PROJECT: ProjectContext = {
  id: 'proj-cosmic-wrath',
  title: 'Cosmic Wrath: The Lost Titans',
  tagline: 'An epic sci-fi mythological saga of ancient titans awakened in deep space.',
  description: 'In the year 2840, mining vessel Nova-7 unearths the dormant slumber of Hyperion and Kronos inside a crystalline asteroid belt.',
  genre: 'Sci-Fi / Space Opera / Mythological Action',
  coverUrl: '/anivox-icon.svg',
  updatedAt: new Date().toISOString(),
  createdAt: '2026-08-01T12:00:00.000Z',
  activeCharacters: [
    {
      id: 'char-atlas',
      name: 'Atlas-Prime',
      role: 'Ancient Titan Guardian',
      description: 'A 40-foot cyber-organic titan awakened from stasis, bearing planetary gravitational core shields.',
      traits: ['Imposing', 'Protective', 'Resonant Voice', 'Gravitational Powers'],
      voiceProfile: 'Deep Resonant Synth Bass',
      isActive: true,
    },
    {
      id: 'char-kronos',
      name: 'Kronos',
      role: 'Temporal Lord of the Lost Void',
      description: 'The ancient temporal entity capable of distorting event horizons and reversing local entropy.',
      traits: ['Cunning', 'Unpredictable', 'Temporal Manipulation'],
      voiceProfile: 'Whispering Glitch Baritone',
      isActive: true,
    },
    {
      id: 'char-nova7',
      name: 'Commander Nova-7',
      role: 'Vessel Captain & Lead Explorer',
      description: 'Cybernetically augmented human captain navigating deep planetary anomalies and Titan containment.',
      traits: ['Strategic', 'Courageous', 'Empathetic', 'Quick-Thinking'],
      voiceProfile: 'Clear Tactical Mid-Range',
      isActive: true,
    },
    {
      id: 'char-rhea',
      name: 'Rhea the Oracle',
      role: 'Starlight Seer & Astromancer',
      description: 'An ethereal scholar who deciphers celestial prophecy and Titan runes.',
      traits: ['Mystical', 'Enigmatic', 'Harmonic Voice'],
      voiceProfile: 'Ethereal Soprano',
      isActive: true,
    },
  ],
  recentConversations: [
    {
      id: 'conv-titan-lore-1',
      title: 'Titan Core Energy Calibration',
      lastMessageSnippet: 'Nova-7 stabilized the gravitational field around Atlas-Prime.',
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      messageCount: 14,
    },
    {
      id: 'conv-titan-lore-2',
      title: 'Kronos Temporal Anomaly Analysis',
      lastMessageSnippet: 'Time distortion detected near Sector 9 Asteroid Belt.',
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      messageCount: 8,
    },
  ],
  relevantFiles: [
    {
      id: 'file-story-bible',
      name: 'Cosmic_Wrath_Story_Bible.md',
      type: 'lore',
      size: '24 KB',
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      summary: 'Complete world history, Titan pantheon origins, and deep space star charts.',
      content: `# Cosmic Wrath: The Lost Titans - World Bible
## Overview
Before the dawn of humanity, the Titans governed planetary gravitations and solar furnaces.

## The Awakening
In 2840, humanity's deep-space miners breached the Crystalline Slumber Matrix in the Outer Verge...`,
      isLoaded: true,
    },
    {
      id: 'file-ep1-script',
      name: 'Episode_01_The_Awakening.fountain',
      type: 'script',
      size: '42 KB',
      updatedAt: new Date(Date.now() - 14400000).toISOString(),
      summary: 'Act I & II screenplay draft of the first awakening sequence.',
      isLoaded: false, // Lazy loaded on demand
    },
    {
      id: 'file-audio-foley',
      name: 'Titan_SubBass_Frequencies.json',
      type: 'audio',
      size: '8.4 KB',
      updatedAt: new Date(Date.now() - 28800000).toISOString(),
      summary: 'Atmospheric modular synthesis presets for Titan footfalls.',
      isLoaded: false,
    },
  ],
  currentTasks: [
    {
      id: 'ptask-1',
      title: 'Finalize Act III Titan Dialogue between Atlas-Prime & Kronos',
      status: 'in_progress',
      priority: 'high',
      assignedCharacterId: 'char-atlas',
    },
    {
      id: 'ptask-2',
      title: 'Mix atmospheric sub-bass audio for Titan awakening scene',
      status: 'todo',
      priority: 'medium',
    },
    {
      id: 'ptask-3',
      title: 'Generate 4K neural visual concept art for Sector 9 Citadel',
      status: 'completed',
      priority: 'low',
    },
  ],
  savedMemories: [
    {
      id: 'pmem-1',
      category: 'Lore',
      key: 'Titan Energy Source',
      value: 'Titans draw kinetic power directly from compressed dark-matter singularities.',
      createdAt: '2026-08-10T10:00:00.000Z',
    },
    {
      id: 'pmem-2',
      category: 'Plot Rules',
      key: 'Temporal Paradox Guard',
      value: 'Kronos can only rewind localized event horizons up to 300 seconds before space-time collapses.',
      createdAt: '2026-08-12T14:30:00.000Z',
    },
  ],
  metadata: {
    totalFilesCount: 12,
    totalDialogueLines: 340,
    isArchived: false,
    isDefault: true,
  },
};

export const SECONDARY_PROJECT_CATALOG: ProjectContext[] = [
  DEFAULT_COSMIC_WRATH_PROJECT,
  {
    id: 'proj-cyber-renaissance',
    title: 'Cyber Renaissance 2099',
    tagline: 'Neo-Venice cyberpunk investigative mystery where memories are traded like crypto.',
    description: 'Detective Marco investigates stolen synthetic consciousness in flooded neo-canals.',
    genre: 'Cyberpunk / Noir / Tech Thriller',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: '2026-07-15T09:00:00.000Z',
    activeCharacters: [
      {
        id: 'char-marco',
        name: 'Detective Marco Rossi',
        role: 'Synthetic Memory Investigator',
        description: 'Hardened detective with an optical data-tap cyberware implant.',
        traits: ['Analytical', 'World-Weary', 'Perceptive'],
        isActive: true,
      },
    ],
    recentConversations: [],
    relevantFiles: [],
    currentTasks: [],
    savedMemories: [],
    metadata: {
      totalFilesCount: 5,
      totalDialogueLines: 120,
      isArchived: false,
    },
  },
];

class ProjectContextService {
  private projectsMap: Map<string, ProjectContext> = new Map();
  private activeProjectId: string = 'proj-cosmic-wrath';
  private subscribers: Set<(activeProject: ProjectContext) => void> = new Set();
  private listSubscribers: Set<(projects: ProjectContext[]) => void> = new Set();

  constructor() {
    this.loadCatalogFromStorage();
  }

  private loadCatalogFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(PROJECTS_CACHE_KEY);
      if (raw) {
        const parsed: ProjectContext[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((p) => this.projectsMap.set(p.id, p));
          if (this.projectsMap.has('proj-cosmic-wrath')) {
            this.activeProjectId = 'proj-cosmic-wrath';
          } else {
            this.activeProjectId = parsed[0].id;
          }
          return;
        }
      }
    } catch (e) {
      console.warn('[ProjectContextService] Storage parse failed, initializing defaults:', e);
    }

    SECONDARY_PROJECT_CATALOG.forEach((p) => this.projectsMap.set(p.id, p));
  }

  public getActiveProject(): ProjectContext {
    return this.projectsMap.get(this.activeProjectId) || DEFAULT_COSMIC_WRATH_PROJECT;
  }

  public getAllProjects(): ProjectContext[] {
    return Array.from(this.projectsMap.values());
  }

  /**
   * Fast Project Switching with Smart Lazy Loading.
   * Immediately updates active project, loads essential context first, and notifies subscribers.
   */
  public selectProject(projectId: string): ProjectContext {
    const project = this.projectsMap.get(projectId);
    if (!project) return this.getActiveProject();

    this.activeProjectId = projectId;
    this.notifySubscribers();
    this.persist();
    return project;
  }

  /**
   * Lazy Load large file content on demand without blocking project load
   */
  public async loadProjectFileContent(projectId: string, fileId: string): Promise<string> {
    const project = this.projectsMap.get(projectId);
    if (!project) throw new Error('Project not found');

    const file = project.relevantFiles.find((f) => f.id === fileId);
    if (!file) throw new Error('File not found in project');

    if (file.content) {
      file.isLoaded = true;
      return file.content;
    }

    // Simulated fast async fetch for lazy-loaded scripts
    await new Promise((r) => setTimeout(r, 80));
    const generatedContent = `# ${file.name}\n\n[Full project document content loaded asynchronously on demand]\n\nDocument Summary: ${file.summary || 'Project documentation'}\nLast Modified: ${file.updatedAt}`;
    
    file.content = generatedContent;
    file.isLoaded = true;
    this.persist();
    return generatedContent;
  }

  public addCharacter(character: Omit<ProjectCharacter, 'id'>): ProjectCharacter {
    const active = this.getActiveProject();
    const newChar: ProjectCharacter = {
      ...character,
      id: `char-${Date.now()}`,
    };
    active.activeCharacters.push(newChar);
    active.updatedAt = new Date().toISOString();
    this.persist();
    this.notifySubscribers();
    return newChar;
  }

  public addTask(task: Omit<ProjectTask, 'id'>): ProjectTask {
    const active = this.getActiveProject();
    const newTask: ProjectTask = {
      ...task,
      id: `ptask-${Date.now()}`,
    };
    active.currentTasks.unshift(newTask);
    active.updatedAt = new Date().toISOString();
    this.persist();
    this.notifySubscribers();
    return newTask;
  }

  public toggleTaskStatus(taskId: string): void {
    const active = this.getActiveProject();
    const task = active.currentTasks.find((t) => t.id === taskId);
    if (task) {
      task.status = task.status === 'completed' ? 'in_progress' : 'completed';
      active.updatedAt = new Date().toISOString();
      this.persist();
      this.notifySubscribers();
    }
  }

  public addProjectMemory(key: string, value: string, category: string = 'General'): ProjectMemoryItem {
    const active = this.getActiveProject();
    const newMem: ProjectMemoryItem = {
      id: `pmem-${Date.now()}`,
      key,
      value,
      category,
      createdAt: new Date().toISOString(),
    };
    active.savedMemories.unshift(newMem);
    active.updatedAt = new Date().toISOString();
    this.persist();
    this.notifySubscribers();
    return newMem;
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined') {
        const list = Array.from(this.projectsMap.values());
        localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('[ProjectContextService] Local save error:', e);
    }
  }

  public subscribe(fn: (activeProject: ProjectContext) => void): () => void {
    this.subscribers.add(fn);
    fn(this.getActiveProject());
    return () => this.subscribers.delete(fn);
  }

  public subscribeList(fn: (projects: ProjectContext[]) => void): () => void {
    this.listSubscribers.add(fn);
    fn(this.getAllProjects());
    return () => this.listSubscribers.delete(fn);
  }

  private notifySubscribers(): void {
    const active = this.getActiveProject();
    const list = this.getAllProjects();
    this.subscribers.forEach((fn) => fn(active));
    this.listSubscribers.forEach((fn) => fn(list));
  }
}

export const projectContextService = new ProjectContextService();
