import { BoardState, MoveResult, PlayerId } from '../types';

// ============================================================
// KONSTANTA POSISI PAPAN
// ============================================================
export const TOTAL_PITS = 16;
export const SEEDS_PER_HOLE = 7;

export const P1_HOLES = [0, 1, 2, 3, 4, 5, 6];
export const P2_HOLES = [8, 9, 10, 11, 12, 13, 14];
export const P1_STORE = 7;
export const P2_STORE = 15;

// ============================================================
// SETUP
// ============================================================
export function createInitialBoard(): BoardState {
  const board = new Array(TOTAL_PITS).fill(0);
  for (const i of P1_HOLES) board[i] = SEEDS_PER_HOLE;
  for (const i of P2_HOLES) board[i] = SEEDS_PER_HOLE;
  board[P1_STORE] = 0;
  board[P2_STORE] = 0;
  return board;
}

export function ownStoreIndex(player: PlayerId): number {
  return player === 1 ? P1_STORE : P2_STORE;
}

export function opponentStoreIndex(player: PlayerId): number {
  return player === 1 ? P2_STORE : P1_STORE;
}

export function holesOf(player: PlayerId): number[] {
  return player === 1 ? P1_HOLES : P2_HOLES;
}

export function isOwnHole(index: number, player: PlayerId): boolean {
  return holesOf(player).includes(index);
}

export function isStoreIndex(index: number): boolean {
  return index === P1_STORE || index === P2_STORE;
}

// Lubang yang berhadapan langsung (dipakai untuk mekanik "nembak")
export function oppositeIndex(index: number): number {
  return 14 - index;
}

// Index selanjutnya searah counter-clockwise, melompati lumbung lawan
function nextIndex(index: number, player: PlayerId): number {
  let n = (index + 1) % TOTAL_PITS;
  if (player === 1 && n === P2_STORE) {
    n = (n + 1) % TOTAL_PITS;
  } else if (player === 2 && n === P1_STORE) {
    n = (n + 1) % TOTAL_PITS;
  }
  return n;
}

// ============================================================
// VALID MOVES
// ============================================================
export function getValidMoves(board: BoardState, player: PlayerId): number[] {
  return holesOf(player).filter((i) => board[i] > 0);
}

export function hasValidMoves(board: BoardState, player: PlayerId): boolean {
  return getValidMoves(board, player).length > 0;
}

// ============================================================
// MEKANIK UTAMA: SOW (menyebar biji dari satu lubang)
// Menangani: giliran ekstra, panen beruntun ("lanjut"), nembak, dan mati biasa.
// ============================================================
export function sowSeeds(inputBoard: BoardState, startPit: number, player: PlayerId): MoveResult {
  const board = [...inputBoard];
  const path: number[] = [];
  const captureIndexes: number[] = [];
  let captured = 0;
  let chained = false;
  let firstLap = true;

  let seeds = board[startPit];
  board[startPit] = 0;
  let idx = startPit;

  let extraTurn = false;
  let done = false;

  while (!done) {
    while (seeds > 0) {
      idx = nextIndex(idx, player);
      board[idx] += 1;
      seeds -= 1;
      path.push(idx);
    }

    if (idx === ownStoreIndex(player)) {
      // Kondisi (a): biji terakhir jatuh di lumbung sendiri -> giliran ekstra
      extraTurn = true;
      done = true;
    } else {
      // idx pasti lubang kecil (bukan store, karena store lawan dilompati)
      if (board[idx] > 1) {
        // Kondisi (b): lubang sudah berisi -> ambil semua, lanjutkan sebar (panen beruntun)
        chained = true;
        seeds = board[idx];
        board[idx] = 0;
        firstLap = false;
        // loop luar berlanjut, menyebar lagi dari idx
      } else {
        // board[idx] === 1 -> lubang tadinya kosong sebelum biji terakhir jatuh
        if (isOwnHole(idx, player)) {
          // Kondisi (c): "Nembak" - lubang kosong milik sendiri
          const oppIdx = oppositeIndex(idx);
          const seedsCaptured = board[oppIdx] + board[idx];
          if (board[oppIdx] > 0) {
            captureIndexes.push(idx, oppIdx);
          }
          board[oppIdx] = 0;
          board[idx] = 0;
          board[ownStoreIndex(player)] += seedsCaptured;
          captured = seedsCaptured;
        }
        // Kondisi (d): lubang kosong milik lawan -> mati biasa, tidak ada aksi tambahan
        done = true;
      }
    }
  }

  return {
    board,
    extraTurn,
    captured,
    captureIndexes,
    path,
    landedIndex: idx,
    chained,
  };
}

// ============================================================
// KONDISI AKHIR PERMAINAN
// ============================================================
export interface EndCheckResult {
  isOver: boolean;
  board: BoardState;
}

// Dipanggil setelah setiap langkah selesai (giliran benar-benar berpindah / atau tetap).
// Jika salah satu sisi kehabisan biji, sapu sisa biji lawan ke lumbung lawan tersebut.
export function checkAndSweepIfOver(inputBoard: BoardState): EndCheckResult {
  const board = [...inputBoard];
  const p1Empty = P1_HOLES.every((i) => board[i] === 0);
  const p2Empty = P2_HOLES.every((i) => board[i] === 0);

  if (!p1Empty && !p2Empty) {
    return { isOver: false, board };
  }

  if (p1Empty && !p2Empty) {
    // P1 kehabisan biji -> sisa biji P2 masuk ke lumbung P2 sendiri
    let sum = 0;
    for (const i of P2_HOLES) {
      sum += board[i];
      board[i] = 0;
    }
    board[P2_STORE] += sum;
  } else if (p2Empty && !p1Empty) {
    let sum = 0;
    for (const i of P1_HOLES) {
      sum += board[i];
      board[i] = 0;
    }
    board[P1_STORE] += sum;
  }
  // jika keduanya kosong sekaligus, tidak ada yang perlu disapu

  return { isOver: true, board };
}

export function getWinner(board: BoardState): PlayerId | 'draw' {
  if (board[P1_STORE] > board[P2_STORE]) return 1;
  if (board[P2_STORE] > board[P1_STORE]) return 2;
  return 'draw';
}

export function totalSeeds(board: BoardState, player: PlayerId): number {
  return holesOf(player).reduce((sum, i) => sum + board[i], 0);
}
