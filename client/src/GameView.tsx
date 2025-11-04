import React from 'react';
import { useTheme } from './ThemeContext';
import { SettingsModal } from './SettingsModal';
import { GearIcon } from './GearIcon';

interface GameViewProps {
  worldId: string;
  onBackToWorlds: () => void;
}

export const GameView: React.FC<GameViewProps> = ({ worldId, onBackToWorlds }) => {
  const { currentTheme } = useTheme();
  const [message, setMessage] = React.useState('Loading...');
  const [gameStatus, setGameStatus] = React.useState<any>(null);
  const [gameOutput, setGameOutput] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [showSettings, setShowSettings] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState('');
  const [historyLoaded, setHistoryLoaded] = React.useState(false);
  const consoleEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Load conversation history when entering the world
  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/dialogue/${worldId}/history`);
        if (!response.ok) {
          throw new Error('Failed to load history');
        }
        const data = await response.json();
        
        if (data.history && data.history.length > 0) {
          // Convert history to game output format
          const historyOutput = data.history.map((entry: any) => {
            if (entry.isInput) {
              return `> ${entry.text}`;
            } else {
              return entry.text;
            }
          });
          setGameOutput(historyOutput);
        } else {
          // No history, show welcome message
          setGameOutput([
            'Welcome to the MUD game!',
            'Type "help" for available commands...'
          ]);
        }
        setHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading history:', error);
        // If history fails to load, show welcome message anyway
        setGameOutput([
          'Welcome to the MUD game!',
          'Type "help" for available commands...'
        ]);
        setHistoryLoaded(true);
      }
    };

    loadHistory();

    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage('Error connecting to server'));

    fetch('/api/game/status')
      .then((res) => res.json())
      .then((data) => setGameStatus(data))
      .catch((err) => console.error('Error fetching game status:', err));
  }, [worldId]);

  // Auto-scroll to bottom when new messages arrive or while streaming
  React.useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameOutput, streamingText]);

  // Auto-resize textarea based on content
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height based on content, with a max height
      const maxHeight = 150; // Maximum height in pixels
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleCommand = async (command: string) => {
    if (!command.trim() || isGenerating) return;

    // Add user input to output
    setGameOutput(prev => [...prev, `> ${command}`]);
    
    // Save player input to database
    try {
      await fetch(`/api/dialogue/${worldId}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isInput: true,
          text: command,
        }),
      });
    } catch (err) {
      console.error('Failed to log player input:', err);
      // Continue anyway - don't block gameplay
    }

    // Check if this is a special command
    const normalizedCommand = command.trim().toLowerCase();
    const specialCommands = ['inventory', 'map', 'stats', 'help'];
    
    if (specialCommands.includes(normalizedCommand)) {
      // Handle special command
      setIsGenerating(true);
      
      try {
        const response = await fetch(`/api/commands/${worldId}/special`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command: normalizedCommand }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        setGameOutput(prev => [...prev, data.response]);
        
        // Save system response to database
        try {
          await fetch(`/api/dialogue/${worldId}/log`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              isInput: false,
              text: data.response,
            }),
          });
        } catch (err) {
          console.error('Failed to log system response:', err);
        }
      } catch (err) {
        setGameOutput(prev => [...prev, 'Error: Could not process command']);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Default: send to LLM for processing
    setIsGenerating(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/game/command-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, worldId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              setGameOutput(prev => [...prev, `Error: ${data.error}`]);
              setIsGenerating(false);
              setStreamingText('');
              return;
            }
            
            if (data.done) {
              // Finished streaming, add the complete text to output
              setGameOutput(prev => [...prev, fullText]);
              setIsGenerating(false);
              setStreamingText('');
              
              // Save system response to database
              try {
                await fetch(`/api/dialogue/${worldId}/log`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    isInput: false,
                    text: fullText,
                  }),
                });
              } catch (err) {
                console.error('Failed to log system response:', err);
                // Continue anyway
              }
              return;
            }
            
            if (data.chunk) {
              fullText += data.chunk;
              setStreamingText(fullText);
            }
          }
        }
      }
    } catch (err) {
      setGameOutput(prev => [...prev, 'Error: Could not connect to server']);
      setIsGenerating(false);
      setStreamingText('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputValue;
    setInputValue('');
    await handleCommand(command);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isGenerating) {
        const command = inputValue;
        setInputValue('');
        handleCommand(command);
      }
    }
    // Allow Shift+Enter for new lines
  };

  return (
    <div style={{ 
      fontFamily: currentTheme.fonts.primary, 
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Back Button */}
      <button
        onClick={onBackToWorlds}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'none',
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '4px',
          padding: '10px 20px',
          cursor: 'pointer',
          color: currentTheme.colors.text,
          fontFamily: currentTheme.fonts.secondary,
          fontWeight: 'bold',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = currentTheme.colors.backgroundSecondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Back to World Selection"
      >
        ← Worlds
      </button>

      {/* Settings Gear Icon */}
      <button
        onClick={() => setShowSettings(true)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: `2px solid ${currentTheme.colors.border}`,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: currentTheme.colors.text,
          transition: 'transform 0.3s',
          padding: '0',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotate(90deg)';
          e.currentTarget.style.backgroundColor = currentTheme.colors.backgroundSecondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotate(0deg)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Settings"
      >
        <GearIcon size={24} color={currentTheme.colors.border} />
      </button>

      {/* Content area - scrollable */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        paddingTop: '80px', // Extra space for buttons
        paddingBottom: '20px',
      }}>
        <h1>🎮 MUD Game</h1>
        
        <div style={{ 
          border: `2px solid ${currentTheme.colors.border}`,
          padding: '20px',
          marginTop: '20px',
          borderRadius: '8px'
        }}>
          <h2>Server Status</h2>
          <p>{message}</p>
          {gameStatus && (
            <div>
              <p>Status: {gameStatus.status}</p>
              <p>Players Online: {gameStatus.players}</p>
              <p>Server Uptime: {Math.floor(gameStatus.uptime)} seconds</p>
            </div>
          )}
        </div>
        
        <div style={{ 
          border: `2px solid ${currentTheme.colors.border}`,
          padding: '20px',
          marginTop: '20px',
          borderRadius: '8px',
          minHeight: '400px'
        }}>
          <h2>Game Console</h2>
          <div style={{ 
            marginTop: '10px',
          }}>
            {gameOutput.map((line, idx) => (
              <p key={idx} style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>{line}</p>
            ))}
            {isGenerating && (
              <p style={{ 
                margin: '5px 0', 
                fontStyle: 'italic',
                color: currentTheme.colors.accent,
                whiteSpace: 'pre-wrap'
              }}>
                {streamingText || 'Generating response...'}
              </p>
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed input at the bottom */}
      <div style={{
        padding: '20px',
        backgroundColor: currentTheme.colors.background,
        borderTop: `2px solid ${currentTheme.colors.border}`,
        position: 'sticky',
        bottom: 0,
      }}>
        {/* Special command buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '15px',
          flexWrap: 'wrap'
        }}>
          {['Inventory', 'Map', 'Stats', 'Help'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              disabled={isGenerating}
              style={{
                padding: '8px 16px',
                backgroundColor: currentTheme.colors.backgroundSecondary,
                border: `1px solid ${currentTheme.colors.border}`,
                borderRadius: '4px',
                color: currentTheme.colors.text,
                fontFamily: currentTheme.fonts.secondary,
                fontWeight: 'bold',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: isGenerating ? 0.5 : 1,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = currentTheme.colors.accent;
                  e.currentTarget.style.color = currentTheme.colors.accentText;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = currentTheme.colors.backgroundSecondary;
                e.currentTarget.style.color = currentTheme.colors.text;
              }}
            >
              {cmd}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command... (Shift+Enter for new line)"
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: currentTheme.colors.inputBackground,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: '4px',
              color: currentTheme.colors.text,
              fontFamily: currentTheme.fonts.secondary,
              fontSize: '14px',
              resize: 'none',
              overflow: 'auto',
              minHeight: '42px',
              maxHeight: '150px',
              lineHeight: '1.5'
            }}
          />
          <button
            type="submit"
            disabled={isGenerating}
            style={{
              padding: '10px 20px',
              backgroundColor: currentTheme.colors.accent,
              border: 'none',
              borderRadius: '4px',
              color: currentTheme.colors.accentText,
              fontFamily: currentTheme.fonts.secondary,
              fontWeight: 'bold',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isGenerating ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </form>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

