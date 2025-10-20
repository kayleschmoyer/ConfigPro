export interface SupplierLeadTimeBand {
  skuFamily: string;
  standard: string;
  expedited?: string;
  notes?: string;
}

export interface SupplierProfile {
  id: string;
  name: string;
  category: string;
  coverage: string;
  leadTimes: SupplierLeadTimeBand[];
  collaborationPractices: string[];
  riskSignals: string[];
}

export interface SupplierPerformanceKpi {
  metric: string;
  definition: string;
  target: string;
  instrumentation: string;
}

export interface SupplierPartnershipProgram {
  id: string;
  title: string;
  focus: string;
  playbook: string[];
}

export const strategicSuppliers: SupplierProfile[] = [
  {
    id: 'harbor-beverage',
    name: 'Harbor Beverage Collective',
    category: 'Cold chain beverages',
    coverage: 'National distribution with temperature-controlled cross-docks in 12 regions.',
    leadTimes: [
      {
        skuFamily: 'Nitro cold brew kegs',
        standard: '7 calendar days',
        expedited: '72 hours with surge carrier approvals',
        notes: 'Requires reusable keg returns within 10 days to preserve deposit credits.',
      },
      {
        skuFamily: 'Seasonal syrups & infusions',
        standard: '14 calendar days',
        expedited: '5 days for pre-approved assortments',
      },
    ],
    collaborationPractices: [
      'Weekly demand signal review synced with AuroraDemandNet forecast exports.',
      'Temperature telemetry shared through API feed for in-transit compliance.',
      'Joint business planning every quarter to phase in limited releases.',
    ],
    riskSignals: [
      'Carrier capacity compression during summer tourism season.',
      'Glass bottle shortages when upstream raw materials reallocate to retail partners.',
    ],
  },
  {
    id: 'circuitry',
    name: 'Circuitry Works',
    category: 'IoT sensors & brewing equipment components',
    coverage: 'North America and EU with bonded warehouse stock in Rotterdam.',
    leadTimes: [
      {
        skuFamily: 'Brew controller motherboards',
        standard: '21 calendar days',
        expedited: '10 days with premium assembly shift',
        notes: 'Requires approved firmware bill of materials prior to build.',
      },
      {
        skuFamily: 'Pressure & flow sensors',
        standard: '12 calendar days',
        expedited: '6 days when pulling from Rotterdam stock',
      },
    ],
    collaborationPractices: [
      'Engineering change notices shared via Confluence integration with sign-off workflows.',
      'Vendor-managed inventory agreement for top 20 repair SKUs.',
      'Shared failure mode reporting every sprint to align on field replacements.',
    ],
    riskSignals: [
      'Silicon allocation constraints drive quarterly re-forecast requirements.',
      'Customs paperwork delays during EU regulatory inspections.',
    ],
  },
  {
    id: 'prime-pack',
    name: 'PrimePack Logistics',
    category: 'Sustainable packaging & consumables',
    coverage: 'Regional hubs covering 95% of store footprint within a two-day ground reach.',
    leadTimes: [
      {
        skuFamily: 'Compostable drinkware & lids',
        standard: '5 business days',
        expedited: '48 hours for emergency replenishment',
      },
      {
        skuFamily: 'Branded merchandising collateral',
        standard: '18 calendar days',
        notes: 'Requires approved artwork and compliance checklists for co-branded campaigns.',
      },
    ],
    collaborationPractices: [
      'EDI feed covers ASN milestones, pallet contents, and dock appointment confirmations.',
      'Recycling rebate data transmitted monthly to finance shared services.',
      'Quarterly innovation sprints align packaging trials with sustainability OKRs.',
    ],
    riskSignals: [
      'Paper pulp commodity volatility impacts carton cost escalations.',
      'Expedited replenishment limited during year-end holiday carrier embargoes.',
    ],
  },
];

export const supplierPerformanceKpis: SupplierPerformanceKpi[] = [
  {
    metric: 'On-time in-full (OTIF)',
    definition: 'Percentage of purchase orders that arrive within the agreed window and meet quantity accuracy thresholds.',
    target: '≥ 97% for strategic suppliers; alert at < 95%.',
    instrumentation: 'Procurement data warehouse with near real-time updates from carrier milestones and receiving scans.',
  },
  {
    metric: 'Quality incident rate',
    definition: 'Defective units or compliance holds per 1,000 units received, tracked by SKU family and supplier site.',
    target: '≤ 0.8 incidents per 1,000 units with month-over-month downward trend.',
    instrumentation: 'Field service ticket tagging combined with warehouse inspection forms flowing into analytics lake.',
  },
  {
    metric: 'Lead time adherence',
    definition: 'Variance between promised and actual lead time, segmented by expedite class and fulfilment node.',
    target: '± 2 day variance on standard lead times; ± 1 day on expedite commitments.',
    instrumentation: 'Supply planning control tower with predictive alerts from carrier ETA feeds.',
  },
  {
    metric: 'Collaboration cadence health',
    definition: 'Completion of scheduled joint planning ceremonies and data exchanges within the quarter.',
    target: '100% of committed touchpoints met with documented outcomes.',
    instrumentation: 'Vendor relationship management workspace tracking agenda completion and action logs.',
  },
];

export const supplierPartnershipPrograms: SupplierPartnershipProgram[] = [
  {
    id: 'expedite-surge',
    title: 'Expedite surge framework',
    focus: 'Codify how and when to escalate orders to expedited lanes without breaking cost guardrails.',
    playbook: [
      'Tiered approval matrix referencing budget impact and customer-facing risk.',
      'Digital intake form captures SKU, location, and required-by date to auto-route to supplier contacts.',
      'Post-mortem review ensures expedite fees roll into cost-to-serve dashboards.',
    ],
  },
  {
    id: 'supplier-resilience',
    title: 'Supplier resilience program',
    focus: 'Diversify sources for critical SKUs and document contingency playbooks ahead of disruptions.',
    playbook: [
      'Dual-source matrix maintained in the shared supplier registry with activation triggers.',
      'Quarterly tabletop exercises simulate port closures or regulatory holds.',
      'Scorecard updates broadcast to sourcing, finance, and operations leadership simultaneously.',
    ],
  },
  {
    id: 'collaboration-lab',
    title: 'Collaboration lab',
    focus: 'Align data exchange, API readiness, and change control across supplier ecosystems.',
    playbook: [
      'Shared sandbox credentials and contract SLAs for EDI/API integrations.',
      'Change advisory board ensures firmware, packaging, or compliance updates are rehearsed before launch.',
      'Feedback loops from store and field teams route to suppliers within 48 hours via CRM connectors.',
    ],
  },
];
