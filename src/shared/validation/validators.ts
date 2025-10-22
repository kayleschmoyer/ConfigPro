import type { z } from 'zod';
import * as yup from 'yup';

import {
  locationSchema,
  menuItemSchema,
  schedulingRuleSchema,
  taxProfileSchema,
  workspaceSchema,
  type LocationInput,
  type MenuItemInput,
  type SchedulingRuleInput,
  type TaxProfileInput,
  type WorkspaceInput,
} from './zodSchemas';

export type ValidationErrorRecord = Record<string, string[]>;

export type FormValidationResult<TData> =
  | { success: true; data: TData }
  | { success: false; errors: ValidationErrorRecord };

type AnyZodSchema = z.ZodType<unknown, z.ZodTypeDef, unknown>;

export interface FormValidator<TSchema extends AnyZodSchema> {
  schema: TSchema;
  yup: yup.Schema<z.infer<TSchema>>;
  validate: (data: unknown) => z.infer<TSchema>;
  validateWithYup: (data: unknown) => Promise<z.infer<TSchema>>;
  safeValidate: (data: unknown) => FormValidationResult<z.infer<TSchema>>;
}

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
      .matches(/^[A-Za-z_/]+$/, 'Timezone must be an IANA identifier')
      .required('Timezone is required'),
    currency: yup
      .string()
      .matches(/^[A-Z]{3}$/i, 'Use a three letter ISO 4217 currency code')
      .required('Currency is required'),
    goLiveDate: yup.date().optional(),
    primaryContact: yup
      .object({
        name: yup
          .string()
          .min(2, 'Contact name must have at least 2 characters')
          .required('Contact name is required'),
        email: yup.string().email('Contact email must be valid').required('Contact email is required'),
      })
      .required('Primary contact details are required'),
  })
  .noUnknown(true, 'Unexpected field provided for workspace schema') as yup.ObjectSchema<WorkspaceInput>;

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
      .matches(/^[A-Za-z_/]+$/, 'Timezone must be an IANA identifier')
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

const menuItemYupSchema: yup.ObjectSchema<MenuItemInput> = yup
  .object({
    sku: yup.string().min(4).max(32).required('SKU is required'),
    workspaceId: yup.string().uuid('Workspace ID must be a UUID').required('Workspace ID is required'),
    name: yup.string().min(2).max(80).required('Menu item name is required'),
    category: yup.string().min(2).required('Category is required'),
    price: yup
      .number()
      .min(0, 'Price must be zero or greater')
      .test('currency-increment', 'Price must increment by 0.01', (value) =>
        value == null || Number.isInteger(Math.round(value * 100)),
      )
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
          .noUnknown(true, 'Unexpected field provided for modifier'),
      )
      .optional(),
  })
  .noUnknown(true, 'Unexpected field provided for menu item schema') as yup.ObjectSchema<MenuItemInput>;

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
          .noUnknown(true, 'Unexpected field provided for coverage hours row'),
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

function normaliseFieldErrors(fieldErrors: Record<string, string[] | undefined>): ValidationErrorRecord {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, value]) => [key, value ?? []]),
  );
}

function createFormValidator<TSchema extends AnyZodSchema>(
  schema: TSchema,
  yupSchema: yup.Schema<z.infer<TSchema>>,
): FormValidator<TSchema> {
  return {
    schema,
    yup: yupSchema,
    validate: (data) => schema.parse(data),
    validateWithYup: async (data) =>
      yupSchema.validate(data, { abortEarly: false, stripUnknown: false }) as Promise<z.infer<TSchema>>,
    safeValidate: (data) => {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      }

      const { fieldErrors } = result.error.flatten();
      return { success: false, errors: normaliseFieldErrors(fieldErrors) };
    },
  };
}

export const sharedFormValidators = {
  workspace: createFormValidator(workspaceSchema, workspaceYupSchema),
  location: createFormValidator(locationSchema, locationYupSchema),
  menuItem: createFormValidator(menuItemSchema, menuItemYupSchema),
  taxProfile: createFormValidator(taxProfileSchema, taxProfileYupSchema),
  schedulingRule: createFormValidator(schedulingRuleSchema, schedulingRuleYupSchema),
} as const;

type SharedFormValidators = typeof sharedFormValidators;

export type FormIdentifier = keyof SharedFormValidators;

export function validateSharedForm<K extends FormIdentifier>(
  key: K,
  data: unknown,
): FormValidationResult<z.infer<SharedFormValidators[K]['schema']>> {
  const validator = sharedFormValidators[key];
  return validator.safeValidate(data);
}

export function getSharedYupSchema<K extends FormIdentifier>(key: K) {
  return sharedFormValidators[key].yup;
}

export {
  workspaceYupSchema,
  locationYupSchema,
  menuItemYupSchema,
  taxProfileYupSchema,
  schedulingRuleYupSchema,
};
