import { motion } from 'framer-motion';

interface HoleProps {
  index: number;
  seeds: number;
  isSelected: boolean;
  isSelectable: boolean;
  isFlashing: boolean;
  isAIHighlighted: boolean;
  onClick: () => void;
}

// Susunan titik biji sederhana agar tampak seperti biji congklak sungguhan,
// bukan cuma angka. Maksimal ditampilkan visual: 12 titik, sisanya diwakili angka.
function SeedDots({ count }: { count: number }) {
  const visibleDots = Math.min(count, 12);
  const dots = Array.from({ length: visibleDots });

  return (
    <div className="relative flex flex-wrap items-center justify-center gap-[2px] w-full h-full p-1">
      {dots.map((_, i) => (
        <span
          key={i}
          className="block rounded-full bg-gradient-to-br from-neutral-600 via-neutral-800 to-black shadow-inner"
          style={{
            width: '18%',
            aspectRatio: '1 / 1',
          }}
        />
      ))}
      {count > 0 && (
        <span className="absolute bottom-0 right-0 text-[10px] md:text-xs font-bold text-white bg-black/60 rounded-full px-1 leading-tight">
          {count}
        </span>
      )}
    </div>
  );
}

export default function Hole({
  seeds,
  isSelected,
  isSelectable,
  isFlashing,
  isAIHighlighted,
  onClick,
}: HoleProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!isSelectable}
      whileTap={isSelectable ? { scale: 0.9 } : undefined}
      className={[
        'relative rounded-full aspect-square',
        'w-10 h-10 md:w-[55px] md:h-[55px] lg:w-[70px] lg:h-[70px]',
        'bg-hole border-4 transition-colors duration-300',
        'flex items-center justify-center shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]',
        isSelected ? 'border-yellow-400' : 'border-hole-dark',
        isAIHighlighted ? 'border-red-400 ring-2 ring-red-300' : '',
        isFlashing ? 'animate-flash' : '',
        isSelectable ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-90',
      ].join(' ')}
      aria-label={`Lubang berisi ${seeds} biji`}
    >
      <SeedDots count={seeds} />
    </motion.button>
  );
}
