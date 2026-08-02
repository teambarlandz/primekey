'use client';

import React from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AlertCircle, ShieldCheck, User, Phone, Mail, BadgeCheck, Building2, ArrowRight } from 'lucide-react';
import { landlordRegistrationSchema, LandlordRegistrationValues, mapLandlordValuesToPayload } from '@/lib/validations/landlordSchema';

const BRAND_COLOR = '#04164a';

interface LandlordRegistrationFormProps {
  onSubmit: (data: LandlordRegistrationValues) => Promise<void>;
  isLoading?: boolean;
}

export const LandlordRegistrationForm: React.FC<LandlordRegistrationFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<LandlordRegistrationValues>({
    resolver: zodResolver(landlordRegistrationSchema),
    defaultValues: {
      email: '',
      propertyCount: 1,
      ndprConsent: false,
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: LandlordRegistrationValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-5 font-body">
        <div className="p-4 bg-[#f3f0ff]/60 rounded-2xl border border-purple-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#04164a]">NDPR Compliant</p>
            <p className="text-[11px] text-slate-600 font-body">
              Your data is protected under Nigerian data privacy laws.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-[#04164a]">Full Name <span className="text-rose-500">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      {...field}
                      placeholder="John Doe"
                      className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                      autoComplete="name"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-[#04164a]">Phone Number <span className="text-rose-500">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      {...field}
                      type="tel"
                      placeholder="08012345678"
                      className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                      autoComplete="tel"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#04164a]">Email Address (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                    autoComplete="email"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="idType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-[#04164a]">ID Type <span className="text-rose-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20" aria-label="Select ID type">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="nin">National ID (NIN)</SelectItem>
                    <SelectItem value="passport">International Passport</SelectItem>
                    <SelectItem value="driver_license">Driver's License</SelectItem>
                    <SelectItem value="voter_card">Permanent Voter's Card</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-[#04164a]">ID Number <span className="text-rose-500">*</span></FormLabel>
                <FormControl>
<div className="relative">
  <BadgeCheck className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      {...field}
                      placeholder="Enter ID number"
                      className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="propertyCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#04164a]">Properties to List <span className="text-rose-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    placeholder="1"
                    className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20 w-24"
                  />
                </div>
              </FormControl>
              <FormDescription>Number of properties you plan to list</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* NDPR Consent Checkbox */}
        <div className="pt-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="ndprConsent"
              checked={form.watch('ndprConsent') === true}
              onCheckedChange={(checked) => form.setValue('ndprConsent', checked === true, { shouldValidate: true, shouldDirty: true })}
              className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#04164a] data-[state=checked]:border-[#04164a]"
            />
            <label htmlFor="ndprConsent" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
              I consent to Primekey Homes processing my contact information under the Nigeria Data Protection Act (NDPR) for property listing and lead matching services.
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#04164a] underline hover:no-underline ml-1">
                Read Privacy Policy
              </a>
            </label>
          </div>
          {form.formState.errors.ndprConsent && (
            <p className="text-[11px] text-rose-600 mt-1 ml-6">{form.formState.errors.ndprConsent.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading h-12 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
        >
          {isLoading ? 'Submitting...' : 'Submit Registration'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
};

export type { LandlordRegistrationValues };
export { mapLandlordValuesToPayload };