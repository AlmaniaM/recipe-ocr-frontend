import { themes, defaultTheme, Theme } from '../../constants/themes';

describe('Themes', () => {
  describe('Theme interface validation', () => {
    const validateTheme = (theme: Theme, themeName: string) => {
      expect(theme.name).toBeDefined();
      expect(theme.colors).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.borderRadius).toBeDefined();

      // Validate colors
      expect(theme.colors.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.secondary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.background).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.surface).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.textPrimary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.textSecondary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.success).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.error).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.warning).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme.colors.border).toMatch(/^#[0-9A-F]{6}$/i);

      // Validate typography
      expect(typeof theme.typography.headerFont).toBe('string');
      expect(typeof theme.typography.bodyFont).toBe('string');
      expect(typeof theme.typography.captionFont).toBe('string');

      // Validate spacing
      expect(typeof theme.spacing.xs).toBe('number');
      expect(typeof theme.spacing.sm).toBe('number');
      expect(typeof theme.spacing.md).toBe('number');
      expect(typeof theme.spacing.lg).toBe('number');
      expect(typeof theme.spacing.xl).toBe('number');

      // Validate borderRadius
      expect(typeof theme.borderRadius.sm).toBe('number');
      expect(typeof theme.borderRadius.md).toBe('number');
      expect(typeof theme.borderRadius.lg).toBe('number');

      // Validate spacing values are positive
      Object.values(theme.spacing).forEach(value => {
        expect(value).toBeGreaterThan(0);
      });

      // Validate borderRadius values are non-negative
      Object.values(theme.borderRadius).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
      });
    };

    it('should validate warmInviting theme', () => {
      validateTheme(themes.warmInviting, 'warmInviting');
      expect(themes.warmInviting.name).toBe('Warm & Inviting');
    });

    it('should validate cleanModern theme', () => {
      validateTheme(themes.cleanModern, 'cleanModern');
      expect(themes.cleanModern.name).toBe('Clean & Modern');
      expect(themes.cleanModern.colors.accent).toBeDefined();
    });

    it('should validate earthyNatural theme', () => {
      validateTheme(themes.earthyNatural, 'earthyNatural');
      expect(themes.earthyNatural.name).toBe('Earthy & Natural');
      expect(themes.earthyNatural.colors.accent).toBeDefined();
    });
  });

  describe('Theme consistency', () => {
    it('should have consistent spacing values across all themes', () => {
      const spacingValues = Object.values(themes).map(theme => theme.spacing);
      
      spacingValues.forEach(spacing => {
        expect(spacing.xs).toBe(4);
        expect(spacing.sm).toBe(8);
        expect(spacing.md).toBe(16);
        expect(spacing.lg).toBe(24);
        expect(spacing.xl).toBe(32);
      });
    });

    it('should have consistent borderRadius values across all themes', () => {
      const borderRadiusValues = Object.values(themes).map(theme => theme.borderRadius);
      
      borderRadiusValues.forEach(borderRadius => {
        expect(borderRadius.sm).toBe(4);
        expect(borderRadius.md).toBe(8);
        expect(borderRadius.lg).toBe(12);
      });
    });

    it('should have unique primary colors across themes', () => {
      const primaryColors = Object.values(themes).map(theme => theme.colors.primary);
      const uniqueColors = new Set(primaryColors);
      
      expect(uniqueColors.size).toBe(primaryColors.length);
    });

    it('should have unique secondary colors across themes', () => {
      const secondaryColors = Object.values(themes).map(theme => theme.colors.secondary);
      const uniqueColors = new Set(secondaryColors);
      
      expect(uniqueColors.size).toBe(secondaryColors.length);
    });
  });

  describe('Default theme', () => {
    it('should have a valid default theme', () => {
      expect(defaultTheme).toBe('warmInviting');
      expect(themes[defaultTheme]).toBeDefined();
    });

    it('should have warmInviting as the default theme', () => {
      expect(themes[defaultTheme]).toEqual(themes.warmInviting);
    });
  });

  describe('Theme accessibility', () => {
    const checkColorContrast = (background: string, text: string) => {
      // Simple contrast check - in a real app, you'd use a proper contrast ratio calculator
      const bgR = parseInt(background.slice(1, 3), 16);
      const bgG = parseInt(background.slice(3, 5), 16);
      const bgB = parseInt(background.slice(5, 7), 16);
      
      const textR = parseInt(text.slice(1, 3), 16);
      const textG = parseInt(text.slice(3, 5), 16);
      const textB = parseInt(text.slice(5, 7), 16);
      
      const bgLuminance = (0.299 * bgR + 0.587 * bgG + 0.114 * bgB) / 255;
      const textLuminance = (0.299 * textR + 0.587 * textG + 0.114 * textB) / 255;
      
      return Math.abs(bgLuminance - textLuminance) > 0.5;
    };

    it('should have sufficient contrast between background and text colors', () => {
      Object.values(themes).forEach(theme => {
        expect(checkColorContrast(theme.colors.background, theme.colors.textPrimary)).toBe(true);
        expect(checkColorContrast(theme.colors.surface, theme.colors.textPrimary)).toBe(true);
      });
    });
  });

  describe('Theme completeness', () => {
    it('should have all required color properties', () => {
      Object.values(themes).forEach(theme => {
        expect(theme.colors.primary).toBeDefined();
        expect(theme.colors.secondary).toBeDefined();
        expect(theme.colors.background).toBeDefined();
        expect(theme.colors.surface).toBeDefined();
        expect(theme.colors.textPrimary).toBeDefined();
        expect(theme.colors.textSecondary).toBeDefined();
        expect(theme.colors.success).toBeDefined();
        expect(theme.colors.error).toBeDefined();
        expect(theme.colors.warning).toBeDefined();
        expect(theme.colors.border).toBeDefined();
      });
    });

    it('should have all required typography properties', () => {
      Object.values(themes).forEach(theme => {
        expect(theme.typography.headerFont).toBeDefined();
        expect(theme.typography.bodyFont).toBeDefined();
        expect(theme.typography.captionFont).toBeDefined();
      });
    });

    it('should have all required spacing properties', () => {
      Object.values(themes).forEach(theme => {
        expect(theme.spacing.xs).toBeDefined();
        expect(theme.spacing.sm).toBeDefined();
        expect(theme.spacing.md).toBeDefined();
        expect(theme.spacing.lg).toBeDefined();
        expect(theme.spacing.xl).toBeDefined();
      });
    });

    it('should have all required borderRadius properties', () => {
      Object.values(themes).forEach(theme => {
        expect(theme.borderRadius.sm).toBeDefined();
        expect(theme.borderRadius.md).toBeDefined();
        expect(theme.borderRadius.lg).toBeDefined();
      });
    });
  });
});
