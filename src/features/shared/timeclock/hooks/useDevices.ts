import { useCallback, useMemo, useState } from 'react';
import type { Device, DeviceTelemetry } from '../lib/types';
import { formatRelative } from '../lib/format';

const deviceSeed: Device[] = [
  {
    id: 'DEVICE-1',
    name: 'Front Office Kiosk',
    trusted: true,
    siteId: 'HQ',
    lastSeen: new Date().toISOString(),
    kioskMode: true,
    ssid: 'ConfigPro-5G',
    ip: '10.0.0.21',
  },
  {
    id: 'DEVICE-2',
    name: 'Warehouse Tablet',
    trusted: false,
    siteId: 'WH-01',
    lastSeen: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    kioskMode: false,
    ssid: 'Warehouse-IoT',
    ip: '10.0.2.14',
  },
];

const telemetrySeed: Record<string, DeviceTelemetry> = {
  'DEVICE-1': { uptimeHours: 128, lastSync: new Date().toISOString(), mode: 'KIOSK' },
  'DEVICE-2': {
    uptimeHours: 36,
    lastSync: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    mode: 'BROWSER',
  },
};

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>(deviceSeed);
  const [search, setSearch] = useState('');
  const [filterTrusted, setFilterTrusted] = useState<'ALL' | 'TRUSTED' | 'UNTRUSTED'>('ALL');

  const filtered = useMemo(() => {
    return devices.filter((device) => {
      const matchesTrust =
        filterTrusted === 'ALL' ||
        (filterTrusted === 'TRUSTED' ? device.trusted : !device.trusted);
      const matchesSearch = search
        ? device.name.toLowerCase().includes(search.toLowerCase()) ||
          device.siteId?.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesTrust && matchesSearch;
    });
  }, [devices, filterTrusted, search]);

  const toggleTrust = useCallback((deviceId: string, trusted: boolean) => {
    setDevices((prev) => prev.map((device) => (device.id === deviceId ? { ...device, trusted } : device)));
  }, []);

  const registerDevice = useCallback((device: Device) => {
    setDevices((prev) => [...prev, device]);
  }, []);

  const telemetry = useCallback((deviceId: string) => telemetrySeed[deviceId], []);

  const metrics = useMemo(() => {
    const trustedCount = devices.filter((device) => device.trusted).length;
    const kioskCount = devices.filter((device) => device.kioskMode).length;
    return {
      trustedCount,
      kioskCount,
      lastSeenCopy: devices[0] ? formatRelative(devices[0].lastSeen ?? new Date().toISOString()) : 'Never',
    };
  }, [devices]);

  return {
    devices,
    filtered,
    search,
    setSearch,
    filterTrusted,
    setFilterTrusted,
    toggleTrust,
    registerDevice,
    telemetry,
    metrics,
  };
};
