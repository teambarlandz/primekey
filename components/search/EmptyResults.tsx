'use client';

import React from 'react';
import { SearchX, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyResultsProps {
  onOpenConcierge: () => void;
  location?: string;
}

export const EmptyResults: React.FC<EmptyResultsProps> = ({ onOpenConcierge, location }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-8 md:p-12 text-center space-y-5 max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 bg-[#f3f0ff] text-[#04164a] rounded-full flex items-center justify-center mx-auto">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-xl md:text-2xl font-bold text-[#04164a]">
          No Properties Found {location ? `in "${location}"` : ''}
        </h3>
        <p className="font-body text-slate-600 text-xs md:text-sm max-w-md mx-auto">
          We couldn't find active listings matching your exact criteria right now. Don't worry—our 2-Week Concierge team can source unlisted inventory for you.
        </p>
      </div>

      <div className="pt-2">
        <Button
          onClick={onOpenConcierge}
          className="bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-sm px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Sparkles className="w-4 h-4" /> Activate 2-Week Concierge
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
