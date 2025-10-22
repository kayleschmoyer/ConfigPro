import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { useConnectors } from '../hooks/useConnectors';
import { ConnectionWizard } from '../components/ConnectionWizard';
import { ConnectionDrawer } from '../components/ConnectionDrawer';
import { ConnectorCard } from '../components/ConnectorCard';
import { EnvBadge } from '../components/EnvBadge';

export function ConnectorsRoute() {
  const { catalog, connections, draft, setDraft, createConnection, updateStatus, removeConnection, selected, setSelected, summary } =
    useConnectors();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Connector catalog</h2>
            <p className="text-sm text-muted">Pick a provider to start the secure connection wizard.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {catalog.map((connector) => (
              <ConnectorCard
                key={connector.kind}
                connector={connector}
                active={draft.kind === connector.kind}
                onSelect={(item) => setDraft({ ...draft, kind: item.kind, scopes: item.scopes })}
              />
            ))}
          </div>
        </div>
        <ConnectionWizard draft={draft} onChange={setDraft} onSubmit={() => createConnection(draft)} catalog={catalog} />
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Connections</h3>
            <p className="text-sm text-muted">{summary.active} connected • {summary.paused} paused • {summary.failing} failing</p>
          </div>
          <Input placeholder="Search connections" className="w-64" />
        </div>
        <div className="overflow-hidden rounded-3xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow
                  key={connection.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelected(connection);
                    setDrawerOpen(true);
                  }}
                >
                  <TableCell className="text-sm text-foreground">{connection.name}</TableCell>
                  <TableCell>{connection.status}</TableCell>
                  <TableCell>
                    <EnvBadge environment={connection.environment} />
                  </TableCell>
                  <TableCell>{connection.lastSyncAt}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); updateStatus(connection.id, 'CONNECTED'); }}>
                      Resume
                    </Button>
                    <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); removeConnection(connection.id); }}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <ConnectionDrawer
        connection={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onReauthorize={(id) => updateStatus(id, 'CONNECTED')}
        onRunNow={(id) => updateStatus(id, 'CONNECTED')}
        onPauseToggle={(id) => updateStatus(id, selected?.status === 'PAUSED' ? 'CONNECTED' : 'PAUSED')}
        onDelete={removeConnection}
      />
    </div>
  );
}
