import { useCallback, useReducer, useRef } from 'react';
import {
  AIDifficulty,
  GameMode,
  GameState,
  HistoryEntry,
  PlayerId,
  ToastMessage,
  ToastType,
} from '../types';
import { checkAndSweepIfOver, createInitialBoard, getWinner, sowSeeds } from '../utils/gameEngine';

const MAX_HISTORY = 20;

type Action =
  | { type: 'START_GAME'; mode: GameMode; aiDifficulty?: AIDifficulty; aiPlayer?: PlayerId }
  | { type: 'SELECT_PIT'; pit: number }
  | { type: 'MOVE'; pit: number; player: PlayerId }
  | { type: 'SET_ANIMATING'; value: boolean }
  | { type: 'SET_AI_THINKING'; value: boolean }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'GO_TO_MENU' }
  | { type: 'TOGGLE_DARK_MODE' };

function createInitialState(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 1,
    mode: 'menu',
    aiDifficulty: 'easy',
    aiPlayer: 2,
    gameOver: false,
    winner: null,
    selectedPit: null,
    lastMove: null,
    isAnimating: false,
    isAIThinking: false,
    history: [],
    stats: {
      startTime: Date.now(),
      endTime: null,
      totalNembak: 0,
      totalSeedsSown: 0,
    },
    darkMode: false,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      return {
        ...createInitialState(),
        darkMode: state.darkMode,
        mode: action.mode,
        aiDifficulty: action.aiDifficulty ?? 'easy',
        aiPlayer: action.aiPlayer ?? 2,
        stats: {
          startTime: Date.now(),
          endTime: null,
          totalNembak: 0,
          totalSeedsSown: 0,
        },
      };
    }

    case 'SELECT_PIT': {
      if (state.gameOver || state.isAnimating || state.isAIThinking) return state;
      return { ...state, selectedPit: action.pit };
    }

    case 'MOVE': {
      if (state.gameOver || state.isAnimating) return state;

      const historyEntry: HistoryEntry = {
        board: [...state.board],
        currentPlayer: state.currentPlayer,
        stats: { ...state.stats },
      };
      const newHistory = [...state.history, historyEntry].slice(-MAX_HISTORY);

      const result = sowSeeds(state.board, action.pit, action.player);
      let board = result.board;

      // checkAndSweepIfOver mendeteksi jika salah satu sisi papan sudah kosong
      // (ini otomatis mencakup kasus "pemain berikutnya tidak punya langkah valid").
      const { isOver, board: sweptBoard } = checkAndSweepIfOver(board);
      const gameOver = isOver;
      if (isOver) {
        board = sweptBoard;
      }

      const nextPlayer: PlayerId = result.extraTurn
        ? action.player
        : action.player === 1
        ? 2
        : 1;

      const winner = gameOver ? getWinner(board) : null;

      return {
        ...state,
        board,
        currentPlayer: nextPlayer,
        selectedPit: null,
        lastMove: {
          player: action.player,
          startPit: action.pit,
          path: result.path,
          landedIndex: result.landedIndex,
          extraTurn: result.extraTurn,
          captured: result.captured,
          captureIndexes: result.captureIndexes,
          chained: result.chained,
        },
        gameOver,
        winner,
        history: newHistory,
        stats: {
          ...state.stats,
          endTime: gameOver ? Date.now() : null,
          totalNembak: state.stats.totalNembak + (result.captured > 0 ? 1 : 0),
          totalSeedsSown: state.stats.totalSeedsSown + result.path.length,
        },
      };
    }

    case 'SET_ANIMATING':
      return { ...state, isAnimating: action.value };

    case 'SET_AI_THINKING':
      return { ...state, isAIThinking: action.value };

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        board: prev.board,
        currentPlayer: prev.currentPlayer,
        stats: prev.stats,
        history: state.history.slice(0, -1),
        selectedPit: null,
        lastMove: null,
        gameOver: false,
        winner: null,
        isAnimating: false,
        isAIThinking: false,
      };
    }

    case 'RESET': {
      return {
        ...createInitialState(),
        darkMode: state.darkMode,
        mode: state.mode,
        aiDifficulty: state.aiDifficulty,
        aiPlayer: state.aiPlayer,
      };
    }

    case 'GO_TO_MENU': {
      return {
        ...createInitialState(),
        darkMode: state.darkMode,
        mode: 'menu',
      };
    }

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };

    default:
      return state;
  }
}

export function useGameLogic() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const toastIdRef = useRef(0);
  const [toasts, setToasts] = useReducer(
    (list: ToastMessage[], action: { type: 'add' | 'remove'; toast?: ToastMessage; id?: number }) => {
      if (action.type === 'add' && action.toast) return [...list, action.toast];
      if (action.type === 'remove') return list.filter((t) => t.id !== action.id);
      return list;
    },
    []
  );

  const pushToast = useCallback((text: string, type: ToastType = 'info') => {
    const id = toastIdRef.current++;
    setToasts({ type: 'add', toast: { id, text, type } });
    window.setTimeout(() => {
      setToasts({ type: 'remove', id });
    }, 2000);
  }, []);

  const startGame = useCallback(
    (mode: GameMode, aiDifficulty?: AIDifficulty, aiPlayer?: PlayerId) => {
      dispatch({ type: 'START_GAME', mode, aiDifficulty, aiPlayer });
    },
    []
  );

  const selectPit = useCallback((pit: number) => {
    dispatch({ type: 'SELECT_PIT', pit });
  }, []);

  const makeMove = useCallback((pit: number, player: PlayerId) => {
    dispatch({ type: 'MOVE', pit, player });
  }, []);

  const setAnimating = useCallback((value: boolean) => {
    dispatch({ type: 'SET_ANIMATING', value });
  }, []);

  const setAIThinking = useCallback((value: boolean) => {
    dispatch({ type: 'SET_AI_THINKING', value });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const goToMenu = useCallback(() => {
    dispatch({ type: 'GO_TO_MENU' });
  }, []);

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, []);

  return {
    state,
    toasts,
    pushToast,
    startGame,
    selectPit,
    makeMove,
    setAnimating,
    setAIThinking,
    undo,
    resetGame,
    goToMenu,
    toggleDarkMode,
  };
}
