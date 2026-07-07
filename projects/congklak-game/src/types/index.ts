// ============================================================
// TYPES: Congklak (Sungka / Mancala)
// ============================================================
// Representasi papan: array 16 posisi, indeks searah pergerakan
// biji (counter-clockwise):
//   0-6   : 7 lubang milik Player 1 (baris bawah)
//   7     : Lumbung (store) Player 1
//   8-14  : 7 lubang milik Player 2 (baris atas)
//   15    : Lumbung (store) Player 2
// ============================================================

export type PlayerId = 1 | 2;

export type BoardState = number[]; // panjang 16

export type GameMode = 'menu' | 'pvp' | 'pve';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export interface LastMoveInfo {
  player: PlayerId;
  startPit: number;
  path: number[]; // urutan lubang yang dilalui (untuk animasi)
  landedIndex: number;
  extraTurn: boolean;
  captured: number;
  captureIndexes: number[]; // lubang-lubang yang "ditembak" (untuk efek flash)
  chained: boolean; // apakah terjadi "panen beruntun"
}

export type ToastType = 'info' | 'success' | 'capture' | 'bonus' | 'win';

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

export interface GameStats {
  startTime: number;
  endTime: number | null;
  totalNembak: number; // jumlah kejadian "nembak" sepanjang game
  totalSeedsSown: number; // total biji yang pernah disebar (indikasi aktivitas)
}

export interface HistoryEntry {
  board: BoardState;
  currentPlayer: PlayerId;
  stats: GameStats;
}

export interface GameState {
  board: BoardState;
  currentPlayer: PlayerId;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  aiPlayer: PlayerId; // pemain mana yang dikendalikan AI (dalam mode pve)
  gameOver: boolean;
  winner: PlayerId | 'draw' | null;
  selectedPit: number | null;
  lastMove: LastMoveInfo | null;
  isAnimating: boolean;
  isAIThinking: boolean;
  history: HistoryEntry[];
  stats: GameStats;
  darkMode: boolean;
}

export interface MoveResult {
  board: BoardState;
  extraTurn: boolean;
  captured: number;
  captureIndexes: number[];
  path: number[];
  landedIndex: number;
  chained: boolean;
}
