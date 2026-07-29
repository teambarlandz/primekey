'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conciergeFormSchema, ConciergeFormValues } from '@/lib/validations/conciergeSchema';
import { SearchFilterValues } from '@/lib/validations/searchSchema';
import { api } from '@/lib/api/client';
import { mutate } from 'swr';
import { useState, useEffect } from 'react';

type ConciergeState = 'idle' | 'submitting' | 'success' | 'error';

export function useConcierge(initialFilters?: SearchFilterValues) {
  const [state, setState] = useState<ConciergeState>('idle');
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ConciergeFormValues>({
    resolver: zodResolver(conciergeFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      preferredLocation: initialFilters?.location || '',
      propertyType: initialFilters?.propertyType || 'any',
      budgetMin: initialFilters?.minPrice ?? 0,
      budgetMax: initialFilters?.maxPrice ?? 500000000,
      bedrooms: initialFilters?.bedrooms ?? 'any',
      ndprConsent: false,
    },
  });

  // Pre-fill from initialFilters when modal opens
  useEffect(() => {
    if (initialFilters) {
      form.setValue('preferredLocation', initialFilters.location || '', { shouldValidate: true });
      form.setValue('propertyType', initialFilters.propertyType || 'any');
      form.setValue('budgetMin', typeof initialFilters.minPrice === 'number' ? initialFilters.minPrice : 0);
      form.setValue('budgetMax', typeof initialFilters.maxPrice === 'number' ? initialFilters.maxPrice : 500000000);
      form.setValue('bedrooms', initialFilters.bedrooms ?? 'any');
    }
  }, [initialFilters, form]);

  const submit = async (data: ConciergeFormValues) => {
    setState('submitting');
    setError(null);

    try {
      await api.submitConciergeLead({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        preferredLocation: data.preferredLocation,
        propertyType: data.propertyType,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        bedrooms: data.bedrooms,
        ndprConsent: data.ndprConsent as true,
      });

      // Invalidate search cache to refresh if needed
      await mutate('/properties/search');
      setState('success');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit concierge request. Please check your connection and try again.');
      }
      setState('error');
    }
  };

  const reset = () => {
    form.reset();
    setState('idle');
    setError(null);
  };

  return { form, submit, state, error, reset };
}