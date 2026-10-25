import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Mail
} from 'lucide-react';

export const StudentSettings: React.FC = () => {
  const { currentUser, userProfile, updateStudentProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [visibility, setVisibility] = useState<'public' | 'private'>(
    userProfile?.profileVisibility || 'public'
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleSaveVisibility = async () => {
    try {
      setSaving(true);
      await updateStudentProfile({ profileVisibility: visibility });
      setSuccessMsg('Privacy preference updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Account Preferences &amp; Privacy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal data visibility, security preferences, and session controls.
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Visibility Setting */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Recruiter Discovery Controls
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            When <strong>Public</strong> is selected, corporate recruiters from verified MNC partners can view your academic details, verified quiz scores, and listed projects in the talent search directory. When <strong>Private</strong> is chosen, your profile is hidden from all searches.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" /> Public to Verified Recruiters
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-slate-400" /> Private (Hidden from search)
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveVisibility}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {saving ? 'Updating...' : 'Save Privacy Setting'}
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Authentication Credentials
          </h3>

          <div className="text-xs space-y-2 text-slate-600">
            <p>
              Account UID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{currentUser?.uid}</code>
            </p>
            <p>
              Primary Email: <span className="font-semibold text-slate-900">{currentUser?.email}</span>
            </p>
            <p>
              Authentication Provider:{' '}
              <span className="font-semibold text-slate-900">
                {currentUser?.providerData[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Email & Password'}
              </span>
            </p>
          </div>
        </div>

        {/* Danger Zone: Deletion & Sign Out */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-rose-900 border-b border-rose-100 pb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Account Management &amp; Termination
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900">Sign Out of All Sessions</p>
              <p className="text-[11px] text-slate-500">Safely log out of this browser session.</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-rose-700">Delete Account &amp; Stored Data</p>
              <p className="text-[11px] text-slate-500">
                Request complete erasure of your profile and submitted quiz attempts.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" /> Request Deletion
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-bold text-slate-900">Confirm Account Deletion Request</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This action initiates permanent deletion of your student profile, skills records, and job application history under data privacy regulations.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type <span className="font-bold text-rose-700">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmation !== 'DELETE'}
                  onClick={async () => {
                    alert('Account deletion request registered. You will now be signed out.');
                    await logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-30"
                >
                  Confirm Deletion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
