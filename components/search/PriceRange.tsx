'use client';

import React from 'react';
import { Banknote } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface PriceRangeProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
}

const MAX_LIMIT = 500000000; // ₦500 Million

export const PriceRange: React.FC<PriceRangeProps> = ({
  minPrice,
  maxPrice,
  onChange,
}) => {
  const formatNaira = (amount: number) => {
    if (amount >= 1000000000) return `₦${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}k`;
    return `₦${amount}`;
  };

  const handleSliderChange = (val: number | readonly number[]) => {
    if (Array.isArray(val)) {
      const min = val[0] ?? 0;
      const max = val[1] ?? MAX_LIMIT;
      onChange(min, max);
    }
  };

  return (
    <div className="space-y-3 font-body">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-[#04164a] flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5" /> Budget Range
        </label>
        <span className="font-bold text-[#04164a]">
          {formatNaira(minPrice)} - {maxPrice >= MAX_LIMIT ? `${formatNaira(MAX_LIMIT)}+` : formatNaira(maxPrice)}
        </span>
      </div>

      <Slider
        value={[minPrice, maxPrice]}
        min={0}
        max={MAX_LIMIT}
        step={5000000} // ₦5 Million increments
        onValueChange={handleSliderChange}
        className="my-2"
      />

      <div className="flex justify-between text-[11px] text-slate-400">
        <span>₦0</span>
        <span>₦500M+</span>
      </div>
    </div>
  );
};
