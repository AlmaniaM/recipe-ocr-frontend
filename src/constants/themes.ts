export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
    border: string;
    accent?: string;
  };
  typography: {
    headerFont: string;
    bodyFont: string;
    captionFont: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

export const themes: Record<string, Theme> = {
  warmInviting: {
    name: 'Warm & Inviting',
    colors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      background: '#FFF8F5',
      surface: '#FFFFFF',
      textPrimary: '#2D1B1B',
      textSecondary: '#8B7355',
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      border: '#E8D5C4',
    },
    typography: {
      headerFont: 'Inter-Bold',
      bodyFont: 'Inter-Regular',
      captionFont: 'Inter-Medium',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    }
  },
  cleanModern: {
    name: 'Clean & Modern',
    colors: {
      primary: '#2563EB',
      secondary: '#10B981',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      border: '#E5E7EB',
      accent: '#F59E0B',
    },
    typography: {
      headerFont: 'SFProDisplay-Bold', // iOS: SF Pro Display, Android: Roboto
      bodyFont: 'SFProText-Regular',
      captionFont: 'SFProText-Medium',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    }
  },
  earthyNatural: {
    name: 'Earthy & Natural',
    colors: {
      primary: '#059669',
      secondary: '#D97706',
      background: '#FEFEFE',
      surface: '#FFFFFF',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      success: '#059669',
      error: '#DC2626',
      warning: '#D97706',
      border: '#D1D5DB',
      accent: '#DC2626',
    },
    typography: {
      headerFont: 'Poppins-Bold',
      bodyFont: 'OpenSans-Regular',
      captionFont: 'OpenSans-Medium',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    }
  }
};

export const defaultTheme = 'warmInviting';
