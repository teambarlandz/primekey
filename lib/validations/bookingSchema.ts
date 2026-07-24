import { z } from 'zod';

// Regex for Nigerian phone numbers (+234, 080, 070, 090, 081, etc.)
const NIGERIAN_PHONE_REGEX = /^(?:\+234|0)[789][01]\d{8}$/;

export const bookingSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters'),
    
  email: z
    .string()
    .email('Please provide a valid email address'),

  phone: z
    .string()
    .regex(
      NIGERIAN_PHONE_REGEX,
      'Enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)'
    ),

  inspectionDate: z
    .date({
      required_error: 'Please select a preferred inspection date',
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Inspection date cannot be in the past'),

  timeSlot: z
    .enum(['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], {
      required_error: 'Please select a preferred time slot',
    }),

  tourType: z
    .enum(['in_person', 'virtual'], {
      required_error: 'Please select a tour type',
    }),

  notes: z
    .string()
    .max(300, 'Notes cannot exceed 300 characters')
    .optional(),
});

export type BookingSchemaType = z.infer<typeof bookingSchema>;
