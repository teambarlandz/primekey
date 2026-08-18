'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import SiteNav from '@/components/SiteNav';
import { Building2, ShieldCheck, Zap, FileText, Target, HeartHandshake, Users, Compass, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const BRAND_COLOR = '#04164a';

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '300+', label: 'Happy customers' },
  { value: '42', label: 'Cities covered' },
  { value: '$1B+', label: 'Transacted value' },
  { value: '14 days', label: 'Average time-to-close' },
];

interface Value {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const values: Value[] = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Trust Above All',
    text: 'Every property is physically inspected and legally checked against Lagos and Abuja land registries before it goes live. What we list is what you get.',
  },
  {
    icon: <HeartHandshake className="w-6 h-6" />,
    title: 'Radical Transparency',
    text: 'Zero brokerage, no hidden middleman fees, and direct access to verified owners. We make money only when you do — the way it should be.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Relentless Speed',
    text: 'With a 2-hour SLA on every lead and a 14-day average time-to-close, we move at the pace the Nigerian market needs — 3x faster than the old way.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'End-to-End Legal Rigour',
    text: 'From agreement drafting to Governor\'s consent, our in-house legal team handles every document, and our NDPR-compliant systems protect your data.',
  },
];

const timeline = [
  {
    phase: 'Research & Foundations',
    text: 'We studied the broken patterns of the Nigerian real estate market — opaque pricing, unverified listings, endless agent commissions — and designed a platform that eliminates them.',
  },
  {
    phase: 'Building the Core',
    text: 'We launched with a single mission: a verified, brokerage-free marketplace connecting buyers, renters, and property owners directly — with legal support built in.',
  },
  {
    phase: 'The Concierge Service',
    text: 'We introduced our signature 2-Week Concierge — for buyers and renters who cannot find what they need, a dedicated manager sources and verifies properties for them.',
  },
  {
    phase: 'Scaling Across Nigeria',
    text: 'Today we serve Lagos, Abuja, Port Harcourt, and 39 more cities, helping 1,200+ property owners list, lease, and sell with confidence.',
  },
];

export default function AboutPage() {
  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.about-anim, .section-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo('.about-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, duration: ANIMATION_TOKENS.duration, ease: ANIMATION_TOKENS.ease }
      );

      gsap.fromTo('.section-anim',
        { y: 35, opacity: 0 },
        {
          y: 0, opacity: 1, duration: ANIMATION_TOKENS.duration,
          stagger: ANIMATION_TOKENS.stagger, ease: ANIMATION_TOKENS.ease,
          scrollTrigger: {
            trigger: '.about-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      <SiteNav />

      {/* ─────────────────────────────────────────────
          HERO
          ───────────────────────────────────────────── */}
      <section className="relative pt-16 pb-16 lg:pt-24 lg:pb-28 bg-[#f3f0ff] overflow-hidden" aria-labelledby="about-hero-headline">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="about-anim opacity-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#04164a] animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-heading" style={{ color: BRAND_COLOR }}>
              Our story
            </p>
          </div>

          <h1 id="about-hero-headline" className="about-anim opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.15] tracking-tight max-w-4xl mx-auto mb-6" style={{ color: BRAND_COLOR }}>
            We're rebuilding how Nigerians{' '}
            <span className="italic font-normal font-body opacity-90">buy, sell, and rent property.</span>
          </h1>

          <p className="about-anim opacity-0 text-lg md:text-xl text-[#4a607a] font-body max-w-2xl mx-auto leading-relaxed">
            Primekey Homes and Properties Ltd is a Nigerian real estate platform on a mission to make property transactions verified, transparent, and radically faster — for buyers, renters, and owners alike.
          </p>

          <div className="about-anim opacity-0 flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95 transform hover:-translate-y-0.5"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Search properties
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/landlord"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/80 hover:bg-white border border-purple-200/80 font-semibold font-heading text-sm transition-all duration-200 shadow-sm"
              style={{ color: BRAND_COLOR }}
            >
              List your property
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          STATS
          ───────────────────────────────────────────── */}
      <section className="py-12 bg-[#04164a] relative overflow-hidden" aria-label="Key statistics">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-5xl font-bold font-heading text-white mb-1">{stat.value}</p>
                <p className="text-sm md:text-base text-purple-200 font-body">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          OUR STORY
          ───────────────────────────────────────────── */}
      <section className="about-section py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="story-heading">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="section-anim opacity-0 space-y-6">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a]">
                Our story
              </p>
              <h2 id="story-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading tracking-tight" style={{ color: BRAND_COLOR }}>
                Why we started Primekey Homes
              </h2>
              <p className="text-lg text-[#4a607a] font-body leading-relaxed">
                For too long, buying or selling property in Nigeria meant navigating unverified listings, hidden brokerage fees, endless paperwork, and deals that dragged on for months.
              </p>
              <p className="text-lg text-[#4a607a] font-body leading-relaxed">
                We founded Primekey Homes to change that. Our platform combines a rigorous 27-point physical and legal verification process, a brokerage-free marketplace, and in-house legal support — so every transaction is trustworthy, transparent, and remarkably fast.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Talk to our team
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="section-anim opacity-0 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60">
              <Image
                src="/assets/hero-primekey-homes.jpg"
                alt="Primekey Homes verified property in a prime Nigerian location"
                width={720}
                height={560}
                className="w-full h-auto object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          OUR VALUES
          ───────────────────────────────────────────── */}
      <section className="about-section py-16 md:py-24 bg-white relative overflow-hidden" aria-labelledby="values-heading">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="section-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
              What we stand for
            </p>
            <h2 id="values-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
              The values behind every deal
            </h2>
            <p className="text-lg text-[#4a607a] font-body leading-relaxed">
              Four principles guide how we build, how we verify, and how we treat every person who uses the platform.
            </p>
          </header>

          <div className="section-anim opacity-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <article key={value.title} className="bg-[#f3f0ff]/60 p-8 rounded-2xl border border-purple-100 hover:bg-[#f3f0ff] hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                  {value.title}
                </h3>
                <p className="text-[#4a607a] font-body leading-relaxed flex-grow text-sm">
                  {value.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          MILESTONES / JOURNEY
          ───────────────────────────────────────────── */}
      <section className="about-section py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="journey-heading">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="section-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
              The journey
            </p>
            <h2 id="journey-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
              From idea to national platform
            </h2>
          </header>

          <div className="section-anim opacity-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {timeline.map((item, index) => (
              <article key={index} className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-purple-100 shadow-md">
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xl font-heading" style={{ backgroundColor: BRAND_COLOR }}>
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
                  {index === 0 && <Compass className="w-6 h-6" />}
                  {index === 1 && <Building2 className="w-6 h-6" />}
                  {index === 2 && <Users className="w-6 h-6" />}
                  {index === 3 && <Target className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                  {item.phase}
                </h3>
                <p className="text-[#4a607a] font-body leading-relaxed text-sm">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          FINAL CTA
          ───────────────────────────────────────────── */}
      <section className="about-section py-16 md:py-24 bg-[#04164a] relative overflow-hidden" aria-labelledby="about-cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <header className="section-anim opacity-0 mb-8">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-purple-200 mb-3">
              Join us
            </p>
            <h2 id="about-cta-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight text-white">
              Ready to experience a better way?
            </h2>
            <p className="text-lg text-purple-100 font-body leading-relaxed mb-8">
              Whether you're buying, renting, or listing — let's make your next move your easiest one.
            </p>
          </header>
          <div className="section-anim opacity-0 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-[#04164a] font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:bg-purple-100"
              style={{ backgroundColor: '#f3f0ff' }}
            >
              Search properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/landlord/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 hover:border-white font-semibold font-heading text-sm transition-all duration-200 text-white"
            >
              List your property free
            </Link>
          </div>
          <p className="section-anim opacity-0 mt-10 text-sm text-purple-200 font-body">
            Questions? <Link href="/contact" className="underline hover:text-white transition-colors">Contact our team</Link> — we're here to help.
          </p>
        </div>
      </section>
    </main>
  );
}
