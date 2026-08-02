import React from 'react';
import { DashboardAppointment } from '@/lib/api-client';
import { formatAppointmentDate } from '@/lib/validations/appointmentSchema';

const BRAND_COLOR = '#04164a';

function statusBadge(status: string): React.ReactNode {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${styles[status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
}

interface AppointmentTableProps {
  appointments: DashboardAppointment[];
  onUpdate?: (id: string, payload: { status?: string }) => void;
  busyId?: string | null;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments, onUpdate, busyId }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-purple-100 shadow-sm bg-white/90 backdrop-blur-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-purple-100 bg-purple-50/50 text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold">
            <th className="p-4">Date</th>
            <th className="p-4">Time</th>
            <th className="p-4">Tour</th>
            <th className="p-4">Landlord</th>
            <th className="p-4">Notes</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="font-body text-[#22376e]">
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-[#4a607a]">
                No appointments match your filters.
              </td>
            </tr>
          ) : (
            appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b border-purple-100/70 last:border-0 hover:bg-purple-50/30 transition-colors">
                <td className="p-4 font-semibold" style={{ color: BRAND_COLOR }}>
                  {formatAppointmentDate(appointment.preferred_date)}
                </td>
                <td className="p-4">{appointment.time_slot}</td>
                <td className="p-4 capitalize">{appointment.tour_type.replace('_', ' ')}</td>
                <td className="p-4">
                  <div>{appointment.landlord_name}</div>
                  <div className="text-xs text-[#4a607a]">{appointment.landlord_phone}</div>
                </td>
                <td className="p-4 max-w-[220px] truncate text-[#4a607a]" title={appointment.notes}>
                  {appointment.notes || '—'}
                </td>
                <td className="p-4">{statusBadge(appointment.status)}</td>
                <td className="p-4">
                  {appointment.status === 'pending' && onUpdate && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdate(appointment.id, { status: 'confirmed' })}
                        disabled={busyId === appointment.id}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => onUpdate(appointment.id, { status: 'cancelled' })}
                        disabled={busyId === appointment.id}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 transition-colors disabled:opacity-50"
                      >
                        Cancel
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
