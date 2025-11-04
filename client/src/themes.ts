/**
 * Centralized Theme Configuration
 * All color and font settings for the application
 */

export interface Theme {
  name: string;
  colors: {
    background: string;
    backgroundSecondary: string;
    text: string;
    border: string;
    accent: string;
    accentText: string;
    inputBackground: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
}

export const themes: Record<string, Theme> = {
  classic: {
    name: 'Classic Terminal',
    colors: {
      background: '#1a1a1a',
      backgroundSecondary: '#0a0a0a',
      text: '#00ff00',
      border: '#00ff00',
      accent: '#00ff00',
      accentText: '#1a1a1a',
      inputBackground: '#0a0a0a',
    },
    fonts: {
      primary: "'Courier New', monospace",
      secondary: 'monospace',
    },
  },
  amber: {
    name: 'Amber Glow',
    colors: {
      background: '#1a1410',
      backgroundSecondary: '#0d0a08',
      text: '#ffb000',
      border: '#ffb000',
      accent: '#ffb000',
      accentText: '#1a1410',
      inputBackground: '#0d0a08',
    },
    fonts: {
      primary: "'Courier New', monospace",
      secondary: 'monospace',
    },
  },
  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      background: '#0a0e27',
      backgroundSecondary: '#050714',
      text: '#00f0ff',
      border: '#ff00ff',
      accent: '#ff00ff',
      accentText: '#0a0e27',
      inputBackground: '#050714',
    },
    fonts: {
      primary: "'Courier New', monospace",
      secondary: 'monospace',
    },
  },
  matrix: {
    name: 'Matrix',
    colors: {
      background: '#000000',
      backgroundSecondary: '#001100',
      text: '#00ff41',
      border: '#00ff41',
      accent: '#00ff41',
      accentText: '#000000',
      inputBackground: '#001100',
    },
    fonts: {
      primary: "'Courier New', monospace",
      secondary: 'monospace',
    },
  },
  dracula: {
    name: 'Dracula',
    colors: {
      background: '#282a36',
      backgroundSecondary: '#1e1f29',
      text: '#f8f8f2',
      border: '#bd93f9',
      accent: '#bd93f9',
      accentText: '#282a36',
      inputBackground: '#1e1f29',
    },
    fonts: {
      primary: "'Courier New', monospace",
      secondary: 'monospace',
    },
  },
  solarized: {
    name: 'Solarized Dark',
    colors: {
      background: '#002b36',
      backgroundSecondary: '#073642',
      text: '#839496',
      border: '#268bd2',
      accent: '#268bd2',
      accentText: '#002b36',
      inputBackground: '#073642',
    },
    fonts: {
      primary: "'Courier New', monospace",
      secondary: 'monospace',
    },
  },
  nord: {
    name: 'Nord',
    colors: {
      background: '#2e3440',
      backgroundSecondary: '#3b4252',
      text: '#d8dee9',
      border: '#88c0d0',
      accent: '#88c0d0',
      accentText: '#2e3440',
      inputBackground: '#3b4252',
    },
    fonts: {
      primary: "'Courier New', monospace",
      secondary: 'monospace',
    },
  },
};

export const defaultTheme = 'classic';

