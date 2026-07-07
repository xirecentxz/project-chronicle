import { motion } from 'framer-motion';
import { PlayerId } from '../types';

interface StoreProps {
  player: PlayerId;
  seeds: number;
  isActive: boolean; // giliran pemain pemilik lumbung ini
}

export default function Store({ player, seeds, isActive }: StoreProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={[
          'text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full',
          player === 1 ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white',
        ].join(' ')}
      >
        {player === 1 ? 'P1' : 'P2'}
      </span>
      <motion.div
        layout
        className={[
          'relative rounded-2xl flex items-center justify-center',
          'w-[60px] h-[110px] md:w-[80px] md:h-[150px] lg:w-[100px] lg:h-[190px]',
          'bg-store border-4 shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)]',
          isActive ? 'border-green-400 animate-pulseBorder' : 'border-store-dark',
        ].join(' ')}
      >
        <motion.span
          key={seeds}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-amber-950"
        >
          {seeds}
        </motion.span>
      </motion.div>
    </div>
  );
}
