import { IndustryBasePage } from '../components/IndustryBasePage';

export const BaseAutomotivePage = () => (
  <IndustryBasePage
    industry="automotive"
    heroTitle="Automotive Services Base Package"
    heroSubtitle="Service drives, parts counters, and recon teams align behind one operations layer."
    heroDescription="Dealer groups and mobility operators get a foundation for appointment orchestration, repair order transparency, and inventory accuracy. The base package captures every vehicle touchpoint while unlocking smarter upsell and retention journeys."
    highlights={[
      {
        label: 'Repair order insights',
        value: 'Real-time',
        description: 'Track throughput, approvals, and technician workload by bay and location.',
      },
      {
        label: 'Parts availability',
        value: 'Connected',
        description: 'Inventory visibility syncs with vendor SLAs and offline stock audits.',
      },
      {
        label: 'Customer follow-through',
        value: 'Automated',
        description: 'Notifications and campaigns trigger around RO status, warranties, and recalls.',
      },
    ]}
    focusAreas={[
      'Mirror OEM-required workflows inside shared documents and audit logs.',
      'Level-up technician scheduling with loaner fleet and bay utilisation context.',
      'Instrument loyalty programs that tie service outcomes to retention metrics.',
    ]}
  />
);

export default BaseAutomotivePage;
