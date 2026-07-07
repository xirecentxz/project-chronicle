import { useEffect, useRef, useState } from 'react';
import { GameState, PlayerId } from '../types';
import { chooseAIMove, getAIMoveDelay } from '../utils/aiEngine';

interface UseAIParams {
  state: GameState;
  makeMove: (pit: number, player: PlayerId) => void;
  setAIThinking: (value: boolean) => void;
  pushToast: (text: string, type?: 'info' | 'success' | 'capture' | 'bonus' | 'win') => void;
}

/**
 * Mengelola giliran AI: menentukan langkah, menampilkan highlight sesaat,
 * lalu mengeksekusi gerakan setelah delay sesuai tingkat kesulitan.
 */
export function useAI({ state, makeMove, setAIThinking, pushToast }: UseAIParams) {
  const [aiHighlightPit, setAIHighlightPit] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    // bersihkan timeout lama saat state berubah drastis (reset/menu)
    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [state.mode]);

  useEffect(() => {
    if (state.mode !== 'pve') return;
    if (state.gameOver) return;
    if (state.currentPlayer !== state.aiPlayer) return;
    if (state.isAIThinking) return;
    if (state.isAnimating) return;

    setAIThinking(true);
    const delay = getAIMoveDelay(state.aiDifficulty);
    const pit = chooseAIMove(state.board, state.aiPlayer, state.aiDifficulty);

    // Tahap 1: highlight lubang yang akan dipilih AI selama 0.5s sebelum bergerak
    const highlightDelay = Math.max(delay - 500, 0);
    const t1 = window.setTimeout(() => {
      setAIHighlightPit(pit);
    }, highlightDelay);

    const t2 = window.setTimeout(() => {
      setAIHighlightPit(null);
      makeMove(pit, state.aiPlayer);
      setAIThinking(false);
    }, delay);

    timeoutsRef.current.push(t1, t2);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPlayer, state.mode, state.gameOver, state.board]);

  return { aiHighlightPit };
}
