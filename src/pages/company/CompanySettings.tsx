import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2,
  ShieldCheck,
  Clock,
  Save,
  Globe,
  MapPin,
  Mail,
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Bell,
  Briefcase
} from 'lucide-react';

export const CompanySettings: React.FC = () => {
  const { companyProfile, currentUser, updateCompanyProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState(companyProfile?.companyName || '');
  const [recruiterName, setRecruiterName] = useState(companyProfile?.recruiterName || '');
  const [recruiterTitle, setRecruiterTitle] = useState(companyProfile?.recruiterTitle || 'Talent Acquisition Partner');
  const [industry, setIndustry] = useState(companyProfile?.industry || 'Technology & Software');
  const [website, setWebsite] = useState(companyProfile?.website || '');
  const [location, setLocation] = useState(companyProfile?.location || '');
  const [about, setAbout] = useState(companyProfile?.about || '');

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [candidateActivity, setCandidateActivity] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isVerified = companyProfile?.verificationStatus === 'verified';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateCompanyProfile({
        companyName: companyName.trim(),
        recruiterName: recruiterName.trim(),
        recruiterTitle: recruiterTitle.trim(),
        industry,
        website: website.trim(),
        location: location.trim(),
        about: about.trim()
      });
      setSuccessMsg('Enterprise profile and recruitment settings updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update company profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enterprise Profile &amp; Recruiter Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure your organization branding, theme preferences, and talent acquisition parameters.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-rose-200 dark:border-rose-800"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Theme Preferences */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Appearance &amp; Theme
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-900 dark:bg-blue-950/60 dark:text-white font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="text-left">
                <p className="text-xs font-bold">Light Mode</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Crisp high-contrast day palette</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-900 dark:bg-blue-950/60 dark:text-white font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-slate-400'}`} />
              <div className="text-left">
                <p className="text-xs font-bold">Dark Mode</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Deep slate theme for low light</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'system'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-900 dark:bg-blue-950/60 dark:text-white font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Laptop className={`w-4 h-4 ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <div className="text-left">
                <p className="text-xs font-bold">System Default</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Syncs with operating system</p>
              </div>
            </button>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Enterprise Verification Badge
          </h3>

          <div className="flex items-center gap-3">
            {isVerified ? (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Multinational Enterprise</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>Verification Status: Pending Platform Accreditation</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isVerified
              ? 'Your corporate domain and identity have been officially validated. Your job listings are broadcasted with the verified badge to all student pools.'
              : 'Enterprise verification prevents fictitious job postings. Our compliance system verifies corporate email DNS records and tax credentials prior to activating direct candidate outreach.'}
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Organization &amp; Recruiter Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal / Brand Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lead Recruiter / Hiring Lead Name
              </label>
              <input
                type="text"
                required
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recruiter Designation / Title
              </label>
              <input
                type="text"
                value={recruiterTitle}
                onChange={(e) => setRecruiterTitle(e.target.value)}
                placeholder="e.g. Senior University Recruiter"
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Work Email
              </label>
              <input
                type="email"
                disabled
                value={companyProfile?.workEmail || currentUser?.email || ''}
                className="w-full py-2.5 px-3.5 text-xs bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Industry Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full py-2.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Technology & Software">Technology &amp; Software</option>
                <option value="Banking & Financial Services">Banking &amp; FinTech</option>
                <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
                <option value="Cloud & Infrastructure">Cloud &amp; Infrastructure</option>
                <option value="Healthcare & BioTech">Healthcare &amp; BioTech</option>
                <option value="Consulting & Analytics">Consulting &amp; Analytics</option>
                <option value="Automotive & AI Systems">Automotive &amp; AI Systems</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headquarters / Office Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Jose, CA / Remote"
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              About the Organization &amp; Early-Career Culture
            </label>
            <textarea
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Describe your organization, engineering philosophy, and graduate opportunities..."
              className="w-full py-2.5 px-3.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Notification toggles */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Recruitment Notification Preferences
            </h4>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Notify on new student application submissions
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={interviewReminders}
                  onChange={(e) => setInterviewReminders(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Receive 24h reminders before scheduled candidate technical interviews
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={candidateActivity}
                  onChange={(e) => setCandidateActivity(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Daily digest of high-match verified candidates matching active job postings
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Enterprise Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
