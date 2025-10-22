import { useCallback, useMemo, useState } from 'react';
import type {
  Connection,
  ConnectorCatalogItem,
  ConnectorKind,
  FieldMapping
} from '../lib/types';
import { formatRelative } from '../lib/format';
import { rateLimitDescription } from '../lib/rateLimit';

const catalog: ConnectorCatalogItem[] = [
  {
    kind: 'QUICKBOOKS',
    name: 'QuickBooks',
    description: 'Accounting, invoices, vendors and payments',
    scopes: ['customers.read', 'invoices.write', 'payments.read'],
    domains: ['CUSTOMERS', 'INVOICES', 'PAYMENTS']
  },
  {
    kind: 'GOOGLE',
    name: 'Google Workspace',
    description: 'Drive, Calendar and directory sync',
    scopes: ['drive.read', 'calendar.write', 'directory.read'],
    domains: ['FILES', 'CALENDAR', 'CUSTOMERS']
  },
  {
    kind: 'STRIPE',
    name: 'Stripe',
    description: 'Payments, payouts and dispute sync',
    scopes: ['charges.read', 'payouts.read'],
    domains: ['PAYMENTS']
  },
  {
    kind: 'TWILIO',
    name: 'Twilio',
    description: 'Programmable messaging and calls',
    scopes: ['messages.write', 'calls.read'],
    domains: ['MESSAGING']
  },
  {
    kind: 'SLACK',
    name: 'Slack',
    description: 'Channel sync, DMs and audit logs',
    scopes: ['channels.read', 'chat.write'],
    domains: ['MESSAGING']
  }
];

const initialConnections: Connection[] = [
  {
    id: 'conn-1',
    kind: 'QUICKBOOKS',
    authMode: 'OAUTH2_PKCE',
    name: 'QuickBooks Finance',
    status: 'CONNECTED',
    scopes: catalog[0]!.scopes,
    environment: 'PROD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    mapping: [
      {
        id: 'map-1',
        domain: 'CUSTOMERS',
        sourceField: 'display_name',
        targetField: 'name',
        required: true
      }
    ],
    rateLimit: { perMin: 60, burst: 120 }
  },
  {
    id: 'conn-2',
    kind: 'GOOGLE',
    authMode: 'SERVICE_ACCOUNT',
    name: 'Google Drive',
    status: 'PAUSED',
    scopes: ['drive.read'],
    environment: 'SANDBOX',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
    mapping: [
      {
        id: 'map-2',
        domain: 'FILES',
        sourceField: 'name',
        targetField: 'title'
      }
    ]
  }
];

export type ConnectionDraft = {
  kind?: ConnectorKind;
  authMode?: Connection['authMode'];
  name: string;
  scopes: string[];
  mapping: FieldMapping[];
  schedule: string;
};

export function useConnectors() {
  const [connections, setConnections] = useState(initialConnections);
  const [draft, setDraft] = useState<ConnectionDraft>({
    name: '',
    scopes: [],
    mapping: [],
    schedule: '0 * * * *'
  });
  const [selected, setSelected] = useState<Connection | null>(connections[0] ?? null);

  const createConnection = useCallback(
    (payload: ConnectionDraft) => {
      if (!payload.kind || !payload.authMode) return;
      const connection: Connection = {
        id: `conn-${Date.now()}`,
        kind: payload.kind,
        authMode: payload.authMode,
        name: payload.name || `${payload.kind} connection`,
        status: 'CONNECTED',
        scopes: payload.scopes,
        environment: 'SANDBOX',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mapping: payload.mapping
      };
      setConnections((list) => [...list, connection]);
      setDraft({ name: '', scopes: [], mapping: [], schedule: '0 * * * *' });
      setSelected(connection);
    },
    []
  );

  const updateStatus = useCallback((id: string, status: Connection['status']) => {
    const timestamp = new Date().toISOString();
    setConnections((list) => list.map((item) => (item.id === id ? { ...item, status, updatedAt: timestamp } : item)));
    setSelected((current) => (current?.id === id ? { ...current, status, updatedAt: timestamp } : current));
  }, []);

  const removeConnection = useCallback((id: string) => {
    setConnections((list) => list.filter((item) => item.id !== id));
    setSelected((current) => (current?.id === id ? null : current));
  }, []);

  const summary = useMemo(() => {
    const active = connections.filter((conn) => conn.status === 'CONNECTED').length;
    const failing = connections.filter((conn) => conn.status === 'ERROR').length;
    const paused = connections.filter((conn) => conn.status === 'PAUSED').length;
    return { active, failing, paused };
  }, [connections]);

  const detail = useMemo(() => {
    if (!selected) return null;
    return {
      ...selected,
      lastSyncRelative: formatRelative(selected.lastSyncAt),
      nextRunRelative: formatRelative(selected.nextRunAt),
      rateLimitLabel: rateLimitDescription(selected.rateLimit)
    };
  }, [selected]);

  return {
    catalog,
    connections,
    draft,
    setDraft,
    createConnection,
    updateStatus,
    removeConnection,
    selected,
    setSelected,
    summary,
    detail
  };
}
