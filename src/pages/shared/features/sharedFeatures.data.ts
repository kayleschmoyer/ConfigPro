export type SharedFeatureStatus = 'planned' | 'in-progress' | 'available';

export interface SharedFeature {
  id: string;
  title: string;
  summary?: string;
  systems: string[];
  status: SharedFeatureStatus;
  href?: string;
}

export interface SharedFeatureGroup {
  id: string;
  title: string;
  description?: string;
  features: SharedFeature[];
}

export const sharedFeatureGroups: SharedFeatureGroup[] = [
  {
    id: 'core-workflows',
    title: 'Core Workflows',
    description: 'Reusable flows shared across ConfigPro experiences.',
    features: [
      {
        id: 'forecast-to-schedule-orchestration',
        title: 'Forecast-to-Schedule Orchestration',
        summary: 'Connect the AuroraDemandNet forecasting workspace to scheduling coverage plans with shared guardrails.',
        systems: ['Forecasting', 'Scheduling'],
        status: 'in-progress',
      },
      {
        id: 'adaptive-time-intelligence-hub',
        title: 'Adaptive Time Intelligence Hub',
        summary:
          'Elite time intelligence flows that choreograph scheduling intent, live demand, and compliance automation into a concierge punch experience.',
        systems: ['Scheduling', 'Forecasting', 'Time Intelligence'],
        status: 'in-progress',
        href: '/shared/time-intelligence-hub',
      },
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connections and services accessible from any system.',
    features: []
  },
  {
    id: 'supporting-tools',
    title: 'Supporting Tools',
    description: 'Utilities and enablement shared between teams.',
    features: [
      {
        id: 'users-and-roles-foundation',
        title: 'Users & Roles Foundation',
        summary:
          'Unified RBAC and ABAC modeling with invitation orchestration for every ConfigPro org.',
        systems: ['Scheduling', 'Forecasting', 'Shared Platform'],
        status: 'in-progress',
        href: '/shared/users-and-roles',
      },
    ]
  }
];
