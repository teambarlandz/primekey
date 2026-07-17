'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ──────────────────────────────────────────────────────────────
// ZOD SCHEMA (Bulletproof Validation)
// ──────────────────────────────────────────────────────────────
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name is too long.' }),
  phone: z
    .string()
    .min(10, { message: 'Please enter a valid Nigerian phone number.' })
    .regex(
      /^(?:\+234|0)[789][01]\d{8}$/, 
      { message: 'Please enter a valid Nigerian number (e.g., 0801 234 5678 or +2348012345678).' }
    ),
  interest: z.string({ required_error: 'Please select an interest.' }),
});

export default function FinalCTA() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      interest: '',
    },
  });

  // Extract isSubmitting to disable button during API call
  const { isSubmitting } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Integrate with backend API in Unit 1.10
    console.log('Form submitted:', values);
    
    // Simulate API call for UX demonstration
    setTimeout(() => {
      form.reset();
      alert('Thank you! A Primekey Homes expert will call you shortly.');
    }, 1500);
  }

  // ─────────────────────────────────────────────────────────────
  // GSAP SCROLL ANIMATION
  // ──────────────────────────────────────────────────────────────
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-anim', 
        { y: 30, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: ANIMATION_TOKENS.duration, 
          stagger: 0.15, 
          ease: ANIMATION_TOKENS.ease,
          scrollTrigger: {
            trigger: '.final-cta',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="final-cta py-16 md:py-24 bg-[var(--bg-base)]" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* ──────────────────────────────────────────────────────
              LEFT: Value Proposition & Trust Signals
              ────────────────────────────────────────────────────── */}
          <div className="space-y-6 cta-anim">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--primary-medium)] font-[var(--font-body)]">
              Ready to get started?
            </p>
            <h2 
              id="cta-heading" 
              className="text-4xl md:text-5xl font-bold text-[var(--primary-deep)] font-[var(--font-heading)] leading-tight"
            >
              Your next home is just a click away.
            </h2>
            <p className="text-lg text-[var(--text-secondary)] font-[var(--font-body)] max-w-md">
              Join thousands of happy Nigerians. Get a free property consultation from our Primekey Homes experts within 24 hours.
            </p>
            <ul className="space-y-3 text-[var(--text-secondary)] font-[var(--font-body)] pt-2">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[var(--state-success)] flex-shrink-0" aria-hidden="true" /> 
                <span>Free, no-obligation consultation</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[var(--state-success)] flex-shrink-0" aria-hidden="true" /> 
                <span>Direct access to verified listings</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[var(--state-success)] flex-shrink-0" aria-hidden="true" /> 
                <span>Full legal & documentation support</span>
              </li>
            </ul>
          </div>

          {/* ──────────────────────────────────────────────────────
              RIGHT: shadcn/ui Form
              ────────────────────────────────────────────────────── */}
          <div className="cta-anim bg-[var(--bg-surface)] p-8 md:p-10 rounded-xl shadow-[var(--shadow-elevated)] border border-[var(--border-default)]">
            <h3 className="text-2xl font-semibold text-[var(--primary-deep)] font-[var(--font-heading)] mb-6">
              Request a free callback
            </h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Your full name" 
                          {...field} 
                          className="h-12 text-base font-[var(--font-body)] bg-[var(--bg-surface)] border-[var(--border-default)] focus-visible:ring-[var(--border-focus)]" 
                        />
                      </FormControl>
                      <FormMessage className="text-[var(--state-error)] text-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Phone number (e.g., 0801 234 5678)" 
                          {...field} 
                          className="h-12 text-base font-[var(--font-body)] bg-[var(--bg-surface)] border-[var(--border-default)] focus-visible:ring-[var(--border-focus)]" 
                        />
                      </FormControl>
                      <FormMessage className="text-[var(--state-error)] text-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interest"
                  render={({ field }) => (
                    <FormItem>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} // Controlled value for bulletproof RHF sync
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base font-[var(--font-body)] bg-[var(--bg-surface)] border-[var(--border-default)] focus:ring-[var(--border-focus)]">
                            <SelectValue placeholder="I'm interested in..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[var(--bg-surface)] border-[var(--border-default)]">
                          <SelectItem value="buy">Buying a property</SelectItem>
                          <SelectItem value="rent">Renting a property</SelectItem>
                          <SelectItem value="sell">Selling my property</SelectItem>
                          <SelectItem value="landlord">Partnering as a Landlord</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[var(--state-error)] text-sm" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-semibold bg-[var(--gradient-cta)] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed text-white transition-opacity font-[var(--font-body)] shadow-[var(--shadow-default)]"
                >
                  {isSubmitting ? 'Requesting...' : 'Request my free callback'}
                </Button>
              </form>
            </Form>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-muted)] text-center font-[var(--font-body)] mb-4 flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" aria-hidden="true" /> 
                Your data is secure and NDPR compliant.
              </p>
              <ul className="flex flex-wrap justify-center gap-4 text-xs text-[var(--text-muted)] font-[var(--font-body)]">
                <li className="flex items-center gap-1">
                  <Lock className="w-3 h-3" aria-hidden="true" /> 256-bit SSL
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-[var(--state-success)]" aria-hidden="true" /> Verified by Primekey
                </li>
                <li className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-[var(--state-warning)] fill-current" aria-hidden="true" /> 4.8/5 rating
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}