import { motion } from 'framer-motion';
import { AppRouter } from '../router';

const fadeVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-screen w-full flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10">
        <motion.div
          className="w-full flex-1"
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
