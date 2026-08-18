'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  ShieldCheck,
  Lock,
  Star,
  Quote,
  KeyRound,
  UserCog,
  Users,
  CalendarCheck,
} from 'lucide-react';
import { OtpAuthCard } from '@/components/auth/OtpAuthCard';
import { sendOtp, verifyAgentOtp } from '@/lib/api-client';
import Breadcrumbs from '@/components/Breadcrumbs';

const BRAND_COLOR = '#04164a';

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
        <div className="min-h-screen bg-[#f3f0ff] flex items-center justify-center py-12 px-4">
          <p className="text-slate-500 font-body">Loading agent sign in...</p>
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

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.login-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f0ff] lg:flex">
      {/* ─────────────────────────────────────────────────────────────
          LEFT: Brand Showcase Panel
          ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:justify-between lg:w-[48%] xl:w-[46%] relative lg:sticky lg:top-0 lg:h-screen shrink-0 overflow-hidden bg-[#f3f0ff] border-r border-purple-100">
        {/* Decorative glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-10 -left-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        {/* Top: Logo */}
        <div className="relative z-10 login-anim opacity-0">
          <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Primekey Homes home">
            <div className="w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <Image
                src="/assets/logo.svg"
                alt="Primekey Logo Icon"
                width={214}
                height={111}
                className="w-7 h-auto"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight font-heading" style={{ color: BRAND_COLOR }}>
              Primekey
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 border border-purple-200/60 text-[11px] font-semibold font-heading text-[#04164a] ml-1">
              <KeyRound className="w-3 h-3" /> Team Portal
            </span>
          </Link>
        </div>

        {/* Middle: Badge, Icon, Headline, trust features, stats */}
        <div className="relative z-10 space-y-8">
          {/* Badge pill */}
          <div className="login-anim opacity-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#04164a] animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-heading" style={{ color: BRAND_COLOR }}>
              Internal team access
            </p>
          </div>

          {/* Large icon */}
          <div className="login-anim opacity-0 w-16 h-16 rounded-2xl bg-white/90 border border-purple-100 shadow-md flex items-center justify-center text-[#04164a]">
            <UserCog className="w-8 h-8" />
          </div>

          {/* Headline & subtitle */}
          <div className="login-anim opacity-0 space-y-4">
            <h1 className="text-4xl xl:text-5xl font-bold font-heading leading-[1.15] tracking-tight" style={{ color: BRAND_COLOR }}>
              Welcome back to the{' '}
              <span className="italic font-body font-normal opacity-90">Primekey Agent Portal</span>
            </h1>
            <p className="text-lg text-[#4a607a] font-body max-w-lg leading-relaxed">
              Sign in securely to manage landlord leads, property intakes, inspection appointments, and document reviews.
            </p>
          </div>

          {/* Trust features */}
          <ul className="login-anim opacity-0 space-y-3.5" role="list">
            {TRUST_FEATURES.map((feature) => (
              <li key={feature.label} className="flex items-center gap-3.5 font-body text-base" style={{ color: BRAND_COLOR }}>
                <div className="w-10 h-10 rounded-xl bg-white/90 border border-purple-100 flex items-center justify-center text-[#04164a] shrink-0 shadow-sm">
                  {feature.icon}
                </div>
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="login-anim opacity-0 grid grid-cols-3 gap-4 border-t border-purple-200/60 pt-8">
            {BRAND_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl xl:text-3xl font-bold font-heading" style={{ color: BRAND_COLOR }}>{stat.value}</p>
                <p className="text-xs text-[#4a607a] font-body mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative z-10 login-anim opacity-0">
          <figure className="bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 max-w-md shadow-md">
            <div className="flex gap-1 mb-4 text-amber-400" aria-label="Rated 5 out of 5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="relative font-body leading-relaxed italic text-sm" style={{ color: BRAND_COLOR }}>
              <Quote className="absolute -top-1 -left-1 w-6 h-6 text-purple-300 opacity-40" aria-hidden="true" />
              <span className="pl-5">
                &ldquo;The dashboard gives my team a single view of every lead, intake, and appointment — we close deals faster than ever.&rdquo;
              </span>
            </blockquote>
            <figcaption className="flex items-center gap-3.5 mt-5 pt-5 border-t border-purple-100">
              <Image
                src="/assets/avatars/avatar-chinedu.jpg"
                alt="Adaeze Okonkwo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold font-heading text-sm" style={{ color: BRAND_COLOR }}>Adaeze Okonkwo</p>
                <p className="text-xs text-[#4a607a] font-body">Senior Agent, Lekki</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT: Sign In Panel
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative lg:flex lg:items-center">
        {/* Decorative glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="w-full max-w-md relative z-10 m-auto px-4 sm:px-8 py-12">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Agent Sign In' },
              ]}
            />
          </div>

          {/* Sign In Card */}
          <OtpAuthCard
            config={{
              icon: <UserCog className="w-7 h-7" />,
              title: 'Team Access',
              subtitle: "We'll send a 6-digit code to your registered phone",
              phoneLabel: 'Registered Agent Phone',
              verifyButtonLabel: 'Verify & Access Dashboard',
            }}
            sendOtp={(phone) => sendOtp(phone, 'agent_login')}
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
            cardClassName="login-anim opacity-0"
          >
            <div className="border-t border-purple-100 pt-4">
              <p className="font-body text-xs sm:text-[13px] text-slate-600 flex items-center gap-2 justify-center leading-relaxed">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  NDPR Compliant. Agent credentials are protected under Nigerian data privacy laws.
                </span>
              </p>
            </div>
          </OtpAuthCard>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-2 login-anim opacity-0">
            <p className="text-sm text-slate-500 font-body">
              Not an agent?{' '}
              <Link href="/dashboard/agent" className="text-[#04164a] font-semibold hover:underline font-body">
                Go to dashboard
              </Link>
            </p>
            <p className="text-xs text-slate-400 font-body">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[#04164a]">Terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-[#04164a]">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
