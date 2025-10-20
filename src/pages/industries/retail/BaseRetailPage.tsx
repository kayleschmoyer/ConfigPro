import { IndustryBasePage } from '../components/IndustryBasePage';

export const BaseRetailPage = () => (
  <IndustryBasePage
    industry="retail"
    heroTitle="Omni-channel Retail Base Package"
    heroSubtitle="Synchronise stores, fulfilment pods, and curbside handoffs without extra configuration."
    heroDescription="Retail deployments start with the operational backbone that balances frontline staffing, inventory visibility, and compliance for regulated categories. Expand into advanced forecasting and loyalty orchestration as pilots mature."
    highlights={[
      {
        label: 'Core modules',
        value: '9',
        description: 'Ready-to-launch workflows spanning workforce, catalog, and revenue management.',
      },
      {
        label: 'Fulfilment coverage',
        value: '95%+',
        description: 'Service-level targets for ship-from-store and click-and-collect queues.',
      },
      {
        label: 'Regulated department guardrails',
        value: 'Enabled',
        description: 'Tax, pricing, and permission templates tuned for compliance-heavy assortments.',
      },
    ]}
    focusAreas={[
      'Blend footfall, ecommerce, and event signals to protect staffing buffers.',
      'Rollout guided catalog governance before exposing regional product extensions.',
      'Pilot proactive notifications for curbside SLAs and high-value loyalty members.',
    ]}
  />
);

export default BaseRetailPage;
