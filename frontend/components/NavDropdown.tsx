'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export interface NavDropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavDropdownProps {
  label: string;
  items: NavDropdownItem[];
  onNavigate?: () => void;
}

const BRAND_COLOR = '#04164a';

export const NavDropdown: React.FC<NavDropdownProps> = ({ label, items, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity duration-200"
        style={{ color: BRAND_COLOR }}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full pt-3 z-50"
        >
          <div className="min-w-[220px] bg-white/95 backdrop-blur-md rounded-2xl border border-purple-100 shadow-lg py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="block px-5 py-3 hover:bg-purple-50/70 transition-colors"
                style={{ color: BRAND_COLOR }}
              >
                <span className="block text-sm font-semibold font-heading">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-[#4a607a] font-body mt-0.5">{item.description}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
