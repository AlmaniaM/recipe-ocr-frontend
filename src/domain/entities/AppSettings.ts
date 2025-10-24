/**
 * App Settings Entity
 * 
 * Defines the complete application settings structure with all configuration options.
 * This follows the Clean Architecture principle by keeping domain entities pure.
 */

export interface AppSettings {
  // Appearance Settings
  theme: 'warmInviting' | 'cleanModern' | 'earthyNatural';
  
  // OCR Settings
  ocrQuality: 'on-device' | 'cloud' | 'hybrid';
  
  // AI Parsing Settings
  aiProvider: 'claude' | 'local-llm' | 'auto';
  
  // Storage Settings
  storagePreference: 'local-only' | 'cloud-backup';
  autoSync: boolean;
  
  // Export Settings
  exportFormat: 'pdf' | 'docx' | 'excel' | 'csv';
  
  // Notification Settings
  notifications: boolean;
  
  // Advanced Settings
  debugMode: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'warmInviting',
  ocrQuality: 'hybrid',
  aiProvider: 'auto',
  storagePreference: 'local-only',
  autoSync: false,
  exportFormat: 'pdf',
  notifications: true,
  debugMode: false,
  analyticsEnabled: true,
  crashReportingEnabled: true,
};

export type SettingsKey = keyof AppSettings;

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  settings: SettingsKey[];
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the look and feel of the app',
    settings: ['theme'],
  },
  {
    id: 'ocr',
    title: 'OCR Settings',
    description: 'Configure text recognition quality and behavior',
    settings: ['ocrQuality'],
  },
  {
    id: 'ai',
    title: 'AI Parsing',
    description: 'Choose how recipes are parsed and processed',
    settings: ['aiProvider'],
  },
  {
    id: 'storage',
    title: 'Storage',
    description: 'Manage data storage and synchronization',
    settings: ['storagePreference', 'autoSync'],
  },
  {
    id: 'export',
    title: 'Export',
    description: 'Set default export formats and preferences',
    settings: ['exportFormat'],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control app notifications and alerts',
    settings: ['notifications'],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Developer and debugging options',
    settings: ['debugMode', 'analyticsEnabled', 'crashReportingEnabled'],
  },
];

// Theme options with display information
export interface ThemeOption {
  id: AppSettings['theme'];
  name: string;
  description: string;
  colors: string[];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'warmInviting',
    name: 'Warm & Inviting',
    description: 'Warm orange and golden tones',
    colors: ['#FF6B35', '#F7931E'],
  },
  {
    id: 'cleanModern',
    name: 'Clean & Modern',
    description: 'Blue and emerald accents',
    colors: ['#2563EB', '#10B981'],
  },
  {
    id: 'earthyNatural',
    name: 'Earthy & Natural',
    description: 'Green and amber tones',
    colors: ['#059669', '#D97706'],
  },
];

// OCR Quality options
export interface OCRQualityOption {
  id: AppSettings['ocrQuality'];
  title: string;
  description: string;
  icon: string;
  requiresInternet: boolean;
}

export const OCR_QUALITY_OPTIONS: OCRQualityOption[] = [
  {
    id: 'on-device',
    title: 'On-Device Only',
    description: 'Faster, works offline, lower accuracy',
    icon: 'phone-android',
    requiresInternet: false,
  },
  {
    id: 'cloud',
    title: 'Cloud Only',
    description: 'Requires internet, higher accuracy',
    icon: 'cloud',
    requiresInternet: true,
  },
  {
    id: 'hybrid',
    title: 'Hybrid (Recommended)',
    description: 'Best of both worlds',
    icon: 'sync',
    requiresInternet: false,
  },
];

// AI Provider options
export interface AIProviderOption {
  id: AppSettings['aiProvider'];
  title: string;
  description: string;
  icon: string;
  requiresInternet: boolean;
}

export const AI_PROVIDER_OPTIONS: AIProviderOption[] = [
  {
    id: 'claude',
    title: 'Claude (Cloud)',
    description: 'High accuracy, requires internet',
    icon: 'cloud',
    requiresInternet: true,
  },
  {
    id: 'local-llm',
    title: 'Local LLM',
    description: 'Works offline, requires local setup',
    icon: 'computer',
    requiresInternet: false,
  },
  {
    id: 'auto',
    title: 'Auto (Recommended)',
    description: 'Uses best available option',
    icon: 'auto-fix',
    requiresInternet: false,
  },
];

// Storage Preference options
export interface StoragePreferenceOption {
  id: AppSettings['storagePreference'];
  title: string;
  description: string;
  icon: string;
}

export const STORAGE_PREFERENCE_OPTIONS: StoragePreferenceOption[] = [
  {
    id: 'local-only',
    title: 'Local Only',
    description: 'Store data only on this device',
    icon: 'phone-android',
  },
  {
    id: 'cloud-backup',
    title: 'Cloud Backup',
    description: 'Sync data across devices',
    icon: 'cloud-sync',
  },
];

// Export Format options
export interface ExportFormatOption {
  id: AppSettings['exportFormat'];
  title: string;
  description: string;
  icon: string;
  mimeType: string;
}

export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  {
    id: 'pdf',
    title: 'PDF',
    description: 'Portable Document Format',
    icon: 'picture-as-pdf',
    mimeType: 'application/pdf',
  },
  {
    id: 'docx',
    title: 'Word Document',
    description: 'Microsoft Word format',
    icon: 'description',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    id: 'excel',
    title: 'Excel Spreadsheet',
    description: 'Microsoft Excel format',
    icon: 'table-chart',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    id: 'csv',
    title: 'CSV',
    description: 'Comma-separated values',
    icon: 'table-view',
    mimeType: 'text/csv',
  },
];
