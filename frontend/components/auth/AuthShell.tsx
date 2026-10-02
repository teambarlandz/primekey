'use client';

import React from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SiteNav from '@/components/SiteNav';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

const BRAND_COLOR = '#04164a';

export interface AuthTrustItem {
  icon: React.ReactNode;
  label: string;
}

export interface AuthShellProps {
  /** Accessible name for the page, e.g. "Sign in". */
  title: string;
  /** Announced by screen readers and used for the document title suffix. */
  portalLabel: string;
  /** Compact marketing line shown under the brand mark on large screens. */
  eyebrow: string;
  headline: React.ReactNode;
  blurb: string;
  trustItems: AuthTrustItem[];
  stats: { value: string; label: string }[];
  testimonial: {
    quote: string;
    name: string;
    role: string;
    avatar?: string;
    initials?: string;
  };
  /** Which panel the form lives in, used for the skip link target. */
  regionLabel: string;
  children: React.ReactNode;
}

/**
 * Shared shell for the two sign-in pages.
 *
 * Layout notes, per current auth-page guidance:
 *  - Single-column is the default and the only layout below `xl`. The split
 *    marketing panel is decorative, so it disappears on phones and tablets
 *    instead of stacking, rather than pushing the form below the fold.
 *  - The two regions are explicitly separated so the form is never mixed with
 *    marketing copy. Users reliably miss secondary actions placed in the
 *    marketing panel, so every link here sits with the form.
 *  - SiteNav is always rendered. Without it a visitor who lands directly on a
 *    sign-in link has no way back to the rest of the site. It supplies the
 *    brand mark, so this shell does not repeat one in the form column.
 *  - On `xl` and up the form column is sticky. The marketing panel is taller
 *    than the viewport, so without this the form scrolls out of view and the
 *    page reads as two independent columns rather than one task. `top-24` clears
 *    the nav, and `self-start` is required for a sticky flex item to stick
 *    rather than stretch.
 *  - Both columns begin at the same top edge, so the card aligns with the
 *    headline instead of sitting in the middle of the viewport.
 *  - A skip link lets keyboard users reach the form immediately.
 */
export default function AuthShell({
  title,
  portalLabel,
  eyebrow,
  headline,
  blurb,
  trustItems,
  stats,
  testimonial,
  regionLabel,
  children,
}: AuthShellProps) {
  useGSAP(() => {
    // Matches the homepage Hero: a staggered fade-up, skipped entirely when the
    // visitor prefers reduced motion. Every animated node carries a static
    // `opacity-0` in the markup, so the reduced-motion branch must set opacity
    // back to 1 or the page renders blank.
    if (prefersReducedMotion()) {
      gsap.set('.auth-anim', { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.auth-anim',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: ANIMATION_TOKENS.stagger,
          duration: ANIMATION_TOKENS.duration,
          ease: ANIMATION_TOKENS.ease,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-dvh bg-[#f3f0ff]">
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:inline-flex focus:h-11 focus:items-center focus:rounded-lg focus:bg-white focus:px-4 focus:font-semibold focus:shadow-lg"
      >
        Skip to {regionLabel}
      </a>

      <SiteNav />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:flex-row xl:items-start xl:gap-12">
        {/* Marketing panel. Decorative, so it is hidden below xl rather than
            stacked - a stacked hero pushes the form off the first screen. */}
        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden rounded-3xl border border-purple-100 bg-white/60 p-8 xl:flex xl:w-[42%] xl:flex-col xl:justify-start xl:p-10 2xl:w-[40%]"
        >
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-10">
            <div className="auth-anim opacity-0 inline-flex w-fit items-center gap-2 rounded-full border border-purple-200/60 bg-purple-100/80 px-3.5 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#04164a]" />
              <p
                className="font-heading text-xs font-semibold uppercase tracking-wider"
                style={{ color: BRAND_COLOR }}
              >
                {eyebrow}
              </p>
            </div>

            <div className="auth-anim opacity-0 space-y-4">
              <h1
                className="font-heading text-4xl font-bold leading-[1.15] tracking-tight lg:text-[2.75rem]"
                style={{ color: BRAND_COLOR }}
              >
                {headline}
              </h1>
              <p className="max-w-lg font-body text-lg leading-relaxed text-[#4a607a]">{blurb}</p>
            </div>

            <ul className="auth-anim opacity-0 space-y-3.5" role="list">
              {trustItems.map((item) => (
                <li key={item.label} className="flex items-center gap-3.5 font-body" style={{ color: BRAND_COLOR }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-white shadow-sm">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            <dl className="auth-anim opacity-0 grid grid-cols-3 gap-4 border-t border-purple-200/60 pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span
                      className="block font-heading text-2xl font-bold lg:text-3xl"
                      style={{ color: BRAND_COLOR }}
                    >
                      {stat.value}
                    </span>
                    <span className="mt-1 block font-body text-xs text-[#4a607a]">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="auth-anim opacity-0 relative z-10 mt-10 max-w-md rounded-2xl border border-purple-100 bg-white/90 p-6 shadow-md backdrop-blur-sm">
            <div className="mb-4 flex gap-1 text-amber-400" aria-label="Rated 5 out of 5">
              {[...Array(5)].map((_, i) => (
                <span key={i} aria-hidden="true" className="text-amber-400">
                  &#9733;
                </span>
              ))}
            </div>
            <blockquote className="pl-4 font-body text-sm italic leading-relaxed" style={{ color: BRAND_COLOR }}>
              {testimonial.quote}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3.5 border-t border-purple-100 pt-5">
              {testimonial.avatar ? (
                <Image
                  src={testimonial.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full font-heading text-sm font-bold text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                  aria-hidden="true"
                >
                  {testimonial.initials}
                </div>
              )}
              <div>
                <p className="font-heading text-sm font-semibold" style={{ color: BRAND_COLOR }}>
                  {testimonial.name}
                </p>
                <p className="font-body text-xs text-[#4a607a]">{testimonial.role}</p>
              </div>
            </figcaption>
          </figure>
        </aside>

        {/* Form region. The only column below xl.

            `items-start` on the row means each column is its own height and both
            begin at the same top edge, so the card lines up with the headline
            instead of floating in the middle of the viewport.

            On xl the marketing panel is taller than the viewport, so this column
            sticks below the nav instead of scrolling away. `top-24` clears the
            80px (h-20) sticky nav, and `self-start` is required for a sticky
            flex item to stick rather than stretch. `xl:pt-10` matches the aside's
            own padding so the two columns line up exactly. */}
        <main className="flex flex-1 flex-col items-start pb-4 xl:sticky xl:top-24 xl:self-start xl:pt-10">
          <header className="auth-anim opacity-0 mb-6 flex w-full flex-col gap-5">
            {/* No logo here on purpose: SiteNav above already carries the brand
                mark and the link home, and this column now starts at the same
                top edge as the marketing panel's eyebrow pill. */}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-purple-200/60 bg-purple-100/80 px-3 py-1 font-heading text-xs font-semibold" style={{ color: BRAND_COLOR }}>
              {portalLabel}
            </span>

            {/* Stacked above the card so the form has a heading on small
                screens, where the marketing panel is not rendered. */}
            <div className="space-y-2 xl:hidden">
              <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight" style={{ color: BRAND_COLOR }}>
                {title}
              </h1>
              <p className="font-body text-[15px] leading-relaxed text-[#4a607a]">{blurb}</p>
            </div>
          </header>

          {/* `scroll-mt` clears the sticky nav when the skip link targets this node.
            The child already constrains itself to max-w-md and centres via mx-auto. */}
          <div id="auth-form" className="auth-anim opacity-0 w-full scroll-mt-24">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}