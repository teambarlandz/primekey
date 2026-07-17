import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-[var(--primary-deep)] text-[var(--primary-light)] pt-16 pb-8 font-[var(--font-body)]" 
      role="contentinfo"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-12">
          
          {/* ──────────────────────────────────────────────────────────────
              COLUMN 1: BRAND + DIRECT CONTACT
              ────────────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <Link href="/" aria-label="Primekey Homes home" className="inline-block">
              <Image
                src="/assets/logo.png"
                alt="Primekey Homes and Properties Ltd."
                width={140}
                height={40}
                // brightness-0 invert ensures the logo is visible on the dark background
                className="h-10 w-auto brightness-0 invert" 
              />
            </Link>
            
            <p className="text-sm leading-relaxed max-w-xs">
              Your trusted partner in Nigerian real estate — buying, renting, and managing properties with confidence.
            </p>
            
            <address className="not-italic space-y-3 text-sm">
              <a 
                href="tel:+2348000000000" 
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>+234 800 000 0000</span>
              </a>
              <a 
                href="https://wa.me/2348000000000" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[var(--state-success)] flex-shrink-0" aria-hidden="true" />
                <span>WhatsApp Us</span>
              </a>
              <a 
                href="mailto:hello@primekeyhomes.com" 
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>hello@primekeyhomes.com</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>Lagos, Nigeria</span>
              </div>
            </address>

            {/* Social Icons */}
            <ul className="flex gap-4 pt-2" role="list" aria-label="Social media">
              <li>
                <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </li>
              <li>
                <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </li>
              <li>
                <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </li>
              <li>
                <a href="#" aria-label="Twitter / X" className="hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>

          {/* ──────────────────────────────────────────────────────────────
              COLUMN 2: QUICK NAVIGATION
              ────────────────────────────────────────────────────────────── */}
          <nav className="space-y-6" aria-label="Footer navigation">
            <h4 className="text-lg font-semibold text-white font-[var(--font-heading)]">
              Explore
            </h4>
            <ul className="space-y-3 text-sm" role="list">
              <li><Link href="/search" className="hover:text-white transition-colors">Buy / Rent a Property</Link></li>
              <li><Link href="/landlord" className="hover:text-white transition-colors">List a Property</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </nav>

          {/* ──────────────────────────────────────────────────────────────
              COLUMN 3: LEGAL & TRUST
              ────────────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white font-[var(--font-heading)]">
              Legal & Compliance
            </h4>
            <ul className="space-y-3 text-sm" role="list">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/ndpr" className="hover:text-white transition-colors">NDPR Compliance</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            COPYRIGHT ROW
            ────────────────────────────────────────────────────────────── */}
        <div className="border-t border-[var(--primary-medium)]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--primary-light)]/80">
          <p className="text-center md:text-left">
            © {currentYear} Primekey Homes and Properties Ltd. All rights reserved.
          </p>
          <p className="text-center md:text-right">
            RC: 0000000 · Registered in Nigeria
          </p>
        </div>

      </div>
    </footer>
  );
}