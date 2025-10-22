import { useMemo } from 'react';
import { useCurrencyFormat } from '../../../shared/hooks/useCurrencyFormat';
import { Input } from '../../../shared/ui/Input';
import { PlanPicker } from '../components/PlanPicker';
import { useInstaller } from './InstallerLayout';

export const StepWelcome = () => {
  const {
    draft,
    updatePlan,
    planDefinitions,
    seatRange,
    locationRange,
    updateSeats,
    updateLocations,
    billingVisible,
  } = useInstaller();

  const { formatCurrency } = useCurrencyFormat({ currency: draft.currency, locale: draft.locale });

  const plan = useMemo(() => planDefinitions.find((item) => item.tier === draft.plan) ?? planDefinitions[0], [draft.plan, planDefinitions]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">ConfigPro Feature Installer</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Choose the deployment plan that matches your rollout objectives. Seats and locations adjust the pricing preview and auto-configure dependencies downstream.
        </p>
      </header>
      <PlanPicker
        plans={planDefinitions}
        activePlan={draft.plan}
        onSelect={updatePlan}
        formatCurrency={(value) => (billingVisible ? formatCurrency({ currency: draft.currency, value }) : 'Hidden')}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Total seats"
          type="number"
          min={seatRange.min}
          max={seatRange.max}
          value={draft.seats ?? ''}
          onChange={(event) => updateSeats(event.target.value ? Number(event.target.value) : undefined)}
          helperText={`Between ${seatRange.min} and ${seatRange.max}.`}
        />
        <Input
          label="Locations"
          type="number"
          min={locationRange.min}
          max={locationRange.max}
          value={draft.locations ?? ''}
          onChange={(event) => updateLocations(event.target.value ? Number(event.target.value) : undefined)}
          helperText={`Between ${locationRange.min} and ${locationRange.max}.`}
        />
      </div>
      <div className="rounded-3xl border border-border/60 bg-surface/80 p-5 text-sm text-muted-foreground">
        <p>
          {billingVisible
            ? `Current bundle: ${plan.name} • ${formatCurrency({ currency: draft.currency, value: plan.basePrice.value })} base`
            : 'Billing details hidden for your role.'}
        </p>
        <p className="mt-2 text-xs text-muted-foreground/80">
          Seats inform workforce modules like scheduling, while locations unlock inventory and finance automation.
        </p>
      </div>
    </section>
  );
};
