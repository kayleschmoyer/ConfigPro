import { describe, expect, it, vi } from 'vitest';

import {
  ApiClient,
  ApiHttpError,
  createTypedApiClient,
  defineEndpoint,
  normalizeApiError,
  type EndpointDefinition,
} from '../api.client';

describe('ApiClient', () => {
  it('performs typed requests with query parameters and headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'schedule-1' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'req-123',
        },
      }),
    );

    const client = new ApiClient({
      baseUrl: 'https://api.example.com',
      headers: { Authorization: 'Bearer token' },
      fetch: fetchMock,
    });

    const response = await client.request<{ id: string }>({
      path: '/schedules',
      method: 'GET',
      query: { search: 'demo', include: ['audit'] },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/schedules?search=demo&include=audit',
      expect.objectContaining({
        method: 'GET',
      }),
    );

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer token');

    expect(response.data).toEqual({ id: 'schedule-1' });
    expect(response.status).toBe(200);
    expect(response.requestId).toBe('req-123');
    expect(response.headers.get('x-request-id')).toBe('req-123');
    expect(response.headers.get('content-type')).toBe('application/json');
  });

  it('throws an ApiHttpError with normalized body on non-success responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Invalid schedule' }), {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'req-456',
        },
      }),
    );

    const client = new ApiClient({ baseUrl: 'https://api.example.com', fetch: fetchMock });

    const promise = client.request({
      path: '/schedules',
      method: 'POST',
      body: { name: 'Invalid' },
    });

    await expect(promise).rejects.toBeInstanceOf(ApiHttpError);

    try {
      await promise;
    } catch (error) {
      expect(error).toBeInstanceOf(ApiHttpError);
      const apiError = error as ApiHttpError;
      expect(apiError.status).toBe(422);
      expect(apiError.body).toEqual({ error: 'Invalid schedule' });
      expect(apiError.requestId).toBe('req-456');
    }
  });
});

describe('createTypedApiClient', () => {
  it('creates typed endpoint functions and respects defaults', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'abc', status: 'draft' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'created', status: 'draft' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const typedClient = createTypedApiClient<{
      getSchedule: EndpointDefinition<
        { id: string; status: string },
        undefined,
        { expand?: string[] },
        { id: string }
      >;
      createSchedule: EndpointDefinition<{ id: string; status: string }, { name: string }>;
    }>(
      { baseUrl: 'https://api.example.com', fetch: fetchMock },
      {
        getSchedule: defineEndpoint({
          method: 'GET',
          path: ({ id }: { id: string }) => `/schedules/${id}`,
        }),
        createSchedule: defineEndpoint({
          method: 'POST',
          path: '/schedules',
          defaultHeaders: { 'x-client': 'configpro' },
        }),
      },
    );

    await typedClient.getSchedule({ params: { id: 'schedule-10' }, query: { expand: ['audit'] } });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/schedules/schedule-10?expand=audit',
      expect.objectContaining({ method: 'GET' }),
    );

    await typedClient.createSchedule({ body: { name: 'New Schedule' } });
    const [, secondInit] = fetchMock.mock.calls[1];
    const headers = secondInit?.headers as Headers;
    expect(headers.get('x-client')).toBe('configpro');
    expect(headers.get('content-type')).toBe('application/json');
  });
});

describe('normalizeApiError', () => {
  it('normalizes http, network, abort, and unknown errors', () => {
    const response = new Response(JSON.stringify({ message: 'Outage' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'content-type': 'application/json', 'x-request-id': 'req-789' },
    });

    const httpError = new ApiHttpError({
      response,
      body: { message: 'Outage' },
      request: { url: 'https://api.example.com/status', method: 'GET' },
      requestId: 'req-789',
    });

    const normalizedHttp = normalizeApiError(httpError);
    expect(normalizedHttp).toMatchObject({
      type: 'http',
      status: 503,
      retryable: true,
      requestId: 'req-789',
    });

    const networkError = normalizeApiError(new TypeError('Failed to fetch'));
    expect(networkError).toMatchObject({ type: 'network', retryable: true });

    const abortError = normalizeApiError(new DOMException('Aborted', 'AbortError'));
    expect(abortError).toMatchObject({ type: 'timeout', retryable: true });

    const unknownError = normalizeApiError('boom');
    expect(unknownError).toMatchObject({ type: 'unknown', details: 'boom', retryable: false });
  });
});
