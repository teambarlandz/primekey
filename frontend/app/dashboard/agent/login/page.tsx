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
  FileText,
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
          LEFT: Brand Showcase Panel (desktop, pinned on scroll)
          ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:justify-between lg:w-[48%] xl:w-[46%] relative lg:sticky lg:top-0 lg:h-screen shrink-0 overflow-hidden">
        {/* Background property image + navy overlay */}
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/assets/hero-primekey-homes.jpg"
            alt=""
            fill
            sizes="48vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#04164a]/97 via-[#0a2a6b]/88 to-[#04164a]/95" />
        </div>

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
            <span className="text-2xl font-bold tracking-tight font-heading text-white">
              Primekey
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/25 text-[11px] font-semibold font-heading text-purple-100 ml-1">
              <KeyRound className="w-3 h-3" /> Team Portal
            </span>
          </Link>
        </div>

        {/* Middle: Headline, trust features, stats */}
        <div className="relative z-10 space-y-12">
          <div className="login-anim opacity-0 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-heading text-purple-100">
                Internal team access
              </p>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold font-heading text-white leading-[1.15] tracking-tight">
              Welcome back to the{' '}
              <span className="italic font-body font-normal text-purple-200">Primekey Agent Portal</span>
            </h1>
            <p className="text-lg text-purple-100/90 font-body max-w-lg leading-relaxed">
              Sign in securely to manage landlord leads, property intakes, inspection appointments, and document reviews.
            </p>
          </div>

          <ul className="login-anim opacity-0 space-y-3.5" role="list">
            {TRUST_FEATURES.map((feature) => (
              <li key={feature.label} className="flex items-center gap-3.5 text-white font-body text-base">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shrink-0">
                  {feature.icon}
                </div>
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>

          <div className="login-anim opacity-0 grid grid-cols-3 gap-4 border-t border-white/15 pt-8">
            {BRAND_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl xl:text-3xl font-bold font-heading text-white">{stat.value}</p>
                <p className="text-xs text-purple-200/90 font-body mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative z-10 login-anim opacity-0">
          <figure className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md">
            <div className="flex gap-1 mb-4 text-amber-400" aria-label="Rated 5 out of 5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="relative text-purple-50 font-body leading-relaxed italic text-sm">
              <Quote className="absolute -top-1 -left-1 w-6 h-6 text-purple-300 opacity-40" aria-hidden="true" />
              <span className="pl-5">
                "The dashboard gives my team a single view of every lead, intake, and appointment — we close deals faster than ever."
              </span>
            </blockquote>
            <figcaption className="flex items-center gap-3.5 mt-5 pt-5 border-t border-white/15">
              <Image
                src="/assets/avatars/avatar-chinedu.jpg"
                alt="Adaeze Okonkwo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold font-heading text-sm text-white">Adaeze Okonkwo</p>
                <p className="text-xs text-purple-200/90 font-body">Senior Agent, Lekki</p>
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

          {/* Brand Header (mobile only — left panel is hidden) */}
          <div className="lg:hidden text-center mb-10 login-anim opacity-0">
            <Link href="/" className="flex items-center justify-center gap-3 mb-6" aria-label="Primekey Homes home">
              <Image
                src="/assets/logo.svg"
                alt="Primekey Logo Icon"
                width={214}
                height={111}
                className="w-12 h-auto"
                priority
              />
              <span className="text-3xl font-bold tracking-tight font-heading" style={{ color: BRAND_COLOR }}>
                Primekey
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2" style={{ color: BRAND_COLOR }}>
              Agent Sign In
            </h1>
            <p className="text-slate-600 font-body">Access the Primekey agent dashboard</p>
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
                // Extend session cookie to 30 days
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
