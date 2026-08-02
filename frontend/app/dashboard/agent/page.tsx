'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Users,
  ShieldCheck,
  Home,
  CalendarCheck,
  FileText,
  TrendingUp,
  AlertCircle,
  LayoutDashboard,
  RefreshCw,
  Search,
  Download,
} from 'lucide-react';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import {
  fetchDashboardSummary,
  fetchLandlordLeads,
  fetchIntakes,
  fetchAppointments,
  updateLandlordVerification,
  updateIntakeStatus,
  updateAppointment,
  DashboardSummary,
  DashboardLandlord,
  DashboardIntake,
  DashboardAppointment,
} from '@/lib/api-client';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { IntakeTable } from '@/components/dashboard/IntakeTable';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { LeadDetail } from '@/components/dashboard/LeadDetail';
import { NotificationsPanel } from '@/components/NotificationsPanel';

const BRAND_COLOR = '#04164a';

type Tab = 'overview' | 'leads' | 'intakes' | 'appointments';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'leads', label: 'Landlord Leads', icon: <Users className="w-4 h-4" /> },
  { id: 'intakes', label: 'Property Intakes', icon: <Home className="w-4 h-4" /> },
  { id: 'appointments', label: 'Appointments', icon: <CalendarCheck className="w-4 h-4" /> },
];

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const str = value == null ? '' : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const selectClass =
  "h-10 rounded-xl border border-purple-200 bg-white/90 px-3 text-sm font-body focus:ring-[#04164a]/20 text-[#22376e]";

export default function AgentDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [leads, setLeads] = useState<DashboardLandlord[]>([]);
  const [intakes, setIntakes] = useState<DashboardIntake[]>([]);
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<DashboardLandlord | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, leadsData, intakesData, appointmentsData] = await Promise.all([
        fetchDashboardSummary(),
        fetchLandlordLeads(),
        fetchIntakes(),
        fetchAppointments(),
      ]);
      setSummary(summaryData);
      setLeads(leadsData);
      setIntakes(intakesData);
      setAppointments(appointmentsData);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set('.dash-anim', { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: ANIMATION_TOKENS.stagger, ease: ANIMATION_TOKENS.ease, duration: ANIMATION_TOKENS.duration }
      );
    });
    return () => ctx.revert();
  }, []);

  const runAction = async (action: () => Promise<unknown>) => {
    setBusyId('global');
    try {
      await action();
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? 'Action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleVerify = (id: string, status: 'approved' | 'rejected') =>
    runAction(async () => {
      await updateLandlordVerification(id, status);
    });

  const handleReview = (id: string, status: 'approved' | 'rejected') =>
    runAction(async () => {
      await updateIntakeStatus(id, status);
    });

  const handleAppointmentUpdate = (id: string, payload: { status?: string }) =>
    runAction(async () => {
      await updateAppointment(id, payload);
    });

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'all' || lead.verification_status === statusFilter;
      const matchesSearch =
        !q ||
        lead.full_name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.email ?? '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const filteredIntakes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return intakes.filter((intake) => {
      const matchesStatus = statusFilter === 'all' || intake.status === statusFilter;
      const matchesSearch =
        !q ||
        intake.title.toLowerCase().includes(q) ||
        intake.landlord_name.toLowerCase().includes(q) ||
        intake.area.toLowerCase().includes(q) ||
        intake.city.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [intakes, search, statusFilter]);

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      const matchesSearch =
        !q ||
        appointment.landlord_name.toLowerCase().includes(q) ||
        appointment.notes.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, statusFilter]);

  const filterOptions: Record<Tab, string[]> = {
    overview: ['all'],
    leads: ['all', 'pending', 'approved', 'rejected'],
    intakes: ['all', 'submitted', 'approved', 'rejected', 'draft'],
    appointments: ['all', 'pending', 'confirmed', 'completed', 'cancelled'],
  };

  const handleExport = () => {
    if (tab === 'leads') {
      downloadCsv(
        'primekey-landlords.csv',
        filteredLeads.map((l) => ({
          name: l.full_name,
          phone: l.phone,
          email: l.email ?? '',
          status: l.verification_status,
          properties: l.property_count,
          intakes: l.intake_count,
          appointments: l.appointment_count,
          registered: l.created_at,
        }))
      );
    } else if (tab === 'intakes') {
      downloadCsv(
        'primekey-intakes.csv',
        filteredIntakes.map((i) => ({
          title: i.title,
          type: i.property_type,
          price: i.price,
          location: `${i.area}, ${i.city}, ${i.state}`,
          bedrooms: i.bedrooms,
          bathrooms: i.bathrooms,
          landlord: i.landlord_name,
          phone: i.landlord_phone,
          status: i.status,
          submitted: i.created_at,
        }))
      );
    } else if (tab === 'appointments') {
      downloadCsv(
        'primekey-appointments.csv',
        filteredAppointments.map((a) => ({
          date: a.preferred_date,
          time: a.time_slot,
          tour: a.tour_type,
          landlord: a.landlord_name,
          phone: a.landlord_phone,
          notes: a.notes,
          status: a.status,
        }))
      );
    }
  };

  const statCards: { label: string; value: number; icon: React.ReactNode; accent: string }[] = [
    { label: 'Total Landlords', value: summary?.total_landlords ?? 0, icon: <Users className="w-5 h-5" />, accent: 'bg-[#f3f0ff]' },
    { label: 'Pending Verification', value: summary?.landlords_pending_verification ?? 0, icon: <ShieldCheck className="w-5 h-5" />, accent: 'bg-amber-50' },
    { label: 'Intakes Submitted', value: summary?.intakes_submitted ?? 0, icon: <FileText className="w-5 h-5" />, accent: 'bg-blue-50' },
    { label: 'Appointments Pending', value: summary?.appointments_pending ?? 0, icon: <CalendarCheck className="w-5 h-5" />, accent: 'bg-amber-50' },
    { label: 'Concierge Leads', value: summary?.total_concierge_leads ?? 0, icon: <Home className="w-5 h-5" />, accent: 'bg-[#f3f0ff]' },
    { label: 'New Leads (7d)', value: summary?.leads_new_7d ?? 0, icon: <TrendingUp className="w-5 h-5" />, accent: 'bg-emerald-50' },
  ];

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-[#f3f0ff] overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="dash-anim opacity-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-heading text-[#4a607a] mb-2">
                Primekey Homes — Internal
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight" style={{ color: BRAND_COLOR }}>
                Agent Dashboard
              </h1>
            </div>
            <button
              onClick={loadAll}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 hover:bg-white border border-purple-200 text-sm font-semibold font-heading transition-all"
              style={{ color: BRAND_COLOR }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </header>

          {/* Tabs */}
          <div className="dash-anim opacity-0 flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id);
                  setSearch('');
                  setStatusFilter('all');
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-heading transition-all ${
                  tab === t.id
                    ? 'text-white shadow-md'
                    : 'bg-white/80 hover:bg-white border border-purple-200 text-[#4a607a]'
                }`}
                style={tab === t.id ? { backgroundColor: BRAND_COLOR } : undefined}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="dash-anim opacity-0 mb-6 flex items-start gap-2 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="dash-anim opacity-0 flex items-center justify-center py-24 text-[#4a607a]">
              <RefreshCw className="w-6 h-6 animate-spin mr-3" />
              Loading dashboard…
            </div>
          ) : tab === 'overview' ? (
            <>
              <div className="dash-anim opacity-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
                {statCards.map((card) => (
                  <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} accent={card.accent} />
                ))}
              </div>

              <div className="dash-anim opacity-0 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6">
                  <p className="text-xs uppercase tracking-wider font-heading font-semibold text-[#4a607a] mb-4">Intake Pipeline</p>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Submitted', value: summary?.intakes_submitted ?? 0, color: 'bg-blue-500' },
                      { label: 'Approved', value: summary?.intakes_approved ?? 0, color: 'bg-emerald-500' },
                      { label: 'Rejected', value: summary?.intakes_rejected ?? 0, color: 'bg-rose-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#4a607a]">{item.label}</span>
                          <span className="font-semibold" style={{ color: BRAND_COLOR }}>{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-purple-100">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${Math.min(100, ((item.value / Math.max(1, summary?.total_intakes ?? 0)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6">
                  <p className="text-xs uppercase tracking-wider font-heading font-semibold text-[#4a607a] mb-4">Appointments</p>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Pending', value: summary?.appointments_pending ?? 0, color: 'bg-amber-500' },
                      { label: 'Confirmed', value: summary?.appointments_confirmed ?? 0, color: 'bg-emerald-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#4a607a]">{item.label}</span>
                          <span className="font-semibold" style={{ color: BRAND_COLOR }}>{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-purple-100">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${Math.min(100, ((item.value / Math.max(1, summary?.total_appointments ?? 0)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6">
                  <p className="text-xs uppercase tracking-wider font-heading font-semibold text-[#4a607a] mb-4">Verification Queue</p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center"
                      style={{ color: BRAND_COLOR }}
                    >
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-heading" style={{ color: BRAND_COLOR }}>
                        {summary?.landlords_pending_verification ?? 0}
                      </p>
                      <p className="text-xs text-[#4a607a] font-body">landlords awaiting identity verification</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dash-anim opacity-0">
                <NotificationsPanel recipientType="agent" />
              </div>
            </>
          ) : (
            <>
              {/* Search + filters + export toolbar */}
              <div className="dash-anim opacity-0 flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={
                      tab === 'leads'
                        ? 'Search by name, phone, or email…'
                        : tab === 'intakes'
                          ? 'Search by title, landlord, or location…'
                          : 'Search by landlord or notes…'
                    }
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-purple-200 bg-white/90 text-sm font-body focus:outline-none focus:ring-[#04164a]/20 text-[#22376e]"
                    aria-label="Search"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={selectClass}
                  aria-label="Filter by status"
                >
                  {filterOptions[tab].map((option) => (
                    <option key={option} value={option}>
                      {option === 'all' ? 'All statuses' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 hover:bg-white border border-purple-200 text-sm font-semibold font-heading transition-all"
                  style={{ color: BRAND_COLOR }}
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {tab === 'leads' && (
                <div className="dash-anim opacity-0">
                  <LeadTable
                    leads={filteredLeads}
                    onView={setSelectedLead}
                    onVerify={handleVerify}
                    busyId={busyId}
                  />
                </div>
              )}
              {tab === 'intakes' && (
                <div className="dash-anim opacity-0">
                  <IntakeTable intakes={filteredIntakes} onReview={handleReview} busyId={busyId} />
                </div>
              )}
              {tab === 'appointments' && (
                <div className="dash-anim opacity-0">
                  <AppointmentTable
                    appointments={filteredAppointments}
                    onUpdate={handleAppointmentUpdate}
                    busyId={busyId}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <LeadDetail
        lead={selectedLead}
        intakes={intakes}
        appointments={appointments}
        onOpenChange={(open) => {
          if (!open) setSelectedLead(null);
        }}
      />
    </main>
  );
}
