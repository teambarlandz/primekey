import { describe, it, expect } from 'vitest';
import { conciergeFormSchema, mapConciergeValuesToPayload } from './conciergeSchema';

describe('conciergeFormSchema', () => {
  const validBase = {
    fullName: 'John Doe',
    phone: '08012345678',
    email: 'john@example.com',
    preferredLocation: 'Lekki Phase 1',
    propertyType: 'any',
    budgetMin: 0,
    budgetMax: 500000000,
    bedrooms: 'any',
    ndprConsent: true,
  };

  it('accepts valid complete data', () => {
    const result = conciergeFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone formats', () => {
    const invalidPhones = ['123', '0801234567', '080123456789'];
    for (const phone of invalidPhones) {
      const result = conciergeFormSchema.safeParse({ ...validBase, phone });
      expect(result.success).toBe(false);
    }
  });

  it('accepts valid Nigerian phone formats with spaces/dashes/parens', () => {
    const validPhones = [
      '08012345678',
      '07031234567',
      '+2348012345678',
      '2348012345678',
      '080-1234-5678',
      '(080) 123-4567',
    ];
    for (const phone of validPhones) {
      const result = conciergeFormSchema.safeParse({ ...validBase, phone });
      expect(result.success).toBe(true);
    }
  });

  it('accepts empty email', () => {
    const result = conciergeFormSchema.safeParse({ ...validBase, email: '' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = conciergeFormSchema.safeParse({ ...validBase, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects budgetMin > budgetMax', () => {
    const result = conciergeFormSchema.safeParse({ ...validBase, budgetMin: 100000000, budgetMax: 50000000 });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some(i => i.path.includes('budgetMin'))).toBe(true);
  });

  it('rejects ndprConsent false', () => {
    const result = conciergeFormSchema.safeParse({ ...validBase, ndprConsent: false });
    expect(result.success).toBe(false);
  });

  it('rejects missing ndprConsent', () => {
    const { ndprConsent, ...rest } = validBase;
    const result = conciergeFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  describe('mapConciergeValuesToPayload', () => {
    it('transforms to snake_case and cleans phone', () => {
      const values = {
        ...validBase,
        phone: '080-1234-5678',
        email: '',
      };
      const payload = mapConciergeValuesToPayload(values as any);
      expect(payload.full_name).toBe('John Doe');
      expect(payload.phone).toBe('08012345678');
      expect(payload.email).toBeNull();
      expect(payload.preferred_location).toBe('Lekki Phase 1');
      expect(payload.property_type).toBe('any');
      expect(payload.budget_min).toBe(0);
      expect(payload.budget_max).toBe(500000000);
      expect(payload.bedrooms).toBe('any');
      expect(payload.ndpr_consent).toBe(true);
    });
  });
});