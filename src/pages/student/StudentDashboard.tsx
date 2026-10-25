import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';
import { INITIAL_DEMO_QUIZZES, INITIAL_DEMO_JOBS } from '../../firebase/seedData';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../firebase/config';
import {
  GraduationCap,
  Award,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  FileText,
  Trophy
} from 'lucide-react';
import { QuizAttempt, JobPosting, JobApplication } from '../../types';
import { StudentHiringCelebrationModal } from '../../components/student/StudentHiringCelebrationModal';

export const StudentDashboard: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [hiredApp, setHiredApp] = useState<JobApplication | null>(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const activeQuiz = INITIAL_DEMO_QUIZZES[0];

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser) return;
      try {
        // 1. Fetch Quiz Attempts
        const q = query(
          collection(db, 'quizAttempts'),
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const attempts: QuizAttempt[] = [];
        snap.forEach((doc) => {
          attempts.push({ id: doc.id, ...(doc.data() as any) });
        });

        attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setAttemptCount(attempts.length);
        if (attempts.length > 0) {
          setLatestAttempt(attempts[0]);
        }

        // 2. Fetch Applications to check for Offer or Hired status
        const appQ = query(
          collection(db, 'applications'),
          where('candidateUid', '==', currentUser.uid)
        );
        const appSnap = await getDocs(appQ);
        const appsList: JobApplication[] = [];
        appSnap.forEach((d) => appsList.push({ id: d.id, ...(d.data() as any) }));
        const celebratory = appsList.find(
          (a) =>
            a.status === 'offer_issued' ||
            a.status === 'offer_accepted' ||
            a.status === 'hired' ||
            a.status === 'joining_info_available'
        );
        if (celebratory) {
          setHiredApp(celebratory);
        }
      } catch (err) {
        console.warn('Could not fetch student dashboard data:', err);
      } finally {
        setLoadingAttempts(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  // Calculate profile completeness
  const calculateCompleteness = () => {
    if (!userProfile) return 40;
    let score = 20;
    if (userProfile.displayName) score += 15;
    if (userProfile.degree && userProfile.institution) score += 20;
    if (userProfile.skills && userProfile.skills.length >= 3) score += 20;
    if (userProfile.projects && userProfile.projects.length >= 1) score += 15;
    if (userProfile.bio) score += 10;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student & Candidate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {userProfile?.displayName || 'Learner'}!
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Track your weekly assessments, manage verified skill badges, and explore curated career openings from verified multinational companies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/profile"
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Edit Profile
            </Link>
            <Link
              to="/student/weekly-quiz"
              className="px-4 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-blue-200" />
              <span>Take Weekly Quiz</span>
            </Link>
          </div>
        </div>

        {/* Celebratory Placement Banner if Hired / Offer Received */}
        {hiredApp && (
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-400 text-slate-950 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-slate-950" />
                <span>
                  {hiredApp.status === 'hired'
                    ? 'Official Placement Confirmed'
                    : 'Formal Offer Ready for Acceptance'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Congratulations on your offer from {hiredApp.companyName}! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                Position: <strong>{hiredApp.joiningDetails?.offerRole || hiredApp.jobTitle}</strong> &bull; Start Date: <strong>{hiredApp.joiningDetails?.expectedJoiningDate || 'Upcoming'}</strong> &bull; Address: {hiredApp.joiningDetails?.officeAddress || 'Corporate Office'}
              </p>
            </div>

            <button
              onClick={() => setShowCelebrationModal(true)}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 relative z-10"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Open Celebratory Onboarding Hub</span>
            </button>
          </div>
        )}

        {/* Profile Completeness & Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Profile Completeness */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Profile Status
                </span>
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{completeness}%</span>
                <span className="text-xs text-slate-500">completed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {userProfile?.profileVisibility === 'public' ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Visible to Recruiters
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Private (Discovery Off)</span>
                )}
              </span>
              <Link to="/student/profile" className="font-bold text-blue-600 hover:text-blue-700">
                Complete &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2: Quizzes & Assessments */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Weekly Assessments
                </span>
                <Award className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{attemptCount}</span>
                <span className="text-xs text-slate-500">quizzes completed</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {latestAttempt
                  ? `Latest Score: ${latestAttempt.percentage}% in ${latestAttempt.quizTitle}`
                  : 'Ready for your first challenge: Week 42 assessment is live!'}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Evaluated on Trusted Server</span>
              <Link to="/student/skills" className="font-bold text-indigo-600 hover:text-indigo-700">
                View Breakdown &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Declared & Assessed Skills */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Competencies
                </span>
                <Layers className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {userProfile?.skills?.length || 0}
                </span>
                <span className="text-xs text-slate-500">technical skills tagged</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                {userProfile?.skills?.slice(0, 4).map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Self & Assessed</span>
              <Link to="/student/skills" className="font-bold text-teal-600 hover:text-teal-700">
                Skills Matrix &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Live Weekly Quiz Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 bg-blue-900/60 border border-blue-700/80">
                <Clock className="w-3.5 h-3.5" />
                <span>Current Scheduled Assessment &bull; Week {activeQuiz.weekNumber}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{activeQuiz.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{activeQuiz.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
                <span>{activeQuiz.totalQuestions} Questions</span>
                <span>&bull;</span>
                <span>{activeQuiz.timeLimitMinutes} Minutes Time Limit</span>
                <span>&bull;</span>
                <span className="text-blue-300 font-semibold">{activeQuiz.category}</span>
              </div>
            </div>

            <Link
              to="/student/weekly-quiz"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Target Company Career Assistant & Digital Badges Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature Card 1: Target Company Career Assistant */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-6 border border-blue-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-800/80 text-blue-200 border border-blue-700 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>AI-Assisted Career Navigation</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">
                Target Company Career Assistant
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Choose a dream role (e.g. "Software Engineer at Google" or "Data Scientist at Microsoft"). Get an explainable skill-gap breakdown, 4-week preparation plan, interview strategy, and tailored resume advice.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-blue-800/60 flex items-center justify-between">
              <span className="text-xs text-blue-200">6-Step Personalized Roadmap</span>
              <Link
                to="/student/career-assistant"
                className="px-4 py-2 bg-white text-blue-950 font-bold text-xs rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Launch Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature Card 2: Verified Digital Badges */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verifiable Micro-Credentials</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                My Verified Badges
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Earn cryptographic badges based on 90%+ quiz scores, validated certifications, and podium finishes in Company Innovation Challenges. Badges are showcased directly to talent recruiters.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {(userProfile?.badges && userProfile.badges.length > 0) ? userProfile.badges.length : 4} Badges Available
              </span>
              <Link
                to="/student/profile"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>View My Badges</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Education/Skills Summary + Opportunities Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Education & Background Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Education Summary
                </h3>
                <Link to="/student/profile" className="text-xs font-semibold text-blue-600">
                  Edit
                </Link>
              </div>

              <div>
                <p className="text-xs text-slate-500">Degree & Program</p>
                <p className="text-sm font-bold text-slate-900">
                  {userProfile?.degree || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">College / University</p>
                <p className="text-sm font-bold text-slate-900">
                  {userProfile?.institution || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Graduation Year</p>
                <p className="text-sm font-bold text-slate-900">
                  {userProfile?.graduationYear || '2026'}
                </p>
              </div>

              {userProfile?.bio && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Professional Bio</p>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{userProfile.bio}"
                  </p>
                </div>
              )}
            </div>

            {/* Quick Tips Card */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2 text-xs text-blue-900">
              <span className="font-bold flex items-center gap-1.5 text-blue-950">
                <Sparkles className="w-4 h-4 text-blue-600" /> Hiring Tip
              </span>
              <p className="leading-relaxed">
                Recruiters from MNCs frequently search for candidates with both strong algorithm scores and verifiable real-world project portfolios. Add your GitHub or live demo links under "My Profile".
              </p>
            </div>
          </div>

          {/* Right Column: Recommended Opportunities */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recommended Opportunities
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified jobs and internships matching your academic profile
                  </p>
                </div>
                <Link
                  to="/student/opportunities"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All Openings <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {INITIAL_DEMO_JOBS.slice(0, 2).map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {job.companyName}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {job.employmentType}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                      <p className="text-xs text-slate-500">{job.location} &bull; Deadline: {job.deadline}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {job.requiredSkills.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to="/student/opportunities"
                      className="px-4 py-2 bg-slate-900 hover:bg-blue-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 text-center"
                    >
                      View Details &amp; Apply
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebratory Modal */}
      {showCelebrationModal && hiredApp && (
        <StudentHiringCelebrationModal
          application={hiredApp}
          onClose={() => setShowCelebrationModal(false)}
          onStatusUpdated={(updated) => setHiredApp(updated)}
        />
      )}
    </div>
  );
};
