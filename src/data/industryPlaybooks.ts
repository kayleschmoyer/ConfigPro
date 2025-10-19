import type { ScheduleInsights } from '../modules/scheduling';

export interface IndustryPlaybookMetric {
  label: string;
  description: string;
  format: (insights: ScheduleInsights | null) => string;
}

export interface IndustryPlaybook {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  metrics: IndustryPlaybookMetric[];
  focusAreas: string[];
  automationWins: string[];
}

const formatPercent = (value: number | undefined) =>
  `${Number.isFinite(value ?? NaN) ? Math.round((value ?? 0) * 10) / 10 : 0}%`;

const buildMetric = (label: string, description: string, getter: (insights: ScheduleInsights | null) => number) => ({
  label,
  description,
  format: (insights: ScheduleInsights | null) => formatPercent(getter(insights)),
});

export const industryPlaybooks: IndustryPlaybook[] = [
  {
    id: 'retail-flex',
    name: 'Omni-channel Retail',
    subtitle: 'Balance showroom, curbside, and fulfillment crews in minutes.',
    description:
      'Optimise for unpredictable foot traffic and click-and-collect surges with automated coverage tuning across every location.',
    metrics: [
      buildMetric('Coverage certainty', 'Windows with full headcount coverage.', (insights) => insights?.coverageScore ?? 0),
      buildMetric('Workforce utilisation', 'Average hours vs. preferred targets.', (insights) => insights?.utilisation ?? 0),
      buildMetric('Overtime risk', 'Team members nearing overtime thresholds.', (insights) => insights?.overtimeRisk ?? 0),
    ],
    focusAreas: [
      'AI-driven staffing buffers for event days and peak trading hours.',
      'Role-based guardrails for regulated departments (pharmacy, alcohol, specialty).',
      'Instant what-if modelling for product launches or promotional periods.',
    ],
    automationWins: [
      'Sync live demand signals from POS, ecommerce, and traffic counters.',
      'Pre-build flex pools with certifications and cross-training tags.',
      'Deliver proactive alerts when regional stores fall below planned coverage.',
    ],
  },
  {
    id: 'hospitality-express',
    name: 'Hospitality & Events',
    subtitle: 'Stage-perfect service for banquets, resorts, and venue crews.',
    description:
      'Coordinate front-of-house, culinary, and facilities teams while maintaining compliance for every jurisdiction and union.',
    metrics: [
      buildMetric('Coverage certainty', 'Windows with full headcount coverage.', (insights) => insights?.coverageScore ?? 0),
      buildMetric('Fairness index', 'Variance in assigned hours across teams.', (insights) => insights?.fairnessIndex ?? 0),
      buildMetric('Automation velocity', 'Generated shifts vs. forecast demand.', (insights) => insights?.staffingVelocity ?? 0),
    ],
    focusAreas: [
      'Premium guest journeys powered by predictive staffing of concierge and housekeeping roles.',
      'Local labour rules packaged into shareable, auditable playbooks.',
      'Smart break placement to maintain service continuity across dayparts.',
    ],
    automationWins: [
      'Pair shift bidding with upsell goals and VIP coverage.',
      'Auto-approve swaps that maintain qualification balance.',
      'Spin up pop-up venue rosters with one click scenario cloning.',
    ],
  },
  {
    id: 'clinical-precision',
    name: 'Healthcare & Life Sciences',
    subtitle: 'Safeguard compliance while elevating patient throughput.',
    description:
      'Blend acuity-based scheduling with credential tracking so every ward and lab meets mandated staffing ratios.',
    metrics: [
      buildMetric('Coverage certainty', 'Windows with full headcount coverage.', (insights) => insights?.coverageScore ?? 0),
      buildMetric('Qualification match', 'Shifts staffed with required credentials.', (insights) => insights?.qualificationMatch ?? 0),
      buildMetric('Compliance strength', 'Active constraints passing pre-checks.', (insights) => insights?.complianceScore ?? 0),
    ],
    focusAreas: [
      'Real-time credential visibility for specialised units and mobile teams.',
      'Fatigue-aware rosters that respect rest windows and consecutive shift caps.',
      'Drill-down analytics across service lines, sites, and labour types.',
    ],
    automationWins: [
      'Integrate census and acuity feeds to auto-resize staffing demand.',
      'Surface licence expirations before shift assignment.',
      'Automate peer review and escalation workflows for critical swaps.',
    ],
  },
];

export const defaultPlaybookId = industryPlaybooks[0]?.id ?? 'retail-flex';
