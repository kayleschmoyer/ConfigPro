import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table';
import { useVendors } from '../hooks/useVendors';
import { formatDate } from '../lib/format';

export const Vendors = () => {
  const { filtered, search, setSearch } = useVendors();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <Input
          label="Search vendors"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-72"
        />
        <div className="flex gap-3">
          <Button variant="ghost">Request bank update</Button>
          <Button>Invite vendor portal</Button>
        </div>
      </header>
      <Table aria-label="Vendor directory">
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>Terms</TableHead>
            <TableHead>Payment methods</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Contacts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(({ vendor, risk }) => (
            <TableRow key={vendor.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{vendor.name}</span>
                  <span className="text-xs text-muted">Default currency · {vendor.defaultCurrency ?? 'USD'}</span>
                </div>
              </TableCell>
              <TableCell>{vendor.terms ?? 'Net 30'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {vendor.paymentMethods?.map((method) => (
                    <span
                      key={method}
                      className="rounded-full border border-border/50 bg-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <span className={`text-sm font-semibold ${risk.tone}`}>{risk.level}</span>
                <p className="text-xs text-muted/80">{risk.description}</p>
              </TableCell>
              <TableCell>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {vendor.docs?.map((doc) => (
                    <li key={doc.kind}>
                      {doc.kind} · {doc.expiresAt ? `Expires ${formatDate(doc.expiresAt)}` : 'No expiry'}
                    </li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {vendor.contacts?.map((contact) => (
                    <li key={contact.email ?? contact.name}>
                      {contact.name} · {contact.email ?? contact.phone}
                    </li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
