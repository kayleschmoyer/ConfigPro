import { motion } from 'framer-motion';
import { LoginForm } from '../features/login/components/LoginForm';
import { useTheme } from '../hooks/useTheme';

const cardVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 }
};

export const LoginPage = () => {
  const { theme } = useTheme();

  return (
    <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.section
        className="flex flex-col justify-center gap-6"
        initial="initial"
        animate="animate"
        variants={cardVariants}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <span className="inline-flex w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          Tailored POS experiences
        </span>
        <h2 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Configure, launch, and scale your point-of-sale in minutes.
        </h2>
        <p className="text-base text-muted">
          ConfigPro empowers teams to theme and deploy industry-specific
          experiences from a single control center. Adjust branding, activate
          workflows, and invite collaborators instantly.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <span className="rounded-full border border-surface/40 bg-surface/60 px-4 py-2">
            Primary tone {theme.primary}
          </span>
          <span className="rounded-full border border-surface/40 bg-surface/60 px-4 py-2">
            Accent {theme.accent}
          </span>
        </div>
      </motion.section>
      <LoginForm />
    </div>
  );
};
