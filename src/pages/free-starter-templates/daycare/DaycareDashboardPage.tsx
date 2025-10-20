import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../lib/cn';

const screenVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const sections = [
  {
    id: 'family-check-in',
    title: 'Family Check-In',
    description: 'Tap to manage arrivals, departures, and guardian signatures.',
    icon: '👨‍👩‍👧',
    gradient: 'from-rose-500/90 to-pink-500/80'
  },
  {
    id: 'classrooms',
    title: 'Classroom Boards',
    description: 'View rosters, ratios, and activity notes for every room.',
    icon: '🧸',
    gradient: 'from-fuchsia-500/90 to-violet-500/80'
  },
  {
    id: 'meal-plans',
    title: 'Meals & Allergies',
    description: 'Track meal counts, allergy alerts, and today’s menu.',
    icon: '🍽️',
    gradient: 'from-amber-400/90 to-orange-400/80'
  },
  {
    id: 'messages',
    title: 'Family Messaging',
    description: 'Send quick updates, photos, and reminders to guardians.',
    icon: '💬',
    gradient: 'from-sky-400/90 to-cyan-400/80'
  },
  {
    id: 'staff-hub',
    title: 'Staff Hub',
    description: 'Break schedules, substitute requests, and certifications.',
    icon: '🗓️',
    gradient: 'from-teal-400/90 to-emerald-400/80'
  },
  {
    id: 'emergency',
    title: 'Emergency Toolkit',
    description: 'Emergency contacts, incident reports, and quick-call list.',
    icon: '🚨',
    gradient: 'from-red-500/95 to-rose-500/90'
  }
];

const quickActions = [
  {
    id: 'new-note',
    label: 'Add Daily Note',
    icon: '✍️'
  },
  {
    id: 'headcount',
    label: 'Live Headcount',
    icon: '👶'
  },
  {
    id: 'call-family',
    label: 'Call Guardian',
    icon: '📞'
  }
];

const announcements = [
  {
    id: 'field-trip',
    title: 'Splash day on Friday',
    details: 'Extra clothes and towels needed for Ladybug & Caterpillar rooms.'
  },
  {
    id: 'training',
    title: 'CPR certification renewal',
    details: 'Schedule before July 15. Tap Staff Hub for available sessions.'
  }
];

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date);

export const DaycareDashboardPage = () => {
  const { setTheme } = useTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setTheme('daycare');
  }, [setTheme]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = useMemo(() => formatTime(now), [now]);
  const formattedDate = useMemo(() => formatDate(now), [now]);

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-gradient-to-br from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8] text-foreground sm:-mx-6 lg:-mx-10">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[18%] top-[12%] h-[26rem] w-[26rem] rounded-full bg-rose-300/40 blur-3xl" />
          <div className="absolute left-[10%] bottom-[8%] h-[22rem] w-[22rem] rounded-full bg-amber-200/50 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_60%)]" />
        </div>

        <motion.div
          className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12"
          variants={screenVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/80 shadow-md shadow-rose-200/40 backdrop-blur">
                Daycare dashboard
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                  Good day, Little Horizons
                </h1>
                <p className="max-w-2xl text-lg text-foreground/80">
                  Quickly tap into the moments that matter&mdash;check-ins, classroom oversight, and guardian communication are all at your fingertips.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-4 py-2 text-base font-semibold shadow-sm">
                  <span className="text-2xl" aria-hidden>
                    ⏰
                  </span>
                  <div>
                    <div className="text-lg font-semibold leading-none text-foreground">{formattedTime}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">{formattedDate}</div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/40 px-4 py-2 text-sm font-medium shadow-sm">
                  <span className="text-xl" aria-hidden>
                    📍
                  </span>
                  Blossom Room · Front Lobby Kiosk
                </div>
              </div>
            </div>
            <aside className="w-full max-w-sm rounded-3xl border border-white/30 bg-white/40 p-6 shadow-2xl shadow-rose-200/50 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                <span className="text-xs uppercase tracking-[0.28em] text-foreground/60">Tap to start</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/60 px-5 py-4 text-lg font-semibold text-foreground shadow-sm transition hover:translate-y-[-2px] hover:border-foreground/20 hover:bg-white/80"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>
                        {action.icon}
                      </span>
                      {action.label}
                    </span>
                    <span aria-hidden className="text-xl text-foreground/50">
                      ›
                    </span>
                  </Button>
                ))}
              </div>
            </aside>
          </header>

          <main className="grid flex-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="grid gap-6 sm:grid-cols-2">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  type="button"
                  className={cn(
                    'group flex h-full flex-col justify-between rounded-3xl border border-white/40 bg-gradient-to-br p-6 text-left text-white shadow-xl backdrop-blur transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:p-8',
                    section.gradient
                  )}
                  whileHover={{ translateY: -6 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="space-y-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/30 text-4xl shadow-inner shadow-black/10">
                      {section.icon}
                    </span>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">{section.title}</h2>
                      <p className="text-base text-white/85 sm:text-lg">{section.description}</p>
                    </div>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-white/90">
                    Enter {section.title}
                    <motion.span
                      aria-hidden
                      className="text-2xl"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                    >
                      ›
                    </motion.span>
                  </span>
                </motion.button>
              ))}
            </section>
            <aside className="flex flex-col gap-6">
              <section className="space-y-4 rounded-3xl border border-white/40 bg-white/50 p-6 shadow-xl shadow-rose-200/50 backdrop-blur">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Announcements</h2>
                  <span className="text-xs uppercase tracking-[0.28em] text-foreground/60">Today</span>
                </div>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm"
                    >
                      <h3 className="text-base font-semibold text-foreground">{announcement.title}</h3>
                      <p className="text-sm text-foreground/70">{announcement.details}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="space-y-4 rounded-3xl border border-white/40 bg-gradient-to-br from-rose-400/80 to-pink-400/80 p-6 text-white shadow-xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Classroom Snapshot</h2>
                  <span className="text-xs uppercase tracking-[0.28em] text-white/80">Live</span>
                </div>
                <div className="space-y-3 text-base">
                  <div className="flex items-center justify-between rounded-2xl bg-white/20 px-4 py-3">
                    <span>Butterflies</span>
                    <span className="text-sm font-semibold">12 / 12</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/20 px-4 py-3">
                    <span>Caterpillars</span>
                    <span className="text-sm font-semibold">9 / 10</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/20 px-4 py-3">
                    <span>Ladybugs</span>
                    <span className="text-sm font-semibold">8 / 8</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full rounded-2xl border border-white/50 bg-white/20 py-3 text-base font-semibold text-white shadow-sm hover:bg-white/30"
                >
                  View detailed ratios
                </Button>
              </section>
            </aside>
          </main>
        </motion.div>
      </div>
    </div>
  );
};

export default DaycareDashboardPage;
