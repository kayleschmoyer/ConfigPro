import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import { formatDate, formatDateTime, formatMoney } from '../lib/format';
import { usePortal } from '../hooks/usePortal';
import { useInvoices } from '../hooks/useInvoices';
import { useAppointments } from '../hooks/useAppointments';
import { useOrders } from '../hooks/useOrders';
import { useMessages } from '../hooks/useMessages';
import { useLoyalty } from '../hooks/useLoyalty';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.18 } })
};

export const PortalHome = () => {
  const { snapshot } = usePortal();
  const { totals, invoices } = useInvoices();
  const { nextAppointment } = useAppointments();
  const { nextOrder } = useOrders();
  const { unreadCount } = useMessages();
  const { summary } = useLoyalty();

  const cards = [
    {
      title: 'Balance due',
      value: totals.formattedBalance,
      meta: `${totals.overdue} overdue`,
      tone: 'bg-red-500/10 text-red-100 border-red-500/30'
    },
    {
      title: 'Next appointment',
      value: nextAppointment?.window ?? 'Not scheduled',
      meta: nextAppointment ? 'Tap to reschedule' : 'Book now',
      tone: 'bg-primary/10 text-primary-foreground border-primary/30'
    },
    {
      title: 'Recent order',
      value: nextOrder ? `${nextOrder.number} • ${formatDate(nextOrder.date)}` : 'No active orders',
      meta: nextOrder?.status ?? '',
      tone: 'bg-emerald-500/10 text-emerald-100 border-emerald-500/30'
    },
    {
      title: 'Loyalty points',
      value: summary.points.toLocaleString(),
      meta: summary.nextTier ? `${Math.round(summary.progress * 100)}% to ${summary.nextTier}` : 'Top tier',
      tone: 'bg-amber-500/10 text-amber-100 border-amber-500/30'
    },
    {
      title: 'Inbox',
      value: `${unreadCount} new message${unreadCount === 1 ? '' : 's'}`,
      meta: 'Secure conversations',
      tone: 'bg-surface/70 text-foreground border-border/40'
    }
  ];

  const recentInvoices = invoices.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, index) => (
          <motion.article
            key={card.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={cn('rounded-3xl border p-5 shadow-md shadow-primary/10', card.tone)}
          >
            <h3 className="text-xs uppercase tracking-[0.3em]">{card.title}</h3>
            <p className="mt-3 text-lg font-semibold">{card.value}</p>
            <p className="mt-2 text-sm text-white/80">{card.meta}</p>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <article className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Upcoming appointment</h3>
              <p className="text-sm text-muted">Optimize your schedule</p>
            </div>
            <Button variant="outline">Manage</Button>
          </header>
          <div className="mt-5 space-y-4 text-sm text-foreground/90">
            <p>
              {nextAppointment ? (
                <>
                  <span className="font-semibold">{nextAppointment.window}</span>
                  <span className="ml-2 text-xs uppercase tracking-[0.3em] text-muted">Booked</span>
                </>
              ) : (
                'No appointment scheduled.'
              )}
            </p>
            <p className="text-muted">
              Need to reschedule? Use the appointment tab to pick another slot with capacity guardrails.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent invoices</h3>
              <p className="text-sm text-muted">Download receipts or pay remaining balance.</p>
            </div>
            <Button variant="outline">View all</Button>
          </header>
          <ul className="mt-4 space-y-3 text-sm text-foreground/90">
            {recentInvoices.map(invoice => (
              <li key={invoice.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
                <div>
                  <p className="font-semibold">{invoice.number}</p>
                  <p className="text-xs text-muted">Due {formatDate(invoice.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMoney(invoice.balance)}</p>
                  <p className="text-xs text-muted">{invoice.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Suggested actions</h3>
            <p className="text-sm text-muted">Stay ahead of upcoming milestones.</p>
          </div>
        </header>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          <li className="rounded-2xl border border-border/50 bg-surface/70 p-4 text-sm text-foreground/90">
            Update billing preferences to enable auto-pay before {formatDate(snapshot.invoices[0].dueDate)}.
          </li>
          <li className="rounded-2xl border border-border/50 bg-surface/70 p-4 text-sm text-foreground/90">
            Share feedback on your last appointment from {formatDateTime(snapshot.appointments[0]?.startsAt ?? '')}.
          </li>
          <li className="rounded-2xl border border-border/50 bg-surface/70 p-4 text-sm text-foreground/90">
            Redeem {summary.points > 500 ? '500' : '250'} points toward your next invoice for instant savings.
          </li>
          <li className="rounded-2xl border border-border/50 bg-surface/70 p-4 text-sm text-foreground/90">
            Invite a friend with your referral link to earn bonus rewards this month.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default PortalHome;
