'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

const BRAND_COLOR = '#04164a';

const HERO_SLIDES = [
  {
    src: '/assets/hero-primekey-homes.jpg',
    alt: 'Modern luxury residence in Lagos with contemporary architecture',
    headline: 'Find your next home —',
    headlineItalic: 'without the hassle.',
    subtext: 'Buy, rent, or list verified properties in minutes — with zero brokerage and full legal support.',
  },
  {
    src: '/assets/Hero-2.jpg',
    alt: 'Premium property in Abuja with modern finishing',
    headline: 'Your dream property is —',
    headlineItalic: 'just a click away.',
    subtext: 'Explore thousands of verified listings across Lagos, Abuja, and Port Harcourt with dedicated support.',
  },
];

const TRANSITION_DURATION = 600;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning || index === current) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [current, isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % HERO_SLIDES.length);
  }, [current, goTo]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused || isTransitioning) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, isTransitioning, next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
      if (e.key === 'ArrowRight') goTo((current + 1) % HERO_SLIDES.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo]);

  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.hero-anim, .hero__floating-card', { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ 
        defaults: { ease: ANIMATION_TOKENS.ease, duration: ANIMATION_TOKENS.duration } 
      });
      
      tl.fromTo('.hero-anim', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger }
      );
      
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

  const slide = HERO_SLIDES[current];

  return (
    <section 
      className="relative pt-12 pb-16 lg:pt-20 lg:pb-28 bg-[#f3f0ff] overflow-hidden" 
      aria-labelledby="hero-headline"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Soft Glow Accents */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* LEFT: Content & CTAs */}
        <div className="hero__content space-y-6">
          <div className="hero-anim opacity-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#04164a] animate-pulse" />
            <p 
              className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-heading"
              style={{ color: BRAND_COLOR }}
            >
              Trusted across Lagos, Abuja & Port Harcourt
            </p>
          </div>
          
          <h1 
            id="hero-headline" 
            className="hero-anim opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.15] tracking-tight min-h-[140px] sm:min-h-[180px]"
            style={{ color: BRAND_COLOR }}
          >
            <span key={`headline-${current}`} className="animate-fade-in-up block">
              {slide.headline}{' '}
              <span className="italic font-normal font-body opacity-90">{slide.headlineItalic}</span>
            </span>
          </h1>
          
          <p 
            key={`subtext-${current}`}
            className="hero-anim opacity-0 text-lg md:text-xl text-[#4a607a] font-body max-w-lg leading-relaxed min-h-[56px] animate-fade-in-up"
          >
            {slide.subtext}
          </p>

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

        {/* RIGHT: Image Carousel & Floating Card */}
        <div className="hero__media relative mt-4 lg:mt-0 pb-6 pr-2 sm:pr-6">
          <div className="hero-anim opacity-0 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 aspect-[720/560]">
            {/* Image layer */}
            {HERO_SLIDES.map((img, idx) => (
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                fill
                priority={idx === 0}
                className={`object-cover absolute inset-0 transition-opacity duration-[600ms] ease-in-out ${
                  idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ))}

            {/* Navigation arrows */}
            <button
              type="button"
              onClick={() => goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#04164a] hover:bg-white transition-all shadow-md"
              aria-label="Previous image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo((current + 1) % HERO_SLIDES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#04164a] hover:bg-white transition-all shadow-md"
              aria-label="Next image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4" role="tablist" aria-label="Hero images">
            {HERO_SLIDES.map((img, idx) => (
              <button
                key={img.src}
                type="button"
                onClick={() => goTo(idx)}
                role="tab"
                aria-selected={idx === current}
                aria-label={img.alt}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'bg-[#04164a] w-7'
                    : 'bg-[#04164a]/25 w-2 hover:bg-[#04164a]/50'
                }`}
              />
            ))}
          </div>

          {/* Floating Transaction Notification */}
          <aside 
            className="hero__floating-card opacity-0 absolute bottom-16 sm:bottom-14 left-2 sm:-left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs border border-purple-100 z-30"
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
