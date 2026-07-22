'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

// Exact Brand Navy
const BRAND_COLOR = '#04164a';

export default function Hero() {
  useGSAP(() => {
    // Respect reduced motion preference
    if (prefersReducedMotion()) {
      gsap.set('.hero-anim, .hero__floating-card', { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Staggered entrance for hero elements
      const tl = gsap.timeline({ 
        defaults: { ease: ANIMATION_TOKENS.ease, duration: ANIMATION_TOKENS.duration } 
      });
      
      tl.fromTo('.hero-anim', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger }
      );
      
      // Floating card bounce entrance
      gsap.fromTo('.hero__floating-card', 
        { y: 25, opacity: 0, scale: 0.95 }, 
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: ANIMATION_TOKENS.duration, 
          delay: 0.6, 
          ease: ANIMATION_TOKENS.bounceEase 
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section 
      className="relative pt-12 pb-16 lg:pt-20 lg:pb-28 bg-[#f3f0ff] overflow-hidden" 
      aria-labelledby="hero-headline"
    >
      {/* Background Soft Glow Accents */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* ─────────────────────────────────────────────────────────────
            LEFT: Content & CTAs
            ───────────────────────────────────────────────────────────── */}
        <div className="hero__content space-y-6">
          {/* Preheadline Pill Badge */}
          <div className="hero-anim opacity-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#04164a] animate-pulse" />
            <p 
              className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-heading"
              style={{ color: BRAND_COLOR }}
            >
              Trusted across Lagos, Abuja & Port Harcourt
            </p>
          </div>
          
          {/* Main Headline (Poppins) */}
          <h1 
            id="hero-headline" 
            className="hero-anim opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.15] tracking-tight"
            style={{ color: BRAND_COLOR }}
          >
            Find your next home —{' '}
            <span className="italic font-normal font-body opacity-90">without the hassle.</span>
          </h1>
          
          {/* Subheadline (Lora) */}
          <p className="hero-anim opacity-0 text-lg md:text-xl text-[#4a607a] font-body max-w-lg leading-relaxed">
            Buy, rent, or list verified properties in minutes — with zero brokerage and full legal support.
          </p>

          {/* Action Buttons */}
          <div className="hero-anim opacity-0 flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              href="/search" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95 transform hover:-translate-y-0.5"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Browse properties
            </Link>
            
            <Link 
              href="/demo" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/80 hover:bg-white border border-purple-200/80 font-semibold font-heading text-sm transition-all duration-200 shadow-sm"
              style={{ color: BRAND_COLOR }}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch 2-min demo
            </Link>
          </div>

          {/* Trust Points */}
          <ul className="hero-anim opacity-0 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#4a607a] font-body pt-2" role="list">
            <li className="flex items-center gap-2">
              <span className="font-bold" style={{ color: BRAND_COLOR }}>✓</span> Verified listings only
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold" style={{ color: BRAND_COLOR }}>✓</span> Zero brokerage
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold" style={{ color: BRAND_COLOR }}>✓</span> Legal support included
            </li>
          </ul>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            RIGHT: Media & Floating Card
            ────────────────────────────────────────────────────────────── */}
        <div className="hero__media relative mt-4 lg:mt-0 pb-6 pr-2 sm:pr-6">
          <div className="hero-anim opacity-0 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60">
            <Image
              src="/assets/hero-primekey-homes.jpg"
              alt="Modern luxury residence in Lagos, Ogun, and Delta with contemporary architecture"
              width={720}
              height={560}
              className="w-full h-auto object-cover rounded-2xl"
              priority
            />
          </div>

          {/* Floating Transaction Notification */}
          <aside 
            className="hero__floating-card opacity-0 absolute bottom-0 left-2 sm:-left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs border border-purple-100 z-20"
          >
            <div 
              className="flex-shrink-0 w-11 h-11 rounded-full text-white font-bold font-heading flex items-center justify-center shadow-sm"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              C
            </div>
            <div>
              <p 
                className="text-xs sm:text-sm font-semibold font-heading leading-snug"
                style={{ color: BRAND_COLOR }}
              >
                Chinedu just rented a 3-bed flat
              </p>
              <p className="text-xs text-[#4a607a] font-body mt-0.5">
                in Lekki • 4 mins ago
              </p>
            </div>
          </aside>
        </div>

      </div>
    </section>
  );
}
