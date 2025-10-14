import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/cn';

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { mode, toggleMode } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleMode}
      aria-label="Toggle theme"
      className={cn(
        'button-shadow inline-flex h-10 items-center gap-2 rounded-full border border-surface/30 bg-surface/70 px-4 text-sm font-medium text-foreground backdrop-blur transition',
        'hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
    >
      <motion.span
        aria-hidden
        key={mode}
        className="text-lg"
        initial={{ rotate: -90, opacity: 0, y: -4 }}
        animate={{ rotate: 0, opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {mode === 'dark' ? '🌙' : '☀️'}
      </motion.span>
      <span className="hidden sm:inline">
        {mode === 'dark' ? 'Dark' : 'Light'} mode
      </span>
    </motion.button>
  );
};
