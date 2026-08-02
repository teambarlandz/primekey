import React from 'react';
import { DashboardIntake } from '@/lib/api-client';
import { getPropertyTypeLabel, formatNaira } from '@/lib/validations/propertyIntakeSchema';

const BRAND_COLOR = '#04164a';

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(dateString)
  );
}

function statusBadge(status: string): React.ReactNode {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${styles[status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
}

interface IntakeTableProps {
  intakes: DashboardIntake[];
  onReview?: (id: string, status: 'approved' | 'rejected') => void;
  busyId?: string | null;
}

export const IntakeTable: React.FC<IntakeTableProps> = ({ intakes, onReview, busyId }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-purple-100 shadow-sm bg-white/90 backdrop-blur-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-purple-100 bg-purple-50/50 text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold">
            <th className="p-4">Title</th>
            <th className="p-4">Type</th>
            <th className="p-4">Price</th>
            <th className="p-4">Location</th>
            <th className="p-4">Specs</th>
            <th className="p-4">Landlord</th>
            <th className="p-4">Status</th>
            <th className="p-4">Submitted</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="font-body text-[#22376e]">
          {intakes.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-6 text-center text-[#4a607a]">
                No property intakes match your filters.
              </td>
            </tr>
          ) : (
            intakes.map((intake) => (
              <tr key={intake.id} className="border-b border-purple-100/70 last:border-0 hover:bg-purple-50/30 transition-colors">
                <td className="p-4 font-semibold" style={{ color: BRAND_COLOR }}>{intake.title}</td>
                <td className="p-4">{getPropertyTypeLabel(intake.property_type)}</td>
                <td className="p-4">
                  {formatNaira(Number(intake.price))}
                  {intake.is_negotiable && <span className="ml-1 text-xs text-emerald-600">(negotiable)</span>}
                </td>
                <td className="p-4">{intake.area}, {intake.city}</td>
                <td className="p-4">{intake.bedrooms} bed • {intake.bathrooms} bath</td>
                <td className="p-4">
                  <div>{intake.landlord_name}</div>
                  <div className="text-xs text-[#4a607a]">{intake.landlord_phone}</div>
                </td>
                <td className="p-4">{statusBadge(intake.status)}</td>
                <td className="p-4 text-[#4a607a]">{formatDate(intake.created_at)}</td>
                <td className="p-4">
                  {intake.status === 'submitted' && onReview && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReview(intake.id, 'approved')}
                        disabled={busyId === intake.id}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReview(intake.id, 'rejected')}
                        disabled={busyId === intake.id}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
