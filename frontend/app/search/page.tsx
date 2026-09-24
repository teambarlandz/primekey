'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterDropdown } from '@/components/search/FilterDropdown';
import { PriceRange } from '@/components/search/PriceRange';
import { PropertyGrid } from '@/components/search/PropertyGrid';
import { EmptyResults } from '@/components/search/EmptyResults';
import { ConciergeModal } from '@/components/search/ConciergeModal';
import { AuthInterceptSheet } from '@/components/auth/AuthInterceptSheet';
import { useToast } from '@/components/ui/toast';
import { isUserLoggedIn, toggleFavorite, fetchFavorites } from '@/lib/api-client';
import { NavDropdown, NavDropdownItem } from '@/components/NavDropdown';
import Footer from '@/components/Footer';
import { SearchFilterValues } from '@/lib/validations/searchSchema';
import { Property, searchProperties, SearchPropertiesResponse, ApiClientError } from '@/lib/api-client';
import {
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BRAND_COLOR = '#04164a';
const PAGE_SIZE = 12;

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

const SORT_OPTIONS: { value: SearchFilterValues['sortBy']; label: string }[] = [
  { value: 'newest', label: 'Newest Listings' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const PURPOSE_TABS: { value: SearchFilterValues['purpose']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sale', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'short_let', label: 'Short Let' },
];

// Dev-only placeholder listings — never shown in production. In prod, API
// failures surface as an error state (no silent fallback) so broken search
// is noticed instead of showing fake data.
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Exquisite 5 Bedroom Fully Detached Duplex',
    slug: '5-bed-detached-duplex-lekki',
    location: 'Lekki Phase 1',
    city: 'Lekki',
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

function getPageNumbers(currentPage: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | '…')[] = [1];
  if (currentPage > 3) pages.push('…');
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (currentPage < totalPages - 2) pages.push('…');
  pages.push(totalPages);
  return pages;
}

export default function SearchPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilterValues>({
    location: '',
    purpose: 'all',
    propertyType: 'any',
    minPrice: 0,
    maxPrice: 1500000000,
    bedrooms: 'any',
    sortBy: 'newest',
    page: 1,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [pendingPropertyId, setPendingPropertyId] = useState<string | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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

  // Fetch properties from API — errors surface to the UI; no silent mock fallback in production
  const executeSearch = useCallback(async (searchFilters: SearchFilterValues) => {
    setIsLoading(true);
    setSearchError(null);

    try {
      const response = await searchProperties(searchFilters, searchFilters.page, PAGE_SIZE);
      if (response.data?.results) {
        setProperties(response.data.results);
        setTotalCount(response.data.count || response.data.results.length);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      const isDev = process.env.NODE_ENV !== 'production';
      const message =
        error instanceof ApiClientError
          ? error.message
          : error?.message || 'Failed to search properties. Please try again.';

      // In development, fall back to local mocks so UI work isn't blocked by API downtime.
      if (isDev) {
        console.warn('API search failed, using dev mocks:', message);
        setSearchError(`Dev fallback — API unavailable: ${message}`);
        const targetLocation = (searchFilters.location || '').toLowerCase().trim();
        const filtered = MOCK_PROPERTIES.filter((p) => {
          const matchesLocation =
            !targetLocation ||
            p.location.toLowerCase().includes(targetLocation) ||
            p.city.toLowerCase().includes(targetLocation) ||
            p.state.toLowerCase().includes(targetLocation);
          const matchesPrice = p.price >= searchFilters.minPrice && p.price <= searchFilters.maxPrice;
          const matchesType = searchFilters.propertyType === 'any' || p.propertyType === searchFilters.propertyType;
          const matchesPurpose = searchFilters.purpose === 'all' || p.category === searchFilters.purpose;
          const matchesBeds =
            searchFilters.bedrooms === 'any' ||
            (searchFilters.bedrooms === '5' ? p.bedrooms >= 5 : p.bedrooms === Number(searchFilters.bedrooms));
          return matchesLocation && matchesPrice && matchesType && matchesPurpose && matchesBeds;
        });
        setProperties(filtered);
        setTotalCount(filtered.length);
      } else {
        // Production: surface the real error — never show fake listings as if they were real
        console.error('API search failed:', message);
        setSearchError(message);
        setProperties([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = (newPartialFilters: Partial<SearchFilterValues>) => {
    setFilters((prev) => {
      const next = { ...prev, ...newPartialFilters, page: 1 };
      return next;
    });
  };

  const handleSearchExecute = () => {
    setFilters((prev) => {
      const next = { ...prev, page: 1 };
      executeSearch(next);
      return next;
    });
  };

  const handleLocationSelect = (loc: string) => {
    setFilters((prev) => {
      const next = { ...prev, location: loc, page: 1 };
      executeSearch(next);
      return next;
    });
  };

  const handleReset = () => {
    const resetVals: SearchFilterValues = {
      location: '',
      purpose: 'all',
      propertyType: 'any',
      minPrice: 0,
      maxPrice: 1500000000,
      bedrooms: 'any',
      sortBy: 'newest',
      page: 1,
    };
    setFilters(resetVals);
    executeSearch(resetVals);
  };

  const handlePurposeChange = (purpose: SearchFilterValues['purpose']) => {
    setFilters((prev) => {
      const next = { ...prev, purpose, page: 1 };
      executeSearch(next);
      return next;
    });
  };

  const handleSortChange = (sortBy: SearchFilterValues['sortBy']) => {
    setFilters((prev) => {
      const next = { ...prev, sortBy, page: 1 };
      executeSearch(next);
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === filters.page) return;
    setFilters((prev) => {
      const next = { ...prev, page };
      executeSearch(next);
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequireAuth = (actionName: string, propertyId?: string) => {
    setPendingAction(actionName);
    setPendingPropertyId(propertyId ?? null);
    setIsAuthOpen(true);
  };

  const handleToggleFavorite = async (propertyId: string) => {
    if (!isUserLoggedIn()) {
      handleRequireAuth('Save Property', propertyId);
      return;
    }
    try {
      const result = await toggleFavorite(propertyId);
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (result.is_favorited) {
          next.add(propertyId);
        } else {
          next.delete(propertyId);
        }
        return next;
      });
      toast(result.is_favorited ? 'Property saved to favorites' : 'Property removed from favorites');
    } catch {
      toast('Failed to update favorite. Please try again.', 'error');
    }
  };

  const handleAuthSuccess = async (data?: Record<string, unknown>) => {
    const propId = data?.propertyId as string | undefined;
    if (propId) {
      try {
        const result = await toggleFavorite(propId);
        setFavoritedIds((prev) => {
          const next = new Set(prev);
          if (result.is_favorited) {
            next.add(propId);
          } else {
            next.delete(propId);
          }
          return next;
        });
        toast(result.is_favorited ? 'Property saved to favorites' : 'Property removed from favorites');
      } catch {
        toast('Failed to update favorite. Please try again.', 'error');
      }
    }
  };

  // Initial search on mount
  useEffect(() => {
    executeSearch(filters);
    // Fetch user's favorites if logged in
    if (isUserLoggedIn()) {
      fetchFavorites()
        .then((favs) => {
          setFavoritedIds(new Set(favs.map((f) => f.property_id)));
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resultStart = totalCount === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const resultEnd = Math.min(filters.page * PAGE_SIZE, totalCount);

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

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-body">
          <Link href="/" className="hover:text-[#04164a] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 font-medium">Property Search</span>
          {filters.location && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-[#04164a] font-semibold">{filters.location}</span>
            </>
          )}
        </nav>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#04164a]">
            Discover Premium Properties
          </h1>
          <p className="font-body text-slate-600 text-sm md:text-base">
            Explore verified listings across Lagos, Abuja, Port Harcourt, and prime locations in Nigeria.
          </p>
        </div>

        {/* Buy / Rent / Short-Let Toggle */}
        <div
          className="inline-flex items-center gap-1 p-1 bg-white/90 border border-slate-200 rounded-xl shadow-sm"
          role="tablist"
          aria-label="Listing purpose"
        >
          {PURPOSE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filters.purpose === tab.value}
              onClick={() => handlePurposeChange(tab.value)}
              className={`px-4 py-2 text-sm font-heading font-semibold rounded-lg transition-all ${
                filters.purpose === tab.value
                  ? 'bg-[#04164a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#04164a] hover:bg-purple-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hero Filter Panel */}
        <div
          id="search-filters"
          className="bg-white/90 backdrop-blur-md p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
        >
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
              onClick={handleSearchExecute}
              disabled={isLoading}
              className="bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-sm px-6 py-2.5 rounded-xl flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Filter className="w-4 h-4" /> Apply Filters
            </Button>
          </div>
        </div>

        {/* Results Area — errors are real API messages in prod, dev fallback notice in dev */}
        {searchError && (
          <div
            className={`p-3 border rounded-xl flex items-center gap-2 text-xs font-body ${
              searchError.startsWith('Dev fallback')
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Results Toolbar */}
        {!isLoading && properties.length > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="font-body text-sm text-slate-600">
              Showing <span className="font-semibold text-[#04164a]">{resultStart}</span>–
              <span className="font-semibold text-[#04164a]">{resultEnd}</span> of{' '}
              <span className="font-semibold text-[#04164a]">{totalCount}</span> properties
              {filters.location && (
                <>
                  {' '}in <span className="font-semibold text-[#04164a]">{filters.location}</span>
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              {/* Mobile Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 text-xs text-[#04164a] border-[#04164a]/20 rounded-xl font-heading"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </Button>

              {/* Sort Dropdown */}
              <div className="relative">
                <label className="sr-only" htmlFor="sort-by">Sort properties</label>
                <select
                  id="sort-by"
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SearchFilterValues['sortBy'])}
                  className="h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#04164a]/30 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-[#04164a]">
                Available Properties ({totalCount})
              </h2>
            </div>
            <PropertyGrid
              properties={properties}
              onSelectProperty={(id) => router.push(`/property/${id}`)}
              onRequireAuth={(actionName, propertyId) => handleRequireAuth(actionName, propertyId)}
              onToggleFavorite={handleToggleFavorite}
              favoritedIds={favoritedIds}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Search results pagination"
                className="flex items-center justify-center gap-1.5 pt-2"
              >
                <button
                  type="button"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers(filters.page, totalPages).map((p, idx) =>
                  p === '…' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      aria-current={p === filters.page ? 'page' : undefined}
                      className={`min-w-9 h-9 px-2 rounded-xl text-sm font-heading font-semibold transition-colors ${
                        p === filters.page
                          ? 'bg-[#04164a] text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
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
          pendingActionData={pendingPropertyId ? { propertyId: pendingPropertyId } : undefined}
          onSuccess={handleAuthSuccess}
        />
      </div>

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-0 z-[55] transition-opacity duration-300 lg:hidden ${
          isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileFiltersOpen}
      >
        <div
          className="absolute inset-0 bg-[#04164a]/40 backdrop-blur-sm"
          onClick={() => setIsMobileFiltersOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Property filters"
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 flex flex-col ${
            isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100 shrink-0">
            <span className="font-heading text-base font-bold" style={{ color: BRAND_COLOR }}>
              Filters
            </span>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-2 rounded-lg hover:bg-purple-50 text-slate-600 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-5 space-y-5">
            <SearchBar
              value={filters.location || ''}
              onChange={(loc) => setFilters((prev) => ({ ...prev, location: loc }))}
              onSearch={() => setIsMobileFiltersOpen(false)}
              onSelectSuggestion={(loc) => setFilters((prev) => ({ ...prev, location: loc }))}
            />
            <FilterDropdown
              propertyType={filters.propertyType}
              bedrooms={filters.bedrooms}
              onPropertyTypeChange={(type) => handleFilterChange({ propertyType: type as any })}
              onBedroomsChange={(beds) => handleFilterChange({ bedrooms: beds })}
            />
            <PriceRange
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onChange={(min, max) => handleFilterChange({ minPrice: min, maxPrice: max })}
            />
          </div>

          <div className="p-5 border-t border-purple-100 flex gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 font-body text-xs text-slate-600 flex items-center justify-center gap-1.5 rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
            <Button
              onClick={() => {
                setIsMobileFiltersOpen(false);
                handleSearchExecute();
              }}
              className="flex-1 bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-sm rounded-xl"
            >
              View Results ({totalCount})
            </Button>
          </div>
        </aside>
      </div>

      {/* Site Footer */}
      <Footer />
    </main>
  );
}
