'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Zap, HeartHandshake, CheckCircle2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { OtpAuthCard } from '@/components/auth/OtpAuthCard';
import { submitOTP, verifyOTP, saveUserSession } from '@/lib/api-client';

const TRUST_FEATURES = [
  { icon: <ShieldCheck className="w-5 h-5" />, label: '27-point verified listings' },
  { icon: <HeartHandshake className="w-5 h-5" />, label: 'Zero brokerage, always' },
  { icon: <Zap className="w-5 h-5" />, label: '14-day average time-to-close' },
];

const BRAND_STATS = [
  { value: '300+', label: 'Happy customers' },
  { value: '42', label: 'Cities covered' },
  { value: '₦2B+', label: 'Transacted value' },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[#f3f0ff] px-4">
          <p className="font-body text-slate-500">Loading sign in…</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <AuthShell
      title="Sign in to your account"
      portalLabel="Secure Sign In"
      eyebrow="Zero-brokerage marketplace"
      headline={
        <>
          Welcome back to <span className="italic font-body font-normal opacity-90">Primekey Homes</span>
        </>
      }
      blurb="Access your saved properties, inspection bookings, and verified listings."
      trustItems={TRUST_FEATURES}
      stats={BRAND_STATS}
      testimonial={{
        quote:
          'I sold my 3-bedroom apartment in Lekki in just 18 days — Primekey handled all the legal paperwork seamlessly.',
        name: 'Chinedu Okafor',
        role: 'Property Seller, Lagos',
        avatar: '/assets/avatars/avatar-chinedu.jpg',
      }}
      regionLabel="sign in form"
    >
      <div className="mx-auto w-full max-w-md">
        <OtpAuthCard
          config={{
            icon: <ShieldCheck className="w-7 h-7" />,
            title: 'Quick Sign In',
            subtitle: "We'll send a 6-digit code to your email",
            emailLabel: 'Email Address',
            emailPlaceholder: 'you@example.com',
            verifyButtonLabel: 'Verify & Sign In',
          }}
          sendOtp={(email) => submitOTP(email, 'login')}
          verifyOtp={(email, code) => verifyOTP(email, code, 'login')}
          onSuccess={(result, rememberDevice) => {
            const verifyData = result?.data as
              | { access: string; refresh: string; user: { id: string; phone: string; is_new_user: boolean } }
              | undefined;
            if (verifyData) {
              saveUserSession(verifyData.access, verifyData.refresh, verifyData.user, rememberDevice);
            }
            router.push(callbackUrl);
            router.refresh();
          }}
          inputPrefix="otp"
        >
          <ul className="space-y-2" role="list">
            <li className="flex items-start gap-2 font-body text-xs leading-relaxed text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>No passwords. We email a one-time code that expires after a short window.</span>
            </li>
            <li className="flex items-start gap-2 font-body text-xs leading-relaxed text-slate-600">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>NDPR Compliant. Your information is protected under Nigerian data privacy laws.</span>
            </li>
          </ul>
        </OtpAuthCard>

        <div className="mt-6 space-y-2 text-center">
          <p className="font-body text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/landlord/register" className="font-body font-semibold text-[#04164a] hover:underline">
              Register as Landlord
            </Link>
          </p>
          <p className="font-body text-xs text-slate-400">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[#04164a]">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-[#04164a]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}