import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { LoginForm } from '../../../features/login/components/LoginForm';
import { useTheme } from '../../../hooks/useTheme';
import { baseTheme, resolveTheme } from '../../../app/config/theme';
import { cn } from '../../../lib/cn';

type IndustryOption = {
  id: string;
  label: string;
  themeName: string;
  accent: string;
  headline: string;
};

const industryOptions: IndustryOption[] = [
  {
    id: 'configpro',
    label: 'ConfigPro',
    themeName: 'default',
    accent: baseTheme.accent,
    headline: 'Orchestrate every location, team, and workflow from a single source of truth.'
  },
  {
    id: 'daycare',
    label: 'Daycare',
    themeName: 'daycare',
    accent: resolveTheme('daycare').accent,
    headline: 'Coordinate guardians, rosters, and daily check-ins effortlessly.'
  },
  {
    id: 'construction',
    label: 'Construction',
    themeName: 'construction',
    accent: resolveTheme('construction').accent,
    headline: 'Mobilize crews, bids, and materials tracking from one dashboard.'
  }
];

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const hexToRgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const bigint = parseInt(value.length === 3 ? value.repeat(2) : value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const IndustryPill = ({
  option,
  isActive,
  onSelect
}: {
  option: IndustryOption;
  isActive: boolean;
  onSelect: (option: IndustryOption) => void;
}) => (
  <motion.button
    type="button"
    onClick={() => onSelect(option)}
    className={cn(
      'group relative inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      isActive
        ? 'border-transparent text-foreground shadow-lg shadow-primary/20'
        : 'border-foreground/10 text-muted hover:border-primary/40 hover:text-foreground'
    )}
    style={
      isActive
        ? {
            background: `linear-gradient(135deg, ${hexToRgba(option.accent, 0.2)}, ${hexToRgba(option.accent, 0.08)})`,
            boxShadow: `0 18px 40px ${hexToRgba(option.accent, 0.25)}`
          }
        : undefined
    }
    whileHover={{ translateY: -4 }}
    whileTap={{ scale: 0.97 }}
  >
    <span className="inline-flex items-center gap-2">
      <motion.span
        layoutId="industry-accent-dot"
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: option.accent }}
      />
      {option.label}
    </span>
    <motion.span
      aria-hidden
      className="text-xs text-muted transition group-hover:text-foreground"
      animate={{ rotate: isActive ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      ▼
    </motion.span>
  </motion.button>
);

export const LoginPage = () => {
  const { themeName, setTheme } = useTheme();
  const [activeIndustry, setActiveIndustry] = useState<IndustryOption>(() => {
    return (
      industryOptions.find((option) => option.themeName === themeName) ?? industryOptions[0]
    );
  });
  const testimonials = useMemo(
    () => [
      {
        quote: 'ConfigPro let our ops team launch new workflows in an afternoon. It felt like flipping a switch for the entire organization.',
        author: 'Jordan M.',
        role: 'Director of Operations'
      },
      {
        quote: 'We customized dashboards, permissions, and automations without engineering sprints. ConfigPro keeps every store perfectly in sync.',
        author: 'Priya K.',
        role: 'Multi-Unit Retail Lead'
      },
      {
        quote: 'The visibility we now have across inventory and staffing is unreal. ConfigPro is the nerve center for our business.',
        author: 'Luis F.',
        role: 'VP, Platform Experience'
      }
    ],
    []
  );
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const next = industryOptions.find((option) => option.themeName === themeName);
    if (next) {
      setActiveIndustry(next);
    }
  }, [themeName]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((index) => (index + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const gradientStyle = useMemo(
    () => ({
      background: `radial-gradient(120% 120% at 20% 20%, ${hexToRgba(activeIndustry.accent, 0.16)}, transparent 70%)`
    }),
    [activeIndustry.accent]
  );

  const handleIndustrySelect = (option: IndustryOption) => {
    setActiveIndustry(option);
    setTheme(option.themeName);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-90" style={gradientStyle} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        <motion.div
          className="absolute left-1/2 top-[15%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: hexToRgba(activeIndustry.accent, 0.24) }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-14">
        <main className="mt-4 flex flex-1 flex-col sm:mt-6">
          <div className="grid flex-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.section
              variants={heroVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col gap-10"
            >
              <div className="space-y-6">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Tailored ConfigPro experiences
                </span>
                <div className="space-y-5">
                  <h1 className="max-w-xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                    ✨ Configure ConfigPro for your business
                  </h1>
                  <p className="max-w-xl text-base text-muted sm:text-lg">
                    ConfigPro empowers teams to design, theme, and deploy unified operations hubs that mirror the way they already work.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {industryOptions.map((option) => (
                  <IndustryPill
                    key={option.id}
                    option={option}
                    isActive={activeIndustry.id === option.id}
                    onSelect={handleIndustrySelect}
                  />
                ))}
              </div>
              <motion.div
                key={activeIndustry.id}
                className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-lg shadow-primary/10 backdrop-blur"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
                  {activeIndustry.label} spotlight
                </p>
                <p className="text-lg font-medium text-foreground/90">
                  {activeIndustry.headline}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="inline-flex h-8 items-center rounded-full bg-primary/10 px-3 font-semibold text-primary">
                    Real-time theming
                  </span>
                  <span className="inline-flex h-8 items-center rounded-full bg-accent/10 px-3 font-semibold text-accent">
                    Workflow presets
                  </span>
                </div>
              </motion.div>
            </motion.section>
            <LoginForm />
          </div>
        </main>
        <footer className="mt-12 flex flex-col gap-6 rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-lg shadow-primary/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-primary">
            <span aria-hidden className="text-2xl">★★★★★</span>
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">Teams trust ConfigPro</span>
          </div>
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex-1 text-left sm:text-right"
          >
            <p className="text-base font-medium text-foreground sm:text-lg">
              “{testimonials[activeTestimonial].quote}”
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">
              {testimonials[activeTestimonial].author}
              <span className="ml-2 text-xs font-medium uppercase tracking-[0.25em] text-muted">
                {testimonials[activeTestimonial].role}
              </span>
            </p>
          </motion.div>
          <div className="flex items-center justify-end gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveTestimonial(index)}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition',
                  index === activeTestimonial ? 'bg-primary' : 'bg-muted/60 hover:bg-muted'
                )}
                aria-label={`Show testimonial ${index + 1}`}
              />
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};
