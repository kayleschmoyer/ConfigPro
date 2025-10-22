import { Button } from '@/shared/ui/Button';

const cards = [
  { title: 'Customers', description: 'Profiles, guardians, and org hierarchies', to: '/admin/customers' },
  { title: 'Segments', description: 'Dynamic audiences with AND/OR logic', to: '/admin/segments' },
  { title: 'Loyalty', description: 'Earn & burn rules, tier logic, expiration', to: '/admin/loyalty' },
  { title: 'Feedback', description: 'Survey designer, triggers, analytics', to: '/admin/feedback' },
  { title: 'Branding', description: 'Logo, colors, typography, localization', to: '/admin/branding' },
  { title: 'Journeys', description: 'Automations mapped to workflow engine', to: '/admin/journeys' },
  { title: 'Reports', description: 'Engagement, redemption, satisfaction', to: '/admin/reports' },
  { title: 'Settings', description: 'Auth modes, privacy, data export', to: '/admin/settings' }
];

export const AdminHome = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Manager overview</h2>
        <p className="text-sm text-muted">Choose a workspace to orchestrate ConfigPro experiences.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(card => (
          <article
            key={card.title}
            className="flex flex-col justify-between rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10"
          >
            <header>
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted">{card.description}</p>
            </header>
            <Button asChild className="mt-6" variant="outline">
              <a href={card.to}>Open</a>
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
};

export default AdminHome;
