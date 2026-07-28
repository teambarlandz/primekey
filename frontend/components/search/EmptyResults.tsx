'use client';

import React from 'react';
import { Sparkles, ArrowLeft, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyResultsProps {
  location: string;
  onOpenConcierge: () => void;
  onResetSearch: () => void;
}

export const EmptyResults: React.FC<EmptyResultsProps> = ({
  location,
  onOpenConcierge,
  onResetSearch,
}) => {
  const displayLocation = location.trim() || 'this location';

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 md:p-12 text-center max-w-2xl mx-auto my-12 shadow-sm space-y-6">
      {/* Icon Badge */}
      <div className="w-16 h-16 bg-[#04164a]/5 rounded-2xl flex items-center justify-center mx-auto text-[#04164a] shadow-xs">
        <Building2 className="w-8 h-8" />
      </div>

      {/* Message Title & Contextual Explanation */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" /> Sourcing Available in {displayLocation}
        </div>
        <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#04164a]">
          No instant public listings in {displayLocation} yet
        </h3>
        <p className="font-body text-slate-600 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
          We are currently expanding our inventory to { displayLocation }. Let our dedicated Concierge Desk manually source verified properties matching your exact specifications within 14 days.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {/* Safe Back Navigation */}
        <Button
          variant="outline"
          onClick={onResetSearch}
          className="w-full sm:w-auto font-heading text-xs md:text-sm border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Properties
        </Button>

        {/* Concierge Trigger */}
        <Button
          onClick={onOpenConcierge}
          className="w-full sm:w-auto bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-xs md:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Request Concierge Match
        </Button>
      </div>
    </div>
  );
};
