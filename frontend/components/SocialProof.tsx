'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Exact Brand Navy
const BRAND_COLOR = '#04164a';

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
    // Respect reduced motion preference
    if (prefersReducedMotion()) {
      gsap.set('.sp-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Staggered fade-up animation for elements as they scroll into view
      gsap.fromTo('.sp-anim', 
        { y: 35, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: ANIMATION_TOKENS.duration, 
          stagger: ANIMATION_TOKENS.stagger, 
          ease: ANIMATION_TOKENS.ease,
          scrollTrigger: {
            trigger: '.social-proof',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="social-proof py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="sp-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ──────────────────────────────────────────────────────────────
            BRAND LOGO STRIP
            ────────────────────────────────────────────────────────────── */}
        <div className="sp-anim opacity-0 text-center mb-12">
          <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-8">
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
        <div className="sp-anim opacity-0 grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-y border-purple-200/70 py-10">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold font-heading mb-1" style={{ color: BRAND_COLOR }}>10,000+</p>
            <p className="text-sm md:text-base text-[#4a607a] font-body">Happy customers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold font-heading mb-1" style={{ color: BRAND_COLOR }}>42</p>
            <p className="text-sm md:text-base text-[#4a607a] font-body">Cities covered</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold font-heading mb-1" style={{ color: BRAND_COLOR }}>₦85B+</p>
            <p className="text-sm md:text-base text-[#4a607a] font-body">Transacted value</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold font-heading mb-1" style={{ color: BRAND_COLOR }}>4.8★</p>
            <p className="text-sm md:text-base text-[#4a607a] font-body">Average rating (3,400+)</p>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            TESTIMONIALS
            ────────────────────────────────────────────────────────────── */}
        <div className="sp-anim opacity-0">
          <div className="text-center mb-12">
            <h2 id="sp-heading" className="text-3xl md:text-4xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
              Real stories. Real results.
            </h2>
            <p className="text-lg text-[#4a607a] font-body max-w-2xl mx-auto">
              Don't just take our word for it. Here is what Nigerians across the country are saying about Primekey Homes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <article 
                key={testimonial.id} 
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-purple-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-6 text-amber-400" aria-label="Rated 5 out of 5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>

                  {/* Quote Icon & Text */}
                  <div className="relative mb-6">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-300 opacity-40" aria-hidden="true" />
                    <blockquote className="text-[#22376e] font-body leading-relaxed italic pl-4">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                </div>

                {/* Author Info */}
                <footer className="flex items-center gap-4 pt-6 border-t border-purple-100/80 mt-auto">
                  <div 
                    className="flex-shrink-0 w-11 h-11 rounded-full text-white font-bold font-heading text-sm flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold font-heading text-sm" style={{ color: BRAND_COLOR }}>{testimonial.name}</p>
                    <p className="text-xs text-[#4a607a] font-body">{testimonial.role}</p>
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
