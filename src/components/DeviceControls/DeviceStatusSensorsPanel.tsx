import React, { useState, useEffect } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  HardDrive,
  Wifi,
  Radio,
  Shield,
  Smartphone,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Lock,
  Power,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { DeviceStatusReport, BatteryStatusInfo, StorageStatusInfo } from '../../types/assistant';
import { deviceSensors } from '../../services/deviceSensors';
import { soundEffects } from '../../services/soundEffects';

interface DeviceStatusSensorsPanelProps {
  onTriggerAction?: (actionName: string) => void;
}

export const DeviceStatusSensorsPanel: React.FC<DeviceStatusSensorsPanelProps> = ({
  onTriggerAction,
}) => {
  const [report, setReport] = useState<DeviceStatusReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ action: string; title: string; desc: string; danger?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await deviceSensors.getDeviceStatusReport();
      setReport(data);
    } catch (e) {
      console.warn('Sensor report error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = deviceSensors.subscribeBattery((b) => {
      setReport((prev) => (prev ? { ...prev, battery: b } : null));
    });
    return () => unsub();
  }, []);

  const handleActionClick = (action: string, title: string, desc: string, danger = false) => {
    soundEffects.playTap();
    setConfirmModal({ action, title, desc, danger });
  };

  const handleConfirmAction = () => {
    if (!confirmModal) return;
    const action = confirmModal.action;
    setConfirmModal(null);

    soundEffects.playWarning();

    if (action === 'restart') {
      setActionNotice({
        message: "Android Safety Notice: Direct hardware restart requires the Android system layer or device-owner permissions. In browser mode, please use your device's physical power button.",
        type: 'warning',
      });
    } else if (action === 'lock') {
      setActionNotice({
        message: "Lock Screen: System display lock command dispatched. Native Android APK will trigger KeyguardManager.lockNow().",
        type: 'info',
      });
    }

    onTriggerAction?.(action);
  };

  if (!report) {
    return (
      <div className="p-6 rounded-3xl glass-panel border-white/10 text-center animate-pulse">
        <p className="text-xs text-white/50">Reading hardware sensors & power metrics...</p>
      </div>
    );
  }

  const battery = report.battery;
  const storage = report.storage;

  const getBatteryIcon = (b: BatteryStatusInfo) => {
    if (b.isCharging) return <BatteryCharging className="w-6 h-6 text-emerald-400 animate-pulse" />;
    if (b.level <= 20) return <BatteryLow className="w-6 h-6 text-rose-400" />;
    if (b.level <= 60) return <BatteryMedium className="w-6 h-6 text-amber-400" />;
    return <Battery className="w-6 h-6 text-emerald-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wider uppercase text-white">
                Device Telemetry & Hardware Sensors
              </h2>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Live power, storage capacity, connectivity telemetry, and permission-gated system controls.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          title="Refresh Sensors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Action Result Notice */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
            actionNotice.type === 'warning'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">{actionNotice.message}</p>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Battery & Storage Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Battery Card */}
        <div className="p-5 rounded-3xl glass-panel border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getBatteryIcon(battery)}
              <h3 className="text-xs font-black tracking-widest uppercase text-white">
                Power & Battery
              </h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                battery.isCharging
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : battery.level <= 20
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              {battery.isCharging ? 'Charging' : `${battery.level}% Remaining`}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-mono">{battery.level}%</span>
            <span className="text-xs text-white/60">
              {battery.isCharging ? 'AC / USB Fast Charging' : 'Battery Discharging'}
            </span>
          </div>

          {/* Level Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                battery.level <= 20
                  ? 'bg-rose-500'
                  : battery.level <= 50
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${battery.level}%` }}
            />
          </div>

          <p className="text-xs text-white/60 pt-1 leading-relaxed">
            {battery.formattedRemainingEstimate}
          </p>

          {battery.batterySaverActive && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Battery Saver Active (Low Power Mode)</span>
            </div>
          )}
        </div>

        {/* Storage Card */}
        <div className="p-5 rounded-3xl glass-panel border-cyan-500/30 shadow-[0_0_25px_rgba(0,242,255,0.1)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-black tracking-widest uppercase text-white">
                Storage & Memory
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/40">
              {storage.usedPercentage}% Used
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-mono">
              {storage.formattedUsed}
            </span>
            <span className="text-xs text-white/60">
              of {storage.formattedTotal}
            </span>
          </div>

          {/* Storage Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                storage.isLowStorage ? 'bg-rose-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${storage.usedPercentage}%` }}
            />
          </div>

          <p className="text-xs text-white/60 pt-1">
            Available Space: <strong className="text-white">{storage.formattedAvailable}</strong>
          </p>

          {storage.isLowStorage && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Warning: Storage exceeds 85% capacity.</span>
            </div>
          )}
        </div>
      </div>

      {/* Connectivity & Sensor Status Grid */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
        <h3 className="text-xs font-black tracking-widest uppercase text-white">
          System Sensors & Network Telemetry
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Wifi className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Network</span>
            </div>
            <p className="text-[11px] text-white/60 truncate">{report.effectiveNetworkType}</p>
            <p className="text-[10px] text-cyan-300 font-mono mt-0.5">{report.downlinkSpeedMbps} Mbps</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Radio className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Bluetooth</span>
            </div>
            <p className="text-[11px] text-white/60">
              {report.bluetoothSupported ? 'Hardware Ready' : 'OS Gated'}
            </p>
            <p className="text-[10px] text-purple-300 font-mono mt-0.5">BLE 5.0+</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Mic Permission</span>
            </div>
            <p className="text-[11px] text-emerald-300 font-bold uppercase">{report.microphonePermission}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Active</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-bold text-white">OS Notifications</span>
            </div>
            <p className="text-[11px] text-amber-300 font-bold uppercase">{report.notificationsPermission}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Push Ready</p>
          </div>
        </div>
      </div>

      {/* Safety Gated Device Actions */}
      <div className="p-5 rounded-3xl glass-panel border-white/10 space-y-4">
        <div>
          <h3 className="text-xs font-black tracking-widest uppercase text-white">
            Permission-Gated Safe Device Actions
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Dangerous system actions require explicit user confirmation. Ambiguous commands are never executed silently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() =>
              handleActionClick(
                'restart',
                'Restart Device',
                'Are you sure you want to trigger a system restart? An unconfirmed voice command will never reboot your phone.',
                true
              )
            }
            className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Restart Device</p>
                <p className="text-xs text-rose-300/80">Requires Confirmation Modal</p>
              </div>
            </div>
            <Power className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() =>
              handleActionClick(
                'lock',
                'Lock Screen / Device',
                'Trigger system keyguard lock now?',
                false
              )
            }
            className="p-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Lock Screen</p>
                <p className="text-xs text-cyan-300/80">Keyguard Lock Bridge</p>
              </div>
            </div>
            <Lock className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Explicit Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="p-6 rounded-3xl glass-panel border-white/20 max-w-md w-full space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  confirmModal.danger
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
                <p className="text-xs text-white/50">Vox Safety Verification Protocol</p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">{confirmModal.desc}</p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  confirmModal.danger
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
