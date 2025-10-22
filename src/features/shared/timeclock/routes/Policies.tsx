import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { usePolicies } from '../hooks/usePolicies';
import { PolicyEditor } from '../components/PolicyEditor';

export const Policies = () => {
  const { filtered, selectedPolicyId, setSelectedPolicyId, search, setSearch, updatePolicy, createPolicy } =
    usePolicies();

  const selectedPolicy = filtered.find((policy) => policy.id === selectedPolicyId) ?? filtered[0];

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Policies & rules</h2>
          <p className="text-sm text-muted-foreground">Configure overtime, rounding, geofencing, and anti-buddy toolkit.</p>
        </div>
        <div className="flex gap-3">
          <Input placeholder="Search policies" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Button
            variant="outline"
            onClick={() =>
              createPolicy({
                id: `policy-${Date.now()}`,
                name: 'New policy',
                overtime: { weeklyOTAfterMin: 40 * 60 },
                rounding: { mode: 'NEAREST', incrementMin: 6 },
                grace: {},
                breaks: { mealRequired: false },
                permissions: { employeeEditOwn: true, managerEditTeam: true },
              })
            }
          >
            New policy
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-surface/80 p-4 shadow-xl shadow-black/30">
          <nav className="flex flex-col gap-2" aria-label="Policies">
            {filtered.map((policy) => (
              <button
                key={policy.id}
                type="button"
                onClick={() => setSelectedPolicyId(policy.id)}
                className={
                  policy.id === selectedPolicy?.id
                    ? 'rounded-2xl bg-primary/20 px-4 py-3 text-left text-sm font-semibold text-white'
                    : 'rounded-2xl px-4 py-3 text-left text-sm text-muted-foreground hover:bg-white/5'
                }
              >
                {policy.name}
              </button>
            ))}
          </nav>
        </aside>
        <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl shadow-black/30">
          {selectedPolicy ? (
            <PolicyEditor policy={selectedPolicy} onChange={(policy) => updatePolicy(selectedPolicy.id, policy)} />
          ) : (
            <p className="text-sm text-muted-foreground">No policy selected.</p>
          )}
        </section>
      </div>
    </div>
  );
};
