import { useState } from 'react';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { GameState } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('lobby');

  const startGame = () => {
    setGameState('playing');
  };

  const handleGameOver = (winner: string) => {
    // Show game over logic is handled within the Game component via overlay
    // But we could extend this for a global tournament leaderboards etc.
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-black select-none font-sans">
      {gameState === 'lobby' ? (
        <Lobby onStart={startGame} />
      ) : (
        <Game onGameOver={handleGameOver} />
      )}

      {/* Global Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.1),_transparent)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_rgba(239,68,68,0.1),_transparent)]" />
      </div>
    </main>
  );
}

