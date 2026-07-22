# UI & Frontend Design Context

This document defines the user interface and design system for Primekey Homes and Properties Ltd. It serves as the single source of truth for color tokens, typography, component behaviors, and interactive patterns across all pages and modules.

---

## 🎨 Color System & Tokens

Our palette reflects authority, trust, and Nigerian real estate elegance.

### CSS Custom Properties (`globals.css`)
```css
@layer base {
  :root {
    --background: 257 60% 97%; /* #f3f0ff - Soft Lavender */
    --foreground: 226 90% 15%; /* #04164a - Exact Brand Navy */

    --card: 0 0% 100%;
    --card-foreground: 226 90% 15%;

    --popover: 0 0% 100%;
    --popover-foreground: 226 90% 15%;

    --primary: 226 90% 15%; /* #04164a - Brand Navy */
    --primary-foreground: 0 0% 100%;

    --secondary: 257 40% 93%;
    --secondary-foreground: 226 90% 15%;

    --muted: 257 30% 92%;
    --muted-foreground: 226 20% 40%;

    --accent: 257 50% 90%;
    --accent-foreground: 226 90% 15%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 226 20% 85%;
    --input: 226 20% 85%;
    --ring: 226 90% 15%;

    --radius: 0.75rem;
  }
}```


## Typography Application Example

// Heading Component
<h1 className="font-heading text-4xl md:text-6xl font-bold text-[#04164a] leading-tight">
  Find Your Dream Home in Nigeria
</h1>

// Body Component
<p className="font-body text-base md:text-lg text-slate-700 leading-relaxed">
  Premium real estate concierge services tailored across Lagos, Abuja, and Port Harcourt.
</p>

---

## Components Directory Structure

built with shadcn/ui primitives powered by Tailwind CSS and Radix UI.

components/
├── ui/                   # Base unstyled primitives (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── form.tsx
│   ├── badge.tsx
│   ├── slider.tsx
│   ├── dialog.tsx
│   └── sheet.tsx
├── Navbar.tsx            # Sticky navigation header
├── Hero.tsx              # Main homepage hero
├── SocialProof.tsx       # Metrics & trust signals
├── Benefits.tsx          # Key value propositions
├── FAQ.tsx               # Frequently asked questions accordion
├── FinalCTA.tsx          # Lead capture form with Zod & react-hook-form
├── Footer.tsx            # Site footer & contact details
└── FloatingContact.tsx   # Sticky Quick Action button (WhatsApp/Phone)


## Animation Systems 

Animation System (GSAP)
​Animations rely on @gsap/react useGSAP hook paired with gsap/ScrollTrigger. All animations must incorporate accessibility checks using prefersReducedMotion.

Standard Animation Helper Pattern (lib/animations.ts)

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const animateFadeUp = (target: string | Element, delay = 0) => {
  if (prefersReducedMotion()) return;
  
  gsap.from(target, {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay,
    ease: "power3.out",
    scrollTrigger: {
      trigger: target,
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
};


## Form Validation Standards
​All client-side forms (such as FinalCTA.tsx and upcoming searchSchema.ts) must enforce standard schemas using zod and react-hook-form connected to shadcn/ui Form components.


### Form Input Pattern Example

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const phoneRegex = /^(\+234|0)[789][01]\d{8}$/; // Nigerian Phone Format Validation

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(phoneRegex, "Please enter a valid Nigerian phone number"),
});

export function SampleForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField control="{form.control}" field name="fullName" render="{({"> (
            <FormItem>
              <FormLabel className="font-body text-[#04164a]">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chukwuma Adebayo" {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}


### Localization & Design Guidelines (Nigeria)
​Currency: Always use Naira symbol (₦) or standard ISO code (NGN). Format large numbers with comma separators (e.g., ₦150,000,000 or ₦150M).
​Locations: Default locations should highlight key Nigerian real estate hubs (e.g., Lekki Phase 1, Ikoyi, Victoria Island, Ikeja GRA, Maitama, Wuse II, Port Harcourt GRA).
​Contact Defaults: Phone input placeholders should suggest local formats (08012345678 or +234...).