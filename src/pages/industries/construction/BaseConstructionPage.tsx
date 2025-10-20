import { IndustryBasePage } from '../components/IndustryBasePage';

export const BaseConstructionPage = () => (
  <IndustryBasePage
    industry="construction"
    heroTitle="Construction & Field Services Base Package"
    heroSubtitle="Coordinate crews, compliance docs, and change orders with a single source of truth."
    heroDescription="Blueprint-driven deployments rely on document control, cost governance, and scheduling guardrails. ConfigPro ships the base package with tooling for project teams, subcontractor onboarding, and regulated workflows before the first site kickoff."
    highlights={[
      {
        label: 'Certified workflows',
        value: 'Pre-loaded',
        description: 'Digital document templates and approval paths for safety, permits, and compliance.',
      },
      {
        label: 'Change order velocity',
        value: 'Minutes',
        description: 'Route change orders to finance and site leads without leaving the platform.',
      },
      {
        label: 'Crew readiness',
        value: 'Live view',
        description: 'Scheduling, credential, and equipment assignments aligned across contractors.',
      },
    ]}
    focusAreas={[
      'Ingest project templates so cost codes and document packs deploy consistently.',
      'Stabilise subcontractor onboarding with shared permissions and audit trails.',
      'Pilot proactive notifications for critical path shifts and inspection holds.',
    ]}
  />
);

export default BaseConstructionPage;
