import type {
  ExternalInfluence,
  ForecastAssumption,
  ForecastScenario,
  ForecastSignal,
  ForecastingModelSummary,
} from '../modules/forecasting';

const baseDate = new Date('2024-03-01T00:00:00.000Z');

const buildSignal = (
  dayOffset: number,
  channel: ForecastSignal['channel'],
  metric: ForecastSignal['metric'],
  value: number,
  location = 'Downtown',
): ForecastSignal => ({
  timestamp: new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString(),
  location,
  channel,
  metric,
  value,
});

export const demoBaselineSignals: ForecastSignal[] = [
  buildSignal(0, 'in-store', 'transactions', 420),
  buildSignal(1, 'in-store', 'transactions', 460),
  buildSignal(2, 'in-store', 'transactions', 505),
  buildSignal(3, 'in-store', 'transactions', 480),
  buildSignal(4, 'in-store', 'transactions', 520),
  buildSignal(5, 'in-store', 'transactions', 610),
  buildSignal(6, 'in-store', 'transactions', 590),
  buildSignal(0, 'digital', 'transactions', 210),
  buildSignal(1, 'digital', 'transactions', 230),
  buildSignal(2, 'digital', 'transactions', 240),
  buildSignal(3, 'digital', 'transactions', 250),
  buildSignal(4, 'digital', 'transactions', 260),
  buildSignal(5, 'digital', 'transactions', 310),
  buildSignal(6, 'digital', 'transactions', 305),
  buildSignal(0, 'delivery', 'transactions', 160),
  buildSignal(1, 'delivery', 'transactions', 170),
  buildSignal(2, 'delivery', 'transactions', 180),
  buildSignal(3, 'delivery', 'transactions', 175),
  buildSignal(4, 'delivery', 'transactions', 185),
  buildSignal(5, 'delivery', 'transactions', 220),
  buildSignal(6, 'delivery', 'transactions', 215),
];

export const demoModelSummary: ForecastingModelSummary = {
  model: 'AuroraDemandNet',
  version: '2.3.1',
  lastTrainedOn: '2024-02-15T08:00:00.000Z',
  accuracy: 0.87,
};

export const demoScenarioAssumptions: ForecastAssumption[] = [
  {
    id: 'digital-campaign',
    name: 'Spring digital push',
    description: 'Paid media refresh and loyalty offer targeting digital ordering.',
    upliftPercentage: 12,
    confidence: 0.7,
    appliesToChannels: ['digital'],
    appliesToMetrics: ['transactions'],
  },
  {
    id: 'catering-pop-up',
    name: 'Corporate catering pilot',
    description: 'Test catering packages with select enterprise clients.',
    upliftPercentage: 18,
    confidence: 0.6,
    appliesToChannels: ['delivery'],
  },
];

export const demoScenarioInfluences: ExternalInfluence[] = [
  {
    id: 'music-festival',
    label: 'City music festival',
    type: 'event',
    impactPercentage: 20,
    confidence: 0.5,
    startDate: '2024-03-05',
    endDate: '2024-03-06',
    appliesToLocations: ['Downtown'],
    appliesToChannels: ['in-store'],
  },
  {
    id: 'weather-coolfront',
    label: 'Cool front',
    type: 'weather',
    impactPercentage: -5,
    confidence: 0.4,
    startDate: '2024-03-03',
    endDate: '2024-03-04',
    appliesToChannels: ['delivery'],
  },
];

export const demoForecastingScenario: ForecastScenario = {
  id: 'spring-boost',
  name: 'Spring demand boost',
  createdAt: new Date().toISOString(),
  horizonDays: 7,
  baseSignals: demoBaselineSignals,
  assumptions: demoScenarioAssumptions,
  influences: demoScenarioInfluences,
  notes: 'Baseline uplift strategy layering digital promo and event impact.',
};

export const demoForecastingContext = {
  baselineSignals: demoBaselineSignals,
  model: demoModelSummary,
  scenarios: [demoForecastingScenario],
};
