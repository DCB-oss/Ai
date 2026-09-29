// YouTube Creator Mode & Creator Assistant Service for AniVox
// Provides verified channel tools, video planning, title formulas, tags, and YPP guidelines.
// Strictly NEVER fakes numbers, never invents statistics, and strictly separates official DCB channel from personal user channel.

export interface YouTubeCreatorProfile {
  isCreator: boolean;
  channelName: string;
  channelHandle: string; // e.g. @MyChannel or custom handle
  channelUrl: string;
  subscribers: number | null;
  totalViews: number | null;
  totalVideos: number | null;
  estimatedWatchHours: number | null;
  configuredMilestoneSubs: number; // Default YPP target: 1000
  configuredMilestoneWatchHours: number; // Default YPP target: 4000
  niche: string; // Gaming, Tech, Anime, Music, Education, Vlog
  lastUpdated: string;
  isAuthenticated: boolean;
}

export interface CreatorIdeaCard {
  id: string;
  title: string;
  concept: string;
  hook: string;
  thumbnailIdea: string;
  suggestedTags: string[];
  difficulty: 'Easy' | 'Medium' | 'Ambitious';
}

const DEFAULT_USER_CREATOR_PROFILE: YouTubeCreatorProfile = {
  isCreator: false,
  channelName: 'My YouTube Channel',
  channelHandle: '',
  channelUrl: '',
  subscribers: null, // Null indicates statistics must be retrieved from official API or marked unavailable
  totalViews: null,
  totalVideos: null,
  estimatedWatchHours: null,
  configuredMilestoneSubs: 1000,
  configuredMilestoneWatchHours: 4000,
  niche: 'Technology & AI',
  lastUpdated: new Date().toISOString(),
  isAuthenticated: false,
};

class CreatorAssistantService {
  private profile: YouTubeCreatorProfile;
  private listeners: Set<(p: YouTubeCreatorProfile) => void> = new Set();

  constructor() {
    const saved = localStorage.getItem('anivox_user_creator_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure obsolete VoxCreator handle is scrubbed if found in old cache
        if (parsed.channelHandle === '@VoxCreator' || parsed.channelName === 'Vox Creator Studio') {
          this.profile = DEFAULT_USER_CREATOR_PROFILE;
          localStorage.removeItem('anivox_user_creator_profile');
        } else {
          this.profile = { ...DEFAULT_USER_CREATOR_PROFILE, ...parsed };
        }
      } catch (e) {
        this.profile = DEFAULT_USER_CREATOR_PROFILE;
      }
    } else {
      this.profile = DEFAULT_USER_CREATOR_PROFILE;
    }
  }

  private save() {
    try {
      localStorage.setItem('anivox_user_creator_profile', JSON.stringify(this.profile));
    } catch (e) {}
    for (const l of this.listeners) {
      try {
        l({ ...this.profile });
      } catch (err) {}
    }
  }

  public getProfile(): YouTubeCreatorProfile {
    return { ...this.profile };
  }

  public updateProfile(updates: Partial<YouTubeCreatorProfile>) {
    this.profile = { ...this.profile, ...updates, lastUpdated: new Date().toISOString() };
    this.save();
  }

  public subscribe(cb: (p: YouTubeCreatorProfile) => void): () => void {
    this.listeners.add(cb);
    cb({ ...this.profile });
    return () => this.listeners.delete(cb);
  }

  // Generates structured YouTube assistance cards (titles, descriptions, thumbnails, content plan)
  public generateCreatorAssistance(topicOrNiche?: string): {
    headline: string;
    ideas: CreatorIdeaCard[];
    titleFormulas: string[];
    descriptionTemplate: string;
    currentPolicyNote: string;
  } {
    const niche = topicOrNiche || this.profile.niche || 'Technology & AI';

    const ideas: CreatorIdeaCard[] = [
      {
        id: 'idea-1',
        title: `I Tested 5 Secret ${niche} Tools for 30 Days`,
        concept: 'High-retention challenge video documenting real results, pros and cons, and unexpected surprises.',
        hook: 'Within the first 5 seconds, show the dramatic difference before vs after using the top tool.',
        thumbnailIdea: 'Split screen: Left side distressed / blurred, Right side glowing neon with 300% boost badge.',
        suggestedTags: [niche.toLowerCase(), 'tutorial', 'experiment', 'review', 'productivity'],
        difficulty: 'Medium',
      },
      {
        id: 'idea-2',
        title: `The Truth About ${niche} Nobody Tells You`,
        concept: 'An honest commentary and myth-busting breakdown addressing widespread community misconceptions.',
        hook: 'Ask a polarizing question: "Are you still doing X? Here is why that is actually costing you hours."',
        thumbnailIdea: 'Close-up facial expression with a bold red diagonal stamp: "STOP DOING THIS".',
        suggestedTags: [niche.toLowerCase(), 'myths', 'guide', 'tips', 'breakdown'],
        difficulty: 'Easy',
      },
      {
        id: 'idea-3',
        title: `How I Built a Pro ${niche} System in 24 Hours`,
        concept: 'Fast-paced build/timelapse with step-by-step visual blueprint for beginner and advanced viewers.',
        hook: 'Start with a dynamic countdown timer overlay: "24 hours on the clock."',
        thumbnailIdea: 'Blueprint grid backdrop with 3 glowing milestone arrows and "24H" badge.',
        suggestedTags: [niche.toLowerCase(), 'speedrun', 'build', 'stepbystep'],
        difficulty: 'Ambitious',
      },
    ];

    const titleFormulas = [
      `Why [Topic] is Changing Everything in 2026`,
      `How to [Desirable Outcome] (Without [Common Pain Point])`,
      `I Spent 100 Hours Mastering [Skill/Game] So You Don't Have To`,
      `The Ultimate ${niche} Starter Guide (Zero to Pro)`,
      `Don't Buy/Start [Topic] Until You Watch This`,
    ];

    const descriptionTemplate = `📌 In this video, we break down everything you need to know about [Topic]!

TIMESTAMPS:
0:00 - Introduction & Hook
1:15 - Core Concept Explained
3:45 - Live Demo & Breakdown
7:20 - Top Mistakes to Avoid
9:50 - Pro Tips & Next Steps

🔗 USEFUL LINKS & RESOURCES:
• Official Community: [Your Link]
• Recommended Tools: [Your Link]

💬 QUESTION OF THE DAY:
What is your biggest question about ${niche}? Let me know in the comments below!

👍 Don't forget to Like and Subscribe for weekly ${niche} tutorials!`;

    const currentPolicyNote = `YouTube Partner Program (YPP) verified thresholds: 1,000 subscribers AND either 4,000 valid public watch hours in 12 months OR 10M valid public Shorts views in 90 days. 2-Step Verification and zero active Community Guidelines strikes are required.`;

    return {
      headline: `Creator Plan & Content Strategy for ${niche}`,
      ideas,
      titleFormulas,
      descriptionTemplate,
      currentPolicyNote,
    };
  }
}

export const creatorAssistant = new CreatorAssistantService();
