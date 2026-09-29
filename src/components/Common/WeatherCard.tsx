import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { WeatherData } from '../../types/assistant';
import { deviceSensors } from '../../services/deviceSensors';
import { soundEffects } from '../../services/soundEffects';

interface WeatherCardProps {
  initialCity?: string;
  onClose?: () => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ initialCity, onClose }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cityInput, setCityInput] = useState(initialCity || '');
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const fetchWeather = async (city?: string) => {
    setIsLoading(true);
    try {
      const data = await deviceSensors.getWeatherData(city);
      setWeather(data);
    } catch (e) {
      console.warn('Weather error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(initialCity);
  }, [initialCity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(cityInput.trim());
      soundEffects.playTap();
    }
  };

  const getWeatherIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sun': return <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />;
      case 'cloud-rain': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'cloud': return <Cloud className="w-8 h-8 text-slate-300" />;
      default: return <CloudSun className="w-8 h-8 text-amber-300" />;
    }
  };

  if (!weather) {
    return (
      <div className="p-5 rounded-3xl glass-panel border-white/10 text-center animate-pulse">
        <p className="text-xs text-white/50">Retrieving atmospheric telemetry...</p>
      </div>
    );
  }

  const currentTemp = unit === 'C' ? `${weather.temperatureC}°C` : `${weather.temperatureF}°F`;

  return (
    <div className="p-5 rounded-3xl glass-panel border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,255,0.15)] max-w-xl mx-auto w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,255,0.2)]">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase text-white flex items-center gap-2">
              <span>Live Meteorological Telemetry</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Unit Toggle */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setUnit('C')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                unit === 'C' ? 'bg-cyan-500 text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                unit === 'F' ? 'bg-cyan-500 text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              °F
            </button>
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
      </div>

      {/* Main Temp & City Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h4 className="text-lg font-black tracking-wide">{weather.city}</h4>
          </div>
          <p className="text-xs text-cyan-300 font-semibold mt-0.5">{weather.condition}</p>
          <p className="text-[11px] text-white/50 mt-1">{weather.description}</p>
        </div>

        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.icon)}
          <span className="text-3xl font-black text-white font-mono tracking-tight">
            {currentTemp}
          </span>
        </div>
      </div>

      {/* Key Atmospheric Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold text-white/60">Humidity</span>
          </div>
          <span className="text-xs font-bold text-white font-mono">{weather.humidity}%</span>
        </div>

        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-teal-400 mb-1">
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold text-white/60">Wind</span>
          </div>
          <span className="text-xs font-bold text-white font-mono">{weather.windSpeedKmh} km/h</span>
        </div>

        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
            <CloudRain className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold text-white/60">Precipitation</span>
          </div>
          <span className="text-xs font-bold text-white font-mono">{weather.chanceOfRain}%</span>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {weather.forecast && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            5-Day Outlook
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {weather.forecast.map((f, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-white/5 border border-white/5 text-center flex flex-col items-center justify-between gap-1"
              >
                <span className="text-[11px] font-bold text-white/80">{f.day}</span>
                <span className="text-[10px] text-cyan-300 truncate max-w-full">
                  {unit === 'C' ? `${f.highC}°` : `${f.highF}°`}
                </span>
                <span className="text-[9px] text-white/40">
                  {unit === 'C' ? `${f.lowC}°` : `${f.lowF}°`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* City Search */}
      <form onSubmit={handleSearch} className="flex gap-2 pt-2 border-t border-white/10">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Search city weather (e.g. London, Lagos, Tokyo)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Update</span>
        </button>
      </form>
    </div>
  );
};
