// AniVox Phone, Contact and Call Assistant Service
// Implements local privacy-preserving contact matching, multiple SIM card routing,
// number disambiguation, Android permissions lifecycle, and smart call launching.

import {
  DeviceContact,
  ContactPhoneNumber,
  PhoneAssistantSettings,
  PhoneCallActionData,
  SimSlot,
  ActiveCallSession,
  CallState,
} from '../types/assistant';
import { soundEffects } from './soundEffects';
import { nativeAndroidBridge } from './nativeAndroidBridge';

const STORAGE_KEY_CONTACTS = 'anivox_device_contacts_v1';
const STORAGE_KEY_PHONE_SETTINGS = 'anivox_phone_settings_v1';

export const DEFAULT_DEVICE_CONTACTS: DeviceContact[] = [
  {
    id: 'contact-mom',
    name: 'Mom',
    relationship: 'Mom',
    avatarColor: 'from-pink-500 to-rose-600',
    isFavorite: true,
    phoneNumbers: [
      { id: 'p-mom-1', number: '+1 (555) 234-5678', label: 'Mobile', isDefault: true },
      { id: 'p-mom-2', number: '+1 (555) 876-5432', label: 'Home' },
    ],
  },
  {
    id: 'contact-dad',
    name: 'Dad',
    relationship: 'Dad',
    avatarColor: 'from-blue-500 to-indigo-600',
    isFavorite: true,
    phoneNumbers: [
      { id: 'p-dad-1', number: '+1 (555) 345-6789', label: 'Mobile', isDefault: true },
      { id: 'p-dad-2', number: '+1 (555) 987-6543', label: 'Work' },
    ],
  },
  {
    id: 'contact-brother',
    name: 'Alex (Brother)',
    relationship: 'Brother',
    avatarColor: 'from-teal-500 to-emerald-600',
    isFavorite: true,
    phoneNumbers: [
      { id: 'p-bro-1', number: '+1 (555) 456-7890', label: 'Mobile', isDefault: true },
    ],
  },
  {
    id: 'contact-sarah',
    name: 'Sarah Jenkins',
    relationship: 'Friend',
    avatarColor: 'from-purple-500 to-violet-600',
    isFavorite: true,
    phoneNumbers: [
      { id: 'p-sarah-1', number: '+1 (555) 567-8901', label: 'Mobile', isDefault: true },
      { id: 'p-sarah-2', number: '+1 (555) 678-9012', label: 'Work' },
    ],
  },
  {
    id: 'contact-john-smith',
    name: 'John Smith',
    relationship: 'Colleague',
    avatarColor: 'from-amber-500 to-orange-600',
    isFavorite: false,
    phoneNumbers: [
      { id: 'p-johns-1', number: '+1 (555) 789-0123', label: 'Mobile', isDefault: true },
    ],
  },
  {
    id: 'contact-john-doe',
    name: 'John Doe',
    relationship: 'Friend',
    avatarColor: 'from-cyan-500 to-blue-600',
    isFavorite: false,
    phoneNumbers: [
      { id: 'p-johnd-1', number: '+1 (555) 890-1234', label: 'Mobile', isDefault: true },
    ],
  },
  {
    id: 'contact-john-miller',
    name: 'John Miller',
    relationship: 'Manager',
    avatarColor: 'from-red-500 to-amber-600',
    isFavorite: false,
    phoneNumbers: [
      { id: 'p-johnm-1', number: '+1 (555) 901-2345', label: 'Work', isDefault: true },
    ],
  },
];

export const DEFAULT_PHONE_SETTINGS: PhoneAssistantSettings = {
  enabled: true,
  readContactsPermission: 'granted',
  callPhonePermission: 'granted',
  preferredSim: 'sim_1',
  sim1Carrier: 'Verizon 5G (SIM 1)',
  sim2Carrier: 'T-Mobile LTE (SIM 2)',
  dualSimEnabled: true,
  confirmCallsBeforePlacing: false,
  localMatchingOnly: true, // STRICT PRIVACY: Contacts are NEVER uploaded to any AI model
  allowRelationshipMatching: true,
};

class PhoneCallAssistantService {
  private contacts: DeviceContact[] = [];
  private settings: PhoneAssistantSettings = DEFAULT_PHONE_SETTINGS;
  private activeCall: ActiveCallSession | null = null;
  private callListeners: Array<(call: ActiveCallSession | null) => void> = [];
  private callTimer: any = null;

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (typeof window === 'undefined') return;

    try {
      const savedContacts = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (savedContacts) {
        this.contacts = JSON.parse(savedContacts);
      } else {
        this.contacts = [...DEFAULT_DEVICE_CONTACTS];
        this.saveContacts();
      }
    } catch {
      this.contacts = [...DEFAULT_DEVICE_CONTACTS];
    }

    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_PHONE_SETTINGS);
      if (savedSettings) {
        this.settings = { ...DEFAULT_PHONE_SETTINGS, ...JSON.parse(savedSettings) };
      } else {
        this.settings = { ...DEFAULT_PHONE_SETTINGS };
        this.saveSettings();
      }
    } catch {
      this.settings = { ...DEFAULT_PHONE_SETTINGS };
    }
  }

  private saveContacts() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(this.contacts));
    } catch {}
  }

  public saveSettings() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PHONE_SETTINGS, JSON.stringify(this.settings));
    } catch {}
  }

  public getSettings(): PhoneAssistantSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<PhoneAssistantSettings>): PhoneAssistantSettings {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    return this.getSettings();
  }

  public getContacts(): DeviceContact[] {
    return [...this.contacts];
  }

  public addContact(contact: Omit<DeviceContact, 'id'>): DeviceContact {
    const newContact: DeviceContact = {
      ...contact,
      id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    this.contacts.unshift(newContact);
    this.saveContacts();
    return newContact;
  }

  public updateContact(id: string, updates: Partial<DeviceContact>): DeviceContact | null {
    const index = this.contacts.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.contacts[index] = { ...this.contacts[index], ...updates };
    this.saveContacts();
    return this.contacts[index];
  }

  public deleteContact(id: string): boolean {
    const prevLen = this.contacts.length;
    this.contacts = this.contacts.filter((c) => c.id !== id);
    if (this.contacts.length !== prevLen) {
      this.saveContacts();
      return true;
    }
    return false;
  }

  public resetDefaultContacts() {
    this.contacts = [...DEFAULT_DEVICE_CONTACTS];
    this.saveContacts();
  }

  /**
   * Local, privacy-preserving search that matches names, aliases, and relationships
   * strictly on-device without network transmission.
   */
  public findMatchingContacts(query: string): DeviceContact[] {
    if (!query) return [];
    const q = query.trim().toLowerCase();

    // Direct exact or partial name match
    const exactMatches = this.contacts.filter(
      (c) => c.name.toLowerCase() === q || (c.relationship && c.relationship.toLowerCase() === q)
    );
    if (exactMatches.length > 0) return exactMatches;

    // Alias & Relationship mapping
    const relationshipAliases: Record<string, string[]> = {
      mom: ['mom', 'mother', 'mama', 'mommy'],
      dad: ['dad', 'father', 'papa', 'daddy'],
      brother: ['brother', 'bro', 'alex'],
      sister: ['sister', 'sis'],
      friend: ['friend', 'bestie'],
      colleague: ['colleague', 'coworker', 'workmate'],
      manager: ['manager', 'boss', 'supervisor'],
    };

    let targetRelationship: string | null = null;
    for (const [rel, aliases] of Object.entries(relationshipAliases)) {
      if (aliases.some((a) => q === a || q.includes(`my ${a}`) || q.includes(a))) {
        targetRelationship = rel;
        break;
      }
    }

    if (targetRelationship && this.settings.allowRelationshipMatching) {
      const relMatches = this.contacts.filter((c) => {
        if (!c.relationship) return false;
        return (
          c.relationship.toLowerCase() === targetRelationship ||
          c.name.toLowerCase().includes(targetRelationship)
        );
      });
      if (relMatches.length > 0) return relMatches;
    }

    // Substring contains match
    return this.contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.relationship && c.relationship.toLowerCase().includes(q))
    );
  }

  /**
   * Parses natural language phone call requests:
   * "Vox, call Mom."
   * "Call Dad."
   * "Call my brother."
   * "Call Sarah on SIM 2."
   * "Call Mom's mobile."
   * "Call Mom's first number."
   * "Call 555-1234."
   */
  public processCallIntent(query: string): PhoneCallActionData {
    const raw = (query || '').trim();
    const lower = raw.toLowerCase();

    // Check if phone assistant is disabled
    if (!this.settings.enabled) {
      return {
        id: `call-${Date.now()}`,
        targetName: raw,
        status: 'permission_required',
        message: 'Phone Assistant is currently disabled. You can enable it in Vox Settings.',
      };
    }

    // Check if contacts permission is denied
    if (this.settings.readContactsPermission === 'denied') {
      return {
        id: `call-${Date.now()}`,
        targetName: raw,
        status: 'permission_required',
        message: 'Contact access is disabled. You can enable it in Settings, or enter a phone number manually.',
      };
    }

    // Extract SIM preference if specified in voice prompt
    let explicitSim: SimSlot | undefined;
    if (lower.includes('sim 2') || lower.includes('sim2') || lower.includes('second sim')) {
      explicitSim = 2;
    } else if (lower.includes('sim 1') || lower.includes('sim1') || lower.includes('first sim')) {
      explicitSim = 1;
    }

    // Extract raw phone number if user asked to dial digits (e.g. "Call 555-1234" or "Dial +1 555 987 6543")
    const phoneDigitsMatch = raw.match(/(?:call|dial|phone)\s+([\+0-9\(\)\-\s]{5,})/i);
    if (phoneDigitsMatch && phoneDigitsMatch[1]) {
      const cleanDigits = phoneDigitsMatch[1].trim();
      const sim = explicitSim || (this.settings.preferredSim === 'sim_2' ? 2 : 1);
      const simName = sim === 2 ? this.settings.sim2Carrier : this.settings.sim1Carrier;

      return {
        id: `call-${Date.now()}`,
        targetName: cleanDigits,
        selectedNumber: cleanDigits,
        selectedLabel: 'Direct Dial',
        selectedSim: sim,
        simCarrierName: simName,
        status: 'ready_to_call',
        message: `Calling ${cleanDigits} ${this.settings.dualSimEnabled ? `using ${simName}` : ''}.`,
        autoDirectCall: !this.settings.confirmCallsBeforePlacing,
        dialUrl: `tel:${cleanDigits.replace(/[^0-9\+]/g, '')}`,
      };
    }

    // Extract Target Name from query
    let target = lower
      .replace(/^(vox|hey vox|ok vox|anivox)[,\s]+/i, '')
      .replace(/^(call|phone|dial|place a call to|ring)\s+/i, '')
      .replace(/\s+(using|with|on)\s+sim\s*[12]/i, '')
      .replace(/\s+(using|with|on)\s+(the\s+)?(first|second)\s+sim/i, '')
      .trim();

    // Check for number label preferences like "Mom's mobile", "Dad's work", "Mom's first number"
    let requestedLabel: string | null = null;
    let requestedIndex: number | null = null;

    if (target.includes("'s mobile") || target.includes(' mobile')) {
      requestedLabel = 'Mobile';
      target = target.replace(/'s mobile/i, '').replace(/\s+mobile/i, '').trim();
    } else if (target.includes("'s home") || target.includes(' home')) {
      requestedLabel = 'Home';
      target = target.replace(/'s home/i, '').replace(/\s+home/i, '').trim();
    } else if (target.includes("'s work") || target.includes(' work')) {
      requestedLabel = 'Work';
      target = target.replace(/'s work/i, '').replace(/\s+work/i, '').trim();
    } else if (target.includes("'s first number") || target.includes(' first number')) {
      requestedIndex = 0;
      target = target.replace(/'s first number/i, '').replace(/\s+first number/i, '').trim();
    } else if (target.includes("'s second number") || target.includes(' second number')) {
      requestedIndex = 1;
      target = target.replace(/'s second number/i, '').replace(/\s+second number/i, '').trim();
    }

    // Remove "my " prefix (e.g. "my mom", "my brother")
    target = target.replace(/^my\s+/i, '').replace(/['’]s$/i, '').trim();

    // Find matches locally
    const matches = this.findMatchingContacts(target);

    // CASE 1: No Contact Found
    if (matches.length === 0) {
      return {
        id: `call-${Date.now()}`,
        targetName: target || 'Contact',
        status: 'not_found',
        message: `I couldn't find a contact named "${target || 'that'}".`,
      };
    }

    // CASE 2: Ambiguous Request — Multiple distinct contacts (e.g. 3 Johns)
    if (matches.length > 1) {
      return {
        id: `call-${Date.now()}`,
        targetName: target,
        matchingContacts: matches,
        requiresContactChoice: true,
        status: 'need_clarification',
        message: `I found ${matches.length} contacts matching "${target}". Which one do you mean?`,
      };
    }

    // CASE 3: Single Contact Found
    const contact = matches[0];
    const numbers = contact.phoneNumbers || [];

    if (numbers.length === 0) {
      return {
        id: `call-${Date.now()}`,
        targetName: contact.name,
        contact,
        status: 'not_found',
        message: `${contact.name} doesn't have any saved phone numbers.`,
      };
    }

    // Resolve specific number
    let chosenNumber: ContactPhoneNumber | null = null;

    if (requestedIndex !== null && numbers[requestedIndex]) {
      chosenNumber = numbers[requestedIndex];
    } else if (requestedLabel) {
      chosenNumber = numbers.find((n) => n.label.toLowerCase() === requestedLabel!.toLowerCase()) || null;
    } else if (numbers.length === 1) {
      chosenNumber = numbers[0];
    }

    // If contact has multiple numbers and no specific one was requested
    if (!chosenNumber && numbers.length > 1) {
      return {
        id: `call-${Date.now()}`,
        targetName: contact.name,
        contact,
        requiresNumberChoice: true,
        status: 'need_clarification',
        message: `${contact.name} has ${numbers.length} numbers. Which one should I call?`,
      };
    }

    if (!chosenNumber) {
      chosenNumber = numbers[0];
    }

    // Resolve SIM slot
    let resolvedSim: SimSlot = 1;
    let needsSimChoice = false;

    if (explicitSim) {
      resolvedSim = explicitSim;
    } else if (this.settings.dualSimEnabled) {
      if (this.settings.preferredSim === 'always_ask') {
        needsSimChoice = true;
      } else if (this.settings.preferredSim === 'sim_2') {
        resolvedSim = 2;
      } else {
        resolvedSim = 1;
      }
    }

    const simCarrier = resolvedSim === 2 ? this.settings.sim2Carrier : this.settings.sim1Carrier;

    if (needsSimChoice) {
      return {
        id: `call-${Date.now()}`,
        targetName: contact.name,
        contact,
        selectedNumber: chosenNumber.number,
        selectedLabel: chosenNumber.label,
        requiresSimChoice: true,
        status: 'need_clarification',
        message: `I found ${contact.name}'s ${chosenNumber.label} number. Which SIM should I use?`,
      };
    }

    // All parameters resolved — Ready to place call!
    return {
      id: `call-${Date.now()}`,
      targetName: contact.name,
      contact,
      selectedNumber: chosenNumber.number,
      selectedLabel: chosenNumber.label,
      selectedSim: resolvedSim,
      simCarrierName: simCarrier,
      status: 'ready_to_call',
      message: `Calling ${contact.name} on ${chosenNumber.label.toLowerCase()} number${this.settings.dualSimEnabled ? ` using ${simCarrier}` : ''}.`,
      autoDirectCall: !this.settings.confirmCallsBeforePlacing,
      dialUrl: `tel:${chosenNumber.number.replace(/[^0-9\+]/g, '')}`,
    };
  }

  /**
   * Initiates a real call via Android bridge / tel link and manages call state lifecycle
   */
  public initiateCall(data: {
    contactName: string;
    number: string;
    label?: string;
    simSlot?: SimSlot;
  }): ActiveCallSession {
    const slot = data.simSlot || (this.settings.preferredSim === 'sim_2' ? 2 : 1);
    const carrier = slot === 2 ? this.settings.sim2Carrier : this.settings.sim1Carrier;

    const newSession: ActiveCallSession = {
      id: `call-session-${Date.now()}`,
      contactName: data.contactName,
      number: data.number,
      label: data.label || 'Mobile',
      simSlot: slot,
      simCarrierName: carrier,
      state: 'DIALING',
      durationSeconds: 0,
      startedAt: Date.now(),
      isMuted: false,
      isSpeaker: false,
    };

    this.activeCall = newSession;
    this.notifyCallListeners();

    soundEffects.playTap();
    nativeAndroidBridge.triggerHaptic(50);

    // Clean tel link for browser & Android intent
    const cleanNumber = data.number.replace(/[^0-9\+]/g, '');
    const telUrl = `tel:${cleanNumber}`;

    // Try standard web / OS telephone handoff
    try {
      if (typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = telUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (link.parentNode) link.parentNode.removeChild(link);
        }, 500);
      }
    } catch {}

    // Advance Call State Machine
    setTimeout(() => {
      if (this.activeCall && this.activeCall.state === 'DIALING') {
        this.activeCall.state = 'RINGING';
        this.notifyCallListeners();

        setTimeout(() => {
          if (this.activeCall && this.activeCall.state === 'RINGING') {
            this.activeCall.state = 'CONNECTED';
            this.startCallDurationTimer();
            this.notifyCallListeners();
          }
        }, 2200);
      }
    }, 1500);

    return newSession;
  }

  private startCallDurationTimer() {
    if (this.callTimer) clearInterval(this.callTimer);
    this.callTimer = setInterval(() => {
      if (this.activeCall && this.activeCall.state === 'CONNECTED') {
        this.activeCall.durationSeconds += 1;
        this.notifyCallListeners();
      } else {
        clearInterval(this.callTimer);
      }
    }, 1000);
  }

  public endCall(reason: string = 'Call ended'): void {
    if (this.callTimer) clearInterval(this.callTimer);
    if (this.activeCall) {
      this.activeCall.state = 'ENDED';
      this.activeCall.endedAt = Date.now();
      this.notifyCallListeners();

      soundEffects.playListenStop();
      nativeAndroidBridge.triggerHaptic(30);

      setTimeout(() => {
        this.activeCall = null;
        this.notifyCallListeners();
      }, 2500);
    }
  }

  public toggleMute(): boolean {
    if (!this.activeCall) return false;
    this.activeCall.isMuted = !this.activeCall.isMuted;
    this.notifyCallListeners();
    soundEffects.playTap();
    return this.activeCall.isMuted;
  }

  public toggleSpeaker(): boolean {
    if (!this.activeCall) return false;
    this.activeCall.isSpeaker = !this.activeCall.isSpeaker;
    this.notifyCallListeners();
    soundEffects.playTap();
    return this.activeCall.isSpeaker;
  }

  public getActiveCall(): ActiveCallSession | null {
    return this.activeCall;
  }

  public subscribeToCallState(listener: (call: ActiveCallSession | null) => void): () => void {
    this.callListeners.push(listener);
    listener(this.activeCall);
    return () => {
      this.callListeners = this.callListeners.filter((l) => l !== listener);
    };
  }

  public subscribeCallState(listener: (call: ActiveCallSession | null) => void): () => void {
    return this.subscribeToCallState(listener);
  }

  private notifyCallListeners() {
    for (const listener of this.callListeners) {
      try {
        listener(this.activeCall ? { ...this.activeCall } : null);
      } catch {}
    }
  }
}

export const phoneCallAssistant = new PhoneCallAssistantService();
