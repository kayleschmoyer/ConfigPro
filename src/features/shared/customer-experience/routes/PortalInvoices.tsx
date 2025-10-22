import { useState } from 'react';
import { InvoiceList } from '../components/InvoiceList';
import { PaymentDrawer } from '../components/PaymentDrawer';
import { useInvoices } from '../hooks/useInvoices';
import { useLoyalty } from '../hooks/useLoyalty';
import { usePortal } from '../hooks/usePortal';

export const PortalInvoices = () => {
  const { invoices, totals, downloadInvoice } = useInvoices();
  const { loyalty } = useLoyalty();
  const { snapshot } = usePortal();
  const [selected, setSelected] = useState<string>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeInvoice = invoices.find(invoice => invoice.id === selected);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Invoices & payments</h2>
          <p className="text-sm text-muted">Review balances, pay securely, and download receipts.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>Total balance {totals.formattedBalance}</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {totals.overdue} overdue
          </span>
        </div>
      </header>

      <InvoiceList
        invoices={invoices}
        onSelect={invoice => setSelected(invoice.id)}
        onPay={invoice => {
          setSelected(invoice.id);
          setDrawerOpen(true);
        }}
        onDownload={downloadInvoice}
        activeInvoiceId={selected}
      />

      <PaymentDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        invoice={activeInvoice}
        loyalty={loyalty}
        rewards={snapshot.rewards}
        onSubmit={redirectUrl => {
          setDrawerOpen(false);
          if (typeof window !== 'undefined') {
            window.location.assign(redirectUrl);
          }
        }}
      />
    </div>
  );
};

export default PortalInvoices;
