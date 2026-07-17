'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Banknote, Zap, FileText, Check, X, Minus } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface Benefit {
  id: number;
  icon: React.ReactNode;
  title: string;
  text: string;
}

const benefits: Benefit[] = [
  {
    id: 1,
    icon: <ShieldCheck className="w-6 h-6" />,
    title: '100% Verified Listings',
    text: 'Every property is physically verified and legally checked against Lagos and Abuja land registries before it goes live.',
  },
  {
    id: 2,
    icon: <Banknote className="w-6 h-6" />,
    title: 'Zero Brokerage',
    text: 'Talk directly to owners or builders. Save up to 10% in hidden agency and inspection fees.',
  },
  {
    id: 3,
    icon: <Zap className="w-6 h-6" />,
    title: 'Close Deals in Days',
    text: 'Our average time-to-close is 14 days — 3x faster than the traditional Nigerian market average.',
  },
  {
    id: 4,
    icon: <FileText className="w-6 h-6" />,
    title: 'End-to-End Legal',
    text: 'From agreement drafting to Governor\'s consent — our in-house legal team handles it all.',
  },
];

interface ComparisonRow {
  feature: string;
  primekey: React.ReactNode;
  traditional: React.ReactNode;
  others: React.ReactNode;
}

const comparisonData: ComparisonRow[] = [
  { feature: 'Verified listings', primekey: <Check className="w-5 h-5 text-[var(--state-success)]" />, traditional: <X className="w-5 h-5 text-[var(--state-error)]" />, others: <Minus className="w-5 h-5 text-[var(--state-warning)]" /> },
  { feature: 'Zero brokerage', primekey: <Check className="w-5 h-5 text-[var(--state-success)]" />, traditional: <X className="w-5 h-5 text-[var(--state-error)]" />, others: <X className="w-5 h-5 text-[var(--state-error)]" /> },
  { feature: 'Legal support included', primekey: <Check className="w-5 h-5 text-[var(--state-success)]" />, traditional: <X className="w-5 h-5 text-[var(--state-error)]" />, others: <Minus className="w-5 h-5 text-[var(--state-warning)]" /> },
  { feature: 'Direct owner contact', primekey: <Check className="w-5 h-5 text-[var(--state-success)]" />, traditional: <X className="w-5 h-5 text-[var(--state-error)]" />, others: <Minus className="w-5 h-5 text-[var(--state-warning)]" /> },
];

export default function Benefits() {
  useGSAP(() => {
    // Exit early if user prefers reduced motion
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Staggered fade-up animation for elements as they scroll into view
      gsap.fromTo('.benefits-anim', 
        { y: 40, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: ANIMATION_TOKENS.duration, 
          stagger: ANIMATION_TOKENS.stagger, 
          ease: ANIMATION_TOKENS.ease,
          scrollTrigger: {
            trigger: '.benefits-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="benefits-section py-16 md:py-24 bg-[var(--bg-base)]" aria-labelledby="benefits-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ──────────────────────────────────────────────────────────────
            SECTION HEADER
            ────────────────────────────────────────────────────────────── */}
        <header className="benefits-anim text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--primary-medium)] font-[var(--font-body)] mb-4">
            Why Primekey Homes
          </p>
          <h2 id="benefits-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] mb-6">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-lg text-[var(--text-secondary)] font-[var(--font-body)]">
            A seamless real estate experience built specifically for the Nigerian market — designed for buyers, renters, and property owners.
          </p>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            BENEFIT CARDS
            ────────────────────────────────────────────────────────────── */}
        <div className="benefits-anim grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {benefits.map((benefit) => (
            <article 
              key={benefit.id} 
              className="bg-[var(--bg-surface)] p-8 rounded-xl shadow-[var(--shadow-default)] border border-[var(--border-default)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--primary-deep)] text-white flex items-center justify-center mb-6 shadow-sm">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] mb-3">
                {benefit.title}
              </h3>
              <p className="text-[var(--text-secondary)] font-[var(--font-body)] leading-relaxed flex-grow">
                {benefit.text}
              </p>
            </article>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            COMPARISON TABLE
            ────────────────────────────────────────────────────────────── */}
        <div className="benefits-anim mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)]">
              Primekey Homes vs the rest
            </h3>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-default)] bg-[var(--bg-surface)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-base)]/50">
                  <th className="p-4 md:p-6 font-semibold text-[var(--text-secondary)] font-[var(--font-body)] w-1/3">Feature</th>
                  <th className="p-4 md:p-6 font-bold text-[var(--primary-deep)] font-[var(--font-heading)] text-center bg-[var(--primary-deep)]/5">Primekey Homes</th>
                  <th className="p-4 md:p-6 font-semibold text-[var(--text-secondary)] font-[var(--font-body)] text-center">Traditional Agents</th>
                  <th className="p-4 md:p-6 font-semibold text-[var(--text-secondary)] font-[var(--font-body)] text-center">Other Portals</th>
                </tr>
              </thead>
              <tbody className="font-[var(--font-body)] text-[var(--text-secondary)]">
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-base)]/30 transition-colors">
                    <td className="p-4 md:p-6 font-medium text-[var(--primary-deep)]">{row.feature}</td>
                    <td className="p-4 md:p-6 flex justify-center bg-[var(--primary-deep)]/5">
                      {row.primekey}
                    </td>
                    <td className="p-4 md:p-6 flex justify-center">
                      {row.traditional}
                    </td>
                    <td className="p-4 md:p-6 flex justify-center">
                      {row.others}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            SPLIT SECTION (Relationship Manager)
            ────────────────────────────────────────────────────────────── */}
        <div className="benefits-anim grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)] order-2 lg:order-1">
            <Image
              src="/assets/relationship-manager.jpg"
              alt="Primekey Homes relationship manager assisting a client"
              width={640}
              height={480}
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="space-y-6 order-1 lg:order-2">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--primary-medium)] font-[var(--font-body)]">
              Built for humans
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)]">
              A dedicated manager for every deal
            </h3>
            <p className="text-lg text-[var(--text-secondary)] font-[var(--font-body)] leading-relaxed">
              Buying or selling property in Nigeria can be stressful. Your dedicated Primekey Homes manager handles negotiations, site visits, paperwork, and post-sale support — so you never feel lost.
            </p>
            <ul className="space-y-3 font-[var(--font-body)] text-[var(--text-secondary)]" role="list">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[var(--state-success)] flex-shrink-0" />
                <span>Single point of contact</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[var(--state-success)] flex-shrink-0" />
                <span>Available 7 days a week</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[var(--state-success)] flex-shrink-0" />
                <span>Post-sale support for 90 days</span>
              </li>
            </ul>
            
            {/* ✅ FIXED: Replaced Button asChild with a directly styled Link */}
            <div className="pt-4">
              <Link 
                href="/contact" 
                className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--gradient-cta)] px-8 text-lg font-semibold text-white shadow-[var(--shadow-elevated)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] font-[var(--font-body)]"
              >
                Meet your manager
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}