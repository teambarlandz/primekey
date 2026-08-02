import { describe, it, expect } from 'vitest';
import { landlordRegistrationSchema, mapLandlordValuesToPayload } from './landlordSchema';

describe('landlordRegistrationSchema', () => {
  const validBase = {
    fullName: 'John Doe',
    phone: '08012345678',
    email: 'john@example.com',
    idType: 'nin' as const,
    idNumber: '12345678901',
    propertyCount: 1,
    ndprConsent: true,
  };

  it('accepts valid complete data', () => {
    const result = landlordRegistrationSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('rejects missing fullName', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, fullName: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some(i => i.path.includes('fullName'))).toBe(true);
  });

  it('rejects fullName too short', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, fullName: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone formats', () => {
    const invalidPhones = ['123', '0801234567', '080123456789', '0123456789', 'abc'];
    for (const phone of invalidPhones) {
      const result = landlordRegistrationSchema.safeParse({ ...validBase, phone });
      expect(result.success).toBe(false);
    }
  });

  it('accepts valid Nigerian phone formats', () => {
    const validPhones = [
      '08012345678',
      '07031234567',
      '09091234567',
      '08123456789',
      '+2348012345678',
      '2348012345678',
      '+234 801 234 5678',
      '080-1234-5678',
      '(080) 123-4567',
    ];
    for (const phone of validPhones) {
      const result = landlordRegistrationSchema.safeParse({ ...validBase, phone });
      expect(result.success).toBe(true);
    }
  });

  it('accepts empty email', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, email: '' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid idType', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, idType: 'invalid' as any });
    expect(result.success).toBe(false);
  });

  it('rejects missing idNumber', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, idNumber: '' });
    expect(result.success).toBe(false);
  });

  it('rejects propertyCount < 1', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, propertyCount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects propertyCount > 100', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, propertyCount: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects ndprConsent false', () => {
    const result = landlordRegistrationSchema.safeParse({ ...validBase, ndprConsent: false });
    expect(result.success).toBe(false);
  });

  it('rejects missing ndprConsent', () => {
    const { ndprConsent, ...rest } = validBase;
    const result = landlordRegistrationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  describe('mapLandlordValuesToPayload', () => {
    it('transforms to snake_case and cleans phone', () => {
      const values = {
        ...validBase,
        phone: '080-1234-5678',
        email: '',
      };
      const payload = mapLandlordValuesToPayload(values as any);
      expect(payload.full_name).toBe('John Doe');
      expect(payload.phone).toBe('08012345678');
      expect(payload.email).toBeNull();
      expect(payload.id_type).toBe('nin');
      expect(payload.id_number).toBe('12345678901');
      expect(payload.property_count).toBe(1);
      expect(payload.ndpr_consent).toBe(true);
    });
  });
});