import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, defaultTheme, Theme } from './themes';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>(() => {
    // Load theme from localStorage or use default
    const savedTheme = localStorage.getItem('mud-theme');
    return savedTheme && themes[savedTheme] ? savedTheme : defaultTheme;
  });

  const currentTheme = themes[themeName];
  const availableThemes = Object.keys(themes);

  const setTheme = (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
      localStorage.setItem('mud-theme', newThemeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

