import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ApiClient,
  ApiHttpError,
  createTypedApiClient,
  normalizeApiError,
} from '../../pages/shared/features/api.client';

describe('ApiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createFetchMock = () => vi.fn<typeof fetch>();

  it('serialises query parameters and merges headers when issuing a request', async () => {
    const fetchMock = createFetchMock();
    const isoDate = new Date('2024-01-15T12:00:00Z');

    fetchMock.mockImplementation(async () =>
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'req-123',
        },
      }),
    );

    const client = new ApiClient({
      baseUrl: 'https://api.configpro.dev/v1/',
      headers: { Authorization: 'Bearer token' },
      fetch: fetchMock,
    });

    const response = await client.request<{ status: string }>({
      path: 'features',
      method: 'GET',
      query: {
        search: 'roles',
        tags: ['access', 'governance'],
        includeDisabled: false,
        since: isoDate,
        unused: null,
      },
      headers: { 'X-Trace-Id': 'trace-001' },
    });

    expect(response.data.status).toBe('ok');
    expect(response.status).toBe(200);
    expect(response.requestId).toBe('req-123');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, init] = fetchMock.mock.calls[0];
    const url = new URL(requestUrl as string);

    expect(url.toString()).toContain('https://api.configpro.dev/v1/features');
    expect(url.searchParams.getAll('tags')).toEqual(['access', 'governance']);
    expect(url.searchParams.get('includeDisabled')).toBe('false');
    expect(url.searchParams.get('since')).toBe(isoDate.toISOString());
    expect(url.searchParams.has('unused')).toBe(false);

    const headers = init?.headers as Headers;
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Authorization')).toBe('Bearer token');
    expect(headers.get('X-Trace-Id')).toBe('trace-001');
  });

  it('throws ApiHttpError when the response is not successful', async () => {
    const fetchMock = createFetchMock();
    fetchMock.mockImplementation(async () =>
      new Response(JSON.stringify({ error: 'validation_failed' }), {
        status: 422,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = new ApiClient({ baseUrl: 'https://api.configpro.dev', fetch: fetchMock });

    let caughtError: ApiHttpError | undefined;
    try {
      await client.request({ path: '/features', method: 'POST', body: { name: 'Beta access' } });
    } catch (error) {
      caughtError = error as ApiHttpError;
    }

    expect(caughtError).toBeInstanceOf(ApiHttpError);
    const error = caughtError as ApiHttpError;

    expect(error.status).toBe(422);
    expect(error.body).toEqual({ error: 'validation_failed' });
    expect(error.request.method).toBe('POST');
    expect(error.request.url).toContain('/features');
  });

  it('normalises API errors for consistent upstream handling', () => {
    const httpError = new ApiHttpError({
      response: new Response(null, { status: 503, statusText: 'Service Unavailable' }),
      body: { message: 'retry later' },
      request: { method: 'GET', url: 'https://api.configpro.dev/status' },
      requestId: 'req-999',
    });

    const httpNormalized = normalizeApiError(httpError);
    expect(httpNormalized.type).toBe('http');
    expect(httpNormalized.retryable).toBe(true);
    expect(httpNormalized.requestId).toBe('req-999');

    const abortError = new DOMException('Aborted', 'AbortError');
    const abortNormalized = normalizeApiError(abortError);
    expect(abortNormalized.type).toBe('timeout');
    expect(abortNormalized.retryable).toBe(true);

    const networkError = new TypeError('Failed to fetch');
    const networkNormalized = normalizeApiError(networkError);
    expect(networkNormalized.type).toBe('network');
    expect(networkNormalized.retryable).toBe(true);

    const unknownNormalized = normalizeApiError('unexpected');
    expect(unknownNormalized.type).toBe('unknown');
    expect(unknownNormalized.retryable).toBe(false);
  });
});

describe('createTypedApiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds typed endpoint callers that delegate to ApiClient', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      return new Response(
        JSON.stringify({
          url: String(input),
          method: init?.method ?? 'GET',
          headers: init?.headers instanceof Headers
            ? Object.fromEntries((init.headers as Headers).entries())
            : init?.headers,
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    const client = createTypedApiClient(
      { baseUrl: 'https://api.configpro.dev', fetch: fetchMock },
      {
        getFeature: {
          method: 'GET',
          path: ({ id }: { id: string }) => `/features/${id}`,
        },
        createFeature: {
          method: 'POST',
          path: '/features',
          defaultHeaders: { 'X-Client': 'configpro-tests' },
        },
      },
    );

    const showResponse = await client.getFeature({
      params: { id: 'feature-123' },
      query: { include: ['permissions', 'workflows'] },
    });

    expect(showResponse.data.method).toBe('GET');
    expect(showResponse.data.url).toContain('/features/feature-123');
    expect(new URL(showResponse.data.url).searchParams.getAll('include')).toEqual([
      'permissions',
      'workflows',
    ]);

    const createResponse = await client.createFeature({
      body: { name: 'New Feature' },
      headers: { 'X-Request-Source': 'unit-test' },
    });

    expect(createResponse.data.method).toBe('POST');
    const responseHeaders = createResponse.data.headers as Record<string, string>;
    expect(responseHeaders['x-client']).toBe('configpro-tests');
    expect(responseHeaders['x-request-source']).toBe('unit-test');
    expect(responseHeaders['content-type']).toBe('application/json');

    expect(typeof client.request).toBe('function');
  });
});
