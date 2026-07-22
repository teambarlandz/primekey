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

// Exact Brand Navy
const BRAND_COLOR = '#04164a';

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
    text: "From agreement drafting to Governor's consent — our in-house legal team handles it all.",
  },
];

interface ComparisonRow {
  feature: string;
  primekey: React.ReactNode;
  traditional: React.ReactNode;
  others: React.ReactNode;
}

const comparisonData: ComparisonRow[] = [
  { 
    feature: 'Verified listings', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    others: <Minus className="w-5 h-5 text-amber-500" /> 
  },
  { 
    feature: 'Zero brokerage', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    others: <X className="w-5 h-5 text-rose-500" /> 
  },
  { 
    feature: 'Legal support included', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    others: <Minus className="w-5 h-5 text-amber-500" /> 
  },
  { 
    feature: 'Direct owner contact', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    others: <Minus className="w-5 h-5 text-amber-500" /> 
  },
];

export default function Benefits() {
  useGSAP(() => {
    // Respect reduced motion preference
    if (prefersReducedMotion()) {
      gsap.set('.benefits-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Staggered fade-up animation on scroll
      gsap.fromTo('.benefits-anim', 
        { y: 35, opacity: 0 }, 
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
    <section className="benefits-section py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="benefits-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ──────────────────────────────────────────────────────────────
            SECTION HEADER
            ────────────────────────────────────────────────────────────── */}
        <header className="benefits-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
            Why Primekey Homes
          </p>
          <h2 id="benefits-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-lg text-[#4a607a] font-body leading-relaxed">
            A seamless real estate experience built specifically for the Nigerian market — designed for buyers, renters, and property owners.
          </p>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            BENEFIT CARDS
            ────────────────────────────────────────────────────────────── */}
        <div className="benefits-anim opacity-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {benefits.map((benefit) => (
            <article 
              key={benefit.id} 
              className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div 
                className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-6 shadow-sm"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                {benefit.title}
              </h3>
              <p className="text-[#4a607a] font-body leading-relaxed flex-grow text-sm">
                {benefit.text}
              </p>
            </article>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            COMPARISON TABLE
            ────────────────────────────────────────────────────────────── */}
        <div className="benefits-anim opacity-0 mb-24">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold font-heading" style={{ color: BRAND_COLOR }}>
              Primekey Homes vs the rest
            </h3>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-purple-100 shadow-md bg-white/90 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50/50">
                  <th className="p-4 md:p-6 font-semibold text-[#4a607a] font-body w-1/3">Feature</th>
                  <th className="p-4 md:p-6 font-bold font-heading text-center bg-purple-100/40" style={{ color: BRAND_COLOR }}>
                    Primekey Homes
                  </th>
                  <th className="p-4 md:p-6 font-semibold text-[#4a607a] font-body text-center">Traditional Agents</th>
                  <th className="p-4 md:p-6 font-semibold text-[#4a607a] font-body text-center">Other Portals</th>
                </tr>
              </thead>
              <tbody className="font-body text-[#22376e]">
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-purple-100/70 last:border-0 hover:bg-purple-50/30 transition-colors">
                    <td className="p-4 md:p-6 font-medium" style={{ color: BRAND_COLOR }}>{row.feature}</td>
                    <td className="p-4 md:p-6 text-center bg-purple-100/20">
                      <div className="flex justify-center items-center">{row.primekey}</div>
                    </td>
                    <td className="p-4 md:p-6 text-center">
                      <div className="flex justify-center items-center">{row.traditional}</div>
                    </td>
                    <td className="p-4 md:p-6 text-center">
                      <div className="flex justify-center items-center">{row.others}</div>
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
        <div className="benefits-anim opacity-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white/60 order-2 lg:order-1">
            <Image
              src="/assets/relationship-manager.jpg"
              alt="Primekey Homes relationship manager assisting a client"
              width={640}
              height={480}
              className="w-full h-auto object-cover rounded-2xl"
            />
          </div>
          
          <div className="space-y-6 order-1 lg:order-2">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a]">
              Built for humans
            </p>
            <h3 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: BRAND_COLOR }}>
              A dedicated manager for every deal
            </h3>
            <p className="text-lg text-[#4a607a] font-body leading-relaxed">
              Buying or selling property in Nigeria can be stressful. Your dedicated Primekey Homes manager handles negotiations, site visits, paperwork, and post-sale support — so you never feel lost.
            </p>
            <ul className="space-y-3 font-body text-[#22376e]" role="list">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Single point of contact</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Available 7 days a week</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Post-sale support for 90 days</span>
              </li>
            </ul>
            
            <div className="pt-4">
              <Link 
                href="/contact" 
                className="inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-95 font-heading"
                style={{ backgroundColor: BRAND_COLOR }}
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
