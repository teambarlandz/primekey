'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface PriceRangeProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
}

export const PriceRange: React.FC<PriceRangeProps> = ({ minPrice, maxPrice, onChange }) => {
  const formatNaira = (val: number) => {
    if (val >= 1000000000) return `₦${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(0)}M`;
    return `₦${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-2 font-body">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#04164a]" /> Max Price Filter
        </span>
        <span className="text-[#04164a] font-bold bg-[#04164a]/5 px-2.5 py-1 rounded-md">
          Up to {formatNaira(maxPrice)}
        </span>
      </div>

      {/* Active Range Slider */}
      <input
        type="range"
        min={10000000}
        max={1500000000}
        step={10000000}
        value={maxPrice}
        onChange={(e) => onChange(minPrice, Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#04164a]"
      />

      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
        <span>₦10M</span>
        <span>₦500M</span>
        <span>₦1.5B+</span>
      </div>
    </div>
  );
};
