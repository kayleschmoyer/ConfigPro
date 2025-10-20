import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseFetchOptions<T> {
  immediate?: boolean;
  parse?: (response: Response) => Promise<T>;
  dependencies?: unknown[];
}

export interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
  status: FetchStatus;
  loading: boolean;
  refetch: (overrideInit?: RequestInit) => Promise<T | null>;
  abort: () => void;
}

const defaultParser = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};

const isAbortError = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

export const useFetch = <T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> => {
  const { immediate = true, parse, dependencies = [] } = options;
  const parser = useMemo(() => parse ?? defaultParser<T>, [parse]);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<FetchStatus>(immediate ? 'loading' : 'idle');
  const abortRef = useRef<AbortController | null>(null);

  const requestInfo = useMemo(() => input, [input]);
  const requestInit = useMemo(() => init, [init]);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const execute = useCallback(
    async (overrideInit?: RequestInit) => {
      abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('loading');
      setError(null);

      try {
        const response = await fetch(requestInfo, {
          ...requestInit,
          ...overrideInit,
          signal: controller.signal,
        });

        const parsed = await parser(response);
        setData(parsed);
        setStatus('success');
        return parsed;
      } catch (caughtError) {
        if (isAbortError(caughtError)) {
          return null;
        }

        const finalError = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
        setError(finalError);
        setStatus('error');
        return null;
      }
    },
    [abort, parser, requestInfo, requestInit],
  );

  useEffect(() => {
    if (!immediate) {
      return () => abort();
    }

    execute().catch(() => undefined);
    return () => abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abort, execute, immediate, ...dependencies]);

  return {
    data,
    error,
    status,
    loading: status === 'loading',
    refetch: execute,
    abort,
  };
};
