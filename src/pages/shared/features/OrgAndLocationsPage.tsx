import { businessHourTemplates, holidayCalendar, timezoneCoverage } from './businessHours.data';

const companyProfileHighlights = [
  { label: 'Founded', value: '2014', detail: 'Born as a digital-first workforce platform' },
  { label: 'Global teammates', value: '12,400+', detail: 'Across retail, corporate, and fulfillment cohorts' },
  { label: 'Markets live', value: '18', detail: 'North America, EMEA, APAC rollouts complete' },
  { label: 'Brands supported', value: '5', detail: 'Lifestyle retail, health, hospitality, and convenience' },
];

const leadershipContacts = [
  {
    name: 'Enterprise Experience Office',
    focus: 'Owns shared location standards, partner governance, and playbooks.',
    partners: ['Workplace services', 'Field operations', 'Digital workplace'],
  },
  {
    name: 'Network Development Council',
    focus: 'Guides expansion roadmap, site selection, and capital investment cadence.',
    partners: ['Finance strategy', 'Legal & compliance', 'People operations'],
  },
  {
    name: 'Command Center',
    focus: 'Monitors live performance, escalations, and seasonal operating switches.',
    partners: ['Incident response', 'Retail ops', 'Customer support'],
  },
];

const locationNetwork = [
  {
    id: 'flagship',
    title: 'Flagship retail experiences',
    footprint: '20k – 35k sq ft',
    presence: 'Downtown cores and destination shopping districts',
    highlights: [
      'Immersive product storytelling zones and personalization studios.',
      'In-store broadcast suites for live commerce and community events.',
      'Clienteling lounges with connected fitting rooms and concierge scheduling.',
    ],
  },
  {
    id: 'neighborhood',
    title: 'Neighborhood studios',
    footprint: '6k – 10k sq ft',
    presence: 'Transit-friendly, mixed-use neighborhoods near core guests',
    highlights: [
      'Express inventory curated by AI demand signals and local community insights.',
      'Pick-up lockers with 24/7 access and autonomous returns processing.',
      'Mobile service carts for pop-ups, outdoor activations, and campus pilots.',
    ],
  },
  {
    id: 'micro-fulfillment',
    title: 'Micro-fulfillment network',
    footprint: '12k – 18k sq ft',
    presence: 'Edge industrial zones within 30 minutes of top guest clusters',
    highlights: [
      'Robotics-enabled pick, pack, and rapid dispatch tied directly into ConfigPro forecasting.',
      'Shared staging with delivery partners and curbside concierge bays.',
      'Dark-store merchandising pods for experimentation and pop-up campaigns.',
    ],
  },
];

const campusBlueprints = [
  {
    id: 'hq',
    title: 'Global headquarters campuses',
    notes: [
      'Hosts product leadership, partner success, finance, and brand studios.',
      'Anchored around hybrid collaboration neighborhoods with modular furniture.',
      'Dedicated hospitality concierges orchestrate visitor journeys and VIP tours.',
    ],
    systems: ['ConfigPro Workplace', 'Envoy', 'ServiceNow', 'Okta'],
  },
  {
    id: 'regional',
    title: 'Regional enablement hubs',
    notes: [
      'Shared analytics and training centers for market launches and seasonal ramp.',
      'Broadcast-ready theaters for livestream academies and product drops.',
      'Embedded labs run cross-functional pilots with store and fulfillment leaders.',
    ],
    systems: ['ConfigPro Workplace', 'Zoom Rooms', 'Seating Dynamics', 'Aruba Central'],
  },
  {
    id: 'innovation',
    title: 'Innovation lofts',
    notes: [
      'Flexible maker spaces co-developed with venture and partner ecosystems.',
      'Instrumented prototype bays for testing emerging guest journeys.',
      'Drop-in hoteling suites support visiting engineers and solution architects.',
    ],
    systems: ['ConfigPro Workplace', 'IoT telemetry fabric', 'Digital twin sandbox'],
  },
];

const roomArchetypes = [
  {
    id: 'command',
    name: 'Operations command room',
    purpose:
      'Real-time performance monitoring with unified dashboards for retail, fulfillment, and digital experience.',
    instrumentation: [
      '360° LED wall of ConfigPro metrics, workforce adherence, and guest satisfaction feeds.',
      'Incident triage stations with acoustic privacy and rapid response communications.',
      'Executive stand-up zone for twice-daily briefings during key campaigns.',
    ],
  },
  {
    id: 'studio',
    name: 'Content studio & broadcast suite',
    purpose: 'Produces livestream shopping, training programs, and seasonal launch content.',
    instrumentation: [
      'Soundstage with adjustable lighting rigs and multi-camera capture.',
      'Green rooms with wardrobe storage and grooming amenities.',
      'Control room integrated with marketing automation and social commerce streams.',
    ],
  },
  {
    id: 'hospitality',
    name: 'Hospitality retreat lounge',
    purpose: 'Hosts VIP guests, partners, and leadership with curated experiences.',
    instrumentation: [
      'Chef-grade pantry with smart inventory monitoring and seasonal menus.',
      'Concierge desk with live itinerary orchestration and travel coordination.',
      'Adaptive seating vignettes for private briefings or collaborative sessions.',
    ],
  },
];

const locationLifecycle = [
  {
    stage: 'Plan',
    focus: 'Strategic design & approval',
    actions: [
      'Model demand forecasts, demographic overlays, and workforce supply to size opportunity.',
      'Align pro forma with capital steering committee, including sustainability benchmarks.',
      'Lock localization requirements for signage, accessibility, and regulatory compliance.',
    ],
  },
  {
    stage: 'Launch',
    focus: 'Activation & change management',
    actions: [
      'Coordinate soft-launch schedules with training squads and marketing blitz teams.',
      'Run tech dress rehearsals covering POS, staffing, and command center alerting.',
      'Capture guest sentiment and operational telemetry for day-15 optimization review.',
    ],
  },
  {
    stage: 'Evolve',
    focus: 'Continuous improvement & expansion',
    actions: [
      'Review quarterly data on dwell time, conversion, and labor utilization to tune layouts.',
      'Deploy rotating pop-up modules and seasonal set reflows to keep experiences fresh.',
      'Share learnings with partner ecosystem via the ConfigPro knowledge base.',
    ],
  },
];

export const OrgAndLocationsPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Organization &amp; Locations Fabric</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Blueprint for aligning enterprise identity, physical network strategy, and immersive rooms that
          enable every ConfigPro experience. Use this reference to anchor future rollouts, partner onboarding,
          and cross-functional storytelling.
        </p>
      </header>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Company profile</h2>
          <p className="text-sm text-muted-foreground">
            Ground truth for storytelling, executive updates, and shared partner context.
          </p>
        </header>

        <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {companyProfileHighlights.map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</dt>
              <dd className="mt-2 text-2xl font-semibold text-foreground">{item.value}</dd>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </dl>

        <div className="grid gap-4 lg:grid-cols-3">
          {leadershipContacts.map((contact) => (
            <div key={contact.name} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-medium text-foreground">{contact.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{contact.focus}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Partner teams:</span>{' '}
                {contact.partners.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Store and site network</h2>
          <p className="text-sm text-muted-foreground">
            Harmonized location archetypes used across markets to design staffing, technology, and guest journeys.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {locationNetwork.map((location) => (
            <div key={location.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{location.title}</h3>
                <p className="text-xs text-muted-foreground">Footprint: {location.footprint}</p>
                <p className="text-xs text-muted-foreground">Presence: {location.presence}</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {location.highlights.map((highlight) => (
                  <li key={highlight} className="rounded-md bg-muted/40 p-3">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Campuses &amp; enablement hubs</h2>
          <p className="text-sm text-muted-foreground">
            Shared workplace blueprints that host cross-functional squads, partner summits, and global operations.
          </p>
        </header>

        <div className="space-y-4">
          {campusBlueprints.map((campus) => (
            <div key={campus.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-semibold text-foreground">{campus.title}</h3>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Systems backbone:</span>{' '}
                  {campus.systems.join(', ')}
                </div>
              </div>
              <ul className="mt-4 grid gap-3 md:grid-cols-3">
                {campus.notes.map((note) => (
                  <li key={note} className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Immersive room archetypes</h2>
          <p className="text-sm text-muted-foreground">
            Signature spaces that anchor the ConfigPro story for guests, partners, and teammates.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {roomArchetypes.map((room) => (
            <div key={room.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">{room.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{room.purpose}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {room.instrumentation.map((item) => (
                  <li key={item} className="rounded-md bg-muted/40 p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Operating rhythms</h2>
          <p className="text-sm text-muted-foreground">
            Standard hours, seasonal adjustments, and timezone governance used across the shared network.
          </p>
        </header>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Business hour templates</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {businessHourTemplates.map((template) => (
                <div key={template.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {template.timezone}
                    </p>
                    <h4 className="text-lg font-semibold text-foreground">{template.label}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {template.windows.map((window) => (
                      <li key={`${template.id}-${window.day}`} className="rounded-md bg-muted/40 p-3">
                        <div className="font-semibold text-foreground">{window.day}</div>
                        <div>
                          {window.open} – {window.close}
                        </div>
                        {window.notes ? <p className="mt-1 text-xs">{window.notes}</p> : null}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                    {template.staffingGuidelines.map((guideline) => (
                      <div key={guideline} className="rounded-md bg-muted/30 p-3">
                        {guideline}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Holiday &amp; seasonal playbook</h3>
              <div className="space-y-3">
                {holidayCalendar.map((holiday) => (
                  <div key={holiday.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-foreground">{holiday.name}</h4>
                        <p className="text-xs text-muted-foreground">Observed: {holiday.observed}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p className="rounded-md bg-muted/40 p-3">
                        <span className="font-semibold text-foreground">Operations:</span> {holiday.operationsPlan}
                      </p>
                      <p className="rounded-md bg-muted/30 p-3">
                        <span className="font-semibold text-foreground">Workforce:</span> {holiday.workforceGuidance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Timezone coverage model</h3>
              <div className="space-y-3">
                {timezoneCoverage.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{entry.region}</p>
                      <h4 className="text-base font-semibold text-foreground">{entry.timezone}</h4>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{entry.coverageModel}</p>
                    {entry.notes ? (
                      <p className="mt-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">{entry.notes}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Location lifecycle</h2>
          <p className="text-sm text-muted-foreground">
            Repeatable phases that keep network expansion, refreshes, and optimization aligned.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {locationLifecycle.map((phase) => (
            <div key={phase.stage} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{phase.stage}</p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{phase.focus}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {phase.actions.map((action) => (
                  <li key={action} className="rounded-md bg-muted/40 p-3">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OrgAndLocationsPage;
