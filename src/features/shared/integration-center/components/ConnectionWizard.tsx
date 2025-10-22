import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { cn } from '@/lib/cn';
import type { ConnectionDraft } from '../hooks/useConnectors';
import type { ConnectorCatalogItem } from '../lib/types';
import { ScheduleInput } from './ScheduleInput';
import { MappingEditor } from './MappingEditor';

interface ConnectionWizardProps {
  draft: ConnectionDraft;
  onChange: (draft: ConnectionDraft) => void;
  onSubmit: () => void;
  catalog: ConnectorCatalogItem[];
}

const steps = [
  { id: 'provider', label: 'Choose provider' },
  { id: 'auth', label: 'Authentication' },
  { id: 'scopes', label: 'Scopes' },
  { id: 'mapping', label: 'Mapping' },
  { id: 'sync', label: 'Sync strategy' },
  { id: 'review', label: 'Review & Connect' }
] as const;

type StepId = (typeof steps)[number]['id'];

export function ConnectionWizard({ draft, onChange, onSubmit, catalog }: ConnectionWizardProps) {
  const [activeStep, setActiveStep] = useState<StepId>('provider');
  const [backfillRange, setBackfillRange] = useState('30');

  const selectedConnector = useMemo(
    () => (draft.kind ? catalog.find((item) => item.kind === draft.kind) ?? null : null),
    [catalog, draft.kind]
  );

  const stepIndex = steps.findIndex((step) => step.id === activeStep);
  const canAdvance = useMemo(() => {
    switch (activeStep) {
      case 'provider':
        return Boolean(draft.kind);
      case 'auth':
        return Boolean(draft.authMode);
      case 'scopes':
        return draft.scopes.length > 0;
      case 'mapping':
        return draft.mapping.every((mapping) => mapping.sourceField && mapping.targetField);
      case 'sync':
        return Boolean(draft.schedule);
      case 'review':
        return true;
      default:
        return false;
    }
  }, [activeStep, draft]);

  const goNext = () => {
    if (!canAdvance) return;
    const nextStep = steps[Math.min(stepIndex + 1, steps.length - 1)]!.id;
    if (activeStep === 'review') {
      onSubmit();
      return;
    }
    setActiveStep(nextStep);
  };

  const goPrev = () => {
    const prev = steps[Math.max(stepIndex - 1, 0)]!.id;
    setActiveStep(prev);
  };

  const updateDraft = (patch: Partial<ConnectionDraft>) => {
    onChange({ ...draft, ...patch });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Connection Wizard</h2>
          <p className="text-sm text-muted">Securely connect providers with scoped access and deterministic syncs.</p>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted">
          Step {stepIndex + 1} of {steps.length}
        </div>
      </header>
      <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as StepId)}>
        <TabsList className="flex-wrap">
          {steps.map((step) => (
            <TabsTrigger key={step.id} value={step.id}>
              {step.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-lg shadow-primary/5">
          <TabsContent value="provider">
            <div className="grid gap-4 md:grid-cols-2">
              {catalog.map((item) => (
                <motion.div key={item.kind} layout>
                  <button
                    type="button"
                    className={cn(
                      'w-full rounded-3xl border border-border/60 bg-surface/80 p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                      draft.kind === item.kind && 'border-primary/60 bg-primary/10'
                    )}
                    onClick={() => updateDraft({ kind: item.kind, scopes: item.scopes })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                        <p className="mt-1 text-sm text-muted">{item.description}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
                        {item.domains.length} domains
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                      {item.scopes.slice(0, 6).map((scope) => (
                        <span key={scope} className="rounded-full bg-surface px-3 py-1">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="auth">
            <div className="grid gap-4 md:grid-cols-3">
              {['OAUTH2_PKCE', 'SERVICE_ACCOUNT', 'API_KEY'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(
                    'rounded-3xl border border-border/60 bg-surface/80 p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                    draft.authMode === mode && 'border-primary/60 bg-primary/10'
                  )}
                  onClick={() => updateDraft({ authMode: mode as ConnectionDraft['authMode'] })}
                >
                  <h3 className="text-base font-semibold text-foreground">{mode.replace('_', ' ')}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {mode === 'OAUTH2_PKCE' && 'Secure OAuth flow with PKCE and granular scopes.'}
                    {mode === 'SERVICE_ACCOUNT' && 'Upload encrypted JSON credentials for headless syncs.'}
                    {mode === 'API_KEY' && 'Static API key with rotation and allowlists.'}
                  </p>
                </button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="scopes">
            <fieldset className="grid gap-3">
              <legend className="sr-only">Scopes</legend>
              {selectedConnector?.scopes.map((scope) => {
                const checked = draft.scopes.includes(scope);
                return (
                  <label
                    key={scope}
                    className={cn(
                      'flex items-center justify-between rounded-3xl border border-border/60 bg-surface/80 px-5 py-3 text-sm text-foreground transition focus-within:border-primary/50',
                      checked && 'border-primary/60 bg-primary/10 text-primary'
                    )}
                  >
                    <span>{scope}</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-border accent-primary"
                      checked={checked}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...draft.scopes, scope]
                          : draft.scopes.filter((item) => item !== scope);
                        updateDraft({ scopes: next });
                      }}
                    />
                  </label>
                );
              })}
              {!selectedConnector && (
                <p className="rounded-3xl border border-dashed border-border/60 bg-surface/60 p-6 text-sm text-muted">
                  Choose a provider first to view available scopes.
                </p>
              )}
            </fieldset>
          </TabsContent>
          <TabsContent value="mapping">
            <MappingEditor
              mappings={draft.mapping}
              domains={selectedConnector?.domains ?? ['CUSTOMERS']}
              onChange={(next) => updateDraft({ mapping: next })}
            />
          </TabsContent>
          <TabsContent value="sync">
            <div className="space-y-6">
              <ScheduleInput value={draft.schedule} onChange={(schedule) => updateDraft({ schedule })} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Initial backfill (days)"
                  value={backfillRange}
                  onChange={(event) => setBackfillRange(event.target.value)}
                  helperText="We chunk historical syncs to avoid rate limits."
                />
                <Select
                  label="Sync direction"
                  value={draft.mapping.length > 0 ? 'two-way' : 'one-way'}
                  onChange={() => {}}
                  helperText="Two-way requires mapping for each domain."
                >
                  <option value="one-way">One-way into ConfigPro</option>
                  <option value="two-way">Two-way bidirectional</option>
                </Select>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="review">
            <div className="space-y-4 text-sm text-foreground/80">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Summary</h3>
                <p>Provider: {selectedConnector?.name ?? '—'}</p>
                <p>Auth Mode: {draft.authMode ?? '—'}</p>
                <p>Scopes: {draft.scopes.join(', ') || '—'}</p>
                <p>Schedule: {draft.schedule}</p>
                <p>Backfill: {backfillRange} days</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Mappings</h3>
                {draft.mapping.length === 0 ? (
                  <p>No field mappings configured.</p>
                ) : (
                  <ul className="grid gap-2">
                    {draft.mapping.map((mapping) => (
                      <li key={mapping.id} className="rounded-2xl bg-surface/70 px-4 py-3">
                        <div className="font-mono text-xs text-muted">{mapping.domain}</div>
                        <div className="text-sm text-foreground">
                          {mapping.sourceField} → {mapping.targetField}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      <footer className="flex items-center justify-between">
        <Button variant="ghost" onClick={goPrev} disabled={activeStep === 'provider'}>
          Back
        </Button>
        <Button onClick={goNext} disabled={!canAdvance}>
          {activeStep === 'review' ? 'Connect' : 'Continue'}
        </Button>
      </footer>
    </div>
  );
}
