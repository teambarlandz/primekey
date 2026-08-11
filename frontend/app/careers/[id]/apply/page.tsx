'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import SiteNav from '@/components/SiteNav';
import { fetchJobOpening, submitJobApplication, JobOpeningDetail } from '@/lib/api-client';
import {
  jobApplicationSchema,
  JobApplicationValues,
  mapApplicationValuesToPayload,
} from '@/lib/validations/jobApplicationSchema';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  ChevronRight,
  Home,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Upload,
  ShieldCheck,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const BRAND_COLOR = '#04164a';

export default function JobApplyPage() {
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<JobOpeningDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<JobApplicationValues>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      coverLetter: '',
      ndprConsent: false,
    },
    mode: 'onChange',
  });

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
      gsap.set('.apply-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.apply-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, duration: ANIMATION_TOKENS.duration, ease: ANIMATION_TOKENS.ease }
      );
    });

    return () => ctx.revert();
  }, [loading, submitSuccess]);

  const onSubmit = async (values: JobApplicationValues) => {
    setSubmitting(true);
    setSubmitError('');

    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];

    if (!file) {
      setSubmitError('Please upload your resume (PDF or DOCX).');
      setSubmitting(false);
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError('Resume must be a PDF or DOCX file.');
      setSubmitting(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Resume file size must not exceed 5 MB.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = mapApplicationValuesToPayload(values);
      await submitJobApplication({
        ...payload,
        job_opening: id,
        resume: file,
      });
      setSubmitSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit application. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-[#f3f0ff]">
        <SiteNav />
        <section className="py-20">
          <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/80 p-12 rounded-2xl border border-purple-100 shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold font-heading mb-4" style={{ color: BRAND_COLOR }}>
                Application Submitted
              </h1>
              <p className="text-[#4a607a] font-body mb-8 leading-relaxed">
                Thank you for applying to the <strong>{job?.title}</strong> position.
                We will review your application and get back to you within one week.
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                Back to Careers
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

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
                <li>
                  <Link href={`/careers/${id}`} className="hover:text-[#04164a] transition-colors truncate max-w-[200px]">
                    {job.title}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </li>
                <li className="font-semibold text-[#04164a]">Apply</li>
              </>
            )}
          </ol>
        </div>
      </nav>

      {/* Form Section */}
      <section className="py-12 md:py-20" aria-labelledby="apply-heading">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="text-center py-20">
              <p className="text-sm font-body text-[#4a607a] animate-pulse">Loading…</p>
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
            <>
              <header className="apply-anim opacity-0 mb-8 text-center">
                <h1 id="apply-heading" className="text-3xl sm:text-4xl font-bold font-heading tracking-tight mb-3" style={{ color: BRAND_COLOR }}>
                  Apply for {job.title}
                </h1>
                <p className="text-[#4a607a] font-body">
                  {job.team} &middot; {job.location} &middot; {job.employment_type_display}
                </p>
              </header>

              <div className="apply-anim opacity-0 bg-white/80 p-8 md:p-10 rounded-2xl border border-purple-100 shadow-md">
                {/* NDPR Notice */}
                <div className="p-4 bg-[#f3f0ff]/60 rounded-2xl border border-purple-100 flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#04164a]">NDPR Compliant</p>
                    <p className="text-[11px] text-slate-600 font-body">
                      Your data is protected under Nigerian data privacy laws.
                    </p>
                  </div>
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-body">{submitError}</p>
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5 font-body">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-[#04164a]">
                              First Name <span className="text-rose-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <Input
                                  {...field}
                                  placeholder="John"
                                  className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                                  autoComplete="given-name"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-[#04164a]">
                              Middle Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="(optional)"
                                className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                                autoComplete="additional-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-[#04164a]">
                              Last Name <span className="text-rose-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Doe"
                                className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                                autoComplete="family-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-[#04164a]">
                            Email Address <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="john.doe@email.com"
                                className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                                autoComplete="email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-[#04164a]">
                            Phone Number <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                              <Input
                                {...field}
                                type="tel"
                                placeholder="08012345678"
                                className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20"
                                autoComplete="tel"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Resume Upload */}
                    <div>
                      <label className="text-xs font-semibold text-[#04164a] block mb-2">
                        Resume / CV <span className="text-rose-500">*</span>
                      </label>
                      <div
                        className="relative border-2 border-dashed border-purple-200 rounded-xl p-6 text-center hover:border-[#04164a]/40 transition-colors cursor-pointer bg-[#f3f0ff]/30"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            setFileName(file ? file.name : '');
                          }}
                        />
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        {fileName ? (
                          <p className="text-sm font-body text-[#04164a] font-semibold">{fileName}</p>
                        ) : (
                          <p className="text-sm font-body text-[#4a607a]">
                            Click to upload PDF or DOCX (max 5 MB)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-[#04164a]">
                            Cover Letter
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Tell us why you'd like to join Primekey Homes and what you'd bring to this role…"
                              className="min-h-[120px] border-slate-200 rounded-xl focus:ring-[#04164a]/20 resize-y"
                            />
                          </FormControl>
                          <p className="text-[11px] text-slate-500 font-body">
                            {field.value?.length || 0} / 5,000 characters
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* NDPR Consent */}
                    <FormField
                      control={form.control}
                      name="ndprConsent"
                      render={() => (
                        <FormItem className="flex flex-row items-start gap-3 space-y-0 p-4 bg-[#f3f0ff]/60 rounded-xl border border-purple-100">
                          <FormControl>
                            <Checkbox
                              id="ndprConsent"
                              checked={form.watch('ndprConsent') === true}
                              onCheckedChange={(checked) => form.setValue('ndprConsent', checked === true, { shouldValidate: true, shouldDirty: true })}
                              className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#04164a] data-[state=checked]:border-[#04164a]"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel htmlFor="ndprConsent" className="text-xs font-semibold text-[#04164a] cursor-pointer">
                              I consent to Primekey Homes processing my personal data in accordance with the{' '}
                              <Link href="/privacy" className="underline" target="_blank">
                                Privacy Policy
                              </Link>{' '}
                              and{' '}
                              <Link href="/ndpr" className="underline" target="_blank">
                                NDPR Compliance
                              </Link>.
                              <span className="text-rose-500 ml-1">*</span>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Submit */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 rounded-xl font-heading font-semibold text-sm transition-all duration-200"
                        style={{
                          backgroundColor: BRAND_COLOR,
                          color: '#fff',
                          opacity: submitting ? 0.7 : 1,
                        }}
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Submit Application
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
