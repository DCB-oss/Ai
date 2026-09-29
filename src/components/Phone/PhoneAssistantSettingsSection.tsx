import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  Smartphone,
  Shield,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Settings2,
} from 'lucide-react';
import { PhoneAssistantSettings } from '../../types/assistant';
import { phoneCallAssistant } from '../../services/phoneCallAssistant';
import { soundEffects } from '../../services/soundEffects';
import { ContactManagerModal } from './ContactManagerModal';

interface PhoneAssistantSettingsSectionProps {
  onInitiateCall?: (data: { contactName: string; number: string; label?: string }) => void;
}

export const PhoneAssistantSettingsSection: React.FC<PhoneAssistantSettingsSectionProps> = ({
  onInitiateCall,
}) => {
  const [settings, setSettings] = useState<PhoneAssistantSettings>(() =>
    phoneCallAssistant.getSettings()
  );
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactsCount, setContactsCount] = useState<number>(() =>
    phoneCallAssistant.getContacts().length
  );

  const updateSetting = (partial: Partial<PhoneAssistantSettings>) => {
    soundEffects.playTap();
    const updated = phoneCallAssistant.updateSettings(partial);
    setSettings(updated);
  };

  const handleOpenContacts = () => {
    soundEffects.playTap();
    setShowContactModal(true);
  };

  return (
    <div className="p-5 rounded-3xl glass-panel border border-emerald-500/30 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider uppercase text-white flex items-center gap-2">
              <span>Android Phone & Call Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-normal lowercase border border-emerald-500/30">
                native telecom
              </span>
            </h2>
            <p className="text-xs text-white/50">
              Configure contacts access, dual SIM preferences, and hands-free voice calling.
            </p>
          </div>
        </div>

        {/* Master Phone Assistant Toggle */}
        <button
          onClick={() => updateSetting({ enabled: !settings.enabled })}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            settings.enabled
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'glass-panel border-white/10 text-white/40'
          }`}
        >
          {settings.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {settings.enabled ? (
        <div className="space-y-4 pt-1">
          {/* Privacy & Zero-Cloud Sync Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-emerald-300 block">
                Local On-Device Contact Privacy
              </span>
              <p className="text-white/70 leading-relaxed">
                AniVox matches your contacts locally inside your browser/device sandbox. Your address book, phone numbers, and call logs are <strong>never uploaded</strong> to any AI provider or external server.
              </p>
            </div>
          </div>

          {/* Quick Contact Book Management Banner */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Device Contacts Store ({contactsCount} Contacts)
                </div>
                <div className="text-[11px] text-white/50">
                  Preloaded with Mom, Dad, Brother, Sarah, John with Mobile and Home numbers.
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenContacts}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,255,0.2)] shrink-0"
            >
              Manage Saved Contacts
            </button>
          </div>

          {/* 1. ANDROID PERMISSIONS */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block">
              Android OS Permissions
            </span>

            {/* Read Contacts */}
            <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border-white/10">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Contacts Access</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-normal">
                    (READ_CONTACTS)
                  </span>
                </div>
                <div className="text-[11px] text-white/50">
                  Allows Vox to say "call Mom" instead of typing digits manually.
                </div>
              </div>

              <button
                onClick={() =>
                  updateSetting({
                    readContactsPermission:
                      settings.readContactsPermission === 'granted' ? 'denied' : 'granted',
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  settings.readContactsPermission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {settings.readContactsPermission === 'granted' ? 'Granted' : 'Denied'}
              </button>
            </div>

            {/* Calling Permission */}
            <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border-white/10">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Direct Calling</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-normal">
                    (CALL_PHONE)
                  </span>
                </div>
                <div className="text-[11px] text-white/50">
                  Initiates calls directly through Android Telecom / tel: URL scheme.
                </div>
              </div>

              <button
                onClick={() =>
                  updateSetting({
                    callPhonePermission:
                      settings.callPhonePermission === 'granted' ? 'denied' : 'granted',
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  settings.callPhonePermission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {settings.callPhonePermission === 'granted' ? 'Granted' : 'Denied'}
              </button>
            </div>
          </div>

          {/* 2. DUAL SIM & MULTIPLE PHONE ACCOUNTS */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block">
              SIM Cards & Multi-SIM Configuration
            </span>

            {/* Dual SIM Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Dual SIM Support</div>
                <div className="text-[11px] text-white/50">
                  Enable device multi-SIM card routing and slot selection.
                </div>
              </div>

              <button
                onClick={() => updateSetting({ dualSimEnabled: !settings.dualSimEnabled })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  settings.dualSimEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'glass-panel border-white/10 text-white/40'
                }`}
              >
                {settings.dualSimEnabled ? 'Active' : 'Single SIM'}
              </button>
            </div>

            {/* Preferred Calling SIM */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Preferred Calling SIM
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sim_1', label: 'SIM 1 (Default)' },
                  { id: 'sim_2', label: 'SIM 2' },
                  { id: 'always_ask', label: 'Always Ask' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateSetting({ preferredSim: opt.id as any })}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      settings.preferredSim === opt.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
                        : 'glass-panel border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SIM Carrier Labels */}
            {settings.dualSimEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    SIM 1 Carrier Label
                  </label>
                  <input
                    type="text"
                    value={settings.sim1Carrier}
                    onChange={(e) => updateSetting({ sim1Carrier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    SIM 2 Carrier Label
                  </label>
                  <input
                    type="text"
                    value={settings.sim2Carrier}
                    onChange={(e) => updateSetting({ sim2Carrier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. CALL CONFIRMATION & BEHAVIOR */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block">
              Call Confirmation & Accuracy
            </span>

            <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Require Confirmation Before Dialing</div>
                <div className="text-[11px] text-white/50">
                  Shows a confirmation countdown with [Call] and [Cancel] buttons before initiating.
                </div>
              </div>

              <button
                onClick={() =>
                  updateSetting({
                    confirmCallsBeforePlacing: !settings.confirmCallsBeforePlacing,
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  settings.confirmCallsBeforePlacing
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'glass-panel border-white/10 text-white/40'
                }`}
              >
                {settings.confirmCallsBeforePlacing ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Relationship Voice Aliases</div>
                <div className="text-[11px] text-white/50">
                  Understands "call my mom", "phone dad", "call brother" automatically.
                </div>
              </div>

              <button
                onClick={() =>
                  updateSetting({
                    allowRelationshipMatching: !settings.allowRelationshipMatching,
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  settings.allowRelationshipMatching
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'glass-panel border-white/10 text-white/40'
                }`}
              >
                {settings.allowRelationshipMatching ? 'Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Voice Calling Commands Cheat Sheet */}
          <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Voice Calling Commands Understood by Vox</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                '"Vox, call Mom."',
                '"Call Dad."',
                '"Call my brother."',
                '"Call Sarah."',
                '"Call Mom\'s first number."',
                '"Call Mom\'s mobile."',
                '"Call Dad\'s work."',
                '"Call Sarah using SIM 2."',
                '"Hang up." / "End call."',
              ].map((cmd, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 text-emerald-300">
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white/5 text-center text-xs text-white/50">
          Phone Assistant is disabled. Toggle Enable above to activate contacts calling and SIM routing.
        </div>
      )}

      {/* Modal for Contact Management */}
      <ContactManagerModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setContactsCount(phoneCallAssistant.getContacts().length);
        }}
        onInitiateCall={onInitiateCall}
      />
    </div>
  );
};
