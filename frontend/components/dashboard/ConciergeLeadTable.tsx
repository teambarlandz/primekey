import React from 'react';
import { DashboardLead } from '@/lib/api-client';
import { AlertTriangle } from 'lucide-react';

const BRAND_COLOR = '#04164a';

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(dateString)
  );
}

function formatNaira(value: number): string {
  if (!value) return '—';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

function tierBadge(tier: string | null): React.ReactNode {
  if (!tier) {
    return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">N/A</span>;
  }
  const styles: Record<string, string> = {
    HOT: 'bg-rose-100 text-rose-800 border-rose-200',
    WARM: 'bg-amber-100 text-amber-800 border-amber-200',
    COLD: 'bg-sky-100 text-sky-800 border-sky-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[tier]}`}>
      {tier}
    </span>
  );
}

function statusBadge(status: string): React.ReactNode {
  const labels: Record<string, string> = {
    active_sla_queue: 'Active SLA Queue',
    assigned: 'Assigned',
    contacted: 'Contacted',
    closed_won: 'Closed (Matched)',
    closed_lost: 'Closed (Unmatched)',
    erased_ndpr: 'Erased (NDPR)',
  };
  const styles: Record<string, string> = {
    active_sla_queue: 'bg-amber-100 text-amber-800 border-amber-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    contacted: 'bg-purple-100 text-purple-800 border-purple-200',
    closed_won: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    closed_lost: 'bg-rose-100 text-rose-800 border-rose-200',
    erased_ndpr: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {labels[status] ?? status}
    </span>
  );
}

interface ConciergeLeadTableProps {
  leads: DashboardLead[];
}

export const ConciergeLeadTable: React.FC<ConciergeLeadTableProps> = ({ leads }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-purple-100 shadow-sm bg-white/90 backdrop-blur-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-purple-100 bg-purple-50/50 text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold">
            <th className="p-4">Lead</th>
            <th className="p-4">Tier</th>
            <th className="p-4">Score</th>
            <th className="p-4">Target</th>
            <th className="p-4">Budget</th>
            <th className="p-4">Status</th>
            <th className="p-4">SLA</th>
            <th className="p-4">Created</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-[#4a607a] font-body">
                No concierge leads yet.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id} className="border-b border-purple-50 last:border-0 hover:bg-purple-50/40 transition-colors">
                <td className="p-4">
                  <p className="font-semibold font-heading" style={{ color: BRAND_COLOR }}>{lead.full_name}</p>
                  <p className="text-xs text-[#4a607a] font-body">{lead.phone}</p>
                  {lead.email && <p className="text-xs text-[#4a607a] font-body">{lead.email}</p>}
                </td>
                <td className="p-4">{tierBadge(lead.tier)}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 font-semibold font-heading" style={{ color: BRAND_COLOR }}>
                    {lead.priority_score}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-[#22376e] font-body">{lead.preferred_location}</p>
                  <p className="text-xs text-[#4a607a] font-body capitalize">{lead.property_type?.replace('_', ' ')}</p>
                </td>
                <td className="p-4 text-[#22376e] font-body">{formatNaira(lead.budget_max)}</td>
                <td className="p-4">{statusBadge(lead.status)}</td>
                <td className="p-4">
                  {lead.is_sla_breached ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-rose-100 text-rose-800 border-rose-200">
                      <AlertTriangle className="w-3 h-3" />
                      Breached
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-[#4a607a] font-body">
                      {lead.sla_remaining_minutes != null ? (
                        <>
                          {lead.sla_remaining_minutes <= 0 ? 'Due now' : `${lead.sla_remaining_minutes} min`}
                          <span className="text-slate-400">({formatDate(lead.sla_deadline)})</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </span>
                  )}
                </td>
                <td className="p-4 text-xs text-[#4a607a] font-body">{formatDate(lead.created_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
