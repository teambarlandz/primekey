'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "I sold my 3-bedroom apartment in Lekki in just 18 days — and for 12% above my asking price. The Primekey Homes team handled all the legal paperwork seamlessly.",
    name: 'Chinedu Okafor',
    role: 'Property Seller, Lagos',
    initials: 'CO',
  },
  {
    id: 2,
    quote: "Finding a verified, brokerage-free flat in Abuja felt impossible until I used Primekey. They found me a beautiful 2BHK within a week and handled the entire legal check.",
    name: 'Ngozi Eze',
    role: 'Home Buyer, Abuja',
    initials: 'NE',
  },
  {
    id: 3,
    quote: "As a developer, filling 120 units across my new estate in Port Harcourt was a massive challenge. Primekey's concierge service helped us reach 94% occupancy in just 60 days.",
    name: 'Adebayo Akinola',
    role: 'Property Developer, Port Harcourt',
    initials: 'AA',
  },
];

export default function SocialProof() {
  useGSAP(() => {
    // Exit early if user prefers reduced motion
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Staggered fade-up animation for elements as they scroll into view
      gsap.fromTo('.sp-anim', 
        { y: 40, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: ANIMATION_TOKENS.duration, 
          stagger: ANIMATION_TOKENS.stagger, 
          ease: ANIMATION_TOKENS.ease,
          scrollTrigger: {
            trigger: '.social-proof',
            start: 'top 80%', // Animation starts when the top of the section hits 80% of the viewport
            toggleActions: 'play none none reverse', // Reverses animation when scrolling back up
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="social-proof py-16 md:py-24 bg-[var(--bg-base)]" aria-labelledby="sp-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ──────────────────────────────────────────────────────────────
            BRAND LOGO STRIP
            ────────────────────────────────────────────────────────────── */}
        <div className="sp-anim text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--text-muted)] font-[var(--font-body)] mb-8">
            Trusted by leading brands & featured in
          </p>
          <ul className="flex flex-wrap justify-center items-center gap-8 md:gap-16" role="list">
            {[1, 2, 3, 4, 5].map((num) => (
              <li key={num} className="flex items-center justify-center">
                <Image
                  src={`/assets/brands/brand-${num}.svg`}
                  alt={`Trusted partner brand ${num}`}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </li>
            ))}
          </ul>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            KEY STATS
            ────────────────────────────────────────────────────────────── */}
        <div className="sp-anim grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-y border-[var(--border-default)] py-12">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] mb-2">10,000+</p>
            <p className="text-sm md:text-base text-[var(--text-secondary)] font-[var(--font-body)]">Happy customers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] mb-2">42</p>
            <p className="text-sm md:text-base text-[var(--text-secondary)] font-[var(--font-body)]">Cities covered</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] mb-2">₦85B+</p>
            <p className="text-sm md:text-base text-[var(--text-secondary)] font-[var(--font-body)]">Property value transacted</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] mb-2">4.8★</p>
            <p className="text-sm md:text-base text-[var(--text-secondary)] font-[var(--font-body)]">Average rating (3,400 reviews)</p>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            TESTIMONIALS
            ────────────────────────────────────────────────────────────── */}
        <div className="sp-anim">
          <div className="text-center mb-12">
            <h2 id="sp-heading" className="text-3xl md:text-4xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] mb-4">
              Real stories. Real results.
            </h2>
            <p className="text-lg text-[var(--text-secondary)] font-[var(--font-body)] max-w-2xl mx-auto">
              Don't just take our word for it. Here is what Nigerians across the country are saying about Primekey Homes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <article 
                key={testimonial.id} 
                className="bg-[var(--bg-surface)] p-8 rounded-xl shadow-[var(--shadow-default)] border border-[var(--border-default)] hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 flex flex-col"
              >
                {/* Rating Stars */}
                <div className="flex gap-1 mb-6 text-[var(--state-warning)]" aria-label="Rated 5 out of 5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                {/* Quote Icon & Text */}
                <div className="relative mb-6 flex-grow">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[var(--primary-light)] opacity-30" aria-hidden="true" />
                  <blockquote className="text-[var(--text-secondary)] font-[var(--font-body)] leading-relaxed italic pl-4">
                    "{testimonial.quote}"
                  </blockquote>
                </div>

                {/* Author Info */}
                <footer className="flex items-center gap-4 pt-6 border-t border-[var(--border-default)]">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--gradient-accent)] flex items-center justify-center text-white font-bold font-[var(--font-body)] text-lg shadow-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--primary-deep)] font-[var(--font-body)]">{testimonial.name}</p>
                    <p className="text-sm text-[var(--text-muted)] font-[var(--font-body)]">{testimonial.role}</p>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}