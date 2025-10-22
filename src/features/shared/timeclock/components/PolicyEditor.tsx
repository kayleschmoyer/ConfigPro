import { useMemo } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/Tabs';
import { Button } from '../../../shared/ui/Button';
import type { Policy } from '../lib/types';

export type PolicyEditorProps = {
  policy: Policy;
  onChange: (policy: Policy) => void;
};

const minutes = (value?: number) => (value ? value / 60 : 0);
const toMinutes = (value: number) => Math.max(0, Math.round(value * 60));

export const PolicyEditor = ({ policy, onChange }: PolicyEditorProps) => {
  const roundingOptions = useMemo(
    () => [
      { value: 'NEAREST', label: 'Nearest' },
      { value: 'UP', label: 'Always up' },
      { value: 'DOWN', label: 'Always down' },
    ],
    []
  );

  const handlePolicyChange = (updates: Partial<Policy>) => {
    onChange({ ...policy, ...updates });
  };

  return (
    <Tabs defaultValue="overtime" className="w-full">
      <TabsList>
        <TabsTrigger value="overtime">Overtime</TabsTrigger>
        <TabsTrigger value="breaks">Breaks</TabsTrigger>
        <TabsTrigger value="geofence">Geofence</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="overtime" className="rounded-3xl border border-white/5 bg-surface/70 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="number"
            label="Daily OT after (hours)"
            value={minutes(policy.overtime.dailyOTAfterMin)}
            onChange={(event) =>
              handlePolicyChange({
                overtime: {
                  ...policy.overtime,
                  dailyOTAfterMin: toMinutes(Number(event.target.value)),
                },
              })
            }
            min={0}
          />
          <Input
            type="number"
            label="Daily DT after (hours)"
            value={minutes(policy.overtime.dailyDTAfterMin)}
            onChange={(event) =>
              handlePolicyChange({
                overtime: {
                  ...policy.overtime,
                  dailyDTAfterMin: toMinutes(Number(event.target.value)),
                },
              })
            }
            min={0}
          />
          <Input
            type="number"
            label="Weekly OT after (hours)"
            value={minutes(policy.overtime.weeklyOTAfterMin)}
            onChange={(event) =>
              handlePolicyChange({
                overtime: {
                  ...policy.overtime,
                  weeklyOTAfterMin: toMinutes(Number(event.target.value)),
                },
              })
            }
            min={0}
          />
          <Select
            label="Rounding mode"
            value={policy.rounding.mode}
            onChange={(event) =>
              handlePolicyChange({ rounding: { ...policy.rounding, mode: event.target.value as Policy['rounding']['mode'] } })
            }
          >
            {roundingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            label="Rounding increment"
            value={String(policy.rounding.incrementMin)}
            onChange={(event) =>
              handlePolicyChange({
                rounding: {
                  ...policy.rounding,
                  incrementMin: Number(event.target.value) as Policy['rounding']['incrementMin'],
                },
              })
            }
          >
            {[5, 6, 10, 15].map((option) => (
              <option key={option} value={option}>
                {option} minutes
              </option>
            ))}
          </Select>
        </div>
      </TabsContent>
      <TabsContent value="breaks" className="rounded-3xl border border-white/5 bg-surface/70 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={policy.breaks.mealRequired}
              onChange={(event) =>
                handlePolicyChange({ breaks: { ...policy.breaks, mealRequired: event.target.checked } })
              }
              className="h-4 w-4 rounded border border-white/30 bg-surface"
            />
            Meal break required
          </label>
          <Input
            type="number"
            label="Meal minimum (minutes)"
            value={policy.breaks.mealMin ?? 30}
            onChange={(event) =>
              handlePolicyChange({ breaks: { ...policy.breaks, mealMin: Number(event.target.value) } })
            }
            min={0}
          />
          <Input
            type="number"
            label="Second meal after (hours)"
            value={minutes(policy.breaks.secondMealAfterMin)}
            onChange={(event) =>
              handlePolicyChange({
                breaks: {
                  ...policy.breaks,
                  secondMealAfterMin: toMinutes(Number(event.target.value)),
                },
              })
            }
            min={0}
          />
          <Input
            type="number"
            label="Paid break minutes"
            value={policy.breaks.paidBreakMin ?? 10}
            onChange={(event) =>
              handlePolicyChange({ breaks: { ...policy.breaks, paidBreakMin: Number(event.target.value) } })
            }
            min={0}
          />
        </div>
      </TabsContent>
      <TabsContent value="geofence" className="rounded-3xl border border-white/5 bg-surface/70 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Latitude"
            type="number"
            value={policy.geofence?.center.lat ?? 0}
            onChange={(event) =>
              handlePolicyChange({
                geofence: {
                  ...(policy.geofence ?? { center: { lat: 0, lng: 0 }, radiusMeters: 100 }),
                  center: {
                    ...(policy.geofence?.center ?? { lat: 0, lng: 0 }),
                    lat: Number(event.target.value),
                  },
                },
              })
            }
          />
          <Input
            label="Longitude"
            type="number"
            value={policy.geofence?.center.lng ?? 0}
            onChange={(event) =>
              handlePolicyChange({
                geofence: {
                  ...(policy.geofence ?? { center: { lat: 0, lng: 0 }, radiusMeters: 100 }),
                  center: {
                    ...(policy.geofence?.center ?? { lat: 0, lng: 0 }),
                    lng: Number(event.target.value),
                  },
                },
              })
            }
          />
          <Input
            label="Radius (meters)"
            type="number"
            value={policy.geofence?.radiusMeters ?? 100}
            onChange={(event) =>
              handlePolicyChange({
                geofence: {
                  ...(policy.geofence ?? { center: { lat: 0, lng: 0 }, radiusMeters: 100 }),
                  radiusMeters: Number(event.target.value),
                },
              })
            }
            min={10}
          />
          <Input
            label="Allowed SSIDs (comma separated)"
            value={(policy.geofence?.allowedSSIDs ?? []).join(', ')}
            onChange={(event) =>
              handlePolicyChange({
                geofence: {
                  ...(policy.geofence ?? { center: { lat: 0, lng: 0 }, radiusMeters: 100 }),
                  allowedSSIDs: event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                },
              })
            }
          />
          <Input
            label="Allowed IPs (comma separated)"
            value={(policy.geofence?.allowedIPs ?? []).join(', ')}
            onChange={(event) =>
              handlePolicyChange({
                geofence: {
                  ...(policy.geofence ?? { center: { lat: 0, lng: 0 }, radiusMeters: 100 }),
                  allowedIPs: event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </div>
      </TabsContent>
      <TabsContent value="security" className="rounded-3xl border border-white/5 bg-surface/70 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={policy.antiBuddy?.selfieRequired ?? false}
              onChange={(event) =>
                handlePolicyChange({
                  antiBuddy: { ...policy.antiBuddy, selfieRequired: event.target.checked },
                })
              }
              className="h-4 w-4 rounded border border-white/30 bg-surface"
            />
            Require selfie
          </label>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={policy.antiBuddy?.livenessRandom ?? false}
              onChange={(event) =>
                handlePolicyChange({
                  antiBuddy: { ...policy.antiBuddy, livenessRandom: event.target.checked },
                })
              }
              className="h-4 w-4 rounded border border-white/30 bg-surface"
            />
            Random liveness prompts
          </label>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={policy.antiBuddy?.rotatingQR ?? false}
              onChange={(event) =>
                handlePolicyChange({ antiBuddy: { ...policy.antiBuddy, rotatingQR: event.target.checked } })
              }
              className="h-4 w-4 rounded border border-white/30 bg-surface"
            />
            Rotating QR challenge
          </label>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handlePolicyChange({ permissions: { employeeEditOwn: true, managerEditTeam: true } })}>
              Reset permissions
            </Button>
            <span className="text-xs text-muted-foreground">
              Employees can edit their own entries: {policy.permissions.employeeEditOwn ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
