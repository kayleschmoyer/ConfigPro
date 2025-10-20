import { beforeEach, describe, expect, it } from 'vitest';
import {
  createTestPaymentAdapter,
  getPaymentProviderAdapter,
  resetPaymentProviderAdapter,
  type PaymentGatewayDescriptor,
} from '../payments.adapter';

const baseGateway: Omit<PaymentGatewayDescriptor, 'updatedAt'> = {
  id: 'stripe-core',
  provider: 'stripe',
  displayName: 'Stripe Core',
  status: 'pending',
  modes: ['test'],
  capabilities: ['card', 'wallets'],
  regions: ['NA', 'EU'],
  reconciliationWindowDays: 7,
  webhooks: [
    {
      id: 'billing',
      url: 'https://configpro.test/webhooks/billing',
      events: ['charge.succeeded'],
      status: 'active',
    },
  ],
  metadata: {
    contractOwner: 'finance.ops',
  },
};

describe('Payment provider adapter', () => {
  beforeEach(() => {
    resetPaymentProviderAdapter();
  });

  it('provides a singleton instance for app usage', async () => {
    const first = getPaymentProviderAdapter();
    const second = getPaymentProviderAdapter();
    expect(first).toBe(second);

    await first.upsertGateway(baseGateway);
    const gateways = await second.listGateways();
    expect(gateways).toHaveLength(1);
    expect(gateways[0].id).toBe(baseGateway.id);
  });

  it('stores gateways with updated timestamps and retrieves them', async () => {
    const adapter = createTestPaymentAdapter();
    const stored = await adapter.upsertGateway(baseGateway);

    expect(stored.updatedAt).toBeTypeOf('string');
    const retrieved = await adapter.getGateway(baseGateway.id);
    expect(retrieved?.displayName).toBe('Stripe Core');

    const updated = await adapter.upsertGateway({ ...baseGateway, displayName: 'Stripe Payments' });
    expect(updated.displayName).toBe('Stripe Payments');
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(stored.updatedAt).getTime(),
    );
  });

  it('tracks credential rotations per gateway and validates membership', async () => {
    const adapter = createTestPaymentAdapter();
    await adapter.upsertGateway({ ...baseGateway, id: 'adyen-live', provider: 'adyen' });

    const rotation = await adapter.rotateCredential('adyen-live', 'live', 'security.bot', 'Quarterly rotation');
    expect(rotation.mode).toBe('live');

    const log = await adapter.getRotationLog('adyen-live');
    expect(log).toHaveLength(1);
    expect(log[0].notes).toBe('Quarterly rotation');
  });

  it('removes gateways and their rotation logs', async () => {
    const adapter = createTestPaymentAdapter();
    await adapter.upsertGateway(baseGateway);
    await adapter.rotateCredential(baseGateway.id, 'test', 'ci-bot');

    await adapter.removeGateway(baseGateway.id);

    expect(await adapter.getGateway(baseGateway.id)).toBeNull();
    expect(await adapter.getRotationLog(baseGateway.id)).toHaveLength(0);
  });

  it('throws when rotating credentials for an unknown gateway', async () => {
    const adapter = createTestPaymentAdapter();
    await expect(() => adapter.rotateCredential('missing', 'test', 'ops')).rejects.toThrow('Gateway missing not found');
  });
});
