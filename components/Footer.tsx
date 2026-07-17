import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">

          {/* ──────────────────────────────────────────────────────────────
              COLUMN 1: BRAND + DIRECT CONTACT
              Purpose: Prove Primekey Homes is a real, reachable company.
              ────────────────────────────────────────────────────────────── */}
          <div className="footer__brand">
            <Link href="/" aria-label="Primekey Homes home">
              <Image
                src="/assets/logo.svg"
                alt="Primekey Homes and Properties Ltd."
                width={140}
                height={40}
                className="footer__logo"
              />
            </Link>

            <p className="footer__tagline">
              Your trusted partner in Nigerian real estate — buying, renting, and managing properties with confidence.
            </p>

            <address className="footer__contact" itemScope itemType="https://schema.org/LocalBusiness">
              <a
                href="tel:+2348000000000"
                className="footer__contact-link"
                itemProp="telephone"
              >
                <Phone className="footer__contact-icon" aria-hidden="true" />
                <span>+234 800 000 0000</span>
              </a>

              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__contact-link"
              >
                <MessageCircle className="footer__contact-icon" aria-hidden="true" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href="mailto:hello@primekeyhomes.com"
                className="footer__contact-link"
                itemProp="email"
              >
                <Mail className="footer__contact-icon" aria-hidden="true" />
                <span>hello@primekeyhomes.com</span>
              </a>
            </address>

            <ul className="footer__social" role="list" aria-label="Social media">
              <li><a href="#" aria-label="Facebook">FB</a></li>
              <li><a href="#" aria-label="Instagram">IG</a></li>
              <li><a href="#" aria-label="LinkedIn">IN</a></li>
              <li><a href="#" aria-label="Twitter / X">X</a></li>
            </ul>
          </div>

          {/* ──────────────────────────────────────────────────────────────
              COLUMN 2: QUICK NAVIGATION
              Purpose: Escape hatch for final questions — not a full sitemap.
              ────────────────────────────────────────────────────────────── */}
          <nav className="footer__nav" aria-label="Footer navigation">
            <h4 className="footer__col-title">Explore</h4>
            <ul role="list">
              <li><Link href="/search">Buy / Rent a Property</Link></li>
              <li><Link href="/landlord">List a Property</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </nav>

          {/* ──────────────────────────────────────────────────────────────
              COLUMN 3: LEGAL & TRUST
              Purpose: Compliance, transparency, NDPR notice.
              ────────────────────────────────────────────────────────────── */}
          <div className="footer__legal-col">
            <h4 className="footer__col-title">Legal</h4>
            <ul role="list">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms &amp; Conditions</Link></li>
              <li><Link href="/ndpr">NDPR Compliance</Link></li>
              <li><Link href="/cookies">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            COPYRIGHT ROW
            ────────────────────────────────────────────────────────────── */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} Primekey Homes and Properties Ltd. All rights reserved.
          </p>
          <p className="footer__rc-number">
            RC: 0000000 · Registered in Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}