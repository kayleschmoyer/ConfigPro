import { Fragment } from 'react';

import {
  coreRoleDefinitions,
  invitationJourney,
  orgMemberPersonas,
  permissionPolicies,
} from './permissions.model';

export const UsersAndRolesPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Users, Roles &amp; Invitations</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Centralized source of truth for how ConfigPro manages identities across systems. Use this
          guide to align on persona needs, RBAC templates, attribute-based automations, and the
          invitation lifecycle that onboards talent with trust.
        </p>
      </header>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Org member personas</h2>
          <p className="text-sm text-muted-foreground">
            Each persona influences access expectations and signals we surface when calibrating
            staffing and compliance guardrails.
          </p>
        </header>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orgMemberPersonas.map((persona) => (
            <li key={persona.id} className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">{persona.coverage}</span>
                <h3 className="text-lg font-semibold text-foreground">{persona.title}</h3>
                <p className="text-sm text-muted-foreground">{persona.mission}</p>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Responsibilities</p>
                  <ul className="mt-1 space-y-1">
                    {persona.responsibilities.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span aria-hidden className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Signals watched</p>
                  <ul className="mt-1 space-y-1">
                    {persona.keySignals.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span aria-hidden className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-auto border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Collaborates with:</span>{' '}
                {persona.collaborators.join(', ')}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Role templates &amp; permissions</h2>
          <p className="text-sm text-muted-foreground">
            Standardized RBAC templates help every deployment start with clear access boundaries.
            Attribute policies later refine these scopes by region, union, or operational telemetry.
          </p>
        </header>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-5 md:divide-x md:divide-y-0">
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Role
            </div>
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Summary
            </div>
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Systems
            </div>
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Permissions
            </div>
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Escalations
            </div>
            {coreRoleDefinitions.map((role) => (
              <Fragment key={role.id}>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-foreground">{role.name}</h3>
                </div>
                <div className="p-4 text-sm text-muted-foreground">{role.summary}</div>
                <div className="p-4 text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    {role.systems.map((system) => (
                      <li key={system} className="flex items-start gap-2">
                        <span aria-hidden className="text-primary">•</span>
                        <span>{system}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    {role.permissions.map((permission) => (
                      <li key={permission} className="flex items-start gap-2">
                        <span aria-hidden className="text-primary">•</span>
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 text-sm text-muted-foreground">
                  {role.escalations ? (
                    <ul className="space-y-1">
                      {role.escalations.map((escalation) => (
                        <li key={escalation} className="flex items-start gap-2">
                          <span aria-hidden className="text-primary">•</span>
                          <span>{escalation}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-muted-foreground/80">No escalations</p>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">RBAC + ABAC policy matrix</h2>
          <p className="text-sm text-muted-foreground">
            Blend baseline role-based controls with contextual attribute guardrails to make access
            decisions automatically, even as teams flex staffing models.
          </p>
        </header>
        <div className="grid gap-4 lg:grid-cols-3">
          {permissionPolicies.map((policy) => (
            <section key={policy.id} className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {policy.type}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{policy.name}</h3>
                <p className="text-sm text-muted-foreground">{policy.summary}</p>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {policy.controls.map((control) => (
                  <li key={`${policy.id}-${control.attribute}-${control.operator}-${control.values.join('-')}`}
                    className="rounded-md border border-border/60 bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {control.attribute} {control.operator} {control.values.join(', ')}
                    </p>
                    <p className="mt-1 text-sm text-foreground">Effect: {control.effect}</p>
                    <p className="mt-1 text-xs text-muted-foreground/90">
                      Applies to: {control.appliesTo}
                    </p>
                    {control.notes ? (
                      <p className="mt-1 text-xs italic text-muted-foreground/80">{control.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Invitation lifecycle</h2>
          <p className="text-sm text-muted-foreground">
            Invitations sync talent operations across ConfigPro. Each stage combines automation with
            guardrails so teams can scale trust without sacrificing agility.
          </p>
        </header>
        <ol className="grid gap-4 lg:grid-cols-4">
          {invitationJourney.map((stage, index) => (
            <li key={stage.id} className="relative flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{stage.stage}</h3>
                <p className="text-sm text-muted-foreground">{stage.objective}</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Automations</p>
                  <ul className="mt-1 space-y-1">
                    {stage.automations.map((automation) => (
                      <li key={automation} className="flex items-start gap-2">
                        <span aria-hidden className="text-primary">•</span>
                        <span>{automation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Guardrails</p>
                  <ul className="mt-1 space-y-1">
                    {stage.guardrails.map((guardrail) => (
                      <li key={guardrail} className="flex items-start gap-2">
                        <span aria-hidden className="text-primary">•</span>
                        <span>{guardrail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
