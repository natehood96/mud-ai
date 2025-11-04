# Theming System

A centralized theming system that allows users to customize the look and feel of the MUD game interface.

## Overview

The theming system consists of:
- **Centralized theme definitions** (`themes.ts`)
- **Theme context** (`ThemeContext.tsx`) for global state management
- **Settings modal** (`SettingsModal.tsx`) for user interface
- **Persistent storage** via localStorage

## Architecture

```
┌──────────────┐
│  themes.ts   │  ← Define all themes here
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ ThemeContext.tsx │  ← Global state management
└──────┬───────────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐   ┌──────────────┐
│   App       │   │ SettingsModal│
│ (main.tsx)  │   └──────────────┘
└─────────────┘
```

## File Structure

### `themes.ts` - Theme Definitions

This is the **single source of truth** for all colors and fonts. All themes must implement the `Theme` interface:

```typescript
interface Theme {
  name: string;
  colors: {
    background: string;           // Main background
    backgroundSecondary: string;  // Secondary/input backgrounds
    text: string;                 // Primary text color
    border: string;               // Border color
    accent: string;               // Accent/button color
    accentText: string;           // Text on accent color
    inputBackground: string;      // Input field backgrounds
  };
  fonts: {
    primary: string;              // Main font family
    secondary: string;            // Secondary font family
  };
}
```

### `ThemeContext.tsx` - State Management

Provides the theme to all components via React Context:

```typescript
const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
```

- `currentTheme`: The full theme object
- `themeName`: Current theme key (e.g., 'classic')
- `setTheme(name)`: Function to change themes
- `availableThemes`: Array of available theme keys

### `SettingsModal.tsx` - User Interface

Modal component that allows users to:
- View all available themes
- See color previews
- Switch themes with one click
- Changes are saved automatically to localStorage

## Built-in Themes

1. **Classic Terminal** - Traditional green-on-black
2. **Amber Glow** - Retro amber phosphor
3. **Cyberpunk** - Cyan and magenta
4. **Matrix** - Bright green matrix style
5. **Dracula** - Popular purple-based theme
6. **Solarized Dark** - Blue-tinted professional theme
7. **Nord** - Cool blue-gray aesthetic

## Adding a New Theme

1. **Add to `themes.ts`:**

```typescript
export const themes: Record<string, Theme> = {
  // ... existing themes ...
  myTheme: {
    name: 'My Custom Theme',
    colors: {
      background: '#1e1e2e',
      backgroundSecondary: '#181825',
      text: '#cdd6f4',
      border: '#89b4fa',
      accent: '#89b4fa',
      accentText: '#1e1e2e',
      inputBackground: '#181825',
    },
    fonts: {
      primary: "'Courier New', monospace",
      secondary: 'monospace',
    },
  },
};
```

2. **That's it!** The theme will automatically appear in the settings modal.

## Using Themes in Components

### Basic Usage

```typescript
import { useTheme } from './ThemeContext';

const MyComponent = () => {
  const { currentTheme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text,
      border: `2px solid ${currentTheme.colors.border}`,
      fontFamily: currentTheme.fonts.primary,
    }}>
      Content
    </div>
  );
};
```

### Switching Themes Programmatically

```typescript
const { setTheme } = useTheme();

// Switch to a specific theme
setTheme('cyberpunk');
```

## Best Practices

1. **Always reference theme colors** - Never hardcode colors in components
2. **Use the theme interface** - Don't bypass the context
3. **Test with multiple themes** - Ensure your UI works with all themes
4. **Keep theme definitions simple** - Avoid complex logic in themes
5. **Document custom themes** - Add comments for special color choices

## Persistence

Themes are automatically saved to localStorage with the key `'mud-theme'`. When the app loads:
1. It checks localStorage for saved theme
2. Falls back to `defaultTheme` if none found
3. Falls back to `classic` if saved theme doesn't exist

## Customization

To change the default theme, edit `themes.ts`:

```typescript
export const defaultTheme = 'matrix'; // Change from 'classic'
```

## Extending the System

### Adding Font Options

Edit the `Theme` interface to add more font properties:

```typescript
fonts: {
  primary: string;
  secondary: string;
  heading: string;  // New!
  monospace: string; // New!
}
```

### Adding More Colors

Add new color properties to the interface:

```typescript
colors: {
  // ... existing colors ...
  error: string;    // New!
  success: string;  // New!
  warning: string;  // New!
}
```

Then update all themes to include these new properties.

## Future Enhancements

Potential additions to the theming system:
- Custom theme creator in UI
- Import/export themes
- Theme sharing via URL
- Dark/light mode toggle
- Font size adjustment
- Animation speed settings
- Color blindness modes

