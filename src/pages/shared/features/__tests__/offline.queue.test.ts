import { afterEach, describe, expect, it, vi } from 'vitest';

import { InMemoryPersistence, OfflineQueue } from '../offline.queue';

describe('OfflineQueue', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('processes actions when handlers resolve successfully', async () => {
    const persistence = new InMemoryPersistence();
    const handler = vi.fn().mockResolvedValue(undefined);
    const queue = new OfflineQueue({
      persistence,
      isOnline: () => true,
      retryDelayMs: 10,
      backoffFactor: 1,
      jitterMs: 0,
      maxRetries: 3,
    });

    queue.registerHandler('sync-profile', handler);

    await queue.enqueue({ type: 'sync-profile', payload: { id: 'user-123' } });
    await queue.flush();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ id: 'user-123' }, expect.objectContaining({ type: 'sync-profile' }));
    expect(queue.getSnapshot()).toHaveLength(0);

    await queue.destroy();
  });

  it('retries failed actions with backoff until success', async () => {
    vi.useFakeTimers();

    const persistence = new InMemoryPersistence();
    const queue = new OfflineQueue({
      persistence,
      isOnline: () => true,
      retryDelayMs: 50,
      backoffFactor: 1,
      jitterMs: 0,
      maxRetries: 5,
      now: () => Date.now(),
    });

    let attempts = 0;
    const handler = vi.fn().mockImplementation(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('network unavailable');
      }
    });

    queue.registerHandler('retryable', handler);

    await queue.enqueue({ type: 'retryable', payload: { value: 42 } });

    await queue.flush();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(queue.getSnapshot()[0]?.attempts).toBe(1);

    await vi.advanceTimersByTimeAsync(50);
    await queue.flush();
    expect(handler).toHaveBeenCalledTimes(2);
    expect(queue.getSnapshot()[0]?.attempts).toBe(2);

    await vi.advanceTimersByTimeAsync(50);
    await queue.flush();
    expect(handler).toHaveBeenCalledTimes(3);
    expect(queue.getSnapshot()).toHaveLength(0);

    await queue.destroy();
  });

  it('restores persisted actions and processes them when back online', async () => {
    const persistence = new InMemoryPersistence();

    const offlineQueue = new OfflineQueue({
      persistence,
      isOnline: () => false,
      retryDelayMs: 10,
      backoffFactor: 1,
      jitterMs: 0,
    });

    await offlineQueue.enqueue({ type: 'sync-profile', payload: { id: 'seed' } });
    await offlineQueue.destroy();

    let online = false;
    const handler = vi.fn().mockResolvedValue(undefined);
    const restoringQueue = new OfflineQueue({
      persistence,
      isOnline: () => online,
      retryDelayMs: 10,
      backoffFactor: 1,
      jitterMs: 0,
    });

    restoringQueue.registerHandler('sync-profile', handler);

    online = true;
    await restoringQueue.flush();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(restoringQueue.getSnapshot()).toHaveLength(0);

    await restoringQueue.destroy();
  });
});
