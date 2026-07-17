'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid Nigerian phone number.' }),
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Form submitted:', values);
    // TODO: Integrate with backend API in Unit 1.10
  }

  return (
    <section className="py-16 md:py-24 bg-[var(--bg-base)]" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-6">
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
            <ul className="space-y-3 text-[var(--text-secondary)] font-[var(--font-body)]">
              <li className="flex items-center gap-2">
                <span className="text-[var(--state-success)]">✓</span> Free consultation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--state-success)]">✓</span> No obligation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--state-success)]">✓</span> Cancel anytime
              </li>
            </ul>
          </div>

          {/* Right Form */}
          <div className="bg-[var(--bg-surface)] p-8 rounded-xl shadow-[var(--shadow-elevated)] border border-[var(--border-default)]">
            <h3 className="text-2xl font-semibold text-[var(--primary-deep)] font-[var(--font-heading)] mb-6">
              Request a free callback
            </h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} className="h-12 text-base font-[var(--font-body)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Phone number (e.g., 0801 234 5678)" {...field} className="h-12 text-base font-[var(--font-body)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interest"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base font-[var(--font-body)]">
                            <SelectValue placeholder="I'm interested in..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="buy">Buying a property</SelectItem>
                          <SelectItem value="rent">Renting a property</SelectItem>
                          <SelectItem value="sell">Selling my property</SelectItem>
                          <SelectItem value="landlord">Partnering as a Landlord</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold bg-[var(--gradient-cta)] hover:opacity-90 text-white transition-opacity font-[var(--font-body)]"
                >
                  Request my free callback
                </Button>
              </form>
            </Form>
            
            <p className="mt-4 text-sm text-[var(--text-muted)] text-center font-[var(--font-body)]">
              🔥 Only a few consultation slots left this week.
            </p>
            
            <ul className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-[var(--text-muted)] font-[var(--font-body)]">
              <li className="flex items-center gap-1"> 256-bit SSL</li>
              <li className="flex items-center gap-1">✓ Verified by Primekey</li>
              <li className="flex items-center gap-1">★ 4.8/5 rating</li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}