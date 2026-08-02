import React from 'react';
import { DashboardLandlord } from '@/lib/api-client';
import { Eye } from 'lucide-react';

const BRAND_COLOR = '#04164a';

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(dateString)
  );
}

function statusBadge(status: string): React.ReactNode {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${styles[status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
}

interface LeadTableProps {
  leads: DashboardLandlord[];
  onView?: (lead: DashboardLandlord) => void;
  onVerify?: (id: string, status: 'approved' | 'rejected') => void;
  busyId?: string | null;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onView, onVerify, busyId }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-purple-100 shadow-sm bg-white/90 backdrop-blur-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-purple-100 bg-purple-50/50 text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold">
            <th className="p-4">Landlord</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Properties</th>
            <th className="p-4">Intakes</th>
            <th className="p-4">Appointments</th>
            <th className="p-4">Status</th>
            <th className="p-4">Registered</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="font-body text-[#22376e]">
          {leads.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-6 text-center text-[#4a607a]">
                No landlord leads match your filters.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id} className="border-b border-purple-100/70 last:border-0 hover:bg-purple-50/30 transition-colors">
                <td className="p-4">
                  <button
                    onClick={() => onView?.(lead)}
                    className="font-semibold hover:underline text-left"
                    style={{ color: BRAND_COLOR }}
                  >
                    {lead.full_name}
                  </button>
                </td>
                <td className="p-4">
                  <div>{lead.phone}</div>
                  {lead.email && <div className="text-xs text-[#4a607a]">{lead.email}</div>}
                </td>
                <td className="p-4">{lead.property_count}</td>
                <td className="p-4">{lead.intake_count}</td>
                <td className="p-4">{lead.appointment_count}</td>
                <td className="p-4">{statusBadge(lead.verification_status)}</td>
                <td className="p-4 text-[#4a607a]">{formatDate(lead.created_at)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {lead.verification_status === 'pending' && onVerify && (
                      <>
                        <button
                          onClick={() => onVerify(lead.id, 'approved')}
                          disabled={busyId === lead.id}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onVerify(lead.id, 'rejected')}
                          disabled={busyId === lead.id}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {onView && (
                      <button
                        onClick={() => onView(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-purple-200 hover:bg-purple-50 transition-colors"
                        style={{ color: BRAND_COLOR }}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
