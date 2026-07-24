'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Banknote,
  FileText,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthInterceptSheet } from '@/components/auth/AuthInterceptSheet';

// Landlord Intake Validation Schema
const landlordIntakeSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z
    .string()
    .min(10, 'Valid phone number required')
    .refine(
      (val) => /^(?:\+234|234|0)[789][01]\d{8}$/.test(val.replace(/\s+/g, '')),
      { message: 'Please enter a valid Nigerian phone number (e.g., 08012345678)' }
    ),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  ownerType: z.enum(['owner', 'agent', 'developer']).default('owner'),
  
  // Property Info
  propertyTitle: z.string().min(5, 'Property title description required'),
  location: z.string().min(3, 'Property location address required'),
  city: z.string().min(2, 'City is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  askingPrice: z.coerce.number().min(100000, 'Asking price must be at least ₦100,000'),
  listingCategory: z.enum(['sale', 'rent', 'short_let']).default('sale'),
  titleDocument: z.string().min(1, 'Title document type is required'),
  
  // Consultation
  inspectionDate: z.string().min(1, 'Please pick a preferred inspection date'),
});

type LandlordIntakeValues = z.infer<typeof landlordIntakeSchema>;

export default function LandlordIntakePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<LandlordIntakeValues>({
    resolver: zodResolver(landlordIntakeSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      ownerType: 'owner',
      propertyTitle: '',
      location: '',
      city: 'Lagos',
      propertyType: 'fully_detached_duplex',
      askingPrice: 0,
      listingCategory: 'sale',
      titleDocument: 'Certificate of Occupancy (C of O)',
      inspectionDate: '',
    },
  });

  const handleNextStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await trigger(['fullName', 'phone', 'ownerType']);
    if (step === 2) isValid = await trigger(['propertyTitle', 'location', 'city', 'propertyType', 'askingPrice', 'titleDocument']);

    if (isValid) setStep((prev) => (prev + 1) as any);
  };

  const handlePrevStep = () => {
    setStep((prev) => (prev - 1) as any);
  };

  const handleFinalSubmitAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await trigger();
    if (isValid) {
      // Trigger Auth Interception before final submission
      setIsAuthOpen(true);
    }
  };

  const handleAuthSuccess = async () => {
    setIsSubmitting(true);
    const formData = watch();
    try {
      // API integration point: POST /api/landlords/intake
      console.log('Dispatching Landlord Intake Submission:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSubmitted(true);
    } catch (err) {
      console.error('Intake submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f0ff] py-10 px-4 md:px-8 font-body">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <div className="text-center space-y-3">
          <Badge className="bg-[#04164a] text-white font-heading text-xs px-3 py-1 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Direct Owner Listing Portal
          </Badge>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#04164a]">
            List Your Property on Primekey
          </h1>
          <p className="font-body text-slate-600 text-sm md:text-base max-w-xl mx-auto">
            Reach verified buyers and high-intent tenants across Lagos, Abuja, and major Nigerian cities with zero listing friction.
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        {!isSubmitted && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-heading font-semibold text-[#04164a]">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#04164a]' : 'text-slate-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-[#04164a] text-white' : 'bg-slate-100'}`}>1</span>
              <span className="hidden sm:inline">Contact Info</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-200" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#04164a]' : 'text-slate-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#04164a] text-white' : 'bg-slate-100'}`}>2</span>
              <span className="hidden sm:inline">Property Details</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-200" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#04164a]' : 'text-slate-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#04164a] text-white' : 'bg-slate-100'}`}>3</span>
              <span className="hidden sm:inline">Inspection Schedule</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        {!isSubmitted ? (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <form onSubmit={handleFinalSubmitAttempt} className="space-y-6">
              
              {/* STEP 1: Owner Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-bold text-[#04164a] flex items-center gap-2 border-b border-slate-100 pb-3">
                    <User className="w-5 h-5 text-[#04164a]" /> Step 1: Representative & Contact Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          {...register('fullName')}
                          placeholder="Chief / Dr. / Mr. Jane Doe"
                          className="pl-9 h-11 border-slate-200 rounded-xl"
                        />
                      </div>
                      {errors.fullName && <p className="text-[11px] text-rose-600">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">Nigerian Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          {...register('phone')}
                          placeholder="08012345678"
                          className="pl-9 h-11 border-slate-200 rounded-xl"
                        />
                      </div>
                      {errors.phone && <p className="text-[11px] text-rose-600">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">Email Address (Optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          {...register('email')}
                          placeholder="owner@example.com"
                          className="pl-9 h-11 border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">Representing Role</label>
                      <Select
                        value={watch('ownerType')}
                        onValueChange={(val) => setValue('ownerType', val as any)}
                      >
                        <SelectTrigger className="h-11 border-slate-200 rounded-xl font-body">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 font-body">
                          <SelectItem value="owner">Direct Property Owner</SelectItem>
                          <SelectItem value="agent">Authorized Real Estate Agent / Attorney</SelectItem>
                          <SelectItem value="developer">Property Developer / Builder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Property Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-bold text-[#04164a] flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Building2 className="w-5 h-5 text-[#04164a]" /> Step 2: Property Specifications
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#04164a]">Listing Title Description</label>
                    <Input
                      {...register('propertyTitle')}
                      placeholder="e.g. Brand New 4 Bedroom Terrace Duplex with BQ"
                      className="h-11 border-slate-200 rounded-xl"
                    />
                    {errors.propertyTitle && <p className="text-[11px] text-rose-600">{errors.propertyTitle.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">Property Address / Neighborhood</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          {...register('location')}
                          placeholder="Off Admiralty Way, Lekki Phase 1"
                          className="pl-9 h-11 border-slate-200 rounded-xl"
                        />
                      </div>
                      {errors.location && <p className="text-[11px] text-rose-600">{errors.location.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">City / State</label>
                      <Input
                        {...register('city')}
                        placeholder="Lagos, Abuja, Abeokuta..."
                        className="h-11 border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">Listing Purpose</label>
                      <Select
                        value={watch('listingCategory')}
                        onValueChange={(val) => setValue('listingCategory', val as any)}
                      >
                        <SelectTrigger className="h-11 border-slate-200 rounded-xl font-body">
                          <SelectValue placeholder="Listing Purpose" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 font-body">
                          <SelectItem value="sale">Outright Sale</SelectItem>
                          <SelectItem value="rent">Annual Rent</SelectItem>
                          <SelectItem value="short_let">Short Let / Hospitality</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">Asking Price (NGN ₦)</label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          {...register('askingPrice')}
                          placeholder="250000000"
                          className="pl-9 h-11 border-slate-200 rounded-xl"
                        />
                      </div>
                      {errors.askingPrice && <p className="text-[11px] text-rose-600">{errors.askingPrice.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#04164a]">Title Document</label>
                      <Select
                        value={watch('titleDocument')}
                        onValueChange={(val) => setValue('titleDocument', val)}
                      >
                        <SelectTrigger className="h-11 border-slate-200 rounded-xl font-body">
                          <SelectValue placeholder="Title Document" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 font-body">
                          <SelectItem value="Certificate of Occupancy (C of O)">Certificate of Occupancy (C of O)</SelectItem>
                          <SelectItem value="Governor's Consent">Governor's Consent</SelectItem>
                          <SelectItem value="Gazette">Gazette</SelectItem>
                          <SelectItem value="Deed of Assignment">Deed of Assignment</SelectItem>
                          <SelectItem value="Deed of Lease">Deed of Lease</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Consultation Scheduling */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-bold text-[#04164a] flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Calendar className="w-5 h-5 text-[#04164a]" /> Step 3: Agent Inspection & Onboarding Schedule
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#04164a]">Preferred Date for Physical Inspection</label>
                    <Input
                      type="date"
                      {...register('inspectionDate')}
                      className="h-11 border-slate-200 rounded-xl font-body"
                    />
                    {errors.inspectionDate && <p className="text-[11px] text-rose-600">{errors.inspectionDate.message}</p>}
                  </div>

                  <div className="bg-[#f3f0ff] p-4 rounded-xl space-y-2 text-xs text-[#04164a]">
                    <div className="flex items-center gap-2 font-bold font-heading">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> What Happens Next?
                    </div>
                    <p className="leading-relaxed">
                      A senior Primekey real estate analyst will visit the property on your scheduled date to perform physical verification, complete high-resolution media coverage, and review document authenticity before publishing to our public catalog.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Toolbar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-slate-200 text-slate-700 font-heading text-xs h-11 px-5 rounded-xl flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : <div />}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-xs h-11 px-6 rounded-xl flex items-center gap-1.5"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-xs h-11 px-8 rounded-xl flex items-center gap-2"
                  >
                    {isSubmitting ? 'Submitting Intake...' : 'Finalize Listing Intake'}
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </Button>
                )}
              </div>

            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 text-center space-y-5 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold text-[#04164a]">Property Intake Submitted!</h2>
              <p className="font-body text-slate-600 text-sm leading-relaxed">
                Thank you for listing with Primekey Homes. Our field agent team has been assigned to conduct physical verification on <strong className="text-[#04164a]">{watch('inspectionDate')}</strong>.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setStep(1);
              }}
              className="bg-[#04164a] text-white font-heading text-xs px-6 py-2.5 rounded-xl"
            >
              List Another Property
            </Button>
          </div>
        )}

        {/* Auth Interception Sheet Component */}
        <AuthInterceptSheet
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          pendingActionName="Submit Landlord Property Intake"
          onSuccess={handleAuthSuccess}
        />

      </div>
    </main>
  );
}
