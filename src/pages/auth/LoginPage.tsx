import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';
import { UserRole } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Users,
  Compass,
  Check,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    currentUser,
    role,
    authorizedRoles,
    loading: authLoading,
    loginWithEmail,
    loginWithGoogle,
    loginDemoStudent,
    loginDemoCompany
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Primary experience selection: 'student' | 'company'
  const requestedRole = searchParams.get('portal') === 'company' || searchParams.get('role') === 'company' ? 'company' : 'student';
  const [experience, setExperience] = useState<'student' | 'company'>(requestedRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoActionLoading, setDemoActionLoading] = useState<'student' | 'company' | null>(null);

  // Auto-redirect if already signed in
  useEffect(() => {
    if (!authLoading && currentUser) {
      if (role === 'company' || authorizedRoles.includes('company')) {
        navigate('/company/dashboard', { replace: true });
      } else if (role === 'admin' || authorizedRoles.includes('admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'reviewer' || authorizedRoles.includes('reviewer')) {
        navigate('/reviewer/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [currentUser, role, authorizedRoles, authLoading, navigate]);

  const handleSuccessfulAuth = (
    userEmail: string,
    userAuthorizedRoles: UserRole[],
    intendedExperience: 'student' | 'company'
  ) => {
    const emailLower = userEmail.toLowerCase().trim();
    const isAdmin =
      emailLower === 'kalikalivino17@gmail.com' ||
      emailLower === 'vinoth1707k@gmail.com' ||
      emailLower === 'bodha.326@gmail.com';

    if (isAdmin || userAuthorizedRoles.includes('admin')) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    if (intendedExperience === 'company' && userAuthorizedRoles.includes('company')) {
      navigate('/company/dashboard', { replace: true });
      return;
    }

    if (userAuthorizedRoles.includes('company') && !userAuthorizedRoles.includes('student')) {
      navigate('/company/dashboard', { replace: true });
      return;
    }

    if (userAuthorizedRoles.includes('reviewer')) {
      navigate('/reviewer/dashboard', { replace: true });
      return;
    }

    navigate('/student/dashboard', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      const authResult = await loginWithEmail(email.trim(), password);
      handleSuccessfulAuth(
        authResult.user.email || email.trim(),
        authResult.authorizedRoles,
        experience
      );
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setErrorMsg('Invalid credentials. Please verify your email and password, or use password reset.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Access temporarily throttled due to multiple failed login attempts. Please wait or reset password.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in. Please verify your network and credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      setSubmitting(true);
      const authResult = await loginWithGoogle();
      handleSuccessfulAuth(
        authResult.user.email || '',
        authResult.authorizedRoles,
        experience
      );
    } catch (e: any) {
      console.error('Google sign-in error:', e);
      if (e.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In was not completed. Please try again or use email login.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoStudentLogin = async () => {
    setErrorMsg(null);
    try {
      setDemoActionLoading('student');
      const authResult = await loginDemoStudent();
      navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Demo student login error:', err);
      setErrorMsg(err.message || 'Failed to authenticate demo student account.');
    } finally {
      setDemoActionLoading(null);
    }
  };

  const handleDemoCompanyLogin = async () => {
    setErrorMsg(null);
    try {
      setDemoActionLoading('company');
      const authResult = await loginDemoCompany();
      navigate('/company/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Demo company login error:', err);
      setErrorMsg(err.message || 'Failed to authenticate demo recruiter account.');
    } finally {
      setDemoActionLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: Animated Dynamic Experience Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle ambient lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand & Mode Badge */}
          <div className="relative z-10 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                {BRAND_CONFIG.name}
              </span>
            </Link>

            {/* Experience Switcher Tabs */}
            <div className="p-1 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExperience('student')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  experience === 'student'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student / Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setExperience('company')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  experience === 'company'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Company / Recruiter</span>
              </button>
            </div>
          </div>

          {/* Middle: Feature highlights based on active tab */}
          <div className="relative z-10 my-8">
            <AnimatePresence mode="wait">
              {experience === 'student' ? (
                <motion.div
                  key="student-showcase"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/50">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Career Acceleration</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Your bridge from classroom to enterprise engineering.
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Target top technology companies, bridge verified skill gaps, practice interactive technical interviews, and showcase authentic work.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3 text-xs text-slate-200">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white">AI Career Roadmaps:</span> Tailored milestone tracks for Google, NVIDIA, Microsoft, and Amazon roles.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-200">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white">Objective Skill Verification:</span> Move past self-reported bullet points with assessments and portfolio proof.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-200">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white">Live Practice Interview Rooms:</span> Coding, behavioral, and architectural prep with structured rubrics.
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="company-showcase"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/50">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Enterprise Recruitment</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Hire verified student talent with evidence-backed rubrics.
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Discover candidates ranked by demonstrated capability, run calibrated interviews, and manage transparent hiring pipelines.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3 text-xs text-slate-200">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white">Explainable Job-Fit Intelligence:</span> Transparent competency matching without black-box bias.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-200">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white">Complete Pipeline Management:</span> Screening, automated assessment invites, and stage advancement.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-200">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white">Company Challenges &amp; Hackathons:</span> Evaluate practical code repos and real system designs.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Role-Based Access Control
            </span>
            <span>Secure Firebase Session</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Form & Demo Portals */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {experience === 'student' ? 'Sign in to Student Workspace' : 'Sign in to Recruiter Workspace'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your credentials or choose authenticated demo access below.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={experience === 'student' ? 'student@university.edu' : 'recruiter@enterprise.com'}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {experience === 'student' ? 'Student Workspace' : 'Recruiter Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Google Provider Option */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2.5 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* DEMO ACCESS SECTION (Transparent & Clearly Identified) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Instant Evaluator Demo Access
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  Firebase Sandbox
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Test the platform immediately using seeded demo credentials. No external sign-up required.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDemoStudentLogin}
                  disabled={demoActionLoading !== null || submitting}
                  className="p-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Demo Student
                    </span>
                    {demoActionLoading === 'student' && (
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Alex Vance • Full-Stack Roadmap
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDemoCompanyLogin}
                  disabled={demoActionLoading !== null || submitting}
                  className="p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Demo Recruiter
                    </span>
                    {demoActionLoading === 'company' && (
                      <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Sarah Chen • DemoTech Solutions
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Registration link */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link
              to={`/register?role=${experience}`}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Register as {experience === 'student' ? 'Student Candidate' : 'Enterprise Employer'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
