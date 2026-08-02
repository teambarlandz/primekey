import { describe, it, expect } from 'vitest';
import { searchFilterSchema, propertyTypes } from './searchSchema';

describe('searchFilterSchema', () => {
  const validBase = {
    location: 'Lekki',
    propertyType: 'flat' as const,
    minPrice: 1000000,
    maxPrice: 100000000,
    bedrooms: '2',
  };

  it('accepts valid data', () => {
    const result = searchFilterSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('accepts optional location', () => {
    const result = searchFilterSchema.safeParse({ ...validBase, location: '' });
    expect(result.success).toBe(true);
  });

  it('defaults propertyType to any', () => {
    const { propertyType, ...rest } = validBase;
    const result = searchFilterSchema.safeParse(rest);
    expect(result.success).toBe(true);
    expect(result.data?.propertyType).toBe('any');
  });

  it('rejects invalid propertyType', () => {
    const result = searchFilterSchema.safeParse({ ...validBase, propertyType: 'invalid' as any });
    expect(result.success).toBe(false);
  });

  it('accepts all valid property types', () => {
    for (const type of propertyTypes) {
      const result = searchFilterSchema.safeParse({ ...validBase, propertyType: type });
      expect(result.success).toBe(true);
    }
  });

  it('rejects negative minPrice', () => {
    const result = searchFilterSchema.safeParse({ ...validBase, minPrice: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects negative maxPrice', () => {
    const result = searchFilterSchema.safeParse({ ...validBase, maxPrice: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts minPrice = 0', () => {
    const result = searchFilterSchema.safeParse({ ...validBase, minPrice: 0 });
    expect(result.success).toBe(true);
  });

  it('defaults bedrooms to any', () => {
    const { bedrooms, ...rest } = validBase;
    const result = searchFilterSchema.safeParse(rest);
    expect(result.success).toBe(true);
    expect(result.data?.bedrooms).toBe('any');
  });
});