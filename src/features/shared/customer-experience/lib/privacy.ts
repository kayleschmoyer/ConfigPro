import {
  consentLifecycle,
  consentPrimitives,
  consentSignalChannels
} from '@/pages/shared/features/privacy.consents';
import type { Customer } from './types';

const MARKETING_CONSENT_KEY = 'marketing';

export const canContactCustomer = (customer: Customer, channel: 'PORTAL' | 'EMAIL' | 'SMS') => {
  if (!customer.consents) return false;
  if (channel === 'PORTAL') return true;
  const consentValue = customer.consents[MARKETING_CONSENT_KEY as keyof typeof customer.consents];
  return Boolean(consentValue);
};

export const filterMarketingChannels = (customer: Customer) =>
  (['PORTAL', 'EMAIL', 'SMS'] as const).filter(channel => canContactCustomer(customer, channel));

export const shouldAnonymize = (customer: Customer) => {
  if (!customer.consents?.privacyAcceptedAt) return true;
  const lifecycle = consentLifecycle?.policies?.anonymizeWithoutConsent;
  if (!lifecycle) return false;
  const signedAt = new Date(customer.consents.privacyAcceptedAt);
  const expiryDays = lifecycle.expireAfterDays ?? 0;
  if (!expiryDays) return false;
  const threshold = new Date(signedAt.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  return Date.now() > threshold.getTime();
};

export const describeConsent = (customer: Customer) => {
  const marketing = customer.consents?.[MARKETING_CONSENT_KEY as keyof typeof customer.consents];
  const channel = customer.preferences?.channel ?? 'PORTAL';
  const signals = consentSignalChannels?.channels?.join(', ');
  return {
    marketingEnabled: Boolean(marketing),
    preferredChannel: channel,
    signals: signals || 'PORTAL'
  };
};

export const consentMetadata = {
  primitives: consentPrimitives,
  lifecycle: consentLifecycle,
  signals: consentSignalChannels
};
