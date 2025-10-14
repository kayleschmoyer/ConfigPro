import { motion } from 'framer-motion';
import { ThemePresetSelect } from '../elements/ThemePresetSelect';
import { ThemeToggle } from '../elements/ThemeToggle';

interface TopbarProps {
  logo: string;
}

export const Topbar = ({ logo }: TopbarProps) => (
  <motion.header
    className="sticky top-0 z-30 border-b border-surface/40 bg-surface/70 backdrop-blur"
    initial={{ y: -24, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  >
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="ConfigPro logo"
          className="h-10 w-10 rounded-lg object-contain"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            ConfigPro POS
          </p>
          <p className="text-xs text-muted">
            Infinite customization, one platform.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemePresetSelect />
        <ThemeToggle />
      </div>
    </div>
  </motion.header>
);
