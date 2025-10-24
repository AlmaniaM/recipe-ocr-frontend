import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, Theme, defaultTheme } from '../constants/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>(defaultTheme);
  const [theme, setTheme] = useState<Theme>(themes[defaultTheme]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && themes[savedTheme]) {
        setThemeName(savedTheme);
        setTheme(themes[savedTheme]);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const handleSetTheme = async (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
      setTheme(themes[newThemeName]);
      try {
        await AsyncStorage.setItem('selectedTheme', newThemeName);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        setTheme: handleSetTheme,
        availableThemes: Object.keys(themes),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
