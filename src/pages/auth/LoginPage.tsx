import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';
import { UserRole } from '../../types';
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
  Scale,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, loginDemoStudent, loginDemoCompany, logout, requestRoleCorrection } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Portal selection state ('student' | 'company' | 'admin' | 'reviewer')
  const initialPortal = (searchParams.get('portal') as UserRole) || 'student';
  const [selectedPortal, setSelectedPortal] = useState<UserRole>(initialPortal);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoActionLoading, setDemoActionLoading] = useState<'student' | 'company' | null>(null);

  // Portal Mismatch State
  const [mismatchData, setMismatchData] = useState<{
    authorizedRoles: UserRole[];
    userEmail: string;
    targetPortal: UserRole;
  } | null>(null);

  // Role Correction Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState(false);

  const getPortalTitle = (roleId: UserRole): string => {
    switch (roleId) {
      case 'company':
        return 'MNC Company / Recruiter';
      case 'admin':
        return 'Platform Administrator';
      case 'reviewer':
        return 'Fairness Reviewer';
      default:
        return 'Student / Candidate';
    }
  };

  const getDashboardPath = (roleId: UserRole): string => {
    switch (roleId) {
      case 'company':
        return '/company/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'reviewer':
        return '/reviewer/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  const handleSuccessfulAuth = (
    userEmail: string,
    authorizedRoles: UserRole[],
    targetPortal: UserRole
  ) => {
    const emailLower = userEmail.toLowerCase().trim();
    const isAdmin =
      emailLower === 'kalikalivino17@gmail.com' ||
      emailLower === 'vinoth1707k@gmail.com';
    const effectiveRoles = [...authorizedRoles];
    if (isAdmin && !effectiveRoles.includes('admin')) {
      effectiveRoles.push('admin');
    }

    // Fix recruiter redirection: if company recruiter signs in, prioritize company portal
    if (targetPortal === 'company' && effectiveRoles.includes('company')) {
      navigate('/company/dashboard');
      return;
    }
    if (targetPortal === 'student' && effectiveRoles.includes('student')) {
      // If user came via general sign in without explicit portal query, but is purely a recruiter:
      if (!searchParams.has('portal') && effectiveRoles.includes('company') && !effectiveRoles.includes('student')) {
        navigate('/company/dashboard');
        return;
      }
      navigate('/student/dashboard');
      return;
    }
    if (targetPortal === 'admin' && (effectiveRoles.includes('admin') || isAdmin)) {
      navigate('/admin/dashboard');
      return;
    }
    if (targetPortal === 'reviewer' && effectiveRoles.includes('reviewer')) {
      navigate('/reviewer/dashboard');
      return;
    }

    // Role-based automatic direct routing based on primary verified authorization
    if (effectiveRoles.includes('company')) {
      navigate('/company/dashboard');
      return;
    }
    if (effectiveRoles.includes('admin') || isAdmin) {
      navigate('/admin/dashboard');
      return;
    }
    if (effectiveRoles.includes('reviewer')) {
      navigate('/reviewer/dashboard');
      return;
    }
    if (effectiveRoles.includes('student')) {
      navigate('/student/dashboard');
      return;
    }

    // Explicit mismatch fallback
    setMismatchData({
      authorizedRoles: effectiveRoles,
      userEmail,
      targetPortal
    });
  };

  const handleDemoStudentLogin = async () => {
    setErrorMsg(null);
    setMismatchData(null);
    try {
      setDemoActionLoading('student');
      await loginDemoStudent();
      navigate('/student/dashboard');
    } catch (err: any) {
      console.error('Demo student login error:', err);
      setErrorMsg(err.message || 'Failed to authenticate demo student account.');
    } finally {
      setDemoActionLoading(null);
    }
  };

  const handleDemoCompanyLogin = async () => {
    setErrorMsg(null);
    setMismatchData(null);
    try {
      setDemoActionLoading('company');
      await loginDemoCompany();
      navigate('/company/dashboard');
    } catch (err: any) {
      console.error('Demo company login error:', err);
      setErrorMsg(err.message || 'Failed to authenticate demo company account.');
    } finally {
      setDemoActionLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMismatchData(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const authResult = await loginWithEmail(email.trim(), password);
      handleSuccessfulAuth(
        authResult.user.email || email.trim(),
        authResult.authorizedRoles,
        selectedPortal
      );
    } catch (err: any) {
      console.error(err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setErrorMsg('Invalid credentials. Please verify your email and password or use password reset.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Access temporarily throttled due to multiple failed login attempts. Please reset your password.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setMismatchData(null);
    try {
      setSubmitting(true);
      const authResult = await loginWithGoogle();
      handleSuccessfulAuth(
        authResult.user.email || '',
        authResult.authorizedRoles,
        selectedPortal
      );
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Google Sign-In failed or popup was closed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionReason.trim()) return;
    try {
      setSubmittingCorrection(true);
      await requestRoleCorrection(selectedPortal, correctionReason.trim());
      setCorrectionSuccess(true);
      setTimeout(() => {
        setShowCorrectionModal(false);
        setCorrectionSuccess(false);
        setCorrectionReason('');
      }, 2500);
    } catch (err: any) {
      setErrorMsg('Failed to send role correction request: ' + err.message);
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const portals = [
    {
      id: 'student' as UserRole,
      title: 'Student / Candidate',
      description: 'Job discovery, weekly skill tests & applications',
      icon: GraduationCap,
      color: 'blue'
    },
    {
      id: 'company' as UserRole,
      title: 'Company / Recruiter',
      description: 'Publish jobs, internships, challenges & rubrics',
      icon: Building2,
      color: 'indigo'
    },
    {
      id: 'admin' as UserRole,
      title: 'Platform Administrator',
      description: 'Company accreditation & moderation',
      icon: ShieldCheck,
      color: 'rose'
    },
    {
      id: 'reviewer' as UserRole,
      title: 'Fairness Reviewer',
      description: 'Interview audits & anti-bias oversight',
      icon: Scale,
      color: 'teal'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Link to="/" className="flex justify-center items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Briefcase className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {BRAND_CONFIG.name}
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Sign In to Your Authorized Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Select your portal before authentication to access your dedicated workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        {/* Quick Demo Accounts Option */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Instant Preview Demo Accounts
                </h3>
                <p className="text-xs text-slate-300">
                  One-click legitimate sign in with sample candidate &amp; employer data
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-200">
              Live Firebase Auth
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Try Demo Student Account */}
            <button
              type="button"
              disabled={submitting || demoActionLoading !== null}
              onClick={handleDemoStudentLogin}
              className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all group flex flex-col justify-between space-y-2 hover:border-blue-400 disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white uppercase tracking-wider">
                  <GraduationCap className="w-3 h-3" />
                  DEMO ACCOUNT
                </span>
                <span className="text-[10px] text-blue-300 group-hover:underline flex items-center gap-0.5 font-bold">
                  {demoActionLoading === 'student' ? 'Connecting...' : 'Launch →'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300">
                  {demoActionLoading === 'student' ? 'Authenticating Demo Student...' : 'Try Demo Student Account'}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                  Sample candidate profile, verified assessment badges, and active job applications.
                </p>
              </div>
            </button>

            {/* Try Demo Company Account */}
            <button
              type="button"
              disabled={submitting || demoActionLoading !== null}
              onClick={handleDemoCompanyLogin}
              className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all group flex flex-col justify-between space-y-2 hover:border-amber-400 disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider">
                  <Building2 className="w-3 h-3" />
                  DEMO COMPANY
                </span>
                <span className="text-[10px] text-amber-300 group-hover:underline flex items-center gap-0.5 font-bold">
                  {demoActionLoading === 'company' ? 'Connecting...' : 'Launch →'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300">
                  {demoActionLoading === 'company' ? 'Authenticating DemoTech...' : 'Try Demo Company Account'}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                  DemoTech Solutions: Manage applicant pipeline stages, jobs &amp; rubrics.
                </p>
              </div>
              <div className="pt-1 text-[9px] text-amber-200/90 font-bold uppercase tracking-wider">
                DEMO COMPANY — FICTIONAL ORGANIZATION — NOT A VERIFIED REAL EMPLOYER
              </div>
            </button>
          </div>
        </div>

        {/* Portal Selection Selector: 1. Student Sign In, 2. Company Sign In */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
            Sign In Portal
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {portals.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPortal === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPortal(p.id);
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {p.id === 'student' ? 'Student Sign In' : p.id === 'company' ? 'Company Sign In' : p.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Authentication Form Card */}
        <div className="bg-white py-8 px-6 shadow-xs rounded-2xl border border-slate-200 sm:px-10">
          <div className="mb-6 flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {selectedPortal === 'student' && 'Candidate Portal Sign-In'}
                {selectedPortal === 'company' && 'Recruiter & Company Workspace'}
                {selectedPortal === 'admin' && 'Platform Governance Administration'}
                {selectedPortal === 'reviewer' && 'Fairness & Placement Oversight'}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedPortal === 'student' && 'Access jobs, skill matrix, and your application status'}
                {selectedPortal === 'company' && 'Manage job listings, challenges, and candidate rubrics'}
                {selectedPortal === 'admin' && 'Accredit companies, moderate jobs, and audit logs'}
                {selectedPortal === 'reviewer' && 'Inspect interview transcripts and audit evaluations'}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 capitalize">
              {selectedPortal}
            </span>
          </div>

          {/* Portal Mismatch Notification Card */}
          {mismatchData && (
            <div className="mb-6 p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Portal Access Mismatch Detected
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The account <strong className="text-slate-900">{mismatchData.userEmail}</strong> is authorized as{' '}
                    <span className="font-bold text-amber-900">
                      [{mismatchData.authorizedRoles.map(getPortalTitle).join(', ')}]
                    </span>
                    , but you signed in via the{' '}
                    <strong className="text-slate-900">{getPortalTitle(mismatchData.targetPortal)}</strong> portal.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed">
                <span>
                  <strong>Security Policy:</strong> Multi-portal access is strictly partitioned. Company recruiter portals require verified corporate memberships, while candidate portals are dedicated to job discovery and skill evaluations.
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {mismatchData.authorizedRoles.map((roleId) => (
                  <button
                    key={roleId}
                    type="button"
                    onClick={() => {
                      setSelectedPortal(roleId);
                      navigate(getDashboardPath(roleId));
                    }}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Proceed to your authorized {getPortalTitle(roleId)} Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(true)}
                    className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center"
                  >
                    Request Role Review
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setMismatchData(null);
                      setEmail('');
                      setPassword('');
                    }}
                    className="py-2 px-3 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs rounded-xl transition-colors text-center"
                  >
                    Sign Out &amp; Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {selectedPortal === 'company' ? 'Work / Corporate Email *' : 'Account Email *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedPortal === 'company'
                      ? 'recruiter@company.com'
                      : selectedPortal === 'admin'
                      ? 'admin@careerpulse.internal'
                      : 'candidate@university.edu'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password *
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? 'Authenticating...' : `Enter ${selectedPortal.toUpperCase()} Portal`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Google Sign-in for Students & Candidates */}
          {selectedPortal === 'student' && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
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
                Continue with Google
              </button>
            </div>
          )}

          {/* Registration Options: 3. Student Sign Up, 4. Company Registration */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                New User Onboarding
              </span>
              <span className="text-[10px] text-slate-400">
                Direct Registration
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center text-xs">
              <Link
                to="/register?role=student"
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Student Sign Up</span>
              </Link>
              <Link
                to="/register?role=company"
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-800 font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Company Registration</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Role Correction Request Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Account Governance
                </span>
                <h3 className="text-lg font-bold text-slate-900">Request Role Correction</h3>
                <p className="text-xs text-slate-500">
                  Apply for role update to access the {getPortalTitle(selectedPortal)} portal
                </p>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {correctionSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Request Submitted Successfully</h4>
                <p className="text-xs text-emerald-700">
                  Your role correction review ticket has been dispatched to platform operations for manual review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRoleCorrectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Portal Role
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={getPortalTitle(selectedPortal)}
                    className="w-full py-2 px-3 text-xs bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason &amp; Verification Evidence *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Describe why you need access to this portal (e.g., official recruiter credentials, university department affiliation, or enterprise domain)..."
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCorrection}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {submittingCorrection ? 'Submitting...' : 'Submit Review Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
