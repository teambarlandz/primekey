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
import { Button } from '@/components/ui/button';
import { AlertCircle, CalendarDays, Clock, MonitorSmartphone, Building2, ArrowRight } from 'lucide-react';
import {
  appointmentSchema,
  AppointmentValues,
  APPOINTMENT_TIME_SLOTS,
  formatAppointmentDate,
} from '@/lib/validations/appointmentSchema';

const BRAND_COLOR = '#04164a';

interface AppointmentBookingFormProps {
  landlordId: string;
  onSubmit: (values: AppointmentValues, landlordId: string) => Promise<void>;
  isLoading?: boolean;
}

export const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
  landlordId,
  onSubmit,
  isLoading = false,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      notes: '',
    },
    mode: 'onChange',
  });

  const values = form.watch();
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (formValues: AppointmentValues) => {
    setSubmitError(null);
    try {
      await onSubmit(formValues, landlordId);
    } catch (error: any) {
      setSubmitError(error?.message ?? 'Something went wrong. Please try again.');
    }
  };

  const inputClass = "pl-3 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-5 font-body">
        {submitError && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <FormField
          control={form.control}
          name="preferredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#04164a]">Preferred Date <span className="text-rose-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input
                    {...field}
                    type="date"
                    min={minDate}
                    className={`pl-10 ${inputClass}`}
                  />
                </div>
              </FormControl>
              <FormDescription>Choose a date from tomorrow onwards.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeSlot"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#04164a]">Time Slot <span className="text-rose-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20 w-full" aria-label="Select time slot">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-slate-200">
                  {APPOINTMENT_TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tourType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#04164a]">Tour Type <span className="text-rose-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20 w-full" aria-label="Select tour type">
                    <SelectValue placeholder="Select tour type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="in_person">In-Person Tour</SelectItem>
                  <SelectItem value="virtual">Virtual Tour</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#04164a]">Notes for your manager</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Anything we should know? e.g. gate access, preferred video call link, number of guests."
                  className="border-slate-200 rounded-xl focus:ring-[#04164a]/20 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {values.preferredDate && values.timeSlot && values.tourType && (
          <div className="p-4 bg-[#f3f0ff]/60 rounded-2xl border border-purple-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] shrink-0">
              {values.tourType === 'virtual' ? <MonitorSmartphone className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <p className="text-sm text-[#22376e] font-body">
              <span className="font-semibold font-heading" style={{ color: BRAND_COLOR }}>
                {values.tourType === 'virtual' ? 'Virtual tour' : 'In-person tour'}
              </span>{' '}
              scheduled for <span className="font-semibold">{formatAppointmentDate(values.preferredDate)}</span>{' '}
              at <span className="font-semibold inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{values.timeSlot}</span>.
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading flex items-center justify-center gap-2"
        >
          {isLoading ? 'Booking...' : 'Confirm Appointment'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
};
