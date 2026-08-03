'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { NavDropdown, NavDropdownItem } from './NavDropdown';
import { ChevronDown } from 'lucide-react';

// Deep Navy color from logo SVG
const BRAND_COLOR = '#04164a';

const LIST_PROPERTY_LINKS: NavDropdownItem[] = [
  { label: 'Register as Landlord', href: '/landlord/register', description: 'Free, NDPR-compliant registration' },
  { label: 'Add a Property', href: '/landlord/intake', description: 'Submit your listing details' },
  { label: 'Book an Inspection', href: '/landlord/inspection-booking', description: 'Schedule a consultation' },
  { label: 'My Dashboard', href: '/landlord/dashboard', description: 'Manage listings & appointments' },
];

const COMPANY_LINKS: NavDropdownItem[] = [
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileMenuOpen(false);
    setMobileGroup(null);
  };

  const renderMobileGroup = (label: string, links: NavDropdownItem[]) => {
    const expanded = mobileGroup === label;
    return (
      <li>
        <button
          type="button"
          onClick={() => setMobileGroup(expanded ? null : label)}
          className="flex items-center justify-between w-full opacity-80"
          style={{ color: BRAND_COLOR }}
          aria-expanded={expanded}
        >
          {label}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <ul className="pl-4 mt-2 space-y-2 border-l-2 border-purple-200/60">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block opacity-80 text-sm" style={{ color: BRAND_COLOR }} onClick={closeMobile}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    // Lavender semi-transparent background with blur (#f3f0ff = soft lavender)
    <header className="sticky top-0 z-50 w-full bg-[#f3f0ff]/85 backdrop-blur-md border-b border-purple-100/60 py-4 sm:py-5 transition-all" role="banner">
      <nav 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" 
        aria-label="Primary"
      >
        {/* ──────────────────────────────────────────────────────────────
            LEFT: Clean Logo (No white badge) + Brand Name (Poppins Bold)
            ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Primekey Homes home">
            {/* Logo image sitting cleanly on the navbar */}
            <Image 
              src="/assets/logo.svg" 
              alt="Primekey Logo Icon"
              width={214}
              height={111}
              className="w-9 h-auto"
              priority
            />
        
            {/* Poppins Bold */}
            <span 
              className={`font-heading text-2xl sm:text-3xl font-bold tracking-tight`}
              style={{ color: BRAND_COLOR }}
            >
              Primekey
            </span>
          </Link>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            MIDDLE: Navigation Links (Lora Regular)
            ────────────────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className={`flex items-center gap-8 text-base font-body`} role="list">
            <li className="relative flex flex-col items-center">
              {/* Active Indicator Bar matching logo color */}
              <span 
                className="absolute -top-3 w-4 h-0.5 rounded-full" 
                style={{ backgroundColor: BRAND_COLOR }}
              />
              <Link href="/" className="font-semibold" style={{ color: BRAND_COLOR }}>
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/search" 
                className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                style={{ color: BRAND_COLOR }}
              >
                Buy/Rent
              </Link>
            </li>
            <li>
              <NavDropdown label="List a Property" items={LIST_PROPERTY_LINKS} />
            </li>
            <li>
              <Link 
                href="/builder" 
                className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                style={{ color: BRAND_COLOR }}
              >
                For Builders
              </Link>
            </li>
            <li>
              <NavDropdown label="Company" items={COMPANY_LINKS} />
            </li>
          </ul>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            RIGHT: Actions (Lora Regular)
            ────────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-5">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/login" 
              className={`text-base opacity-90 hover:opacity-100 transition-opacity duration-200 font-body`}
              style={{ color: BRAND_COLOR }}
            >
              Login
            </Link>
            
            {/* CTA Button in Lora */}
            <Link 
              href="/contact" 
              className={`text-sm font-semibold text-white px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:opacity-95 font-body`}
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Talk to us
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 focus:outline-none focus:ring-2 rounded-lg"
            style={{ color: BRAND_COLOR }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      
      {/* ──────────────────────────────────────────────────────────────
          MOBILE MENU DROPDOWN (Matching Lavender Tint)
          ────────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu" 
          className="md:hidden absolute top-full left-0 right-0 bg-[#f3f0ff]/95 backdrop-blur-md shadow-lg border-t border-purple-100 z-50"
        >
          <div className="px-6 py-6 space-y-4">
            <ul className={`space-y-4 text-base font-body`} role="list">
              <li>
                <Link href="/" className="block font-semibold" style={{ color: BRAND_COLOR }} onClick={closeMobile}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="block opacity-80" style={{ color: BRAND_COLOR }} onClick={closeMobile}>
                  Buy/Rent a Property
                </Link>
              </li>
              {renderMobileGroup('List a Property', LIST_PROPERTY_LINKS)}
              <li>
                <Link href="/builder" className="block opacity-80" style={{ color: BRAND_COLOR }} onClick={closeMobile}>
                  For Builders
                </Link>
              </li>
              {renderMobileGroup('Company', COMPANY_LINKS)}
              <li className="pt-4 border-t border-purple-200/50 flex flex-col gap-3">
                <Link href="/login" className="block text-center py-2" style={{ color: BRAND_COLOR }} onClick={closeMobile}>
                  Login
                </Link>
                <Link 
                  href="/contact" 
                  className={`block text-center text-sm font-semibold text-white py-3 rounded-full font-body`}
                  style={{ backgroundColor: BRAND_COLOR }}
                  onClick={closeMobile}
                >
                  Talk to us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
