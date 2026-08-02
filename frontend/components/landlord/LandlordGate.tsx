'use client';

import React from 'react';
import Link from 'next/link';
import { UserRoundPlus, ArrowRight } from 'lucide-react';

const BRAND_COLOR = '#04164a';

interface LandlordGateProps {
  landlordId: string | null;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const LandlordGate: React.FC<LandlordGateProps> = ({
  landlordId,
  title = 'Landlord registration required',
  description = 'Please complete your free landlord registration first. We need your verified profile to match you with serious buyers and tenants.',
  children,
}) => {
  if (landlordId) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-lg mx-auto text-center bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-md p-10">
      <div
        className="mx-auto w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-6"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        <UserRoundPlus className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-bold font-heading mb-3" style={{ color: BRAND_COLOR }}>
        {title}
      </h2>
      <p className="text-[#4a607a] font-body leading-relaxed mb-8">
        {description}
      </p>
      <Link
        href="/landlord/register"
        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-semibold font-heading text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-95"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        Register as a landlord
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
