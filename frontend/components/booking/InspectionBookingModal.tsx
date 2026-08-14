'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  Video,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  bookingSchema,
  BookingSchemaType,
} from '@/lib/validations/bookingSchema';

interface InspectionBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyLocation: string;
  onBookingSuccess?: (data: BookingSchemaType) => void;
}

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] as const;

export const InspectionBookingModal: React.FC<InspectionBookingModalProps> = ({
  isOpen,
  onClose,
  propertyTitle,
  propertyLocation,
  onBookingSuccess,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<BookingSchemaType | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingSchemaType>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      tourType: 'in_person',
      timeSlot: '11:00 AM',
      notes: '',
    },
  });

  const selectedTourType = watch('tourType');
  const selectedTimeSlot = watch('timeSlot');

  const onSubmit = async (data: BookingSchemaType) => {
    // TODO: POST to a buyer-facing inspection endpoint once backend creates one.
    // Currently submitAppointment hits /landlords/appointments/ which requires landlord auth.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmittedData(data);
    setIsSubmitted(true);
    if (onBookingSuccess) {
      onBookingSuccess(data);
    }
  };

  const handleModalClose = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[540px] bg-background border-border p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        {!isSubmitted ? (
          <>
            <DialogHeader className="space-y-1.5 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-heading text-primary border-border">
                  <Sparkles className="w-3 h-3 mr-1 text-primary" /> Direct Booking
                </Badge>
              </div>
              <DialogTitle className="font-heading text-xl font-bold text-primary">
                Schedule Property Inspection
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-body">
                Select your preferred date, slot, and tour format for{' '}
                <span className="font-semibold text-primary">{propertyTitle}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
              {/* Tour Mode Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-primary block">
                  Tour Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('tourType', 'in_person')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-heading font-semibold transition-all ${
                      selectedTourType === 'in_person'
                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> Physical Inspection
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('tourType', 'virtual')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-heading font-semibold transition-all ${
                      selectedTourType === 'virtual'
                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Video className="w-4 h-4" /> Virtual Video Tour
                  </button>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Picker Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-semibold text-primary flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" /> Date
                  </label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setValue('inspectionDate', new Date(e.target.value), {
                          shouldValidate: true,
                        });
                      }
                    }}
                    className="h-10 text-xs rounded-xl border-border font-body focus-visible:ring-primary"
                  />
                  {errors.inspectionDate && (
                    <span className="text-[11px] text-destructive block font-body">
                      {errors.inspectionDate.message}
                    </span>
                  )}
                </div>

                {/* Time Slots */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-semibold text-primary flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setValue('timeSlot', slot)}
                        className={`py-2 px-1 rounded-lg text-[11px] font-heading font-semibold border transition-all ${
                          selectedTimeSlot === slot
                            ? 'border-primary bg-secondary text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.timeSlot && (
                    <span className="text-[11px] text-destructive block font-body">
                      {errors.timeSlot.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Contact Info */}
              <div className="space-y-3 border-t border-border/60 pt-3">
                <h4 className="text-xs font-heading font-bold text-primary uppercase tracking-wider">
                  Contact Information
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <Input
                        {...register('fullName')}
                        placeholder="Full Name"
                        className="pl-9 h-10 text-xs rounded-xl border-border font-body focus-visible:ring-primary"
                      />
                    </div>
                    {errors.fullName && (
                      <span className="text-[11px] text-destructive mt-0.5 block font-body">
                        {errors.fullName.message}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="Email Address"
                          className="pl-9 h-10 text-xs rounded-xl border-border font-body focus-visible:ring-primary"
                        />
                      </div>
                      {errors.email && (
                        <span className="text-[11px] text-destructive mt-0.5 block font-body">
                          {errors.email.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        <Input
                          {...register('phone')}
                          placeholder="08012345678"
                          className="pl-9 h-10 text-xs rounded-xl border-border font-body focus-visible:ring-primary"
                        />
                      </div>
                      {errors.phone && (
                        <span className="text-[11px] text-destructive mt-0.5 block font-body">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading h-11 rounded-xl text-xs font-bold transition-all mt-4"
              >
                {isSubmitting ? 'Confirming Schedule...' : 'Confirm Inspection Schedule'}
              </Button>
            </form>
          </>
        ) : (
          /* Success Confirmation View */
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-primary">
                Inspection Confirmed!
              </h3>
              <p className="text-xs text-muted-foreground font-body max-w-sm mx-auto">
                We have reserved your slot. An inspection pass and agent details have been emailed to{' '}
                <span className="font-semibold text-primary">{submittedData?.email}</span>.
              </p>
            </div>

            {/* Summary Ticket */}
            <div className="bg-secondary/70 border border-border p-4 rounded-xl text-left space-y-2 text-xs font-body">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Property:</span>
                <span className="font-semibold text-primary truncate max-w-[220px]">
                  {propertyTitle}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-semibold text-primary capitalize">
                  {submittedData?.tourType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled Time:</span>
                <span className="font-semibold text-primary">
                  {submittedData?.inspectionDate
                    ? new Date(submittedData.inspectionDate).toLocaleDateString()
                    : ''}{' '}
                  @ {submittedData?.timeSlot}
                </span>
              </div>
            </div>

            <Button
              onClick={handleModalClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading text-xs h-10 rounded-xl px-6"
            >
              Done & Return to Listing
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
