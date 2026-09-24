'use client';

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
import { submitConciergeLead } from '@/lib/api-client';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Exact Brand Navy
const BRAND_COLOR = '#04164a';

// ──────────────────────────────────────────────────────────────
// ZOD SCHEMA (Validation)
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

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Wire to Concierge lead capture (phone-first, NDPR-aware) — no silent mock
    const interestToType: Record<string, string> = {
      buy: 'any',
      rent: 'flat_apartment',
      sell: 'any',
      landlord: 'any',
    };
    try {
      await submitConciergeLead({
        fullName: values.name,
        phone: values.phone,
        email: undefined,
        preferredLocation: 'Lagos',
        propertyType: interestToType[values.interest] ?? 'any',
        budgetMin: 0,
        budgetMax: 500000000,
        bedrooms: 'any',
        ndprConsent: true,
      } as any);
      form.reset();
      alert('Thank you! A Primekey Homes expert will call you shortly.');
    } catch (err: any) {
      alert(err?.message ?? 'Failed to submit. Please try again or contact us.');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GSAP SCROLL ANIMATION
  // ──────────────────────────────────────────────────────────────
  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.cta-anim', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-anim', 
        { y: 35, opacity: 0 }, 
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
    <section className="final-cta py-16 md:py-24 bg-[#f3f0ff] relative overflow-hidden" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* ──────────────────────────────────────────────────────
              LEFT: Value Proposition & Trust Signals
              ────────────────────────────────────────────────────── */}
          <div className="space-y-6 cta-anim opacity-0">
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a]">
              Ready to get started?
            </p>
            <h2 
              id="cta-heading" 
              className="text-4xl md:text-5xl font-bold font-heading leading-tight"
              style={{ color: BRAND_COLOR }}
            >
              Your next home is just a click away.
            </h2>
            <p className="text-lg text-[#4a607a] font-body max-w-md leading-relaxed">
              Join thousands of happy Nigerians. Get a free property consultation from our Primekey Homes experts within 24 hours.
            </p>
            <ul className="space-y-3 text-[#22376e] font-body pt-2" role="list">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" /> 
                <span>Free, no-obligation consultation</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" /> 
                <span>Direct access to verified listings</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" /> 
                <span>Full legal & documentation support</span>
              </li>
            </ul>
          </div>

          {/* ──────────────────────────────────────────────────────
              RIGHT: Form Card
              ────────────────────────────────────────────────────── */}
          <div className="cta-anim opacity-0 bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-xl border border-purple-100">
            <h3 className="text-2xl font-bold font-heading mb-6" style={{ color: BRAND_COLOR }}>
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
                          className="h-12 text-base font-body bg-purple-50/30 border-purple-100 focus-visible:ring-[#04164a] rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage className="text-rose-600 text-sm" />
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
                          className="h-12 text-base font-body bg-purple-50/30 border-purple-100 focus-visible:ring-[#04164a] rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage className="text-rose-600 text-sm" />
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base font-body bg-purple-50/30 border-purple-100 focus:ring-[#04164a] rounded-xl text-[#22376e]">
                            <SelectValue placeholder="I'm interested in..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-purple-100 font-body">
                          <SelectItem value="buy">Buying a property</SelectItem>
                          <SelectItem value="rent">Renting a property</SelectItem>
                          <SelectItem value="sell">Selling my property</SelectItem>
                          <SelectItem value="landlord">Partnering as a Landlord</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-rose-600 text-sm" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold text-white rounded-full transition-all duration-200 hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed font-heading shadow-md hover:shadow-lg"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  {isSubmitting ? 'Requesting...' : 'Request my free callback'}
                </Button>
              </form>
            </Form>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-purple-100">
              <p className="text-xs text-[#4a607a] text-center font-body mb-4 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" /> 
                Your data is secure and NDPR compliant.
              </p>
              <ul className="flex flex-wrap justify-center gap-4 text-xs text-[#4a607a] font-body" role="list">
                <li className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#4a607a]" aria-hidden="true" /> 256-bit SSL
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" /> Verified by Primekey
                </li>
                <li className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-current" aria-hidden="true" /> 4.8/5 rating
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
