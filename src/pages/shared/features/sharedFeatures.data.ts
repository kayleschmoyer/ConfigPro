export type SharedFeatureStatus = 'planned' | 'in-progress' | 'available';

export interface SharedFeature {
  id: string;
  title: string;
  summary?: string;
  systems: string[];
  status: SharedFeatureStatus;
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
    features: []
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
    features: []
  }
];
