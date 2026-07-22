'use client';

import React from 'react';
import { Home, Bed } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterDropdownProps {
  propertyType: string;
  bedrooms: string;
  onPropertyTypeChange: (value: string) => void;
  onBedroomsChange: (value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  propertyType,
  bedrooms,
  onPropertyTypeChange,
  onBedroomsChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Property Type Dropdown */}
      <div className="space-y-1.5">
        <label className="font-body text-xs font-semibold text-[#04164a] flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" /> Property Type
        </label>
        <Select
          value={propertyType}
          onValueChange={(val: string | null) => onPropertyTypeChange(val ?? 'any')}
        >
          <SelectTrigger className="w-full bg-white border-slate-200 font-body text-slate-800 rounded-xl focus:ring-[#04164a]/20 h-11">
            <SelectValue placeholder="All Property Types" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 font-body max-h-80">
            <SelectItem value="any">All Property Types</SelectItem>

            {/* Student & Single Living */}
            <SelectGroup>
              <SelectLabel className="text-[11px] font-bold text-[#04164a] uppercase tracking-wider bg-slate-50 px-2 py-1 my-1">
                Student & Single Living
              </SelectLabel>
              <SelectItem value="self_contain">Self-Contain / Studio Flat</SelectItem>
              <SelectItem value="room_and_parlour">Room & Parlour Self-Contain</SelectItem>
              <SelectItem value="single_room">Single Room / Tenement</SelectItem>
              <SelectItem value="bq">Boys' Quarters (BQ)</SelectItem>
              <SelectItem value="short_let">Short Let / Serviced Unit</SelectItem>
            </SelectGroup>

            {/* Standard Family Homes */}
            <SelectGroup>
              <SelectLabel className="text-[11px] font-bold text-[#04164a] uppercase tracking-wider bg-slate-50 px-2 py-1 my-1">
                Standard Family Homes
              </SelectLabel>
              <SelectItem value="flat">Standard Flat / Apartment</SelectItem>
              <SelectItem value="maisonette">Maisonette</SelectItem>
              <SelectItem value="bungalow">Bungalow (Detached / Semi)</SelectItem>
            </SelectGroup>

            {/* Luxury & Duplexes */}
            <SelectGroup>
              <SelectLabel className="text-[11px] font-bold text-[#04164a] uppercase tracking-wider bg-slate-50 px-2 py-1 my-1">
                Luxury & Duplexes
              </SelectLabel>
              <SelectItem value="terrace_duplex">Terraced Duplex / Townhouse</SelectItem>
              <SelectItem value="semi_detached_duplex">Semi-Detached Duplex</SelectItem>
              <SelectItem value="fully_detached_duplex">Fully Detached Duplex</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="mansion">Mansion / Luxury Villa</SelectItem>
            </SelectGroup>

            {/* Commercial & Land */}
            <SelectGroup>
              <SelectLabel className="text-[11px] font-bold text-[#04164a] uppercase tracking-wider bg-slate-50 px-2 py-1 my-1">
                Land & Commercial
              </SelectLabel>
              <SelectItem value="land">Residential / Commercial Land</SelectItem>
              <SelectItem value="commercial">Shop / Office / Commercial Space</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Bedroom Count Dropdown */}
      <div className="space-y-1.5">
        <label className="font-body text-xs font-semibold text-[#04164a] flex items-center gap-1.5">
          <Bed className="w-3.5 h-3.5" /> Bedrooms
        </label>
        <Select
          value={bedrooms}
          onValueChange={(val: string | null) => onBedroomsChange(val ?? 'any')}
        >
          <SelectTrigger className="w-full bg-white border-slate-200 font-body text-slate-800 rounded-xl focus:ring-[#04164a]/20 h-11">
            <SelectValue placeholder="Any Bedrooms" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 font-body">
            <SelectItem value="any">Any Bedrooms / Self-Contain</SelectItem>
            <SelectItem value="1">1 Bedroom</SelectItem>
            <SelectItem value="2">2 Bedrooms</SelectItem>
            <SelectItem value="3">3 Bedrooms</SelectItem>
            <SelectItem value="4">4 Bedrooms</SelectItem>
            <SelectItem value="5+">5+ Bedrooms</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
