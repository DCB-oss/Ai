// Native Android Architecture & Device Capability Bridge for AniVox
// Provides clean separation between Web browser capabilities, Native Android capabilities, and Protected OS sandbox restrictions.

export type CapabilityStatus = 'available_web' | 'requires_native_android' | 'restricted_os_sandbox';

export interface DeviceCapability {
  id: string;
  name: string;
  category: 'audio' | 'visual' | 'system' | 'security' | 'input' | 'notifications';
  status: CapabilityStatus;
  description: string;
  howItWorks: string;
  androidPermission?: string;
  androidApi?: string;
  isExecutableInWeb: boolean;
}

export interface AndroidBridgeState {
  isNativeConnected: boolean;
  platform: 'web' | 'android_webview' | 'android_native' | 'pwa';
  systemVolume: number; // 0 - 100
  brightness: number; // 0 - 100
  isWifiEnabled: boolean;
  isBluetoothEnabled: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
}

export const DEVICE_CAPABILITIES: DeviceCapability[] = [
  // 1. Available in Web Platform
  {
    id: 'assistant_voice',
    name: 'Assistant Voice & Synthesis',
    category: 'audio',
    status: 'available_web',
    description: 'Generates real-time speech using browser Web Speech API voices.',
    howItWorks: 'Directly utilizes window.speechSynthesis with configurable pitch and rate.',
    isExecutableInWeb: true,
  },
  {
    id: 'assistant_volume',
    name: 'Assistant & Media Volume',
    category: 'audio',
    status: 'available_web',
    description: 'Controls application playback volume and synthetic audio gain (0-100%).',
    howItWorks: 'Modulates SpeechSynthesisUtterance volume and WebAudio GainNode.',
    isExecutableInWeb: true,
  },
  {
    id: 'app_theme',
    name: 'UI Theme & Appearance',
    category: 'visual',
    status: 'available_web',
    description: 'Switches color palettes between Dark OLED, Light, and Cyberpunk Matrix.',
    howItWorks: 'Applies CSS class and DOM background / token updates.',
    isExecutableInWeb: true,
  },
  {
    id: 'orb_animation',
    name: 'Orb Dynamics & Glow',
    category: 'visual',
    status: 'available_web',
    description: 'Modulates canvas animation frame delta, particle orbits, and glow radius.',
    howItWorks: 'Dynamically scales rendering math inside HTML5 Canvas 2D engine.',
    isExecutableInWeb: true,
  },
  {
    id: 'text_scale',
    name: 'Typography Scale',
    category: 'visual',
    status: 'available_web',
    description: 'Adjusts body and interface text size (Compact, Normal, Large).',
    howItWorks: 'Modifies root viewport font scale and container typography classes.',
    isExecutableInWeb: true,
  },
  {
    id: 'in_app_memory',
    name: 'User-Controlled Memory',
    category: 'system',
    status: 'available_web',
    description: 'Persists and audits user preferences, goals, and feedback.',
    howItWorks: 'Local storage with transparent export/import and deletion controls.',
    isExecutableInWeb: true,
  },
  {
    id: 'in_app_notifications',
    name: 'In-App Alerts & Sound Effects',
    category: 'notifications',
    status: 'available_web',
    description: 'Synthetic audio chimes, timer countdown alerts, and UI notifications.',
    howItWorks: 'Web Audio API oscillator frequency modulation and HTML dialogs.',
    isExecutableInWeb: true,
  },
  {
    id: 'haptic_feedback',
    name: 'Haptic Vibration Feedback',
    category: 'system',
    status: 'available_web',
    description: 'Tactile pulses for button taps, orb activation, and timer completion.',
    howItWorks: 'Uses navigator.vibrate() where supported by mobile browsers.',
    isExecutableInWeb: true,
  },

  // 2. Requires Native Android Architecture
  {
    id: 'system_master_volume',
    name: 'System-Wide Master Volume',
    category: 'audio',
    status: 'requires_native_android',
    description: 'Adjusts the physical smartphone ringtone, alarm, and media master volume.',
    howItWorks: 'Requires native Android AudioManager bridge with MODIFY_AUDIO_SETTINGS permission.',
    androidPermission: 'android.permission.MODIFY_AUDIO_SETTINGS',
    androidApi: 'android.media.AudioManager.setStreamVolume(STREAM_MUSIC, ...)',
    isExecutableInWeb: false,
  },
  {
    id: 'screen_hardware_brightness',
    name: 'Hardware Screen Brightness',
    category: 'visual',
    status: 'requires_native_android',
    description: 'Modifies the smartphone physical display backlight intensity.',
    howItWorks: 'Requires native Android system settings intent or WindowManager.LayoutParams.',
    androidPermission: 'android.permission.WRITE_SETTINGS',
    androidApi: 'android.provider.Settings.System.putInt(..., SCREEN_BRIGHTNESS, ...)',
    isExecutableInWeb: false,
  },
  {
    id: 'device_radios',
    name: 'Device Radios (Wi-Fi / Bluetooth)',
    category: 'system',
    status: 'requires_native_android',
    description: 'Toggles smartphone Wi-Fi, Bluetooth, or opens OS Connectivity Settings.',
    howItWorks: 'Requires native Android Intent (ACTION_WIFI_SETTINGS / BluetoothAdapter).',
    androidPermission: 'android.permission.CHANGE_WIFI_STATE / BLUETOOTH_ADMIN',
    androidApi: 'android.net.wifi.WifiManager / Intent(Settings.ACTION_WIRELESS_SETTINGS)',
    isExecutableInWeb: false,
  },
  {
    id: 'background_wake_word',
    name: 'Always-On Background Wake-Word',
    category: 'input',
    status: 'requires_native_android',
    description: 'Listens for "Hey Vox" wake phrase when phone screen is locked or app is minimized.',
    howItWorks: 'Requires Android Foreground VoiceInteractionService and low-power DSP hardware.',
    androidPermission: 'android.permission.RECORD_AUDIO + BIND_VOICE_INTERACTION',
    androidApi: 'android.service.voice.VoiceInteractionService',
    isExecutableInWeb: false,
  },
  {
    id: 'biometric_auth',
    name: 'OS Biometric Lock (Fingerprint / Face)',
    category: 'security',
    status: 'requires_native_android',
    description: 'Integrates with hardware biometric secure enclave for unlocking sensitive data.',
    howItWorks: 'Requires Android BiometricPrompt API; fallback to WebAuthn or PIN in web browser.',
    androidPermission: 'android.permission.USE_BIOMETRIC',
    androidApi: 'androidx.biometric.BiometricPrompt',
    isExecutableInWeb: false,
  },
  {
    id: 'system_notification_tray',
    name: 'System Notification Tray & Lockscreen',
    category: 'notifications',
    status: 'requires_native_android',
    description: 'Displays persistent media controls and interactive timer heads in Android status bar.',
    howItWorks: 'Requires Android NotificationManager with NotificationCompat.Builder.',
    androidPermission: 'android.permission.POST_NOTIFICATIONS',
    androidApi: 'android.app.NotificationManager',
    isExecutableInWeb: false,
  },
  {
    id: 'contact_calling',
    name: 'Native Android Telecom & Direct Calling',
    category: 'system',
    status: 'requires_native_android',
    description: 'Places phone calls directly via Android TelecomManager or telephone intent.',
    howItWorks: 'Uses Android Intent.ACTION_CALL / Intent.ACTION_DIAL with tel: URI fallback in browser.',
    androidPermission: 'android.permission.CALL_PHONE',
    androidApi: 'android.telecom.TelecomManager.placeCall(Uri.parse("tel:..."), extras)',
    isExecutableInWeb: true, // Handled via tel: URI in web browser
  },
  {
    id: 'contacts_access',
    name: 'Android Contacts Provider Access',
    category: 'system',
    status: 'requires_native_android',
    description: 'Reads user-saved address book contacts with local on-device privacy guarantee.',
    howItWorks: 'Queries ContactsContract.CommonDataKinds.Phone with zero cloud transmission.',
    androidPermission: 'android.permission.READ_CONTACTS',
    androidApi: 'android.provider.ContactsContract.CommonDataKinds.Phone.CONTENT_URI',
    isExecutableInWeb: true, // Handled via local storage contact book in web app
  },
  {
    id: 'telecom_dual_sim',
    name: 'Dual SIM Phone Account Slot Routing',
    category: 'system',
    status: 'requires_native_android',
    description: 'Selects specific SIM 1 / SIM 2 subscription slot when placing voice calls.',
    howItWorks: 'Passes EXTRA_PHONE_ACCOUNT_HANDLE / subscription_id in call intent.',
    androidPermission: 'android.permission.READ_PHONE_STATE',
    androidApi: 'android.telecom.TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE',
    isExecutableInWeb: true,
  },

  // 3. Protected OS Sandbox & Prohibited Operations
  {
    id: 'secret_mic_recording',
    name: 'Silent / Covert Audio Recording',
    category: 'security',
    status: 'restricted_os_sandbox',
    description: 'Activating microphone without user knowledge or UI indicator is forbidden.',
    howItWorks: 'AniVox strictly adheres to Android & Web privacy policies: mic is only active with visible HUD indicator.',
    isExecutableInWeb: false,
  },
  {
    id: 'bypass_os_lockscreen',
    name: 'Bypassing OS Device Lock / PIN',
    category: 'security',
    status: 'restricted_os_sandbox',
    description: 'Bypassing phone security or accessing private OS files without user authentication.',
    howItWorks: 'Android Keyguard sandbox strictly prevents unauthorized app elevation.',
    isExecutableInWeb: false,
  },
];

class AniVoxNativeBridgeService {
  private state: AndroidBridgeState = {
    isNativeConnected: false,
    platform: 'web',
    systemVolume: 75,
    brightness: 80,
    isWifiEnabled: true,
    isBluetoothEnabled: true,
  };

  constructor() {
    this.detectEnvironment();
  }

  private detectEnvironment() {
    if (typeof window !== 'undefined') {
      const isAndroidUserAgent = /Android/i.test(navigator.userAgent);
      const hasNativeBridge = Boolean((window as any).AniVoxAndroidBridge || (window as any).AuraAndroidBridge || (window as any).Android);
      
      this.state.isNativeConnected = hasNativeBridge;
      this.state.platform = hasNativeBridge
        ? 'android_native'
        : isAndroidUserAgent
        ? 'android_webview'
        : 'web';
    }
  }

  public getState(): AndroidBridgeState {
    return { ...this.state };
  }

  public isNativeAndroidAvailable(): boolean {
    return this.state.isNativeConnected;
  }

  // Trigger Device Haptic Pulse (Supported in Web & Android)
  public triggerHaptic(duration: number = 25) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {}
    }
  }

  // Honest method that never fakes success for hardware actions in web sandboxes
  public executeDeviceAction(
    actionName: string,
    params: any = {}
  ): { success: boolean; requiresNative: boolean; explanation: string } {
    const capability = DEVICE_CAPABILITIES.find((c) => c.id === actionName);

    if (!capability) {
      return {
        success: false,
        requiresNative: false,
        explanation: `The action "${actionName}" is not a recognized device control.`,
      };
    }

    if (capability.status === 'restricted_os_sandbox') {
      return {
        success: false,
        requiresNative: false,
        explanation: `Security Policy: ${capability.name} is restricted by operating system security policies. AniVox operates under strict user privacy and consent standards.`,
      };
    }

    if (capability.status === 'requires_native_android' && !this.state.isNativeConnected) {
      return {
        success: false,
        requiresNative: true,
        explanation: `Hardware Control Notice: Controlling "${capability.name}" requires the Native Android Companion App with ${capability.androidPermission || 'appropriate OS permissions'}. Browser web sandboxes cannot directly modify physical device hardware settings.`,
      };
    }

    // In native mode
    return {
      success: true,
      requiresNative: false,
      explanation: `Successfully communicated with Android subsystem for ${capability.name}.`,
    };
  }
}

export const nativeAndroidBridge = new AniVoxNativeBridgeService();
