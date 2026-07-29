'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, CheckCircle, Clock, ShieldCheck, Phone, User, MapPin, AlertCircle } from 'lucide-react';
import { useConcierge } from '@/hooks/useConcierge';
import { SearchFilterValues } from '@/lib/validations/searchSchema';
import { ConciergeFormValues } from '@/lib/validations/conciergeSchema';

interface ConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: SearchFilterValues;
}

export const ConciergeModal: React.FC<ConciergeModalProps> = ({
  isOpen,
  onClose,
  initialFilters,
}) => {
  const { form, submit, state, error, reset } = useConcierge(initialFilters);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: ConciergeFormValues) => {
    submit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white border-slate-200 max-w-lg w-[95vw] sm:w-full p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        {state !== 'success' ? (
          <div className="space-y-5">
            <DialogHeader className="text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3f0ff] text-[#04164a] text-xs font-heading font-semibold w-fit">
                <Sparkles className="w-3.5 h-3.5" /> 2-Week Concierge Service
              </div>
              <DialogTitle className="font-heading text-xl sm:text-2xl font-bold text-[#04164a]">
                We'll Find Your Property
              </DialogTitle>
              <DialogDescription className="font-body text-slate-600 text-xs sm:text-sm">
                No matching listings currently available. Register with our luxury concierge team, and we will source verified matches across Nigeria within 14 days.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-body">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 font-body"
            >
              {/* Target Location */}
              <div className="space-y-1">
                <label htmlFor="preferredLocation" className="text-xs font-semibold text-[#04164a]">
                  Target Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="preferredLocation"
                    {...form.register('preferredLocation')}
                    placeholder="e.g. Lekki Phase 1, Maitama, GRA Abeokuta"
                    className="pl-9 h-10 border-slate-200 text-xs rounded-xl"
                    autoComplete="off"
                  />
                </div>
                {form.formState.errors.preferredLocation && (
                  <p className="text-[11px] text-rose-600">{form.formState.errors.preferredLocation.message}</p>
                )}
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="fullName" className="text-xs font-semibold text-[#04164a]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="fullName"
                      {...form.register('fullName')}
                      placeholder="John Doe"
                      className="pl-9 h-10 border-slate-200 text-xs rounded-xl"
                      autoComplete="name"
                    />
                  </div>
                  {form.formState.errors.fullName && (
                    <p className="text-[11px] text-rose-600">{form.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="text-xs font-semibold text-[#04164a]">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      {...form.register('phone')}
                      placeholder="08012345678"
                      className="pl-9 h-10 border-slate-200 text-xs rounded-xl"
                      autoComplete="tel"
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="text-[11px] text-rose-600">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-[#04164a]">
                  Email Address (Optional)
                </label>
                <Input
                  id="email"
                  {...form.register('email')}
                  placeholder="john@example.com"
                  className="h-10 border-slate-200 text-xs rounded-xl"
                  autoComplete="email"
                />
                {form.formState.errors.email && (
                  <p className="text-[11px] text-rose-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* NDPR Consent Checkbox */}
              <div className="pt-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="ndprConsent"
                    onCheckedChange={(checked) => {
                      form.setValue('ndprConsent', checked === true, { shouldValidate: true, shouldDirty: true });
                    }}
                    checked={form.watch('ndprConsent')}
                    className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#04164a]"
                  />
                  <label htmlFor="ndprConsent" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                    I consent to Primekey Homes processing my contact information under the Nigeria Data Protection Act (NDPR) for concierge property sourcing.
                  </label>
                </div>
                {form.formState.errors.ndprConsent && (
                  <p className="text-[11px] text-rose-600 mt-1">{form.formState.errors.ndprConsent.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading h-11 rounded-xl text-sm disabled:opacity-50 mt-2"
              >
                {state === 'submitting' ? 'Registering Request...' : 'Activate Concierge Sourcing'}
              </Button>
            </form>
          </div>
        ) : (
          /* Confirmation View */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-bold text-[#04164a]">Concierge Activated!</h3>
              <p className="font-body text-slate-600 text-xs md:text-sm">
                Your request has been prioritized in our SLA queue. A dedicated Primekey agent will reach out to you within <strong className="text-[#04164a]">2 hours</strong>.
              </p>
            </div>
            <div className="bg-[#f3f0ff] p-3 rounded-xl flex items-center justify-center gap-2 text-xs text-[#04164a] font-body">
              <Clock className="w-4 h-4 shrink-0" />
              <span>2-Hour Agent Response SLA Active</span>
            </div>
            <Button
              onClick={handleClose}
              className="bg-[#04164a] text-white font-heading text-xs px-6 py-2.5 rounded-xl"
            >
              Back to Search
            </Button>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 flex items-center gap-1 justify-center">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Primekey Homes & Properties Ltd · NDPR Certified Lead Engine</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};