export interface PaymentRequest {
  amount: number;
  currency: string;
  meta?: Record<string, unknown>;
}

export interface PaymentProvider {
  id: string;
  displayName: string;
  capture(
    req: PaymentRequest,
  ): Promise<{ id: string; status: "approved" | "declined" }>;
  refund(paymentId: string, amount?: number): Promise<void>;
  test?(): Promise<boolean>;
}

const Registry = new Map<string, PaymentProvider>();

export const registerPaymentProvider = (provider: PaymentProvider) =>
  Registry.set(provider.id, provider);

export const getPaymentProvider = (id: string) => Registry.get(id);
