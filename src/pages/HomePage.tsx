import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/brand';
import { INITIAL_DEMO_QUIZZES, INITIAL_DEMO_JOBS } from '../firebase/seedData';
import {
  GraduationCap,
  Building2,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Compass,
  FileCheck,
  Target,
  Users,
  Briefcase,
  ChevronRight,
  BarChart3,
  BookOpen
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'company'>('student');
  const sampleQuiz = INITIAL_DEMO_QUIZZES[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Master in-demand skills.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-600">
                Prove them weekly.
              </span>{' '}
              Get hired by top teams.
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              A transparent career development network where students build verified competency profiles through weekly assessments, and multinational companies discover authentic talent without resume fluff.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-white bg-slate-900 hover:bg-blue-900 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>Get Started as Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#for-companies"
                className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Explore for Companies</span>
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero resume fluff</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Weekly verified skill evaluations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Candidate privacy & consent control</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Platform Preview */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Window Top Bar */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  {BRAND_CONFIG.name.toLowerCase()}.internal/preview
                </span>
              </div>

              {/* View toggle */}
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setActiveTab('student')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeTab === 'student' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student Experience
                </button>
                <button
                  onClick={() => setActiveTab('company')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeTab === 'company' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Enterprise Recruiter View
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-6 sm:p-8 bg-slate-50/70">
              {activeTab === 'student' ? (
                <div className="space-y-6">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                        <span>Current Assessment</span>
                        <Award className="w-4 h-4 text-indigo-500" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">Week 42 Live</p>
                      <p className="text-xs text-emerald-600 mt-1 font-medium">92% average peer score</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                        <span>Profile Completeness</span>
                        <Target className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">85% Complete</p>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-600 h-1.5 rounded-full w-[85%]" />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                        <span>Verified Skills</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">4 Assessed Badges</p>
                      <p className="text-xs text-slate-500 mt-1">TypeScript, React, Algorithms</p>
                    </div>
                  </div>

                  {/* Active Quiz Preview Card */}
                  <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="inline-block text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                          Active Weekly Challenge
                        </span>
                        <h3 className="text-lg font-bold">{sampleQuiz.title}</h3>
                        <p className="text-xs text-slate-300 max-w-xl">{sampleQuiz.description}</p>
                      </div>
                      <Link
                        to="/register"
                        className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shrink-0 shadow-sm transition-colors"
                      >
                        Take Assessment
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Recruiter Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-xs text-slate-500">Opted-in Candidates</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">Active Pool</p>
                      <span className="text-[11px] text-emerald-600 font-medium">Consent-verified only</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-xs text-slate-500">Skills Evaluated</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">100% Verified</p>
                      <span className="text-[11px] text-slate-500">Objective test scores</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-xs text-slate-500">Active Listings</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">Direct Match</p>
                      <span className="text-[11px] text-indigo-600 font-medium">No middleman fees</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-xs text-slate-500">Hiring Pipeline</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">6 Stages</p>
                      <span className="text-[11px] text-slate-500">Applied to Selected</span>
                    </div>
                  </div>

                  {/* Sample Candidate Cards */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Talent Search Preview</h4>
                        <p className="text-xs text-slate-500">Filter by verified assessment scores and technical competencies</p>
                      </div>
                      <Link
                        to="/register"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Register Recruiter Account <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                            AS
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Aarav Sharma</p>
                            <p className="text-[11px] text-slate-500">B.Tech CS, 2026 &bull; Top 5% in Algorithms</p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-100/70 text-blue-800 text-[10px] font-medium">
                            TypeScript (95%)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[10px] font-medium">
                            React (90%)
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                            PL
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Priya Lakshman</p>
                            <p className="text-[11px] text-slate-500">M.S. Software Engineering &bull; Cloud Systems</p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-100/70 text-blue-800 text-[10px] font-medium">
                            Docker & K8s (92%)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[10px] font-medium">
                            Python & SQL (88%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              Structured Progression
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How {BRAND_CONFIG.name} Works
            </h3>
            <p className="mt-3 text-slate-600 text-base">
              A transparent, 4-step pipeline bridging skills development and actual enterprise recruitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-lg mb-5 shadow-xs">
                  01
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Create Profile</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Document your academic credentials, real-world projects, certifications, and declared competencies.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-blue-700">
                <FileCheck className="w-4 h-4 mr-1.5" /> Fast 2-minute onboarding
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-extrabold text-lg mb-5 shadow-xs">
                  02
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Complete Quizzes</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Take fresh weekly technical and analytical assessments designed around real industry scenarios.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-indigo-700">
                <Award className="w-4 h-4 mr-1.5" /> Server-verified evaluations
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-extrabold text-lg mb-5 shadow-xs">
                  03
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Discover Strengths</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Gain targeted feedback, identify knowledge gaps, and convert raw practice into verified badge evidence.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-teal-700">
                <BarChart3 className="w-4 h-4 mr-1.5" /> Actionable improvement tips
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg mb-5 shadow-xs">
                  04
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Connect to Jobs</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Apply directly to opportunities from verified enterprises or let recruiters invite you based on demonstrated skill.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-slate-900">
                <Briefcase className="w-4 h-4 mr-1.5" /> Direct hiring workflow
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Audience Sections */}
      {/* 1. For Students */}
      <section id="for-students" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>For Students & Job Seekers</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Stand out with evidence, not just formatted bullet points.
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Traditional job applications drown in automated keyword filters. {BRAND_CONFIG.name} empowers you to showcase your actual problem-solving aptitude, track weekly growth, and gain visibility with verified multinational companies.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Distinguish Self-Declared from Assessed Skills</h5>
                    <p className="text-xs text-slate-500">Showcase your formal quiz results alongside your personal project highlights.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Total Privacy Governance</h5>
                    <p className="text-xs text-slate-500">You decide when your profile is visible to recruiters with a single toggle.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Direct Application Pipeline</h5>
                    <p className="text-xs text-slate-500">Track application stages from Applied to Interview and Selection in real-time.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
                >
                  Create Student Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Weekly Skill Progress</h4>
                  <p className="text-xs text-slate-500">Continuous measurement and feedback loop</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  Active Member
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">TypeScript & Frontend Logic</span>
                    <span className="text-blue-700">92%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[92%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Data Structures & Graph Traversal</span>
                    <span className="text-indigo-700">84%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[84%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">REST APIs & System Scalability</span>
                    <span className="text-teal-700">78%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full w-[78%]" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Recommendation:</span> Review recursive tree operations to prepare for the upcoming algorithmic challenge.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. For MNC Companies & Recruiters */}
      <section id="for-companies" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Card */}
            <div className="order-2 lg:order-1 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-white">Talent Sourcing Directory</h4>
                  <p className="text-xs text-slate-400">Search by validated technical capabilities</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold text-blue-300 bg-blue-900/50 rounded-full border border-blue-700">
                  Verified MNC Gateway
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Full-Stack Graduate Candidate</p>
                    <p className="text-[11px] text-slate-400">B.Tech 2026 &bull; React, Node.js, SQL</p>
                    <div className="flex gap-1.5 pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px]">
                        Assessment Score: 94%
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px]">
                        Open to Relocation
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-400 bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-800">
                    Profile Ready
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Cloud Engineering Associate</p>
                    <p className="text-[11px] text-slate-400">B.S. Information Tech 2025 &bull; Docker, AWS</p>
                    <div className="flex gap-1.5 pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px]">
                        Assessment Score: 88%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-400 bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-800">
                    Profile Ready
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                Protected under ABAC security rules: candidate contact details are provided only after mutual consent or formal application.
              </div>
            </div>

            {/* Text details */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-100">
                <Building2 className="w-3.5 h-3.5" />
                <span>For MNC Companies & Hiring Teams</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Source top graduates with proven aptitude, not inflated resumes.
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Hiring early-career talent is often risky due to lack of objective performance metrics. {BRAND_CONFIG.name} allows corporate recruiters to filter candidates based on weekly benchmarked assessments, reviewed projects, and university background.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Employer Verification Controls</h5>
                    <p className="text-xs text-slate-500">Corporate work-email verification ensures listings come from authentic hiring organizations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Custom Job & Internship Postings</h5>
                    <p className="text-xs text-slate-500">Publish roles with explicit skill tags, eligibility criteria, and deadlines.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">End-to-End Application Pipeline</h5>
                    <p className="text-xs text-slate-500">Move candidates through Under Review, Shortlisted, Interview, and Selected statuses.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
                >
                  Register Company Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Transparency Section */}
      <section className="py-20 bg-slate-100/80 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 bg-white border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Honesty & Anti-Slop Policy</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Commitment to Trust and Transparency
          </h3>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            We do not publish fabricated user counts, artificial placement percentages, or unverified enterprise logos. Every assessment score on {BRAND_CONFIG.name} reflects genuine question responses calculated securely on the server.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h5 className="text-sm font-bold text-slate-900 mb-1.5">No Fabricated Metrics</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                We only display statistics derived from actual Firestore database records. When sample data is displayed for demonstration, it is clearly flagged as demo content.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h5 className="text-sm font-bold text-slate-900 mb-1.5">No Credential Leakage</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Passwords never touch Firestore or local storage. All authentication is executed by Google Firebase Auth with zero plaintext handling.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h5 className="text-sm font-bold text-slate-900 mb-1.5">Skill Boundaries</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quizzes are designed as developmental exercises and learning aids, clearly distinguished from formal university degrees or legal licensure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Demo Opportunities Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Live Opportunities
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Explore Current Career Openings
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Showing sample verified openings (clearly flagged as demo listings)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
              <Link
                to="/explore-jobs"
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                Explore All Jobs
              </Link>
              <Link
                to="/hackathons"
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
              >
                Hackathons & Contests
              </Link>
              <Link
                to="/companies"
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
              >
                MNC Feed
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_DEMO_JOBS.map((job) => (
              <div
                key={job.id}
                className="bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {job.companyName}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {job.employmentType}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {job.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>{job.location}</span>
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Apply Now &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
