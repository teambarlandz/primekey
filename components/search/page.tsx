'use client';

import React, { useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterDropdown } from '@/components/search/FilterDropdown';
import { PriceRange } from '@/components/search/PriceRange';
import { PropertyGrid } from '@/components/search/PropertyGrid';
import { SearchFilterValues } from '@/lib/validations/searchSchema';
import { Property } from '@/types/property';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock listings for development validation

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
    imageUrl: 'https://images.nigeriapropertycentre.com/properties/images/3492303/06a0f994e7b0c7-exquisite-luxury-5-bedroom-fully-detached-duplex-detached-duplexes-for-sale-lekki-lagos.jpg',
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
    imageUrl: 'https://images.nigeriapropertycentre.com/properties/images/3521391/06a2a4a731ff9a-contemporary-2-bedroom-luxury-apartment-with-elevator-swimming-pool-short-let-lekki-phase-1-lekki-lagos.jpeg',
    isVerified: true,
  },
];

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilterValues>({
    location: '',
    propertyType: 'any',
    minPrice: 0,
    maxPrice: 500000000,
    bedrooms: 'any',
  });

  const [properties] = useState<Property[]>(MOCK_PROPERTIES);

  const handleReset = () => {
    setFilters({
      location: '',
      propertyType: 'any',
      minPrice: 0,
      maxPrice: 500000000,
      bedrooms: 'any',
    });
  };

  const handleRequireAuth = (actionName: string) => {
    console.log('Triggering Auth Intercept Sheet for action:', actionName);
  };

  return (
    <main className="min-h-screen bg-[#f3f0ff] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#04164a]">
            Discover Premium Properties
          </h1>
          <p className="font-body text-slate-600 text-sm md:text-base">
            Explore verified listings across Lagos, Abuja, Port Harcourt, and prime locations in Nigeria.
          </p>
        </div>

        {/* Master Search Filter Panel */}
        <div className="bg-white/90 backdrop-blur-md p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <SearchBar
            value={filters.location || ''}
            onChange={(loc) => setFilters((prev) => ({ ...prev, location: loc }))}
            onSearch={() => {}}
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
            <Button className="bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-sm px-6 py-2.5 rounded-xl flex items-center gap-2">
              <Filter className="w-4 h-4" /> Apply Filters
            </Button>
          </div>
        </div>

        {/* Property Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-[#04164a]">
              Available Properties ({properties.length})
            </h2>
          </div>
          <PropertyGrid
            properties={properties}
            onSelectProperty={(id) => console.log('Selected property:', id)}
            onRequireAuth={handleRequireAuth}
          />
        </div>
      </div>
    </main>
  );
}
