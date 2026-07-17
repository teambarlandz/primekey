import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function FloatingContact() {
  return (
    <Link
      href="https://wa.me/2348000000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat with Primekey Homes on WhatsApp"
    >
      {/* Subtle Pulse Ring Animation */}
      <span 
        className="absolute inset-0 rounded-full bg-[var(--gradient-cta)] animate-ping opacity-30 pointer-events-none"
        style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
        aria-hidden="true"
      />
      
      {/* Main Button */}
      <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--gradient-cta)] shadow-[var(--shadow-elevated)] flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-[var(--shadow-modal)]">
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 fill-current" aria-hidden="true" />
      </div>
    </Link>
  );
}