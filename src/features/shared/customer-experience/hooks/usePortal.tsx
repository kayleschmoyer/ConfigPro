 
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { baseTheme, resolveTheme } from '@/app/config/theme';
import type {
  Appointment,
  Journey,
  Message,
  PortalSnapshot,
  Reward,
  Survey,
  SurveyResponse
} from '../lib';

const PortalContext = createContext<PortalState | undefined>(undefined);

type PortalState = {
  snapshot: PortalSnapshot;
  loading: boolean;
  error?: Error;
  refresh: () => void;
};

const sampleSurveys: Survey[] = [
  {
    id: 'survey-nps',
    name: 'Service follow-up',
    type: 'NPS',
    questions: [
      {
        id: 'q1',
        kind: 'SCALE',
        prompt: 'How likely are you to recommend ConfigPro services to a friend?',
        options: Array.from({ length: 11 }, (_, index) => `${index}`)
      }
    ],
    rewardPoints: 250,
    trigger: { kind: 'after_invoice_paid' }
  },
  {
    id: 'survey-csat',
    name: 'Appointment feedback',
    type: 'CSAT',
    questions: [
      { id: 'q1', kind: 'SCALE', prompt: 'Rate your appointment experience (1-5).' },
      { id: 'q2', kind: 'TEXT', prompt: 'Any additional comments?' }
    ],
    trigger: { kind: 'after_appointment' }
  }
];

const sampleResponses: SurveyResponse[] = [
  {
    id: 'resp-1',
    surveyId: 'survey-nps',
    customerId: 'customer-1',
    at: new Date().toISOString(),
    answers: { q1: 9 },
    npsScore: 9
  },
  {
    id: 'resp-2',
    surveyId: 'survey-csat',
    customerId: 'customer-1',
    at: new Date().toISOString(),
    answers: { q1: 5, q2: 'Technician was fantastic.' },
    csat: 5
  }
];

const sampleRewards: Reward[] = [
  { id: 'reward-checkout', name: 'Checkout credit', pointsCost: 500, kind: 'CREDIT' },
  { id: 'reward-gift', name: 'Gift bundle', pointsCost: 1500, kind: 'GIFT' },
  { id: 'reward-donation', name: 'Community donation', pointsCost: 800, kind: 'COUPON' }
];

const sampleMessages: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    from: 'STAFF',
    at: new Date().toISOString(),
    text: 'Your next appointment is confirmed for tomorrow at 10:00.',
    read: false
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    from: 'CUSTOMER',
    at: new Date().toISOString(),
    text: 'Thanks for the confirmation! Can I add a note for the technician?',
    read: true
  }
];

const sampleAppointments: Appointment[] = [
  {
    id: 'appt-1',
    startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    locationId: 'loc-1',
    status: 'BOOKED',
    notes: 'Gate code 8452'
  }
];

const sampleJourneys: Journey[] = [
  {
    id: 'journey-1',
    name: 'AR recovery',
    trigger: { kind: 'INVOICE_OVERDUE' },
    enabled: true,
    steps: [
      {
        id: 'step-1',
        action: 'SEND_MESSAGE',
        params: { channel: 'EMAIL', templateId: 'invoice-reminder' }
      },
      { id: 'step-2', action: 'ISSUE_REWARD', params: { rewardId: 'reward-checkout', points: 500 } }
    ]
  }
];

const sampleSnapshot: PortalSnapshot = {
  customer: {
    id: 'customer-1',
    firstName: 'Jordan',
    lastName: 'Chen',
    email: 'jordan.chen@example.com',
    phone: '+1 (555) 310-2020',
    custom: {
      preferred_name: 'Jordy',
      communication_language: 'en-US',
      style_persona: ['Modern', 'Comfort'],
      loyalty_currency_wallet: 'wallet-1'
    },
    preferences: { channel: 'PORTAL', locale: 'en-US', timezone: 'America/New_York' },
    consents: { marketing: true, privacyAcceptedAt: new Date().toISOString() }
  },
  theme: resolveTheme(),
  invoices: [
    {
      id: 'inv-1',
      number: 'INV-2045',
      issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'OPEN',
      total: { currency: 'USD', value: 18500 },
      balance: { currency: 'USD', value: 13500 }
    },
    {
      id: 'inv-2',
      number: 'INV-2035',
      issueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PAID',
      total: { currency: 'USD', value: 8900 },
      balance: { currency: 'USD', value: 0 }
    }
  ],
  orders: [
    {
      id: 'order-1',
      number: 'WO-8842',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'In progress',
      total: { currency: 'USD', value: 21500 }
    },
    {
      id: 'order-2',
      number: 'ORD-1123',
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
      total: { currency: 'USD', value: 9900 }
    }
  ],
  appointments: sampleAppointments,
  messages: sampleMessages,
  loyalty: {
    customerId: 'customer-1',
    points: 6200,
    pending: 400,
    tier: 'Gold',
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      {
        at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        delta: 1200,
        reason: 'Work order completion bonus'
      },
      {
        at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        delta: -500,
        reason: 'Checkout redemption',
        refId: 'inv-2035'
      }
    ]
  },
  rewards: sampleRewards,
  surveys: sampleSurveys,
  responses: sampleResponses,
  documents: [
    {
      id: 'doc-1',
      name: 'Roofing project proposal.pdf',
      type: 'Proposal',
      uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      size: 2.4 * 1024 * 1024,
      url: '#'
    },
    {
      id: 'doc-2',
      name: 'Service agreement 2024.pdf',
      type: 'Contract',
      uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      size: 1.1 * 1024 * 1024,
      url: '#'
    }
  ]
};

export const PortalProvider = ({ children }: { children: ReactNode }) => {
  const [snapshot, setSnapshot] = useState<PortalSnapshot>(sampleSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (cancelled) return;
      try {
        setSnapshot(current => ({ ...current, theme: resolveTheme(baseTheme.name) }));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }, 160);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setSnapshot(current => ({ ...current, theme: resolveTheme(baseTheme.name) }));
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const value = useMemo<PortalState>(
    () => ({
      snapshot,
      loading,
      error,
      refresh
    }),
    [snapshot, loading, error, refresh]
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};

export const usePortalJourneys = () => sampleJourneys;
export const usePortalMessages = () => sampleMessages;
