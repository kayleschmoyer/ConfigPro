export type PolicyType = 'RBAC' | 'ABAC';

export interface OrgMemberPersona {
  id: string;
  title: string;
  mission: string;
  coverage: string;
  responsibilities: string[];
  keySignals: string[];
  collaborators: string[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  summary: string;
  systems: string[];
  permissions: string[];
  escalations?: string[];
}

export interface PolicyControl {
  attribute: string;
  operator: 'equals' | 'in' | 'contains' | 'lte' | 'gte';
  values: string[];
  effect: 'allow' | 'deny';
  appliesTo: string;
  notes?: string;
}

export interface PermissionPolicy {
  id: string;
  name: string;
  type: PolicyType;
  summary: string;
  controls: PolicyControl[];
}

export interface InvitationJourneyStage {
  id: string;
  stage: string;
  objective: string;
  automations: string[];
  guardrails: string[];
}

export const orgMemberPersonas: OrgMemberPersona[] = [
  {
    id: 'frontline-manager',
    title: 'Frontline Manager',
    mission: 'Keeps a location staffed, compliant, and ready for the day.',
    coverage: 'Single region • 12–80 team members',
    responsibilities: [
      'Approves schedule changes, swaps, and callouts',
      'Monitors real-time coverage alerts from forecasting and scheduling',
      'Initiates invitations for seasonal or temporary staff',
    ],
    keySignals: [
      'Shift adherence variance > 8%',
      'Coverage confidence dropping below 92%',
      'Union rules triggered for consecutive shifts',
    ],
    collaborators: ['Area Director', 'Payroll Analyst', 'People Operations'],
  },
  {
    id: 'people-ops',
    title: 'People Operations Partner',
    mission: 'Designs guardrails for hiring, onboarding, and retention.',
    coverage: 'Multi-brand • 150+ locations',
    responsibilities: [
      'Defines default role templates and compliance rules',
      'Reviews invitation conversion metrics and friction points',
      'Coordinates offboarding workflows across systems',
    ],
    keySignals: [
      'Invitation acceptance rate week over week',
      'Background check turnaround times',
      'Policy exceptions requested by field leaders',
    ],
    collaborators: ['Security Architect', 'Support Enablement', 'Finance Controller'],
  },
  {
    id: 'platform-admin',
    title: 'Platform Administrator',
    mission: 'Ensures ConfigPro access policies are enforced globally.',
    coverage: 'Global org • 30k+ identities',
    responsibilities: [
      'Maintains SSO, SCIM, and identity sync integrations',
      'Audits access by role, attribute, and active invitation status',
      'Ships quarterly compliance attestation packages',
    ],
    keySignals: [
      'Dormant accounts > 45 days',
      'Failed provisioning webhooks',
      'Access reviews pending signatures',
    ],
    collaborators: ['Security Architect', 'IT Governance', 'Regional Leaders'],
  },
];

export const coreRoleDefinitions: RoleDefinition[] = [
  {
    id: 'org-admin',
    name: 'Organization Admin',
    summary:
      'Full access to configuration, billing, and trust controls across ConfigPro experiences.',
    systems: ['Scheduling', 'Forecasting', 'Time Intelligence', 'Shared Services'],
    permissions: [
      'Manage org, region, and location hierarchies',
      'Publish role templates and invitation policies',
      'View financial dashboards and usage analytics',
    ],
    escalations: [
      'Receives high-risk ABAC denials for review',
      'Approves emergency access extensions',
    ],
  },
  {
    id: 'people-manager',
    name: 'People Manager',
    summary: 'Manages staffing, approvals, and coaching for a defined geography.',
    systems: ['Scheduling', 'Time Intelligence'],
    permissions: [
      'Approve shift changes and overtime requests',
      'Invite and offboard team members in assigned locations',
      'Access coaching dashboards with limited analytics',
    ],
    escalations: ['Escalates compliance exceptions to Org Admins'],
  },
  {
    id: 'analyst',
    name: 'Demand & Labor Analyst',
    summary: 'Interprets forecasting and scheduling insights without modifying policies.',
    systems: ['Forecasting', 'Reporting'],
    permissions: [
      'View forecasting scenarios and historical performance',
      'Export labor metrics with anonymized identifiers',
      'Comment on scenarios and share recommendations',
    ],
  },
  {
    id: 'team-member',
    name: 'Team Member',
    summary: 'Accesses schedules, submits availability, and participates in invitations.',
    systems: ['Scheduling'],
    permissions: [
      'View personal schedule and shift opportunities',
      'Respond to invitations and confirm onboarding tasks',
      'Update availability and compliance attestations',
    ],
  },
];

export const permissionPolicies: PermissionPolicy[] = [
  {
    id: 'rbac-core',
    name: 'Core Role Access',
    type: 'RBAC',
    summary: 'Defines baseline entitlements for each ConfigPro role with geographic scoping.',
    controls: [
      {
        attribute: 'role',
        operator: 'equals',
        values: ['Organization Admin'],
        effect: 'allow',
        appliesTo: 'All services and configuration endpoints',
        notes: 'Full create, update, delete rights with audit logging enforced.',
      },
      {
        attribute: 'role',
        operator: 'equals',
        values: ['People Manager'],
        effect: 'allow',
        appliesTo: 'Scheduling management surfaces',
        notes: 'Scope filtered by assigned locations from HRIS sync.',
      },
      {
        attribute: 'role',
        operator: 'equals',
        values: ['Team Member'],
        effect: 'deny',
        appliesTo: 'Admin configuration tools',
        notes: 'Read-only access restricted to self-service views.',
      },
    ],
  },
  {
    id: 'abac-geo',
    name: 'Geo & Compliance Guardrails',
    type: 'ABAC',
    summary:
      'Applies automatic allow or deny decisions based on jurisdiction, union, and compliance posture.',
    controls: [
      {
        attribute: 'region.tier',
        operator: 'in',
        values: ['Tier-1', 'Tier-2'],
        effect: 'allow',
        appliesTo: 'Invitations and onboarding tasks',
        notes: 'High oversight geos require verified background checks prior to access.',
      },
      {
        attribute: 'unionAffiliation',
        operator: 'equals',
        values: ['Collective-A'],
        effect: 'deny',
        appliesTo: 'Self-service schedule swaps',
        notes: 'Escalate to union steward workflow before approving changes.',
      },
      {
        attribute: 'employmentStatus',
        operator: 'equals',
        values: ['Seasonal'],
        effect: 'allow',
        appliesTo: 'Limited-time feature toggles',
        notes: 'Automatically expires access 30 days after season close.',
      },
    ],
  },
  {
    id: 'abac-signal',
    name: 'Signal-Aware Automations',
    type: 'ABAC',
    summary: 'Combines operational telemetry with identity attributes for precision access.',
    controls: [
      {
        attribute: 'coverageConfidence',
        operator: 'lte',
        values: ['85'],
        effect: 'allow',
        appliesTo: 'Emergency staffing pools',
        notes: 'Unlocks standby invitations when coverage drops below threshold.',
      },
      {
        attribute: 'riskScore',
        operator: 'gte',
        values: ['70'],
        effect: 'deny',
        appliesTo: 'Bulk invitation actions',
        notes: 'Requires secondary approval from Organization Admin.',
      },
      {
        attribute: 'lastLoginDays',
        operator: 'gte',
        values: ['45'],
        effect: 'deny',
        appliesTo: 'Scheduling approvals',
        notes: 'Triggers offboarding automation and identity cleanup.',
      },
    ],
  },
];

export const invitationJourney: InvitationJourneyStage[] = [
  {
    id: 'plan',
    stage: 'Plan',
    objective: 'Model demand and identify talent gaps across regions.',
    automations: [
      'Surface open role counts from scheduling and forecasting deltas',
      'Recommend invite cohorts based on qualification coverage',
      'Pre-stage role templates with localized compliance checklists',
    ],
    guardrails: [
      'Org Admin confirms hiring guardrails before launch',
      'Finance notified for budget approval where required',
    ],
  },
  {
    id: 'invite',
    stage: 'Invite',
    objective: 'Launch outreach with branded, guided experiences.',
    automations: [
      'Send multi-channel invitations with SSO pre-provisioning',
      'Track acceptance funnels by role and geography',
      'Orchestrate background checks and credential uploads',
    ],
    guardrails: [
      'Attribute-based policies block non-compliant geos automatically',
      'Invite expirations enforce follow-up within seven days',
    ],
  },
  {
    id: 'activate',
    stage: 'Activate',
    objective: 'Convert accepted invitations into ready-to-work teammates.',
    automations: [
      'Provision ConfigPro apps via SCIM and device sync',
      'Enroll new hires in onboarding journeys and training',
      'Push welcome shifts and mentorship pairings',
    ],
    guardrails: [
      'Time intelligence checks ensure first shift staffing coverage',
      'Dormant accounts auto-expire after 14 days without login',
    ],
  },
  {
    id: 'renew',
    stage: 'Renew',
    objective: 'Maintain long-term access hygiene with scheduled reviews.',
    automations: [
      'Quarterly access reviews with exportable audit logs',
      'Automated nudges for expiring credentials and training',
      'Insights on invitation sources driving highest retention',
    ],
    guardrails: [
      'High-risk policy exceptions routed to security for decision',
      'Location leaders attest to roster accuracy monthly',
    ],
  },
];
