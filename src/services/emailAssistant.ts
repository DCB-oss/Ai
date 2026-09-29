// AniVox Email & Gmail Assistant Service
// Implements safe email understanding, employment opportunity detection, draft replies,
// and strict important email protection safeguards.
// NEVER requests or stores Gmail passwords.

export type EmailAutoReplyMode = 'OFF' | 'DRAFT_ONLY' | 'AUTO_REPLY';

export type EmailProcessingStatus = 'DRAFTED' | 'WAITING_FOR_APPROVAL' | 'SENT' | 'FAILED';

export interface EmploymentDetails {
  company: string;
  position: string;
  requirements: string[];
  location: string;
  deadline?: string;
  importantInfo?: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string;
  isRead: boolean;
  isImportant: boolean;
  isEmploymentOpportunity: boolean;
  employmentDetails?: EmploymentDetails;
  detectedQuestions?: string[];
  suggestedDraftReply?: string;
  draftStatus?: EmailProcessingStatus;
  sentAt?: string;
  requiresReview: boolean; // True if contract, financial, legal, employment, etc.
  riskCategory?: 'HIGH_IMPACT' | 'LOW_RISK' | 'GENERAL';
}

export interface EmailAssistantSettings {
  isConnected: boolean;
  accountEmail: string;
  autoReplyMode: EmailAutoReplyMode;
  allowLowRiskAutoReply: boolean;
  notifyOnEmployment: boolean;
  notifyOnActionRequired: boolean;
  customSignature: string;
}

const HIGH_IMPACT_KEYWORDS = [
  'contract',
  'offer',
  'salary',
  'compensation',
  'agreement',
  'legal',
  'bank',
  'invoice',
  'wire',
  'payment',
  'medical',
  'health',
  'password',
  'verification code',
  'security code',
  'tax',
  'government',
  'lawyer',
  'attorney',
  'deed',
  'nda',
];

const INITIAL_SETTINGS: EmailAssistantSettings = {
  isConnected: false,
  accountEmail: '',
  autoReplyMode: 'DRAFT_ONLY',
  allowLowRiskAutoReply: false,
  notifyOnEmployment: true,
  notifyOnActionRequired: true,
  customSignature: 'Sent with assistance from AniVox',
};

// Initial authorized sample emails demonstrating structure (when connected)
const INITIAL_DEMO_EMAILS: EmailMessage[] = [
  {
    id: 'em-101',
    from: 'recruiting@quantumforge.tech',
    fromName: 'QuantumForge Talent Team',
    to: 'me@gmail.com',
    subject: 'Senior Frontend Engineer / AI Interface Designer Role at QuantumForge',
    snippet: 'We reviewed your open-source projects and would love to discuss a Senior Frontend Engineer role in San Francisco...',
    body: `Hi David,\n\nWe have been following your impressive work on intelligent voice interfaces and responsive client architectures. We would love to discuss an open opportunity for a Senior Frontend Engineer / AI Interface Designer at QuantumForge.\n\nPosition Details:\n- Role: Senior Frontend Engineer (AI Interfaces)\n- Location: San Francisco, CA (Hybrid / Remote-friendly)\n- Requirements: 4+ years TypeScript/React, experience building low-latency UIs, voice synthesis or Web Audio API exposure.\n- Application Deadline: Next Friday, 5:00 PM PST.\n\nPlease let us know if you would be open for a 20-minute exploratory conversation next Tuesday or Wednesday.\n\nBest regards,\nSarah Jenkins\nQuantumForge Talent Acquisition`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    isImportant: true,
    isEmploymentOpportunity: true,
    employmentDetails: {
      company: 'QuantumForge',
      position: 'Senior Frontend Engineer (AI Interfaces)',
      location: 'San Francisco, CA (Hybrid / Remote-friendly)',
      requirements: [
        '4+ years TypeScript / React',
        'Low-latency UI architecture',
        'Voice synthesis or Web Audio API exposure',
      ],
      deadline: 'Next Friday, 5:00 PM PST',
      importantInfo: 'Invited for 20-minute exploratory conversation next Tuesday or Wednesday.',
    },
    detectedQuestions: ['Would you be open for a 20-minute exploratory conversation next Tuesday or Wednesday?'],
    suggestedDraftReply: `Hi Sarah,\n\nThank you for reaching out. I would be very interested in discussing the Senior Frontend Engineer role at QuantumForge. I am available next Tuesday at 2:00 PM PST or Wednesday at 10:00 AM PST. Please let me know what works best for your team.\n\nBest regards,\nDavid`,
    draftStatus: 'WAITING_FOR_APPROVAL',
    requiresReview: true,
    riskCategory: 'HIGH_IMPACT',
  },
  {
    id: 'em-102',
    from: 'support@cloudprovider.com',
    fromName: 'Cloud Infrastructure Support',
    to: 'me@gmail.com',
    subject: 'Scheduled Maintenance Notice: Cluster EU-Central',
    snippet: 'Please be advised that routine maintenance is scheduled for Sunday 02:00 UTC...',
    body: `Hello,\n\nPlease be advised that routine maintenance on our EU-Central regional cluster is scheduled for this Sunday between 02:00 UTC and 04:00 UTC. No downtime is anticipated, but temporary latency spikes may occur.\n\nIf you have any questions, reply to this ticket.\n\nCloud Operations Team`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isRead: true,
    isImportant: false,
    isEmploymentOpportunity: false,
    requiresReview: false,
    riskCategory: 'LOW_RISK',
  },
];

class EmailAssistantService {
  private settings: EmailAssistantSettings;
  private emails: EmailMessage[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    const savedSettings = localStorage.getItem('anivox_email_settings');
    const savedEmails = localStorage.getItem('anivox_email_inbox');

    this.settings = savedSettings ? { ...INITIAL_SETTINGS, ...JSON.parse(savedSettings) } : INITIAL_SETTINGS;
    this.emails = savedEmails ? JSON.parse(savedEmails) : INITIAL_DEMO_EMAILS;
  }

  private save() {
    try {
      localStorage.setItem('anivox_email_settings', JSON.stringify(this.settings));
      localStorage.setItem('anivox_email_inbox', JSON.stringify(this.emails));
    } catch (e) {}
    this.notify();
  }

  private notify() {
    for (const l of this.listeners) {
      try {
        l();
      } catch (err) {}
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getSettings(): EmailAssistantSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<EmailAssistantSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.save();
  }

  public getEmails(): EmailMessage[] {
    return [...this.emails];
  }

  public connectGmail(emailAddress: string) {
    this.settings.isConnected = true;
    this.settings.accountEmail = emailAddress || 'user@gmail.com';
    this.save();
  }

  public disconnectGmail() {
    this.settings.isConnected = false;
    this.settings.accountEmail = '';
    this.save();
  }

  public setAutoReplyMode(mode: EmailAutoReplyMode) {
    this.settings.autoReplyMode = mode;
    this.save();
  }

  // Analyzes incoming email text strictly extracting facts
  public analyzeEmail(subject: string, body: string): {
    isEmploymentOpportunity: boolean;
    employmentDetails?: EmploymentDetails;
    detectedQuestions: string[];
    requiresReview: boolean;
    riskCategory: 'HIGH_IMPACT' | 'LOW_RISK' | 'GENERAL';
    suggestedDraft: string;
  } {
    const textLower = `${subject} ${body}`.toLowerCase();
    
    // Check high impact protection
    const isHighImpact = HIGH_IMPACT_KEYWORDS.some((kw) => textLower.includes(kw));

    // Detect employment
    const isJob =
      textLower.includes('position') ||
      textLower.includes('hiring') ||
      textLower.includes('job opportunity') ||
      textLower.includes('interview') ||
      textLower.includes('role at') ||
      textLower.includes('talent acquisition');

    // Extract questions
    const sentences = body.split(/[.!?\n]+/);
    const detectedQuestions = sentences
      .map((s) => s.trim())
      .filter((s) => s.endsWith('?') || s.toLowerCase().startsWith('could you') || s.toLowerCase().startsWith('can you') || s.toLowerCase().startsWith('please let us know'));

    let employmentDetails: EmploymentDetails | undefined;
    if (isJob) {
      employmentDetails = {
        company: subject.includes('at ') ? subject.split('at ')[1]?.trim() : 'Prospective Employer',
        position: subject.includes('Role') ? subject.split('Role')[0]?.trim() : 'Technical Position',
        requirements: ['Mentioned in message details'],
        location: textLower.includes('remote') ? 'Remote / Hybrid' : 'Specified in body',
        deadline: 'Review message for specific timeline',
      };
    }

    const suggestedDraft = `Hi,\n\nThank you for reaching out regarding "${subject}". I have received your message and will review the details shortly.\n\nBest regards.`;

    return {
      isEmploymentOpportunity: isJob,
      employmentDetails,
      detectedQuestions,
      requiresReview: isHighImpact || isJob,
      riskCategory: isHighImpact || isJob ? 'HIGH_IMPACT' : 'LOW_RISK',
      suggestedDraft,
    };
  }

  // Updates a draft reply
  public updateDraftReply(emailId: string, replyText: string) {
    this.emails = this.emails.map((em) => {
      if (em.id === emailId) {
        return {
          ...em,
          suggestedDraftReply: replyText,
          draftStatus: 'DRAFTED',
        };
      }
      return em;
    });
    this.save();
  }

  // Explicitly sends a reviewed email (or marks sent)
  public sendEmailReply(emailId: string): { success: boolean; message: string } {
    const target = this.emails.find((e) => e.id === emailId);
    if (!target) return { success: false, message: 'Email not found.' };

    if (!target.suggestedDraftReply) {
      return { success: false, message: 'Cannot send an empty reply.' };
    }

    this.emails = this.emails.map((em) => {
      if (em.id === emailId) {
        return {
          ...em,
          draftStatus: 'SENT',
          sentAt: new Date().toISOString(),
        };
      }
      return em;
    });
    this.save();
    return { success: true, message: 'Reply sent successfully.' };
  }

  // Mark an email as read
  public markAsRead(emailId: string) {
    this.emails = this.emails.map((em) => (em.id === emailId ? { ...em, isRead: true } : em));
    this.save();
  }
}

export const emailAssistant = new EmailAssistantService();
