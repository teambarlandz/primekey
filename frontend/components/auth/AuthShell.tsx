'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
 *  - `lg:sticky lg:h-screen` was removed: a sticky full-height column beside a
 *    scrolling form desynchronised on short viewports.
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
  return (
    <div className="min-h-dvh bg-[#f3f0ff]">
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-lg focus:bg-white focus:px-4 focus:font-semibold focus:shadow-lg"
      >
        Skip to {regionLabel}
      </a>

      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:py-10 xl:flex-row xl:items-stretch xl:gap-12">
        {/* Marketing panel. Decorative, so it is hidden below xl rather than
            stacked - a stacked hero pushes the form off the first screen. */}
        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden rounded-3xl border border-purple-100 bg-white/60 p-8 xl:flex xl:w-[42%] xl:flex-col xl:justify-between xl:p-10 2xl:w-[40%]"
        >
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-200/60 bg-purple-100/80 px-3.5 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#04164a]" />
              <p
                className="font-heading text-xs font-semibold uppercase tracking-wider"
                style={{ color: BRAND_COLOR }}
              >
                {eyebrow}
              </p>
            </div>

            <div className="space-y-4">
              <h1
                className="font-heading text-4xl font-bold leading-[1.15] tracking-tight lg:text-[2.75rem]"
                style={{ color: BRAND_COLOR }}
              >
                {headline}
              </h1>
              <p className="max-w-lg font-body text-lg leading-relaxed text-[#4a607a]">{blurb}</p>
            </div>

            <ul className="space-y-3.5" role="list">
              {trustItems.map((item) => (
                <li key={item.label} className="flex items-center gap-3.5 font-body" style={{ color: BRAND_COLOR }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-white shadow-sm">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            <dl className="grid grid-cols-3 gap-4 border-t border-purple-200/60 pt-8">
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

          <figure className="relative z-10 mt-10 max-w-md rounded-2xl border border-purple-100 bg-white/90 p-6 shadow-md backdrop-blur-sm">
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

        {/* Form region. The only column below xl. */}
        <main className="flex flex-1 flex-col justify-center xl:py-8">
          <header className="mb-8 flex flex-col gap-6">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-3"
              aria-label="Primekey Homes home"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 shadow-lg">
                <Image
                  src="/assets/logo.svg"
                  alt=""
                  width={214}
                  height={111}
                  className="h-7 w-auto"
                />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight" style={{ color: BRAND_COLOR }}>
                Primekey
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/60 bg-purple-100/80 px-2.5 py-1 font-heading text-[11px] font-semibold" style={{ color: BRAND_COLOR }}>
                {portalLabel}
              </span>
            </Link>

            {/* Stacked above the card so the form has a heading on small
                screens, where the marketing panel is not rendered. */}
            <div className="space-y-2 xl:hidden">
              <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight" style={{ color: BRAND_COLOR }}>
                {title}
              </h1>
              <p className="font-body text-[15px] leading-relaxed text-[#4a607a]">{blurb}</p>
            </div>
          </header>

          <div id="auth-form" className="w-full scroll-mt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}