/**
 * AppSettings Entity Tests
 * 
 * Tests for the AppSettings entity and related types.
 */

import { 
  AppSettings, 
  DEFAULT_APP_SETTINGS, 
  THEME_OPTIONS, 
  OCR_QUALITY_OPTIONS, 
  AI_PROVIDER_OPTIONS,
  STORAGE_PREFERENCE_OPTIONS,
  EXPORT_FORMAT_OPTIONS 
} from '../../../domain/entities/AppSettings';

describe('AppSettings', () => {
  describe('DEFAULT_APP_SETTINGS', () => {
    it('should have all required properties', () => {
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('theme');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('ocrQuality');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('aiProvider');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('storagePreference');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('autoSync');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('exportFormat');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('notifications');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('debugMode');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('analyticsEnabled');
      expect(DEFAULT_APP_SETTINGS).toHaveProperty('crashReportingEnabled');
    });

    it('should have valid default values', () => {
      expect(DEFAULT_APP_SETTINGS.theme).toBe('warmInviting');
      expect(DEFAULT_APP_SETTINGS.ocrQuality).toBe('hybrid');
      expect(DEFAULT_APP_SETTINGS.aiProvider).toBe('auto');
      expect(DEFAULT_APP_SETTINGS.storagePreference).toBe('local-only');
      expect(DEFAULT_APP_SETTINGS.autoSync).toBe(false);
      expect(DEFAULT_APP_SETTINGS.exportFormat).toBe('pdf');
      expect(DEFAULT_APP_SETTINGS.notifications).toBe(true);
      expect(DEFAULT_APP_SETTINGS.debugMode).toBe(false);
      expect(DEFAULT_APP_SETTINGS.analyticsEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.crashReportingEnabled).toBe(true);
    });
  });

  describe('THEME_OPTIONS', () => {
    it('should have all three theme options', () => {
      expect(THEME_OPTIONS).toHaveLength(3);
      expect(THEME_OPTIONS.map(option => option.id)).toEqual([
        'warmInviting',
        'cleanModern',
        'earthyNatural'
      ]);
    });

    it('should have valid theme option structure', () => {
      THEME_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(option).toHaveProperty('description');
        expect(option).toHaveProperty('colors');
        expect(Array.isArray(option.colors)).toBe(true);
        expect(option.colors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('OCR_QUALITY_OPTIONS', () => {
    it('should have all three OCR quality options', () => {
      expect(OCR_QUALITY_OPTIONS).toHaveLength(3);
      expect(OCR_QUALITY_OPTIONS.map(option => option.id)).toEqual([
        'on-device',
        'cloud',
        'hybrid'
      ]);
    });

    it('should have valid OCR quality option structure', () => {
      OCR_QUALITY_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('title');
        expect(option).toHaveProperty('description');
        expect(option).toHaveProperty('icon');
        expect(option).toHaveProperty('requiresInternet');
        expect(typeof option.requiresInternet).toBe('boolean');
      });
    });
  });

  describe('AI_PROVIDER_OPTIONS', () => {
    it('should have all three AI provider options', () => {
      expect(AI_PROVIDER_OPTIONS).toHaveLength(3);
      expect(AI_PROVIDER_OPTIONS.map(option => option.id)).toEqual([
        'claude',
        'local-llm',
        'auto'
      ]);
    });

    it('should have valid AI provider option structure', () => {
      AI_PROVIDER_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('title');
        expect(option).toHaveProperty('description');
        expect(option).toHaveProperty('icon');
        expect(option).toHaveProperty('requiresInternet');
        expect(typeof option.requiresInternet).toBe('boolean');
      });
    });
  });

  describe('STORAGE_PREFERENCE_OPTIONS', () => {
    it('should have all two storage preference options', () => {
      expect(STORAGE_PREFERENCE_OPTIONS).toHaveLength(2);
      expect(STORAGE_PREFERENCE_OPTIONS.map(option => option.id)).toEqual([
        'local-only',
        'cloud-backup'
      ]);
    });

    it('should have valid storage preference option structure', () => {
      STORAGE_PREFERENCE_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('title');
        expect(option).toHaveProperty('description');
        expect(option).toHaveProperty('icon');
      });
    });
  });

  describe('EXPORT_FORMAT_OPTIONS', () => {
    it('should have all four export format options', () => {
      expect(EXPORT_FORMAT_OPTIONS).toHaveLength(4);
      expect(EXPORT_FORMAT_OPTIONS.map(option => option.id)).toEqual([
        'pdf',
        'docx',
        'excel',
        'csv'
      ]);
    });

    it('should have valid export format option structure', () => {
      EXPORT_FORMAT_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('title');
        expect(option).toHaveProperty('description');
        expect(option).toHaveProperty('icon');
        expect(option).toHaveProperty('mimeType');
      });
    });
  });
});
