import { z } from 'zod';

/**
 * Regex for Nigerian phone numbers:
 * - Supports local format starting with 0: e.g. 08012345678, 07031234567, 09091234567, 08123456789
 * - Supports international format starting with +234 or 234: e.g. +2348012345678, 2348012345678
 */
const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)[789][01]\d{8}$/;

const ID_TYPE_CHOICES = ['nin', 'passport', 'driver_license', 'voter_card'] as const;

export const landlordRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(150, 'Full name cannot exceed 150 characters'),

    phone: z
      .string()
      .trim()
      .refine(
        (val) => NIGERIAN_PHONE_REGEX.test(val.replace(/[\s\-\(\)]/g, '')),
        'Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)'
      ),

    email: z
      .union([
        z.string().trim().email('Invalid email address'),
        z.literal(''),
      ])
      .default(''),

    idType: z.enum(ID_TYPE_CHOICES, {
      errorMap: () => ({ message: 'Please select a valid ID type' }),
    }),

    idNumber: z
      .string()
      .trim()
      .min(5, 'ID number must be at least 5 characters')
      .max(50, 'ID number cannot exceed 50 characters'),

    propertyCount: z
      .number()
      .int()
      .min(1, 'You must list at least 1 property')
      .max(100, 'Property count seems too high')
      .default(1),

    ndprConsent: z.boolean().refine((val) => val === true, {
      message: 'You must accept the NDPR privacy policy to proceed',
    }),
  });

export type LandlordRegistrationValues = z.infer<typeof landlordRegistrationSchema>;

/**
 * Transforms camelCase frontend form values to snake_case DRF backend payload
 */
export function mapLandlordValuesToPayload(values: LandlordRegistrationValues) {
  return {
    full_name: values.fullName,
    phone: values.phone.replace(/[\s\-\(\)]/g, ''),
    email: values.email || null,
    id_type: values.idType,
    id_number: values.idNumber,
    property_count: values.propertyCount,
    ndpr_consent: values.ndprConsent,
  };
}