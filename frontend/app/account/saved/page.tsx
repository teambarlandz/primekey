'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/search/PropertyCard';
import {
  fetchFavorites,
  removeFavorite,
  isUserLoggedIn,
  clearUserSession,
  FavoriteItem,
} from '@/lib/api-client';
import { Property } from '@/types/property';
import { useToast } from '@/components/ui/toast';

const BRAND_COLOR = '#04164a';

function favoriteToProperty(fav: FavoriteItem): Property {
  return {
    id: fav.property_id,
    title: fav.property_title,
    slug: fav.property_id,
    location: fav.property_location,
    city: '',
    state: '',
    price: fav.property_price,
    category: 'sale',
    propertyType: '',
    bedrooms: 0,
    bathrooms: 0,
    imageUrl: fav.property_image || '/assets/hero-primekey-homes.jpg',
    isVerified: false,
  };
}

export default function SavedPropertiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoggedIn()) {
      router.push('/login?callbackUrl=/account/saved');
      return;
    }
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFavorites();
      setFavorites(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load your saved properties.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFavorite(propertyId);
      setFavorites((prev) => prev.filter((f) => f.property_id !== propertyId));
      toast('Property removed from favorites');
    } catch {
      toast('Failed to remove property. Please try again.', 'error');
    }
  };

  const handleSignOut = () => {
    clearUserSession();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-secondary/40 py-12 px-4 md:px-8 font-body">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: BRAND_COLOR }} />
            <p className="text-sm text-[#4a607a]">Loading your saved properties...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-secondary/40 py-12 px-4 md:px-8 font-body">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-rose-600 mb-4">{error}</p>
            <Button onClick={loadFavorites} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary/40 py-12 px-4 md:px-8 font-body">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold" style={{ color: BRAND_COLOR }}>
              My Saved Properties
            </h1>
            <p className="text-sm text-[#4a607a] mt-2">
              {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-heading font-bold mb-2" style={{ color: BRAND_COLOR }}>
              No saved properties yet
            </h2>
            <p className="text-sm text-[#4a607a] mb-6">
              Browse properties and tap the heart icon to save your favorites here.
            </p>
            <Button onClick={() => router.push('/search')} style={{ backgroundColor: BRAND_COLOR }}>
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favorites.map((fav) => (
              <PropertyCard
                key={fav.id}
                property={favoriteToProperty(fav)}
                onSelectProperty={(id) => router.push(`/property/${id}`)}
                onRequireAuth={() => {}}
                onToggleFavorite={handleRemoveFavorite}
                isAuthenticated
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
