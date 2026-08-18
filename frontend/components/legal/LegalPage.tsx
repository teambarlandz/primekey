'use client';

import React from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import { Mail, Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const BRAND_COLOR = '#04164a';

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageProps {
  icon: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  intro?: React.ReactNode;
  sections: LegalSection[];
}

export default function LegalPage({
  icon,
  badge,
  title,
  subtitle,
  effectiveDate,
  intro,
  sections,
}: LegalPageProps) {
  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.legal-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.legal-anim',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, duration: ANIMATION_TOKENS.duration, ease: ANIMATION_TOKENS.ease }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f0ff] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: title },
            ]}
          />
        </div>

        {/* ─────────────────────────────────────────────
            HEADER
            ───────────────────────────────────────────── */}
        <header className="text-center mb-14 legal-anim opacity-0">
          <div className="w-16 h-16 rounded-2xl bg-white/90 border border-purple-100 shadow-md flex items-center justify-center text-[#04164a] mx-auto mb-6">
            {icon}
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-[#04164a]" />
            <p className="text-xs font-semibold tracking-wider uppercase font-heading" style={{ color: BRAND_COLOR }}>
              {badge}
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-4 tracking-tight" style={{ color: BRAND_COLOR }}>
            {title}
          </h1>
          <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 bg-white/70 border border-purple-100 rounded-full px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Last updated: {effectiveDate}
          </p>
        </header>

        {intro && (
          <div className="legal-anim opacity-0 bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-md p-6 sm:p-8 mb-12 font-body text-[#4a607a] leading-relaxed">
            {intro}
          </div>
        )}

        {/* ─────────────────────────────────────────────
            BODY: TOC SIDEBAR + CONTENT
            ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">
          {/* Table of Contents */}
          <nav
            className="legal-anim opacity-0 sticky top-6 hidden lg:block bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-md p-6"
            aria-label={`${title} contents`}
          >
            <p className="text-xs font-semibold tracking-widest uppercase font-heading text-slate-500 mb-4">
              On this page
            </p>
            <ul className="space-y-1 font-body text-sm" role="list">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block py-1.5 px-3 rounded-lg text-[#4a607a] hover:bg-purple-50 hover:text-[#04164a] transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="min-w-0">
            <div className="lg:hidden legal-anim opacity-0 overflow-x-auto pb-4 -mx-4 px-4 mb-2">
              <div className="flex gap-2 w-max">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="whitespace-nowrap text-xs font-semibold font-heading px-3.5 py-2 rounded-full bg-white/90 border border-purple-200 text-[#4a607a] hover:text-[#04164a] hover:border-[#04164a]/30 transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="legal-anim opacity-0 scroll-mt-6 bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-md p-6 sm:p-8"
                >
                  <h2
                    className="text-xl sm:text-2xl font-bold font-heading mb-5 tracking-tight"
                    style={{ color: BRAND_COLOR }}
                  >
                    {section.title}
                  </h2>
                  <div className="font-body text-[#4a607a] leading-relaxed space-y-4 text-[15px]">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="legal-anim opacity-0 mt-10 bg-[#04164a] rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" aria-hidden="true" />
              <h3 className="relative text-2xl font-bold font-heading text-white mb-3">
                Questions about this policy?
              </h3>
              <p className="relative text-purple-100 font-body text-sm leading-relaxed max-w-xl mx-auto mb-6">
                Our Data Protection Officer and support team are happy to help. Reach out through any of the channels below.
              </p>
              <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:hello@primekeyhomesandpropertiesltd.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f3f0ff] text-[#04164a] font-semibold font-heading text-sm hover:bg-purple-100 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@primekeyhomesandpropertiesltd.com
                </a>
                <a
                  href="tel:+2349017368499"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-white/30 hover:border-white text-white font-semibold font-heading text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +234 901 736 8499
                </a>
                <a
                  href="https://wa.me/2349017368499"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-white/30 hover:border-white text-white font-semibold font-heading text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
              <p className="relative mt-6 text-xs text-purple-200 font-body">
                Or <Link href="/contact" className="underline hover:text-white transition-colors">send us a message</Link> — we respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
