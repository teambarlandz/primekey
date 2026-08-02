'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Home,
  CalendarCheck,
  ShieldCheck,
  Plus,
  AlertCircle,
  RefreshCw,
  Download,
  Trash2,
  PhoneCall,
  CalendarClock,
  Building2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import {
  getStoredLandlordId,
  fetchLandlordProfile,
  fetchLandlordIntakes,
  fetchLandlordAppointments,
  updateLandlordAppointment,
  LandlordProfile,
  LandlordIntake,
  LandlordAppointment,
} from '@/lib/api-client';
import { LandlordGate } from '@/components/landlord/LandlordGate';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { getPropertyTypeLabel, formatNaira } from '@/lib/validations/propertyIntakeSchema';
import { formatAppointmentDate, APPOINTMENT_TIME_SLOTS } from '@/lib/validations/appointmentSchema';

const BRAND_COLOR = '#04164a';

function statusBadge(status: string): React.ReactNode {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${styles[status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
}

export default function LandlordDashboardPage() {
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [intakes, setIntakes] = useState<LandlordIntake[]>([]);
  const [appointments, setAppointments] = useState<LandlordAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [rescheduling, setRescheduling] = useState<LandlordAppointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const loadAll = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, intakesData, appointmentsData] = await Promise.all([
        fetchLandlordProfile(id),
        fetchLandlordIntakes(id),
        fetchLandlordAppointments(id),
      ]);
      setProfile(profileData);
      setIntakes(intakesData);
      setAppointments(appointmentsData);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = typeof window !== 'undefined' ? getStoredLandlordId() : null;
    setLandlordId(id);
    if (id) {
      loadAll(id);
    } else {
      setLoading(false);
    }
  }, []);

  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.portal-anim', { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.portal-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, ease: ANIMATION_TOKENS.ease, duration: ANIMATION_TOKENS.duration }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setBusy(true);
    try {
      await updateLandlordAppointment(id, { status: 'cancelled' });
      await loadAll(landlordId as string);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to cancel appointment.');
    } finally {
      setBusy(false);
    }
  };

  const openReschedule = (appointment: LandlordAppointment) => {
    setRescheduling(appointment);
    setRescheduleDate(appointment.preferred_date);
    setRescheduleSlot(appointment.time_slot);
    setRescheduleError(null);
  };

  const handleReschedule = async () => {
    if (!rescheduling || !rescheduleDate || !rescheduleSlot) return;
    setRescheduleError(null);
    setBusy(true);
    try {
      await updateLandlordAppointment(rescheduling.id, {
        preferred_date: rescheduleDate,
        time_slot: rescheduleSlot,
      });
      setRescheduling(null);
      await loadAll(landlordId as string);
    } catch (e: any) {
      setRescheduleError(e?.message ?? 'Failed to reschedule appointment.');
    } finally {
      setBusy(false);
    }
  };

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-[#f3f0ff] overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="portal-anim opacity-0 text-center mb-10">
            <div
              className="mx-auto w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-5"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <Building2 className="w-7 h-7" />
            </div>
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-3">
              Landlord Portal
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight mb-2" style={{ color: BRAND_COLOR }}>
              {profile ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Your Landlord Dashboard'}
            </h1>
            {profile && (
              <p className="inline-flex items-center gap-2 mt-2">
                <span className="text-sm text-[#4a607a] font-body">Verification:</span>
                {statusBadge(profile.verification_status)}
              </p>
            )}
          </header>

          <div className="portal-anim opacity-0">
            <LandlordGate landlordId={landlordId}>
              {error && (
                <div className="mb-6 flex items-start gap-2 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-24 text-[#4a607a]">
                  <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                  Loading your portal…
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Notifications */}
                  {landlordId && (
                    <NotificationsPanel recipientType="landlord" recipientId={landlordId} />
                  )}

                  {/* Quick actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                      href="/landlord/intake"
                      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#f3f0ff] flex items-center justify-center shrink-0" style={{ color: BRAND_COLOR }}>
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold font-heading" style={{ color: BRAND_COLOR }}>Add a Property</p>
                        <p className="text-xs text-[#4a607a] font-body">Submit a new listing</p>
                      </div>
                    </Link>
                    <Link
                      href="/landlord/inspection-booking"
                      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#f3f0ff] flex items-center justify-center shrink-0" style={{ color: BRAND_COLOR }}>
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold font-heading" style={{ color: BRAND_COLOR }}>Book Inspection</p>
                        <p className="text-xs text-[#4a607a] font-body">Schedule a consultation</p>
                      </div>
                    </Link>
                    <Link
                      href="/contact"
                      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#f3f0ff] flex items-center justify-center shrink-0" style={{ color: BRAND_COLOR }}>
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold font-heading" style={{ color: BRAND_COLOR }}>Talk to a Manager</p>
                        <p className="text-xs text-[#4a607a] font-body">Get support</p>
                      </div>
                    </Link>
                  </div>

                  {/* My Listings */}
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold font-heading mb-4" style={{ color: BRAND_COLOR }}>
                      <Home className="w-5 h-5" />
                      My Listings ({intakes.length})
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-purple-100 shadow-sm bg-white/90 backdrop-blur-sm">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-purple-100 bg-purple-50/50 text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold">
                            <th className="p-4">Title</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="font-body text-[#22376e]">
                          {intakes.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-[#4a607a]">
                                You haven't listed any properties yet.{' '}
                                <Link href="/landlord/intake" className="underline font-semibold" style={{ color: BRAND_COLOR }}>
                                  Add your first property
                                </Link>
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
                                <td className="p-4">{statusBadge(intake.status)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* My Appointments */}
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold font-heading mb-4" style={{ color: BRAND_COLOR }}>
                      <CalendarCheck className="w-5 h-5" />
                      My Appointments ({appointments.length})
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-purple-100 shadow-sm bg-white/90 backdrop-blur-sm">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-purple-100 bg-purple-50/50 text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold">
                            <th className="p-4">Date</th>
                            <th className="p-4">Time</th>
                            <th className="p-4">Tour</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="font-body text-[#22376e]">
                          {appointments.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-[#4a607a]">
                                No appointments booked yet.{' '}
                                <Link href="/landlord/inspection-booking" className="underline font-semibold" style={{ color: BRAND_COLOR }}>
                                  Book a consultation
                                </Link>
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
                                <td className="p-4">{statusBadge(appointment.status)}</td>
                                <td className="p-4">
                                  {appointment.status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openReschedule(appointment)}
                                        disabled={busy}
                                        className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-purple-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
                                        style={{ color: BRAND_COLOR }}
                                      >
                                        Reschedule
                                      </button>
                                      <button
                                        onClick={() => handleCancel(appointment.id)}
                                        disabled={busy}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 transition-colors disabled:opacity-50"
                                      >
                                        <Trash2 className="w-3 h-3" />
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
                  </div>

                  {/* NDPR data rights */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6">
                    <h2 className="flex items-center gap-2 text-xl font-bold font-heading mb-2" style={{ color: BRAND_COLOR }}>
                      <ShieldCheck className="w-5 h-5" />
                      Your data & privacy
                    </h2>
                    <p className="text-sm text-[#4a607a] font-body mb-4">
                      Primekey Homes processes your information under the Nigeria Data Protection Act. You can exercise your data subject rights at any time.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="/ndpr"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-purple-200 bg-[#f3f0ff]/60 hover:bg-white text-sm font-semibold font-heading transition-colors"
                        style={{ color: BRAND_COLOR }}
                      >
                        <Download className="w-4 h-4" />
                        Request a copy of my data
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-sm font-semibold font-heading transition-colors"
                        style={{ color: '#b91c1c' }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Request erasure of my data
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </LandlordGate>
          </div>
        </div>
      </section>

      {/* Reschedule dialog */}
      <Dialog open={!!rescheduling} onOpenChange={(open) => { if (!open) setRescheduling(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: BRAND_COLOR }}>Reschedule appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time slot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {rescheduleError && (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{rescheduleError}</span>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-[#04164a] block mb-1.5">New Date</label>
              <Input
                type="date"
                value={rescheduleDate}
                min={minDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="border-slate-200 rounded-xl focus:ring-[#04164a]/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#04164a] block mb-1.5">New Time Slot</label>
              <Select onValueChange={(value) => value && setRescheduleSlot(value)} value={rescheduleSlot}>
                <SelectTrigger className="h-11 border-slate-200 rounded-xl focus:ring-[#04164a]/20 w-full" aria-label="Select time slot">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {APPOINTMENT_TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleReschedule}
              disabled={busy || !rescheduleDate || !rescheduleSlot}
              className="bg-[#04164a] hover:bg-[#04164a]/90"
            >
              {busy ? 'Saving…' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
