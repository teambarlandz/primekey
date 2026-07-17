'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // If user prefers reduced motion, skip the animation and set as solid immediately
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      // Trigger opacity/shadow change after 50px scroll
      setIsScrolled(window.scrollY > 50);
    };

    // Passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check in case page loads already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)] py-3' 
          : 'bg-transparent py-5'
      }`}
      role="banner"
    >
      <nav 
        className="container mx-auto flex items-center max-w-7xl px-4 sm:px-6 lg:px-8" 
        aria-label="Primary"
      >
        {/* ──────────────────────────────────────────────────────────────
            LEFT: Logo (Takes up 1/3 of the flex container, aligned left)
            ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="navbar__logo" aria-label="Primekey Homes home">
            <Image
              src="/assets/logo.png"
              alt="Primekey Homes logo"
              width={140}
              height={40}
              className="navbar__logo-img"
              priority
            />
          </Link>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            MIDDLE: Desktop Navigation (Takes up 1/3, perfectly centered)
            ────────────────────────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-1 justify-center">
          <ul className="flex items-center gap-8 font-[var(--font-body)] text-[var(--text-primary)]" role="list">
            <li>
              <Link href="/search" className="navbar__link hover:text-[var(--primary-medium)] transition-colors duration-200 font-medium">
                Buy/Rent a Property
              </Link>
            </li>
            <li>
              <Link href="/landlord" className="navbar__link hover:text-[var(--primary-medium)] transition-colors duration-200 font-medium">
                List a Property
              </Link>
            </li>
            <li>
              <Link href="/builder" className="navbar__link hover:text-[var(--primary-medium)] transition-colors duration-200 font-medium">
                For Builders
              </Link>
            </li>
          </ul>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            RIGHT: Actions & Mobile Toggle (Takes up 1/3, aligned right)
            ────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex justify-end items-center gap-4">
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4 font-[var(--font-body)]">
            <Link 
              href="/login" 
              className="text-[var(--text-primary)] hover:text-[var(--primary-medium)] transition-colors duration-200 font-medium"
            >
              Login
            </Link>
            <Link 
              href="/contact" 
              className={`btn btn--primary btn--sm transition-all duration-300 ${
                isScrolled ? 'opacity-100' : 'opacity-90 hover:opacity-100'
              }`}
            >
              Talk to us
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] rounded-md"
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
          MOBILE MENU DROPDOWN
          ────────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu" 
          className="lg:hidden absolute top-full left-0 right-0 bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)] border-t border-[var(--border-default)]"
        >
          <div className="container mx-auto px-4 py-6 space-y-4 font-[var(--font-body)]">
            <ul className="space-y-4 text-lg" role="list">
              <li><Link href="/search" className="block text-[var(--text-primary)] hover:text-[var(--primary-medium)]" onClick={() => setMobileMenuOpen(false)}>Buy/Rent a Property</Link></li>
              <li><Link href="/landlord" className="block text-[var(--text-primary)] hover:text-[var(--primary-medium)]" onClick={() => setMobileMenuOpen(false)}>List a Property</Link></li>
              <li><Link href="/builder" className="block text-[var(--text-primary)] hover:text-[var(--primary-medium)]" onClick={() => setMobileMenuOpen(false)}>For Builders</Link></li>
              <li className="pt-4 border-t border-[var(--border-default)]">
                <Link href="/login" className="block text-[var(--text-primary)] hover:text-[var(--primary-medium)]" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              </li>
              <li>
                <Link href="/contact" className="btn btn--primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>Talk to us</Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}