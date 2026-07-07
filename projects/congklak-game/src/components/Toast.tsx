import { AnimatePresence, motion } from 'framer-motion';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
}

const typeStyles: Record<ToastMessage['type'], string> = {
  info: 'bg-neutral-800 border-neutral-600',
  success: 'bg-green-700 border-green-500',
  capture: 'bg-red-700 border-red-500',
  bonus: 'bg-amber-600 border-amber-400',
  win: 'bg-purple-700 border-purple-500',
};

export default function Toast({ toasts }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={[
              'px-4 py-2 rounded-lg border text-white text-sm font-semibold shadow-lg',
              typeStyles[toast.type],
            ].join(' ')}
          >
            {toast.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
