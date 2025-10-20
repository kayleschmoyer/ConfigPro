import { z } from 'zod';

export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(120),
  status: z.enum(['draft', 'active', 'suspended']),
  timezone: z
    .string()
    .regex(/^[A-Za-z_/]+$/, 'Use an IANA timezone identifier'),
  currency: z.string().length(3),
  goLiveDate: z.coerce.date().optional(),
  primaryContact: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;

export const locationSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(2).max(120),
  status: z.enum(['draft', 'active', 'temporarily_closed']),
  timezone: z
    .string()
    .regex(/^[A-Za-z_/]+$/, 'Use an IANA timezone identifier'),
  address: z.object({
    line1: z.string().min(3),
    city: z.string().min(2),
    region: z.string().min(2),
    postalCode: z.string().min(3).max(10),
    country: z.string().length(2),
  }),
  opensAt: z
    .string()
    .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Use HH:mm 24-hour format'),
  closesAt: z
    .string()
    .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Use HH:mm 24-hour format'),
  fulfilmentChannels: z
    .array(z.enum(['in_store', 'pickup', 'delivery', 'kiosk']))
    .min(1),
});

export type LocationInput = z.infer<typeof locationSchema>;

export const menuItemSchema = z.object({
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

export const taxProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(80),
  jurisdiction: z.string().min(2),
  rate: z.number().min(0).max(1),
  exemptions: z.array(z.string()).optional(),
  effectiveFrom: z.coerce.date(),
  workspaceId: z.string().uuid(),
});

export type TaxProfileInput = z.infer<typeof taxProfileSchema>;

export const schedulingRuleSchema = z.object({
  id: z.string().uuid(),
  locationId: z.string().uuid(),
  role: z.string().min(2),
  coverageHours: z.array(
    z.object({
      day: z.enum([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]),
      start: z
        .string()
        .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Use HH:mm 24-hour format'),
      end: z
        .string()
        .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Use HH:mm 24-hour format'),
    })
  ),
  minStaff: z.number().int().min(0),
  maxStaff: z.number().int().min(1),
  constraints: z.array(z.string()).optional(),
});

export type SchedulingRuleInput = z.infer<typeof schedulingRuleSchema>;

export const zodSchemas = {
  workspace: workspaceSchema,
  location: locationSchema,
  menuItem: menuItemSchema,
  taxProfile: taxProfileSchema,
  schedulingRule: schedulingRuleSchema,
} as const;

export type SharedFormKey = keyof typeof zodSchemas;
