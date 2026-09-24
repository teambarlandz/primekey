'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, Lock } from 'lucide-react';
import { COMPANY } from '@/lib/companyInfo';

// Exact Brand Navy
const BRAND_COLOR = '#04164a';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-[#f3f0ff] border-t border-purple-200/80 pt-16 pb-8 font-body text-[#4a607a]" 
      role="contentinfo"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ──────────────────────────────────────────────────────────────
            3-COLUMN GRID LAYOUT (Matches .md Wireframe)
            ────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-12">
          
          {/* ──────────────────────────────────────────────────────────────
              COLUMN 1: BRAND + CONTACT & SOCIALS
              ────────────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <Link href="/" aria-label="Primekey Homes home" className="flex items-center gap-3 group">
              <Image 
                src="/assets/logo.svg" 
                alt="Primekey Logo Icon"
                width={214}
                height={111}
                className="w-9 h-auto"
                priority
              />
              <span 
                className="font-heading text-2xl font-bold tracking-tight"
                style={{ color: BRAND_COLOR }}
              >
                Primekey
              </span>
            </Link>
            
            <p className="text-sm leading-relaxed max-w-xs text-[#4a607a]">
              Your trusted partner in Nigerian real estate — buying, renting, and managing properties with confidence.
            </p>
            
            <address className="not-italic space-y-3 text-sm text-[#22376e]">
              <a 
                href="tel:+2349017368499" 
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" style={{ color: BRAND_COLOR }} />
                <span>+234 901 736 8499</span>
              </a>
              <a 
                href="https://wa.me/2349017368499" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                <span className="font-semibold text-emerald-800">WhatsApp Us</span>
              </a>
              <a 
                href="mailto:hello@primekeyhomesandpropertiesltd.com" 
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" style={{ color: BRAND_COLOR }} />
                <span>hello@primekeyhomesandpropertiesltd.com</span>
              </a>
              <div className="flex items-start gap-3 text-[#4a607a]">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" style={{ color: BRAND_COLOR }} />
                <span>{COMPANY.headOffice.full}</span>
              </div>
              <div className="flex items-start gap-3 text-[#4a607a]">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" style={{ color: BRAND_COLOR }} />
                <span>{COMPANY.lagosOffice.full}</span>
              </div>
            </address>

            {/* Social Icons */}
            <ul className="flex gap-4 pt-2" role="list" aria-label="Social media links">
              <li>
                <a 
                  href="#" 
                  aria-label="Facebook" 
                  className="w-9 h-9 rounded-full bg-white/80 border border-purple-200/60 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                  style={{ color: BRAND_COLOR }}
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  aria-label="Instagram" 
                  className="w-9 h-9 rounded-full bg-white/80 border border-purple-200/60 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                  style={{ color: BRAND_COLOR }}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  aria-label="LinkedIn" 
                  className="w-9 h-9 rounded-full bg-white/80 border border-purple-200/60 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                  style={{ color: BRAND_COLOR }}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  aria-label="Twitter / X" 
                  className="w-9 h-9 rounded-full bg-white/80 border border-purple-200/60 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                  style={{ color: BRAND_COLOR }}
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>

          {/* ──────────────────────────────────────────────────────────────
              COLUMN 2: QUICK NAVIGATION
              ────────────────────────────────────────────────────────────── */}
          <nav className="space-y-6" aria-label="Footer navigation">
            <h4 
              className="text-base font-bold font-heading uppercase tracking-wider"
              style={{ color: BRAND_COLOR }}
            >
              Quick Navigation
            </h4>
            <ul className="space-y-3 text-sm font-body" role="list">
              <li>
                <Link href="/search" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  Buy / Rent a Property
                </Link>
              </li>
              <li>
                <Link href="/landlord" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  List a Property
                </Link>
              </li>
              <li>
                <Link href="/account/saved" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  Saved Properties
                </Link>
              </li>
              <li>
                <Link href="/builder" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  For Builders
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* ──────────────────────────────────────────────────────────────
              COLUMN 3: LEGAL & TRUST
              ────────────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <h4 
              className="text-base font-bold font-heading uppercase tracking-wider"
              style={{ color: BRAND_COLOR }}
            >
              Legal & Trust
            </h4>
            <ul className="space-y-3 text-sm font-body" role="list">
              <li>
                <Link href="/privacy" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/ndpr" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  NDPR Compliance Notice
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:underline transition-all" style={{ color: BRAND_COLOR }}>
                  Cookie Policy
                </Link>
              </li>
              <li className="pt-2">
                <Link href="/dashboard/agent/login" className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-purple-200/70 bg-white/70 hover:bg-white transition-colors" style={{ color: BRAND_COLOR }}>
                  <Lock className="w-3 h-3" aria-hidden="true" />
                  Agent Login
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            COPYRIGHT ROW
            ────────────────────────────────────────────────────────────── */}
        <div className="border-t border-purple-200/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-body text-[#4a607a]">
          <p className="text-center md:text-left">
            © {currentYear} Primekey Homes and Properties Ltd. All rights reserved.
          </p>
          <p className="text-center md:text-right">
            RC: 8032716 · Registered in Nigeria
          </p>
        </div>

      </div>
    </footer>
  );
}
