'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DashboardLandlord,
  DashboardIntake,
  DashboardAppointment,
} from '@/lib/api-client';
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
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${styles[status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
}

interface LeadDetailProps {
  lead: DashboardLandlord | null;
  intakes: DashboardIntake[];
  appointments: DashboardAppointment[];
  onOpenChange: (open: boolean) => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ lead, intakes, appointments, onOpenChange }) => {
  const relatedIntakes = lead ? intakes.filter((i) => i.landlord_phone === lead.phone) : [];
  const relatedAppointments = lead ? appointments.filter((a) => a.landlord_phone === lead.phone) : [];

  return (
    <Dialog open={!!lead} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {lead && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg" style={{ color: BRAND_COLOR }}>
                {lead.full_name}
              </DialogTitle>
              <DialogDescription>
                Landlord lead · registered {formatDate(lead.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Phone', value: lead.phone },
                  { label: 'Email', value: lead.email || '—' },
                  { label: 'ID Type', value: lead.id_type.replace('_', ' ') },
                  { label: 'Properties to list', value: String(lead.property_count) },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-[#f3f0ff]/60 border border-purple-100">
                    <p className="text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold mb-1">{item.label}</p>
                    <p className="text-sm font-semibold" style={{ color: BRAND_COLOR }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-bold font-heading mb-2" style={{ color: BRAND_COLOR }}>
                  Property Intakes ({relatedIntakes.length})
                </h3>
                {relatedIntakes.length === 0 ? (
                  <p className="text-sm text-[#4a607a]">No intakes yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {relatedIntakes.map((intake) => (
                      <li key={intake.id} className="p-3 rounded-xl bg-white border border-purple-100 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: BRAND_COLOR }}>{intake.title}</p>
                          <p className="text-xs text-[#4a607a]">
                            {getPropertyTypeLabel(intake.property_type)} · {intake.area}, {intake.city} · {formatNaira(Number(intake.price))}
                          </p>
                        </div>
                        {statusBadge(intake.status)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold font-heading mb-2" style={{ color: BRAND_COLOR }}>
                  Appointments ({relatedAppointments.length})
                </h3>
                {relatedAppointments.length === 0 ? (
                  <p className="text-sm text-[#4a607a]">No appointments yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {relatedAppointments.map((appointment) => (
                      <li key={appointment.id} className="p-3 rounded-xl bg-white border border-purple-100 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold" style={{ color: BRAND_COLOR }}>
                            {formatDate(appointment.preferred_date)} at {appointment.time_slot}
                          </p>
                          <p className="text-xs text-[#4a607a] capitalize">{appointment.tour_type.replace('_', ' ')} tour</p>
                        </div>
                        {statusBadge(appointment.status)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
