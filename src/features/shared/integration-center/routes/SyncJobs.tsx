import { useState } from 'react';
import { Button } from '../../../../shared/ui/Button';
import { useSyncJobs } from '../hooks/useSyncJobs';
import { SyncJobsTable } from '../components/SyncJobsTable';
import { RunDetailDrawer } from '../components/RunDetailDrawer';

export function SyncJobsRoute() {
  const { jobs, summary, runNow, togglePause, activeJobId, setActiveJobId, selected } = useSyncJobs();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Sync jobs</h2>
          <p className="text-sm text-muted">{summary.total} scheduled • {summary.running} running • {summary.failing} failing</p>
        </div>
        <Button variant="outline">Initial backfill</Button>
      </header>
      <SyncJobsTable
        jobs={jobs}
        activeJobId={activeJobId}
        onSelect={(id) => {
          setActiveJobId(id);
          setDrawerOpen(true);
        }}
        onRunNow={runNow}
        onTogglePause={togglePause}
      />
      <RunDetailDrawer
        job={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRetry={runNow}
      />
    </div>
  );
}
