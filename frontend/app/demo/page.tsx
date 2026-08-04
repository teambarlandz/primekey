'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlayCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';

const BRAND_COLOR = '#04164a';

const DEMO_VIDEO_SRC = '/demo/demo.mp4';

const demoPoints = [
  'Browse verified listings across Lagos, Abuja & Port Harcourt',
  'Buy, rent, or short-let with zero brokerage',
  'Submit a concierge request and get matched within 24 hours',
  'Track your transaction and documents in one place',
];

export default function DemoPage() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      <SiteNav variant="minimal" breadcrumb={[{ label: 'Watch demo' }]} />

      {/* ─────────────────────────────────────────────
          HERO
          ───────────────────────────────────────────── */}
      <section className="relative pt-16 pb-14 lg:pt-24 lg:pb-20 bg-[#f3f0ff] overflow-hidden" aria-labelledby="demo-hero-headline">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm mb-6">
            <PlayCircle className="w-4 h-4" style={{ color: BRAND_COLOR }} />
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-heading" style={{ color: BRAND_COLOR }}>
              Product tour
            </p>
          </div>

          <h1 id="demo-hero-headline" className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.15] tracking-tight max-w-4xl mx-auto mb-6" style={{ color: BRAND_COLOR }}>
            See Primekey Homes{' '}
            <span className="italic font-normal font-body opacity-90">in action.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#4a607a] font-body max-w-2xl mx-auto leading-relaxed">
            A two-minute walkthrough of finding, buying, and renting your next property on Primekey.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          VIDEO
          ───────────────────────────────────────────── */}
      <section className="pb-16 md:pb-24" aria-label="Demo video">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 bg-[#04164a]">
            {videoFailed ? (
              <div className="flex flex-col items-center justify-center gap-4 min-h-[320px] px-6 text-center">
                <PlayCircle className="w-14 h-14 text-purple-200" />
                <p className="text-xl font-bold font-heading text-white">
                  Demo video coming soon
                </p>
                <p className="text-sm text-purple-200 font-body max-w-md">
                  Drop your mp4 at <code className="bg-white/10 px-2 py-1 rounded">frontend/public/demo/demo.mp4</code> and this player will pick it up automatically.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[#04164a] font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:bg-purple-100"
                  style={{ backgroundColor: '#f3f0ff' }}
                >
                  Browse properties
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <video
                className="w-full aspect-video"
                controls
                preload="metadata"
                playsInline
                poster="/assets/hero-primekey-homes.jpg"
                onError={() => setVideoFailed(true)}
              >
                <source src={DEMO_VIDEO_SRC} type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          HIGHLIGHTS
          ───────────────────────────────────────────── */}
      <section className="pb-16 md:pb-24 bg-white" aria-label="What the demo covers">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <header className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 tracking-tight" style={{ color: BRAND_COLOR }}>
              What you&apos;ll learn
            </h2>
            <p className="text-lg text-[#4a607a] font-body leading-relaxed">
              The fastest way to your next home — explained in two minutes.
            </p>
          </header>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {demoPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 bg-[#f3f0ff]/70 p-5 rounded-2xl border border-purple-100">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND_COLOR }} />
                <span className="text-[#4a607a] font-body leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-12">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95 transform hover:-translate-y-0.5"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Try it yourself
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-[#f3f0ff] border border-purple-200/80 font-semibold font-heading text-sm transition-all duration-200 shadow-sm"
              style={{ color: BRAND_COLOR }}
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
