'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterDropdown } from '@/components/search/FilterDropdown';
import { PriceRange } from '@/components/search/PriceRange';
import { PropertyGrid } from '@/components/search/PropertyGrid';
import { EmptyResults } from '@/components/search/EmptyResults';
import { ConciergeModal } from '@/components/search/ConciergeModal';
import { AuthInterceptSheet } from '@/components/auth/AuthInterceptSheet';
import { SearchFilterValues } from '@/lib/validations/searchSchema';
import { Property } from '@/lib/api/contracts';
import { Filter, RotateCcw, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProperties } from '@/hooks/useProperties';

const BRAND_COLOR = '#04164a';

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Exquisite 5 Bedroom Fully Detached Duplex',
    slug: '5-bed-detached-duplex-lekki',
    description: '',
    propertyType: 'fully_detached_duplex',
    price: 350000000,
    currency: 'NGN',
    isNegotiable: false,
    address: '',
    city: 'Lagos',
    state: 'Lagos',
    area: 'Lekki Phase 1',
    bedrooms: 5,
    bathrooms: 6,
    toilets: 6,
    isServiced: false,
    isFurnished: false,
    status: 'available',
    isFeatured: true,
    images: [{ id: '1', imageUrl: 'https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcSiMKJYrVOrM0oW07zcKKchMXArueNucRG_xxNGVBctmZQpKMKNZNQM8dd102K239nq061vyir_8cBE3_U', isPrimary: true, caption: '', createdAt: '' }],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    title: 'Contemporary 2 Bedroom Serviced Luxury Flat',
    slug: '2-bed-serviced-apartment-ikoyi',
    description: '',
    propertyType: 'flat',
    price: 12000000,
    currency: 'NGN',
    isNegotiable: false,
    address: '',
    city: 'Lagos',
    state: 'Lagos',
    area: 'Ikoyi',
    bedrooms: 2,
    bathrooms: 2,
    toilets: 2,
    isServiced: true,
    isFurnished: true,
    status: 'available',
    isFeatured: true,
    images: [{ id: '2', imageUrl: 'https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQCOuV7-FQU5ARbIT8MXJ-pfTpGo0FHYYQd8TmcC7RYKHrORSLKDQ4wHeirRR2_inLdVs_KEh_NoZAKD6w', isPrimary: true, caption: '', createdAt: '' }],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '3',
    title: 'Ultra-Modern Architectural Mansion with Pool',
    slug: 'modern-mansion-maitama-abuja',
    description: '',
    propertyType: 'mansion',
    price: 850000000,
    currency: 'NGN',
    isNegotiable: false,
    address: '',
    city: 'Abuja',
    state: 'FCT',
    area: 'Maitama',
    bedrooms: 7,
    bathrooms: 8,
    toilets: 8,
    isServiced: true,
    isFurnished: true,
    status: 'available',
    isFeatured: true,
    images: [{ id: '3', imageUrl: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcTzxFAdKGcbY96KCFF2_R8Xs1eNOaom2NioTUtLh_QLmFgsdsikB0B8hhK7izUi3gURDZ7rFqXY26XGzDQ', isPrimary: true, caption: '', createdAt: '' }],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '4',
    title: 'Waterfront Luxury Villa with Private Jet Ski Ramp',
    slug: 'waterfront-villa-banana-island',
    description: '',
    propertyType: 'fully_detached_duplex',
    price: 1200000000,
    currency: 'NGN',
    isNegotiable: false,
    address: '',
    city: 'Lagos',
    state: 'Lagos',
    area: 'Banana Island',
    bedrooms: 6,
    bathrooms: 7,
    toilets: 7,
    isServiced: true,
    isFurnished: true,
    status: 'available',
    isFeatured: true,
    images: [{ id: '4', imageUrl: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcTy7v1SYos-9Pxr9nqvUqNHongVQatBdmgk8yqwtQPZLwLcYoQmJxvK1dHphVtdRFbGM8ifGsAui-gSrtM', isPrimary: true, caption: '', createdAt: '' }],
    createdAt: '',
    updatedAt: '',
  },
];

function transformPropertyForGrid(p: Property) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    location: p.area,
    city: p.city,
    state: p.state,
    price: p.price,
    category: p.status === 'available' ? 'sale' : 'rent',
    propertyType: p.propertyType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    imageUrl: p.images[0]?.imageUrl || '',
    isVerified: p.isFeatured,
  };
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilterValues>({
    location: '',
    propertyType: 'any',
    minPrice: 0,
    maxPrice: 1500000000,
    bedrooms: 'any',
  });

  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const { data, error, isLoading, isValidating } = useProperties(filters);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 160);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = (newPartialFilters: Partial<SearchFilterValues>) => {
    setFilters((prev) => ({ ...prev, ...newPartialFilters }));
  };

  const handleLocationSelect = (loc: string) => {
    handleFilterChange({ location: loc });
  };

  const handleReset = () => {
    const resetVals: SearchFilterValues = {
      location: '',
      propertyType: 'any',
      minPrice: 0,
      maxPrice: 1500000000,
      bedrooms: 'any',
    };
    setFilters(resetVals);
  };

  const handleRequireAuth = (actionName: string) => {
    setPendingAction(actionName);
    setIsAuthOpen(true);
  };

  // Use mock data as fallback while API is being developed
  const properties = data?.results?.map(transformPropertyForGrid) ?? MOCK_PROPERTIES;
  const isEmpty = data?.results?.length === 0 && !isLoading;

  return (
    <main className="min-h-screen bg-[#f3f0ff] pb-16">
      {/* Sticky Brand Header with Scroll Mini-Search & Quick Filters */}
      <header className="sticky top-0 z-50 bg-[#f3f0ff]/95 backdrop-blur-md border-b border-purple-100/60 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Real Company Logo & Name from Navbar */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
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

          {/* Scroll-triggered Mini Search Bar + Quick Filters */}
          <div
            className={`transition-all duration-300 flex-1 max-w-2xl mx-4 ${
              isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            } hidden md:flex items-center gap-2`}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={filters.location || ''}
                onChange={(e) => handleFilterChange({ location: e.target.value })}
                placeholder="Search location (e.g., Lekki, Ikoyi)..."
                className="pl-10 pr-4 py-2 h-10 text-xs rounded-full border-slate-200 bg-white shadow-2xs focus-visible:ring-[#04164a]"
              />
            </div>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange({ propertyType: e.target.value as any })}
              className="h-10 px-3 bg-white border border-slate-200 rounded-full text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="any">All Property Types</option>
              <option value="fully_detached_duplex">Detached Duplex</option>
              <option value="flat">Serviced Flat</option>
              <option value="mansion">Mansion</option>
            </select>
          </div>

          {/* Action Right */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConciergeOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs border-[#04164a]/20 text-[#04164a] hover:bg-[#04164a]/5 rounded-xl font-heading"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Concierge Match
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#04164a]">
            Discover Premium Properties
          </h1>
          <p className="font-body text-slate-600 text-sm md:text-base">
            Explore verified listings across Lagos, Abuja, Port Harcourt, and prime locations in Nigeria.
          </p>
        </div>

        {/* Hero Filter Panel */}
        <div className="bg-white/90 backdrop-blur-md p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <SearchBar
            value={filters.location || ''}
            onChange={(loc) => handleFilterChange({ location: loc })}
            onSearch={() => {}}
            onSelectSuggestion={handleLocationSelect}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
            <div className="lg:col-span-2">
              <FilterDropdown
                propertyType={filters.propertyType}
                bedrooms={filters.bedrooms}
                onPropertyTypeChange={(type) => handleFilterChange({ propertyType: type as any })}
                onBedroomsChange={(beds) => handleFilterChange({ bedrooms: beds })}
              />
            </div>
            <div>
              <PriceRange
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onChange={(min, max) => handleFilterChange({ minPrice: min, maxPrice: max })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="font-body text-xs text-slate-500 hover:text-[#04164a] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </Button>
            <Button
              onClick={() => {}}
              className="bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-sm px-6 py-2.5 rounded-xl flex items-center gap-2"
            >
              <Filter className="w-4 h-4" /> Apply Filters
            </Button>
          </div>
        </div>

        {/* Results Area */}
        {isLoading ? (
          <div className="space-y-4" aria-live="polite">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/90 rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="font-body text-rose-700">Failed to load properties. Please try again.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : isEmpty ? (
          <EmptyResults
            location={filters.location || ''}
            onOpenConcierge={() => setIsConciergeOpen(true)}
            onResetSearch={handleReset}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-[#04164a]">
                Available Properties ({properties.length})
                {isValidating && <span className="ml-2 text-sm text-slate-500 font-body">Updating...</span>}
              </h2>
            </div>
            <PropertyGrid
              properties={properties}
              onSelectProperty={(id) => console.log('Viewing property:', id)}
              onRequireAuth={handleRequireAuth}
            />
          </div>
        )}

        {/* Concierge Modal */}
        <ConciergeModal
          isOpen={isConciergeOpen}
          onClose={() => setIsConciergeOpen(false)}
          initialFilters={filters}
        />

        {/* Auth Interception Sheet */}
        <AuthInterceptSheet
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          pendingActionName={pendingAction}
          onSuccess={() => console.log('Action authenticated & executed!')}
        />
      </div>
    </main>
  );
}