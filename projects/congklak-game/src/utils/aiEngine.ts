import { AIDifficulty, BoardState, PlayerId } from '../types';
import {
  checkAndSweepIfOver,
  getValidMoves,
  hasValidMoves,
  P1_HOLES,
  P1_STORE,
  P2_HOLES,
  P2_STORE,
  sowSeeds,
  totalSeeds,
} from './gameEngine';

const MINIMAX_DEPTH = 4;

// ============================================================
// EASY: pilih lubang valid secara acak
// ============================================================
export function chooseEasyMove(board: BoardState, player: PlayerId): number {
  const moves = getValidMoves(board, player);
  const idx = Math.floor(Math.random() * moves.length);
  return moves[idx];
}

// ============================================================
// NORMAL: Greedy
// Prioritas 1: giliran ekstra (biji terakhir jatuh di lumbung sendiri)
// Prioritas 2: bisa menembak (capture) biji lawan
// Prioritas 3: acak
// Tie-break: pilih yang paling kiri (index terkecil)
// ============================================================
export function chooseNormalMove(board: BoardState, player: PlayerId): number {
  const moves = getValidMoves(board, player).sort((a, b) => a - b);

  const extraTurnMoves: number[] = [];
  const captureMoves: { pit: number; captured: number }[] = [];

  for (const pit of moves) {
    const result = sowSeeds(board, pit, player);
    if (result.extraTurn) {
      extraTurnMoves.push(pit);
    } else if (result.captured > 0) {
      captureMoves.push({ pit, captured: result.captured });
    }
  }

  if (extraTurnMoves.length > 0) {
    return extraTurnMoves[0]; // paling kiri
  }

  if (captureMoves.length > 0) {
    // pilih capture terbanyak; jika seri, paling kiri (sudah terurut dari loop kiri->kanan)
    let best = captureMoves[0];
    for (const c of captureMoves) {
      if (c.captured > best.captured) best = c;
    }
    return best.pit;
  }

  // acak dari sisa
  return moves[Math.floor(Math.random() * moves.length)];
}

// ============================================================
// HARD: Minimax + Alpha-Beta Pruning, depth = 4
// Eval = (storeAI*3) + (sumHolesAI*1) - (storePlayer*2) - (sumHolesPlayer*0.5)
// ============================================================
function evaluateBoard(board: BoardState, aiPlayer: PlayerId): number {
  const humanPlayer: PlayerId = aiPlayer === 1 ? 2 : 1;
  const storeAI = board[aiPlayer === 1 ? P1_STORE : P2_STORE];
  const storeHuman = board[humanPlayer === 1 ? P1_STORE : P2_STORE];
  const holesAI = totalSeeds(board, aiPlayer);
  const holesHuman = totalSeeds(board, humanPlayer);

  return storeAI * 3 + holesAI * 1 - storeHuman * 2 - holesHuman * 0.5;
}

interface MinimaxResult {
  score: number;
  pit: number | null;
}

function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  playerToMove: PlayerId,
  aiPlayer: PlayerId,
  maximizing: boolean
): MinimaxResult {
  const p1Empty = P1_HOLES.every((i) => board[i] === 0);
  const p2Empty = P2_HOLES.every((i) => board[i] === 0);
  const gameOver = p1Empty || p2Empty;

  if (depth === 0 || gameOver) {
    let finalBoard = board;
    if (gameOver) {
      finalBoard = checkAndSweepIfOver(board).board;
    }
    return { score: evaluateBoard(finalBoard, aiPlayer), pit: null };
  }

  const moves = getValidMoves(board, playerToMove);
  if (moves.length === 0) {
    return { score: evaluateBoard(board, aiPlayer), pit: null };
  }

  let bestPit: number | null = moves[0];

  if (maximizing) {
    let maxEval = -Infinity;
    for (const pit of moves) {
      const result = sowSeeds(board, pit, playerToMove);
      let nextBoard = result.board;
      let nextPlayer: PlayerId = playerToMove;
      let nextMaximizing: boolean = maximizing;

      if (!result.extraTurn) {
        nextPlayer = playerToMove === 1 ? 2 : 1;
        nextMaximizing = !maximizing;
      }

      // cek apakah permainan berakhir setelah langkah ini
      const p1EmptyAfter = P1_HOLES.every((i) => nextBoard[i] === 0);
      const p2EmptyAfter = P2_HOLES.every((i) => nextBoard[i] === 0);
      if (p1EmptyAfter || p2EmptyAfter) {
        nextBoard = checkAndSweepIfOver(nextBoard).board;
      } else if (!hasValidMoves(nextBoard, nextPlayer)) {
        nextBoard = checkAndSweepIfOver(nextBoard).board;
      }

      const evalResult = minimax(
        nextBoard,
        depth - 1,
        alpha,
        beta,
        nextPlayer,
        aiPlayer,
        nextMaximizing
      );

      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestPit = pit;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break; // pruning
    }
    return { score: maxEval, pit: bestPit };
  } else {
    let minEval = Infinity;
    for (const pit of moves) {
      const result = sowSeeds(board, pit, playerToMove);
      let nextBoard = result.board;
      let nextPlayer: PlayerId = playerToMove;
      let nextMaximizing: boolean = maximizing;

      if (!result.extraTurn) {
        nextPlayer = playerToMove === 1 ? 2 : 1;
        nextMaximizing = !maximizing;
      }

      const p1EmptyAfter = P1_HOLES.every((i) => nextBoard[i] === 0);
      const p2EmptyAfter = P2_HOLES.every((i) => nextBoard[i] === 0);
      if (p1EmptyAfter || p2EmptyAfter) {
        nextBoard = checkAndSweepIfOver(nextBoard).board;
      } else if (!hasValidMoves(nextBoard, nextPlayer)) {
        nextBoard = checkAndSweepIfOver(nextBoard).board;
      }

      const evalResult = minimax(
        nextBoard,
        depth - 1,
        alpha,
        beta,
        nextPlayer,
        aiPlayer,
        nextMaximizing
      );

      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestPit = pit;
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break; // pruning
    }
    return { score: minEval, pit: bestPit };
  }
}

export function chooseHardMove(board: BoardState, player: PlayerId): number {
  const result = minimax(board, MINIMAX_DEPTH, -Infinity, Infinity, player, player, true);
  return result.pit ?? getValidMoves(board, player)[0];
}

// ============================================================
// ENTRY POINT
// ============================================================
export function chooseAIMove(board: BoardState, player: PlayerId, difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return chooseEasyMove(board, player);
    case 'normal':
      return chooseNormalMove(board, player);
    case 'hard':
      return chooseHardMove(board, player);
    default:
      return chooseEasyMove(board, player);
  }
}

export function getAIMoveDelay(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 500;
    case 'normal':
      return 700;
    case 'hard':
      return 1000;
    default:
      return 500;
  }
}
