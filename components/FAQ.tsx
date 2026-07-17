'use client';

import Link from 'next/link';
import { MessageCircle, Phone, ChevronDown } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

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
    // Exit early if user prefers reduced motion
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Staggered fade-up animation for the FAQ items
      gsap.fromTo('.faq-anim', 
        { y: 30, opacity: 0 }, 
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
    <section className="faq-section py-16 md:py-24 bg-[var(--bg-surface)]" aria-labelledby="faq-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* ──────────────────────────────────────────────────────────────
              LEFT COLUMN: Intro & Fallback CTA
              ────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="faq-anim mb-8 lg:mb-0">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--primary-medium)] font-[var(--font-body)] mb-4">
                FAQs
              </p>
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] mb-6 leading-tight">
                Questions? We've got answers.
              </h2>
              <p className="text-lg text-[var(--text-secondary)] font-[var(--font-body)]">
                Can't find what you're looking for? Our team usually replies in under 5 minutes.
              </p>
            </div>

            <div className="faq-anim bg-[var(--bg-base)] p-6 rounded-xl border border-[var(--border-default)]">
              <p className="text-[var(--primary-deep)] font-semibold font-[var(--font-heading)] mb-4">
                Still unsure? Talk to a real human.
              </p>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link 
                  href="https://wa.me/2348000000000" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium font-[var(--font-body)] hover:bg-[var(--bg-base)] transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-[var(--state-success)]" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </Link>
                <Link 
                  href="tel:+2348000000000" 
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium font-[var(--font-body)] hover:bg-[var(--bg-base)] transition-colors"
                >
                  <Phone className="w-5 h-5 text-[var(--primary-medium)]" aria-hidden="true" />
                  <span>Call +234 800 000 0000</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────
              RIGHT COLUMN: Accordion
              ────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8">
            <div className="faq-anim divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
              {faqItems.map((item) => (
                <details 
                  key={item.id} 
                  className="group py-6 cursor-pointer" 
                  open={item.defaultOpen}
                >
                  <summary className="flex items-center justify-between text-lg font-semibold text-[var(--primary-deep)] font-[var(--font-heading)] list-none">
                    {item.question}
                    <ChevronDown 
                      className="w-5 h-5 text-[var(--text-muted)] transition-transform duration-300 group-open:rotate-180" 
                      aria-hidden="true" 
                    />
                  </summary>
                  <div className="mt-4 pr-8 text-[var(--text-secondary)] font-[var(--font-body)] leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}