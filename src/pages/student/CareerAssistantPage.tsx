import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  generateTargetCareerPlan,
  TARGET_ROLE_BENCHMARKS,
  TARGET_COMPANY_PROFILES
} from '../../services/aiService';
import { CareerTargetPlan } from '../../types';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Building2,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FileText,
  Award,
  Compass,
  Briefcase,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Layers,
  MapPin
} from 'lucide-react';

export const CareerAssistantPage: React.FC = () => {
  const { userProfile, updateStudentProfile } = useAuth();

  // Step A: Target Selection Form
  const [targetCompany, setTargetCompany] = useState(userProfile?.targetCompany || 'Google');
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole || 'Software Engineer');
  const [location, setLocation] = useState(userProfile?.city ? `${userProfile.city}, ${userProfile.country || ''}` : 'Remote / Global');
  const [experienceLevel, setExperienceLevel] = useState<'student' | 'entry' | 'mid'>('student');

  // Plan generation state
  const [plan, setPlan] = useState<CareerTargetPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'selection' | 'analysis' | 'plan' | 'resume'>('selection');

  // Generate initial or updated plan
  const handleGeneratePlan = async () => {
    if (!userProfile) return;
    setGenerating(true);
    try {
      const geminiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
      const generated = await generateTargetCareerPlan({
        targetCompany,
        targetRole,
        location,
        userProfile,
        apiKey: geminiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY
      });
      setPlan(generated);
      setCurrentStep('analysis');

      // Persist chosen target to user profile
      await updateStudentProfile({
        targetCompany,
        targetRole
      });
    } catch (e) {
      console.error('Plan generation failed:', e);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (userProfile && !plan) {
      handleGeneratePlan();
    }
  }, [userProfile?.uid]);

  const toggleTask = (weekIdx: number, taskIdx: number) => {
    if (!plan) return;
    const updatedWeeklyPlan = [...plan.weeklyPlan];
    const task = updatedWeeklyPlan[weekIdx].tasks[taskIdx];
    task.completed = !task.completed;
    setPlan({ ...plan, weeklyPlan: updatedWeeklyPlan });
  };

  const benchmark = TARGET_ROLE_BENCHMARKS[targetRole] || TARGET_ROLE_BENCHMARKS['Software Engineer'];
  const companyProfile = TARGET_COMPANY_PROFILES[targetCompany];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Target Company Career Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Configure your dream company and role (e.g. <em>"I want to become a Software Engineer at Google"</em>) to receive automated requirement extractions, verified skill gap audits, and resume alignment feedback.
          </p>
        </div>

        {plan && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Profile Alignment Score
            </span>
            <span className="text-2xl font-extrabold text-blue-700">{plan.matchScore}%</span>
            <span className="text-[11px] text-slate-500 block">to {targetCompany} Benchmark</span>
          </div>
        )}
      </div>

      {/* Workflow Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 mb-8 text-xs font-semibold">
        <button
          onClick={() => setCurrentStep('selection')}
          className={`px-4 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 ${
            currentStep === 'selection'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          1. Target Selection
        </button>
        <button
          onClick={() => setCurrentStep('analysis')}
          disabled={!plan}
          className={`px-4 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-40 ${
            currentStep === 'analysis'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          2. Requirements &amp; Skill Gaps
        </button>
        <button
          onClick={() => setCurrentStep('plan')}
          disabled={!plan}
          className={`px-4 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-40 ${
            currentStep === 'plan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          3. Personalized 4-Week Roadmap
        </button>
        <button
          onClick={() => setCurrentStep('resume')}
          disabled={!plan}
          className={`px-4 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-40 ${
            currentStep === 'resume'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          4. Resume Alignment Guidance
        </button>
      </div>

      {/* STEP A: Target Selection View */}
      {currentStep === 'selection' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Configure Your Career Target</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your target organization and job function to benchmark your verified competencies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Company *
              </label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Google">Google</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Stripe">Stripe</option>
                <option value="CloudScale">CloudScale Technologies</option>
                <option value="Amazon">Amazon</option>
                <option value="Apex Financial Systems">Apex Financial Systems</option>
                <option value="Nexus Cloud Infrastructure">Nexus Cloud Infrastructure</option>
                <option value="Quantum AI Analytics">Quantum AI Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Role *
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
                <option value="Data Analyst &amp; BI Specialist">Data Analyst &amp; BI Specialist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Preferred Location / Mode
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA / London / Remote"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Current Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="student">Undergraduate Student (Class of 2025/2026)</option>
                <option value="entry">Recent Graduate / Associate (0-2 years)</option>
                <option value="mid">Mid-Level Professional (2-5 years)</option>
              </select>
            </div>
          </div>

          {/* Company culture preview */}
          {companyProfile && (
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-1.5">
              <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> {targetCompany} Engineering Culture &amp; Hiring Rubric
              </span>
              <p className="text-blue-800 italic">"{companyProfile.cultureTagline}"</p>
              <div className="pt-1 text-slate-600">
                <strong>Key Evaluation Focus:</strong> {companyProfile.focusAreas.join(' • ')}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Requirements...
                </>
              ) : (
                <>
                  Generate Target Career Plan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP B & C: Requirements and Skill Gap Analysis View */}
      {currentStep === 'analysis' && plan && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Skills breakdown */}
            <div className="lg:col-span-2 space-y-6">
              {/* Requirements & Gaps */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Competency Audit: {targetRole} @ {targetCompany}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Comparing stated job requirements against your portfolio and test attempts.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {plan.demonstratedSkills.length} of {benchmark.requiredSkills.length} Verified
                  </span>
                </div>

                {/* Demonstrated */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Demonstrated Competencies ({plan.demonstratedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.demonstratedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {sk}
                      </span>
                    ))}
                    {plan.demonstratedSkills.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No verified skills demonstrated yet.</p>
                    )}
                  </div>
                </div>

                {/* Missing Skills with Explanations */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Critical Gaps to Bridge Before Applying ({plan.missingSkills.length})
                  </h4>
                  <div className="space-y-2.5">
                    {plan.missingSkills.map((gap, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{gap.skill}</span>
                            <span
                              className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                                gap.priority === 'essential'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {gap.priority}
                            </span>
                          </div>
                          <p className="text-slate-600">{gap.reason}</p>
                        </div>
                        <Link
                          to="/student/weekly-quiz"
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold shrink-0 flex items-center gap-1"
                        >
                          Practice Quiz <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Responsibilities & Interview Stages */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Expected On-The-Job Responsibilities
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {benchmark.typicalResponsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pt-3 border-t border-slate-100">
                  Standard Interview Stages for this Role
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {benchmark.interviewStages.map((stage, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-blue-600 font-bold block">Stage {idx + 1}</span>
                      <span className="font-semibold text-slate-800">{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right col: Quick actions & Next Steps */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Step F: Contextual Next Actions
                </h4>
                <div className="space-y-2">
                  <Link
                    to="/student/weekly-quiz"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-900 font-semibold text-xs hover:bg-blue-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-700" />
                      Take Weekly Skill Quiz
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/student/portfolio"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Upload Verified Certificate
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/student/resume-builder"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Optimize ATS Resume
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/explore-jobs"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-600" />
                      Explore Matching Roles
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Progress pill */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Target Roadmap
                </span>
                <h4 className="text-sm font-bold">4-Week Structured Sprint</h4>
                <p className="text-xs text-slate-300">
                  Follow week-by-week tasks to systematically eliminate competency deficiencies.
                </p>
                <button
                  onClick={() => setCurrentStep('plan')}
                  className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  View Learning Plan &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP D: Personalized 4-Week Learning Plan View */}
      {currentStep === 'plan' && plan && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  4-Week Structured Learning Roadmap for {targetCompany}
                </h3>
                <p className="text-xs text-slate-500">
                  Interactive checklist designed around verified role competencies and assessment gates.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                Completed:{' '}
                <strong className="text-blue-700">
                  {plan.weeklyPlan.flatMap((w) => w.tasks).filter((t) => t.completed).length} /{' '}
                  {plan.weeklyPlan.flatMap((w) => w.tasks).length}
                </strong>
              </span>
            </div>

            <div className="space-y-6 pt-6">
              {plan.weeklyPlan.map((week, wIdx) => (
                <div key={week.week} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                      Week {week.week}
                    </span>
                    <span className="text-xs text-slate-400">
                      {week.tasks.filter((t) => t.completed).length} of {week.tasks.length} Done
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{week.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{week.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    {week.tasks.map((task, tIdx) => (
                      <label
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(wIdx, tIdx)}
                          className="w-4 h-4 rounded text-blue-600 mt-0.5"
                        />
                        <div className="flex-1 text-xs">
                          <span className={task.completed ? 'line-through text-slate-500' : 'font-medium'}>
                            {task.label}
                          </span>
                          <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">
                            [{task.type}]
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP E: Resume Guidance View */}
      {currentStep === 'resume' && plan && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Targeted Resume Improvements for {targetCompany}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Actionable modifications to align your resume with recruiter expectations and technical filters.
            </p>
          </div>

          <div className="space-y-4">
            {plan.resumeSuggestions.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-7">{item.suggestion}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Ready to edit? Update your sections in the live builder.
            </span>
            <Link
              to="/student/resume-builder"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Open ATS Resume Builder &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
