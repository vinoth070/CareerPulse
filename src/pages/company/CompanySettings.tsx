import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';
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
  AlertCircle
} from 'lucide-react';

export const CompanySettings: React.FC = () => {
  const { companyProfile, currentUser, updateCompanyProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState(companyProfile?.companyName || '');
  const [recruiterName, setRecruiterName] = useState(companyProfile?.recruiterName || '');
  const [industry, setIndustry] = useState(companyProfile?.industry || 'Technology & Software');
  const [website, setWebsite] = useState(companyProfile?.website || '');
  const [location, setLocation] = useState(companyProfile?.location || '');
  const [about, setAbout] = useState(companyProfile?.about || '');

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
        industry,
        website: website.trim(),
        location: location.trim(),
        about: about.trim()
      });
      setSuccessMsg('Company details updated.');
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
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Profile &amp; Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure your organization branding and review verified recruiter credentials.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Enterprise Verification Badge
          </h3>

          <div className="flex items-center gap-3">
            {isVerified ? (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Multinational Enterprise</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>Verification Status: Pending Review</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isVerified
              ? 'Your corporate domain and identity have been officially validated. Your job listings are broadcasted with the verified badge to all student pools.'
              : 'Enterprise verification prevents fictitious job postings. Our compliance system verifies corporate email DNS records and tax credentials prior to activating direct candidate outreach.'}
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Company Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Recruiter Name
              </label>
              <input
                type="text"
                required
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Work Email
              </label>
              <input
                type="email"
                disabled
                value={companyProfile?.workEmail || currentUser?.email || ''}
                className="w-full py-2.5 px-3.5 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Technology & Software">Technology & Software</option>
                <option value="Banking & Financial Services">Banking & FinTech</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                <option value="Consulting & Analytics">Consulting & Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              About the Company / Mission
            </label>
            <textarea
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Describe your organization, engineering philosophy, and early-career hiring programs..."
              className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Company Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
