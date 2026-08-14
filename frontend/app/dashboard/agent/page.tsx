'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
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
  LogOut,
  MessageCircle,
  FolderOpen,
} from 'lucide-react';
import { ANIMATION_TOKENS, prefersReducedMotion } from '@/lib/animations';
import {
  fetchDashboardSummary,
  fetchLandlordLeads,
  fetchIntakes,
  fetchAppointments,
  fetchDashboardLeads,
  fetchDashboardDocuments,
  updateLandlordVerification,
  updateIntakeStatus,
  updateAppointment,
  getAgentProfile,
  isAgentLoggedIn,
  ensureValidAgentToken,
  clearAgentSession,
  DashboardSummary,
  DashboardLandlord,
  DashboardIntake,
  DashboardAppointment,
  DashboardLead,
  DocumentVaultEntry,
} from '@/lib/api-client';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { IntakeTable } from '@/components/dashboard/IntakeTable';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { ConciergeLeadTable } from '@/components/dashboard/ConciergeLeadTable';
import { WhatsAppPanel } from '@/components/dashboard/WhatsAppPanel';
import { DocumentReviewTable } from '@/components/dashboard/DocumentReviewTable';
import { LeadDetail } from '@/components/dashboard/LeadDetail';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const BRAND_COLOR = '#04164a';

type Tab = 'overview' | 'leads' | 'intakes' | 'appointments' | 'concierge' | 'whatsapp' | 'documents';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'leads', label: 'Landlord Leads', icon: <Users className="w-4 h-4" /> },
  { id: 'intakes', label: 'Property Intakes', icon: <Home className="w-4 h-4" /> },
  { id: 'appointments', label: 'Appointments', icon: <CalendarCheck className="w-4 h-4" /> },
  { id: 'concierge', label: 'Concierge Leads', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
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
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [agentProfile, setAgentProfile] = useState(getAgentProfile());
  const [tab, setTab] = useState<Tab>('overview');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [leads, setLeads] = useState<DashboardLandlord[]>([]);
  const [intakes, setIntakes] = useState<DashboardIntake[]>([]);
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [conciergeLeads, setConciergeLeads] = useState<DashboardLead[]>([]);
  const [documents, setDocuments] = useState<DocumentVaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<DashboardLandlord | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionCountdown, setSessionCountdown] = useState(0);

  const handleAgentLogout = () => {
    setShowSessionWarning(false);
    clearAgentSession();
    setAgentProfile(null);
    setAuthed(null);
    router.replace('/dashboard/agent/login');
  };

  useEffect(() => {
    if (!isAgentLoggedIn()) {
      router.replace('/dashboard/agent/login');
      return;
    }
    // Refresh the access token if it is expired/expiring so the session
    // stays usable without re-login.
    ensureValidAgentToken().then((ok) => {
      if (!ok) {
        clearAgentSession();
        router.replace('/dashboard/agent/login');
        return;
      }
      setAuthed(true);
    });
  }, [router]);

  // Idle timeout: warn at 25 min, sign out at 30 min of inactivity.
  useEffect(() => {
    if (authed !== true) return;
    const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
    const WARNING_AT_MS = 25 * 60 * 1000;
    let timer: NodeJS.Timeout | null = null;
    let warningTimer: NodeJS.Timeout | null = null;
    let countdownInterval: NodeJS.Timeout | null = null;

    const showWarning = () => {
      setShowSessionWarning(true);
      let remaining = 5 * 60; // 5 minutes in seconds
      setSessionCountdown(remaining);
      countdownInterval = setInterval(() => {
        remaining -= 1;
        setSessionCountdown(remaining);
        if (remaining <= 0) {
          if (countdownInterval) clearInterval(countdownInterval);
          handleAgentLogout();
        }
      }, 1000);
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      setShowSessionWarning(false);
      timer = setTimeout(() => handleAgentLogout(), IDLE_TIMEOUT_MS);
      warningTimer = setTimeout(showWarning, WARNING_AT_MS);
    };

    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [authed, router]);

  // Re-validate the token whenever the tab regains focus.
  useEffect(() => {
    if (authed !== true) return;
    const onFocus = () => {
      ensureValidAgentToken().then((ok) => {
        if (!ok) {
          clearAgentSession();
          setAgentProfile(null);
          setAuthed(null);
          router.replace('/dashboard/agent/login');
        }
      });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [authed, router]);

  const isManager = agentProfile?.role === 'manager' || agentProfile?.role === 'admin';

  const handleLogout = () => {
    clearAgentSession();
    setAgentProfile(null);
    setAuthed(null);
    router.replace('/dashboard/agent/login');
  };

  const loadAll = async () => {
    const tokenOk = await ensureValidAgentToken();
    if (!tokenOk) {
      clearAgentSession();
      router.replace('/dashboard/agent/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [summaryData, leadsData, intakesData, appointmentsData, conciergeData, documentsData] = await Promise.all([
        fetchDashboardSummary(),
        fetchLandlordLeads(),
        fetchIntakes(),
        fetchAppointments(),
        fetchDashboardLeads(),
        fetchDashboardDocuments(),
      ]);
      setSummary(summaryData);
      setLeads(leadsData);
      setIntakes(intakesData);
      setAppointments(appointmentsData);
      setConciergeLeads(conciergeData);
      setDocuments(documentsData);
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

  const filteredConcierge = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conciergeLeads.filter((lead) => {
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSearch =
        !q ||
        lead.full_name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.email ?? '').toLowerCase().includes(q) ||
        lead.preferred_location.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [conciergeLeads, search, statusFilter]);

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesStatus = statusFilter === 'all' || doc.review_status === statusFilter;
      const matchesSearch =
        !q ||
        doc.landlord_name.toLowerCase().includes(q) ||
        (doc.intake_title ?? '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [documents, search, statusFilter]);

  const filterOptions: Record<Tab, string[]> = {
    overview: ['all'],
    leads: ['all', 'pending', 'approved', 'rejected'],
    intakes: ['all', 'submitted', 'approved', 'rejected', 'draft'],
    appointments: ['all', 'pending', 'confirmed', 'completed', 'cancelled'],
    concierge: ['all', 'active_sla_queue', 'assigned', 'contacted', 'closed_won', 'closed_lost'],
    documents: ['all', 'pending', 'approved', 'rejected'],
    whatsapp: ['all'],
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
    } else if (tab === 'concierge') {
      downloadCsv(
        'primekey-concierge-leads.csv',
        filteredConcierge.map((l) => ({
          name: l.full_name,
          phone: l.phone,
          email: l.email ?? '',
          location: l.preferred_location,
          type: l.property_type,
          budget: l.budget_max,
          tier: l.tier ?? '',
          score: l.priority_score,
          status: l.status,
          sla_breached: l.is_sla_breached,
          created: l.created_at,
        }))
      );
    } else if (tab === 'documents') {
      downloadCsv(
        'primekey-documents.csv',
        filteredDocuments.map((d) => ({
          landlord: d.landlord_name,
          phone: d.landlord_phone,
          listing: d.intake_title ?? '',
          type: d.doc_type_label ?? d.doc_type,
          status: d.review_status,
          notes: d.review_notes,
          uploaded: d.uploaded_at,
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
    { label: 'Hot Leads', value: summary?.leads_hot ?? 0, icon: <TrendingUp className="w-5 h-5" />, accent: 'bg-rose-50' },
    { label: 'SLA Breached', value: summary?.leads_sla_breached ?? 0, icon: <AlertCircle className="w-5 h-5" />, accent: 'bg-rose-50' },
  ];

  return (
    <main className="min-h-screen bg-[#f3f0ff]">
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Agent Dashboard' },
          ]}
        />
      </div>

      {authed !== true ? (
        <div className="flex items-center justify-center py-24 text-[#4a607a]">
          <RefreshCw className="w-6 h-6 animate-spin mr-3" />
          Verifying access…
        </div>
      ) : (
      <>
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
              {agentProfile && (
                <p className="text-sm text-[#4a607a] font-body mt-1">
                  Signed in as {agentProfile.full_name || agentProfile.phone} ({agentProfile.role})
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAll}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 hover:bg-white border border-purple-200 text-sm font-semibold font-heading transition-all"
                style={{ color: BRAND_COLOR }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 hover:bg-white border border-purple-200 text-sm font-semibold font-heading transition-all"
                style={{ color: BRAND_COLOR }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
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
                          : tab === 'documents'
                            ? 'Search by landlord or listing…'
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
                {tab !== 'whatsapp' && (
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 hover:bg-white border border-purple-200 text-sm font-semibold font-heading transition-all"
                    style={{ color: BRAND_COLOR }}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>

              {tab === 'leads' && (
                <div className="dash-anim opacity-0">
                  <LeadTable
                    leads={filteredLeads}
                    onView={setSelectedLead}
                    onVerify={isManager ? handleVerify : undefined}
                    busyId={busyId}
                  />
                </div>
              )}
              {tab === 'intakes' && (
                <div className="dash-anim opacity-0">
                  <IntakeTable intakes={filteredIntakes} onReview={isManager ? handleReview : undefined} busyId={busyId} />
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
              {tab === 'concierge' && (
                <div className="dash-anim opacity-0">
                  <ConciergeLeadTable leads={filteredConcierge} />
                </div>
              )}
              {tab === 'documents' && (
                <div className="dash-anim opacity-0">
                  <DocumentReviewTable documents={filteredDocuments} onReload={loadAll} canReview={isManager} />
                </div>
              )}
              {tab === 'whatsapp' && (
                <div className="dash-anim opacity-0">
                  <WhatsAppPanel />
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

      {/* Session Expiry Warning Modal */}
      <Dialog open={showSessionWarning}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-lg text-[#04164a]">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-slate-600">
              Your session will expire in{' '}
              <span className="font-semibold text-amber-600">
                {Math.floor(sessionCountdown / 60)}m {sessionCountdown % 60}s
              </span>{' '}
              due to inactivity. Move your mouse or press a key to stay signed in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-2">
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(sessionCountdown / 300) * 100}%` }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleAgentLogout}
              className="text-sm font-heading"
            >
              Sign Out Now
            </Button>
            <Button
              onClick={() => setShowSessionWarning(false)}
              className="bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading text-sm"
            >
              Stay Signed In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
      )}
    </main>
  );
}
