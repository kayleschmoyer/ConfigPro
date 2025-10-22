import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { useDevices } from '../hooks/useDevices';
import { DeviceList } from '../components/DeviceList';

export const Devices = () => {
  const { filtered, search, setSearch, filterTrusted, setFilterTrusted, toggleTrust, telemetry, metrics } =
    useDevices();

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Devices & kiosk</h2>
          <p className="text-sm text-muted-foreground">
            {metrics.trustedCount} trusted devices • {metrics.kioskCount} kiosk ready • Last seen {metrics.lastSeenCopy}
          </p>
        </div>
        <div className="flex gap-3">
          <Input placeholder="Search devices" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={filterTrusted} onChange={(event) => setFilterTrusted(event.target.value as typeof filterTrusted)}>
            <option value="ALL">All devices</option>
            <option value="TRUSTED">Trusted</option>
            <option value="UNTRUSTED">Needs review</option>
          </Select>
          <Button variant="outline">Register device</Button>
        </div>
      </header>

      <DeviceList devices={filtered} telemetry={telemetry} onToggleTrust={toggleTrust} />
    </div>
  );
};
