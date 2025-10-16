import { type ReactNode } from 'react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

const placeholderUser = {
  name: 'Jordan Lee'
};

const DashboardCard = ({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-3xl border border-foreground/5 bg-surface/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm',
        'sm:p-8',
        className
      )}
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
        {description ? (
          <p className="text-sm text-muted sm:text-base">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
};

export const DashboardPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-foreground/10 bg-surface/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
              CP
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted">ConfigPro</span>
              <span className="text-base font-semibold">Operations Suite</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end text-right sm:flex">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">Signed in as</span>
              <span className="text-sm font-semibold">{placeholderUser.name}</span>
            </div>
            <Button variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
            Welcome back
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            {`Welcome back, ${placeholderUser.name}`}
          </h1>
          <p className="max-w-2xl text-base text-muted sm:text-lg">
            Here&apos;s a quick snapshot of your operations and package performance. Keep an eye on upcoming
            activities and adjust your configuration at any time.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardCard
            title="Upcoming Appointments"
            description="Stay on top of what&apos;s next in your schedule."
            className="lg:col-span-2"
          >
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-foreground/10 bg-background/60 p-6 text-center text-sm text-muted">
              <span>No appointments scheduled yet.</span>
              <span className="text-xs text-muted">
                Once your teams start booking time, you&apos;ll see them listed here with quick actions.
              </span>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Current Package Summary"
            description="A snapshot of your ConfigPro plan and utilization."
          >
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-center justify-between rounded-2xl bg-background/70 px-4 py-3">
                <span className="font-medium text-foreground">Plan</span>
                <span>Scale Operations</span>
              </li>
              <li className="flex items-center justify-between rounded-2xl bg-background/70 px-4 py-3">
                <span className="font-medium text-foreground">Locations</span>
                <span>12 of 25 active</span>
              </li>
              <li className="flex items-center justify-between rounded-2xl bg-background/70 px-4 py-3">
                <span className="font-medium text-foreground">Automations</span>
                <span>8 workflows deployed</span>
              </li>
              <li className="flex items-center justify-between rounded-2xl bg-background/70 px-4 py-3">
                <span className="font-medium text-foreground">Support</span>
                <span>Priority concierge</span>
              </li>
            </ul>
          </DashboardCard>
        </div>

        <div className="flex flex-col items-stretch justify-between gap-4 rounded-3xl border border-foreground/5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-lg shadow-primary/10 sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Configure your package</h2>
            <p className="text-sm text-muted sm:text-base">
              Tailor modules, permissions, and automations to match how your organization works.
            </p>
          </div>
          <Button size="lg" className="self-start sm:self-auto">
            Configure My Package
          </Button>
        </div>
      </main>
    </div>
  );
};
