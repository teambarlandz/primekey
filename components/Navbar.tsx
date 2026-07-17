'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header" role="banner">
      <nav className="navbar" aria-label="Primary">
        <Link href="/" className="navbar__logo" aria-label="PropNest home">
          <Image
            src="/assets/logo.svg"
            alt="PropNest logo"
            width={140}
            height={40}
            className="navbar__logo-img"
            priority
          />
        </Link>

        <ul className="navbar__links" role="list">
          <li><Link href="/buy-rent" className="navbar__link">Buy/Rent a Property</Link></li>
          <li><Link href="/list" className="navbar__link">List a Property</Link></li>
          <li><Link href="/builders" className="navbar__link">For Builders</Link></li>
        </ul>

        <div className="navbar__actions">
          <Link href="/login" className="navbar__link navbar__link--login">Login</Link>
          <Link href="/contact" className="btn btn--primary btn--sm">Talk to us</Link>
        </div>

        <button
          className="navbar__toggle"
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="navbar__mobile">
          <ul role="list">
            <li><Link href="/buy-rent">Buy/Rent a Property</Link></li>
            <li><Link href="/list">List a Property</Link></li>
            <li><Link href="/builders">For Builders</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/signup">Signup</Link></li>
            <li><Link href="/contact" className="btn btn--primary">Talk to us</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}