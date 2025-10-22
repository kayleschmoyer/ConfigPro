import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table';
import { useSegments } from '../hooks/useSegments';
import { usePortal } from '../hooks/usePortal';
import { maskEmail, formatDate } from '../lib/format';

export const AdminCustomers = () => {
  const { snapshot } = usePortal();
  const { previews } = useSegments();

  const customers = previews[0]?.preview.members ?? [snapshot.customer];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Customers</h2>
        <p className="text-sm text-muted">Unified profiles with loyalty, feedback, and appointment insights.</p>
      </header>
      <TableContainer>
        <Table aria-label="Customers">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Preferred channel</TableHead>
              <TableHead>Loyalty tier</TableHead>
              <TableHead>Last invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell className="font-semibold text-foreground">
                  {customer.firstName} {customer.lastName}
                </TableCell>
                <TableCell>{maskEmail(customer.email)}</TableCell>
                <TableCell>{customer.preferences?.channel ?? 'PORTAL'}</TableCell>
                <TableCell>{snapshot.loyalty.tier}</TableCell>
                <TableCell>
                  {snapshot.invoices[0]?.issueDate ? formatDate(snapshot.invoices[0].issueDate) : '—'}
                </TableCell>
             </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminCustomers;
