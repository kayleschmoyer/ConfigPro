export type Money = { currency: string; value: number };
export type ID = string;
export type ISO = string;

export type Vendor = {
  id: ID;
  name: string;
  taxId?: string;
  terms?: string;
  defaultCurrency?: string;
  paymentMethods?: Array<'ACH' | 'CHECK' | 'CARD' | 'WIRE'>;
  bankVerified?: boolean;
  riskScore?: number;
  tags?: string[];
  contacts?: { name: string; email?: string; phone?: string }[];
  docs?: { kind: 'W9' | 'W8' | 'INSURANCE' | 'CONTRACT'; url: string; expiresAt?: ISO }[];
};

export type BillLine = {
  id: ID;
  sku?: string;
  description?: string;
  qty: number;
  unitPrice: Money;
  tax?: Money;
  glCode?: string;
  projectId?: ID;
};

export type Bill = {
  id: ID;
  number?: string;
  vendorId: ID;
  poId?: ID;
  issueDate: ISO;
  dueDate?: ISO;
  terms?: string;
  subtotal: Money;
  tax?: Money;
  freight?: Money;
  total: Money;
  status: 'DRAFT' | 'REVIEW' | 'APPROVAL' | 'APPROVED' | 'SCHEDULED' | 'PAID' | 'VOID' | 'HOLD';
  balance: Money;
  discount?: { percent?: number; dueBy?: ISO };
  lines: BillLine[];
  attachments?: string[];
  ocr?: { confidence: number; fields: Record<string, string> };
  match?: {
    receivingId?: ID;
    variance?: { qty?: number; price?: number; tax?: number };
    withinTolerance?: boolean;
  };
  approvals?: { approverId: ID; status: 'PENDING' | 'APPROVED' | 'REJECTED'; at?: ISO; note?: string }[];
  audit: { at: ISO; by: string; change: string }[];
  flags?: string[];
};

export type PO = {
  id: ID;
  number: string;
  vendorId: ID;
  issueDate: ISO;
  status: 'DRAFT' | 'SENT' | 'PARTIAL_RECEIVED' | 'RECEIVED' | 'CLOSED';
  lines: BillLine[];
  total: Money;
};

export type Receiving = {
  id: ID;
  poId: ID;
  at: ISO;
  lines: { poLineId: ID; qty: number }[];
  files?: string[];
  receivedBy?: string;
};

export type PaymentInstruction = {
  id: ID;
  method: 'ACH' | 'CHECK' | 'CARD' | 'WIRE';
  vendorId: ID;
  bills: { billId: ID; amount: Money }[];
  scheduledFor: ISO;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'PAID' | 'FAILED';
  reference?: string;
  remittanceUrl?: string;
  fees?: Money;
};

export type Rule = {
  id: ID;
  name: string;
  trigger: string;
  conditions?: Record<string, unknown>;
  actions: { type: string; params: Record<string, unknown> }[];
  enabled: boolean;
};
