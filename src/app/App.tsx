import { motion } from 'framer-motion';
import { Topbar } from '../components/layout/Topbar';
import { AppRouter } from '../router';
import { useTheme } from '../hooks/useTheme';

const fadeVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

const App = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar logo={theme.logo} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8">
        <motion.div
          className="w-full"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeVariants}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <AppRouter />
        </motion.div>
      </main>
    </div>
  );
};

export default App;
