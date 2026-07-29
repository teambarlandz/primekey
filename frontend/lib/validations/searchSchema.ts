import * as z from 'zod';

export const propertyTypes = [
  'any',
  'self_contain',        // Self-Contain / Studio (Student & Young Pro standard)
  'room_and_parlour',    // Room & Parlour Self-Contain
  'single_room',         // Single Room / Tenement (Face-me-I-face-you)
  'bq',                  // Boys' Quarters (BQ)
  'short_let',           // Short Let / Serviced Apartment
  'flat',                // Standard Flat / Apartment (1-3 Beds)
  'maisonette',          // Maisonette
  'bungalow',            // Bungalow (Detached / Semi-Detached)
  'terrace_duplex',      // Terraced Duplex / Townhouse
  'semi_detached_duplex',// Semi-Detached Duplex
  'fully_detached_duplex',// Fully Detached Duplex
  'penthouse',           // Penthouse
  'mansion',             // Mansion / Luxury Villa
  'land',                // Residential / Commercial Land
  'commercial',          // Shop / Office / Commercial Space
] as const;

export const searchFilterSchema = z.object({
  location: z.string().optional(),
  propertyType: z.enum(propertyTypes).default('any'),
  minPrice: z.number().min(0, 'Min price cannot be negative').default(0),
  maxPrice: z.number().min(0, 'Max price must be positive').default(500000000),
  bedrooms: z.enum(['any', '1', '2', '3', '4', '5']).default('any'),
});

export type SearchFilterValues = z.infer<typeof searchFilterSchema>;
