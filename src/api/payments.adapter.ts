export type PaymentGatewayMode = 'test' | 'live';

export type PaymentGatewayStatus = 'connected' | 'pending' | 'disconnected';

export interface PaymentGatewayWebhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'disabled';
}

export interface PaymentGatewayDescriptor {
  id: string;
  provider: string;
  displayName: string;
  status: PaymentGatewayStatus;
  modes: PaymentGatewayMode[];
  capabilities: string[];
  regions: string[];
  reconciliationWindowDays: number;
  webhooks: PaymentGatewayWebhook[];
  metadata?: Record<string, string>;
  updatedAt: string;
}

export interface CredentialRotationEvent {
  id: string;
  gatewayId: string;
  mode: PaymentGatewayMode;
  rotatedAt: string;
  rotatedBy: string;
  notes?: string;
}

export interface PaymentProviderAdapter {
  listGateways(): Promise<PaymentGatewayDescriptor[]>;
  getGateway(id: string): Promise<PaymentGatewayDescriptor | null>;
  upsertGateway(descriptor: Omit<PaymentGatewayDescriptor, 'updatedAt'>): Promise<PaymentGatewayDescriptor>;
  removeGateway(id: string): Promise<void>;
  rotateCredential(
    id: string,
    mode: PaymentGatewayMode,
    rotatedBy: string,
    notes?: string,
  ): Promise<CredentialRotationEvent>;
  getRotationLog(id: string): Promise<CredentialRotationEvent[]>;
}

class InMemoryPaymentProviderAdapter implements PaymentProviderAdapter {
  private gateways = new Map<string, PaymentGatewayDescriptor>();
  private rotations = new Map<string, CredentialRotationEvent[]>();

  async listGateways(): Promise<PaymentGatewayDescriptor[]> {
    return Array.from(this.gateways.values());
  }

  async getGateway(id: string): Promise<PaymentGatewayDescriptor | null> {
    return this.gateways.get(id) ?? null;
  }

  async upsertGateway(
    descriptor: Omit<PaymentGatewayDescriptor, 'updatedAt'>,
  ): Promise<PaymentGatewayDescriptor> {
    const updated: PaymentGatewayDescriptor = {
      ...descriptor,
      updatedAt: new Date().toISOString(),
    };
    this.gateways.set(updated.id, updated);
    if (!this.rotations.has(updated.id)) {
      this.rotations.set(updated.id, []);
    }
    return updated;
  }

  async removeGateway(id: string): Promise<void> {
    this.gateways.delete(id);
    this.rotations.delete(id);
  }

  async rotateCredential(
    id: string,
    mode: PaymentGatewayMode,
    rotatedBy: string,
    notes?: string,
  ): Promise<CredentialRotationEvent> {
    if (!this.gateways.has(id)) {
      throw new Error(`Gateway ${id} not found`);
    }
    const event: CredentialRotationEvent = {
      id: `${id}-${mode}-${Date.now()}`,
      gatewayId: id,
      mode,
      rotatedAt: new Date().toISOString(),
      rotatedBy,
      notes,
    };
    const history = this.rotations.get(id) ?? [];
    history.push(event);
    this.rotations.set(id, history);
    return event;
  }

  async getRotationLog(id: string): Promise<CredentialRotationEvent[]> {
    return this.rotations.get(id) ?? [];
  }
}

let adapterInstance: PaymentProviderAdapter | null = null;

export const getPaymentProviderAdapter = (): PaymentProviderAdapter => {
  if (!adapterInstance) {
    adapterInstance = new InMemoryPaymentProviderAdapter();
  }
  return adapterInstance;
};

export const resetPaymentProviderAdapter = () => {
  adapterInstance = null;
};

export const createTestPaymentAdapter = () => new InMemoryPaymentProviderAdapter();
