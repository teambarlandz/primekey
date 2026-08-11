import { z } from 'zod';

/**
 * Regex for Nigerian phone numbers:
 * - Supports local format starting with 0: e.g. 08012345678
 * - Supports international format starting with +234 or 234
 */
const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)[789][01]\d{8}$/;

export const jobApplicationSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'First name must be at least 2 characters')
      .max(100, 'First name cannot exceed 100 characters'),

    middleName: z
      .string()
      .trim()
      .max(100, 'Middle name cannot exceed 100 characters')
      .optional()
      .default(''),

    lastName: z
      .string()
      .trim()
      .min(2, 'Last name must be at least 2 characters')
      .max(100, 'Last name cannot exceed 100 characters'),

    email: z
      .string()
      .trim()
      .email('Please enter a valid email address'),

    phone: z
      .string()
      .trim()
      .refine(
        (val) => NIGERIAN_PHONE_REGEX.test(val.replace(/[\s\-()]/g, '')),
        'Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)'
      ),

    coverLetter: z
      .string()
      .trim()
      .max(5000, 'Cover letter cannot exceed 5000 characters')
      .optional()
      .default(''),

    ndprConsent: z.boolean().refine((val) => val === true, {
      message: 'You must accept the NDPR privacy policy to submit your application',
    }),
  });

export type JobApplicationValues = z.infer<typeof jobApplicationSchema>;

/**
 * Transforms camelCase frontend form values to snake_case DRF backend payload
 */
export function mapApplicationValuesToPayload(values: JobApplicationValues) {
  return {
    first_name: values.firstName,
    middle_name: values.middleName || '',
    last_name: values.lastName,
    email: values.email,
    phone: values.phone.replace(/[\s\-()]/g, ''),
    cover_letter: values.coverLetter || '',
    ndpr_consent: values.ndprConsent,
  };
}
