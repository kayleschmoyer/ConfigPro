import { z } from 'zod';
import * as yup from 'yup';

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

export interface ValidationSchemaBundle<TZod extends z.ZodTypeAny = z.ZodTypeAny> {
  id: string;
  entity: string;
  version: SchemaVersion;
  description: string;
  tags: string[];
  lifecycle: SchemaLifecycleNotes;
  zod: TZod;
  yup: yup.ObjectSchema<Record<string, unknown>>;
  fields: SchemaFieldDescriptor[];
  example: Record<string, unknown>;
}

const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(120),
  status: z.enum(['draft', 'active', 'suspended']),
  timezone: z.string().regex(/^[A-Za-z_\\/]+$/, 'Use an IANA timezone identifier'),
  currency: z.string().length(3),
  goLiveDate: z.coerce.date().optional(),
  primaryContact: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;

const workspaceYupSchema: yup.ObjectSchema<WorkspaceInput> = yup
  .object({
    id: yup.string().uuid('Workspace ID must be a UUID').required('Workspace ID is required'),
    name: yup.string().min(3).max(120).required('Workspace name is required'),
    status: yup
      .mixed<WorkspaceInput['status']>()
      .oneOf(['draft', 'active', 'suspended'], 'Status must be draft, active, or suspended')
      .required('Workspace status is required'),
    timezone: yup
      .string()
      .matches(/^[A-Za-z_\\/]+$/, 'Timezone must be an IANA identifier')
      .required('Timezone is required'),
    currency: yup
      .string()
      .matches(/^[A-Z]{3}$/i, 'Use a three letter ISO 4217 currency code')
      .required('Currency is required'),
    goLiveDate: yup.date().optional(),
    primaryContact: yup
      .object({
        name: yup.string().min(2, 'Contact name must have at least 2 characters').required('Contact name is required'),
        email: yup.string().email('Contact email must be valid').required('Contact email is required'),
      })
      .required('Primary contact details are required'),
  })
  .noUnknown(true, 'Unexpected field provided for workspace schema') as yup.ObjectSchema<WorkspaceInput>;

const locationSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(2).max(120),
  status: z.enum(['draft', 'active', 'temporarily_closed']),
  timezone: z.string().regex(/^[A-Za-z_\\/]+$/, 'Use an IANA timezone identifier'),
  address: z.object({
    line1: z.string().min(3),
    city: z.string().min(2),
    region: z.string().min(2),
    postalCode: z.string().min(3).max(10),
    country: z.string().length(2),
  }),
  opensAt: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Use HH:mm 24-hour format'),
  closesAt: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Use HH:mm 24-hour format'),
  fulfilmentChannels: z.array(z.enum(['in_store', 'pickup', 'delivery', 'kiosk'])).min(1),
});

export type LocationInput = z.infer<typeof locationSchema>;

const locationYupSchema: yup.ObjectSchema<LocationInput> = yup
  .object({
    id: yup.string().uuid('Location ID must be a UUID').required('Location ID is required'),
    workspaceId: yup.string().uuid('Workspace ID must be a UUID').required('Workspace ID is required'),
    name: yup.string().min(2).max(120).required('Location name is required'),
    status: yup
      .mixed<LocationInput['status']>()
      .oneOf(['draft', 'active', 'temporarily_closed'], 'Invalid location status')
      .required('Location status is required'),
    timezone: yup
      .string()
      .matches(/^[A-Za-z_\\/]+$/, 'Timezone must be an IANA identifier')
      .required('Timezone is required'),
    address: yup
      .object({
        line1: yup.string().min(3).required('Address line 1 is required'),
        city: yup.string().min(2).required('City is required'),
        region: yup.string().min(2).required('Region is required'),
        postalCode: yup
          .string()
          .min(3, 'Postal code must contain at least 3 characters')
          .max(10, 'Postal code must contain at most 10 characters')
          .required('Postal code is required'),
        country: yup
          .string()
          .matches(/^[A-Z]{2}$/i, 'Use a two letter ISO country code')
          .required('Country is required'),
      })
      .required('Location address is required'),
    opensAt: yup
      .string()
      .matches(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Opening time must use HH:mm 24-hour format')
      .required('Opening time is required'),
    closesAt: yup
      .string()
      .matches(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Closing time must use HH:mm 24-hour format')
      .required('Closing time is required'),
    fulfilmentChannels: yup
      .array()
      .of(yup.mixed<LocationInput['fulfilmentChannels'][number]>().oneOf(['in_store', 'pickup', 'delivery', 'kiosk']))
      .min(1, 'Select at least one fulfilment channel')
      .required('Fulfilment channels are required'),
  })
  .noUnknown(true, 'Unexpected field provided for location schema') as yup.ObjectSchema<LocationInput>;

const menuItemSchema = z.object({
  sku: z.string().min(4).max(32),
  workspaceId: z.string().uuid(),
  name: z.string().min(2).max(80),
  category: z.string().min(2),
  price: z.number().nonnegative().multipleOf(0.01),
  taxProfileId: z.string().uuid(),
  isActive: z.boolean().default(true),
  allergens: z.array(z.string()).max(10).optional(),
  modifiers: z
    .array(
      z.object({
        id: z.string().uuid(),
        label: z.string().min(2),
        additionalPrice: z.number().min(0).max(1000).default(0),
        required: z.boolean().default(false),
      })
    )
    .optional(),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

const menuItemYupSchema: yup.ObjectSchema<MenuItemInput> = yup
  .object({
    sku: yup.string().min(4).max(32).required('SKU is required'),
    workspaceId: yup.string().uuid('Workspace ID must be a UUID').required('Workspace ID is required'),
    name: yup.string().min(2).max(80).required('Menu item name is required'),
    category: yup.string().min(2).required('Category is required'),
    price: yup
      .number()
      .min(0, 'Price must be zero or greater')
      .test('currency-increment', 'Price must increment by 0.01', (value) => value == null || Number.isInteger(Math.round(value * 100)))
      .required('Price is required'),
    taxProfileId: yup.string().uuid('Tax profile ID must be a UUID').required('Tax profile ID is required'),
    isActive: yup.boolean().default(true).required(),
    allergens: yup
      .array()
      .of(yup.string().min(2, 'Allergen entries should be at least 2 characters'))
      .max(10, 'Limit allergens to 10 entries')
      .optional(),
    modifiers: yup
      .array()
      .of(
        yup
          .object({
            id: yup.string().uuid('Modifier ID must be a UUID').required('Modifier ID is required'),
            label: yup.string().min(2).required('Modifier label is required'),
            additionalPrice: yup
              .number()
              .min(0, 'Additional price must be >= 0')
              .max(1000, 'Additional price must be <= 1000')
              .default(0),
            required: yup.boolean().default(false),
          })
          .noUnknown(true, 'Unexpected field provided for modifier')
      )
      .optional(),
  })
  .noUnknown(true, 'Unexpected field provided for menu item schema') as yup.ObjectSchema<MenuItemInput>;

const taxProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(80),
  jurisdiction: z.string().min(2),
  rate: z.number().min(0).max(1),
  exemptions: z.array(z.string()).optional(),
  effectiveFrom: z.coerce.date(),
  workspaceId: z.string().uuid(),
});

export type TaxProfileInput = z.infer<typeof taxProfileSchema>;

const taxProfileYupSchema: yup.ObjectSchema<TaxProfileInput> = yup
  .object({
    id: yup.string().uuid('Tax profile ID must be a UUID').required('Tax profile ID is required'),
    name: yup.string().min(3).max(80).required('Tax profile name is required'),
    jurisdiction: yup.string().min(2).required('Jurisdiction is required'),
    rate: yup
      .number()
      .min(0, 'Rate must be >= 0')
      .max(1, 'Rate must be <= 1 (100%)')
      .required('Tax rate is required'),
    exemptions: yup
      .array()
      .of(yup.string().min(2, 'Exemption codes should be descriptive'))
      .optional(),
    effectiveFrom: yup.date().required('Effective from date is required'),
    workspaceId: yup.string().uuid('Workspace ID must be a UUID').required('Workspace ID is required'),
  })
  .noUnknown(true, 'Unexpected field provided for tax profile schema') as yup.ObjectSchema<TaxProfileInput>;

const schedulingRuleSchema = z.object({
  id: z.string().uuid(),
  locationId: z.string().uuid(),
  role: z.string().min(2),
  coverageHours: z.array(
    z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      start: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Use HH:mm 24-hour format'),
      end: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Use HH:mm 24-hour format'),
    })
  ),
  minStaff: z.number().int().min(0),
  maxStaff: z.number().int().min(1),
  constraints: z.array(z.string()).optional(),
});

export type SchedulingRuleInput = z.infer<typeof schedulingRuleSchema>;

const schedulingRuleYupSchema: yup.ObjectSchema<SchedulingRuleInput> = yup
  .object({
    id: yup.string().uuid('Rule ID must be a UUID').required('Rule ID is required'),
    locationId: yup.string().uuid('Location ID must be a UUID').required('Location ID is required'),
    role: yup.string().min(2).required('Role is required'),
    coverageHours: yup
      .array()
      .of(
        yup
          .object({
            day: yup
              .mixed<SchedulingRuleInput['coverageHours'][number]['day']>()
              .oneOf(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
              .required('Day is required'),
            start: yup
              .string()
              .matches(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Start time must use HH:mm 24-hour format')
              .required('Start time is required'),
            end: yup
              .string()
              .matches(/^([01]?\d|2[0-3]):[0-5]\d$/, 'End time must use HH:mm 24-hour format')
              .required('End time is required'),
          })
          .noUnknown(true, 'Unexpected field provided for coverage hours row')
      )
      .min(1, 'Provide coverage hours for at least one day')
      .required('Coverage hours are required'),
    minStaff: yup
      .number()
      .integer('Minimum staff must be a whole number')
      .min(0, 'Minimum staff must be >= 0')
      .required('Minimum staff is required'),
    maxStaff: yup
      .number()
      .integer('Maximum staff must be a whole number')
      .min(1, 'Maximum staff must be >= 1')
      .required('Maximum staff is required'),
    constraints: yup.array().of(yup.string().min(3, 'Constraints should be descriptive')).optional(),
  })
  .noUnknown(true, 'Unexpected field provided for scheduling rule schema') as yup.ObjectSchema<SchedulingRuleInput>;

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
    zod: workspaceSchema,
    yup: workspaceYupSchema as yup.ObjectSchema<Record<string, unknown>>,
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
      goLiveDate: '2025-02-03',
      primaryContact: {
        name: 'Jordan Patel',
        email: 'jordan.patel@example.com',
      },
    },
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
    zod: locationSchema,
    yup: locationYupSchema as yup.ObjectSchema<Record<string, unknown>>,
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
    },
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
    zod: menuItemSchema,
    yup: menuItemYupSchema as yup.ObjectSchema<Record<string, unknown>>,
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
    },
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
    zod: taxProfileSchema,
    yup: taxProfileYupSchema as yup.ObjectSchema<Record<string, unknown>>,
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
      effectiveFrom: '2025-01-01',
      workspaceId: '0fd1a1a4-7c4a-49f6-8e0a-33a33a3d8b09',
    },
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
    zod: schedulingRuleSchema,
    yup: schedulingRuleYupSchema as yup.ObjectSchema<Record<string, unknown>>,
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
    },
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

