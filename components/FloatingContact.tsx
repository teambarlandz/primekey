'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function FloatingContact() {
  return (
    <Link
      href="https://wa.me/2348000000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-full"
      aria-label="Chat with Primekey Homes on WhatsApp"
    >
      {/* Optional Desktop Hover Label */}
      <span className="hidden sm:inline-block px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-100 text-xs font-semibold font-heading text-emerald-950 shadow-md group-hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
        Chat with us
      </span>

      <div className="relative">
        {/* Soft Pulse Ring Animation */}
        <span 
          className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-35 pointer-events-none"
          style={{ animationDuration: '2.5s', animationIterationCount: 'infinite' }}
          aria-hidden="true"
        />
        
        {/* Main Floating Button */}
        <div className="relative w-14 h-14 md:w-15 md:h-15 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-lg group-hover:shadow-xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 active:scale-95 border-2 border-white/80">
          <MessageCircle className="w-7 h-7 fill-current" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
