import { Button } from '@/shared/ui/Button';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { formatRelative } from '../lib/format';
import type { Device, DeviceTelemetry } from '../lib';

export type DeviceListProps = {
  devices: Device[];
  telemetry: (deviceId: string) => DeviceTelemetry | undefined;
  onToggleTrust: (deviceId: string, trusted: boolean) => void;
};

export const DeviceList = ({ devices, telemetry, onToggleTrust }: DeviceListProps) => (
  <TableContainer>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Device</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Network</TableHead>
          <TableHead>Last seen</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.map((device) => {
          const deviceTelemetry = telemetry(device.id);
          return (
            <TableRow key={device.id} className={device.trusted ? '' : 'bg-amber-500/5'}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{device.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {deviceTelemetry ? `${deviceTelemetry.mode} • ${deviceTelemetry.uptimeHours}h uptime` : '—'}
                  </span>
                </div>
              </TableCell>
              <TableCell>{device.siteId ?? 'Unassigned'}</TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span className={device.trusted ? 'text-emerald-300' : 'text-amber-300'}>
                    {device.trusted ? 'Trusted' : 'Requires review'}
                  </span>
                  <span className="text-xs text-muted-foreground">{device.kioskMode ? 'Kiosk mode' : 'Browser session'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  <div>{device.ssid ?? '—'}</div>
                  <div>{device.ip ?? '—'}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm text-muted-foreground">
                  <span>{formatRelative(device.lastSeen ?? new Date().toISOString())}</span>
                  {deviceTelemetry && <span className="text-xs">Sync {formatRelative(deviceTelemetry.lastSync)}</span>}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={device.trusted ? 'ghost' : 'outline'}
                  onClick={() => onToggleTrust(device.id, !device.trusted)}
                >
                  {device.trusted ? 'Mark untrusted' : 'Trust device'}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);
