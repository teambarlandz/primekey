'use client';

import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

const POPULAR_LOCATIONS = [
  'Lekki Phase 1',
  'Ikoyi',
  'Victoria Island',
  'Ikeja GRA',
  'Maitama, Abuja',
  'Wuse II, Abuja',
  'Port Harcourt GRA',
  'Abeokuta',
  'Warri',
];

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch }) => {
  return (
    <div className="w-full space-y-3">
      <div className="relative flex items-center shadow-sm rounded-xl overflow-hidden bg-white border border-slate-200 focus-within:border-[#04164a] focus-within:ring-2 focus-within:ring-[#04164a]/20 transition-all">
        <MapPin className="absolute left-4 w-5 h-5 text-[#04164a]/60 pointer-events-none" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="Enter city, neighborhood, or landmark (e.g. Abeokuta, Port Harcourt GRA, Lekki)..."
          className="w-full pl-12 pr-28 py-6 border-0 focus-visible:ring-0 font-body text-slate-800 placeholder:text-slate-400 text-sm md:text-base"
        />
        <Button
          onClick={onSearch}
          className="absolute right-2 bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>

      {/* Quick Location Pill Tags */}
      <div className="flex items-center gap-2 flex-wrap text-xs font-body">
        <span className="text-slate-500 font-medium mr-1">Popular:</span>
        {POPULAR_LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => {
              onChange(loc);
              onSearch();
            }}
            className={`px-3 py-1 rounded-full border transition-all ${
              value === loc
                ? 'bg-[#04164a] text-white border-[#04164a]'
                : 'bg-white/80 text-slate-700 border-slate-200 hover:border-[#04164a] hover:text-[#04164a]'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
};
