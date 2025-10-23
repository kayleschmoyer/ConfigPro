import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { LoginForm } from '../../../features/login/components/LoginForm';
import { useTheme } from '@/hooks/useTheme';
import { resolveTheme } from '@/app/config/theme';

const hexToRgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const bigint = parseInt(value.length === 3 ? value.repeat(2) : value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const heroHighlights = [
  {
    title: 'Precision Access',
    description: 'Role-aware authentication drops teams exactly where work starts, no wandering required.'
  },
  {
    title: 'Operational Clarity',
    description: 'High-fidelity dashboards ignite the moment you sign in, tuned to your programs and regions.'
  },
  {
    title: 'Enterprise-grade Confidence',
    description: 'SOC2-ready controls, audit trails, and instant recovery baked into every login session.'
  }
];

const highlightVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.18 + index * 0.08, duration: 0.6, ease: 'easeOut' }
  })
};

export const LoginPage = () => {
  const { themeName } = useTheme();
  const accent = useMemo(() => resolveTheme(themeName).accent, [themeName]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_65%)]" />
        <motion.div
          className="absolute -left-24 top-[-12rem] h-[40rem] w-[40rem] rounded-full blur-3xl"
          style={{ background: hexToRgba(accent, 0.28) }}
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-8rem] top-1/3 h-[36rem] w-[36rem] rounded-full blur-[150px]"
          style={{ background: hexToRgba(accent, 0.18) }}
          animate={{ opacity: [0.25, 0.45, 0.25], scale: [1.05, 0.95, 1.05] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,transparent_55%,rgba(255,255,255,0.08)_100%)] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px] opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.32em] text-muted">
          <span className="flex items-center gap-3 text-foreground/80">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px] shadow-primary/80" />
            ConfigPro Command Login
          </span>
          <span className="hidden sm:block text-muted/70">Secured perimeter</span>
        </header>

        <main className="mt-10 flex flex-1 flex-col gap-14 lg:mt-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="space-y-6"
            >
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-1 text-[11px] font-semibold tracking-[0.4em] text-primary">
                Mission Ready Access
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                  Re-enter ConfigPro mission control
                </h1>
                <p className="text-base text-muted sm:text-lg">
                  Authenticate and pivot directly into orchestrating locations, teams, and data streams with zero friction. This is the launch pad—focused, secure, and built for operators who move fast.
                </p>
              </div>
            </motion.div>

            <motion.ul initial="hidden" animate="visible" className="grid gap-5 sm:grid-cols-2">
              {heroHighlights.map((highlight, index) => (
                <motion.li
                  key={highlight.title}
                  custom={index}
                  variants={highlightVariants}
                  className="group rounded-2xl border border-foreground/10 bg-background/70 p-5 backdrop-blur-xl transition hover:border-primary/40 hover:bg-background/90"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
                    {highlight.title}
                  </p>
                  <p className="mt-3 text-sm text-muted">
                    {highlight.description}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="w-full max-w-lg">
            <LoginForm />
          </div>
        </main>

        <footer className="mt-16 flex flex-col gap-4 text-xs uppercase tracking-[0.32em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Continuous monitoring active
          </div>
          <div className="flex gap-6 text-muted/80">
            <span>Latency &lt; 120ms</span>
            <span>Uptime 99.998%</span>
            <span>24/7 Incident Response</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
