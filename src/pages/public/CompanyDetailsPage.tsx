import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  INITIAL_DEMO_COMPANIES,
  INITIAL_DEMO_JOBS,
  INITIAL_DEMO_HACKATHONS,
  INITIAL_DEMO_UPDATES
} from '../../firebase/seedData';
import { calculateJobFit } from '../../services/jobFitService';
import { followCompany, unfollowCompany } from '../../services/networkingService';
import { CompanyProfile, JobPosting, Hackathon, CompanyUpdate, JobFitAnalysis } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  Briefcase,
  Trophy,
  Megaphone,
  Check,
  Plus,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Clock
} from 'lucide-react';

export const CompanyDetailsPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { currentUser, userProfile } = useAuth();

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [updates, setUpdates] = useState<CompanyUpdate[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'jobs' | 'hackathons' | 'updates'>('about');
  const [loading, setLoading] = useState(true);

  // Job Fit Modal
  const [selectedJobFit, setSelectedJobFit] = useState<{
    job: JobPosting;
    fit: JobFitAnalysis;
  } | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      try {
        // Try firestore first
        const compRef = doc(db, 'companies', companyId);
        const compSnap = await getDoc(compRef);
        let foundCompany: CompanyProfile | null = null;

        if (compSnap.exists()) {
          foundCompany = { id: compSnap.id, ...(compSnap.data() as any) };
        } else {
          // Fallback to demo companies
          const demo = INITIAL_DEMO_COMPANIES.find(
            (c) => c.id === companyId || c.name.toLowerCase().replace(/\s+/g, '-') === companyId
          );
          if (demo) {
            foundCompany = {
              id: demo.id,
              companyName: demo.name,
              name: demo.name,
              legalCompanyName: demo.name,
              brandName: demo.name,
              registrationNumber: 'CORP-DEMO-001',
              headquartersAddress: demo.headquarters,
              operatingLocation: demo.country,
              location: demo.headquarters,
              country: demo.country,
              website: 'https://example.com',
              workEmail: `recruitment@${demo.id}.com`,
              recruiterName: 'Talent Acquisition Team',
              recruiterTitle: 'Senior Talent Acquisition Lead',
              recruiterPhone: '+1 555-0199',
              companySize: '1000-5000',
              size: '1000-5000',
              industry: demo.industry,
              about: demo.description,
              description: demo.description,
              linkedinUrl: 'https://linkedin.com',
              documentationUrl: 'https://registry.example.com',
              logoUrl: '',
              hiringFocus: ['Engineering', 'Cloud', 'Data'],
              recruitmentConsent: true,
              antiGhostingPledge: true,
              equalOpportunityAffirmation: true,
              verificationStatus: demo.verified ? 'verified' : 'pending',
              ownerUid: 'demo-recruiter',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
        }

        if (foundCompany) {
          setCompany(foundCompany);
          // Filter jobs
          const compJobs = INITIAL_DEMO_JOBS.filter(
            (j) =>
              j.companyId === foundCompany?.id ||
              (foundCompany?.companyName && j.companyName?.toLowerCase() === foundCompany.companyName.toLowerCase())
          );
          setJobs(compJobs);

          // Filter hackathons
          const compHacks = INITIAL_DEMO_HACKATHONS.filter(
            (h) =>
              h.companyId === foundCompany?.id ||
              (foundCompany?.companyName && h.companyName?.toLowerCase() === foundCompany.companyName.toLowerCase())
          );
          setHackathons(compHacks);

          // Filter updates
          const compUpdates = INITIAL_DEMO_UPDATES.filter(
            (u) =>
              u.companyId === foundCompany?.id ||
              u.companyName.toLowerCase() === foundCompany?.companyName.toLowerCase()
          );
          setUpdates(compUpdates);

          // Check if followed
          if (currentUser && userProfile?.followingCompanies?.includes(foundCompany.id)) {
            setIsFollowing(true);
          }
        }
      } catch (e) {
        console.error('Error fetching company details:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId, currentUser, userProfile]);

  const handleToggleFollow = async () => {
    if (!currentUser || !company) return;
    try {
      if (isFollowing) {
        await unfollowCompany(currentUser.uid, company.id);
        setIsFollowing(false);
      } else {
        await followCompany(currentUser.uid, company.id);
        setIsFollowing(true);
      }
    } catch (e: any) {
      alert(e.message || 'Error updating follow status');
    }
  };

  const handleEvaluateFit = (job: JobPosting) => {
    const fit = calculateJobFit(job, userProfile);
    setSelectedJobFit({ job, fit });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading company profile...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Company Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The requested company profile could not be located in our verified directory.
        </p>
        <Link
          to="/companies"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-900 rounded-xl"
        >
          Browse All Companies &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Company Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
        <div className="h-44 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent)]" />
        </div>

        <div className="px-6 sm:px-10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-2 shadow-lg border border-slate-200/80 flex items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center text-3xl font-black text-blue-900 border border-blue-100">
                  {company.companyName.charAt(0)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {company.companyName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Verified Partner
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{company.industry || 'Global Technology'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentUser && (
                <button
                  onClick={handleToggleFollow}
                  className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      : 'bg-blue-900 text-white hover:bg-blue-800'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      Following
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Follow Company
                    </>
                  )}
                </button>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                >
                  <Globe className="w-4 h-4 text-slate-400" />
                  Website
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {company.location || 'Global Headquarters'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              {company.size || '1,000+ employees'}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              {jobs.length} Open Opportunities
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-slate-400" />
              {hackathons.length} Active Challenges
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-slate-200 px-6 sm:px-10 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'about'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            About &amp; Culture
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Open Jobs
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
              {jobs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('hackathons')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'hackathons'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Challenges
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">
              {hackathons.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'updates'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Announcements ({updates.length})
          </button>
        </div>
      </div>

      {/* Tab Content: About */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Company Overview</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {company.description ||
                  `${company.companyName} is an industry leader in enterprise engineering and digital infrastructure, committed to recruiting verified student and graduate talent through meritocratic competency evaluations.`}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Hiring Philosophy &amp; Candidate Expectations</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  At {company.companyName}, we value verifiable technical skill over keyword-stuffed resumes. Our talent acquisition pipeline evaluates:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                  <li>Weekly assessment performance on core system design and coding practices.</li>
                  <li>Portfolio quality and verified code repositories on GitHub.</li>
                  <li>In-platform live technical interview communication and rubric assessments.</li>
                  <li>Readiness to contribute to high-impact production engineering systems.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Facts</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Headquarters</span>
                  <span className="text-slate-900 font-bold">{company.location || 'San Francisco, CA'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Industry Sector</span>
                  <span className="text-slate-900 font-bold">{company.industry || 'Cloud & Enterprise AI'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Company Size</span>
                  <span className="text-slate-900 font-bold">{company.size || '1,000+ employees'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Partner Tier</span>
                  <span className="text-blue-700 font-bold">Tier 1 Global Recruiter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Jobs */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-900">
              Open Positions at {company.companyName} ({jobs.length})
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">No open job postings at this moment.</p>
              <p className="text-xs text-slate-400 mt-1">
                Follow this company to receive immediate alerts when new roles open.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const fit = calculateJobFit(job, userProfile);
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md transition-shadow shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {job.department || 'Engineering'}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-800 rounded-lg border border-blue-200 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          {fit.overallPercentage}% Match
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 my-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {job.employmentType}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 mb-4">{job.description}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleEvaluateFit(job)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2"
                      >
                        Evaluate 10-Pt Fit
                      </button>
                      <Link
                        to="/explore-jobs"
                        className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 rounded-xl transition-colors shadow-xs"
                      >
                        Apply Now <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Hackathons */}
      {activeTab === 'hackathons' && (
        <div className="space-y-4">
          {hackathons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">No active challenges sponsored right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hackathons.map((h) => (
                <div
                  key={h.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Prize Pool: {h.prizePool}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{h.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3">{h.description}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Deadline: {h.endDate ? new Date(h.endDate).toLocaleDateString() : 'Rolling'}
                    </span>
                    <Link
                      to="/hackathons"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                    >
                      Join Challenge <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Updates */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          {updates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">No recent announcements published.</p>
            </div>
          ) : (
            updates.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {u.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {u.publishedAt ? new Date(u.publishedAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{u.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                  {u.description}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 10-Point Job-Fit Modal */}
      {selectedJobFit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Transparent Job-Fit Evaluation
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedJobFit.job.title}
                </h3>
                <p className="text-xs text-slate-600">{company?.companyName || 'Company'}</p>
              </div>
              <button
                onClick={() => setSelectedJobFit(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Mandatory Disclaimer Box */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed mb-6 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Transparent Disclosure: </span>
                {selectedJobFit.fit.disclaimer}
              </div>
            </div>

            {/* Score Summary */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">
                  Estimated Requirement Alignment
                </p>
                <h4 className="text-2xl font-black text-white">
                  {selectedJobFit.fit.overallPercentage}% Match
                </h4>
              </div>
              <div className="text-right text-xs text-slate-300">
                <p>
                  Matched Skills: <span className="font-bold text-white">{selectedJobFit.fit?.matchedSkills?.length || 0}</span>
                </p>
                <p>
                  Gaps: <span className="font-bold text-amber-400">{selectedJobFit.fit?.missingSkills?.length || 0}</span>
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {selectedJobFit.fit.breakdown?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >

                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.category}</p>
                    <p className="text-[11px] text-slate-500">{item.details}</p>
                  </div>
                  {item.maxScore > 0 && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-800 shrink-0 self-start sm:self-center">
                      {item.score} / {item.maxScore} pts
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedJobFit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <Link
                to="/explore-jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-xs"
              >
                Proceed to Submit Application <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
