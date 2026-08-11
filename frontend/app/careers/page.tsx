'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import SiteNav from '@/components/SiteNav';
import { fetchJobOpenings, JobOpening } from '@/lib/api-client';
import {
  ArrowRight,
  Building2,
  MapPin,
  Clock,
  Home,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  Rocket,
  Users,
  GraduationCap,
  Briefcase,
  Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const BRAND_COLOR = '#04164a';

interface Perk {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const perks: Perk[] = [
  {
    icon: <Rocket className="w-6 h-6" />,
    title: 'Impact, fast',
    text: 'Every role directly moves how Nigerians buy, rent, and sell property. Decisions happen quickly and your work ships in weeks, not quarters.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Trust as a product',
    text: 'You\'ll help build verification, legal rigour, and transparency into everything we do — work that genuinely protects people.',
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Grow with us',
    text: 'Learning budget, mentorship, and a seat at the table as we scale from Lagos and Abuja to all 42+ cities we serve.',
  },
  {
    icon: <HeartHandshake className="w-6 h-6" />,
    title: 'A team that cares',
    text: 'Competitive pay, flexible working, and a culture that celebrates candour, craft, and getting the details right.',
  },
];

const process = [
  {
    step: '01',
    title: 'Apply',
    text: 'Send your CV and a short note on why you want to build with us. We reply to every application within one week.',
  },
  {
    step: '02',
    title: 'Intro call',
    text: 'A 30-minute chat with the hiring team to understand your experience and answer your questions about us.',
  },
  {
    step: '03',
    title: 'Skills & culture fit',
    text: 'A practical, real-world task plus a conversation with the team you\'d be working with. No trick questions — just honest feedback.',
  },
  {
    step: '04',
    title: 'Offer & onboarding',
    text: 'If it\'s a yes, you\'ll get a clear offer and a structured onboarding plan so you can hit the ground running.',
  },
];

export default function CareersPage() {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [openingsLoading, setOpeningsLoading] = useState(true);
  const [openingsError, setOpeningsError] = useState(false);

  const loadOpenings = async () => {
    setOpeningsLoading(true);
    setOpeningsError(false);
    try {
      const results = await fetchJobOpenings();
      setOpenings(results);
    } catch {
      setOpeningsError(true);
      setOpenings([]);
    } finally {
      setOpeningsLoading(false);
    }
  };

  useEffect(() => {
    loadOpenings();
  }, []);

  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.careers-anim, .section-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.careers-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, duration: ANIMATION_TOKENS.duration, ease: ANIMATION_TOKENS.ease }
      );

      gsap.fromTo(
        '.section-anim',
        { y: 35, opacity: 0 },
        {
          y: 0, opacity: 1, duration: ANIMATION_TOKENS.duration,
          stagger: ANIMATION_TOKENS.stagger, ease: ANIMATION_TOKENS.ease,
          scrollTrigger: {
            trigger: '.careers-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      <SiteNav />

      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-purple-100" aria-label="Breadcrumb">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm font-body text-[#4a607a]">
            <li>
              <Link href="/" className="inline-flex items-center gap-1 hover:text-[#04164a] transition-colors">
                <Home className="w-3.5 h-3.5" aria-hidden="true" />
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </li>
            <li className="font-semibold text-[#04164a]">Careers</li>
          </ol>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────
          HERO
          ───────────────────────────────────────────── */}
      <section className="relative pt-16 pb-16 lg:pt-24 lg:pb-28 bg-[#f3f0ff] overflow-hidden" aria-labelledby="careers-hero-headline">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="careers-anim opacity-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#04164a] animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-heading" style={{ color: BRAND_COLOR }}>
              Careers at Primekey
            </p>
          </div>

          <h1 id="careers-hero-headline" className="careers-anim opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.15] tracking-tight max-w-4xl mx-auto mb-6" style={{ color: BRAND_COLOR }}>
            Build the future of Nigerian{' '}
            <span className="italic font-normal font-body opacity-90">real estate with us.</span>
          </h1>

          <p className="careers-anim opacity-0 text-lg md:text-xl text-[#4a607a] font-body max-w-2xl mx-auto leading-relaxed">
            We're a small, ambitious team making property in Nigeria verified, transparent, and radically faster. If you want your work to matter, you'll fit right in.
          </p>

          <div className="careers-anim opacity-0 flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <a
              href="#open-roles"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95 transform hover:-translate-y-0.5"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              View open roles
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="mailto:careers@primekeyhomes.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/80 hover:bg-white border border-purple-200/80 font-semibold font-heading text-sm transition-all duration-200 shadow-sm"
              style={{ color: BRAND_COLOR }}
            >
              Email us your CV
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          QUICK STATS
          ───────────────────────────────────────────── */}
      <section className="py-12 bg-[#04164a] relative overflow-hidden" aria-label="Careers quick facts">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-5xl font-bold font-heading text-white mb-1">42+</p>
              <p className="text-sm md:text-base text-purple-200 font-body">Cities served</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-5xl font-bold font-heading text-white mb-1">1,200+</p>
              <p className="text-sm md:text-base text-purple-200 font-body">Property owners supported</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-5xl font-bold font-heading text-white mb-1">14 days</p>
              <p className="text-sm md:text-base text-purple-200 font-body">Average time-to-close</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-5xl font-bold font-heading text-white mb-1">27-point</p>
              <p className="text-sm md:text-base text-purple-200 font-body">Property verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          WHY WORK WITH US
          ───────────────────────────────────────────── */}
      <section className="careers-section py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="perks-heading">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="section-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
              Why join us
            </p>
            <h2 id="perks-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
              Work that matters, a team that backs you
            </h2>
            <p className="text-lg text-[#4a607a] font-body leading-relaxed">
              We're rebuilding a market people have lost trust in. That mission shapes how we hire, how we work, and how we grow together.
            </p>
          </header>

          <div className="section-anim opacity-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {perks.map((perk) => (
              <article key={perk.title} className="bg-white/80 p-8 rounded-2xl border border-purple-100 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
                  {perk.icon}
                </div>
                <h3 className="text-xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                  {perk.title}
                </h3>
                <p className="text-[#4a607a] font-body leading-relaxed flex-grow text-sm">
                  {perk.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          OPEN ROLES
          ───────────────────────────────────────────── */}
      <section id="open-roles" className="careers-section py-16 md:py-24 bg-white relative overflow-hidden" aria-labelledby="roles-heading">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="section-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
              Open positions
            </p>
            <h2 id="roles-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
              Current openings
            </h2>
            <p className="text-lg text-[#4a607a] font-body leading-relaxed">
              Don't see your role? We're always keen to hear from exceptional people — email us your CV anyway.
            </p>
          </header>

          <ul className="section-anim opacity-0 space-y-4" role="list">
            {openingsLoading && (
              <li className="p-6 md:p-8 rounded-2xl border border-purple-100 bg-[#f3f0ff]/50 text-center">
                <p className="text-sm font-body text-[#4a607a] animate-pulse">Loading current openings…</p>
              </li>
            )}

            {!openingsLoading && openingsError && (
              <li className="p-6 md:p-8 rounded-2xl border border-purple-100 bg-[#f3f0ff]/50 text-center">
                <p className="text-sm font-body text-[#4a607a] mb-4">
                  We couldn't load our current openings right now.
                </p>
                <button
                  type="button"
                  onClick={loadOpenings}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Try again
                </button>
              </li>
            )}

            {!openingsLoading && !openingsError && openings.length === 0 && (
              <li className="p-6 md:p-8 rounded-2xl border border-purple-100 bg-[#f3f0ff]/50 text-center">
                <p className="text-sm font-body text-[#4a607a] mb-2">
                  We currently have no open positions at this time.
                </p>
                <p className="text-sm font-body text-[#4a607a]">
                  We are always looking for exceptional talent — submit your CV to{' '}
                  <a href="mailto:careers@primekeyhomes.com" className="font-semibold underline" style={{ color: BRAND_COLOR }}>
                    careers@primekeyhomes.com
                  </a>{' '}
                  and we will keep you in mind for future opportunities.
                </p>
              </li>
            )}

            {!openingsLoading && !openingsError && openings.map((role) => (
              <li key={role.id}>
                <Link
                  href={`/careers/${role.id}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl border border-purple-100 bg-[#f3f0ff]/50 hover:bg-[#f3f0ff] hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold font-heading mb-1 group-hover:underline" style={{ color: BRAND_COLOR }}>
                        {role.title}
                      </h3>
                      <p className="text-sm text-[#4a607a] font-body mb-2">{role.team}</p>
                      <p className="flex flex-wrap gap-4 text-xs font-body text-[#4a607a]">
                        <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" aria-hidden="true" />{role.location}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" aria-hidden="true" />{role.employment_type_display}</span>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold font-heading shrink-0" style={{ color: BRAND_COLOR }}>
                    View Details
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          HIRING PROCESS
          ───────────────────────────────────────────── */}
      <section className="careers-section py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="process-heading">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="section-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
              How we hire
            </p>
            <h2 id="process-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
              A process built on respect for your time
            </h2>
            <p className="text-lg text-[#4a607a] font-body leading-relaxed">
              No ghosting, no hoop-jumping. Four clear steps from application to offer — and feedback at every stage.
            </p>
          </header>

          <div className="section-anim opacity-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item) => (
              <article key={item.step} className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-purple-100 shadow-md">
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xl font-heading" style={{ backgroundColor: BRAND_COLOR }}>
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                  {item.title}
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
      <section className="careers-section py-16 md:py-24 bg-[#04164a] relative overflow-hidden" aria-labelledby="careers-cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <header className="section-anim opacity-0 mb-8">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-purple-200 mb-3">
              Don't see your role?
            </p>
            <h2 id="careers-cta-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight text-white">
              Let's build something worth living in.
            </h2>
            <p className="text-lg text-purple-100 font-body leading-relaxed mb-8">
              Email us your CV and a short note about the role you'd love — we read every single application.
            </p>
          </header>
          <div className="section-anim opacity-0 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:careers@primekeyhomes.com"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-[#04164a] font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:bg-purple-100"
              style={{ backgroundColor: '#f3f0ff' }}
            >
              careers@primekeyhomes.com
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 hover:border-white font-semibold font-heading text-sm transition-all duration-200 text-white"
            >
              Contact the team
            </Link>
          </div>
          <p className="section-anim opacity-0 mt-10 text-sm text-purple-200 font-body">
            <Home className="w-4 h-4 inline-block mr-1 -mt-0.5" aria-hidden="true" />
            <Users className="w-4 h-4 inline-block mr-1 -mt-0.5" aria-hidden="true" />
            <Building2 className="w-4 h-4 inline-block mr-1 -mt-0.5" aria-hidden="true" />
            Join a team redefining trust in Nigerian real estate.
          </p>
        </div>
      </section>
    </main>
  );
}
