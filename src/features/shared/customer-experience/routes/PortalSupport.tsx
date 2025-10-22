import { Button } from '@/shared/ui/Button';

export const PortalSupport = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Support</h2>
        <p className="text-sm text-muted">Open tickets, browse FAQs, and contact our service team.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-lg font-semibold text-foreground">Open a ticket</h3>
          <p className="mt-2 text-sm text-muted">
            Submit a service request with attachments and we’ll respond within our SLA.
          </p>
          <Button className="mt-4" variant="outline">
            Start ticket
          </Button>
        </article>
        <article className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-lg font-semibold text-foreground">Knowledge base</h3>
          <p className="mt-2 text-sm text-muted">Browse curated FAQs, how-to videos, and product guides.</p>
          <Button className="mt-4" variant="outline">
            View articles
          </Button>
        </article>
      </section>
    </div>
  );
};

export default PortalSupport;
