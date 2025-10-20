export interface StorageGetOptions {
  readonly namespace?: string;
  readonly fallback?: unknown;
}

export interface StorageSetOptions {
  readonly namespace?: string;
  readonly expiresAt?: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface StorageListOptions {
  readonly namespace?: string;
  readonly prefix?: string;
}

export interface StoredValue<TValue = unknown> {
  readonly key: string;
  readonly value: TValue;
  readonly expiresAt?: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface StorageService {
  getItem<TValue = unknown>(key: string, options?: StorageGetOptions): Promise<TValue | null>;

  setItem<TValue = unknown>(key: string, value: TValue, options?: StorageSetOptions): Promise<void>;

  removeItem(key: string, namespace?: string): Promise<void>;

  listItems<TValue = unknown>(options?: StorageListOptions): Promise<Array<StoredValue<TValue>>>;

  clear(namespace?: string): Promise<void>;
}
