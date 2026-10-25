import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, ShieldCheck, Sparkles, Building2, User } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { currentUser, userProfile, companyProfile, role } = useAuth();

  if (!currentUser) return null;

  const emailLower = (currentUser.email || '').toLowerCase();
  const isDemoStudent =
    emailLower.includes('demo.student') ||
    (userProfile as any)?.isDemo === true ||
    (role === 'student' && userProfile?.displayName?.toLowerCase().includes('demo'));

  const isDemoCompany =
    emailLower.includes('demo.recruiter') ||
    (companyProfile as any)?.isDemo === true ||
    companyProfile?.companyName?.toLowerCase().includes('demotech');

  if (!isDemoStudent && !isDemoCompany) return null;

  if (isDemoCompany) {
    return (
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-xs border-b border-amber-600/30 flex items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <div className="w-5 h-5 rounded-md bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="uppercase tracking-wider font-extrabold bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded-full">
              DEMO COMPANY — FICTIONAL ORGANIZATION — NOT A VERIFIED REAL EMPLOYER
            </span>
            <span className="font-semibold text-slate-900 text-[11px]">
              You are exploring DemoTech Solutions. All job listings and applicants are simulated for evaluation.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-600 text-white px-4 py-2 text-xs font-medium shadow-xs border-b border-blue-700 flex items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
        <div className="w-5 h-5 rounded-md bg-white text-blue-700 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="uppercase tracking-wider font-extrabold bg-white text-blue-800 text-[10px] px-2 py-0.5 rounded-full">
            DEMO STUDENT ACCOUNT
          </span>
          <span className="text-blue-50 text-[11px]">
            You are exploring with a fictional sample candidate profile, verified assessment badges, and simulated job applications.
          </span>
        </div>
      </div>
    </div>
  );
};
