'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface PriceRangeProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
}

const ABSOLUTE_MIN = 0;
const ABSOLUTE_MAX = 1500000000; // ₦1.5B
const STEP = 10000000; // ₦10M steps

export const PriceRange: React.FC<PriceRangeProps> = ({ minPrice, maxPrice, onChange }) => {
  const formatNaira = (val: number) => {
    if (val >= 1000000000) return `₦${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(0)}M`;
    return `₦${val.toLocaleString()}`;
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    // Ensure min doesn't exceed max minus one step
    if (newMin <= maxPrice - STEP) {
      onChange(newMin, maxPrice);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    // Ensure max doesn't drop below min plus one step
    if (newMax >= minPrice + STEP) {
      onChange(minPrice, newMax);
    }
  };

  // Calculate percentage positions for the active visual track highlight
  const minPercent = ((minPrice - ABSOLUTE_MIN) / (ABSOLUTE_MAX - ABSOLUTE_MIN)) * 100;
  const maxPercent = ((maxPrice - ABSOLUTE_MIN) / (ABSOLUTE_MAX - ABSOLUTE_MIN)) * 100;

  return (
    <div className="space-y-3 font-body">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#04164a]" /> Price Range Filter
        </span>
        <span className="text-[#04164a] font-bold bg-[#04164a]/5 px-2.5 py-1 rounded-md">
          {formatNaira(minPrice)} - {formatNaira(maxPrice)}
        </span>
      </div>

      {/* Dual-Thumb Slider Container */}
      <div className="relative py-2">
        {/* Background Track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-slate-200 rounded-lg pointer-events-none" />

        {/* Active Highlight Track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-[#04164a] rounded-lg pointer-events-none"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Hidden / Layered Native Range Inputs */}
        <input
          type="range"
          min={ABSOLUTE_MIN}
          max={ABSOLUTE_MAX}
          step={STEP}
          value={minPrice}
          onChange={handleMinChange}
          aria-label="Minimum Price Range"
          className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#04164a] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#04164a] [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: minPrice > ABSOLUTE_MAX - 100000000 ? 20 : 10 }}
        />

        <input
          type="range"
          min={ABSOLUTE_MIN}
          max={ABSOLUTE_MAX}
          step={STEP}
          value={maxPrice}
          onChange={handleMaxChange}
          aria-label="Maximum Price Range"
          className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#04164a] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#04164a] [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: 15 }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
        <span>₦0</span>
        <span>₦750M</span>
        <span>₦1.5B+</span>
      </div>
    </div>
  );
};
