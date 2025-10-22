import type { ReactNode } from 'react';

export type ID = string;
export type ISO = string;

export type ConnectorKind =
  | 'QUICKBOOKS'
  | 'GOOGLE'
  | 'STRIPE'
  | 'TWILIO'
  | 'SLACK'
  | 'CUSTOM';

export type AuthMode = 'OAUTH2_PKCE' | 'SERVICE_ACCOUNT' | 'API_KEY';

export type ConnectorCatalogItem = {
  kind: ConnectorKind;
  name: string;
  description?: string;
  scopes: string[];
  domains: Array<'CUSTOMERS' | 'INVOICES' | 'PAYMENTS' | 'FILES' | 'MESSAGING' | 'CALENDAR'>;
};

export type ConnectionStatus = 'CONNECTED' | 'EXPIRED' | 'PAUSED' | 'ERROR';

export type Connection = {
  id: ID;
  kind: ConnectorKind;
  authMode: AuthMode;
  name: string;
  status: ConnectionStatus;
  scopes: string[];
  environment: 'SANDBOX' | 'PROD';
  createdAt: ISO;
  updatedAt: ISO;
  lastSyncAt?: ISO;
  nextRunAt?: ISO;
  mapping?: FieldMapping[];
  rateLimit?: { perMin?: number; burst?: number };
};

export type FieldMapping = {
  id: ID;
  domain: 'CUSTOMERS' | 'INVOICES' | 'PAYMENTS' | 'FILES' | 'MESSAGING' | 'CALENDAR';
  sourceField: string;
  targetField: string;
  transform?: string;
  required?: boolean;
  sample?: unknown;
};

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export type ApiKey = {
  id: ID;
  prefix: string;
  masked: string;
  createdAt: ISO;
  expiresAt?: ISO;
  scopes: string[];
  restrictions?: {
    ipAllow?: string[];
    referers?: string[];
    ratePerMin?: number;
    env?: 'SANDBOX' | 'PROD';
  };
  status: ApiKeyStatus;
};

export type WebhookEndpoint = {
  id: ID;
  url: string;
  description?: string;
  environment: 'SANDBOX' | 'PROD';
  signing: { algo: 'HMAC_SHA256'; secretPrefix: string; rotatedAt?: ISO };
  enabled: boolean;
  version?: string;
};

export type SyncJobStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR';

export type SyncJob = {
  id: ID;
  connectionId: ID;
  domain: FieldMapping['domain'];
  schedule: string;
  status: SyncJobStatus;
  lastRun?: {
    at: ISO;
    durationMs: number;
    processed: number;
    failed: number;
    result: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  };
  nextRunAt?: ISO;
};

export type LogEventLevel = 'INFO' | 'WARN' | 'ERROR';

export type LogEvent = {
  id: ID;
  at: ISO;
  level: LogEventLevel;
  connectionId?: ID;
  jobId?: ID;
  correlationId?: string;
  code?: string;
  message: string;
  details?: unknown;
  redacted?: boolean;
};

export type RetryPolicyPreset = {
  id: string;
  label: string;
  description: string;
  backoffMs: number[];
};

export type Environment = 'SANDBOX' | 'PROD';

export type NavAction = {
  id: string;
  label: string;
  description: string;
  icon?: ReactNode;
  shortcut?: string;
  to: string;
};

export type SecretMask = {
  prefix: string;
  masked: string;
};
