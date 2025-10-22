import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from '../../../../shared/ui/Drawer';
import { Button } from '../../../../shared/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../shared/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../shared/ui/Table';
import { formatRelative, formatTimestamp } from '../lib/format';
import type { Connection } from '../lib/types';
import { EnvBadge } from './EnvBadge';
import { RateLimitBadge } from './RateLimitBadge';

interface ConnectionDrawerProps {
  connection: Connection | null;
  open: boolean;
  onClose: () => void;
  onReauthorize: (id: string) => void;
  onRunNow: (id: string) => void;
  onPauseToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusStyles: Record<Connection['status'], string> = {
  CONNECTED: 'text-emerald-300 bg-emerald-400/10 border border-emerald-400/30',
  EXPIRED: 'text-amber-300 bg-amber-400/10 border border-amber-400/30',
  PAUSED: 'text-sky-300 bg-sky-400/10 border border-sky-400/30',
  ERROR: 'text-rose-300 bg-rose-400/10 border border-rose-400/30'
};

export function ConnectionDrawer({
  connection,
  open,
  onClose,
  onReauthorize,
  onRunNow,
  onPauseToggle,
  onDelete
}: ConnectionDrawerProps) {
  const mapping = useMemo(() => connection?.mapping ?? [], [connection]);

  return (
    <Drawer
      isOpen={open}
      onClose={onClose}
      title={connection?.name ?? 'Connection'}
      description={connection ? `${connection.kind} • ${connection.authMode}` : 'Inspect sync connection'}
      footer={
        connection && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted">Last updated {formatRelative(connection.updatedAt)}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onDelete(connection.id)}>
                Delete
              </Button>
              <Button variant="outline" onClick={() => onPauseToggle(connection.id)}>
                {connection.status === 'PAUSED' ? 'Resume' : 'Pause'}
              </Button>
              <Button onClick={() => onRunNow(connection.id)}>Run Sync</Button>
            </div>
          </div>
        )
      }
    >
      {!connection ? (
        <p className="text-sm text-muted">Select a connection to inspect configuration, rate limits and mapping.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${statusStyles[connection.status]}`}>
              {connection.status}
            </span>
            <EnvBadge environment={connection.environment} />
            <RateLimitBadge connection={connection} />
            <Button size="sm" variant="subtle" onClick={() => onReauthorize(connection.id)}>
              Reauthorize
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Stat label="Last Sync" value={formatTimestamp(connection.lastSyncAt)} helper={formatRelative(connection.lastSyncAt)} />
            <Stat label="Next Run" value={formatTimestamp(connection.nextRunAt)} helper={formatRelative(connection.nextRunAt)} />
            <Stat label="Created" value={formatTimestamp(connection.createdAt)} />
            <Stat label="Updated" value={formatTimestamp(connection.updatedAt)} />
          </div>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="mapping">Mapping</TabsTrigger>
              <TabsTrigger value="rate">Rate policy</TabsTrigger>
            </TabsList>
            <div className="rounded-3xl border border-border/60 bg-surface/70 p-5">
              <TabsContent value="summary">
                <dl className="grid gap-3 text-sm text-foreground/80">
                  <div className="flex justify-between rounded-2xl bg-surface/80 px-4 py-3">
                    <dt className="text-muted">Scopes</dt>
                    <dd className="text-right">{connection.scopes.join(', ') || '—'}</dd>
                  </div>
                  <div className="flex justify-between rounded-2xl bg-surface/80 px-4 py-3">
                    <dt className="text-muted">Auth</dt>
                    <dd className="text-right">{connection.authMode}</dd>
                  </div>
                </dl>
              </TabsContent>
              <TabsContent value="mapping">
                <div className="overflow-hidden rounded-3xl border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mapping.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.domain}</TableCell>
                          <TableCell>{item.sourceField}</TableCell>
                          <TableCell>{item.targetField}</TableCell>
                          <TableCell>{item.required ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))}
                      {mapping.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-sm text-muted">
                            No mappings configured.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="rate">
                <div className="space-y-3 text-sm text-muted">
                  <p>
                    ConfigPro applies adaptive exponential backoff when rate limits are hit. Backoff windows escalate and respect
                    provider-specific retry headers.
                  </p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-3xl bg-surface/80 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">Policy</p>
                    <p className="text-sm text-foreground">Burst safe with jitter.</p>
                  </motion.div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </Drawer>
  );
}

interface StatProps {
  label: string;
  value: string;
  helper?: string;
}

const Stat = ({ label, value, helper }: StatProps) => (
  <div className="rounded-3xl border border-border/40 bg-surface/80 px-5 py-4 shadow-inner shadow-primary/5">
    <p className="text-xs uppercase tracking-[0.3em] text-muted">{label}</p>
    <p className="mt-1 text-sm text-foreground">{value}</p>
    {helper && <p className="text-xs text-muted/80">{helper}</p>}
  </div>
);
