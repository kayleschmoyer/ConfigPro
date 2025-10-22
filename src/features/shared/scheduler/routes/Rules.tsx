import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useRules } from '../hooks/useRules';

export const Rules = () => {
  const rules = useRules();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Labor guardrails</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Configure minor labor limits, overtime thresholds, and rest requirements. All schedule interactions respect these
          guardrails in real time.
        </p>
      </header>
      <section className="grid gap-6 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur md:grid-cols-2">
        <Input
          label="Daily overtime threshold (minutes)"
          type="number"
          value={rules.profile.overtime?.dailyOTAfterMin ?? ''}
          onChange={(event) =>
            rules.updateProfile({
              overtime: {
                ...rules.profile.overtime,
                dailyOTAfterMin: Number(event.target.value),
              },
            })
          }
        />
        <Input
          label="Weekly overtime threshold (minutes)"
          type="number"
          value={rules.profile.overtime?.weeklyOTAfterMin ?? ''}
          onChange={(event) =>
            rules.updateProfile({
              overtime: {
                ...rules.profile.overtime,
                weeklyOTAfterMin: Number(event.target.value),
              },
            })
          }
        />
        <Input
          label="Minor max daily minutes"
          type="number"
          value={rules.profile.minorLimits?.maxDailyMin ?? ''}
          onChange={(event) =>
            rules.updateProfile({
              minorLimits: {
                ...rules.profile.minorLimits,
                maxDailyMin: Number(event.target.value),
              },
            })
          }
        />
        <Input
          label="Minor max weekly minutes"
          type="number"
          value={rules.profile.minorLimits?.maxWeeklyMin ?? ''}
          onChange={(event) =>
            rules.updateProfile({
              minorLimits: {
                ...rules.profile.minorLimits,
                maxWeeklyMin: Number(event.target.value),
              },
            })
          }
        />
        <Input
          label="Minimum rest (minutes)"
          type="number"
          value={rules.profile.restMin ?? ''}
          onChange={(event) => rules.updateProfile({ restMin: Number(event.target.value) })}
        />
        <Input
          label="Meal break minimum (minutes)"
          type="number"
          value={rules.profile.breaks?.mealMin ?? ''}
          onChange={(event) =>
            rules.updateProfile({
              breaks: {
                ...rules.profile.breaks,
                mealMin: Number(event.target.value),
              },
            })
          }
        />
      </section>
      <Button size="sm" className="self-start">
        Save guardrail changes
      </Button>
    </div>
  );
};
