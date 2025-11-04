import React from 'react';
import { useTheme } from './ThemeContext';

interface World {
  id: string;
  name: string;
  createdAt: string;
  lastPlayedAt: string | null;
}

interface WorldSelectionProps {
  onWorldSelected: (worldId: string) => void;
}

export const WorldSelection: React.FC<WorldSelectionProps> = ({ onWorldSelected }) => {
  const { currentTheme } = useTheme();
  const [worlds, setWorlds] = React.useState<World[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [newWorldName, setNewWorldName] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/worlds');
      if (!response.ok) {
        throw new Error('Failed to load worlds');
      }
      const data = await response.json();
      setWorlds(data.worlds);
      setError(null);
    } catch (err) {
      setError('Failed to load worlds. Please try again.');
      console.error('Error loading worlds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName.trim() || creating) return;

    try {
      setCreating(true);
      const response = await fetch('/api/worlds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newWorldName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create world');
      }

      const data = await response.json();
      setNewWorldName('');
      setShowCreateForm(false);
      
      // Select the newly created world immediately
      onWorldSelected(data.world.id);
    } catch (err) {
      setError('Failed to create world. Please try again.');
      console.error('Error creating world:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectWorld = async (worldId: string) => {
    // Update last played timestamp
    try {
      await fetch(`/api/worlds/${worldId}/last-played`, {
        method: 'PUT',
      });
    } catch (err) {
      console.error('Error updating last played:', err);
      // Don't block the user from playing if this fails
    }
    
    onWorldSelected(worldId);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div style={{ 
      fontFamily: currentTheme.fonts.primary, 
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          fontSize: '48px',
        }}>
          🎮 MUD Game
        </h1>
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          color: currentTheme.colors.text,
          opacity: 0.8,
        }}>
          Select a world to continue your adventure
        </p>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            border: `2px solid ${currentTheme.colors.border}`,
            borderRadius: '8px',
          }}>
            <p>Loading worlds...</p>
          </div>
        )}

        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            border: `2px solid ${currentTheme.colors.border}`,
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: currentTheme.colors.backgroundSecondary,
          }}>
            <p style={{ color: currentTheme.colors.accent }}>{error}</p>
            <button
              onClick={loadWorlds}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                backgroundColor: currentTheme.colors.accent,
                border: 'none',
                borderRadius: '4px',
                color: currentTheme.colors.accentText,
                fontFamily: currentTheme.fonts.secondary,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && worlds.length === 0 && !showCreateForm && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            border: `2px solid ${currentTheme.colors.border}`,
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            <p style={{ marginBottom: '20px' }}>No worlds yet. Create your first world to begin!</p>
          </div>
        )}

        {!loading && !error && worlds.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Your Worlds</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {worlds.map((world) => (
                <button
                  key={world.id}
                  onClick={() => handleSelectWorld(world.id)}
                  style={{
                    padding: '20px',
                    backgroundColor: currentTheme.colors.backgroundSecondary,
                    border: `2px solid ${currentTheme.colors.border}`,
                    borderRadius: '8px',
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.primary,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = currentTheme.colors.accent;
                    e.currentTarget.style.backgroundColor = currentTheme.colors.background;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = currentTheme.colors.border;
                    e.currentTarget.style.backgroundColor = currentTheme.colors.backgroundSecondary;
                  }}
                >
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}>
                    {world.name}
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    opacity: 0.7,
                  }}>
                    Last played: {formatDate(world.lastPlayedAt)}
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    opacity: 0.7,
                  }}>
                    Created: {formatDate(world.createdAt)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              width: '100%',
              padding: '20px',
              backgroundColor: currentTheme.colors.accent,
              border: 'none',
              borderRadius: '8px',
              color: currentTheme.colors.accentText,
              fontFamily: currentTheme.fonts.primary,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            + Create New World
          </button>
        ) : (
          <div style={{
            padding: '20px',
            border: `2px solid ${currentTheme.colors.border}`,
            borderRadius: '8px',
            backgroundColor: currentTheme.colors.backgroundSecondary,
          }}>
            <h3 style={{ marginBottom: '15px' }}>Create New World</h3>
            <form onSubmit={handleCreateWorld}>
              <input
                type="text"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="Enter world name..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: currentTheme.colors.inputBackground,
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: '4px',
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.secondary,
                  fontSize: '16px',
                  marginBottom: '15px',
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={!newWorldName.trim() || creating}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: currentTheme.colors.accent,
                    border: 'none',
                    borderRadius: '4px',
                    color: currentTheme.colors.accentText,
                    fontFamily: currentTheme.fonts.secondary,
                    fontWeight: 'bold',
                    cursor: creating || !newWorldName.trim() ? 'not-allowed' : 'pointer',
                    opacity: creating || !newWorldName.trim() ? 0.5 : 1,
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewWorldName('');
                  }}
                  disabled={creating}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'transparent',
                    border: `2px solid ${currentTheme.colors.border}`,
                    borderRadius: '4px',
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.secondary,
                    fontWeight: 'bold',
                    cursor: creating ? 'not-allowed' : 'pointer',
                    opacity: creating ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

