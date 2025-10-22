import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Clock,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function ARInvoices() {
  type Invoice = {
    id: string;
    customer: string;
    amount: number;
    paid: number;
    date: string;
    due: string;
    terms?: string;
    po?: string;
    notes?: string;
  };

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-3001', customer: 'Apex Tires', amount: 12800, paid: 3000, due: 'Nov 5, 2025', date: 'Oct 5, 2025', terms: 'Net 30', po: 'PO-9921' },
    { id: 'INV-2998', customer: 'Velocity Garage', amount: 6200, paid: 6200, due: 'Oct 20, 2025', date: 'Oct 1, 2025', terms: 'Net 15', po: 'PO-7710' },
    { id: 'INV-2995', customer: 'ProTread Service', amount: 8800, paid: 0, due: 'Nov 15, 2025', date: 'Oct 3, 2025', terms: 'Net 30', po: 'PO-1107' },
    { id: 'INV-2993', customer: 'Midtown Auto', amount: 4500, paid: 2500, due: 'Oct 30, 2025', date: 'Sep 28, 2025', terms: 'Due on Receipt', po: 'PO-6604' },
  ]);

  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Partially Paid'>('all');
  const [query, setQuery] = useState('');
  const [showSheet, setShowSheet] = useState(false);
  const [amountMin, setAmountMin] = useState<string>('');
  const [amountMax, setAmountMax] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [openDialog, setOpenDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>({});

  const deriveStatus = (amount: number, paid: number) => {
    if (paid <= 0) return 'Pending' as const;
    if (paid >= amount) return 'Paid' as const;
    return 'Partially Paid' as const;
  };

  const statusBadge = (status: 'Paid' | 'Pending' | 'Partially Paid') => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-xs font-medium">Paid</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full bg-amber-600/20 text-amber-300 text-xs font-medium">Pending</span>;
      case 'Partially Paid':
      default:
        return <span className="px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-medium">Partially Paid</span>;
    }
  };

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 0 });

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    filtered.forEach((i) => (next[i.id] = checked));
    setSelected(next);
  };

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);
  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => k), [selected]);

  const filtered = useMemo(() => {
    const byStatus = (inv: Invoice) => statusFilter === 'all' || deriveStatus(inv.amount, inv.paid) === statusFilter;
    const byQuery = (inv: Invoice) => !query.trim() || `${inv.id} ${inv.customer}`.toLowerCase().includes(query.toLowerCase());
    const byAmount = (inv: Invoice) => {
      const minOk = amountMin === '' || inv.amount >= Number(amountMin);
      const maxOk = amountMax === '' || inv.amount <= Number(amountMax);
      return minOk && maxOk;
    };
    const byDate = (inv: Invoice) => {
      const d = new Date(inv.date).getTime();
      const fromOk = !dateFrom || d >= new Date(dateFrom).getTime();
      const toOk = !dateTo || d <= new Date(dateTo).getTime();
      return fromOk && toOk;
    };
    const byOverdue = (inv: Invoice) => {
      if (!onlyOverdue) return true;
      const dueTs = new Date(inv.due).getTime();
      const today = new Date().setHours(0, 0, 0, 0);
      return dueTs < today && deriveStatus(inv.amount, inv.paid) !== 'Paid';
    };

    return invoices.filter((i) => byStatus(i) && byQuery(i) && byAmount(i) && byDate(i) && byOverdue(i));
  }, [invoices, statusFilter, query, amountMin, amountMax, dateFrom, dateTo, onlyOverdue]);

  const exportCSV = () => {
    const header = ['Invoice', 'Customer', 'Date', 'Due', 'Amount', 'Paid', 'Status'];
    const rows = filtered.map((i) => [i.id, i.customer, i.date, i.due, i.amount, i.paid, deriveStatus(i.amount, i.paid)]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendReminders = () => {
    console.log('Send reminders to: ', selectedIds);
    alert(`Reminders queued for ${selectedIds.length} invoice(s).`);
  };
  const scheduleFollowUps = () => {
    console.log('Scheduled follow-ups for: ', selectedIds);
    alert(`Auto follow-ups scheduled for ${selectedIds.length} invoice(s).`);
  };

  const openNew = () => {
    setEditTarget(null);
    setForm({ id: '', customer: '', amount: 0, paid: 0, date: '', due: '', terms: 'Net 30', po: '', notes: '' });
    setOpenDialog(true);
  };
  const openEdit = (inv: Invoice) => {
    setEditTarget(inv);
    setForm({ ...inv });
    setOpenDialog(true);
  };
  const remove = (inv: Invoice) => {
    if (confirm(`Delete ${inv.id}? This cannot be undone.`)) {
      setInvoices((prev) => prev.filter((x) => x.id !== inv.id));
    }
  };
  const save = () => {
    if (!form || !form.id || !form.customer || !form.amount || !form.date || !form.due) {
      alert('Please fill Invoice #, Customer, Amount, Date, and Due.');
      return;
    }
    const next: Invoice = {
      id: String(form.id),
      customer: String(form.customer),
      amount: Number(form.amount),
      paid: Number(form.paid || 0),
      date: String(form.date),
      due: String(form.due),
      terms: String(form.terms || ''),
      po: String(form.po || ''),
      notes: String(form.notes || ''),
    };

    setInvoices((prev) => {
      const exists = prev.some((p) => p.id === next.id);
      if (editTarget || exists) {
        return prev.map((p) => (p.id === next.id ? next : p));
      }
      return [next, ...prev];
    });
    setOpenDialog(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-slate-200">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <FileText className="text-emerald-400" /> Invoices
        </h1>
        <div className="flex items-center gap-3">
          <Select onValueChange={(v: any) => setStatusFilter(v)} value={statusFilter}>
            <SelectTrigger className="w-44 bg-slate-900/60 border-slate-700 text-slate-200">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 text-slate-200 border border-slate-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              placeholder="Search invoices or customers..."
              className="pl-9 bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:border-slate-500"
            />
          </div>

          <Sheet open={showSheet} onOpenChange={setShowSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Filter size={16} /> Advanced Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg bg-slate-950 text-slate-200 border-l border-slate-800">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div>
                  <Label className="text-slate-300">Amount Range</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <Input value={amountMin} onChange={(event: ChangeEvent<HTMLInputElement>) => setAmountMin(event.target.value)} placeholder="Min" className="bg-slate-900/60 border-slate-700" />
                    <Input value={amountMax} onChange={(event: ChangeEvent<HTMLInputElement>) => setAmountMax(event.target.value)} placeholder="Max" className="bg-slate-900/60 border-slate-700" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Issue Date</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <Input type="date" value={dateFrom} onChange={(event: ChangeEvent<HTMLInputElement>) => setDateFrom(event.target.value)} className="bg-slate-900/60 border-slate-700" />
                    <Input type="date" value={dateTo} onChange={(event: ChangeEvent<HTMLInputElement>) => setDateTo(event.target.value)} className="bg-slate-900/60 border-slate-700" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="overdue" checked={onlyOverdue} onCheckedChange={(value: boolean) => setOnlyOverdue(Boolean(value))} />
                  <Label htmlFor="overdue" className="text-slate-300">Show overdue only</Label>
                </div>
              </div>
              <SheetFooter className="mt-8">
                <div className="flex gap-3 ml-auto">
                  <Button variant="ghost" className="text-slate-400" onClick={() => { setAmountMin(''); setAmountMax(''); setDateFrom(''); setDateTo(''); setOnlyOverdue(false); }}>Reset</Button>
                  <Button onClick={() => setShowSheet(false)} className="bg-emerald-600 hover:bg-emerald-700">Apply</Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
            <Plus size={16} /> New Invoice
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={exportCSV} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          <Download size={16} /> Export CSV
        </Button>
        <Button onClick={sendReminders} disabled={!anySelected} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40">
          <Mail size={16} /> Send Reminders
        </Button>
        <Button onClick={scheduleFollowUps} disabled={!anySelected} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40">
          <Clock size={16} /> Schedule Auto Follow-up
        </Button>
      </div>

      <Card className="border border-slate-800 bg-slate-900/70 rounded-2xl overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
              <tr>
                <th className="py-3 px-4">
                  <Checkbox
                    checked={filtered.length > 0 && filtered.every((i) => selected[i.id])}
                    onCheckedChange={(value: boolean) => toggleAll(Boolean(value))}
                  />
                </th>
                <th className="px-4">Invoice</th>
                <th className="px-4">Customer</th>
                <th className="px-4">Date</th>
                <th className="px-4">Due</th>
                <th className="px-4">Amount</th>
                <th className="px-4">Paid</th>
                <th className="px-4">Status</th>
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={Boolean(selected[inv.id])}
                      onCheckedChange={(value: boolean) => setSelected((prev) => ({ ...prev, [inv.id]: Boolean(value) }))}
                    />
                  </td>
                  <td className="px-4 font-medium text-slate-100">{inv.id}</td>
                  <td className="px-4">{inv.customer}</td>
                  <td className="px-4">{inv.date}</td>
                  <td className="px-4">{inv.due}</td>
                  <td className="px-4">${fmt(inv.amount)}</td>
                  <td className="px-4">${fmt(inv.paid)}</td>
                  <td className="px-4">{statusBadge(deriveStatus(inv.amount, inv.paid))}</td>
                  <td className="px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs" onClick={() => openEdit(inv)}>
                        <Edit size={14} /> Edit
                      </Button>
                      <Button size="sm" className="bg-rose-700 text-white hover:bg-rose-800 text-xs" onClick={() => remove(inv)}>
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6">
        <Card className="border border-slate-800 bg-gradient-to-br from-emerald-800 to-slate-900 text-white rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Total Outstanding</h2>
            <p className="text-4xl font-bold mt-2">${fmt(invoices.reduce((a, b) => a + (b.amount - b.paid), 0))}</p>
            <p className="text-sm text-slate-300 mt-1">Updated live</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-800 bg-gradient-to-br from-indigo-800 to-slate-900 text-white rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Avg. Days to Collect</h2>
            <p className="text-4xl font-bold mt-2">28 Days</p>
            <p className="text-sm text-slate-300 mt-1">Based on last 90 days</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-800 bg-gradient-to-br from-rose-800 to-slate-900 text-white rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">High-Risk Overdue</h2>
            <p className="text-4xl font-bold mt-2">$6,200</p>
            <p className="text-sm text-slate-300 mt-1">3 accounts require attention</p>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-slate-950 text-slate-200 border border-slate-800">
          <DialogHeader>
            <DialogTitle>{editTarget ? `Edit ${editTarget.id}` : 'New Invoice'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editTarget ? 'Update invoice details' : 'Enter details to create a new invoice'}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div>
              <Label>Invoice #</Label>
              <Input value={form.id ?? ''} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, id: event.target.value }))} className="bg-slate-900/60 border-slate-700" />
            </div>
            <div>
              <Label>Customer</Label>
              <Input value={form.customer ?? ''} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, customer: event.target.value }))} className="bg-slate-900/60 border-slate-700" />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={form.amount ?? 0} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))} className="bg-slate-900/60 border-slate-700" />
            </div>
            <div>
              <Label>Paid</Label>
              <Input type="number" value={form.paid ?? 0} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, paid: Number(event.target.value) }))} className="bg-slate-900/60 border-slate-700" />
            </div>
            <div>
              <Label>Issue Date</Label>
              <Input type="date" value={toDateInput(form.date)} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, date: fromDateInput(event.target.value) }))} className="bg-slate-900/60 border-slate-700" />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={toDateInput(form.due)} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, due: fromDateInput(event.target.value) }))} className="bg-slate-900/60 border-slate-700" />
            </div>
            <div>
              <Label>Terms</Label>
              <Input value={form.terms ?? ''} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, terms: event.target.value }))} className="bg-slate-900/60 border-slate-700" />
            </div>
            <div>
              <Label>PO #</Label>
              <Input value={form.po ?? ''} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, po: event.target.value }))} className="bg-slate-900/60 border-slate-700" />
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes ?? ''} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, notes: event.target.value }))} className="bg-slate-900/60 border-slate-700" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" className="text-slate-400" onClick={() => setOpenDialog(false)}>
              <X className="mr-1" size={16} /> Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function toDateInput(v: string | undefined) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function fromDateInput(v: string) {
  if (!v) return '';
  const d = new Date(v);
  const fmt = d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return fmt.replace(',', '');
}
