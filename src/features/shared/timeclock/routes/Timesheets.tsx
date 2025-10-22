import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/Tabs';
import { useClockContext } from '../hooks/ClockProvider';
import { useTimesheets } from '../hooks/useTimesheets';
import { TimesheetTable } from '../components/TimesheetTable';
import { formatDuration } from '../lib/format';

export const Timesheets = () => {
  const { state } = useClockContext();
  const { entries, filteredEntries, totals, selectedEmployeeId, setSelectedEmployeeId, approveEntries, recalc } =
    useTimesheets(state.employees, state.policy);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'employee' | 'manager'>('employee');

  useEffect(() => {
    if (activeTab === 'employee') {
      setSelectedRows([]);
    }
  }, [activeTab]);

  const handleSelect = (entryId: string) => {
    setSelectedRows((prev) =>
      prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]
    );
  };

  const summary = useMemo(
    () =>
      `Regular ${formatDuration(totals.minutes)} • OT ${formatDuration(totals.ot)} • DT ${formatDuration(
        totals.dt
      )} • Breaks ${formatDuration(totals.breaks)}`,
    [totals]
  );

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'employee' | 'manager')}>
        <TabsList>
          <TabsTrigger value="employee">My timesheet</TabsTrigger>
          <TabsTrigger value="manager">Manager console</TabsTrigger>
        </TabsList>
        <TabsContent value="employee" className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl shadow-black/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Current pay period</h2>
                <p className="text-sm text-muted-foreground">{summary}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => approveEntries(filteredEntries.map((entry) => entry.id))}>
                Submit for approval
              </Button>
            </div>
            <TimesheetTable entries={filteredEntries} onApprove={(entries) => approveEntries(entries.map((entry) => entry.id))} />
          </section>
        </TabsContent>
        <TabsContent value="manager" className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl shadow-black/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Team timesheets</h2>
                <p className="text-sm text-muted-foreground">Select entries to approve or send back with notes.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => approveEntries(selectedRows)} disabled={selectedRows.length === 0}>
                Approve selected
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Filter employee"
                value={selectedEmployeeId ?? ''}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                placeholder="Employee ID"
              />
              <Input label="Search policy flags" placeholder="Exception keyword" />
            </div>
            <TimesheetTable
              entries={entries}
              allowBulkActions
              selectedIds={selectedRows}
              onApprove={(rows) => approveEntries(rows.map((entry) => entry.id))}
              onEdit={(entry) => recalc(entry)}
              onSelect={handleSelect}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};
