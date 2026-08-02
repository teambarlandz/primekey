'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CalendarCheck, CheckCircle2, ArrowRight, PhoneCall } from 'lucide-react';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import { AppointmentBookingForm } from '@/components/landlord/AppointmentBookingForm';
import { LandlordGate } from '@/components/landlord/LandlordGate';
import { getStoredLandlordId, submitAppointment } from '@/lib/api-client';
import { AppointmentValues, mapAppointmentValuesToPayload } from '@/lib/validations/appointmentSchema';

const BRAND_COLOR = '#04164a';

export default function InspectionBookingPage() {
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState<{ date: string; slot: string; tourType: string } | null>(null);

  useGSAP(() => {
    if (typeof window !== 'undefined') {
      setLandlordId(getStoredLandlordId());
    }

    if (prefersReducedMotion()) {
      gsap.set('.booking-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.booking-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, ease: ANIMATION_TOKENS.ease, duration: ANIMATION_TOKENS.duration }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (values: AppointmentValues, landlordIdValue: string) => {
    setIsLoading(true);
    try {
      const payload = mapAppointmentValuesToPayload(values, landlordIdValue);
      await submitAppointment(payload);
      setSummary({ date: values.preferredDate, slot: values.timeSlot, tourType: values.tourType });
      setSubmitted(true);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-[#f3f0ff] overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="booking-anim opacity-0 text-center mb-10">
            <div
              className="mx-auto w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-5"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <CalendarCheck className="w-7 h-7" />
            </div>
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
              Book a consultation
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading tracking-tight mb-4" style={{ color: BRAND_COLOR }}>
              Book an inspection or consultation
            </h1>
            <p className="text-lg text-[#4a607a] font-body leading-relaxed max-w-xl mx-auto">
              Pick a date and time that suits you. Your dedicated Primekey Homes manager will confirm your appointment shortly after booking.
            </p>
          </header>

          <div className="booking-anim opacity-0">
            {submitted && summary ? (
              <div className="max-w-lg mx-auto text-center bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-md p-10">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                  Appointment requested!
                </h2>
                <p className="text-[#4a607a] font-body leading-relaxed mb-6">
                  Your {summary.tourType === 'virtual' ? 'virtual' : 'in-person'} consultation on{' '}
                  <span className="font-semibold" style={{ color: BRAND_COLOR }}>{summary.date}</span>{' '}
                  at <span className="font-semibold" style={{ color: BRAND_COLOR }}>{summary.slot}</span> has been received.
                  We'll confirm shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/landlord"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    Back to landlord hub
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/80 hover:bg-white border border-purple-200 font-semibold font-heading text-sm"
                    style={{ color: BRAND_COLOR }}
                  >
                    <PhoneCall className="w-4 h-4" />
                    Contact support
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-md p-6 sm:p-10">
                <LandlordGate landlordId={landlordId}>
                  <AppointmentBookingForm
                    landlordId={landlordId as string}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                </LandlordGate>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
