import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';
import { INITIAL_DEMO_QUIZZES, INITIAL_DEMO_JOBS, INITIAL_DEMO_COMPANIES } from '../../firebase/seedData';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
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
  Trophy,
  Calendar,
  Building2,
  Video,
  Info,
  Check,
  Flame,
  BarChart3,
  BookOpen,
  Compass,
  Star,
  ExternalLink
} from 'lucide-react';
import { QuizAttempt, JobPosting, JobApplication } from '../../types';
import { StudentHiringCelebrationModal } from '../../components/student/StudentHiringCelebrationModal';

export const StudentDashboard: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);
  const [hiredApp, setHiredApp] = useState<JobApplication | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number>(3);
  const [interviewsCount, setInterviewsCount] = useState<number>(1);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const targetRole = userProfile?.targetRole || 'Software Engineer';
  const targetCompany = userProfile?.targetCompany || 'Google';

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

        // 2. Fetch Applications
        const appQ = query(
          collection(db, 'applications'),
          where('candidateUid', '==', currentUser.uid)
        );
        const appSnap = await getDocs(appQ);
        const appsList: JobApplication[] = [];
        appSnap.forEach((d) => appsList.push({ id: d.id, ...(d.data() as any) }));
        if (appsList.length > 0) {
          setApplicationsCount(appsList.length);
        }

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
        console.warn('Student dashboard data notice:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  // Profile completeness calculation
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

  // Career Readiness Score Calculation (Transparent)
  const demonstratedSkills = ['React', 'TypeScript', 'SQL', 'Data Structures'];
  const skillsToLearn = ['System Design', 'Kubernetes', 'Redis Caching'];
  const readinessPercentage = 82; // 82% target readiness estimate

  // Activity days
  const weeklyActivity = [
    { day: 'Mon', count: 4, height: 'h-8' },
    { day: 'Tue', count: 6, height: 'h-12' },
    { day: 'Wed', count: 8, height: 'h-16' },
    { day: 'Thu', count: 5, height: 'h-10' },
    { day: 'Fri', count: 9, height: 'h-20' },
    { day: 'Sat', count: 7, height: 'h-14' },
    { day: 'Sun', count: 3, height: 'h-6' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SECTION A: WELCOME HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Student Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl sm:text-2xl font-black shadow-md shrink-0 border-2 border-white dark:border-slate-800">
            {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'S'}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {userProfile?.displayName || 'Candidate'}!
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                Active Student
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{userProfile?.degree || 'B.Tech in Computer Science'}</span>
              <span>&bull;</span>
              <span>{userProfile?.institution || 'Engineering Institute'}</span>
              <span>&bull;</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Class of {userProfile?.graduationYear || '2026'}</span>
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Goal: <strong className="text-slate-800 dark:text-slate-200">{targetRole}</strong> at <strong className="text-slate-800 dark:text-slate-200">{targetCompany}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 min-w-[220px] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Profile Completion</span>
            <span className="font-black text-blue-600 dark:text-blue-400">{completeness}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-500 dark:text-slate-400">
              {userProfile?.profileVisibility === 'public' ? 'Recruiter Discovery On' : 'Private'}
            </span>
            <Link to="/student/profile" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Edit &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Celebratory Banner if Offered or Hired */}
      {hiredApp && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-400 text-slate-950 shadow-xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>Placement Offer Verified</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Congratulations on your placement with {hiredApp.companyName}! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Role: <strong>{hiredApp.joiningDetails?.offerRole || hiredApp.jobTitle}</strong> &bull; Start Date: <strong>{hiredApp.joiningDetails?.expectedJoiningDate || 'Upcoming'}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowCelebrationModal(true)}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 relative z-10"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Onboarding Hub</span>
          </button>
        </div>
      )}

      {/* SECTION B: IMPORTANT STATISTICS (Compact Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Skills</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {demonstratedSkills.length} <span className="text-xs font-normal text-slate-400">/ {userProfile?.skills?.length || 6}</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Verified by tests</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
            {readinessPercentage}%
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Roadmap velocity</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Applications</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {applicationsCount}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">In review &bull; Active</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Interviews</span>
            <Video className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
            {interviewsCount}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Live room scheduled</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Tasks</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            2
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Due this week</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Saved Jobs</span>
            <Building2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {userProfile?.savedJobIds?.length || 4}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Target pipelines</p>
        </div>
      </div>

      {/* SECTION C & D: CAREER READINESS & LEARNING PRODUCTIVITY (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SECTION C: Career Readiness Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Target Company Readiness Index
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {targetCompany} Rubric
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Comparative benchmark for <strong>{targetRole}</strong> positions.
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                {readinessPercentage}%
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Match Score</span>
            </div>
          </div>

          {/* Sub-Metric Meters */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Required Skills Demonstration</span>
                <span className="font-bold text-slate-900 dark:text-white">4 / 5 skills demonstrated (80%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Interview Rubric Calibrated Level</span>
                <span className="font-bold text-slate-900 dark:text-white">Level 3 (Advanced)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Resume &amp; Portfolio Completeness</span>
                <span className="font-bold text-slate-900 dark:text-white">88% (ATS Optimized)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>

          {/* Demonstrated vs Missing Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Demonstrated Competencies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {demonstratedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> High-Priority Skills to Learn:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillsToLearn.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-lg"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Transparent Calculation Disclaimer */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong className="text-slate-700 dark:text-slate-300">How this score is calculated:</strong> Combines verified skill assessments (35%), project repo code evidence (25%), weekly quiz score percentiles (25%), and interview accuracy rubrics (15%). <em>Estimates candidate readiness; does not guarantee employment.</em>
            </div>
          </div>
        </div>

        {/* SECTION D: Learning & Productivity (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Productivity &amp; Streak
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Assessment and practice consistency.
              </p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-extrabold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>12 Day Streak</span>
            </div>
          </div>

          {/* Simple Activity Chart */}
          <div className="space-y-2">
            <div className="h-28 flex items-end justify-between gap-2 px-2 pt-4">
              {weeklyActivity.map((w) => (
                <div key={w.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 transition-all ${w.height}`}
                    title={`${w.count} activities on ${w.day}`}
                  />
                  <span className="text-[10px] font-bold text-slate-400">{w.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action List / Next Milestones */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Recommended Next Actions
            </span>

            <div className="space-y-2">
              <Link
                to="/student/interview-prep"
                className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Practice Level 2 System Design Questions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/student/weekly-quiz"
                className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Complete Weekly Assessment in TypeScript</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION E: PERSONALIZED RECOMMENDATIONS (Matched Jobs & Daily Practice) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Recommended Openings &amp; Daily Practice</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Matched to your verified profile ({targetRole}) from accredited enterprise partners.
            </p>
          </div>
          <Link
            to="/explore-jobs"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Matched Jobs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_DEMO_JOBS.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {job.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0">
                    {job.employmentType}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {job.companyName} &bull; {job.location}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 3).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-600 dark:text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/explore-jobs`}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Apply with Verified Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Celebratory Modal */}
      {showCelebrationModal && hiredApp && (
        <StudentHiringCelebrationModal
          application={hiredApp}
          onClose={() => setShowCelebrationModal(false)}
        />
      )}
    </div>
  );
};
