import { describe, expect, it } from 'vitest';
import { observeFulfillmentRate, observeScheduleAccuracy, registerMetricListener } from '../metrics';

describe('metrics instrumentation', () => {
  it('notifies listeners when metrics are recorded', () => {
    const events: string[] = [];
    registerMetricListener((event) => {
      events.push(`${event.name}:${event.value}`);
    });

    observeScheduleAccuracy(92.5, { scheduleId: 'demo' });
    observeFulfillmentRate(88.1);

    expect(events).toContain('schedule.accuracy:92.5');
    expect(events).toContain('schedule.fulfillment:88.1');
  });
});
