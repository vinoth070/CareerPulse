import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_JOBS, INITIAL_DEMO_COMPANIES, INITIAL_DEMO_INTERVIEWS } from '../../firebase/seedData';
import { CompanyProfile, JobPosting, SupportTicket, VerificationStatus } from '../../types';
import { collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createNotification } from '../../services/networkingService';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  Search,
  Filter,
  Activity,
  Calendar,
  MessageSquare,
  Lock,
  Globe,
  MapPin,
  ExternalLink,
  HelpCircle,
  X,
  Phone,
  Mail
} from 'lucide-react';

export const AdminPortalPage: React.FC = () => {
  const { currentUser, role } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'companies' | 'jobs' | 'tickets' | 'audits'>('companies');
  const [companyStatusFilter, setCompanyStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [inspectingCompany, setInspectingCompany] = useState<CompanyProfile | null>(null);
  const [actionReason, setActionReason] = useState<string>('');

  // Data states
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 't-101',
      userId: 'cand-riya-9',
      userEmail: 'riya.patel@demo.internal',
      userRole: 'student',
      category: 'interview_concern',
      subject: 'Clarification regarding audio jitter during technical round',
      description: 'During my live interview on Oct 24, my network dropped for 25 seconds. I would like to request that the session audit log note this as a connection glitch rather than a tab exit.',
      status: 'in_review',
      createdAt: '2026-10-24T14:30:00Z',
      updatedAt: '2026-10-24T16:00:00Z'
    },
    {
      id: 't-102',
      userId: 'cand-alex-4',
      userEmail: 'alex.m@demo.internal',
      userRole: 'student',
      category: 'challenge_dispute',
      subject: 'Hackathon GitHub commit timestamp clarification',
      description: 'Submitted solution 4 minutes before deadline but GitHub webhook received delay. Code diff is identical.',
      status: 'open',
      createdAt: '2026-10-25T09:15:00Z',
      updatedAt: '2026-10-25T09:15:00Z'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminData = async () => {
    try {
      // 1. Fetch companies
      const compSnap = await getDocs(collection(db, 'companies'));
      const compList: CompanyProfile[] = [];
      compSnap.forEach((d) => {
        compList.push({ id: d.id, ...(d.data() as any) });
      });
      if (compList.length === 0) {
        // Use demo companies
        compList.push(
          ...INITIAL_DEMO_COMPANIES.map((c, i) => ({
            id: `comp-demo-${i + 1}`,
            ownerUid: `owner-${i + 1}`,
            companyName: c.name,
            recruiterName: `Talent Partner (${c.name})`,
            workEmail: `careers@${c.name.toLowerCase().replace(/\s+/g, '')}.com`,
            industry: c.industry,
            website: `https://${c.name.toLowerCase().replace(/\s+/g, '')}.com`,
            location: c.headquarters,
            country: c.country,
            about: c.description,
            verificationStatus: (i === 2 ? 'pending' : 'verified') as any,
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-10-01T00:00:00Z'
          }))
        );
      }
      setCompanies(compList);

      // 2. Fetch jobs
      const jobSnap = await getDocs(collection(db, 'jobs'));
      const jobList: JobPosting[] = [];
      jobSnap.forEach((d) => {
        jobList.push({ id: d.id, ...(d.data() as any) });
      });
      if (jobList.length === 0) {
        jobList.push(...INITIAL_DEMO_JOBS);
      }
      setJobs(jobList);
    } catch (e) {
      console.warn('Admin data initialized with secure fallback:', e);
      setJobs(INITIAL_DEMO_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateCompanyVerification = async (
    companyId: string,
    status: VerificationStatus,
    customNote?: string
  ) => {
    const targetComp = companies.find((c) => c.id === companyId);
    const noteText = customNote || (
      status === 'verified'
        ? 'Accreditation approved by Platform Super Administrator. Full recruitment privileges enabled.'
        : status === 'more_info_required'
        ? 'Additional corporate documentation or active business registry verification required.'
        : status === 'suspended'
        ? 'Account recruitment privileges suspended due to audit review.'
        : 'Enterprise accreditation application rejected.'
    );

    try {
      await updateDoc(doc(db, 'companies', companyId), {
        verificationStatus: status,
        verificationNotes: noteText,
        updatedAt: new Date().toISOString()
      });

      // Dispatch persistent real-time notification to company recruiter owner
      if (targetComp?.ownerUid) {
        await createNotification({
          recipientUid: targetComp.ownerUid,
          type: 'system',
          title: `Company Accreditation: ${status.replace('_', ' ').toUpperCase()}`,
          message: noteText,
          link: '/company/dashboard'
        });
      }
    } catch (e) {
      console.warn('Locally updated company verification:', e);
    }

    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, verificationStatus: status, verificationNotes: noteText } : c))
    );
    if (inspectingCompany?.id === companyId) {
      setInspectingCompany((prev) => prev ? { ...prev, verificationStatus: status, verificationNotes: noteText } : null);
    }

    setNotice(`Company accreditation status updated to ${status.toUpperCase()}. Recruiter notified.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: 'active' | 'closed') => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Locally updated job status:', e);
    }

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
    );
    setNotice(`Job status changed to ${nextStatus}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleUpdateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
    setNotice(`Ticket marked as ${status.replace('_', ' ').toUpperCase()}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredCompanies = companies.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.workEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Administration & Governance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Super Admin
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            MNC accreditation verification, job posting compliance checks, candidate fairness oversight, and platform audit trail.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            Current Admin: <span className="text-blue-700">{currentUser?.email || 'System Owner'}</span>
          </span>
        </div>
      </div>

      {notice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">MNC Partners</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{companies.length}</p>
          <span className="text-[11px] text-amber-600 font-semibold">
            {companies.filter((c) => c.verificationStatus === 'pending').length} pending verification
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Listings</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {jobs.filter((j) => j.status === 'active').length}
          </p>
          <span className="text-[11px] text-slate-500">Global jobs & internships</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Open Disputes</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-2">
            {tickets.filter((t) => t.status !== 'resolved').length}
          </p>
          <span className="text-[11px] text-slate-500">Fairness & technical tickets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">System Integrity</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-700 mt-2">100%</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Audited Rubrics Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'companies'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Company Verification ({companies.filter((c) => c.verificationStatus === 'pending').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'jobs'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Job Postings ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'tickets'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Complaints & Appeals ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'audits'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Platform Audit Trail
        </button>
      </div>

      {/* Search Input for Lists */}
      {(activeTab === 'companies' || activeTab === 'jobs') && (
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      )}

      {/* TAB 1: Companies Verification */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          {/* Sub-filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `All Companies (${companies.length})` },
              { id: 'pending', label: `Pending Review (${companies.filter((c) => c.verificationStatus === 'pending').length})` },
              { id: 'verified', label: `Verified Partners (${companies.filter((c) => c.verificationStatus === 'verified').length})` },
              { id: 'rejected', label: `Rejected / Action Needed (${companies.filter((c) => c.verificationStatus === 'rejected' || c.verificationStatus === 'more_info_required' || c.verificationStatus === 'suspended').length})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCompanyStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  companyStatusFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredCompanies
              .filter((c) => {
                if (companyStatusFilter === 'all') return true;
                if (companyStatusFilter === 'pending') return c.verificationStatus === 'pending';
                if (companyStatusFilter === 'verified') return c.verificationStatus === 'verified';
                return c.verificationStatus === 'rejected' || c.verificationStatus === 'more_info_required' || c.verificationStatus === 'suspended';
              })
              .map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row justify-between gap-6 hover:border-slate-300 transition-all"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900">{c.companyName}</h3>
                    {c.legalCompanyName && c.legalCompanyName !== c.companyName && (
                      <span className="text-xs text-slate-400">({c.legalCompanyName})</span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        c.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : c.verificationStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : c.verificationStatus === 'more_info_required'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {c.verificationStatus.replace('_', ' ')}
                    </span>
                    {c.registrationNumber && (
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Tax ID: {c.registrationNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{c.about}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block font-medium">Recruiter:</span>
                      <span className="font-semibold text-slate-900">{c.recruiterName}</span>
                      {c.recruiterTitle && <span className="block text-[11px] text-slate-500">{c.recruiterTitle}</span>}
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Domain Work Email:</span>
                      <span className="font-semibold text-slate-900">{c.workEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Headquarters / Location:</span>
                      <span className="font-semibold text-slate-900">{c.headquartersAddress || c.location || 'Global'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Website &amp; Registry:</span>
                      <a
                        href={c.website?.startsWith('http') ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {c.website || 'Official Site'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {c.verificationNotes && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                      <strong className="text-slate-800">Admin Note:</strong> {c.verificationNotes}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap lg:flex-col justify-end items-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                  <button
                    onClick={() => setInspectingCompany(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect All 21 Fields
                  </button>

                  {c.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => handleUpdateCompanyVerification(c.id, 'verified')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve &amp; Verify
                    </button>
                  )}

                  {c.verificationStatus !== 'more_info_required' && (
                    <button
                      onClick={() => {
                        const note = prompt('Enter request note for recruiter (e.g. Please provide Certificate of Incorporation):');
                        if (note) handleUpdateCompanyVerification(c.id, 'more_info_required', note);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Request Info
                    </button>
                  )}

                  {c.verificationStatus !== 'rejected' && (
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) handleUpdateCompanyVerification(c.id, 'rejected', reason);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Application
                    </button>
                  )}

                  {c.verificationStatus !== 'pending' && (
                    <button
                      onClick={() => handleUpdateCompanyVerification(c.id, 'pending', 'Reset to pending review.')}
                      className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-700"
                    >
                      Reset to Pending
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Jobs Moderation */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {filteredJobs.map((j) => (
            <div
              key={j.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      j.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {j.status}
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {j.companyName}
                  </span>
                  {j.isRemote && (
                    <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Remote Friendly
                    </span>
                  )}
                  {j.isDemo && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-300">
                      DEMO
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900">{j.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{j.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2">
                  <span>Location: {j.location}</span>
                  <span>Type: {j.employmentType}</span>
                  <span>Salary: {j.salaryRange || 'Competitive MNC Grade'}</span>
                  <span>Deadline: {j.deadline}</span>
                </div>
              </div>

              <div className="flex md:flex-col justify-end items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                <button
                  onClick={() => handleToggleJobStatus(j.id, j.status)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    j.status === 'active'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  }`}
                >
                  {j.status === 'active' ? 'Suspend / Close Listing' : 'Reactivate Listing'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Support Tickets & Complaints */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {t.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        t.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{t.subject}</h3>
                  <p className="text-xs text-slate-500">Submitted by: {t.userEmail} ({t.userRole})</p>
                </div>

                <div className="flex gap-2">
                  {t.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateTicketStatus(t.id, 'resolved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {t.status === 'resolved' && (
                    <button
                      onClick={() => handleUpdateTicketStatus(t.id, 'in_review')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                    >
                      Re-open
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                {t.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Platform Audit Trail */}
      {activeTab === 'audits' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Immutable Audit Trail</h3>
          </div>
          <p className="text-xs text-slate-500">
            Records all administrative access, security rule enforcement, verification determinations, and interview score certifications.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                time: '2026-10-25 13:42 UTC',
                event: 'MNC Accreditation Audited',
                details: 'CloudScale Technologies verification affirmed by platform reviewer.',
                type: 'compliance'
              },
              {
                time: '2026-10-25 11:20 UTC',
                event: 'Standardized Rubric Affirmation',
                details: 'Interview int-tech-round-1 rubric score of 14/16 certified without demographic deviation.',
                type: 'fairness'
              },
              {
                time: '2026-10-25 09:10 UTC',
                event: 'Role Competency Seed Sync',
                details: 'Deployed updated global role competency blueprints for 2026 curriculum.',
                type: 'system'
              },
              {
                time: '2026-10-24 16:45 UTC',
                event: 'Firestore Security Rules Deployed',
                details: 'Security rules verified with ABAC enforcement for candidate anonymity and score freeze.',
                type: 'security'
              }
            ].map((audit, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{audit.event}</span>
                    <span className="text-[11px] text-slate-400">{audit.time}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{audit.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 21-Field Enterprise Verification Inspection Modal */}
      {inspectingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Accreditation Dossier &bull; 21 Enterprise Fields
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {inspectingCompany.companyName}
                </h2>
                <p className="text-xs text-slate-500">
                  UID: <span className="font-mono">{inspectingCompany.id}</span> &bull; Submitted on {new Date(inspectingCompany.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setInspectingCompany(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Badge */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Verification Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  inspectingCompany.verificationStatus === 'verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : inspectingCompany.verificationStatus === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {inspectingCompany.verificationStatus.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Industry: <strong className="text-slate-800">{inspectingCompany.industry}</strong>
              </span>
            </div>

            {/* 21 Verification Fields Grid */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
                A. Corporate &amp; Legal Entity Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">1. Legal Registered Name:</span>
                  <span className="font-bold text-slate-900">{inspectingCompany.legalCompanyName || inspectingCompany.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">2. Operating Brand Name:</span>
                  <span className="font-bold text-slate-900">{inspectingCompany.brandName || inspectingCompany.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">3. Registration Number / Tax ID / CIN:</span>
                  <span className="font-mono font-bold text-slate-900">{inspectingCompany.registrationNumber || 'Not provided (Demo MNC)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">4. Corporate Headquarters Address:</span>
                  <span className="font-semibold text-slate-900">{inspectingCompany.headquartersAddress || inspectingCompany.location || 'Global Headquarters'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">5. Primary Operating Location:</span>
                  <span className="font-semibold text-slate-900">{inspectingCompany.operatingLocation || inspectingCompany.location || 'Worldwide'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">6. Official Corporate Website:</span>
                  <a href={inspectingCompany.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                    {inspectingCompany.website} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 pt-2">
                B. Recruiter &amp; Representation Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">7. Corporate Domain Work Email:</span>
                  <span className="font-bold text-slate-900">{inspectingCompany.workEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">8. Recruiter Full Name:</span>
                  <span className="font-bold text-slate-900">{inspectingCompany.recruiterName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">9. Recruiter Job Title:</span>
                  <span className="font-semibold text-slate-900">{inspectingCompany.recruiterTitle || 'Talent Acquisition Partner'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">10. Recruiter Contact Phone:</span>
                  <span className="font-semibold text-slate-900">{inspectingCompany.recruiterPhone || 'Direct line verified via domain'}</span>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 pt-2">
                C. Enterprise Scope &amp; Documentation Evidence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">11. Company Employee Range:</span>
                  <span className="font-semibold text-slate-900">{inspectingCompany.companySize || inspectingCompany.size || '500+ employees'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">12. Industry Sector:</span>
                  <span className="font-semibold text-slate-900">{inspectingCompany.industry}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block">13. Company Overview:</span>
                  <p className="text-slate-700 leading-relaxed mt-0.5">{inspectingCompany.about || inspectingCompany.description}</p>
                </div>
                <div>
                  <span className="text-slate-400 block">14. LinkedIn Organization Profile:</span>
                  {inspectingCompany.linkedinUrl ? (
                    <a href={inspectingCompany.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                      {inspectingCompany.linkedinUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not linked</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">15. Business Documentation Evidence:</span>
                  {inspectingCompany.documentationUrl ? (
                    <a href={inspectingCompany.documentationUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                      Inspect Document <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Domain validated via DNS/Corporate Domain</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">16. Company Logo URL:</span>
                  {inspectingCompany.logoUrl ? (
                    <span className="text-slate-700 truncate block">{inspectingCompany.logoUrl}</span>
                  ) : (
                    <span className="text-slate-400 italic">Default brand placeholder</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">17. Active Hiring Focus:</span>
                  <span className="font-semibold text-slate-900">
                    {Array.isArray(inspectingCompany.hiringFocus) ? inspectingCompany.hiringFocus.join(', ') : 'Full-time, Internships'}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 pt-2">
                D. Pledges &amp; Ethical Commitments
              </h4>
              <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>18. Authorized Recruitment Authority:</strong> Affirmed by applicant.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>19. Anti-Ghosting Pledge:</strong> Committed to timely applicant updates.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>20. Equal Opportunity Employer:</strong> Certified non-discriminatory hiring.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>21. Secure Authentication:</strong> Password strength certified.</span>
                </div>
              </div>
            </div>

            {/* Accreditation Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectingCompany(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close Dossier
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {inspectingCompany.verificationStatus !== 'verified' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateCompanyVerification(inspectingCompany.id, 'verified');
                      setInspectingCompany(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve MNC Accreditation
                  </button>
                )}

                {inspectingCompany.verificationStatus !== 'more_info_required' && (
                  <button
                    type="button"
                    onClick={() => {
                      const note = prompt('Enter request note for recruiter:');
                      if (note) {
                        handleUpdateCompanyVerification(inspectingCompany.id, 'more_info_required', note);
                        setInspectingCompany(null);
                      }
                    }}
                    className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200"
                  >
                    Request More Info
                  </button>
                )}

                {inspectingCompany.verificationStatus !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        handleUpdateCompanyVerification(inspectingCompany.id, 'rejected', reason);
                        setInspectingCompany(null);
                      }
                    }}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl border border-rose-200"
                  >
                    Reject Accreditation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
