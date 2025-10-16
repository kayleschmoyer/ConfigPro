import { type ReactNode } from 'react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/cn';

interface QuickStat {
  title: string;
  value: string;
  change: string;
  changeDirection: 'up' | 'down';
  sublabel: string;
  sparkline: number[];
}

interface ChannelPerformance {
  channel: string;
  sales: string;
  share: number;
  trend: string;
}

interface ProductPerformance {
  name: string;
  category: string;
  revenue: string;
  growth: string;
}

interface TimelineEvent {
  time: string;
  action: string;
  value: string;
  actor: string;
}

interface ShiftMember {
  name: string;
  role: string;
  status: 'On shift' | 'Break' | 'Off';
  from: string;
  to: string;
}

interface InsightCard {
  title: string;
  description: string;
  pill: string;
}

interface NavItem {
  label: string;
  description: string;
  notifications?: number;
  isActive?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Point of sale',
    description: 'Start a new order',
    isActive: true
  },
  {
    label: 'Dashboard overview',
    description: 'Today\'s pulse',
    notifications: 4
  },
  {
    label: 'Orders',
    description: '362 open tickets',
    notifications: 9
  },
  {
    label: 'Customers',
    description: 'Loyalty & CRM'
  },
  {
    label: 'Inventory',
    description: 'Low stock alerts',
    notifications: 2
  },
  {
    label: 'Staffing',
    description: 'Coverage & breaks'
  },
  {
    label: 'Settings',
    description: 'Locations & taxes'
  }
];

const quickStats: QuickStat[] = [
  {
    title: 'Gross sales',
    value: '$24,390',
    change: '+12.6%',
    changeDirection: 'up',
    sublabel: 'vs. previous day',
    sparkline: [32, 48, 45, 62, 58, 74, 70]
  },
  {
    title: 'Transactions',
    value: '1,245',
    change: '+6.8%',
    changeDirection: 'up',
    sublabel: 'Avg. order $19.58',
    sparkline: [24, 31, 28, 40, 36, 42, 46]
  },
  {
    title: 'Refunds issued',
    value: '$640',
    change: '-2.1%',
    changeDirection: 'down',
    sublabel: '0.9% of sales',
    sparkline: [12, 10, 9, 8, 11, 6, 7]
  },
  {
    title: 'Loyalty signups',
    value: '186',
    change: '+18.3%',
    changeDirection: 'up',
    sublabel: 'Conversion 32%',
    sparkline: [8, 10, 11, 15, 14, 18, 20]
  }
];

const channelPerformance: ChannelPerformance[] = [
  { channel: 'In-store POS', sales: '$18.4K', share: 56, trend: '+5.4%' },
  { channel: 'Mobile orders', sales: '$4.2K', share: 26, trend: '+12.8%' },
  { channel: 'Self-service kiosk', sales: '$1.8K', share: 18, trend: '+3.1%' }
];

const topProducts: ProductPerformance[] = [
  {
    name: 'Signature Latte',
    category: 'Beverage',
    revenue: '$6,240',
    growth: '+9.4%'
  },
  {
    name: 'Artisan Sandwich',
    category: 'Grab & go',
    revenue: '$4,980',
    growth: '+14.2%'
  },
  {
    name: 'Seasonal Pastry Box',
    category: 'Bakery',
    revenue: '$3,410',
    growth: '+21.6%'
  }
];

const timelineEvents: TimelineEvent[] = [
  {
    time: '09:42',
    action: 'Large catering order processed',
    value: '$890.00',
    actor: 'Avery W. · Register 02'
  },
  {
    time: '10:18',
    action: 'Loyalty reward applied',
    value: '-$14.00',
    actor: 'Customer · App checkout'
  },
  {
    time: '11:05',
    action: 'Inventory alert — Cold brew kegs',
    value: '5 remaining',
    actor: 'Auto sync'
  },
  {
    time: '11:43',
    action: 'Refund issued (Order #10432)',
    value: '-$21.90',
    actor: 'Rowan F. · Register 01'
  }
];

const shiftMembers: ShiftMember[] = [
  {
    name: 'Talia Chen',
    role: 'Shift lead',
    status: 'On shift',
    from: '06:30',
    to: '14:30'
  },
  {
    name: 'Malik Jefferson',
    role: 'Barista',
    status: 'Break',
    from: '07:00',
    to: '15:00'
  },
  {
    name: 'Priya Patel',
    role: 'Runner',
    status: 'On shift',
    from: '08:00',
    to: '16:00'
  }
];

const insightCards: InsightCard[] = [
  {
    title: 'Happy hour starts in 2 hours',
    description: 'Pre-set kiosk promos go live at 2pm. Ensure pastry display is stocked.',
    pill: 'Promotion'
  },
  {
    title: 'Mobile orders spiking',
    description: 'Queue wait time is trending up 18%. Consider opening pickup window.',
    pill: 'Alert'
  }
];

const TrendPill = ({
  change,
  direction
}: {
  change: string;
  direction: 'up' | 'down';
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
      direction === 'up'
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    )}
  >
    <span aria-hidden>{direction === 'up' ? '▲' : '▼'}</span>
    {change}
  </span>
);

const SparkBars = ({ values }: { values: number[] }) => (
  <div className="flex h-14 items-end gap-1">
    {values.map((value, index) => (
      <span
        key={`spark-${value}-${index}`}
        className="w-2 rounded-full bg-primary/20"
        style={{ height: `${Math.max(18, value)}%` }}
      />
    ))}
  </div>
);

const Card = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      'flex flex-col gap-4 rounded-3xl border border-foreground/5 bg-surface/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm',
      className
    )}
  >
    {children}
  </section>
);

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="relative flex flex-col gap-6 overflow-hidden rounded-[32px] border border-foreground/5 bg-gradient-to-b from-white/90 via-white/80 to-white/70 p-6 text-slate-900 shadow-[0_35px_60px_-25px_rgba(15,23,42,0.35)] dark:from-surface/95 dark:via-surface/90 dark:to-surface/80 dark:text-foreground">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
              FP
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">FlowPOS</p>
              <p className="text-sm text-slate-500 dark:text-muted">Flagship location · Midtown</p>
            </div>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-primary/5 p-5 text-sm text-slate-600 shadow-inner dark:border-primary/20 dark:bg-primary/5 dark:text-muted">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Shift snapshot</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-foreground">$9,860</p>
            <p className="text-xs text-slate-500 dark:text-muted">Sales captured before noon</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-muted">Target</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">62% to goal</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={cn(
                  'group flex flex-col rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-primary/20 hover:bg-primary/5',
                  item.isActive
                    ? 'border-primary/20 bg-primary/10 text-slate-900 shadow-md dark:border-primary/40 dark:bg-primary/10 dark:text-foreground'
                    : 'text-slate-600 dark:text-muted'
                )}
              >
                <span className="flex items-center justify-between text-sm font-semibold">
                  {item.label}
                  {item.notifications ? (
                    <span className="rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {item.notifications}
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-slate-500 transition group-hover:text-slate-700 dark:text-muted">
                  {item.description}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-foreground/10 bg-white/80 p-5 text-slate-700 shadow-inner dark:border-foreground/20 dark:bg-surface/80 dark:text-muted">
            <p className="text-sm font-semibold text-slate-900 dark:text-foreground">Need a quick sale?</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-muted">
              Launch the express checkout layout to move the line faster during peak hours.
            </p>
            <Button className="mt-4 w-full" size="sm">
              Launch express mode
            </Button>
          </div>
        </aside>

        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-[32px] border border-foreground/5 bg-gradient-to-r from-primary/10 via-surface/80 to-surface/60 p-6 shadow-lg shadow-primary/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">Point of sale · Flagship cafe</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">Ready to ring up the next guest</h1>
              <p className="text-sm text-muted">
                Jump straight into orders, manage active tickets, and keep every station synced in real time.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" size="sm">
                Hold current sale
              </Button>
              <Button size="sm">Start new ticket</Button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <Card key={stat.title} className="relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{stat.title}</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
                  </div>
                  <TrendPill change={stat.change} direction={stat.changeDirection} />
                </div>
                <p className="text-xs text-muted">{stat.sublabel}</p>
                <SparkBars values={stat.sparkline} />
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Sales by channel</h2>
                  <p className="text-sm text-muted">Distribution of volume across your active touchpoints.</p>
                </div>
                <Button variant="ghost" size="sm">
                  See trends
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {channelPerformance.map((channel) => (
                  <div key={channel.channel} className="space-y-2 rounded-2xl border border-foreground/5 bg-background/60 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                      <span>{channel.channel}</span>
                      <span>{channel.sales}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${channel.share}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted">Share of daily sales · {channel.trend}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Top moving items</h2>
                  <p className="text-sm text-muted">Keep your signature products stocked and prepped.</p>
                </div>
                <Button variant="ghost" size="sm">
                  Manage inventory
                </Button>
              </div>
              <ul className="mt-4 space-y-3">
                {topProducts.map((product) => (
                  <li
                    key={product.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/5 bg-background/70 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{product.revenue}</p>
                      <p className="text-xs text-emerald-500/90">{product.growth}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Live activity</h2>
                  <p className="text-sm text-muted">Latest orders, adjustments, and operational alerts.</p>
                </div>
                <Button variant="ghost" size="sm">
                  Export log
                </Button>
              </div>
              <ul className="mt-4 space-y-3">
                {timelineEvents.map((event) => (
                  <li key={`${event.time}-${event.action}`} className="flex gap-4 rounded-2xl border border-foreground/5 bg-background/70 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                      {event.time}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-semibold text-foreground">{event.action}</p>
                      <p className="text-xs text-muted">{event.actor}</p>
                    </div>
                    <span className="self-start text-sm font-semibold text-foreground">{event.value}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="grid gap-6">
              <Card>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Shift coverage</h2>
                  <Button variant="ghost" size="sm">
                    Adjust roster
                  </Button>
                </div>
                <ul className="mt-4 space-y-3">
                  {shiftMembers.map((member) => (
                    <li key={member.name} className="flex items-center justify-between rounded-2xl border border-foreground/5 bg-background/70 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted">{member.role}</p>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <p>
                          {member.from} – {member.to}
                        </p>
                        <span
                          className={cn(
                            'mt-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            member.status === 'On shift'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : member.status === 'Break'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-slate-500/10 text-slate-500'
                          )}
                        >
                          {member.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <div className="space-y-3">
                  {insightCards.map((insight) => (
                    <div key={insight.title} className="rounded-2xl border border-foreground/5 bg-background/70 p-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        {insight.pill}
                      </span>
                      <p className="mt-3 text-sm font-semibold text-foreground">{insight.title}</p>
                      <p className="text-xs text-muted">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
