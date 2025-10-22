import type { ZodType, ZodTypeDef } from 'zod';
import type * as yup from 'yup';

import { sharedFormValidators } from '@/shared/validation/validators';

import type {
  WorkspaceInput,
  LocationInput,
  MenuItemInput,
  TaxProfileInput,
  SchedulingRuleInput,
} from '@/shared/validation/zodSchemas';

export type SchemaVersion = `${number}.${number}.${number}`;

export interface SchemaFieldDescriptor {
  name: string;
  type: string;
  required: boolean;
  description: string;
  examples?: string[];
}

export interface SchemaLifecycleNotes {
  validation: string;
  hydration: string;
  activation: string;
}

type AnyZodSchema = ZodType<unknown, ZodTypeDef, unknown>;

export interface ValidationSchemaBundle<TZod extends AnyZodSchema = AnyZodSchema> {
  id: string;
  entity: string;
  version: SchemaVersion;
  description: string;
  tags: string[];
  lifecycle: SchemaLifecycleNotes;
  zod: TZod;
  yup: yup.Schema<TZod['_output']>;
  fields: SchemaFieldDescriptor[];
  example: TZod['_output'];
}

export const validationSchemaLibrary: ValidationSchemaBundle[] = [
  {
    id: 'workspace-foundation',
    entity: 'Workspace',
    version: '1.0.0',
    description:
      'Normalises foundational workspace metadata so downstream modules align on currency, timezone, and activation status.',
    tags: ['workspace', 'governance', 'master-data'],
    lifecycle: {
      validation: 'Runs synchronously on workspace creation and whenever operating profile changes are proposed.',
      hydration: 'Mirrors core properties to analytics and scheduling contexts via change-data-capture streams.',
      activation: 'Publishes derived status flags to feature toggles for onboarding, billing, and telemetry workloads.',
    },
    zod: sharedFormValidators.workspace.schema,
    yup: sharedFormValidators.workspace.yup,
    fields: [
      {
        name: 'id',
        type: 'string (uuid)',
        required: true,
        description: 'Globally unique workspace identifier shared across modules and exported integrations.',
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Human friendly workspace label displayed in navigation, emails, and analytics exports.',
      },
      {
        name: 'status',
        type: '"draft" | "active" | "suspended"',
        required: true,
        description: 'Lifecycle state that toggles orchestration flows, billing, and operational alerts.',
        examples: ['draft'],
      },
      {
        name: 'timezone',
        type: 'string',
        required: true,
        description: 'IANA timezone controlling scheduling, reporting cut-offs, and SLA timers.',
        examples: ['America/Los_Angeles'],
      },
      {
        name: 'currency',
        type: 'string (ISO 4217)',
        required: true,
        description: 'Three-letter code used by pricing, taxation, and invoicing engines.',
        examples: ['USD'],
      },
      {
        name: 'goLiveDate',
        type: 'Date',
        required: false,
        description: 'Target launch date stored for resource allocation and onboarding teams.',
      },
      {
        name: 'primaryContact',
        type: '{ name: string; email: string }',
        required: true,
        description: 'Operational owner who receives provisioning updates and approval workflows.',
      },
    ],
    example: {
      id: '0fd1a1a4-7c4a-49f6-8e0a-33a33a3d8b09',
      name: 'Aurora Retail Workspace',
      status: 'active',
      timezone: 'America/Chicago',
      currency: 'USD',
      goLiveDate: new Date('2025-02-03'),
      primaryContact: {
        name: 'Jordan Patel',
        email: 'jordan.patel@example.com',
      },
    } satisfies WorkspaceInput,
  },
  {
    id: 'location-profile',
    entity: 'Location',
    version: '1.1.0',
    description:
      'Captures storefront readiness signals with coverage hours, fulfilment channels, and compliance-ready address data.',
    tags: ['location', 'operations', 'fulfilment'],
    lifecycle: {
      validation: 'Evaluated on location onboarding and when amending trading hours or fulfilment options.',
      hydration: 'Syncs with workforce scheduling, tax nexus, and logistics planning surfaces nightly.',
      activation: 'Raises change events for status flips to notify pickup, delivery, and kiosk orchestration services.',
    },
    zod: sharedFormValidators.location.schema,
    yup: sharedFormValidators.location.yup,
    fields: [
      {
        name: 'id',
        type: 'string (uuid)',
        required: true,
        description: 'Primary location identifier bridging scheduling, workforce, and order routing data.',
      },
      {
        name: 'workspaceId',
        type: 'string (uuid)',
        required: true,
        description: 'Foreign key linking to the workspace record for permissions and financial rollups.',
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Customer-facing location name used in ordering channels and receipts.',
      },
      {
        name: 'status',
        type: '"draft" | "active" | "temporarily_closed"',
        required: true,
        description: 'Operational status replicating to scheduling, signage, and call centre scripts.',
      },
      {
        name: 'timezone',
        type: 'string',
        required: true,
        description: 'Time basis for rosters, compliance windows, and revenue reporting.',
      },
      {
        name: 'address',
        type: '{ line1: string; city: string; region: string; postalCode: string; country: string }',
        required: true,
        description: 'Validated address mapped to tax nexus, delivery polygons, and SLAs.',
      },
      {
        name: 'opensAt',
        type: 'string (HH:mm)',
        required: true,
        description: 'Opening time powering workforce templates and prep reminders.',
      },
      {
        name: 'closesAt',
        type: 'string (HH:mm)',
        required: true,
        description: 'Closing time supporting compliance reporting and cleaning schedules.',
      },
      {
        name: 'fulfilmentChannels',
        type: 'Array<"in_store" | "pickup" | "delivery" | "kiosk">',
        required: true,
        description: 'Configured fulfilment vectors used to fan out orders and staffing plans.',
      },
    ],
    example: {
      id: '6d2e6a18-5a90-4f90-823f-0d40b6f0ce5f',
      workspaceId: '0fd1a1a4-7c4a-49f6-8e0a-33a33a3d8b09',
      name: 'River North Flagship',
      status: 'active',
      timezone: 'America/Chicago',
      address: {
        line1: '123 W Superior St',
        city: 'Chicago',
        region: 'IL',
        postalCode: '60654',
        country: 'US',
      },
      opensAt: '07:00',
      closesAt: '22:00',
      fulfilmentChannels: ['in_store', 'pickup', 'delivery'],
    } satisfies LocationInput,
  },
  {
    id: 'menu-item-canonical',
    entity: 'MenuItem',
    version: '2.0.0',
    description:
      'Defines catalogue attributes used across ordering, pricing simulations, and allergen disclosures for menu items.',
    tags: ['catalogue', 'pricing', 'compliance'],
    lifecycle: {
      validation: 'Applies before menu changes are scheduled or bulk imports are approved for release.',
      hydration: 'Serves canonical fields to KDS, kiosks, and third-party marketplaces via fan-out adapters.',
      activation: 'Triggers price broadcast events and allergen notifications on activation toggles.',
    },
    zod: sharedFormValidators.menuItem.schema,
    yup: sharedFormValidators.menuItem.yup,
    fields: [
      {
        name: 'sku',
        type: 'string',
        required: true,
        description: 'Primary catalogue key referenced by modifiers, bundles, and inventory counts.',
      },
      {
        name: 'workspaceId',
        type: 'string (uuid)',
        required: true,
        description: 'Workspace scope for price governance, taxation, and fulfilment policies.',
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Display name mirrored to digital channels and kitchen stations.',
      },
      {
        name: 'category',
        type: 'string',
        required: true,
        description: 'Menu grouping aligning analytics, tax rules, and merchandising layout.',
      },
      {
        name: 'price',
        type: 'number',
        required: true,
        description: 'Unit price stored as a decimal with 0.01 increments.',
      },
      {
        name: 'taxProfileId',
        type: 'string (uuid)',
        required: true,
        description: 'Link to tax profile driving rate selection and reporting labels.',
      },
      {
        name: 'isActive',
        type: 'boolean',
        required: true,
        description: 'Controls channel availability and indicates readiness for scheduling updates.',
      },
      {
        name: 'allergens',
        type: 'string[]',
        required: false,
        description: 'Optional allergen tags surfaced to channels and compliance dashboards.',
      },
      {
        name: 'modifiers',
        type: 'Array<{ id: string; label: string; additionalPrice: number; required: boolean }>',
        required: false,
        description: 'Configurable modifier groups aligned to upsell playbooks and prep instructions.',
      },
    ],
    example: {
      sku: 'BRG-CLASSIC-001',
      workspaceId: '0fd1a1a4-7c4a-49f6-8e0a-33a33a3d8b09',
      name: 'Classic Aurora Burger',
      category: 'Mains',
      price: 12.5,
      taxProfileId: '32e5f492-1c9b-4e36-98e4-75cf5c28741f',
      isActive: true,
      allergens: ['gluten', 'dairy'],
      modifiers: [
        {
          id: 'a86c4188-3fb8-4823-8e6e-d07e9d46d1bc',
          label: 'Cheddar Cheese',
          additionalPrice: 1.25,
          required: false,
        },
      ],
    } satisfies MenuItemInput,
  },
  {
    id: 'tax-profile-governance',
    entity: 'TaxProfile',
    version: '1.3.0',
    description:
      'Unifies tax jurisdiction metadata and percentages so rating engines, compliance exports, and receipts stay aligned.',
    tags: ['tax', 'compliance', 'finance'],
    lifecycle: {
      validation: 'Runs when finance updates rates or attaches nexus coverage to new locations.',
      hydration: 'Feeds downstream calculation engines and business intelligence aggregates nightly.',
      activation: 'Versioned events broadcast to ordering and invoicing services for seamless rate transitions.',
    },
    zod: sharedFormValidators.taxProfile.schema,
    yup: sharedFormValidators.taxProfile.yup,
    fields: [
      {
        name: 'id',
        type: 'string (uuid)',
        required: true,
        description: 'Unique identifier representing a bundle of tax policies.',
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Finance-approved descriptor shown in reporting and admin tools.',
      },
      {
        name: 'jurisdiction',
        type: 'string',
        required: true,
        description: 'Region, state, or country that the tax profile governs.',
      },
      {
        name: 'rate',
        type: 'number (0-1)',
        required: true,
        description: 'Decimal representation of the combined tax rate.',
      },
      {
        name: 'exemptions',
        type: 'string[]',
        required: false,
        description: 'Optional exemption codes for product-specific overrides.',
      },
      {
        name: 'effectiveFrom',
        type: 'Date',
        required: true,
        description: 'Activation date enabling automated roll-forward handling.',
      },
      {
        name: 'workspaceId',
        type: 'string (uuid)',
        required: true,
        description: 'Workspace context to ensure correct jurisdiction alignment.',
      },
    ],
    example: {
      id: '32e5f492-1c9b-4e36-98e4-75cf5c28741f',
      name: 'Chicago Prepared Food',
      jurisdiction: 'IL-Cook',
      rate: 0.1025,
      exemptions: ['grocery'],
      effectiveFrom: new Date('2025-01-01'),
      workspaceId: '0fd1a1a4-7c4a-49f6-8e0a-33a33a3d8b09',
    } satisfies TaxProfileInput,
  },
  {
    id: 'scheduling-rule-blueprint',
    entity: 'SchedulingRule',
    version: '0.9.0',
    description:
      'Governs staffing guardrails by role so forecasting, payroll, and compliance modules reference the same staffing math.',
    tags: ['scheduling', 'workforce', 'operations'],
    lifecycle: {
      validation: 'Executed when planners adjust coverage windows or role requirements for a location.',
      hydration: 'Replicated into forecasting sandboxes and live roster builders on publish.',
      activation: 'Emits alerts if coverage windows violate labour, tax, or safety policies.',
    },
    zod: sharedFormValidators.schedulingRule.schema,
    yup: sharedFormValidators.schedulingRule.yup,
    fields: [
      {
        name: 'id',
        type: 'string (uuid)',
        required: true,
        description: 'Rule identifier referenced in staffing templates and compliance audits.',
      },
      {
        name: 'locationId',
        type: 'string (uuid)',
        required: true,
        description: 'Location context to tie coverage to trading hours and labour codes.',
      },
      {
        name: 'role',
        type: 'string',
        required: true,
        description: 'Role or position this staffing rule governs.',
      },
      {
        name: 'coverageHours',
        type: 'Array<{ day: string; start: string; end: string }>',
        required: true,
        description: 'Weekly coverage blueprint shared with forecasting and scheduling planners.',
      },
      {
        name: 'minStaff',
        type: 'number',
        required: true,
        description: 'Minimum staff allocation to preserve service and compliance expectations.',
      },
      {
        name: 'maxStaff',
        type: 'number',
        required: true,
        description: 'Maximum staff allocation to protect payroll budgets and workspace constraints.',
      },
      {
        name: 'constraints',
        type: 'string[]',
        required: false,
        description: 'Optional labour guardrails (union notes, certifications, or restrictions).',
      },
    ],
    example: {
      id: 'd16cf5b3-5d0d-45b9-8043-7df6f244da0b',
      locationId: '6d2e6a18-5a90-4f90-823f-0d40b6f0ce5f',
      role: 'Shift Lead',
      coverageHours: [
        { day: 'monday', start: '06:30', end: '14:30' },
        { day: 'friday', start: '10:00', end: '18:00' },
      ],
      minStaff: 1,
      maxStaff: 3,
      constraints: ['Requires food safety certification', 'Max 40 hours per associate'],
    } satisfies SchedulingRuleInput,
  },
];

export type ValidationSchemaId = (typeof validationSchemaLibrary)[number]['id'];

export const validationSchemaIndex: Record<string, ValidationSchemaBundle> = Object.fromEntries(
  validationSchemaLibrary.map((bundle) => [bundle.entity, bundle])
);

export function getValidationSchemaBundle(entity: string): ValidationSchemaBundle | undefined {
  return validationSchemaLibrary.find((bundle) => bundle.entity === entity);
}

export function listValidationEntities(): string[] {
  return validationSchemaLibrary.map((bundle) => bundle.entity);
}

export type {
  WorkspaceInput,
  LocationInput,
  MenuItemInput,
  TaxProfileInput,
  SchedulingRuleInput,
} from '@/shared/validation/zodSchemas';

