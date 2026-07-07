import { useState } from 'react';
import { motion } from 'framer-motion';
import { AIDifficulty } from '../types';

interface MenuProps {
  onStartPvp: () => void;
  onStartPve: (difficulty: AIDifficulty) => void;
}

export default function Menu({ onStartPvp, onStartPve }: MenuProps) {
  const [showDifficulty, setShowDifficulty] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-board-dark">
      {/* background papan congklak, opacity rendah */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #8B6914 0 40px, transparent 41px), radial-gradient(circle at 50% 30%, #8B6914 0 40px, transparent 41px), radial-gradient(circle at 80% 30%, #8B6914 0 40px, transparent 41px), radial-gradient(circle at 20% 70%, #8B6914 0 40px, transparent 41px), radial-gradient(circle at 50% 70%, #8B6914 0 40px, transparent 41px), radial-gradient(circle at 80% 70%, #8B6914 0 40px, transparent 41px)',
          backgroundSize: '260px 260px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="font-decorative text-6xl md:text-8xl text-store drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-wide"
        >
          CONGKLAK
        </motion.h1>
        <p className="text-neutral-200 font-body -mt-4">Sungka &middot; Mancala Tradisional</p>

        {!showDifficulty ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={onStartPvp}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-board border-2 border-store text-white font-bold text-lg hover:scale-105 transition shadow-lg"
            >
              <span className="text-2xl">🧑‍🤝‍🧑</span>
              Player vs Player
            </button>
            <button
              onClick={() => setShowDifficulty(true)}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-board border-2 border-store text-white font-bold text-lg hover:scale-105 transition shadow-lg"
            >
              <span className="text-2xl">🤖</span>
              Player vs AI
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mt-4"
          >
            <p className="text-white font-semibold">Pilih tingkat kesulitan AI:</p>
            <div className="flex gap-3">
              {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onStartPve(diff)}
                  className="px-5 py-3 rounded-lg bg-store text-amber-950 font-bold capitalize hover:brightness-110 transition"
                >
                  {diff}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDifficulty(false)}
              className="text-neutral-300 underline text-sm mt-2"
            >
              Kembali
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
