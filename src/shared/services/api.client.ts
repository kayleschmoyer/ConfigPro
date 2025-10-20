export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientConfig {
  /**
   * Base URL used for every request executed by the client.
   */
  readonly baseUrl: string;
  /**
   * Optional headers that will be merged onto every request.
   */
  readonly defaultHeaders?: Record<string, string>;
}

export type QueryValue = string | number | boolean | Date;
export type QueryParam = QueryValue | QueryValue[] | null | undefined;
export type QueryParams = Record<string, QueryParam>;

export interface ApiRequestOptions<
  TBody = unknown,
  TQuery extends QueryParams | undefined = QueryParams | undefined,
> {
  readonly path: string;
  readonly method?: HttpMethod;
  readonly headers?: Record<string, string>;
  readonly query?: TQuery;
  readonly body?: TBody;
  readonly signal?: AbortSignal;
  /**
   * Optional request timeout. Implementations decide how to enforce it.
   */
  readonly timeoutMs?: number;
  /**
   * Arbitrary metadata useful for logging or analytics.
   */
  readonly metadata?: Record<string, unknown>;
}

export interface ApiResponse<TData = unknown> {
  readonly data: TData;
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly requestId?: string;
  readonly raw?: unknown;
}

export type ApiRequestInterceptor = <
  TBody = unknown,
  TQuery extends QueryParams | undefined = QueryParams | undefined,
>(
  request: ApiRequestOptions<TBody, TQuery>,
) => Promise<ApiRequestOptions<TBody, TQuery>> | ApiRequestOptions<TBody, TQuery>;

export type ApiResponseInterceptor = <
  TBody = unknown,
  TQuery extends QueryParams | undefined = QueryParams | undefined,
  TResponse = unknown,
>(
  response: ApiResponse<TResponse>,
  request: ApiRequestOptions<TBody, TQuery>,
) => Promise<ApiResponse<TResponse>> | ApiResponse<TResponse>;

export interface ApiClient {
  readonly baseUrl: string;

  configure(config: Partial<ApiClientConfig>): void;

  request<
    TResponse = unknown,
    TBody = unknown,
    TQuery extends QueryParams | undefined = QueryParams | undefined,
  >(
    options: ApiRequestOptions<TBody, TQuery>,
  ): Promise<ApiResponse<TResponse>>;

  addRequestInterceptor(interceptor: ApiRequestInterceptor): void;

  addResponseInterceptor(interceptor: ApiResponseInterceptor): void;
}
