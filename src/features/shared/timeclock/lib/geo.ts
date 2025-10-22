import type { DeviceInfo, Geo, Policy } from './types';

type GeoCheckResult =
  | { ok: true; reason?: undefined }
  | { ok: false; reason: 'OUT_OF_RADIUS' | 'SSID_BLOCKED' | 'IP_BLOCKED' | 'UNKNOWN' };

const distanceInMeters = (a: Geo, b: Geo) => {
  const earthRadius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const hav = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * earthRadius * Math.asin(Math.sqrt(hav));
};

export const isInsideGeofence = (geo: Geo | undefined, policy: Policy | undefined): GeoCheckResult => {
  if (!policy?.geofence) return { ok: true };
  if (!geo) return { ok: false, reason: 'UNKNOWN' };
  const { center, radiusMeters } = policy.geofence;
  const distance = distanceInMeters(center, geo);
  if (distance > radiusMeters) {
    return { ok: false, reason: 'OUT_OF_RADIUS' };
  }
  return { ok: true };
};

export const isAllowedNetwork = (
  device: DeviceInfo | undefined,
  policy: Policy | undefined
): GeoCheckResult => {
  if (!policy?.geofence) return { ok: true };
  if (!device) return { ok: false, reason: 'UNKNOWN' };
  const { allowedIPs, allowedSSIDs } = policy.geofence;
  if (allowedSSIDs && allowedSSIDs.length > 0 && device.ssid && !allowedSSIDs.includes(device.ssid)) {
    return { ok: false, reason: 'SSID_BLOCKED' };
  }
  if (allowedIPs && allowedIPs.length > 0 && device.ip && !allowedIPs.includes(device.ip)) {
    return { ok: false, reason: 'IP_BLOCKED' };
  }
  return { ok: true };
};

export const resolveGeoStatus = (
  geo: Geo | undefined,
  device: DeviceInfo | undefined,
  policy: Policy | undefined
) => {
  const geoCheck = isInsideGeofence(geo, policy);
  if (!geoCheck.ok) return geoCheck;
  return isAllowedNetwork(device, policy);
};

export type { GeoCheckResult };
