'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, ShieldCheck, Clock, Users, FileText, Banknote, ArrowRight, Sparkles, Key, Target, Check, Minus, X } from 'lucide-react';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(ScrollTrigger);

const BRAND_COLOR = '#04164a';

interface ValueProp {
  id: number;
  icon: React.ReactNode;
  title: string;
  text: string;
}

const valueProps: ValueProp[] = [
  {
    id: 1,
    icon: <Building2 className="w-6 h-6" />,
    title: 'List Free, Sell/Rent Faster',
    text: 'Post your property in minutes. Our platform reaches 50,000+ active buyers and renters across Lagos, Abuja, and Port Harcourt monthly.',
  },
  {
    id: 2,
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Verified Leads Only',
    text: 'Every inquiry comes from identity-verified prospects with NDPR-compliant consent. No spam, no tire-kickers — just serious buyers and tenants.',
  },
  {
    id: 3,
    icon: <Clock className="w-6 h-6" />,
    title: '2-Week Guaranteed Exposure',
    text: 'Your property gets featured placement and targeted promotion for 14 days. Average time-to-close: 14 days vs 90+ days traditionally.',
  },
  {
    id: 4,
    icon: <FileText className="w-6 h-6" />,
    title: 'Full Legal Support Included',
    text: 'From agreement drafting to Governor\'s consent processing — our in-house legal team handles all documentation so you don\'t have to.',
  },
];

interface ComparisonRow {
  feature: string;
  primekey: React.ReactNode;
  traditional: React.ReactNode;
  selfListed: React.ReactNode;
}

const comparisonData: ComparisonRow[] = [
  { 
    feature: 'Verified buyer/tenant leads', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    selfListed: <X className="w-5 h-5 text-rose-500" /> 
  },
  { 
    feature: 'Zero brokerage fees', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    selfListed: <Check className="w-5 h-5 text-emerald-600" /> 
  },
  { 
    feature: 'Legal docs & Governor\'s consent', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <Minus className="w-5 h-5 text-amber-500" />, 
    selfListed: <X className="w-5 h-5 text-rose-500" /> 
  },
  { 
    feature: '2-week featured exposure', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    selfListed: <X className="w-5 h-5 text-rose-500" /> 
  },
  { 
    feature: 'Direct communication with prospects', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    selfListed: <Check className="w-5 h-5 text-emerald-600" /> 
  },
  { 
    feature: 'NDPR-compliant data handling', 
    primekey: <Check className="w-5 h-5 text-emerald-600" />, 
    traditional: <X className="w-5 h-5 text-rose-500" />, 
    selfListed: <X className="w-5 h-5 text-rose-500" /> 
  },
];

export default function LandlordPage() {
  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.landlord-anim', { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Hero entrance
      const heroTl = gsap.timeline({ 
        defaults: { ease: ANIMATION_TOKENS.ease, duration: ANIMATION_TOKENS.duration } 
      });
      
      heroTl.fromTo('.landlord-anim', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger }
      );

      // Scroll-triggered sections
      gsap.fromTo('.section-anim', 
        { y: 35, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: ANIMATION_TOKENS.duration, 
          stagger: ANIMATION_TOKENS.stagger, 
          ease: ANIMATION_TOKENS.ease,
          scrollTrigger: {
            trigger: '.landlord-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-[#f3f0ff]">
        {/* ──────────────────────────────────────────────────────────────
            HERO SECTION
            ────────────────────────────────────────────────────────────── */}
        <section 
          className="relative pt-12 pb-16 lg:pt-20 lg:pb-28 bg-[#f3f0ff] overflow-hidden" 
          aria-labelledby="landlord-hero-headline"
        >
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" 
            aria-hidden="true"
          />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            <div className="landlord-anim opacity-0 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#04164a] animate-pulse" />
                <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-heading" style={{ color: BRAND_COLOR }}>
                  Trusted by 1,200+ property owners across Nigeria
                </p>
              </div>
              
              <h1 
                id="landlord-hero-headline" 
                className="landlord-anim opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.15] tracking-tight"
                style={{ color: BRAND_COLOR }}
              >
                List your property —{' '}
                <span className="italic font-normal font-body opacity-90">and close in 2 weeks.</span>
              </h1>
              
              <p className="landlord-anim opacity-0 text-lg md:text-xl text-[#4a607a] font-body max-w-lg leading-relaxed">
                Zero brokerage, verified leads, full legal support. Join 1,200+ landlords who trust Primekey Homes to list, lease, and sell their properties with confidence.
              </p>

              <div className="landlord-anim opacity-0 flex flex-col sm:flex-row gap-4 pt-2">
                <Link 
                  href="/landlord/register" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95 transform hover:-translate-y-0.5"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  List your property free
                </Link>
                
                <Link 
                  href="/landlord/inspection-booking" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/80 hover:bg-white border border-purple-200/80 font-semibold font-heading text-sm transition-all duration-200 shadow-sm"
                  style={{ color: BRAND_COLOR }}
                >
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Book an inspection
                </Link>

                <Link 
                  href="/landlord/intake" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-[#04164a]/30 hover:border-[#04164a] font-semibold font-heading text-sm transition-all duration-200 shadow-sm"
                  style={{ color: BRAND_COLOR }}
                >
                  <FileText className="w-4 h-4" />
                  Add a property
                </Link>
              </div>

              <ul className="landlord-anim opacity-0 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#4a607a] font-body pt-2" role="list">
                <li className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: BRAND_COLOR }}>✓</span> Zero brokerage fees
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: BRAND_COLOR }}>✓</span> NDPR-compliant data protection
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: BRAND_COLOR }}>✓</span> Dedicated relationship manager
                </li>
              </ul>
            </div>

            <div className="relative mt-4 lg:mt-0 pb-6 pr-2 sm:pr-6">
              <div className="landlord-anim opacity-0 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60">
                <Image
                  src="/assets/Homeowner.jpg"
                  alt="Property owner reviewing verified offers on Primekey Homes dashboard"
                  width={720}
                  height={560}
                  className="w-full h-auto object-cover rounded-2xl"
                  priority
                />
              </div>

              <aside className="landlord-anim opacity-0 absolute bottom-0 left-2 sm:-left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs border border-purple-100 z-20">
                <div className="flex-shrink-0 w-11 h-11 rounded-full text-white font-bold font-heading flex items-center justify-center shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold font-heading leading-snug" style={{ color: BRAND_COLOR }}>
                    Mrs. Adebayo listed her 4-bed duplex
                  </p>
                  <p className="text-xs text-[#4a607a] font-body mt-0.5">
                    in Ikoyi • Closed in 11 days
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────
            VALUE PROPS SECTION
            ────────────────────────────────────────────────────────────── */}
        <section className="landlord-section py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="value-props-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <header className="section-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
                Why Primekey Homes
              </p>
              <h2 id="value-props-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
                Everything a property owner needs. Nothing you don't.
              </h2>
              <p className="text-lg text-[#4a607a] font-body leading-relaxed">
                Built specifically for Nigerian landlords — whether you're selling a duplex in Lekki or renting a flat in Maitama.
              </p>
            </header>

            <div className="section-anim opacity-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              {valueProps.map((prop) => (
                <article 
                  key={prop.id} 
                  className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div 
                    className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-6 shadow-sm"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    {prop.icon}
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                    {prop.title}
                  </h3>
                  <p className="text-[#4a607a] font-body leading-relaxed flex-grow text-sm">
                    {prop.text}
                  </p>
                </article>
              ))}
            </div>

            {/* COMPARISON TABLE */}
            <div className="section-anim opacity-0 mb-24">
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold font-heading" style={{ color: BRAND_COLOR }}>
                  Primekey Homes vs other ways to list
                </h3>
              </div>
              
              <div className="overflow-x-auto rounded-2xl border border-purple-100 shadow-md bg-white/90 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-purple-100 bg-purple-50/50">
                      <th className="p-4 md:p-6 font-semibold text-[#4a607a] font-body w-1/3">Feature</th>
                      <th className="p-4 md:p-6 font-bold font-heading text-center bg-purple-100/40" style={{ color: BRAND_COLOR }}>
                        Primekey Homes
                      </th>
                      <th className="p-4 md:p-6 font-semibold text-[#4a607a] font-body text-center">Traditional Agents</th>
                      <th className="p-4 md:p-6 font-semibold text-[#4a607a] font-body text-center">Self-Listed (Jiji/OLX)</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-[#22376e]">
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b border-purple-100/70 last:border-0 hover:bg-purple-50/30 transition-colors">
                        <td className="p-4 md:p-6 font-medium" style={{ color: BRAND_COLOR }}>{row.feature}</td>
                        <td className="p-4 md:p-6 text-center bg-purple-100/20">
                          <div className="flex justify-center items-center">{row.primekey}</div>
                        </td>
                        <td className="p-4 md:p-6 text-center">
                          <div className="flex justify-center items-center">{row.traditional}</div>
                        </td>
                        <td className="p-4 md:p-6 text-center">
                          <div className="flex justify-center items-center">{row.selfListed}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SPLIT SECTION: Dedicated Manager */}
            <div className="section-anim opacity-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white/60 order-2 lg:order-1">
                <Image
                  src="/assets/relationship-manager.jpg"
                  alt="Primekey Homes relationship manager reviewing property listing with owner"
                  width={640}
                  height={480}
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
              
              <div className="space-y-6 order-1 lg:order-2">
                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a]">
                  Built for landlords
                </p>
                <h3 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: BRAND_COLOR }}>
                  Your dedicated manager handles everything
                </h3>
                <p className="text-lg text-[#4a607a] font-body leading-relaxed">
                  From professional photography and pricing strategy to buyer screening and legal documentation — your Primekey Homes manager is your single point of contact throughout the entire process.
                </p>
                <ul className="space-y-3 font-body text-[#22376e]" role="list">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Professional photos & virtual tours included</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Pricing strategy based on real market data</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>All viewings scheduled & accompanied</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Agreement drafting to Governor's consent</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Post-sale support for 90 days</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────
            HOW IT WORKS
            ────────────────────────────────────────────────────────────── */}
        <section className="landlord-section py-16 md:py-24 bg-white relative overflow-hidden" aria-labelledby="how-it-works-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <header className="section-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
                Simple Process
              </p>
              <h2 id="how-it-works-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
                From listing to closed deal in 4 steps
              </h2>
              <p className="text-lg text-[#4a607a] font-body leading-relaxed">
                We've streamlined the entire property transaction process for Nigerian landlords.
              </p>
            </header>

            <div className="section-anim opacity-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: 1, icon: <Sparkles className="w-7 h-7" />, title: 'List Your Property', desc: 'Free registration. Add photos, details, and pricing. Your manager reviews and optimizes the listing.' },
                { step: 2, icon: <Target className="w-7 h-7" />, title: 'Verified Leads', desc: 'Receive inquiries only from identity-verified buyers/tenants. No spam, no tire-kickers.' },
                { step: 3, icon: <Users className="w-7 h-7" />, title: 'Viewings & Offers', desc: 'Your manager schedules and accompanies all viewings. Negotiate directly through the platform.' },
                { step: 4, icon: <Key className="w-7 h-7" />, title: 'Close & Handover', desc: 'Legal docs, Governor\'s consent, and fund transfer handled end-to-end. Keys exchanged.' },
              ].map((item) => (
                <article key={item.step} className="relative bg-[#f3f0ff]/60 p-8 rounded-2xl border border-purple-100">
                  <div className="absolute -top-4 left-8 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xl font-heading" style={{ backgroundColor: BRAND_COLOR }}>
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                    {item.title}
                  </h3>
                  <p className="text-[#4a607a] font-body leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────
            SOCIAL PROOF / TESTIMONIALS
            ────────────────────────────────────────────────────────────── */}
        <section className="landlord-section py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="testimonials-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <header className="section-anim opacity-0 text-center max-w-3xl mx-auto mb-16">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
                Trusted by Landlords
              </p>
              <h2 id="testimonials-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight" style={{ color: BRAND_COLOR }}>
                Real owners. Real results.
              </h2>
            </header>

            <div className="section-anim opacity-0 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  name: 'Mrs. Funmi Adebayo', 
                  location: 'Ikoyi, Lagos', 
                  property: '4-bed detached duplex',
                  result: 'Sold in 11 days for ₦380M',
                  quote: 'Primekey handled everything — from professional photos to the Governor\'s consent. I never had to chase anyone. Best decision I made.'
                },
                { 
                  name: 'Alh. Musa Ibrahim', 
                  location: 'Maitama, Abuja', 
                  property: '3-bed serviced flat',
                  result: 'Rented in 6 days',
                  quote: 'The verified leads feature saved me so much time. Every person who viewed my flat was pre-qualified. My manager was available 24/7.'
                },
                { 
                  name: 'Mr. Chukwudi Okonkwo', 
                  location: 'GRA, Port Harcourt', 
                  property: '5-bed luxury duplex',
                  result: 'Closed in 14 days for ₦220M',
                  quote: 'I listed with two agents before with zero results. Primekey\'s targeted exposure brought serious buyers in week one. Zero stress.'
                },
              ].map((testimonial, index) => (
                <article key={index} className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-purple-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-amber-500">★★★★★</span>
                  </div>
                  <p className="text-[#4a607a] font-body leading-relaxed mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="border-t border-purple-100 pt-4">
                    <p className="font-bold font-heading text-sm" style={{ color: BRAND_COLOR }}>
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-[#4a607a] font-body">{testimonial.location}</p>
                    <p className="text-xs text-[#4a607a] font-body mt-1">
                      {testimonial.property} • {testimonial.result}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────
            FINAL CTA
            ────────────────────────────────────────────────────────────── */}
        <section className="landlord-section py-16 md:py-24 bg-[#04164a] relative overflow-hidden" aria-labelledby="final-cta-heading">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" 
            aria-hidden="true"
          />
          
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <header className="section-anim opacity-0 mb-8">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-purple-200 mb-3">
                Ready to list?
              </p>
              <h2 id="final-cta-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight text-white">
                Join 1,200+ landlords closing deals faster
              </h2>
              <p className="text-lg text-purple-100 font-body leading-relaxed mb-8">
                Free to list. Zero brokerage. Full legal support. Your property deserves the Primekey advantage.
              </p>
            </header>
            
            <div className="section-anim opacity-0 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/landlord/register" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-[#04164a] font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:bg-purple-100"
                style={{ backgroundColor: '#f3f0ff' }}
              >
                List your property free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              
              <Link 
                href="/landlord/inspection-booking" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 hover:border-white font-semibold font-heading text-sm transition-all duration-200 text-white"
              >
                Book an inspection
              </Link>
            </div>
            
            <p className="section-anim opacity-0 mt-10 text-sm text-purple-200 font-body">
              Questions? <Link href="/contact" className="underline hover:text-white transition-colors">Contact our team</Link> — we're here to help.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}