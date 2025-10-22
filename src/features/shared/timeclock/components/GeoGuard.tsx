import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { resolveGeoStatus } from '../lib/geo';
import type { DeviceInfo, Geo, Policy } from '../lib';

export type GeoGuardProps = {
  geo?: Geo;
  device?: DeviceInfo;
  policy?: Policy;
  onRequestException?: () => void;
};

const reasonCopy: Record<string, string> = {
  OUT_OF_RADIUS: 'You appear to be outside the allowed geofence. Move closer to the site perimeter.',
  SSID_BLOCKED: 'This Wi-Fi network is not approved for punches. Connect to a trusted network.',
  IP_BLOCKED: 'This device IP is not on the trusted list. Check VPN or network settings.',
  UNKNOWN: 'Location signal missing. Enable location or connect to an approved network.',
};

export const GeoGuard = ({ geo, device, policy, onRequestException }: GeoGuardProps) => {
  const result = resolveGeoStatus(geo, device, policy);
  const isEnforced = Boolean(policy?.geofence);

  if (!isEnforced) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface/80 p-4 text-sm text-muted-foreground">
        Geofence checks disabled for this policy.
      </div>
    );
  }

  if (result.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100"
      >
        Location verified. Device "{device?.name ?? 'Unknown device'}" is trusted and within bounds.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100"
      role="alert"
    >
      <div className="font-semibold">Location check failed</div>
      <p>{reasonCopy[result.reason]}</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={onRequestException}>
          Request Exception
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        >
          Retry
        </Button>
      </div>
    </motion.div>
  );
};
