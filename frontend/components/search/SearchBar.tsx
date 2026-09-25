'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  onSelectSuggestion: (loc: string) => void;
}

const SUGGESTED_LOCATIONS = [
  'Lekki Phase 1',
  'Ikoyi',
  'Victoria Island',
  'Maitama',
  'Banana Island',
  'Epe',
  'Abeokuta',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onSelectSuggestion,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = SUGGESTED_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative space-y-3 font-body">
      <div className="relative flex items-center">
        <MapPin className="absolute left-4 w-5 h-5 text-[#04164a]" />
        <Input
          data-testid="location-filter"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsFocused(false);
              onSearch();
            }
          }}
          placeholder="Search location (e.g. Lekki, Ikoyi, Abeokuta, Warri)..."
          className="pl-12 pr-28 py-6 text-sm md:text-base rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-[#04164a] shadow-xs"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-24 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <Button
          onClick={() => {
            setIsFocused(false);
            onSearch();
          }}
          className="absolute right-2 bg-[#04164a] hover:bg-[#04164a]/90 text-white px-4 py-2.5 rounded-xl font-heading text-xs md:text-sm h-10 flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" /> Search
        </Button>
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Popular Destinations:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {filteredSuggestions.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                setIsFocused(false);
                onSelectSuggestion(loc);
              }}
              className="text-xs bg-slate-100 hover:bg-[#04164a] hover:text-white text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium flex items-center gap-1 shadow-2xs"
            >
              <MapPin className="w-3 h-3 opacity-70" /> {loc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
