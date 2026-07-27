import * as z from 'zod';

export const conciergeFormSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .refine(
      (val) => /^(?:\+234|234|0)[789][01]\d{8}$/.test(val.replace(/\s+/g, '')),
      { message: 'Please enter a valid Nigerian phone number (e.g. 08012345678)' }
    ),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  preferredLocation: z.string().min(2, 'Target location is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  bedrooms: z.string().default('any'),
  ndprConsent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to data processing under NDPR guidelines',
  }),
});

export type ConciergeFormValues = z.infer<typeof conciergeFormSchema>;
