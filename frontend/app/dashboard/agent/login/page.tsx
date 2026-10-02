'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Users, CalendarCheck, CheckCircle2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { OtpAuthCard } from '@/components/auth/OtpAuthCard';
import { sendOtp, verifyAgentOtp } from '@/lib/api-client';

const TRUST_FEATURES = [
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Team-only secure access' },
  { icon: <Users className="w-5 h-5" />, label: 'Role-scoped permissions' },
  { icon: <CalendarCheck className="w-5 h-5" />, label: 'Live leads, intakes & appointments' },
];

const BRAND_STATS = [
  { value: 'Real-time', label: 'Lead pipeline sync' },
  { value: '24/7', label: 'Dashboard access' },
  { value: '1-Click', label: 'CSV exports' },
];

export default function AgentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[#f3f0ff] px-4">
          <p className="font-body text-slate-500">Loading agent sign in…</p>
        </div>
      }
    >
      <AgentLoginContent />
    </Suspense>
  );
}

function AgentLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/agent';

  return (
    <AuthShell
      title="Sign in to the agent portal"
      portalLabel="Team Portal"
      eyebrow="Internal team access"
      headline={
        <>
          Welcome back to the{' '}
          <span className="italic font-body font-normal opacity-90">Primekey Agent Portal</span>
        </>
      }
      blurb="Manage landlord leads, property intakes, inspection appointments, and document reviews."
      trustItems={TRUST_FEATURES}
      stats={BRAND_STATS}
      testimonial={{
        quote:
          'The dashboard gives my team a single view of every lead, intake, and appointment — we close deals faster than ever.',
        name: 'Adaeze Okonkwo',
        role: 'Senior Agent, Lekki',
        avatar: '/assets/avatars/avatar-chinedu.jpg',
      }}
      regionLabel="agent sign in form"
    >
      <div className="mx-auto w-full max-w-md">
        <OtpAuthCard
          config={{
            icon: <ShieldCheck className="w-7 h-7" />,
            title: 'Team Access',
            subtitle: "We'll send a 6-digit code to your registered email",
            emailLabel: 'Registered Agent Email',
            emailPlaceholder: 'you@primekeyhomesandpropertiesltd.com',
            verifyButtonLabel: 'Verify & Access Dashboard',
          }}
          sendOtp={(email) => sendOtp(email, 'agent_login')}
          verifyOtp={verifyAgentOtp}
          onSuccess={(result, rememberDevice) => {
            document.cookie = 'pk_agent_session=1; path=/; max-age=86400; SameSite=Lax';
            if (rememberDevice) {
              document.cookie = 'pk_agent_session=1; path=/; max-age=2592000; SameSite=Lax';
            }
            router.push(callbackUrl);
            router.refresh();
          }}
          inputPrefix="agent-otp"
        >
          <ul className="space-y-2" role="list">
            <li className="flex items-start gap-2 font-body text-xs leading-relaxed text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>Access is limited to registered team members with an approved work email.</span>
            </li>
            <li className="flex items-start gap-2 font-body text-xs leading-relaxed text-slate-600">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>NDPR Compliant. Agent credentials are protected under Nigerian data privacy laws.</span>
            </li>
          </ul>
        </OtpAuthCard>

        <div className="mt-6 space-y-2 text-center">
          <p className="font-body text-sm text-slate-500">
            Not an agent?{' '}
            <Link href="/dashboard/agent" className="font-body font-semibold text-[#04164a] hover:underline">
              Go to dashboard
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