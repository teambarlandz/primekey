'use client';

import Link from 'next/link';
import { MessageCircle, Phone, ChevronDown } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Exact Brand Navy
const BRAND_COLOR = '#04164a';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Is Primekey Homes really brokerage-free?',
    answer: 'Yes. We connect you directly with verified property owners and developers. You pay zero agency, inspection, or hidden middleman fees.',
    defaultOpen: true,
  },
  {
    id: 2,
    question: 'How do you verify properties and documentation?',
    answer: 'Every listing undergoes a rigorous 27-point physical and legal verification. We physically inspect the property and verify the C of O (Certificate of Occupancy), Governor\'s Consent, and survey plans at the Lagos and Abuja land registries before it goes live.',
  },
  {
    id: 3,
    question: 'How long does it take to close a deal?',
    answer: 'Our average time-to-close is 14 days. Because we handle all legal drafting, verification, and paperwork in-house, we are 3x faster than the traditional Nigerian market average.',
  },
  {
    id: 4,
    question: 'Do you help with home loans and mortgages?',
    answer: 'Yes. We partner with 12 leading Nigerian banks and mortgage institutions to get you pre-approved in 48 hours at the most competitive interest rates.',
  },
  {
    id: 5,
    question: 'Can developers and builders list multiple projects?',
    answer: 'Absolutely. Builders and developers get a dedicated dashboard to manage inventory, track high-intent leads, and monitor performance across all their estates.',
  },
  {
    id: 6,
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We offer a 30-day satisfaction guarantee on all our paid premium services (like the Concierge Search). If you aren\'t happy, we provide a full refund, no questions asked.',
  },
];

export default function FAQ() {
  useGSAP(() => {
    // Respect reduced motion preference
    if (prefersReducedMotion()) {
      gsap.set('.faq-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Staggered fade-up animation on scroll
      gsap.fromTo('.faq-anim', 
        { y: 35, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: ANIMATION_TOKENS.duration, 
          stagger: 0.1, 
          ease: ANIMATION_TOKENS.ease,
          scrollTrigger: {
            trigger: '.faq-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="faq-section py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="faq-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ──────────────────────────────────────────────────────────────
              LEFT COLUMN: Intro & Contact Box
              ────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
            <div className="faq-anim opacity-0">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
                FAQs
              </p>
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold font-heading mb-4 leading-tight" style={{ color: BRAND_COLOR }}>
                Questions? We've got answers.
              </h2>
              <p className="text-lg text-[#4a607a] font-body leading-relaxed">
                Can't find what you're looking for? Our team usually replies in under 5 minutes.
              </p>
            </div>

            {/* Direct Contact Card */}
            <div className="faq-anim opacity-0 bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-md">
              <p className="font-semibold font-heading mb-4 text-base" style={{ color: BRAND_COLOR }}>
                Still unsure? Talk to a real human.
              </p>
              <div className="flex flex-col gap-3">
                <Link 
                  href="https://wa.me/2349017368499" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-900 font-semibold font-heading text-sm hover:bg-emerald-100/70 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </Link>
                <Link 
                  href="tel:+2349017368499" 
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-full border border-purple-200/80 bg-purple-50/50 font-semibold font-heading text-sm hover:bg-purple-100/60 transition-colors shadow-sm"
                  style={{ color: BRAND_COLOR }}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" style={{ color: BRAND_COLOR }} />
                  <span>Call +234 901 736 8499</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────
              RIGHT COLUMN: FAQ Accordion List
              ────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-4">
            {faqItems.map((item) => (
              <details 
                key={item.id} 
                className="faq-anim opacity-0 group bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md cursor-pointer" 
                open={item.defaultOpen}
              >
                <summary className="flex items-center justify-between text-lg font-bold font-heading list-none select-none" style={{ color: BRAND_COLOR }}>
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

        </div>
      </div>
    </section>
  );
}
