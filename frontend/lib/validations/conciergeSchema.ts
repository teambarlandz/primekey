import { z } from 'zod';

/**
 * Regex for Nigerian phone numbers:
 * - Supports local format starting with 0: e.g. 08012345678, 07031234567, 09091234567, 08123456789
 * - Supports international format starting with +234 or 234: e.g. +2348012345678, 2348012345678
 */
const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)[789][01]\d{8}$/;

export const conciergeFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),

    phone: z
      .string()
      .trim()
      // Strips out spaces, dashes, and parentheses automatically before validating
      .transform((val) => val.replace(/[\s\-\(\)]/g, ''))
      .pipe(
        z
          .string()
          .regex(
            NIGERIAN_PHONE_REGEX,
            'Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)'
          )
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address')
      .optional()
      .or(z.literal('')),

    preferredLocation: z
      .string()
      .trim()
      .min(2, 'Target location is required')
      .max(150, 'Location description is too long'),

    // Non-rendered / filter context fields with defaults
    propertyType: z.string().optional().default('any'),
    budgetMin: z.number().nonnegative('Budget cannot be negative').optional().default(0),
    budgetMax: z.number().positive('Budget must be greater than zero').optional().default(500000000),
    bedrooms: z.union([z.string(), z.number()]).optional().default('any'),

    // Legal & compliance consent
    ndprConsent: z.boolean().refine((val) => val === true, {
      message: 'You must accept the NDPR privacy policy to proceed',
    }),
  })
  // Cross-field validation: Ensure budget minimum is not greater than budget maximum
  .refine(
    (data) => {
      const min = data.budgetMin ?? 0;
      const max = data.budgetMax ?? 500000000;
      return min <= max;
    },
    {
      message: 'Minimum budget cannot exceed maximum budget',
      path: ['budgetMin'], // Attaches error to the budgetMin field
    }
  );

export type ConciergeFormValues = z.infer<typeof conciergeFormSchema>;

/**
 * Transforms camelCase frontend form values to snake_case DRF backend payload
 */
export function mapConciergeValuesToPayload(values: ConciergeFormValues) {
  return {
    full_name: values.fullName,
    phone: values.phone,
    email: values.email || null,
    preferred_location: values.preferredLocation,
    property_type: values.propertyType ?? 'any',
    budget_min: values.budgetMin ?? 0,
    budget_max: values.budgetMax ?? 500000000,
    bedrooms: String(values.bedrooms ?? 'any'),
    ndpr_consent: values.ndprConsent,
  };
}
