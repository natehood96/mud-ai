import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ThemeProvider } from './ThemeContext';
import { WorldSelection } from './WorldSelection';
import { GameView } from './GameView';

const App = () => {
  const [selectedWorldId, setSelectedWorldId] = React.useState<string | null>(null);

  const handleWorldSelected = (worldId: string) => {
    setSelectedWorldId(worldId);
  };

  const handleBackToWorlds = () => {
    setSelectedWorldId(null);
  };

  return (
    <>
      {selectedWorldId === null ? (
        <WorldSelection onWorldSelected={handleWorldSelected} />
      ) : (
        <GameView worldId={selectedWorldId} onBackToWorlds={handleBackToWorlds} />
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

