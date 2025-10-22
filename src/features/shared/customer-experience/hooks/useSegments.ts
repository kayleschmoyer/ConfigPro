import { useMemo, useState } from 'react';
import { previewSegment, segmentFields, buildEmptySegment } from '../lib/segments';
import type { Customer, Segment, SegmentExpression } from '../lib';
import { usePortal } from './usePortal';

const sampleCustomers: Customer[] = [
  {
    id: 'customer-1',
    firstName: 'Jordan',
    lastName: 'Chen',
    email: 'jordan.chen@example.com',
    custom: { preferred_name: 'Jordy', style_persona: ['Modern'] },
    consents: { marketing: true, privacyAcceptedAt: new Date().toISOString() },
    preferences: { channel: 'PORTAL' }
  },
  {
    id: 'customer-2',
    firstName: 'Priya',
    lastName: 'Singh',
    email: 'priya.singh@example.com',
    custom: { style_persona: ['Comfort'], identity_confidence: 0.96 },
    consents: { marketing: false }
  },
  {
    id: 'customer-3',
    firstName: 'Alejandro',
    lastName: 'Ríos',
    email: 'alejandro.rios@example.com',
    custom: { communication_language: 'es-ES' },
    consents: { marketing: true }
  }
];

export const useSegments = () => {
  const { snapshot } = usePortal();
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: 'segment-1',
      name: 'High value fans',
      rules: {
        type: 'GROUP',
        condition: 'AND',
        children: [
          { type: 'LEAF', field: 'loyalty.points', operator: 'GTE', value: 5000 },
          { type: 'LEAF', field: 'feedback.nps', operator: 'GTE', value: 8 }
        ]
      }
    }
  ]);

  const addSegment = (name: string, rules: SegmentExpression) =>
    setSegments(current => [...current, { id: `segment-${current.length + 1}`, name, rules }]);

  const activeCustomers: Customer[] = useMemo(
    () => [snapshot.customer, ...sampleCustomers],
    [snapshot.customer]
  );

  const previews = useMemo(
    () =>
      segments.map(segment => ({
        segment,
        preview: previewSegment(segment, activeCustomers, () => ({
          loyalty: snapshot.loyalty,
          responses: snapshot.responses,
          behaviors: { lastPurchaseDays: 12, totalSpend: 620000, appointmentFrequency: 2 },
          events: { invoice_overdue: snapshot.invoices.some(invoice => invoice.status === 'OVERDUE') }
        }))
      })),
    [segments, activeCustomers, snapshot]
  );

  return { segments, previews, addSegment, fields: segmentFields };
};

export const useSegmentBuilder = () => {
  const [draft, setDraft] = useState<Segment>(buildEmptySegment());
  const updateName = (name: string) => setDraft(current => ({ ...current, name }));
  const updateRules = (rules: SegmentExpression) => setDraft(current => ({ ...current, rules }));
  return { draft, updateName, updateRules };
};
