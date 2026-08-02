import { z } from 'zod';

export const APPOINTMENT_TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] as const;

export const appointmentSchema = z.object({
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a preferred date')
    .refine((value) => {
      const selected = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, 'Preferred date cannot be in the past'),

  timeSlot: z.enum(APPOINTMENT_TIME_SLOTS, {
    errorMap: () => ({ message: 'Please select a preferred time slot' }),
  }),

  tourType: z.enum(['in_person', 'virtual'], {
    errorMap: () => ({ message: 'Please select a tour type' }),
  }),

  notes: z
    .string()
    .trim()
    .max(300, 'Notes cannot exceed 300 characters')
    .optional()
    .default(''),
});

export type AppointmentValues = z.infer<typeof appointmentSchema>;

/**
 * Transforms camelCase frontend form values to snake_case DRF backend payload.
 */
export function mapAppointmentValuesToPayload(values: AppointmentValues, landlordId: string) {
  return {
    landlord: landlordId,
    preferred_date: values.preferredDate,
    time_slot: values.timeSlot,
    tour_type: values.tourType,
    notes: values.notes ?? '',
  };
}

export function formatAppointmentDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
