import { z } from 'zod';
import { propertyTypes } from './searchSchema';

export const intakePropertyTypes = propertyTypes.filter((type) => type !== 'any');

export const propertyIntakeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Property title must be at least 2 characters')
    .max(200, 'Property title cannot exceed 200 characters'),

  propertyType: z.enum(intakePropertyTypes as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a property type' }),
  }),

  price: z.coerce
    .number({ invalid_type_error: 'Please enter a valid price' })
    .positive('Price must be greater than zero')
    .max(50_000_000_000, 'Price seems too high'),

  isNegotiable: z.boolean().default(false),

  address: z
    .string()
    .trim()
    .min(5, 'Please enter the property address')
    .max(255, 'Address cannot exceed 255 characters'),

  area: z
    .string()
    .trim()
    .min(2, 'Please enter the area/neighbourhood')
    .max(100, 'Area cannot exceed 100 characters'),

  city: z
    .string()
    .trim()
    .min(2, 'Please enter the city')
    .max(100, 'City cannot exceed 100 characters'),

  state: z
    .string()
    .trim()
    .min(2, 'Please enter the state')
    .max(100, 'State cannot exceed 100 characters'),

  bedrooms: z.coerce
    .number({ invalid_type_error: 'Please enter bedrooms' })
    .int()
    .min(1, 'Bedrooms must be at least 1')
    .max(50, 'Bedrooms seems too high'),

  bathrooms: z.coerce
    .number({ invalid_type_error: 'Please enter bathrooms' })
    .int()
    .min(1, 'Bathrooms must be at least 1')
    .max(50, 'Bathrooms seems too high'),

  toilets: z.coerce
    .number({ invalid_type_error: 'Please enter toilets' })
    .int()
    .min(1, 'Toilets must be at least 1')
    .max(50, 'Toilets seems too high'),

  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .default(''),
});

export type PropertyIntakeValues = z.infer<typeof propertyIntakeSchema>;

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  self_contain: 'Self-Contain / Studio',
  room_and_parlour: 'Room & Parlour Self-Contain',
  single_room: 'Single Room / Tenement',
  bq: "Boys' Quarters (BQ)",
  short_let: 'Short Let / Serviced Apartment',
  flat: 'Standard Flat / Apartment',
  maisonette: 'Maisonette',
  bungalow: 'Bungalow',
  terrace_duplex: 'Terraced Duplex / Townhouse',
  semi_detached_duplex: 'Semi-Detached Duplex',
  fully_detached_duplex: 'Fully Detached Duplex',
  penthouse: 'Penthouse',
  mansion: 'Mansion / Luxury Villa',
  land: 'Residential / Commercial Land',
  commercial: 'Shop / Office / Commercial Space',
};

export function getPropertyTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}

/**
 * Transforms camelCase frontend form values to snake_case DRF backend payload.
 */
export function mapIntakeValuesToPayload(values: PropertyIntakeValues, landlordId: string) {
  return {
    landlord: landlordId,
    title: values.title,
    property_type: values.propertyType,
    price: values.price,
    is_negotiable: values.isNegotiable,
    address: values.address,
    area: values.area,
    city: values.city,
    state: values.state,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    toilets: values.toilets,
    description: values.description ?? '',
  };
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}
