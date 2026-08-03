'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { NavDropdownItem } from './NavDropdown';
import { Menu, X, ChevronDown, Home, Search } from 'lucide-react';

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

const NAV_GROUPS: { title: string; items: NavDropdownItem[] }[] = [
  { title: 'List a Property', items: LIST_PROPERTY_LINKS },
  { title: 'Company', items: COMPANY_LINKS },
];

export default function SiteNav({ pageTitle }: { pageTitle?: string }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Reveal the page title in the navbar once the user scrolls past the hero
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 160);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the nav drawer is open
  useEffect(() => {
    document.body.style.overflow = isNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavOpen]);

  return (
    <>
      {/* Sticky Brand Header: Logo left (goes home), Nav Menu right */}
      <header className="sticky top-0 z-50 bg-[#f3f0ff]/95 backdrop-blur-md border-b border-purple-100/60 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="Primekey Homes - Go to homepage">
            <Image
              src="/assets/logo.svg"
              alt="Primekey Logo Icon"
              width={214}
              height={111}
              className="w-9 h-auto transition-transform group-hover:scale-105"
              priority
            />
            <span
              className="text-2xl font-bold tracking-tight font-heading"
              style={{ color: BRAND_COLOR }}
            >
              Primekey
            </span>
          </Link>

          {/* Page title - reveals on scroll so users never lose the topic */}
          {pageTitle && (
            <div className="flex-1 min-w-0 mx-2 flex items-center justify-center">
              <span
                className={`inline-block max-w-full truncate font-heading font-semibold transition-all duration-300 ${
                  isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
                style={{ color: BRAND_COLOR, fontSize: 'clamp(0.8125rem, 1.1vw + 0.5rem, 1.0625rem)' }}
              >
                {pageTitle}
              </span>
            </div>
          )}

          {/* Right-hand Navigation Menu */}
          <button
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="p-2.5 rounded-xl border border-[#04164a]/15 bg-white text-[#04164a] hover:bg-[#04164a]/5 transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={isNavOpen}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide-in Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isNavOpen}
      >
        <div
          className="absolute inset-0 bg-[#04164a]/40 backdrop-blur-sm"
          onClick={() => setIsNavOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ${
            isNavOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-purple-100">
            <span className="font-heading text-lg font-bold" style={{ color: BRAND_COLOR }}>
              Menu
            </span>
            <button
              type="button"
              onClick={() => setIsNavOpen(false)}
              className="p-2 rounded-lg hover:bg-purple-50 text-slate-600 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="overflow-y-auto h-[calc(100%-4rem)] px-5 py-6 space-y-1 font-body">
            <Link
              href="/"
              onClick={() => setIsNavOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-purple-50/70 transition-colors text-base font-semibold"
              style={{ color: BRAND_COLOR }}
            >
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link
              href="/search"
              onClick={() => setIsNavOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-purple-50/70 transition-colors text-base font-semibold"
              style={{ color: BRAND_COLOR }}
            >
              <Search className="w-4 h-4" /> Buy / Rent
            </Link>

            {NAV_GROUPS.map((group) => {
              const expanded = openMobileGroup === group.title;
              return (
                <div key={group.title}>
                  <button
                    type="button"
                    onClick={() => setOpenMobileGroup(expanded ? null : group.title)}
                    className="flex items-center justify-between w-full py-3 px-3 rounded-xl hover:bg-purple-50/70 transition-colors text-base font-semibold"
                    style={{ color: BRAND_COLOR }}
                    aria-expanded={expanded}
                  >
                    {group.title}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded && (
                    <ul className="pl-4 space-y-1 border-l-2 border-purple-200/60 ml-3">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsNavOpen(false)}
                            className="block py-2.5 px-3 text-sm opacity-80 hover:opacity-100 rounded-lg hover:bg-purple-50/70 transition-colors"
                            style={{ color: BRAND_COLOR }}
                          >
                            {item.label}
                            {item.description && (
                              <span className="block text-xs text-[#4a607a] mt-0.5">{item.description}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            <div className="pt-4 mt-2 border-t border-purple-100 space-y-3">
              <Link
                href="/login"
                onClick={() => setIsNavOpen(false)}
                className="block text-center py-3 rounded-xl border border-[#04164a]/20 text-sm font-semibold hover:bg-[#04164a]/5 transition-colors"
                style={{ color: BRAND_COLOR }}
              >
                Login
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsNavOpen(false)}
                className="block text-center text-sm font-semibold text-white py-3 rounded-xl"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                Talk to us
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
