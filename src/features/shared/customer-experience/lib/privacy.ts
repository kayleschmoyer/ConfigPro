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
  const anonymizePolicy = consentPrimitives.find(policy => policy.id === 'gdpr-marketing-communications');
  if (!anonymizePolicy) return false;
  const purgeText = anonymizePolicy.retentionWindow.purge ?? '';
  const monthsMatch = purgeText.match(/(\d+)/);
  const expiryMonths = monthsMatch ? Number(monthsMatch[1]) : 0;
  if (!expiryMonths) return false;
  const signedAt = new Date(customer.consents.privacyAcceptedAt);
  const threshold = new Date(signedAt.getTime() + expiryMonths * 30 * 24 * 60 * 60 * 1000);
  return Date.now() > threshold.getTime();
};

export const describeConsent = (customer: Customer) => {
  const marketing = customer.consents?.[MARKETING_CONSENT_KEY as keyof typeof customer.consents];
  const channel = customer.preferences?.channel ?? 'PORTAL';
  const signals = consentSignalChannels.map(({ channel: name }) => name).join(', ');
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
