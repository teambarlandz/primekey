import { GatewayGrid } from '@/components/gateway/GatewayGrid';
import { IntentCard } from '@/components/gateway/IntentCard';
import { Home, Building } from 'lucide-react';

export default function IntentGatewayPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-16 sm:py-24 overflow-hidden">
      {/* Full Viewport Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: 'url("/hero-bg.jpg")' }} // Place your high-quality real estate image in /public
        role="img"
        aria-label="Luxury Nigerian real estate property"
      />
      
      {/* Dark Overlay for Text Readability (Accessibility WCAG AA) */}
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-md">
          What are you looking for?
        </h1>
        <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-14 drop-shadow-sm">
          Select your pathway to get started with Primekey&apos;s premium real estate services.
        </p>
        
        <GatewayGrid>
          <IntentCard
            title="Buy/Rent a Property"
            description="Find your dream home or rental property with our exclusive search and concierge service."
            href="/search"
            icon={Home}
            ctaText="Search Properties"
          />
          <IntentCard
            title="I am a Landlord/Owner"
            description="Partner with our elite management team for stress-free property management and guaranteed rent."
            href="/landlord"
            icon={Building}
            ctaText="List Your Property"
          />
        </GatewayGrid>
      </div>
    </div>
  );
}