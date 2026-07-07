import { useEffect, useRef } from 'react';
import Menu from './components/Menu';
import Board from './components/Board';
import Toast from './components/Toast';
import LandscapeOverlay from './components/LandscapeOverlay';
import { useGameLogic } from './hooks/useGameLogic';
import { useAI } from './hooks/useAI';
import { sound } from './utils/sound';
import { AIDifficulty, PlayerId } from './types';

export default function App() {
  const {
    state,
    toasts,
    pushToast,
    startGame,
    makeMove,
    setAnimating,
    setAIThinking,
    undo,
    resetGame,
    goToMenu,
    toggleDarkMode,
  } = useGameLogic();

  const { aiHighlightPit } = useAI({ state, makeMove, setAIThinking, pushToast });

  const lastMoveRef = useRef(state.lastMove);
  const lastGameOverRef = useRef(false);

  // Dark mode: toggle class di root document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  // Toast + suara berdasarkan hasil langkah terakhir
  useEffect(() => {
    if (state.lastMove && state.lastMove !== lastMoveRef.current) {
      lastMoveRef.current = state.lastMove;
      const { extraTurn, captured } = state.lastMove;

      if (extraTurn) {
        sound.bonus();
        pushToast('Giliran Ekstra!', 'bonus');
      } else if (captured > 0) {
        sound.capture();
        pushToast(`Nembak! +${captured} biji`, 'capture');
      } else if (!state.gameOver) {
        pushToast(`Giliran P${state.currentPlayer}`, 'info');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastMove]);

  // Toast + suara kemenangan
  useEffect(() => {
    if (state.gameOver && !lastGameOverRef.current) {
      lastGameOverRef.current = true;
      sound.win();
      pushToast(state.winner === 'draw' ? 'Draw!' : `Player ${state.winner} Menang!`, 'win');
    }
    if (!state.gameOver) {
      lastGameOverRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gameOver]);

  function handleStartPvp() {
    startGame('pvp');
  }

  function handleStartPve(difficulty: AIDifficulty) {
    // Manusia selalu Player 1, AI selalu Player 2
    startGame('pve', difficulty, 2);
  }

  function handleHoleClick(pit: number) {
    if (state.gameOver || state.isAnimating || state.isAIThinking) return;
    const owner: PlayerId = pit <= 6 ? 1 : 2;
    if (owner !== state.currentPlayer) return;
    if (state.board[pit] === 0) return;
    if (state.mode === 'pve' && state.currentPlayer === state.aiPlayer) return;

    sound.click();
    setAnimating(true);
    window.setTimeout(() => {
      makeMove(pit, state.currentPlayer);
      setAnimating(false);
    }, 300);
  }

  return (
    <div className="font-body">
      <LandscapeOverlay />
      <Toast toasts={toasts} />
      {state.mode === 'menu' ? (
        <Menu onStartPvp={handleStartPvp} onStartPve={handleStartPve} />
      ) : (
        <Board
          state={state}
          aiHighlightPit={aiHighlightPit}
          onHoleClick={handleHoleClick}
          onReset={resetGame}
          onGoToMenu={goToMenu}
          onUndo={undo}
          onToggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  );
}
