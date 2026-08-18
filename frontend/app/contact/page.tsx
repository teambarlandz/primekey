'use client';

import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SiteNav from '@/components/SiteNav';
import { AlertCircle, CheckCircle2, Mail, Phone, MessageCircle, MapPin, Building2, Send, ChevronRight } from 'lucide-react';
import { submitContactForm } from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().refine(
    (val) => /^(?:\+?234|0)[789][01]\d{8}$/.test(val.replace(/[\s\-\(\)]/g, '')),
    'Please enter a valid Nigerian phone number'
  ),
  subject: z.enum(['general', 'sales', 'support', 'landlord', 'partnership', 'legal', 'other'], {
    errorMap: () => ({ message: 'Please select a subject' }),
  }),
  message: z.string().trim().min(20, 'Message must be at least 20 characters').max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: 'general',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');
    try {
      await submitContactForm({
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        subject: values.subject,
        message: values.message,
      });
      setSubmitStatus('success');
      setSubmitMessage('Thank you for reaching out! We\'ll get back to you within 24 hours.');
      form.reset();
    } catch (err: any) {
      setSubmitStatus('error');
      setSubmitMessage(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-anim', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f0ff] py-16 px-4">
      <SiteNav />

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-body mb-12">
          <Link href="/" className="hover:text-[#04164a] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 font-medium">Contact</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12 contact-anim opacity-0">
          <div className="w-16 h-16 rounded-2xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-4" style={{ color: BRAND_COLOR }}>
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Our team typically responds within 24 hours during business days.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="contact-anim opacity-0">
            <div className="bg-white/90 backdrop-blur-sm border-purple-100 shadow-xl rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold font-heading mb-6" style={{ color: BRAND_COLOR }}>
                Send us a Message
              </h2>
              <p className="text-slate-600 font-body mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5 font-body">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-[#04164a]">Full Name <span className="text-rose-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20" autoComplete="name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-[#04164a]">Email Address <span className="text-rose-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john@example.com" className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20" autoComplete="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Phone Number <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="08012345678" className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20" autoComplete="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Subject <span className="text-rose-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20" aria-label="Select subject">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-200">
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="sales">Sales & Property Inquiries</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="landlord">Landlord Registration/Inquiry</SelectItem>
                          <SelectItem value="partnership">Partnership & Business Development</SelectItem>
                          <SelectItem value="legal">Legal & Compliance</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#04164a]">Message <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us how we can help you..."
                          className="h-32 border-slate-200 rounded-xl focus:ring-[#04164a]/20 resize-none"
                          rows={6}
                        />
                      </FormControl>
                      <FormDescription>Minimum 20 characters. Maximum 2000 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading h-12 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              </Form>

              {submitStatus === 'success' && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm font-body animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{submitMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-anim opacity-0">
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm border-purple-100 shadow-xl rounded-2xl p-6 sm:p-8 h-full">
                <h2 className="text-2xl font-bold font-heading mb-6" style={{ color: BRAND_COLOR }}>
                  Contact Information
                </h2>
                <p className="text-slate-600 font-body mb-8">
                  We're based in Lagos and serve clients across Nigeria. Reach out through any of the channels below.
                </p>

                <div className="space-y-6">
                  <a href="tel:+2349017368499" className="flex items-center gap-4 p-4 bg-[#f3f0ff]/60 rounded-2xl border border-purple-100 hover:bg-[#f3f0ff] transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] shrink-0 group-hover:bg-[#04164a] group-hover:text-white transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#04164a]">Call Us</p>
                      <p className="text-slate-600 font-body text-sm">+234 901 736 8499</p>
                      <p className="text-xs text-slate-400 font-body">Mon-Fri, 8am-6pm WAT</p>
                    </div>
                  </a>

                  <a href="https://wa.me/2349017368499" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-[#f3f0ff]/60 rounded-2xl border border-purple-100 hover:bg-[#f3f0ff] transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#04164a]">WhatsApp</p>
                      <p className="text-slate-600 font-body text-sm">+234 901 736 8499</p>
                      <p className="text-xs text-slate-400 font-body">Quick response on WhatsApp</p>
                    </div>
                  </a>

                  <a href="mailto:hello@primekeyhomesandpropertiesltd.com" className="flex items-center gap-4 p-4 bg-[#f3f0ff]/60 rounded-2xl border border-purple-100 hover:bg-[#f3f0ff] transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] shrink-0 group-hover:bg-[#04164a] group-hover:text-white transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#04164a]">Email Us</p>
                      <p className="text-slate-600 font-body text-sm">hello@primekeyhomesandpropertiesltd.com</p>
                      <p className="text-xs text-slate-400 font-body">Response within 24 hours</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-4 bg-[#f3f0ff]/60 rounded-2xl border border-purple-100">
                    <div className="w-12 h-12 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#04164a]">Visit Our Office</p>
                      <p className="text-slate-600 font-body text-sm">Victoria Island, Lagos</p>
                      <p className="text-xs text-slate-400 font-body">By appointment only</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="mt-6 contact-anim opacity-0">
              <div className="bg-white/90 backdrop-blur-sm border-purple-100 shadow-xl rounded-2xl p-6">
                <h3 className="text-xl font-bold font-heading mb-4" style={{ color: BRAND_COLOR }}>
                  Office Hours
                </h3>
                <div className="grid grid-cols-2 gap-3 font-body text-slate-600">
                  <div className="flex justify-between py-2 border-b border-purple-100/50">
                    <span>Monday - Friday</span>
                    <span className="font-semibold" style={{ color: BRAND_COLOR }}>8:00 AM - 6:00 PM WAT</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-purple-100/50">
                    <span>Saturday</span>
                    <span className="font-semibold" style={{ color: BRAND_COLOR }}>9:00 AM - 2:00 PM WAT</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-purple-100/50">
                    <span>Sunday</span>
                    <span className="font-semibold text-rose-500">Closed</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Public Holidays</span>
                    <span className="font-semibold text-rose-500">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}