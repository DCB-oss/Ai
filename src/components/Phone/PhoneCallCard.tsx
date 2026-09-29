import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneForwarded,
  User,
  Users,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  Hash,
  X,
  ExternalLink,
  Layers,
} from 'lucide-react';
import {
  PhoneCallActionData,
  DeviceContact,
  ContactPhoneNumber,
  SimSlot,
} from '../../types/assistant';
import { phoneCallAssistant } from '../../services/phoneCallAssistant';
import { soundEffects } from '../../services/soundEffects';

interface PhoneCallCardProps {
  actionData: PhoneCallActionData;
  onInitiateCall?: (data: {
    contactName: string;
    number: string;
    label?: string;
    simSlot?: SimSlot;
  }) => void;
  onDismiss?: () => void;
}

export const PhoneCallCard: React.FC<PhoneCallCardProps> = ({
  actionData: initialData,
  onInitiateCall,
  onDismiss,
}) => {
  // Live local resolution to ensure fresh contact data from storage
  const [data, setData] = useState<PhoneCallActionData>(() => {
    // If targetName or query provided, resolve locally
    const resolved = phoneCallAssistant.processCallIntent(
      (initialData as any).query || initialData.targetName || 'Mom'
    );
    return { ...resolved, ...initialData, ...resolved };
  });

  const [customManualNumber, setCustomManualNumber] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [selectedSimOverride, setSelectedSimOverride] = useState<SimSlot | null>(null);

  const settings = phoneCallAssistant.getSettings();

  const handleSelectContact = (contact: DeviceContact) => {
    soundEffects.playTap();
    const resolved = phoneCallAssistant.processCallIntent(`call ${contact.name}`);
    setData(resolved);
  };

  const handleSelectNumber = (numberObj: ContactPhoneNumber) => {
    soundEffects.playTap();
    const sim = selectedSimOverride || (settings.preferredSim === 'sim_2' ? 2 : 1);
    const simName = sim === 2 ? settings.sim2Carrier : settings.sim1Carrier;

    setData({
      ...data,
      selectedNumber: numberObj.number,
      selectedLabel: numberObj.label,
      selectedSim: sim,
      simCarrierName: simName,
      requiresNumberChoice: false,
      status: 'ready_to_call',
      message: `Calling ${data.contact?.name || data.targetName} on ${numberObj.label} number (${numberObj.number}).`,
    });
  };

  const handleSelectSim = (slot: SimSlot) => {
    soundEffects.playTap();
    setSelectedSimOverride(slot);
    const simName = slot === 2 ? settings.sim2Carrier : settings.sim1Carrier;

    setData({
      ...data,
      selectedSim: slot,
      simCarrierName: simName,
      requiresSimChoice: false,
      status: 'ready_to_call',
      message: `Calling ${data.contact?.name || data.targetName} using ${simName}.`,
    });
  };

  const handleTriggerCall = (
    contactName: string,
    number: string,
    label?: string,
    simSlot?: SimSlot
  ) => {
    soundEffects.playTap();
    const slot = simSlot || data.selectedSim || (settings.preferredSim === 'sim_2' ? 2 : 1);

    if (onInitiateCall) {
      onInitiateCall({
        contactName,
        number,
        label: label || 'Mobile',
        simSlot: slot,
      });
    } else {
      phoneCallAssistant.initiateCall({
        contactName,
        number,
        label: label || 'Mobile',
        simSlot: slot,
      });
    }
  };

  const handleManualDialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customManualNumber.trim()) return;

    const sim = selectedSimOverride || (settings.preferredSim === 'sim_2' ? 2 : 1);
    handleTriggerCall(
      customManualNumber.trim(),
      customManualNumber.trim(),
      'Direct Dial',
      sim
    );
  };

  return (
    <div className="w-full rounded-2xl glass-panel border border-cyan-500/30 overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.3)] my-2.5 transition-all">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            <Phone className="w-3 h-3 text-emerald-400" />
          </div>
          <span>Android Phone & Contact Assistant</span>
        </div>

        <div className="flex items-center gap-2">
          {settings.dualSimEnabled && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono flex items-center gap-1 border border-white/10">
              <Smartphone className="w-3 h-3 text-cyan-400" />
              Dual SIM
            </span>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        {/* CASE 1: Need Contact Clarification (Multiple Contacts matching name, e.g. 3 Johns) */}
        {data.requiresContactChoice && data.matchingContacts && data.matchingContacts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">
                  I found {data.matchingContacts.length} contacts matching "{data.targetName}". Which one do you mean?
                </h4>
                <p className="text-[11px] text-white/50">
                  Select the intended contact below to proceed with the call:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {data.matchingContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className="p-3 rounded-xl glass-panel-interactive border-white/10 hover:border-cyan-500/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${
                        contact.avatarColor || 'from-cyan-500 to-blue-600'
                      } flex items-center justify-center text-white font-bold text-xs shadow-md`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {contact.name}
                      </div>
                      <div className="text-[10px] text-white/50">
                        {contact.relationship ? `${contact.relationship} • ` : ''}
                        {contact.phoneNumbers[0]?.number || 'No number'}
                      </div>
                    </div>
                  </div>
                  <PhoneForwarded className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CASE 2: Need Number Clarification (Contact has multiple numbers, e.g. Mom: Mobile vs Home) */}
        {data.requiresNumberChoice && data.contact && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                  data.contact.avatarColor || 'from-pink-500 to-rose-600'
                } flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
              >
                {data.contact.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {data.contact.name} has {data.contact.phoneNumbers.length} phone numbers. Which one should I call?
                </h4>
                <p className="text-[11px] text-white/50">
                  Select a labeled number below:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {data.contact.phoneNumbers.map((num) => (
                <button
                  key={num.id}
                  onClick={() => handleSelectNumber(num)}
                  className="p-3 rounded-xl glass-panel-interactive border-white/10 hover:border-emerald-500/40 text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {num.label}
                    </span>
                    <div className="text-xs font-mono font-semibold text-white mt-1 group-hover:text-emerald-300">
                      {num.number}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CASE 3: Need SIM Clarification (Device has Dual SIM and Preferred SIM is set to Always Ask) */}
        {data.requiresSimChoice && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">
                  Which SIM should I use to call {data.contact?.name || data.targetName}?
                </h4>
                <p className="text-[11px] text-white/50">
                  Select an available phone account:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleSelectSim(1)}
                className="p-3 rounded-xl glass-panel-interactive border-cyan-500/30 hover:border-cyan-400 text-left flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                    SIM 1
                  </span>
                  <div className="text-xs font-bold text-white mt-0.5 truncate">
                    {settings.sim1Carrier}
                  </div>
                </div>
                <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </div>
              </button>

              <button
                onClick={() => handleSelectSim(2)}
                className="p-3 rounded-xl glass-panel-interactive border-purple-500/30 hover:border-purple-400 text-left flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                    SIM 2
                  </span>
                  <div className="text-xs font-bold text-white mt-0.5 truncate">
                    {settings.sim2Carrier}
                  </div>
                </div>
                <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </div>
              </button>
            </div>
          </div>
        )}

        {/* CASE 4: Ready to Call (All details confirmed: Contact, Number, and SIM identified) */}
        {data.status === 'ready_to_call' && data.selectedNumber && (
          <div className="space-y-3">
            {/* Contact Preview Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${
                    data.contact?.avatarColor || 'from-emerald-500 to-teal-600'
                  } flex items-center justify-center text-white font-black text-base shadow-[0_0_15px_rgba(16,185,129,0.3)]`}
                >
                  {(data.contact?.name || data.targetName || 'C').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {data.contact?.name || data.targetName}
                    </span>
                    {data.contact?.relationship && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                        {data.contact.relationship}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-emerald-300 flex items-center gap-1.5 mt-0.5">
                    <span>{data.selectedNumber}</span>
                    {data.selectedLabel && (
                      <span className="text-[10px] text-white/40">({data.selectedLabel})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SIM Badge with Switch Option */}
              {settings.dualSimEnabled && (
                <button
                  onClick={() => {
                    const nextSim = (data.selectedSim === 1 ? 2 : 1) as SimSlot;
                    handleSelectSim(nextSim);
                  }}
                  className="px-2 py-1 rounded-lg glass-panel hover:bg-white/10 border border-white/10 text-[10px] font-mono text-white/70 flex items-center gap-1 transition-all"
                  title="Tap to toggle SIM 1 / SIM 2"
                >
                  <Smartphone className="w-3 h-3 text-cyan-400" />
                  <span>SIM {data.selectedSim || 1}</span>
                </button>
              )}
            </div>

            {/* Action Buttons: [Call] & [Cancel] */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleTriggerCall(
                    data.contact?.name || data.targetName,
                    data.selectedNumber!,
                    data.selectedLabel,
                    data.selectedSim
                  )
                }
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call {data.contact?.name || data.targetName}</span>
              </button>

              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-4 py-3 rounded-xl glass-panel hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold border border-white/10 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* CASE 5: Contact Not Found / Search Fallback */}
        {data.status === 'not_found' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-300 block">
                  I couldn't find a contact named "{data.targetName}".
                </span>
                <p className="text-white/70 mt-0.5">
                  Would you like to search your saved contacts or enter a phone number manually?
                </p>
              </div>
            </div>

            {showManualInput ? (
              <form onSubmit={handleManualDialSubmit} className="flex gap-2">
                <input
                  type="tel"
                  value={customManualNumber}
                  onChange={(e) => setCustomManualNumber(e.target.value)}
                  placeholder="Enter phone number (e.g. +1 555 123 4567)..."
                  className="flex-1 px-3 py-2 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customManualNumber.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs disabled:opacity-40"
                >
                  Call
                </button>
              </form>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowManualInput(true)}
                  className="flex-1 py-2 px-3 rounded-xl glass-panel-interactive border-white/10 text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Enter Phone Number</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Privacy Note Badge */}
        <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400/80" />
            <span>Local On-Device Contact Match</span>
          </div>
          <span>Zero cloud contact transmission</span>
        </div>
      </div>
    </div>
  );
};
