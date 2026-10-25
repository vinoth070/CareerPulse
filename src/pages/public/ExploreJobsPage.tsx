import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_JOBS } from '../../firebase/seedData';
import { JobPosting, EmploymentType, JobApplication } from '../../types';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Globe,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  X,
  ExternalLink,
  GraduationCap,
  Send,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { calculateJobFit, DISCLAIMER_TEXT } from '../../services/jobFitService';


export const ExploreJobsPage: React.FC = () => {
  const { currentUser, userProfile, role } = useAuth();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'all';

  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_DEMO_JOBS);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedWorkplace, setSelectedWorkplace] = useState('all'); // remote, hybrid, onsite

  // Direct Apply modal state
  const [applyJob, setApplyJob] = useState<JobPosting | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyNotice, setApplyNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Job Modal
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const handleOpenApplyModal = (job: JobPosting) => {
    setApplyJob(job);
    setShowBreakdown(false);
    setCoverNote(
      `Hello ${job.companyName} Hiring Team,\n\nI am excited to apply for the ${job.title} position. My educational background in ${userProfile?.degree || 'Computer Science & Engineering'} and verified competency assessments directly align with your role requirements.`
    );
    setApplyNotice(null);
  };

  const handleSendApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !applyJob) return;
    setApplying(true);
    try {
      const fit = calculateJobFit(applyJob, userProfile);
      const appId = `app-${currentUser.uid}-${applyJob.id}`;
      const newApp: JobApplication = {
        id: appId,
        jobId: applyJob.id,
        jobTitle: applyJob.title,
        companyId: applyJob.companyId,
        companyName: applyJob.companyName,
        candidateUid: currentUser.uid,
        candidateName: userProfile?.displayName || 'Student Candidate',
        candidateEmail: currentUser.email || '',
        candidateDegree: userProfile?.degree || 'Undergraduate',
        candidateInstitution: userProfile?.institution || 'State University',
        skills: userProfile?.skills || [],
        matchScore: fit.overallPercentage,
        coverNote: coverNote.trim(),
        status: 'applied',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'applications', appId), newApp);
      setApplyNotice({ type: 'success', text: `Application successfully submitted to ${applyJob.companyName}!` });
      setTimeout(() => {
        setApplyJob(null);
        setApplyNotice(null);
      }, 1500);
    } catch (e: any) {
      setApplyNotice({ type: 'error', text: 'Error submitting application: ' + e.message });
    } finally {
      setApplying(false);
    }
  };


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const snap = await getDocs(collection(db, 'jobs'));
        const dbJobs: JobPosting[] = [];
        snap.forEach((d) => {
          dbJobs.push({ id: d.id, ...(d.data() as any) });
        });

        // Merge with demo jobs avoiding duplicate IDs
        const merged = [...INITIAL_DEMO_JOBS];
        dbJobs.forEach((dj) => {
          if (!merged.some((m) => m.id === dj.id)) {
            merged.unshift(dj);
          }
        });
        setJobs(merged);
      } catch (e) {
        console.warn('Using initial seed jobs:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter calculation
  const filteredJobs = jobs.filter((job) => {
    const term = searchKeyword.toLowerCase();
    const matchesKeyword =
      job.title.toLowerCase().includes(term) ||
      job.companyName.toLowerCase().includes(term) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(term)) ||
      job.location.toLowerCase().includes(term);

    const matchesCountry =
      selectedCountry === 'all' ||
      (job.country && job.country.toLowerCase() === selectedCountry.toLowerCase());

    const matchesType = selectedType === 'all' || job.employmentType === selectedType;

    const matchesExperience =
      selectedExperience === 'all' || job.experienceLevel === selectedExperience;

    let matchesWorkplace = true;
    if (selectedWorkplace === 'remote') matchesWorkplace = job.isRemote === true;
    if (selectedWorkplace === 'hybrid') matchesWorkplace = job.isHybrid === true;
    if (selectedWorkplace === 'onsite') matchesWorkplace = !job.isRemote && !job.isHybrid;

    return matchesKeyword && matchesCountry && matchesType && matchesExperience && matchesWorkplace;
  });

  const allCountries = Array.from(
    new Set(jobs.map((j) => j.country).filter(Boolean) as string[])
  ).sort();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200">
              <Globe className="w-3.5 h-3.5" />
              <span>International Career Discovery</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Global Job &amp; Career Opportunities
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Discover verified full-time roles, graduate software positions, and internships across top multinational employers in Asia, Europe, and North America.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/opportunities"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Candidate Application Hub
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search by job title, enterprise, skill tag (e.g. React, Kubernetes, Python), or city..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Country / Region
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Countries</option>
                {allCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-Time</option>
                <option value="internship">Internship</option>
                <option value="part-time">Part-Time</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Workplace Mode
              </label>
              <select
                value={selectedWorkplace}
                onChange={(e) => setSelectedWorkplace(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Experience Level
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="intern">Internship</option>
                <option value="graduate">Graduate / Entry</option>
                <option value="mid">Mid-Level</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Quick Filter:
            </span>
            <button
              onClick={() => { setSelectedType('all'); setSelectedWorkplace('all'); setSelectedExperience('all'); }}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                selectedType === 'all' && selectedWorkplace === 'all' && selectedExperience === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Openings
            </button>
            <button
              onClick={() => setSelectedType(selectedType === 'internship' ? 'all' : 'internship')}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                selectedType === 'internship'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Internships Only
            </button>
            <button
              onClick={() => setSelectedWorkplace(selectedWorkplace === 'remote' ? 'all' : 'remote')}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                selectedWorkplace === 'remote'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              Remote Friendly
            </button>
            <button
              onClick={() => setSelectedExperience(selectedExperience === 'graduate' ? 'all' : 'graduate')}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                selectedExperience === 'graduate'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              Graduate &amp; Entry Roles
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing {filteredJobs.length} verified listings</span>
          <span className="text-slate-400">Sample data clearly flagged with DEMO badge</span>
        </div>

        {/* Job Cards Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">No jobs match your filter criteria</p>
            <p>Try resetting the country or workplace mode filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {job.companyName}
                    </span>
                    <div className="flex items-center gap-1">
                      {job.isDemo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          DEMO
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {job.employmentType}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.salaryRange}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {job.deadline}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {job.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* 10-Point Transparent Fit Score Pill */}
                  {(() => {
                    const fit = calculateJobFit(job, userProfile);
                    return (
                      <div className="pt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          {fit.overallPercentage}% Estimated Fit
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {fit.matchedSkills?.length || 0}/{job.requiredSkills.length} skills
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="w-full py-2.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                  >
                    View Details &amp; Criteria
                  </button>
                  {currentUser ? (
                    <button
                      onClick={() => handleOpenApplyModal(job)}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shrink-0 text-center"
                    >
                      Apply
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shrink-0 text-center"
                    >
                      Apply
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    {selectedJob.companyName}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedJob.title}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedJob.location} &bull; {selectedJob.employmentType}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Role Overview &amp; Responsibilities
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedJob.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Eligibility &amp; Academic Qualifications
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedJob.eligibility}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Required Competencies &amp; Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Compensation: <span className="font-bold text-slate-900">{selectedJob.salaryRange || 'Competitive'}</span>
                </div>
                {currentUser ? (
                  <button
                    onClick={() => {
                      const j = selectedJob;
                      setSelectedJob(null);
                      handleOpenApplyModal(j);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Apply for this Role
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Log In to Apply
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Application Modal */}
        {applyJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Application Form
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{applyJob.title}</h3>
                  <p className="text-xs text-slate-500">{applyJob.companyName} &bull; {applyJob.location}</p>
                </div>
                <button
                  onClick={() => setApplyJob(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {applyNotice && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    applyNotice.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {applyNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{applyNotice.text}</span>
                </div>
              )}

              {/* Transparent Job-Fit Score Card with Mandatory Disclaimer */}
              {(() => {
                const fit = calculateJobFit(applyJob, userProfile);
                return (
                  <div className="space-y-2.5">
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-xs">
                          {fit.overallPercentage}%
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Calculated Job-Fit Score</p>
                          <p className="text-[11px] text-slate-500">
                            {fit.matchedSkills?.length || 0} of {applyJob.requiredSkills.length} required competencies verified
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        {showBreakdown ? 'Hide Breakdown' : 'View 10-Pt Factor'}
                        {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Mandatory Disclaimer */}
                    <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{DISCLAIMER_TEXT}</span>
                    </div>

                    {/* Collapsible 10-Point Factor Breakdown */}
                    {showBreakdown && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-52 overflow-y-auto space-y-2 animate-in fade-in">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          10-Point Factor Transparency Table
                        </p>
                        {fit.breakdown?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between gap-2 text-xs border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">

                            <div>
                              <span className="font-semibold text-slate-900 block">{item.category}</span>
                              <span className="text-[11px] text-slate-500">{item.details}</span>
                            </div>
                            {item.maxScore > 0 && (
                              <span className="font-bold text-slate-700 shrink-0">
                                {item.score}/{item.maxScore}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <form onSubmit={handleSendApplication} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-700 block">Candidate Dossier:</span>
                  <p className="text-slate-600">
                    Candidate: <span className="font-bold text-slate-900">{userProfile?.displayName || currentUser?.email}</span>
                  </p>
                  <p className="text-slate-600">
                    Email: <span className="font-bold text-slate-900">{currentUser?.email}</span>
                  </p>
                  <p className="text-slate-600">
                    Degree: <span className="font-bold text-slate-900">{userProfile?.degree || 'Undergraduate'}</span>
                  </p>
                </div>


                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cover Note to Recruiter
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setApplyJob(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
