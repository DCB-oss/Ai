import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Trash2,
  Edit2,
  X,
  Plus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Star,
  Check,
} from 'lucide-react';
import { DeviceContact, ContactPhoneNumber } from '../../types/assistant';
import { phoneCallAssistant } from '../../services/phoneCallAssistant';
import { soundEffects } from '../../services/soundEffects';

interface ContactManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiateCall?: (data: { contactName: string; number: string; label?: string }) => void;
}

export const ContactManagerModal: React.FC<ContactManagerModalProps> = ({
  isOpen,
  onClose,
  onInitiateCall,
}) => {
  const [contacts, setContacts] = useState<DeviceContact[]>(() =>
    phoneCallAssistant.getContacts()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null); // contact ID or 'new'

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<DeviceContact['relationship']>('Other');
  const [phoneNumbers, setPhoneNumbers] = useState<Array<{ number: string; label: ContactPhoneNumber['label'] }>>([
    { number: '', label: 'Mobile' },
  ]);

  if (!isOpen) return null;

  const refreshContacts = () => {
    setContacts(phoneCallAssistant.getContacts());
  };

  const handleStartAdd = () => {
    soundEffects.playTap();
    setName('');
    setRelationship('Other');
    setPhoneNumbers([{ number: '', label: 'Mobile' }]);
    setIsEditing('new');
  };

  const handleStartEdit = (contact: DeviceContact) => {
    soundEffects.playTap();
    setName(contact.name);
    setRelationship(contact.relationship || 'Other');
    setPhoneNumbers(
      contact.phoneNumbers.map((n) => ({ number: n.number, label: n.label }))
    );
    setIsEditing(contact.id);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundEffects.playTap();
    const validNumbers: ContactPhoneNumber[] = phoneNumbers
      .filter((p) => p.number.trim())
      .map((p, idx) => ({
        id: `p-${Date.now()}-${idx}`,
        number: p.number.trim(),
        label: p.label,
        isDefault: idx === 0,
      }));

    if (isEditing === 'new') {
      phoneCallAssistant.addContact({
        name: name.trim(),
        relationship: relationship !== 'Other' ? relationship : undefined,
        phoneNumbers: validNumbers,
        avatarColor: 'from-cyan-500 to-blue-600',
      });
    } else if (isEditing) {
      phoneCallAssistant.updateContact(isEditing, {
        name: name.trim(),
        relationship: relationship !== 'Other' ? relationship : undefined,
        phoneNumbers: validNumbers,
      });
    }

    setIsEditing(null);
    refreshContacts();
  };

  const handleDelete = (id: string) => {
    soundEffects.playTap();
    phoneCallAssistant.deleteContact(id);
    refreshContacts();
  };

  const handleResetDefaults = () => {
    soundEffects.playTap();
    phoneCallAssistant.resetDefaultContacts();
    refreshContacts();
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.relationship && c.relationship.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phoneNumbers.some((p) => p.number.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 shadow-[0_0_50px_rgba(0,242,255,0.15)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Device Contacts & Address Book
              </h2>
              <p className="text-xs text-white/50">
                Manage on-device contacts used by Vox for voice calling.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form View (Add/Edit) */}
        {isEditing ? (
          <form onSubmit={handleSaveContact} className="py-4 space-y-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>{isEditing === 'new' ? 'Add New Contact' : 'Edit Contact'}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Contact Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mom, Dad, Sarah, John..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Relationship Tag (helps voice recognition like "call my brother")
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs text-white bg-slate-900 focus:outline-none focus:border-cyan-500/50"
              >
                {['Mom', 'Dad', 'Brother', 'Sister', 'Spouse', 'Friend', 'Manager', 'Colleague', 'Other'].map(
                  (r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/70">
                  Phone Numbers & Labels
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPhoneNumbers([...phoneNumbers, { number: '', label: 'Mobile' }])
                  }
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Number</span>
                </button>
              </div>

              <div className="space-y-2">
                {phoneNumbers.map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={p.label}
                      onChange={(e) => {
                        const copy = [...phoneNumbers];
                        copy[idx].label = e.target.value as any;
                        setPhoneNumbers(copy);
                      }}
                      className="px-3 py-2 rounded-xl glass-panel text-xs text-white bg-slate-900 w-28 focus:outline-none focus:border-cyan-500/50"
                    >
                      {['Mobile', 'Home', 'Work', 'Main', 'Other'].map((lbl) => (
                        <option key={lbl} value={lbl}>
                          {lbl}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={p.number}
                      onChange={(e) => {
                        const copy = [...phoneNumbers];
                        copy[idx].number = e.target.value;
                        setPhoneNumbers(copy);
                      }}
                      placeholder="+1 (555) 000-0000"
                      className="flex-1 px-3.5 py-2 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 font-mono"
                      required
                    />

                    {phoneNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPhoneNumbers(phoneNumbers.filter((_, i) => i !== idx))
                        }
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
              >
                Save Contact
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(null)}
                className="py-2.5 px-4 rounded-xl glass-panel text-white/60 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* List View */
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, relationship, or phone number..."
                className="flex-1 px-3.5 py-2.5 rounded-xl glass-panel text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              />

              <button
                onClick={handleStartAdd}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>

              <button
                onClick={handleResetDefaults}
                className="px-3 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                title="Reset to default sample contacts (Mom, Dad, Brother, Sarah, John)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Contacts Grid */}
            <div className="space-y-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  No contacts found matching "{searchQuery}".
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3.5 rounded-2xl glass-panel border-white/10 hover:border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${
                          contact.avatarColor || 'from-cyan-500 to-blue-600'
                        } flex items-center justify-center text-white font-black text-sm shadow-md shrink-0`}
                      >
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {contact.name}
                          </span>
                          {contact.relationship && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                              {contact.relationship}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-1">
                          {contact.phoneNumbers.map((p) => (
                            <span
                              key={p.id}
                              className="text-[11px] font-mono text-white/70 bg-white/5 px-2 py-0.5 rounded-md border border-white/5"
                            >
                              <strong className="text-cyan-400 font-sans mr-1">{p.label}:</strong>
                              {p.number}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Test Call, Edit, Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => {
                          const num = contact.phoneNumbers[0]?.number;
                          if (num) {
                            soundEffects.playTap();
                            if (onInitiateCall) {
                              onInitiateCall({
                                contactName: contact.name,
                                number: num,
                                label: contact.phoneNumbers[0]?.label,
                              });
                            } else {
                              phoneCallAssistant.initiateCall({
                                contactName: contact.name,
                                number: num,
                                label: contact.phoneNumbers[0]?.label,
                              });
                            }
                            onClose();
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                        title="Test Call this Contact"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </button>

                      <button
                        onClick={() => handleStartEdit(contact)}
                        className="p-1.5 rounded-xl glass-panel hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-1.5 rounded-xl glass-panel hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer Privacy Guarantee */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Contacts are stored locally and never synced to external AI servers.</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-white/60 hover:text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
