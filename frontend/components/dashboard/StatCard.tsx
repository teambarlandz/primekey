import React from 'react';

const BRAND_COLOR = '#04164a';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accent = 'bg-[#f3f0ff]' }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
        style={{ color: BRAND_COLOR }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold font-heading" style={{ color: BRAND_COLOR }}>
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-[#4a607a] font-body">{label}</p>
      </div>
    </div>
  );
};
