import { motion } from 'framer-motion';
import { GameState, PlayerId } from '../types';
import { P1_HOLES, P1_STORE, P2_HOLES, P2_STORE } from '../utils/gameEngine';
import Hole from './Hole';
import Store from './Store';

interface BoardProps {
  state: GameState;
  aiHighlightPit: number | null;
  onHoleClick: (pit: number) => void;
  onReset: () => void;
  onGoToMenu: () => void;
  onUndo: () => void;
  onToggleDarkMode: () => void;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function Board({
  state,
  aiHighlightPit,
  onHoleClick,
  onReset,
  onGoToMenu,
  onUndo,
  onToggleDarkMode,
}: BoardProps) {
  const { board, currentPlayer, selectedPit, lastMove, gameOver, winner, mode, aiPlayer, stats } =
    state;

  const isHumanTurn = mode === 'pvp' || currentPlayer !== aiPlayer;
  const canInteract = !gameOver && !state.isAnimating && !state.isAIThinking && isHumanTurn;

  function isSelectable(pit: number, owner: PlayerId) {
    return canInteract && owner === currentPlayer && board[pit] > 0;
  }

  const flashSet = new Set(lastMove?.captureIndexes ?? []);

  const topRowIndexes = [...P2_HOLES].reverse(); // 14..8, agar sejajar dengan pasangan lawan

  return (
    <div className="min-h-screen w-full bg-board flex flex-col items-center justify-center p-3 gap-4 relative overflow-hidden">
      {/* Tombol kontrol kiri atas */}
      <div className="fixed top-4 left-4 z-40 flex gap-2">
        <button
          onClick={onReset}
          title="Reset Game"
          className="w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center text-lg hover:bg-neutral-700 transition shadow-md"
        >
          ↻
        </button>
        <button
          onClick={onGoToMenu}
          title="Kembali ke Menu"
          className="w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center text-lg hover:bg-neutral-700 transition shadow-md"
        >
          ⌂
        </button>
        <button
          onClick={onUndo}
          disabled={state.history.length === 0}
          title="Undo"
          className="w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center text-lg hover:bg-neutral-700 transition shadow-md disabled:opacity-40"
        >
          ⤺
        </button>
      </div>

      {/* Dark mode toggle kanan bawah */}
      <button
        onClick={onToggleDarkMode}
        title="Dark mode"
        className="fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition shadow-md"
      >
        {state.darkMode ? '☀️' : '🌙'}
      </button>

      {/* Indikator giliran */}
      {!gameOver && (
        <div
          className={[
            'px-4 py-1.5 rounded-full font-bold text-sm border-2',
            currentPlayer === 1
              ? 'bg-blue-500/20 border-blue-400 text-blue-100'
              : 'bg-pink-500/20 border-pink-400 text-pink-100',
            'animate-pulseBorder',
          ].join(' ')}
        >
          {state.isAIThinking
            ? `AI (P${currentPlayer}) sedang berpikir...`
            : `Giliran: Player ${currentPlayer}`}
        </div>
      )}

      {/* PAPAN */}
      <div className="flex items-center gap-2 md:gap-4">
        <Store player={2} seeds={board[P2_STORE]} isActive={currentPlayer === 2 && !gameOver} />

        <div className="flex flex-col gap-3 md:gap-4">
          {/* Baris atas: Player 2 (indeks 14 -> 8 agar sejajar dgn pasangan lawannya) */}
          <div className="flex gap-2 md:gap-3">
            {topRowIndexes.map((idx) => (
              <Hole
                key={idx}
                index={idx}
                seeds={board[idx]}
                isSelected={selectedPit === idx}
                isSelectable={isSelectable(idx, 2)}
                isFlashing={flashSet.has(idx)}
                isAIHighlighted={aiHighlightPit === idx}
                onClick={() => onHoleClick(idx)}
              />
            ))}
          </div>

          {/* Baris bawah: Player 1 (indeks 0 -> 6) */}
          <div className="flex gap-2 md:gap-3">
            {P1_HOLES.map((idx) => (
              <Hole
                key={idx}
                index={idx}
                seeds={board[idx]}
                isSelected={selectedPit === idx}
                isSelectable={isSelectable(idx, 1)}
                isFlashing={flashSet.has(idx)}
                isAIHighlighted={aiHighlightPit === idx}
                onClick={() => onHoleClick(idx)}
              />
            ))}
          </div>
        </div>

        <Store player={1} seeds={board[P1_STORE]} isActive={currentPlayer === 1 && !gameOver} />
      </div>

      {/* LAYAR MENANG */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900 border-2 border-store rounded-2xl p-8 max-w-sm w-full text-center flex flex-col gap-4"
          >
            <h2 className="text-3xl font-decorative text-store">
              {winner === 'draw' ? 'Draw!' : `Player ${winner} Menang!`}
            </h2>
            <div className="flex justify-around text-white">
              <div>
                <p className="text-sm text-neutral-400">P1 Store</p>
                <p className="text-2xl font-bold">{board[P1_STORE]}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">P2 Store</p>
                <p className="text-2xl font-bold">{board[P2_STORE]}</p>
              </div>
            </div>
            <div className="text-neutral-300 text-sm text-left bg-neutral-800 rounded-lg p-3 flex flex-col gap-1">
              <p>Total biji di papan: {board[P1_STORE] + board[P2_STORE]}</p>
              <p>Jumlah "nembak": {stats.totalNembak}</p>
              <p>
                Durasi permainan:{' '}
                {formatDuration((stats.endTime ?? Date.now()) - stats.startTime)}
              </p>
            </div>
            <div className="flex gap-3 justify-center mt-2">
              <button
                onClick={onReset}
                className="px-5 py-2 rounded-lg bg-store text-amber-950 font-bold hover:brightness-110 transition"
              >
                Main Lagi
              </button>
              <button
                onClick={onGoToMenu}
                className="px-5 py-2 rounded-lg bg-neutral-700 text-white font-bold hover:bg-neutral-600 transition"
              >
                Menu Utama
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
