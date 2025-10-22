import { useCallback, useMemo, useState } from 'react';
import type { ApiKey, SecretMask } from '../lib/types';
import { formatRelative } from '../lib/format';
import { maskSecret } from '../lib/secrets';

const initialKeys: ApiKey[] = [
  {
    id: 'key-1',
    prefix: 'ckp_live',
    masked: 'ckp_live_****D8F2',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    scopes: ['payments:read'],
    restrictions: {
      ipAllow: ['10.10.0.0/16'],
      ratePerMin: 600,
      env: 'PROD'
    },
    status: 'ACTIVE'
  },
  {
    id: 'key-2',
    prefix: 'ckp_test',
    masked: 'ckp_test_****9BC3',
    createdAt: new Date().toISOString(),
    scopes: ['payments:write'],
    status: 'REVOKED'
  }
];

export function useApiKeys() {
  const [keys, setKeys] = useState(initialKeys);
  const [mask, setMask] = useState<SecretMask | null>(null);

  const createKey = useCallback((scopes: string[], expiresAt?: string) => {
    const id = `key-${Date.now()}`;
    const generated = `${id}-${Math.random().toString(36).slice(2, 10)}`;
    const masked = maskSecret(generated);
    const apiKey: ApiKey = {
      id,
      prefix: masked.prefix,
      masked: masked.masked,
      createdAt: new Date().toISOString(),
      expiresAt,
      scopes,
      status: 'ACTIVE'
    };
    setKeys((list) => [apiKey, ...list]);
    setMask(masked);
    return masked;
  }, []);

  const rotateKey = useCallback((id: string) => {
    setKeys((list) =>
      list.map((item) =>
        item.id === id
          ? {
              ...item,
              masked: `${item.prefix}••••${Math.random().toString(16).slice(-4)}`,
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
  }, []);

  const revokeKey = useCallback((id: string) => {
    setKeys((list) =>
      list.map((item) => (item.id === id ? { ...item, status: 'REVOKED', updatedAt: new Date().toISOString() } : item))
    );
  }, []);

  const summary = useMemo(() => {
    const active = keys.filter((key) => key.status === 'ACTIVE').length;
    const revoked = keys.filter((key) => key.status === 'REVOKED').length;
    return { active, revoked };
  }, [keys]);

  const detailed = useMemo(
    () =>
      keys.map((key) => ({
        ...key,
        createdAtRelative: formatRelative(key.createdAt),
        expiresAtRelative: formatRelative(key.expiresAt)
      })),
    [keys]
  );

  return {
    keys: detailed,
    summary,
    createKey,
    rotateKey,
    revokeKey,
    revealMask: mask,
    resetReveal: () => setMask(null)
  };
}
