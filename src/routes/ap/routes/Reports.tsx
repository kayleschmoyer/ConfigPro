import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Button } from '@/shared/ui/Button';

const reports = [
  { name: 'Aging by Vendor', description: 'Outstanding balances grouped by vendor and bucket.' },
  { name: 'Cash Requirements', description: '7/14/30 day cash needs and DPO impact.' },
  { name: 'Discount Capture Rate', description: 'Earned vs missed early-pay discounts by period.' },
  { name: 'Cycle Time', description: 'Capture → pay duration with trend lines.' },
  { name: 'Exception Rate', description: 'Exceptions per thousand invoices by vendor.' },
  { name: 'DPO Trend', description: 'Trailing 12 month DPO and variance vs target.' },
  { name: 'Spend by Project', description: 'Spend distribution by project, cost center, and GL.' },
];

export const Reports = () => {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reporting library</h2>
          <p className="text-sm text-muted">Exportable datasets with saved views and share links.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost">Export CSV</Button>
          <Button>Schedule delivery</Button>
        </div>
      </header>
      <Table aria-label="Reports">
        <TableHeader>
          <TableRow>
            <TableHead>Report</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.name}>
              <TableCell>{report.name}</TableCell>
              <TableCell className="text-sm text-muted/90">{report.description}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    Preview
                  </Button>
                  <Button size="sm">Save view</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
