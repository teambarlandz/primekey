'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

export default function Hero() {
  useGSAP(() => {
    // Exit early if user prefers reduced motion
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Staggered entrance for main content elements
      const tl = gsap.timeline({ defaults: { ease: ANIMATION_TOKENS.ease, duration: ANIMATION_TOKENS.duration } });
      
      tl.fromTo('.hero-anim', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger }
      );
      
      // Floating card gets a slight delay and a subtle bounce effect
      gsap.fromTo('.hero__floating-card', 
        { y: 20, opacity: 0, scale: 0.95 }, 
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: ANIMATION_TOKENS.duration, 
          delay: 0.8, 
          ease: ANIMATION_TOKENS.bounceEase 
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section 
      className="hero pt-24 lg:pt-32 pb-16 lg:pb-24 bg-[var(--gradient-hero)] text-white overflow-hidden" 
      aria-labelledby="hero-headline"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* ─────────────────────────────────────────────────────────────
            LEFT: Content & CTAs
            ───────────────────────────────────────────────────────────── */}
        <div className="hero__content space-y-6">
          <p className="hero__preheadline hero-anim text-sm font-semibold tracking-widest uppercase text-[var(--primary-light)] font-[var(--font-body)]">
            Trusted by 10,000+ homeowners across Lagos, Abuja & Port Harcourt
          </p>
          
          <h1 id="hero-headline" className="hero__headline hero-anim text-4xl md:text-5xl lg:text-6xl font-bold font-[var(--font-heading)] leading-tight">
            Find your next home — <span className="text-[var(--primary-light)]">without the hassle.</span>
          </h1>
          
          <p className="hero__subheadline hero-anim text-lg md:text-xl text-[var(--bg-base)] font-[var(--font-body)] max-w-lg">
            Buy, rent, or list verified properties in minutes — with zero brokerage and full legal support.
          </p>

          <div className="hero__ctas hero-anim flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              href="/search" 
              className="btn btn--primary btn--lg inline-flex items-center justify-center px-8 py-4 rounded-lg bg-[var(--gradient-cta)] text-white font-semibold font-[var(--font-body)] hover:opacity-90 transition-opacity shadow-[var(--shadow-elevated)]"
            >
              Browse properties
            </Link>
            <Link 
              href="/demo" 
              className="btn btn--ghost btn--lg inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-white/30 text-white font-semibold font-[var(--font-body)] hover:bg-white/10 transition-colors"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch 2-min demo
            </Link>
          </div>

          <ul className="hero__trust hero-anim flex flex-wrap gap-x-6 gap-y-2 text-[var(--bg-base)]/90 font-[var(--font-body)] pt-4" role="list">
            <li className="flex items-center gap-2">✓ Verified listings only</li>
            <li className="flex items-center gap-2">✓ Zero brokerage</li>
            <li className="flex items-center gap-2">✓ Legal support included</li>
          </ul>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            RIGHT: Media & Floating Card
            ────────────────────────────────────────────────────────────── */}
        <div className="hero__media relative mt-8 lg:mt-0">
          <div className="hero-anim relative rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)]">
            <Image
              src="/assets/hero-primekey-homes.jpg"
              alt="Modern luxury residence in Lagos, Ogun, and Delta with contemporary architecture"
              width={720}
              height={560}
              className="hero__image w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Floating Transaction Card */}
          <aside className="hero__floating-card absolute -bottom-6 -left-6 md:-left-12 bg-[var(--bg-surface)] p-4 rounded-xl shadow-[var(--shadow-modal)] flex items-center gap-4 max-w-xs border border-[var(--border-default)]">
            <div className="hero__floating-card-avatar flex-shrink-0 w-10 h-10 rounded-full bg-[var(--gradient-accent)] flex items-center justify-center text-white font-bold font-[var(--font-body)]">
              C
            </div>
            <div>
              <p className="hero__floating-card-title text-sm font-semibold text-[var(--text-primary)] font-[var(--font-body)]">
                Chinedu just rented a 3-bedroom flat
              </p>
              <p className="hero__floating-card-sub text-xs text-[var(--text-muted)] font-[var(--font-body)]">
                in Lekki • 4 mins ago
              </p>
            </div>
          </aside>
        </div>

      </div>
    </section>
  );
}