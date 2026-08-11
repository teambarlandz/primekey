'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import SiteNav from '@/components/SiteNav';
import { fetchJobOpening, JobOpeningDetail } from '@/lib/api-client';
import {
  ArrowRight,
  ChevronRight,
  Home,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  AlertCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const BRAND_COLOR = '#04164a';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<JobOpeningDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadJob = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await fetchJobOpening(id);
        setJob(result);
      } catch {
        setError(true);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.job-detail-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.job-detail-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, duration: ANIMATION_TOKENS.duration, ease: ANIMATION_TOKENS.ease }
      );
    });

    return () => ctx.revert();
  }, [loading]);

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      <SiteNav />

      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-purple-100" aria-label="Breadcrumb">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3">
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
            <li>
              <Link href="/careers" className="hover:text-[#04164a] transition-colors">
                Careers
              </Link>
            </li>
            {!loading && job && (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </li>
                <li className="font-semibold text-[#04164a] truncate max-w-[200px]">
                  {job.title}
                </li>
              </>
            )}
          </ol>
        </div>
      </nav>

      {/* Content */}
      <section className="py-12 md:py-20" aria-labelledby="job-detail-heading">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="text-center py-20">
              <p className="text-sm font-body text-[#4a607a] animate-pulse">Loading job details…</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
                Position Not Found
              </h2>
              <p className="text-[#4a607a] font-body mb-6 max-w-md mx-auto">
                This job opening may have been filled, removed, or the link may be incorrect.
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                View Open Positions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!loading && !error && job && (
            <article>
              {/* Header */}
              <header className="job-detail-anim opacity-0 mb-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200/60 text-xs font-semibold tracking-wider uppercase font-heading" style={{ color: BRAND_COLOR }}>
                    <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                    {job.employment_type_display}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-body text-[#4a607a]">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    Posted {new Date(job.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <h1 id="job-detail-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading tracking-tight mb-4" style={{ color: BRAND_COLOR }}>
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm font-body text-[#4a607a]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    {job.employment_type_display}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" aria-hidden="true" />
                    {job.team}
                  </span>
                </div>
              </header>

              {/* Job ID */}
              <div className="job-detail-anim opacity-0 mb-8 p-4 bg-white/60 rounded-2xl border border-purple-100">
                <p className="text-xs font-body text-[#4a607a]">
                  <span className="font-semibold text-[#04164a]">Job ID:</span>{' '}
                  <code className="font-mono text-xs bg-purple-50 px-2 py-0.5 rounded">{job.id}</code>
                </p>
              </div>

              {/* Description */}
              <div className="job-detail-anim opacity-0 mb-10">
                <h2 className="text-xl font-bold font-heading mb-4" style={{ color: BRAND_COLOR }}>
                  Job Description
                </h2>
                <div className="bg-white/80 p-8 rounded-2xl border border-purple-100">
                  {job.summary ? (
                    <div className="prose prose-slate max-w-none font-body text-sm leading-relaxed text-[#4a607a] whitespace-pre-line">
                      {job.summary}
                    </div>
                  ) : (
                    <p className="text-sm font-body text-[#4a607a] italic">
                      Full job description will be provided during the interview process.
                    </p>
                  )}
                </div>
              </div>

              {/* Apply CTA */}
              <div className="job-detail-anim opacity-0 text-center">
                <Link
                  href={`/careers/${id}/apply`}
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-white font-semibold font-heading text-base transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95 transform hover:-translate-y-0.5"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Apply for This Position
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="mt-4 text-xs font-body text-[#4a607a]">
                  Or email your CV to{' '}
                  <a href={`mailto:${job.application_email}`} className="font-semibold underline" style={{ color: BRAND_COLOR }}>
                    {job.application_email}
                  </a>
                </p>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
