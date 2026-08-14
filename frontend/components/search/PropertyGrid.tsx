'use client';

import React from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from '@/components/search/PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  onSelectProperty: (id: string) => void;
  onRequireAuth: (actionName: string, propertyId?: string) => void;
  isAuthenticated?: boolean;
  favoritedIds?: Set<string>;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  isLoading = false,
  onSelectProperty,
  onRequireAuth,
  isAuthenticated = false,
  favoritedIds,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-96 border border-slate-200 animate-pulse p-4 space-y-4">
            <div className="w-full h-48 bg-slate-200 rounded-xl" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-10 bg-slate-100 rounded-xl mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onSelectProperty={onSelectProperty}
          onRequireAuth={onRequireAuth}
          isAuthenticated={isAuthenticated}
          isFavorited={favoritedIds?.has(property.id) ?? false}
        />
      ))}
    </div>
  );
};
