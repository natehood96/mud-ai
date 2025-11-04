import React from 'react';
import { useTheme } from './ThemeContext';
import { themes } from './themes';
import { GearIcon } from './GearIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999,
        }}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: currentTheme.colors.background,
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '8px',
          padding: '30px',
          minWidth: '400px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1000,
          color: currentTheme.colors.text,
          fontFamily: currentTheme.fonts.primary,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GearIcon size={28} color={currentTheme.colors.border} />
            <h2 style={{ margin: 0 }}>Settings</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: currentTheme.colors.text,
              fontSize: '32px',
              cursor: 'pointer',
              padding: '0 10px',
              lineHeight: '1',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: currentTheme.colors.text }}>Theme Selection</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {availableThemes.map((themeKey) => {
              const theme = themes[themeKey];
              const isSelected = themeName === themeKey;
              
              return (
                <div
                  key={themeKey}
                  onClick={() => setTheme(themeKey)}
                  style={{
                    padding: '15px',
                    border: `2px solid ${isSelected ? currentTheme.colors.border : currentTheme.colors.backgroundSecondary}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? currentTheme.colors.backgroundSecondary : 'transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = currentTheme.colors.border;
                      e.currentTarget.style.opacity = '0.8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = currentTheme.colors.backgroundSecondary;
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {isSelected && '✓ '}{theme.name}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        Preview colors:
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Preview */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: theme.colors.background,
                        border: `1px solid ${currentTheme.colors.text}`,
                        borderRadius: '4px',
                      }}
                      title="Background"
                    />
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: theme.colors.text,
                        border: `1px solid ${currentTheme.colors.text}`,
                        borderRadius: '4px',
                      }}
                      title="Text"
                    />
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: theme.colors.border,
                        border: `1px solid ${currentTheme.colors.text}`,
                        borderRadius: '4px',
                      }}
                      title="Border/Accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 30px',
              backgroundColor: currentTheme.colors.accent,
              border: 'none',
              borderRadius: '4px',
              color: currentTheme.colors.accentText,
              fontFamily: currentTheme.fonts.primary,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

