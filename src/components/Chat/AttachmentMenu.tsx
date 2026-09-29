import React, { useRef } from 'react';
import {
  Image,
  Camera,
  FolderOpen,
  Sparkles,
  Layers,
  FileText,
  X,
  Plus,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

export interface AttachedFileItem {
  id: string;
  name: string;
  type: 'image' | 'file' | 'document' | 'project';
  dataUrl?: string;
  textContent?: string;
  size?: number;
}

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachFile: (file: AttachedFileItem) => void;
  onOpenImageGen: () => void;
  onOpenProjects: () => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  isOpen,
  onClose,
  onAttachFile,
  onOpenImageGen,
  onOpenProjects,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAttachFile({
        id: 'att-' + Date.now(),
        name: file.name,
        type: 'image',
        dataUrl: reader.result as string,
        size: file.size,
      });
      soundEffects.playSuccess();
      onClose();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDocSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAttachFile({
        id: 'att-' + Date.now(),
        name: file.name,
        type: 'document',
        textContent: typeof reader.result === 'string' ? reader.result : '',
        size: file.size,
      });
      soundEffects.playSuccess();
      onClose();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGenericFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAttachFile({
        id: 'att-' + Date.now(),
        name: file.name,
        type: 'file',
        dataUrl: reader.result as string,
        size: file.size,
      });
      soundEffects.playSuccess();
      onClose();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const menuItems = [
    {
      id: 'photo',
      label: 'Photo',
      icon: Image,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      onClick: () => photoInputRef.current?.click(),
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      onClick: () => cameraInputRef.current?.click(),
    },
    {
      id: 'file',
      label: 'File',
      icon: FolderOpen,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      onClick: () => fileInputRef.current?.click(),
    },
    {
      id: 'create-image',
      label: 'Create Image',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      onClick: () => {
        onOpenImageGen();
        onClose();
      },
    },
    {
      id: 'project',
      label: 'Project',
      icon: Layers,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      onClick: () => {
        onOpenProjects();
        onClose();
      },
    },
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      onClick: () => docInputRef.current?.click(),
    },
  ];

  return (
    <>
      {/* Hidden File Inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelected}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoSelected}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={handleGenericFileSelected}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".txt,.md,.pdf,.json,.csv,.doc,.docx"
        className="hidden"
        onChange={handleDocSelected}
      />

      {/* Popover Card */}
      <div className="absolute bottom-16 left-2 sm:left-4 z-40 w-72 rounded-3xl glass-panel border-cyan-500/30 p-3 bg-slate-950/95 shadow-[0_12px_45px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-white/10">
          <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
            Attach & Actions
          </span>
          <button
            onClick={onClose}
            className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playTap();
                  item.onClick();
                }}
                className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all hover:scale-102 active:scale-98 text-left ${item.color}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
