export interface MetricEvent {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: string;
}

export type MetricListener = (event: MetricEvent) => void;

class MetricsRegistry {
  private listeners: MetricListener[] = [];

  register(listener: MetricListener) {
    this.listeners.push(listener);
  }

  emit(event: MetricEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}

const registry = new MetricsRegistry();

export const observeScheduleAccuracy = (value: number, tags?: Record<string, string>) => {
  registry.emit({
    name: 'schedule.accuracy',
    value,
    tags,
    timestamp: new Date().toISOString(),
  });
};

export const observeFulfillmentRate = (value: number, tags?: Record<string, string>) => {
  registry.emit({
    name: 'schedule.fulfillment',
    value,
    tags,
    timestamp: new Date().toISOString(),
  });
};

export const registerMetricListener = (listener: MetricListener) => {
  registry.register(listener);
};
