'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Home, CheckCircle2, ArrowRight, LogOut } from 'lucide-react';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import { PropertyIntakeForm } from '@/components/landlord/PropertyIntakeForm';
import { LandlordGate } from '@/components/landlord/LandlordGate';
import { getStoredLandlordId, submitPropertyIntake } from '@/lib/api-client';
import { PropertyIntakeValues, mapIntakeValuesToPayload } from '@/lib/validations/propertyIntakeSchema';
import Breadcrumbs from '@/components/Breadcrumbs';

const BRAND_COLOR = '#04164a';

export default function LandlordIntakePage() {
  const router = useRouter();
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('primekey_landlord_id');
    document.cookie = 'pk_landlord_session=; path=/; max-age=0';
    router.push('/');
  };

  useGSAP(() => {
    if (typeof window !== 'undefined') {
      setLandlordId(getStoredLandlordId());
    }

    if (prefersReducedMotion()) {
      gsap.set('.intake-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.intake-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, ease: ANIMATION_TOKENS.ease, duration: ANIMATION_TOKENS.duration }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (values: PropertyIntakeValues, landlordIdValue: string) => {
    setIsLoading(true);
    try {
      const payload = mapIntakeValuesToPayload(values, landlordIdValue);
      await submitPropertyIntake(payload);
      setSubmitted(true);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'For Landlords', href: '/landlord' },
            { label: 'Property Intake' },
          ]}
        />
      </div>

      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-[#f3f0ff] overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="intake-anim opacity-0 text-center mb-10">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
            <div
              className="mx-auto w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-5"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <Home className="w-7 h-7" />
            </div>
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
              List Free, Sell/Rent Faster
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading tracking-tight mb-4" style={{ color: BRAND_COLOR }}>
              Tell us about your property
            </h1>
            <p className="text-lg text-[#4a607a] font-body leading-relaxed max-w-xl mx-auto">
              Complete this 3-minute form and your dedicated Primekey Homes manager will review your listing, advise on pricing, and publish it within 24 hours.
            </p>
          </header>

          <div className="intake-anim opacity-0">
            {submitted ? (
              <div className="max-w-lg mx-auto text-center bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-md p-10">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                  Listing submitted!
                </h2>
                <p className="text-[#4a607a] font-body leading-relaxed mb-8">
                  Thank you — your property has been received. A Primekey Homes manager will contact you shortly to arrange photos and verify details before publishing.
                </p>
                <Link
                  href="/landlord"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Back to landlord hub
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-md p-6 sm:p-10">
                <LandlordGate landlordId={landlordId}>
                  <PropertyIntakeForm
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
