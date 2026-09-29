import React, { useState, useEffect } from 'react';
import { Clock, Globe, MapPin, Search } from 'lucide-react';
import { TimeZoneInfo } from '../../types/assistant';
import { deviceSensors } from '../../services/deviceSensors';
import { soundEffects } from '../../services/soundEffects';

interface WorldTimeCardProps {
  initialLocation?: string;
  onClose?: () => void;
}

export const WorldTimeCard: React.FC<WorldTimeCardProps> = ({ initialLocation, onClose }) => {
  const [timeInfo, setTimeInfo] = useState<TimeZoneInfo>(deviceSensors.getTimeForLocation(initialLocation));
  const [locInput, setLocInput] = useState(initialLocation || '');

  useEffect(() => {
    const updateTime = () => {
      setTimeInfo(deviceSensors.getTimeForLocation(locInput));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [locInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locInput.trim()) {
      setTimeInfo(deviceSensors.getTimeForLocation(locInput.trim()));
      soundEffects.playTap();
    }
  };

  return (
    <div className="p-5 rounded-3xl glass-panel border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,255,0.15)] max-w-xl mx-auto w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,255,0.2)]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase text-white flex items-center gap-2">
              <span>Universal Chronometer</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px]">
                {timeInfo.isLocal ? 'Device Local' : 'World Clock'}
              </span>
            </h3>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-white/40 hover:text-white px-2 py-1 rounded-lg bg-white/5"
          >
            Close
          </button>
        )}
      </div>

      {/* Main Time Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-white/10 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5" />
          <span>{timeInfo.location}</span>
        </div>
        <div className="text-4xl font-black text-white font-mono tracking-tight py-1">
          {timeInfo.formattedTime}
        </div>
        <div className="text-xs text-white/60 font-medium">
          {timeInfo.formattedDate}
        </div>
        <div className="text-[11px] text-white/40 pt-1 font-mono">
          Zone: {timeInfo.timeZone}
        </div>
      </div>

      {/* Search other timezones */}
      <form onSubmit={handleSearch} className="flex gap-2 pt-2 border-t border-white/10">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={locInput}
            onChange={(e) => setLocInput(e.target.value)}
            placeholder="Search timezone (e.g. Lagos, London, Tokyo, NYC)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shrink-0"
        >
          Check Time
        </button>
      </form>
    </div>
  );
};
