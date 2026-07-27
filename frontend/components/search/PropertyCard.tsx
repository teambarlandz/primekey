'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, MapPin, Bed, Bath, ShieldCheck, Calendar } from 'lucide-react';
import { Property } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PropertyCardProps {
  property: Property;
  onSelectProperty: (id: string) => void;
  onRequireAuth: (actionName: string) => void;
  isAuthenticated?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelectProperty,
  onRequireAuth,
  isAuthenticated = false,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (amount: number, category: string) => {
    const formatted = `₦${amount.toLocaleString()}`;
    if (category === 'rent') return `${formatted} / year`;
    if (category === 'short_let') return `${formatted} / night`;
    return formatted;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onRequireAuth('Save Property');
      return;
    }
    setIsFavorited(!isFavorited);
  };

  const handleBookTourClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onRequireAuth('Book Inspection Tour');
      return;
    }
    // Proceed to tour booking modal/flow
    console.log('Opening inspection booking for:', property.id);
  };

  return (
    <div
      onClick={() => onSelectProperty(property.id)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Banner Container */}
      <div className="relative w-full h-56 bg-slate-100 overflow-hidden">
        <Image
          src={property.imageUrl}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Top Overlay Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
          <Badge className="bg-[#04164a] text-white font-heading text-[11px] capitalize px-2.5 py-1">
            For {property.category.replace('_', ' ')}
          </Badge>
          {property.isVerified && (
            <Badge className="bg-emerald-600 text-white font-heading text-[11px] flex items-center gap-1 px-2.5 py-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </Badge>
          )}
        </div>

        {/* Favorite Heart Trigger (Auth Protected) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 hover:text-rose-600 transition-all shadow-sm"
          aria-label="Save to Favorites"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#04164a]/95 backdrop-blur-md text-white font-heading px-3 py-1.5 rounded-xl text-sm font-bold shadow-md">
          {formatPrice(property.price, property.category)}
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-heading text-lg font-bold text-[#04164a] line-clamp-1 group-hover:text-blue-900 transition-colors">
            {property.title}
          </h3>
          <p className="font-body text-xs text-slate-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{property.location}, {property.city}</span>
          </p>
        </div>

        {/* Specs Pill List */}
        <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 font-body text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-[#04164a]/70" />
            <span>{property.bedrooms > 0 ? `${property.bedrooms} Bedrooms` : 'Self-Contain'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-[#04164a]/70" />
            <span>{property.bathrooms} Bathrooms</span>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="pt-1 flex items-center justify-between gap-3">
          <span className="font-body text-[11px] text-slate-500 capitalize">
            {property.propertyType.replace(/_/g, ' ')}
          </span>
          <Button
            size="sm"
            onClick={handleBookTourClick}
            className="bg-slate-100 hover:bg-[#04164a] text-[#04164a] hover:text-white font-heading text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" /> Book Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};
