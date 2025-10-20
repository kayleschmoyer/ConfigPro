import {
  getPaymentProviderAdapter,
  type PaymentGatewayDescriptor,
} from '../../../api/payments.adapter';

export const SANDBOX_GATEWAY_ID = 'sandbox-pay';

const sandboxGatewayDescriptor: Omit<PaymentGatewayDescriptor, 'updatedAt'> = {
  id: SANDBOX_GATEWAY_ID,
  provider: 'sandboxpay',
  displayName: 'SandboxPay',
  status: 'connected',
  modes: ['test'],
  capabilities: ['card', 'ach', 'terminal', 'auto-approve'],
  regions: ['NA'],
  reconciliationWindowDays: 1,
  webhooks: [
    {
      id: 'sandbox-approvals',
      url: 'https://sandboxpay.dev/webhooks/approvals',
      events: ['payment.approved', 'refund.processed'],
      status: 'active',
    },
  ],
  metadata: {
    approvalPolicy: 'always-approve',
    dashboardUrl: 'https://dashboard.sandboxpay.dev',
    supportEmail: 'success@sandboxpay.dev',
  },
};

export const registerSandboxPayMock = async () => {
  const adapter = getPaymentProviderAdapter();
  const existing = await adapter.getGateway(SANDBOX_GATEWAY_ID);

  if (!existing) {
    await adapter.upsertGateway(sandboxGatewayDescriptor);
  }

  const rotationLog = await adapter.getRotationLog(SANDBOX_GATEWAY_ID);
  if (rotationLog.length === 0) {
    await adapter.rotateCredential(
      SANDBOX_GATEWAY_ID,
      'test',
      'sandbox.dev-bot',
      'Auto-issued sandbox key (approves every transaction)',
    );
  }
};

void registerSandboxPayMock().catch((error) => {
  console.warn('[dev:mocks] Failed to register SandboxPay mock', error);
});
