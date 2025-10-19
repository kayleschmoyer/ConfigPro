export type ForecastMetric = 'transactions' | 'revenue' | 'laborHours';

export interface ForecastSignal {
  timestamp: string; // ISO string representing the start of the interval
  location: string;
  channel: 'in-store' | 'delivery' | 'digital' | 'wholesale';
  metric: ForecastMetric;
  value: number;
}

export interface ForecastAssumption {
  id: string;
  name: string;
  description?: string;
  upliftPercentage: number;
  confidence: number; // 0-1 confidence score
  appliesToLocations?: string[];
  appliesToChannels?: ForecastSignal['channel'][];
  appliesToMetrics?: ForecastMetric[];
}

export interface ExternalInfluence {
  id: string;
  label: string;
  type: 'event' | 'weather' | 'campaign' | 'macro';
  impactPercentage: number;
  confidence: number; // 0-1 confidence score
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  appliesToLocations?: string[];
  appliesToChannels?: ForecastSignal['channel'][];
}

export interface ForecastScenario {
  id: string;
  name: string;
  createdAt: string;
  horizonDays: number;
  baseSignals: ForecastSignal[];
  assumptions: ForecastAssumption[];
  influences: ExternalInfluence[];
  notes?: string;
  metadata?: Record<string, string | number>;
}

export interface ForecastingModelSummary {
  model: string;
  version: string;
  lastTrainedOn: string;
  accuracy: number; // 0-1 accuracy score
}

export interface ForecastingContext {
  baselineSignals: ForecastSignal[];
  scenarios: ForecastScenario[];
  model: ForecastingModelSummary;
}

export const createForecastingContext = (
  baselineSignals: ForecastSignal[],
  model: ForecastingModelSummary,
  scenarios: ForecastScenario[] = [],
): ForecastingContext => ({
  baselineSignals,
  model,
  scenarios,
});

export interface ChannelMixInsight {
  channel: ForecastSignal['channel'];
  value: number;
  share: number; // percentage 0-100
}

export interface InfluenceInsight {
  id: string;
  label: string;
  type: ExternalInfluence['type'];
  contribution: number; // absolute change vs. baseline
  confidence: number; // 0-100
}

export interface ForecastInsights {
  projectedTotal: number;
  baselineTotal: number;
  upliftPercentage: number;
  averageDaily: number;
  peakDay: string | null;
  variance: number;
  confidenceScore: number;
  accuracyScore: number;
  channelMix: ChannelMixInsight[];
  influences: InfluenceInsight[];
}

const toDateKey = (timestamp: string): string => timestamp.split('T')[0] ?? timestamp;

const appliesToSignal = (
  signal: ForecastSignal,
  locations?: string[],
  channels?: ForecastSignal['channel'][]
): boolean => {
  const locationMatch = !locations?.length || locations.includes(signal.location);
  const channelMatch = !channels?.length || channels.includes(signal.channel);
  return locationMatch && channelMatch;
};

const appliesToMetric = (signal: ForecastSignal, metrics?: ForecastMetric[]): boolean =>
  !metrics?.length || metrics.includes(signal.metric);

const applyAssumptions = (
  signals: ForecastSignal[],
  assumptions: ForecastAssumption[],
): ForecastSignal[] =>
  signals.map((signal) => {
    let value = signal.value;
    for (const assumption of assumptions) {
      if (
        appliesToSignal(signal, assumption.appliesToLocations, assumption.appliesToChannels) &&
        appliesToMetric(signal, assumption.appliesToMetrics)
      ) {
        value *= 1 + assumption.upliftPercentage / 100;
      }
    }
    return { ...signal, value };
  });

const applyInfluences = (
  signals: ForecastSignal[],
  influences: ExternalInfluence[],
): ForecastSignal[] =>
  signals.map((signal) => {
    let value = signal.value;
    for (const influence of influences) {
      if (
        appliesToSignal(signal, influence.appliesToLocations, influence.appliesToChannels) &&
        (!influence.startDate || toDateKey(signal.timestamp) >= influence.startDate) &&
        (!influence.endDate || toDateKey(signal.timestamp) <= influence.endDate)
      ) {
        value *= 1 + influence.impactPercentage / 100;
      }
    }
    return { ...signal, value };
  });

const roundNumber = (value: number): number => Number(Number.isFinite(value) ? value.toFixed(2) : '0');

const groupByDay = (signals: ForecastSignal[]): Map<string, number> => {
  const map = new Map<string, number>();
  for (const signal of signals) {
    const day = toDateKey(signal.timestamp);
    map.set(day, (map.get(day) ?? 0) + signal.value);
  }
  return map;
};

const sumValues = (signals: ForecastSignal[]): number =>
  signals.reduce((sum, signal) => sum + signal.value, 0);

const calculateVariance = (values: number[]): number => {
  if (values.length <= 1) {
    return 0;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return roundNumber(variance);
};

const calculateConfidence = (
  assumptions: ForecastAssumption[],
  influences: ExternalInfluence[],
  modelAccuracy: number,
): number => {
  if (assumptions.length === 0 && influences.length === 0) {
    return roundNumber(modelAccuracy * 100);
  }
  const weightedConfidence =
    assumptions.reduce((sum, assumption) => sum + assumption.confidence, 0) +
    influences.reduce((sum, influence) => sum + influence.confidence, 0);
  const totalWeights = assumptions.length + influences.length;
  const averageConfidence = totalWeights === 0 ? modelAccuracy : weightedConfidence / totalWeights;
  // blend assumption confidence with model accuracy
  const blended = (averageConfidence + modelAccuracy) / 2;
  return roundNumber(blended * 100);
};

const differencePercentage = (current: number, baseline: number): number => {
  if (baseline === 0) {
    return current === 0 ? 0 : 100;
  }
  return roundNumber(((current - baseline) / baseline) * 100);
};

const buildChannelMix = (
  signals: ForecastSignal[],
  baselineSignals: ForecastSignal[],
): ChannelMixInsight[] => {
  const total = sumValues(signals);
  if (total === 0) {
    return [];
  }
  const baselineByChannel = baselineSignals.reduce((acc, signal) => {
    acc.set(signal.channel, (acc.get(signal.channel) ?? 0) + signal.value);
    return acc;
  }, new Map<ForecastSignal['channel'], number>());

  const byChannel = signals.reduce((acc, signal) => {
    acc.set(signal.channel, (acc.get(signal.channel) ?? 0) + signal.value);
    return acc;
  }, new Map<ForecastSignal['channel'], number>());

  return Array.from(byChannel.entries()).map(([channel, value]) => {
    const baseline = baselineByChannel.get(channel) ?? 0;
    return {
      channel,
      value: roundNumber(value),
      share: roundNumber((value / total) * 100),
      growth: differencePercentage(value, baseline),
    } as ChannelMixInsight & { growth: number };
  });
};

const buildInfluenceInsights = (
  baselineSignals: ForecastSignal[],
  scenarioSignals: ForecastSignal[],
  influences: ExternalInfluence[],
): InfluenceInsight[] => {
  if (influences.length === 0) {
    return [];
  }
  const baselineTotal = sumValues(baselineSignals);
  const scenarioTotal = sumValues(scenarioSignals);
  const difference = scenarioTotal - baselineTotal;

  const totalImpact = influences.reduce((sum, influence) => sum + Math.abs(influence.impactPercentage), 0) || 1;

  return influences.map((influence) => ({
    id: influence.id,
    label: influence.label,
    type: influence.type,
    contribution: roundNumber((difference * Math.abs(influence.impactPercentage)) / totalImpact),
    confidence: roundNumber(influence.confidence * 100),
  }));
};

export const generateForecastInsights = (
  context: ForecastingContext,
  scenario: ForecastScenario,
): ForecastInsights => {
  const baselineSignals = context.baselineSignals.filter((signal) =>
    scenario.baseSignals.some(
      (base) =>
        base.metric === signal.metric &&
        base.location === signal.location &&
        base.channel === signal.channel,
    ),
  );

  const withAssumptions = applyAssumptions(scenario.baseSignals, scenario.assumptions);
  const scenarioSignals = applyInfluences(withAssumptions, scenario.influences);

  const baselineTotal = sumValues(baselineSignals);
  const projectedTotal = sumValues(scenarioSignals);
  const upliftPercentage = differencePercentage(projectedTotal, baselineTotal);

  const dailyTotals = Array.from(groupByDay(scenarioSignals).values());
  const variance = calculateVariance(dailyTotals);
  const averageDaily = roundNumber(projectedTotal / Math.max(scenario.horizonDays, 1));
  const peakEntry = Array.from(groupByDay(scenarioSignals).entries()).sort((a, b) => b[1] - a[1])[0];

  const channelMix = buildChannelMix(scenarioSignals, baselineSignals).map(({ channel, share, value }) => ({
    channel,
    share,
    value,
  }));

  return {
    projectedTotal: roundNumber(projectedTotal),
    baselineTotal: roundNumber(baselineTotal),
    upliftPercentage,
    averageDaily,
    peakDay: peakEntry ? peakEntry[0] : null,
    variance,
    confidenceScore: calculateConfidence(scenario.assumptions, scenario.influences, context.model.accuracy),
    accuracyScore: roundNumber(context.model.accuracy * 100),
    channelMix,
    influences: buildInfluenceInsights(baselineSignals, scenarioSignals, scenario.influences),
  };
};

export interface ScenarioComparison {
  scenarioId: string;
  scenarioName: string;
  upliftPercentage: number;
  projectedTotal: number;
  varianceDelta: number;
}

export const compareScenarioToBaseline = (
  context: ForecastingContext,
  scenario: ForecastScenario,
): ScenarioComparison => {
  const insights = generateForecastInsights(context, scenario);
  const baselineVariance = calculateVariance(Array.from(groupByDay(context.baselineSignals).values()));
  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    upliftPercentage: insights.upliftPercentage,
    projectedTotal: insights.projectedTotal,
    varianceDelta: roundNumber(insights.variance - baselineVariance),
  };
};

export interface BackcastObservation {
  timestamp: string;
  actual: number;
  forecasted: number;
}

export interface BackcastSummary {
  mape: number;
  bias: number;
  volatility: number;
}

export const evaluateBackcast = (observations: BackcastObservation[]): BackcastSummary => {
  if (observations.length === 0) {
    return { mape: 0, bias: 0, volatility: 0 };
  }

  let absolutePercentageErrorSum = 0;
  let biasSum = 0;
  const deltas: number[] = [];

  for (const observation of observations) {
    const { actual, forecasted } = observation;
    if (actual !== 0) {
      absolutePercentageErrorSum += Math.abs((actual - forecasted) / actual);
    }
    biasSum += forecasted - actual;
    deltas.push(forecasted - actual);
  }

  const mape = roundNumber((absolutePercentageErrorSum / observations.length) * 100);
  const bias = roundNumber(biasSum / observations.length);
  const volatility = calculateVariance(deltas);

  return { mape, bias, volatility };
};
