import { useCallback, useState } from 'react';

export type SettingsState = {
  ipAllowlist: string[];
  signingAlgo: 'HMAC_SHA256';
  rotationDays: number;
  retentionDays: number;
  environment: 'SANDBOX' | 'PROD';
  retryPolicy: 'STANDARD' | 'AGGRESSIVE' | 'RELAXED';
};

const initial: SettingsState = {
  ipAllowlist: ['34.102.200.0/24', '34.102.201.0/24'],
  signingAlgo: 'HMAC_SHA256',
  rotationDays: 30,
  retentionDays: 365,
  environment: 'PROD',
  retryPolicy: 'STANDARD'
};

export function useSettings() {
  const [settings, setSettings] = useState(initial);
  const updateSettings = useCallback((patch: Partial<SettingsState>) => {
    setSettings((state) => ({ ...state, ...patch }));
  }, []);

  const addIp = useCallback((ip: string) => {
    setSettings((state) => ({ ...state, ipAllowlist: [...state.ipAllowlist, ip] }));
  }, []);

  const removeIp = useCallback((ip: string) => {
    setSettings((state) => ({
      ...state,
      ipAllowlist: state.ipAllowlist.filter((value) => value !== ip)
    }));
  }, []);

  return {
    settings,
    updateSettings,
    addIp,
    removeIp
  };
}
