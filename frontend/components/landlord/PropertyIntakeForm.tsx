'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Home, Banknote, ClipboardList, ShieldCheck } from 'lucide-react';
import {
  propertyIntakeSchema,
  PropertyIntakeValues,
  intakePropertyTypes,
  getPropertyTypeLabel,
  formatNaira,
} from '@/lib/validations/propertyIntakeSchema';

const BRAND_COLOR = '#04164a';

const STEP_FIELDS: (keyof PropertyIntakeValues)[][] = [
  ['title', 'propertyType', 'address', 'area', 'city', 'state'],
  ['price', 'isNegotiable', 'bedrooms', 'bathrooms', 'toilets'],
  ['description'],
];

const STEPS = [
  { label: 'Property Details', icon: <Home className="w-4 h-4" /> },
  { label: 'Pricing & Specs', icon: <Banknote className="w-4 h-4" /> },
  { label: 'Description & Review', icon: <ClipboardList className="w-4 h-4" /> },
];

interface PropertyIntakeFormProps {
  landlordId: string;
  onSubmit: (values: PropertyIntakeValues, landlordId: string) => Promise<void>;
  isLoading?: boolean;
}

export const PropertyIntakeForm: React.FC<PropertyIntakeFormProps> = ({
  landlordId,
  onSubmit,
  isLoading = false,
}) => {
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PropertyIntakeValues>({
    resolver: zodResolver(propertyIntakeSchema),
    defaultValues: {
      isNegotiable: false,
      state: 'Lagos',
      description: '',
    },
    mode: 'onChange',
  });

  const stepValues = form.getValues();
  const values = form.watch();

  const validateStep = async (index: number) => {
    const result = await form.trigger(STEP_FIELDS[index] as never[]);
    return result;
  };

  const handleNext = async () => {
    setSubmitError(null);
    const valid = await validateStep(step);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (formValues: PropertyIntakeValues) => {
    setSubmitError(null);
    try {
      await onSubmit(formValues, landlordId);
    } catch (error: any) {
      setSubmitError(error?.message ?? 'Something went wrong. Please try again.');
    }
  };

  const inputClass = "pl-3 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20";

  return (
    <div>
      {/* Step indicator */}
      <ol className="flex items-center gap-2 sm:gap-4 mb-8" aria-label="Form progress">
        {STEPS.map((s, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <li key={index} className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-none">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-heading shrink-0 transition-colors ${
                    active ? 'text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                  style={active ? { backgroundColor: BRAND_COLOR } : undefined}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </span>
                <span
                  className={`hidden sm:block text-xs font-semibold font-heading ${active ? '' : 'text-slate-500'}`}
                  style={active ? { color: BRAND_COLOR } : undefined}
                >
                  {s.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`h-px flex-1 min-w-4 ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </li>
          );
        })}
      </ol>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-5 font-body">
          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1 — Property details */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Property Title <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 3-bedroom duplex in Lekki Phase 1"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[#04164a]">Property Type <span className="text-rose-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20 w-full" aria-label="Select property type">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-200">
                        {intakePropertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getPropertyTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Street Address <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="12 Admiralty Way"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Area / Neighbourhood <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Lekki Phase 1"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">City <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Lagos"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">State <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Lagos"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Pricing & specs */}
          {step === 1 && (
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[#04164a]">Asking Price (₦) <span className="text-rose-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        step="any"
                        placeholder="e.g. 85000000"
                        className={inputClass}
                      />
                    </FormControl>
                    <FormDescription>For rent or sale — your manager will advise on pricing strategy.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Bedrooms <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          placeholder="3"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Bathrooms <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          placeholder="4"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toilets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Toilets <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          placeholder="4"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="isNegotiable"
                  checked={values.isNegotiable === true}
                  onCheckedChange={(checked) => form.setValue('isNegotiable', checked === true, { shouldValidate: true, shouldDirty: true })}
                  className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#04164a] data-[state=checked]:border-[#04164a]"
                />
                <label htmlFor="isNegotiable" className="text-sm text-slate-600 leading-snug cursor-pointer">
                  Price is negotiable
                </label>
              </div>
            </div>
          )}

          {/* STEP 3 — Description & review */}
          {step === 2 && (
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[#04164a]">Property Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={5}
                        placeholder="Highlight key features: parking, security, fittings, gated community, proximity to schools/markets, etc."
                        className="border-slate-200 rounded-xl focus:ring-[#04164a]/20 resize-none"
                      />
                    </FormControl>
                    <FormDescription>Optional — helps buyers/tenants and our marketing team.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-[#f3f0ff]/60 rounded-2xl border border-purple-100">
                <p className="text-xs font-semibold uppercase tracking-widest font-heading text-[#4a607a] mb-3">
                  Review your listing
                </p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Title</dt>
                    <dd className="font-medium text-right" style={{ color: BRAND_COLOR }}>{stepValues.title || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Type</dt>
                    <dd className="font-medium text-right" style={{ color: BRAND_COLOR }}>{stepValues.propertyType ? getPropertyTypeLabel(stepValues.propertyType) : '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Location</dt>
                    <dd className="font-medium text-right" style={{ color: BRAND_COLOR }}>
                      {[stepValues.address, stepValues.area, stepValues.city, stepValues.state].filter(Boolean).join(', ') || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Price</dt>
                    <dd className="font-medium text-right" style={{ color: BRAND_COLOR }}>
                      {stepValues.price ? formatNaira(stepValues.price) : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Specs</dt>
                    <dd className="font-medium text-right" style={{ color: BRAND_COLOR }}>
                      {stepValues.bedrooms && stepValues.bathrooms && stepValues.toilets
                        ? `${stepValues.bedrooms} bed • ${stepValues.bathrooms} bath • ${stepValues.toilets} WC`
                        : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Negotiable</dt>
                    <dd className="font-medium text-right" style={{ color: BRAND_COLOR }}>{stepValues.isNegotiable ? 'Yes' : 'No'}</dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs text-emerald-800 leading-snug">
                  Your submission will be reviewed by a Primekey manager. We may contact you for photos and additional details before publishing.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            {step > 0 ? (
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="h-11 px-6 rounded-xl border-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : <span />}

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-11 px-6 rounded-xl bg-[#04164a] hover:bg-[#04164a]/90 text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 rounded-xl bg-[#04164a] hover:bg-[#04164a]/90 text-white"
              >
                {isLoading ? 'Submitting...' : 'Submit for Review'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
