'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Property, searchProperties, SearchPropertiesResponse } from '@/lib/api-client';
import { Filter, RotateCcw, Search, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BRAND_COLOR = '#04164a';

// Fallback mock properties for when API is unavailable
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Exquisite 5 Bedroom Fully Detached Duplex',
    slug: '5-bed-detached-duplex-lekki',
    location: 'Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    price: 350000000,
    category: 'sale',
    propertyType: 'fully_detached_duplex',
    bedrooms: 5,
    bathrooms: 6,
    imageUrl: 'https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcSiMKJYrVOrM0oW07zcKKchMXArueNucRG_xxNGVBctmZQpKMKNZNQM8dd102K239nq061vyir_8cBE3_U',
    isVerified: true,
  },
  {
    id: '2',
    title: 'Contemporary 2 Bedroom Serviced Luxury Flat',
    slug: '2-bed-serviced-apartment-ikoyi',
    location: 'Ikoyi',
    city: 'Lagos',
    state: 'Lagos',
    price: 12000000,
    category: 'rent',
    propertyType: 'flat',
    bedrooms: 2,
    bathrooms: 2,
    imageUrl: 'https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQCOuV7-FQU5ARbIT8MXJ-pfTpGo0FHYYQd8TmcC7RYKHrORSLKDQ4wHeirRR2_inLdVs_KEh_NoZAKD6w',
    isVerified: true,
  },
  {
    id: '3',
    title: 'Ultra-Modern Architectural Mansion with Pool',
    slug: 'modern-mansion-maitama-abuja',
    location: 'Maitama',
    city: 'Abuja',
    state: 'FCT',
    price: 850000000,
    category: 'sale',
    propertyType: 'mansion',
    bedrooms: 7,
    bathrooms: 8,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcTzxFAdKGcbY96KCFF2_R8Xs1eNOaom2NioTUtLh_QLmFgsdsikB0B8hhK7izUi3gURDZ7rFqXY26XGzDQ',
    isVerified: true,
  },
  {
    id: '4',
    title: 'Waterfront Luxury Villa with Private Jet Ski Ramp',
    slug: 'waterfront-villa-banana-island',
    location: 'Banana Island',
    city: 'Lagos',
    state: 'Lagos',
    price: 1200000000,
    category: 'sale',
    propertyType: 'fully_detached_duplex',
    bedrooms: 6,
    bathrooms: 7,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcTy7v1SYos-9Pxr9nqvUqNHongVQatBdmgk8yqwtQPZLwLcYoQmJxvK1dHphVtdRFbGM8ifGsAui-gSrtM',
    isVerified: true,
  },
];

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilterValues>({
    location: '',
    propertyType: 'any',
    minPrice: 0,
    maxPrice: 1500000000,
    bedrooms: 'any',
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 160);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch properties from API with fallback to mock data
  const executeSearch = useCallback(async (updatedFilters: SearchFilterValues) => {
    setIsLoading(true);
    setSearchError(null);

    try {
      const response = await searchProperties(updatedFilters);
      if (response.data?.results) {
        setProperties(response.data.results);
        setTotalCount(response.data.count || response.data.results.length);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.warn('API search failed, falling back to mock data:', error.message);
      setSearchError('Using fallback data. Some results may be limited.');
      
      // Fallback to client-side filtering with mock data
      const targetLocation = (filters.location || '').toLowerCase().trim();
      const filtered = MOCK_PROPERTIES.filter((p) => {
        const matchesLocation =
          !targetLocation ||
          p.location.toLowerCase().includes(targetLocation) ||
          p.city.toLowerCase().includes(targetLocation) ||
          p.state.toLowerCase().includes(targetLocation);

        const matchesPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
        const matchesType = filters.propertyType === 'any' || p.propertyType === filters.propertyType;
        const matchesBeds =
          filters.bedrooms === 'any' ||
          (filters.bedrooms === '5'
            ? p.bedrooms >= 5
            : p.bedrooms === Number(filters.bedrooms));

        return matchesLocation && matchesPrice && matchesType && matchesBeds;
      });
      setProperties(filtered);
      setTotalCount(filtered.length);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = (newPartialFilters: Partial<SearchFilterValues>) => {
    setFilters((prev) => {
      const next = { ...prev, ...newPartialFilters };
      return next;
    });
  };

  const handleSearchExecute = () => {
    executeSearch(filters);
  };

  const handleLocationSelect = (loc: string) => {
    setFilters((prev) => ({ ...prev, location: loc }));
    executeSearch({ ...filters, location: loc });
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
    executeSearch(resetVals);
  };

  const handleRequireAuth = (actionName: string) => {
    setPendingAction(actionName);
    setIsAuthOpen(true);
  };

  // Initial search on mount
  useEffect(() => {
    executeSearch(filters);
  }, [executeSearch]);

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
                onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Search location (e.g., Lekki, Ikoyi)..."
                className="pl-10 pr-4 py-2 h-10 text-xs rounded-full border-slate-200 bg-white shadow-2xs focus-visible:ring-[#04164a]"
              />
            </div>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters((prev) => ({ ...prev, propertyType: e.target.value as any }))}
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
            onChange={(loc) => setFilters((prev) => ({ ...prev, location: loc }))}
            onSearch={handleSearchExecute}
            onSelectSuggestion={(loc) => setFilters((prev) => ({ ...prev, location: loc }))}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
            <div className="lg:col-span-2">
              <FilterDropdown
                propertyType={filters.propertyType}
                bedrooms={filters.bedrooms}
                onPropertyTypeChange={(type) => setFilters((prev) => ({ ...prev, propertyType: type as any }))}
                onBedroomsChange={(beds) => setFilters((prev) => ({ ...prev, bedrooms: beds }))}
              />
            </div>
            <div>
              <PriceRange
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onChange={(min, max) => setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))}
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
              onClick={handleSearchExecute}
              disabled={isLoading}
              className="bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-sm px-6 py-2.5 rounded-xl flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Filter className="w-4 h-4" /> Apply Filters
            </Button>
          </div>
        </div>

        {/* Results Area */}
        {searchError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-700 text-xs font-body">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-[#04164a]">
                Available Properties ({totalCount})
              </h2>
            </div>
            <PropertyGrid
              properties={properties}
              onSelectProperty={(id) => console.log('Viewing property:', id)}
              onRequireAuth={handleRequireAuth}
            />
          </div>
        ) : (
          <EmptyResults
            location={filters.location || ''}
            onOpenConcierge={() => setIsConciergeOpen(true)}
            onResetSearch={handleReset}
          />
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