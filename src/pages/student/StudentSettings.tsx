import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_CONFIG } from '../../config/brand';
import {
  Shield,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  User,
  Lock,
  Mail,
  Moon,
  Sun,
  Laptop,
  Bell,
  Target,
  Sparkles,
  Check
} from 'lucide-react';

export const StudentSettings: React.FC = () => {
  const { currentUser, userProfile, updateStudentProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [visibility, setVisibility] = useState<'public' | 'private'>(
    userProfile?.profileVisibility || 'public'
  );

  // Notification prefs
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [connectionNotifs, setConnectionNotifs] = useState(true);

  // Career prefs
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole || 'Software Engineer');
  const [targetCompany, setTargetCompany] = useState(userProfile?.targetCompany || 'Google');
  const [workArrangement, setWorkArrangement] = useState<'remote' | 'hybrid' | 'onsite'>('remote');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await updateStudentProfile({
        profileVisibility: visibility,
        targetRole,
        targetCompany
      });
      setSuccessMsg('Settings and preferences successfully saved.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      console.error(e);
      setSuccessMsg('Error saving preferences: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account Preferences &amp; Platform Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize your interface theme, visibility to recruiters, notification preferences, and security controls.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Theme Configuration */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Moon className="w-4 h-4 text-blue-600" />
          Appearance &amp; Theme
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
              theme === 'light'
                ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-xs font-bold">Light Theme</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Clean daytime aesthetic</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
              theme === 'dark'
                ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-xs font-bold">Dark Theme</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">High-contrast night palette</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
              theme === 'system'
                ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-500" />
            <div>
              <div className="text-xs font-bold">System Default</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Matches OS appearance</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Recruiter Visibility */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-blue-600" />
          Profile Visibility &amp; Recruiter Discovery
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Control whether verified recruiters at accredited partner companies can discover your profile, verified assessment scores, and portfolio.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              Public to Verified Recruiters
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-slate-400" />
              Private (Hidden from Talent Search)
            </span>
          </label>
        </div>
      </div>

      {/* 3. Career Preferences */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Target className="w-4 h-4 text-blue-600" />
          Target Career Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Career Target Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Backend Engineer">Backend Engineer</option>
              <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
              <option value="Data Analyst & BI Specialist">Data Analyst &amp; BI Specialist</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Top Dream Enterprise
            </label>
            <select
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Google">Google</option>
              <option value="Microsoft">Microsoft</option>
              <option value="NVIDIA">NVIDIA</option>
              <option value="Amazon">Amazon</option>
              <option value="Stripe">Stripe</option>
              <option value="CloudScale">CloudScale Technologies</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Work Arrangement Preference
          </label>
          <div className="flex gap-2">
            {(['remote', 'hybrid', 'onsite'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setWorkArrangement(mode)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                  workArrangement === mode
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Bell className="w-4 h-4 text-blue-600" />
          Notification Preferences
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="font-medium text-slate-700 dark:text-slate-300">New job &amp; internship match alerts</span>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="font-medium text-slate-700 dark:text-slate-300">Interview invitations and schedule reminders</span>
            <input
              type="checkbox"
              checked={interviewReminders}
              onChange={(e) => setInterviewReminders(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="font-medium text-slate-700 dark:text-slate-300">Connection requests and community updates</span>
            <input
              type="checkbox"
              checked={connectionNotifs}
              onChange={(e) => setConnectionNotifs(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All Preferences'}
          <Check className="w-4 h-4" />
        </button>
      </div>

      {/* Account Termination & Session Exit */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-rose-900 dark:text-rose-400 border-b border-rose-100 dark:border-rose-900/40 pb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          Account &amp; Session Termination
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Sign Out of Platform</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Terminates active authentication on this device.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
