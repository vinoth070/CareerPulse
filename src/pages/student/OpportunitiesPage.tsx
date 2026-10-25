import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_JOBS } from '../../firebase/seedData';
import { JobPosting, JobApplication, ApplicationStatus } from '../../types';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../firebase/config';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  X,
  FileText,
  Trophy,
  Sparkles,
  Award,
  Video
} from 'lucide-react';
import { StudentHiringCelebrationModal } from '../../components/student/StudentHiringCelebrationModal';

export const OpportunitiesPage: React.FC = () => {
  const { userProfile, currentUser, updateStudentProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'browse' | 'applied'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // Application submission modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  // My Applications
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [celebrationApp, setCelebrationApp] = useState<JobApplication | null>(null);

  // Combine demo jobs with any real Firestore jobs
  const [allJobs, setAllJobs] = useState<JobPosting[]>(INITIAL_DEMO_JOBS);

  const fetchJobs = async () => {
    try {
      const snap = await getDocs(collection(db, 'jobs'));
      const dbJobs: JobPosting[] = [];
      snap.forEach((d) => {
        dbJobs.push({ id: d.id, ...(d.data() as any) });
      });

      // Merge avoiding duplicates
      const merged = [...INITIAL_DEMO_JOBS];
      dbJobs.forEach((dj) => {
        if (!merged.some((m) => m.id === dj.id)) {
          merged.unshift(dj);
        }
      });
      setAllJobs(merged);
    } catch (e) {
      console.warn('Using initial seed jobs:', e);
    }
  };

  const fetchMyApplications = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'applications'),
        where('candidateUid', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      const apps: JobApplication[] = [];
      snap.forEach((d) => {
        apps.push({ id: d.id, ...(d.data() as any) });
      });
      apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
      setMyApplications(apps);
    } catch (e) {
      console.warn('Could not fetch applications:', e);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, [currentUser]);

  const handleToggleVisibility = async (newVisibility: 'public' | 'private') => {
    try {
      await updateStudentProfile({ profileVisibility: newVisibility });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenApplyModal = (job: JobPosting) => {
    setSelectedJob(job);
    setCoverNote(
      `Hello ${job.companyName} Hiring Team,\n\nI am excited to apply for the ${job.title} position. My educational background in ${userProfile?.degree || 'engineering'} and demonstrated weekly competency scores make me a dedicated candidate for your team.`
    );
    setApplySuccess(null);
    setApplyError(null);
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedJob) return;

    // Check if already applied
    const alreadyApplied = myApplications.some((a) => a.jobId === selectedJob.id);
    if (alreadyApplied) {
      setApplyError('You have already submitted an application for this position.');
      return;
    }

    try {
      setApplying(true);
      const appId = `app-${currentUser.uid}-${selectedJob.id}`;
      const newApp: JobApplication = {
        id: appId,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyId: selectedJob.companyId,
        companyName: selectedJob.companyName,
        candidateUid: currentUser.uid,
        candidateName: userProfile?.displayName || 'Student Candidate',
        candidateEmail: currentUser.email || '',
        candidateDegree: userProfile?.degree || 'Student',
        candidateInstitution: userProfile?.institution || 'University',
        skills: userProfile?.skills || [],
        coverNote: coverNote.trim(),
        status: 'applied',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'applications', appId), newApp);
      setMyApplications([newApp, ...myApplications]);
      setApplySuccess(`Application successfully submitted to ${selectedJob.companyName}!`);
      setTimeout(() => {
        setShowApplyModal(false);
        setActiveTab('applied');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setApplyError('Failed to submit application: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  // Filter jobs
  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' || job.employmentType === selectedType;

    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Applied</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Shortlisted</span>;
      case 'assessment':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-50 text-violet-700 border border-violet-200">Assessment Active</span>;
      case 'interview':
      case 'interview_scheduled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">Interview Scheduled</span>;
      case 'interview_completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">Interview Completed</span>;
      case 'offer_pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-200">Offer Pending</span>;
      case 'offer_issued':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 animate-pulse">🎉 Offer Issued</span>;
      case 'offer_accepted':
        return <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Offer Accepted</span>;
      case 'hired':
        return <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-emerald-700 text-white shadow-xs">🎉 Officially Hired</span>;
      case 'joining_info_available':
        return <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-green-100 text-green-900 border border-green-400">Joining Dossier Ready</span>;
      case 'selected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Selected</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-500">Not Selected</span>;
      case 'withdrawn':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-400">Withdrawn</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Visibility Settings Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Opportunities &amp; Placements
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Explore active roles published by verified corporate partners. Apply directly with your assessment profile.
            </p>
          </div>

          {/* Recruiter discovery toggle widget */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 shrink-0">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {userProfile?.profileVisibility === 'public' ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                Recruiter Discovery
              </span>
              <p className="text-[10px] text-slate-500">
                {userProfile?.profileVisibility === 'public'
                  ? 'Your profile is discoverable'
                  : 'Hidden from recruiter searches'}
              </p>
            </div>
            <button
              onClick={() =>
                handleToggleVisibility(
                  userProfile?.profileVisibility === 'public' ? 'private' : 'public'
                )
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                userProfile?.profileVisibility === 'public'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {userProfile?.profileVisibility === 'public' ? 'Active' : 'Turn On'}
            </button>
          </div>
        </div>

        {/* Tab Switcher: Browse vs My Applications */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'browse'
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Openings ({filteredJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'applied'
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            My Applications ({myApplications.length})
          </button>
        </div>

        {/* Tab 1: Browse Jobs */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by job title, enterprise name, or required skill (e.g. React, Python)..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Employment Types</option>
                  <option value="full-time">Full-Time</option>
                  <option value="internship">Internship</option>
                  <option value="part-time">Part-Time</option>
                </select>
              </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700 text-sm">No matching opportunities found</p>
                <p>Try broadening your search keyword or clearing the filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => {
                  const hasApplied = myApplications.some((a) => a.jobId === job.id);
                  return (
                    <div
                      key={job.id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                              {job.companyName}
                            </span>
                            {job.isDemo && (
                              <span className="ml-2 text-[10px] font-semibold text-slate-400 uppercase">
                                Demo
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            {job.employmentType}
                          </span>
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
                            <div className="flex items-center gap-1.5">
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
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        {hasApplied ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenApplyModal(job)}
                            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Applications */}
        {activeTab === 'applied' && (
          <div className="space-y-6">
            {/* Top Celebratory Card if Candidate has Hired / Offer status */}
            {(() => {
              const celebratoryApp = myApplications.find(
                (a) =>
                  a.status === 'offer_issued' ||
                  a.status === 'offer_accepted' ||
                  a.status === 'hired' ||
                  a.status === 'joining_info_available'
              );

              if (!celebratoryApp) return null;

              return (
                <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl text-white shadow-lg space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-400 text-slate-950 shadow-sm">
                        <Trophy className="w-4 h-4 text-slate-950" />
                        <span>Hiring Milestone Reached!</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        Congratulations on your offer with {celebratoryApp.companyName}! 🎉
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                        Role: <strong>{celebratoryApp.joiningDetails?.offerRole || celebratoryApp.jobTitle}</strong> &bull; Start Date: <strong>{celebratoryApp.joiningDetails?.expectedJoiningDate || 'Upcoming'}</strong> &bull; Location: {celebratoryApp.joiningDetails?.officeAddress || 'Corporate Office'}
                      </p>
                    </div>

                    <button
                      onClick={() => setCelebrationApp(celebratoryApp)}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Open Celebratory Onboarding Hub</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Active Job Applications &amp; Status Tracking
              </h3>

              {loadingApps ? (
                <p className="text-xs text-slate-500 italic py-4">Loading your applications...</p>
              ) : myApplications.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No applications submitted yet</p>
                  <p>Browse active openings to submit your first application.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {app.jobTitle || 'Role Application'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            &bull; {app.companyName || 'Enterprise'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                        {app.coverNote && (
                          <p className="text-xs text-slate-600 line-clamp-1 italic max-w-xl">
                            "{app.coverNote}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {app.matchScore !== undefined && (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {app.matchScore}% Match
                          </span>
                        )}
                        {getStatusBadge(app.status)}

                        {(app.status === 'offer_issued' ||
                          app.status === 'offer_accepted' ||
                          app.status === 'hired' ||
                          app.status === 'joining_info_available') && (
                          <button
                            type="button"
                            onClick={() => setCelebrationApp(app)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <Trophy className="w-3.5 h-3.5 text-amber-300" />
                            <span>View Offer &amp; Joining Dossier</span>
                          </button>
                        )}

                        {(app.status === 'interview' || app.status === 'interview_scheduled') && (
                          <a
                            href={app.interviewDetails?.meetingLink || '/interview/demo-interview-101'}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Live Room &rarr;</span>
                          </a>
                        )}

                        {(app.status === 'applied' || app.status === 'under_review') && (
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure you want to withdraw this application?')) return;
                              try {
                                const docRef = doc(db, 'applications', app.id);
                                await setDoc(docRef, { ...app, status: 'withdrawn', updatedAt: new Date().toISOString() });
                                setMyApplications((prev) =>
                                  prev.map((a) => (a.id === app.id ? { ...a, status: 'withdrawn' } : a))
                                );
                              } catch (e) {
                                console.warn('Updated locally:', e);
                                setMyApplications((prev) =>
                                  prev.map((a) => (a.id === app.id ? { ...a, status: 'withdrawn' } : a))
                                );
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Application Form
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedJob.title}</h3>
                  <p className="text-xs text-slate-500">{selectedJob.companyName} &bull; {selectedJob.location}</p>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {applySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{applySuccess}</span>
                </div>
              )}
              {applyError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-700 block">Candidate Credentials Sent:</span>
                  <p className="text-slate-600">
                    Name: <span className="font-bold text-slate-900">{userProfile?.displayName}</span>
                  </p>
                  <p className="text-slate-600">
                    Email: <span className="font-bold text-slate-900">{currentUser?.email}</span>
                  </p>
                  <p className="text-slate-600">
                    Program: <span className="font-bold text-slate-900">{userProfile?.degree || 'Student'}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Introduction / Cover Note for Recruiter
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
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

        {/* Celebratory Student Hiring Dossier Modal */}
        {celebrationApp && (
          <StudentHiringCelebrationModal
            application={celebrationApp}
            onClose={() => setCelebrationApp(null)}
            onStatusUpdated={(updated) =>
              setMyApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
            }
          />
        )}
      </div>
    </div>
  );
};
