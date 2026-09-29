// AniVox Official Company, Founders & Public Team Configuration
// Contains verified founder details, configurable public team email, and company policies.

export interface FounderProfile {
  name: string;
  role: string;
  bio: string;
  principles: string[];
}

export const ANIVOX_FOUNDER: FounderProfile = {
  name: 'Samuel David',
  role: 'Founder & Owner of AniVox',
  bio: 'Samuel David is the visionary founder and creator of AniVox. Built on the core ethos of voice-first accessibility, privacy preservation, and authentic software engineering, AniVox was architected to empower users with an honest, high-intelligence AI companion and creator ecosystem without deceptive mock telemetry or fabricated capabilities.',
  principles: [
    'Real Functionality Over Visual Demonstrations: Genuine system APIs, honest telemetry, and zero faked hardware.',
    'Privacy-First Architecture: On-device contact processing, voluntary memory storage, and never exposing private credentials.',
    'Voice-First Intelligence: Rapid, grounded factual knowledge with transparent source citations and multi-tier model resilience.',
    'Empowerment of Creators: Seamless YouTube workflow integration, smart link resolution, and music discovery.',
  ],
};

// Default configurable public team contact email
export const DEFAULT_ANIVOX_TEAM_EMAIL = '[ENTER OFFICIAL TEAM EMAIL HERE]';

// Official AniVox YouTube Channel & DCB Universe
export const ANIVOX_OFFICIAL_YOUTUBE_URL = 'https://youtube.com/@DCBUniverse-n';
export const ANIVOX_OFFICIAL_YOUTUBE_HANDLE = '@DCBUniverse-n';

/**
 * Retrieves the currently configured public team email.
 * Defaults to DEFAULT_ANIVOX_TEAM_EMAIL if not customized by the owner.
 */
export function getAniVoxTeamEmail(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem('anivox_team_email_override');
    if (custom && custom.trim()) {
      return custom.trim();
    }
  }
  return DEFAULT_ANIVOX_TEAM_EMAIL;
}

/**
 * Allows the application owner/admin to update the public team email.
 */
export function setAniVoxTeamEmail(newEmail: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (newEmail && newEmail.trim() && newEmail !== DEFAULT_ANIVOX_TEAM_EMAIL) {
      window.localStorage.setItem('anivox_team_email_override', newEmail.trim());
    } else {
      window.localStorage.removeItem('anivox_team_email_override');
    }
  }
}

/**
 * Official Company Policy on Team Compensation
 */
export const ANIVOX_TEAM_PAYMENT_POLICY = {
  statement:
    "At the moment, AniVox does not offer paid positions. Participation is voluntary. If you're still interested, you can contact the team.",
  promptFollowUp: "Would you still like to join?",
  isPaid: false,
};
