import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { JobPosting, JobApplication, UserProfile } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Building2,
  Users,
  Compass,
  Briefcase,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  FileText,
  UserCheck,
  ArrowRight
} from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const { companyProfile, currentUser } = useAuth();

  const [companyJobs, setCompanyJobs] = useState<JobPosting[]>([]);
  const [companyApplications, setCompanyApplications] = useState<JobApplication[]>([]);
  const [discoverableCandidatesCount, setDiscoverableCandidatesCount] = useState<number>(0);
  const [totalOptedInCount, setTotalOptedInCount] = useState<number>(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!currentUser) return;

      try {
        // 1. Fetch this company's jobs
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('companyId', '==', currentUser.uid)
        );
        const jobsSnap = await getDocs(jobsQuery);
        const jobsList: JobPosting[] = [];
        jobsSnap.forEach((d) => {
          jobsList.push({ id: d.id, ...(d.data() as any) });
        });
        setCompanyJobs(jobsList);

        // 2. Fetch this company's applications
        const appsQuery = query(
          collection(db, 'applications'),
          where('companyId', '==', currentUser.uid)
        );
        const appsSnap = await getDocs(appsQuery);
        const appsList: JobApplication[] = [];
        appsSnap.forEach((d) => {
          appsList.push({ id: d.id, ...(d.data() as any) });
        });
        setCompanyApplications(appsList);

        // 3. Count discoverable candidates under consent rules
        const usersQuery = query(
          collection(db, 'users'),
          where('profileVisibility', '==', 'public')
        );
        const usersSnap = await getDocs(usersQuery);
        let candidateCount = 0;
        usersSnap.forEach((d) => {
          const u = d.data() as UserProfile;
          if (u.role === 'student') {
            candidateCount++;
          }
        });
        setDiscoverableCandidatesCount(candidateCount);
        setTotalOptedInCount(candidateCount);
      } catch (err) {
        console.warn('Dashboard metrics fetch error:', err);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchCompanyData();
  }, [currentUser]);

  const activeJobsCount = companyJobs.filter((j) => j.status === 'active').length;
  const shortlistedCount = companyApplications.filter(
    (a) => a.status === 'shortlisted' || a.status === 'interview' || a.status === 'interview_scheduled' || a.status === 'offer_issued' || a.status === 'selected'
  ).length;

  const isVerified = companyProfile?.verificationStatus === 'verified';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200">
                <Building2 className="w-3.5 h-3.5" />
                <span>Enterprise Recruiter Portal</span>
              </span>

              {companyProfile?.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified MNC Enterprise
                </span>
              )}
              {companyProfile?.verificationStatus === 'pending' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Accreditation Pending Admin Review
                </span>
              )}
              {companyProfile?.verificationStatus === 'more_info_required' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  <AlertCircle className="w-3.5 h-3.5" /> More Information Requested
                </span>
              )}
              {companyProfile?.verificationStatus === 'rejected' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Accreditation Rejected
                </span>
              )}
              {companyProfile?.verificationStatus === 'suspended' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                  <AlertCircle className="w-3.5 h-3.5" /> Account Suspended
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {companyProfile?.companyName || 'Corporate Partner'}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Represented by {companyProfile?.recruiterName || 'Talent Lead'} ({companyProfile?.recruiterTitle || 'Talent Acquisition'}) &bull; {companyProfile?.industry || 'Enterprise'} &bull; {companyProfile?.location || 'Global'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/company/jobs"
              className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
            >
              Post New Opening
            </Link>
            <Link
              to="/company/talent"
              className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Explore Talent</span>
            </Link>
          </div>
        </div>

        {/* Verification Status Banner */}
        {companyProfile?.verificationStatus === 'pending' && (
          <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 text-sm">
                Corporate Accreditation Pending Administrative Review
              </span>
              <p className="leading-relaxed">
                Your enterprise profile has been registered and is under manual review by the platform administrator. You can configure job templates, interview rubrics, and view candidate discovery. Full public distribution badge will activate once verified.
              </p>
            </div>
          </div>
        )}

        {companyProfile?.verificationStatus === 'more_info_required' && (
          <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-200 text-xs text-blue-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-blue-950 text-sm">
                Action Required: Additional Verification Details Needed
              </span>
              <p className="leading-relaxed">
                {companyProfile?.verificationNotes || 'The administrator requested clarification regarding corporate registry documentation or enterprise domain verification.'}
              </p>
            </div>
          </div>
        )}

        {companyProfile?.verificationStatus === 'rejected' && (
          <div className="p-5 bg-rose-50 rounded-2xl border-2 border-rose-200 text-xs text-rose-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-rose-950 text-sm">
                Accreditation Determination
              </span>
              <p className="leading-relaxed">
                {companyProfile?.verificationNotes || 'Your application was not approved during initial verification. Contact platform administration if you believe this is in error.'}
              </p>
            </div>
          </div>
        )}

        {/* Real Firestore Platform Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric 1: Discoverable Candidates */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Candidate Pool</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {loadingMetrics ? '...' : discoverableCandidatesCount}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Candidates who have consented to recruiter discovery
            </p>
          </div>

          {/* Metric 2: Active Job Postings */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">My Listings</span>
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {loadingMetrics ? '...' : activeJobsCount}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {companyJobs.length} total listings created by your team
            </p>
          </div>

          {/* Metric 3: Applications Received */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Applications</span>
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {loadingMetrics ? '...' : companyApplications.length}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Student applicants to your active jobs
            </p>
          </div>

          {/* Metric 4: Shortlisted / In-Review */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Shortlisted</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {loadingMetrics ? '...' : shortlistedCount}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Candidates in interview or offer pipeline
            </p>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Recent Applications */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Inbound Applications
                </h3>
                <p className="text-xs text-slate-500">
                  Candidates who have applied to your published openings
                </p>
              </div>
              <Link
                to="/company/applications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Hiring Workflow &rarr;
              </Link>
            </div>

            {loadingMetrics ? (
              <p className="text-xs text-slate-500 italic py-6">Loading applications...</p>
            ) : companyApplications.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No applications received yet</p>
                <p>Ensure your active job postings are published to start receiving candidates.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {companyApplications.slice(0, 4).map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{app.candidateName}</p>
                      <p className="text-[11px] text-slate-500">
                        {app.candidateDegree} &bull; For {app.jobTitle}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-800">
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Col: Talent Discovery Shortcut */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 bg-blue-900/60 border border-blue-700/80">
                <Compass className="w-3.5 h-3.5" />
                <span>Verified Candidate Search</span>
              </div>
              <h3 className="text-xl font-bold">Search Qualified Candidates</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Filter by technical skills, verified weekly quiz scores, and academic graduation year without screening through hundreds of static PDF resumes.
              </p>
            </div>

            <Link
              to="/company/talent"
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-colors text-center block"
            >
              Open Talent Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
