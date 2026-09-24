'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import SiteNav from '@/components/SiteNav';
import { HardHat, Package, LayoutDashboard, Truck, Users, Wallet, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const BRAND_COLOR = '#04164a';

const upcoming = [
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Materials Marketplace',
    text: 'Buy building materials directly from verified suppliers — cement, steel, fittings, and finishing — at competitive, transparent prices.',
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Supplier Network',
    text: 'Access a vetted network of construction companies, property developers, and material suppliers across Nigeria.',
  },
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: 'Developer Dashboard',
    text: 'Manage inventory, track high-intent leads, and monitor performance across all your projects and estates from one place.',
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    title: 'Local Payment Integration',
    text: 'Seamless checkout and invoicing through trusted local payment gateways, built for the Nigerian market.',
  },
];

export default function BuilderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');

  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.builder-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo('.builder-anim',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, duration: ANIMATION_TOKENS.duration, ease: ANIMATION_TOKENS.ease }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Phase 3 gated — no backend yet; mock waitlist (see ADR-001 ecommerce stub)
    // TODO: wire to POST /api/v1/ecommerce/waitlist/ when builder marketplace is live
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f3f0ff]">
      <SiteNav variant="minimal" breadcrumb={[{ label: 'For Builders' }]} />

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* ─────────────────────────────────────────────
            HERO
            ───────────────────────────────────────────── */}
        <header className="text-center mb-14 builder-anim opacity-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#04164a] animate-pulse" />
            <p className="text-xs font-semibold tracking-wider uppercase font-heading" style={{ color: BRAND_COLOR }}>
              Phase 3 · Coming soon
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/90 border border-purple-100 shadow-md flex items-center justify-center text-[#04164a] mx-auto mb-6">
            <HardHat className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4 tracking-tight max-w-3xl mx-auto" style={{ color: BRAND_COLOR }}>
            The B2B portal for Nigerian{' '}
            <span className="italic font-normal font-body opacity-90">builders & developers.</span>
          </h1>
          <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto leading-relaxed">
            We're building a procurement platform for the construction industry — connecting builders, developers, and suppliers in one verified marketplace. Join the waitlist and be first in when we launch.
          </p>
        </header>

        {/* ─────────────────────────────────────────────
            WHAT'S COMING
            ───────────────────────────────────────────── */}
        <section className="mb-14" aria-labelledby="builder-features-heading">
          <h2 id="builder-features-heading" className="sr-only">What's coming to the Builder portal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcoming.map((feature) => (
              <article key={feature.title} className="builder-anim opacity-0 bg-white/90 backdrop-blur-sm p-7 rounded-2xl border border-purple-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-5 shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: BRAND_COLOR }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-[#4a607a] font-body leading-relaxed">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            WAITLIST
            ───────────────────────────────────────────── */}
        <section className="builder-anim opacity-0 max-w-xl mx-auto" aria-labelledby="builder-waitlist-heading">
          <div className="bg-white/90 backdrop-blur-sm border border-purple-100 shadow-xl rounded-2xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <h2 id="builder-waitlist-heading" className="text-2xl font-bold font-heading" style={{ color: BRAND_COLOR }}>
                Join the waitlist
              </h2>
            </div>
            <p className="text-slate-600 font-body mb-6 leading-relaxed">
              Get early access, launch discounts, and priority onboarding when the Builder portal goes live.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                <p className="font-heading font-bold text-[#04164a]">You're on the list!</p>
                <p className="text-sm text-slate-600 font-body leading-relaxed">
                  Thanks for joining the waitlist{name ? `, ${name}` : ''}. We'll reach out at{' '}
                  <strong className="text-[#04164a]">{email}</strong> as soon as we're ready to onboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-body">
                <div>
                  <label htmlFor="builder-name" className="text-xs font-semibold text-[#04164a]">Full Name</label>
                  <input
                    id="builder-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1.5 w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-[#04164a]/20 focus:border-[#04164a] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="builder-company" className="text-xs font-semibold text-[#04164a]">Company / Organisation</label>
                  <input
                    id="builder-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name (optional)"
                    className="mt-1.5 w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-[#04164a]/20 focus:border-[#04164a] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="builder-email" className="text-xs font-semibold text-[#04164a]">Work Email</label>
                  <input
                    id="builder-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1.5 w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-[#04164a]/20 focus:border-[#04164a] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl text-white font-heading font-semibold text-sm transition-all duration-200 hover:opacity-95 disabled:opacity-60"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  {isSubmitting ? 'Joining...' : 'Join the waitlist'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  We'll only email you about the Builder portal launch. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            FOOTER NOTE
            ───────────────────────────────────────────── */}
        <p className="builder-anim opacity-0 text-center mt-12 text-sm text-slate-500 font-body">
          In the meantime, explore the rest of the platform:{' '}
          <Link href="/search" className="underline font-semibold hover:text-[#04164a] transition-colors">Search properties</Link> ·{' '}
          <Link href="/landlord" className="underline font-semibold hover:text-[#04164a] transition-colors">List a property</Link> ·{' '}
          <Link href="/contact" className="underline font-semibold hover:text-[#04164a] transition-colors">Contact us</Link>
        </p>
      </div>
    </div>
  );
}
