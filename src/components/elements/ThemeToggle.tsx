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
        'hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        className
      )}
      whileTap={{ scale: 0.96 }}
    >
      <span aria-hidden>{mode === 'dark' ? '🌙' : '☀️'}</span>
      <span className="hidden sm:inline">
        {mode === 'dark' ? 'Dark' : 'Light'} mode
      </span>
    </motion.button>
  );
};
