export type RegulationCode = 'GDPR' | 'CCPA' | 'Global';

type ConsentDefaultState = 'opt-in' | 'opt-out';

export interface ConsentPrimitive {
  id: string;
  title: string;
  regulation: RegulationCode;
  description: string;
  lawfulBasis: string[];
  defaultState: ConsentDefaultState;
  signals: string[];
  evidence: string[];
  retentionWindow: {
    hot: string;
    warm: string;
    cold: string;
    purge: string;
  };
}

export interface ConsentLifecycleStage {
  id: string;
  stage: string;
  objective: string;
  primarySystems: string[];
  guardrails: string[];
}

export interface ConsentSignalChannel {
  id: string;
  channel: string;
  description: string;
  examples: string[];
  auditNotes: string;
}

export const consentPrimitives: ConsentPrimitive[] = [
  {
    id: 'gdpr-marketing-communications',
    title: 'GDPR Marketing Communications',
    regulation: 'GDPR',
    description:
      'Explicit consent for proactive outreach, lifecycle marketing, and individualized promotions across EU/EEA residents.',
    lawfulBasis: ['Consent (Article 6.1.a)', 'Legitimate interest assessments recorded quarterly'],
    defaultState: 'opt-in',
    signals: ['web_portal.opt_in', 'support_case.follow_up', 'email_preference_center'],
    evidence: [
      'Timestamped signature with IP and device fingerprint',
      'Preference center snapshot stored alongside policy version',
      'Double opt-in confirmation event',
    ],
    retentionWindow: {
      hot: '18 months in operational marketing stack',
      warm: '24 months in analytics lake with pseudonymization',
      cold: '3 years encrypted in compliance vault for dispute handling',
      purge: 'Automated purge 36 months after last engagement or upon erasure request',
    },
  },
  {
    id: 'gdpr-workforce-onboarding',
    title: 'GDPR Workforce Onboarding',
    regulation: 'GDPR',
    description:
      'Processing consent covering identity verification, background screenings, and regulatory attestations for EU teammates.',
    lawfulBasis: ['Consent (Article 6.1.a)', 'Legal obligation to maintain employment records'],
    defaultState: 'opt-in',
    signals: ['hris.invite.accepted', 'identity_check.completed', 'policy.attestation.signed'],
    evidence: [
      'DocuSign packet with audit hash stored in ConfigPro trust ledger',
      'Third-party screening reference ID and completion transcript',
      'Policy bundle version attached to consent event',
    ],
    retentionWindow: {
      hot: 'Active + 12 months within HRIS and scheduling systems',
      warm: 'Additional 24 months in secure archive with role-based access',
      cold: '7 years encrypted per collective bargaining agreements',
      purge: 'Supervised purge triggered after retention lapse and legal hold verification',
    },
  },
  {
    id: 'ccpa-data-sale-opt-out',
    title: 'CCPA/CPRA Data Sale Opt-Out',
    regulation: 'CCPA',
    description:
      'Consumer directive instructing ConfigPro to block downstream sharing that qualifies as a sale or targeted advertising.',
    lawfulBasis: ['Opt-out right (Civil Code 1798.120)', 'Sensitive data restrictions (1798.121)'],
    defaultState: 'opt-out',
    signals: ['privacy_portal.do_not_sell', 'browser.gpc_signal', 'contact_center.request.recorded'],
    evidence: [
      'Ticket transcript with verified identity',
      'Global Privacy Control (GPC) header capture with request metadata',
      'CRM suppression list entry with policy snapshot',
    ],
    retentionWindow: {
      hot: 'Active state replicated to downstream ad/sale systems within 24 hours',
      warm: '4 years in privacy preference store for compliance verification',
      cold: 'Indefinite record of request metadata hashed for tamper evidence',
      purge: 'Metadata purge available upon consumer request once obligations satisfied',
    },
  },
  {
    id: 'global-analytics-measurement',
    title: 'Global Analytics Measurement',
    regulation: 'Global',
    description:
      'Baseline consent required for aggregated analytics and service quality monitoring outside of restricted categories.',
    lawfulBasis: ['Legitimate interest balancing tests', 'Service contract performance'],
    defaultState: 'opt-in',
    signals: ['product_telemetry.session_start', 'mobile_sdk.analytics_prompt', 'partner_webhook.preference_update'],
    evidence: [
      'Signed ConfigPro workspace agreement referencing analytics clause',
      'Telemetry manifest hashed into audit log with release version',
      'Consent banner payload stored with locale and timestamp',
    ],
    retentionWindow: {
      hot: '13 months in experience analytics stores',
      warm: '24 months aggregated in trend warehouse',
      cold: '5 years anonymized for capacity planning',
      purge: 'Redaction workflow available through privacy command center',
    },
  },
];

export const consentLifecycle: ConsentLifecycleStage[] = [
  {
    id: 'capture',
    stage: 'Capture & Verify',
    objective:
      'Collect the signal, validate the actor, and bind a policy snapshot to the consent record before activation.',
    primarySystems: ['ConfigPro Privacy Center', 'Identity Services', 'Notification Service'],
    guardrails: [
      'Enforce locale-aware disclosure templates',
      'Require MFA or notarized verification for high-risk revocations',
      'Embed machine-readable policy version and locale for downstream systems',
    ],
  },
  {
    id: 'propagate',
    stage: 'Propagate & Enforce',
    objective:
      'Distribute consent state to dependent services and block conflicting automations within defined SLAs.',
    primarySystems: ['Streaming Bus', 'Consent API', 'Experience Orchestrator'],
    guardrails: [
      'SLA breach alerts at 4-hour mark for pending opt-out propagation',
      'Immutable event ledger ensures sequencing for legal review',
      'Regional routing maps align with data residency obligations',
    ],
  },
  {
    id: 'attest',
    stage: 'Attest & Report',
    objective:
      'Surface evidentiary packages for DSAR responses, regulator inquiries, and quarterly audits.',
    primarySystems: ['Audit Log Service', 'Data Warehouse', 'Privacy Command Center'],
    guardrails: [
      'Versioned evidence bundles stored with retention clocks',
      'Redaction workflow logged with supervisory approval references',
      'API-first attestations with signed responses for auditors',
    ],
  },
];

export const consentSignalChannels: ConsentSignalChannel[] = [
  {
    id: 'web-portals',
    channel: 'Web & Workspace Portals',
    description: 'In-product banner experiences and admin workspaces where actors manage their privacy posture.',
    examples: ['ConfigPro Workforce portal', 'Org admin console', 'Self-service DSAR microsite'],
    auditNotes: 'Capture locale, device, IP, and UI variant to prove just-in-time disclosure alignment.',
  },
  {
    id: 'support-operations',
    channel: 'Support Operations',
    description: 'Contact center, chat, and field support capturing oral or written requests that impact consent state.',
    examples: ['Zendesk privacy queue', 'Retail store escalation hotline', 'Field operations Slack channel'],
    auditNotes: 'Attach call recording transcript hash and agent badge ID for defensibility.',
  },
  {
    id: 'automated-signals',
    channel: 'Automated Signals',
    description: 'Machine-to-machine instructions honoring state-level mandates and browser privacy controls.',
    examples: ['GPC headers', 'Partner webhook suppression', 'Data broker sync feedback loop'],
    auditNotes: 'Signed payloads rotated quarterly with dedicated certificate store and replay detection.',
  },
];
