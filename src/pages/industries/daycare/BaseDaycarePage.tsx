import { IndustryBasePage } from '../components/IndustryBasePage';

export const BaseDaycarePage = () => (
  <IndustryBasePage
    industry="daycare"
    heroTitle="Childcare & Enrichment Base Package"
    heroSubtitle="Keep ratios compliant, guardians informed, and tuition flowing from the first login."
    heroDescription="Purpose-built workflows for childcare operators blend attendance, billing, and guardian communication so programmes can scale without losing trust. The base package focuses on coverage, credential tracking, and the digital paperwork families expect."
    highlights={[
      {
        label: 'Safety checklists',
        value: 'Automated',
        description: 'Guardian consents, emergency contacts, and document renewals stay current.',
      },
      {
        label: 'Billing sync',
        value: 'Real-time',
        description: 'Payments, subsidies, and arrears surfaced for quick follow-up.',
      },
      {
        label: 'Family communications',
        value: 'Unified',
        description: 'Notifications route to guardians, staff, and regulators with one source of truth.',
      },
    ]}
    focusAreas={[
      'Centralise rosters, allergies, and pickup permissions before the first cohort arrives.',
      'Automate recurring invoices, subsidy adjustments, and late fee handling.',
      'Stand up guardian engagement journeys with daily digests and incident visibility.',
    ]}
  />
);

export default BaseDaycarePage;
