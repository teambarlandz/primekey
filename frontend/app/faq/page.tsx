'use client';

import React from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import SiteNav from '@/components/SiteNav';
import { HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronRight } from 'lucide-react';

const BRAND_COLOR = '#04164a';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const categories: FAQCategory[] = [
  {
    category: 'General',
    icon: <HelpCircle className="w-6 h-6" />,
    items: [
      {
        question: 'Is Primekey Homes really brokerage-free?',
        answer: 'Yes. We connect you directly with verified property owners and developers. You pay zero agency, inspection, or hidden middleman fees. We make money through optional premium services — not by inflating your costs.',
      },
      {
        question: 'How do you verify properties and documentation?',
        answer: 'Every listing undergoes a rigorous 27-point physical and legal verification. We physically inspect the property and verify the C of O (Certificate of Occupancy), Governor\'s Consent, and survey plans at the Lagos and Abuja land registries before it goes live.',
      },
      {
        question: 'How long does it take to close a deal?',
        answer: 'Our average time-to-close is 14 days. Because we handle all legal drafting, verification, and paperwork in-house, we are 3x faster than the traditional Nigerian market average.',
      },
      {
        question: 'What if I\'m not satisfied with the service?',
        answer: 'We offer a 30-day satisfaction guarantee on all our paid premium services (like the Concierge Search). If you aren\'t happy, we provide a full refund, no questions asked.',
      },
      {
        question: 'Which cities do you cover?',
        answer: 'We currently serve over 42 cities across Nigeria, with our strongest presence in Lagos, Abuja, and Port Harcourt. New locations are added regularly.',
      },
    ],
  },
  {
    category: 'Buyers & Renters',
    icon: <Phone className="w-6 h-6" />,
    items: [
      {
        question: 'What happens if I can\'t find the property I want?',
        answer: 'When a search returns no matching results, our 2-Week Concierge service kicks in. Submit your requirements and a dedicated manager will source and verify suitable properties for you — usually within two weeks.',
      },
      {
        question: 'Is the Concierge service free?',
        answer: 'The initial sourcing is handled as part of our platform service. Premium concierge features are covered by our 30-day satisfaction guarantee, so if you aren\'t happy, you get a full refund.',
      },
      {
        question: 'Do you help with home loans and mortgages?',
        answer: 'Yes. We partner with 12 leading Nigerian banks and mortgage institutions to get you pre-approved in 48 hours at the most competitive interest rates.',
      },
      {
        question: 'Are the prices on listings negotiable?',
        answer: 'Yes. Prices shown are asking prices set by owners. You negotiate directly with verified owners — no middleman inflating the price. Our team can help you understand fair market value.',
      },
      {
        question: 'Can I book a physical inspection?',
        answer: 'Absolutely. Once you find a property you like, request an inspection and our team will schedule it, accompany you, and answer any questions on the spot.',
      },
    ],
  },
  {
    category: 'Landlords & Owners',
    icon: <Phone className="w-6 h-6" />,
    items: [
      {
        question: 'Is it free to list my property?',
        answer: 'Yes. Listing a property on Primekey Homes is completely free. You only pay for optional upgrades, such as featured placement or priority promotion, if you choose them.',
      },
      {
        question: 'What do I need to list my property?',
        answer: 'Register with your name, phone number, and a valid government-issued ID (NIN, passport, driver\'s licence, or voter\'s card). Then add your property details — location, photos, features, and asking price.',
      },
      {
        question: 'How are leads verified?',
        answer: 'Every inquiry comes from identity-verified prospects with explicit NDPR consent. We screen for serious buyers and tenants, so you deal with quality leads — not tire-kickers or spam.',
      },
      {
        question: 'Do you handle the legal paperwork?',
        answer: 'Yes. From agreement drafting to Governor\'s consent processing, our in-house legal team handles all documentation for your sale or lease, end-to-end.',
      },
      {
        question: 'What is the 2-week guaranteed exposure?',
        answer: 'Listed properties receive featured placement and targeted promotion for 14 days. Our average time-to-close is 14 days — significantly faster than the 90+ days typical in the traditional market.',
      },
    ],
  },
  {
    category: 'Legal & Data',
    icon: <ShieldIcon className="w-6 h-6" />,
    items: [
      {
        question: 'How is my personal data protected?',
        answer: 'We process personal data in full compliance with the Nigeria Data Protection Act 2023 and the NDPR 2019. Consent is logged immutably at the point of collection, and inactive data is automatically anonymized after six months.',
      },
      {
        question: 'Can I request a copy of or delete my data?',
        answer: 'Yes. You have the right to access, rectify, and erase your personal data. Contact our Data Protection Officer at hello@primekeyhomes.com and we will verify your identity and process your request within the legally required timeframe.',
      },
      {
        question: 'Where can I read the legal documents?',
        answer: 'Our Privacy Policy, Terms & Conditions, NDPR Compliance Notice, and Cookie Policy are all available in the footer of every page, or directly via the links at the bottom of this page.',
      },
      {
        question: 'Where is Primekey Homes registered?',
        answer: 'Primekey Homes and Properties Ltd is registered in the Federal Republic of Nigeria, with our office in Victoria Island, Lagos. We are NDPR-compliant and subject to the oversight of the Nigeria Data Protection Commission (NDPC).',
      },
    ],
  },
];

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function FAQPage() {
  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.faq-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-anim',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, duration: ANIMATION_TOKENS.duration, ease: ANIMATION_TOKENS.ease }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f0ff] py-16 px-4">
      <SiteNav />

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-body mb-12">
          <Link href="/" className="hover:text-[#04164a] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 font-medium">FAQ</span>
        </nav>

        {/* ─────────────────────────────────────────────
            HEADER
            ───────────────────────────────────────────── */}
        <header className="text-center mb-14 faq-anim opacity-0">
          <div className="w-16 h-16 rounded-2xl bg-white/90 border border-purple-100 shadow-md flex items-center justify-center text-[#04164a] mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-4 tracking-tight" style={{ color: BRAND_COLOR }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about buying, renting, and listing with Primekey Homes. Can't find your answer? Our team usually replies in under 5 minutes.
          </p>
        </header>

        {/* ─────────────────────────────────────────────
            FAQ CATEGORIES
            ───────────────────────────────────────────── */}
        <div className="space-y-10">
          {categories.map((cat) => (
            <section key={cat.category} className="faq-anim opacity-0" aria-label={`${cat.category} questions`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/90 border border-purple-100 shadow-sm flex items-center justify-center text-[#04164a]">
                  {cat.icon}
                </div>
                <h2 className="text-2xl font-bold font-heading tracking-tight" style={{ color: BRAND_COLOR }}>
                  {cat.category}
                </h2>
              </div>

              <div className="space-y-3">
                {cat.items.map((item, index) => (
                  <details
                    key={index}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <summary className="flex items-center justify-between text-base md:text-lg font-bold font-heading list-none select-none" style={{ color: BRAND_COLOR }}>
                      <span>{item.question}</span>
                      <ChevronDown
                        className="w-5 h-5 text-[#4a607a] transition-transform duration-300 group-open:rotate-180 flex-shrink-0 ml-4"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="mt-4 pt-3 border-t border-purple-100/60 text-[#4a607a] font-body leading-relaxed text-base">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ─────────────────────────────────────────────
            CONTACT CTA
            ───────────────────────────────────────────── */}
        <section className="faq-anim opacity-0 mt-12 bg-[#04164a] rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" aria-hidden="true" />
          <h2 className="relative text-2xl font-bold font-heading text-white mb-3">
            Still have questions?
          </h2>
          <p className="relative text-purple-100 font-body text-sm leading-relaxed max-w-xl mx-auto mb-6">
            Talk to a real human. We respond within 24 hours on business days, and usually much faster.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f3f0ff] text-[#04164a] font-semibold font-heading text-sm hover:bg-purple-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
            <a
              href="tel:+2348000000000"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-white/30 hover:border-white text-white font-semibold font-heading text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              +234 800 000 0000
            </a>
            <a
              href="mailto:hello@primekeyhomes.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-white/30 hover:border-white text-white font-semibold font-heading text-sm transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email us
            </a>
          </div>
          <p className="relative mt-6 text-xs text-purple-200 font-body">
            Legal documents: <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link> ·{' '}
            <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link> ·{' '}
            <Link href="/ndpr" className="underline hover:text-white transition-colors">NDPR</Link> ·{' '}
            <Link href="/cookies" className="underline hover:text-white transition-colors">Cookies</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
