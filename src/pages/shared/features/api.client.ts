export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryValue = string | number | boolean | Date;
export type QueryParam = QueryValue | QueryValue[] | null | undefined;
export type QueryParams = Record<string, QueryParam>;

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

export interface ApiRequestOptions<TBody = unknown, TQuery extends QueryParams | undefined = QueryParams | undefined, TResponse = unknown> {
  path: string;
  method?: HttpMethod;
  query?: TQuery;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  parseResponse?: (response: Response) => Promise<TResponse>;
}

export interface ApiResponse<TData> {
  data: TData;
  status: number;
  headers: Headers;
  requestId?: string;
}

export interface ApiRequestMetadata {
  url: string;
  method: HttpMethod;
}

export interface NormalizedApiError {
  type: 'http' | 'timeout' | 'network' | 'unknown';
  message: string;
  status?: number;
  requestId?: string;
  details?: unknown;
  retryable: boolean;
  cause?: unknown;
}

export interface ApiHttpErrorInit {
  response: Response;
  body: unknown;
  request: ApiRequestMetadata;
  requestId?: string;
}

export class ApiHttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;
  readonly headers: Headers;
  readonly request: ApiRequestMetadata;
  readonly requestId?: string;

  constructor(init: ApiHttpErrorInit) {
    const { response, body, request } = init;
    super(`${response.status} ${response.statusText || 'HTTP Error'} (${request.method} ${request.url})`);
    this.name = 'ApiHttpError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.body = body;
    this.headers = response.headers;
    this.request = request;
    this.requestId = init.requestId;
  }
}

export const isApiHttpError = (error: unknown): error is ApiHttpError => error instanceof ApiHttpError;

const isAbortError = (error: unknown): error is DOMException =>
  typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError';

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (isApiHttpError(error)) {
    const retryable = error.status >= 500 || error.status === 429;
    return {
      type: 'http',
      message: error.message,
      status: error.status,
      requestId: error.requestId,
      details: error.body,
      retryable,
      cause: error,
    };
  }

  if (isAbortError(error)) {
    return {
      type: 'timeout',
      message: 'Request was aborted before completion.',
      retryable: true,
      cause: error,
    };
  }

  if (error instanceof TypeError) {
    return {
      type: 'network',
      message: error.message,
      retryable: true,
      cause: error,
    };
  }

  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message,
      retryable: false,
      cause: error,
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred while communicating with the API.',
    details: error,
    retryable: false,
  };
};

const toIsoString = (value: QueryValue) => (value instanceof Date ? value.toISOString() : String(value));

const appendQueryParam = (searchParams: URLSearchParams, key: string, value: QueryParam) => {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (entry !== undefined && entry !== null) {
        searchParams.append(key, toIsoString(entry));
      }
    });
    return;
  }

  searchParams.append(key, toIsoString(value));
};

const mergeHeaderSources = (...sources: Array<Record<string, string> | undefined>) => {
  const headers = new Headers();

  sources.forEach((source) => {
    if (!source) return;
    Object.entries(source).forEach(([key, value]) => {
      if (value !== undefined) {
        headers.set(key, value);
      }
    });
  });

  return headers;
};

const isStructuredBody = (body: unknown): body is Record<string, unknown> | unknown[] =>
  typeof body === 'object' &&
  body !== null &&
  !(typeof Blob !== 'undefined' && body instanceof Blob) &&
  !(typeof ArrayBuffer !== 'undefined' &&
    (body instanceof ArrayBuffer || ArrayBuffer.isView(body as ArrayBufferView))) &&
  !(typeof FormData !== 'undefined' && body instanceof FormData) &&
  !(typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams);

const serializeBody = (body: unknown, headers: Headers) => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (
    typeof body === 'string' ||
    (typeof Blob !== 'undefined' && body instanceof Blob) ||
    (typeof ArrayBuffer !== 'undefined' &&
      (body instanceof ArrayBuffer || ArrayBuffer.isView(body as ArrayBufferView))) ||
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)
  ) {
    return body as BodyInit;
  }

  if (isStructuredBody(body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
};

const defaultResponseParser = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchImpl: typeof fetch;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.defaultHeaders = { Accept: 'application/json', ...(config.headers ?? {}) };
    this.fetchImpl = config.fetch ?? globalThis.fetch;

    if (typeof this.fetchImpl !== 'function') {
      throw new Error('A fetch implementation must be provided for ApiClient.');
    }
  }

  async request<TResponse, TBody = unknown, TQuery extends QueryParams | undefined = QueryParams | undefined>(
    options: ApiRequestOptions<TBody, TQuery, TResponse>,
  ): Promise<ApiResponse<TResponse>> {
    const method: HttpMethod = options.method ?? 'GET';
    const url = this.buildUrl(options.path, options.query);
    const headers = mergeHeaderSources(this.defaultHeaders, options.headers);
    const body = serializeBody(options.body, headers);
    const response = await this.fetchImpl(url, {
      method,
      headers,
      body,
      signal: options.signal,
    });

    const requestId = response.headers.get('x-request-id') ?? response.headers.get('x-correlation-id') ?? undefined;
    const parser = options.parseResponse ?? defaultResponseParser<TResponse>;

    if (!response.ok) {
      const errorBody = await parser(response).catch(() => undefined);
      throw new ApiHttpError({
        response,
        body: errorBody,
        request: { url, method },
        requestId,
      });
    }

    const data = await parser(response);

    return {
      data,
      status: response.status,
      headers: response.headers,
      requestId,
    };
  }

  private buildUrl(path: string, query?: QueryParams | undefined): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => appendQueryParam(url.searchParams, key, value));
    }

    return url.toString();
  }
}

export interface EndpointDefinition<
  TResponse,
  TBody = undefined,
  TQuery extends QueryParams | undefined = QueryParams,
  TPathParams = undefined,
> {
  method: HttpMethod;
  path: string | ((params: TPathParams) => string);
  defaultHeaders?: Record<string, string>;
  parseResponse?: (response: Response) => Promise<TResponse>;
  readonly __types: {
    body: TBody;
    query: TQuery;
    params: TPathParams;
    response: TResponse;
  };
}

export const defineEndpoint = <
  TResponse,
  TBody = undefined,
  TQuery extends QueryParams | undefined = QueryParams,
  TPathParams = undefined,
>(
  definition: Omit<EndpointDefinition<TResponse, TBody, TQuery, TPathParams>, '__types'>,
): EndpointDefinition<TResponse, TBody, TQuery, TPathParams> => ({
  ...definition,
  __types: undefined as unknown as EndpointDefinition<TResponse, TBody, TQuery, TPathParams>['__types'],
});

type EndpointMeta<TDefinition extends EndpointDefinition<any, any, any, any>> = TDefinition['__types'] extends {
  response: infer TResponse;
  body: infer TBody;
  query: infer TQuery;
  params: infer TParams;
}
  ? { response: TResponse; body: TBody; query: TQuery; params: TParams }
  : never;

type InferResponse<TDefinition extends EndpointDefinition<any, any, any, any>> = EndpointMeta<TDefinition>['response'];

type InferBody<TDefinition extends EndpointDefinition<any, any, any, any>> = EndpointMeta<TDefinition>['body'];

type InferQuery<TDefinition extends EndpointDefinition<any, any, any, any>> = EndpointMeta<TDefinition>['query'];

type InferParams<TDefinition extends EndpointDefinition<any, any, any, any>> = EndpointMeta<TDefinition>['params'];

type BodyOption<TBody> = [TBody] extends [undefined] ? { body?: undefined } : { body: TBody };

type QueryOption<TQuery> = TQuery extends undefined ? { query?: undefined } : { query?: TQuery };

type ParamsOption<TParams> = TParams extends undefined ? { params?: undefined } : { params: TParams };

type EndpointCallOptions<TDefinition extends EndpointDefinition<any, any, any, any>> =
  ParamsOption<InferParams<TDefinition>> &
  BodyOption<InferBody<TDefinition>> &
  QueryOption<InferQuery<TDefinition>> & {
    headers?: Record<string, string>;
    signal?: AbortSignal;
  };

type EndpointMap = Record<string, EndpointDefinition<any, any, any, any>>;

export type TypedApiClient<TEndpoints extends EndpointMap> = {
  [TKey in keyof TEndpoints]: (
    ...args: EndpointArguments<TEndpoints[TKey]>
  ) => Promise<ApiResponse<InferResponse<TEndpoints[TKey]>>>;
} & {
  request: ApiClient['request'];
};

type RequiredKeys<T> = { [K in keyof T]-?: undefined extends T[K] ? never : K }[keyof T];

type EndpointArguments<TDefinition extends EndpointDefinition<any, any, any, any>> =
  RequiredKeys<EndpointCallOptions<TDefinition>> extends never
    ? [options?: EndpointCallOptions<TDefinition>]
    : [options: EndpointCallOptions<TDefinition>];

export const createTypedApiClient = <TEndpoints extends EndpointMap>(
  config: ApiClientConfig,
  endpoints: TEndpoints,
): TypedApiClient<TEndpoints> => {
  const client = new ApiClient(config);
  const typed: Record<string, unknown> = {
    request: client.request.bind(client),
  };

  (Object.keys(endpoints) as Array<keyof TEndpoints>).forEach((key) => {
    const definition = endpoints[key];

    typed[key as string] = async (
      ...args: EndpointArguments<TEndpoints[typeof key]>
    ) => {
      const options = (args[0] ?? {}) as EndpointCallOptions<TEndpoints[typeof key]> & { params?: unknown };
      const { params, body, query, headers, signal } = options;

      const path =
        typeof definition.path === 'function'
          ? definition.path(params as InferParams<typeof definition>)
          : definition.path;

      return client.request({
        method: definition.method,
        path,
        body: body as InferBody<typeof definition>,
        query: query as QueryParams | undefined,
        headers: { ...(definition.defaultHeaders ?? {}), ...(headers ?? {}) },
        signal,
        parseResponse: definition.parseResponse,
      });
    };
  });

  return typed as TypedApiClient<TEndpoints>;
};
